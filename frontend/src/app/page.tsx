'use client';

import React, { useState, useEffect } from 'react';
import { AgentChatSuite } from '../components/AgentChatSuite';
import { InviteAccessModal } from '../components/InviteAccessModal';

export default function Home() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('jellyflex_invite_authorized') : null;
      if (stored === 'true') {
        setIsAuthorized(true);
        return;
      }

      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/auth/invite-status');
        if (res.ok) {
          const data = await res.json();
          if (data.authorized) {
            localStorage.setItem('jellyflex_invite_authorized', 'true');
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        }
      } catch (e) {
        // Fallback: stay authorized in local offline mode
        setIsAuthorized(true);
      }
    };
    checkAuth();
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#FAF9F5] dark:bg-[#141413]">
      {!isAuthorized ? (
        <InviteAccessModal onAuthorized={() => setIsAuthorized(true)} />
      ) : (
        <AgentChatSuite />
      )}
    </main>
  );
}
