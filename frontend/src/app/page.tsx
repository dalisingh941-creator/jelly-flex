'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AgentChatSuite } from '../components/AgentChatSuite';
import { MasterAuthSetupModal } from '../components/MasterAuthSetupModal';
import { BYOKOnboardingWizard } from '../components/BYOKOnboardingWizard';
import { MasterAuthLoginModal } from '../components/MasterAuthLoginModal';

export default function Home() {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isSetup, setIsSetup] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [step, setStep] = useState<'auth' | 'byok_onboarding' | 'workspace'>('auth');
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check backend auth status on mount
  const checkStatus = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('jellyflex_session_token') : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/status', { headers });
      if (res.ok) {
        const data = await res.json();
        setIsSetup(data.is_setup);
        setIsUnlocked(data.is_unlocked);

        if (data.is_setup && data.is_unlocked) {
          setStep('workspace');
        } else {
          setStep('auth');
        }
      } else {
        // Fallback for initial offline/unconfigured state
        setIsSetup(false);
        setIsUnlocked(false);
        setStep('auth');
      }
    } catch (e) {
      // In offline scenario or first run before backend starts
      setIsSetup(false);
      setIsUnlocked(false);
      setStep('auth');
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Lock workspace
  const handleLockWorkspace = useCallback(async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/v1/auth/lock', { method: 'POST' });
    } catch {
      // Ignore network errors on local lock
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jellyflex_session_token');
    }
    setIsUnlocked(false);
    setStep('auth');
  }, []);

  // Inactivity auto-lock (15 minutes = 900,000 ms)
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (isUnlocked && step === 'workspace') {
      inactivityTimerRef.current = setTimeout(() => {
        handleLockWorkspace();
      }, 15 * 60 * 1000);
    }
  }, [isUnlocked, step, handleLockWorkspace]);

  useEffect(() => {
    if (!isUnlocked || step !== 'workspace') return;

    const events = ['mousemove', 'keydown', 'click', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isUnlocked, step, resetInactivityTimer]);

  // Loading skeleton
  if (isChecking) {
    return (
      <main className="h-screen w-screen flex items-center justify-center bg-[#FAF9F5] text-[#1A1915]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#E8E6DC] bg-white p-1 animate-pulse">
            <img src="/brand-mascot.png" alt="Loading JellyFlex" className="w-full h-full object-cover rounded-xl" />
          </div>
          <span className="text-xs font-mono text-[#6B6960]">Initializing JellyFlex Hardware Vault...</span>
        </div>
      </main>
    );
  }

  // 1. First-time Launch: Master Passcode / PIN Setup
  if (!isSetup && step === 'auth') {
    return (
      <main className="h-screen w-screen overflow-hidden bg-[#FAF9F5]">
        <MasterAuthSetupModal
          onSetupSuccess={(token) => {
            setIsSetup(true);
            setIsUnlocked(true);
            setStep('byok_onboarding');
          }}
        />
      </main>
    );
  }

  // 2. Mandatory First-Time BYOK Onboarding Wizard
  if (step === 'byok_onboarding') {
    return (
      <main className="h-screen w-screen overflow-hidden bg-[#FAF9F5]">
        <BYOKOnboardingWizard
          onComplete={() => {
            setStep('workspace');
          }}
        />
      </main>
    );
  }

  // 3. Subsequent Launches: Require Master Passcode to Unlock
  if (isSetup && !isUnlocked) {
    return (
      <main className="h-screen w-screen overflow-hidden bg-[#FAF9F5]">
        <MasterAuthLoginModal
          onUnlockSuccess={(token) => {
            setIsUnlocked(true);
            setStep('workspace');
          }}
        />
      </main>
    );
  }

  // 4. Unlocked Workspace
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#FAF9F5]">
      <AgentChatSuite onLockWorkspace={handleLockWorkspace} />
    </main>
  );
}
