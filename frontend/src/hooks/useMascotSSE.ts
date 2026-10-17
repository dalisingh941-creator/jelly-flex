'use client';

import { useState, useEffect } from 'react';

export type MascotState = 'IDLE' | 'THINKING' | 'SYNCING' | 'AWAITING_APPROVAL' | 'COMPLETED' | 'ERROR';

export interface SSEMessage {
  state: MascotState;
  detail: string;
  task_id?: string;
  requires_approval?: boolean;
}

export const useMascotSSE = (streamUrl: string = 'http://127.0.0.1:8000/api/v1/stream') => {
  const [mascotState, setMascotState] = useState<MascotState>('IDLE');
  const [statusDetail, setStatusDetail] = useState<string>('Connected to JellyFlex Agno Core');
  const [pendingApprovalTask, setPendingApprovalTask] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectSSE = () => {
      try {
        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data: SSEMessage = JSON.parse(event.data);
            if (data.state) {
              setMascotState(data.state);
            }
            if (data.detail) {
              setStatusDetail(data.detail);
            }
            if (data.requires_approval && data.task_id) {
              setPendingApprovalTask(data.task_id);
            } else if (data.state === 'COMPLETED' || data.state === 'ERROR' || data.state === 'IDLE') {
              setPendingApprovalTask(null);
            }
          } catch (e) {
            console.error('Failed to parse SSE event:', e);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          reconnectTimeout = setTimeout(connectSSE, 4000);
        };
      } catch (err) {
        console.error('SSE initialization error:', err);
        reconnectTimeout = setTimeout(connectSSE, 5000);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [streamUrl]);

  return {
    mascotState,
    statusDetail,
    pendingApprovalTask,
    isConnected,
    setMascotState,
  };
};
