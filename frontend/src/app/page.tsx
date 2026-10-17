'use client';

import React, { useState, useEffect } from 'react';
import { AgentChatSuite } from '../components/AgentChatSuite';
import { InviteAccessModal } from '../components/InviteAccessModal';

export default function Home() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check local storage authorization first
    const localAuth = localStorage.getItem('jellyflex_invite_authorized');
    if (localAuth === 'true') {
      setIsAuthorized(true);
      return;
    }

    // Verify with local backend gateway
    const checkBackend = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/auth/invite-status');
        if (res.ok) {
          const data = await res.json();
          if (data.authorized) {
            localStorage.setItem('jellyflex_invite_authorized', 'true');
            setIsAuthorized(true);
            return;
          }
        }
      } catch (e) {}
      setIsAuthorized(false);
    };
    checkBackend();
  }, []);

  if (isAuthorized === null) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing JellyFlex 2.0 Local Gateway...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
      {!isAuthorized ? (
        <InviteAccessModal onAuthorized={() => setIsAuthorized(true)} />
      ) : (
        <AgentChatSuite />
      )}
    </main>
  );
}
