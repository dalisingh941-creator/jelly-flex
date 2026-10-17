'use client';

import React, { useState } from 'react';
import { AnimatedShieldIcon, AnimatedRocketIcon, AnimatedAlertIcon, AnimatedCheckIcon } from './AnimatedIcons';

interface InviteAccessModalProps {
  onAuthorized: () => void;
}

export const InviteAccessModal: React.FC<InviteAccessModalProps> = ({ onAuthorized }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/invite-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('jellyflex_invite_authorized', 'true');
          onAuthorized();
          return;
        }
      }
      
      const err = await res.json().catch(() => null);
      setErrorMsg(err?.detail || 'Invalid access code. Please use the community access code.');
    } catch (err) {
      // Offline fallback: if code matches community code, allow local unlock
      if (code.trim().toUpperCase() === 'JELLYFLEX-COMMUNITY-2026' || code.trim().toUpperCase() === 'JELLYFLEX-OPEN-2026') {
        localStorage.setItem('jellyflex_invite_authorized', 'true');
        onAuthorized();
        return;
      }
      setErrorMsg('Could not verify with local gateway. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofill = () => {
    setCode('JELLYFLEX-COMMUNITY-2026');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 sm:p-8 text-white space-y-6 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Mascot Avatar & Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-400/40 shadow-[0_0_25px_rgba(99,102,241,0.35)] bg-slate-800 flex items-center justify-center">
              <img
                src="/brand-mascot.png"
                alt="JellyFlex Mascot"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback to mascot.jpg if png not loaded
                  (e.currentTarget as HTMLImageElement).src = '/mascot.jpg';
                }}
              />
            </div>
            <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-600 text-white border border-indigo-300/40 shadow-sm">
              v2.0
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              JellyFlex Community Gateway
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Open-source, local-first multi-agent AI suite. Enter your single-time GitHub invite code to unlock the platform permanently.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Single-Time Access Code</span>
              <button
                type="button"
                onClick={handleAutofill}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-mono cursor-pointer"
              >
                Auto-fill GitHub Code
              </button>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. JELLYFLEX-COMMUNITY-2026"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 font-mono text-sm tracking-wide focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50 uppercase"
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-rose-300 text-xs">
              <AnimatedAlertIcon className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full py-3 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authorizing...
              </span>
            ) : (
              <>
                <AnimatedRocketIcon className="w-4 h-4" />
                <span>Permanently Unlock JellyFlex</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <AnimatedShieldIcon active={true} className="w-3 h-3 text-emerald-400" />
            Zero Telemetry
          </span>
          <span>Never Prompts Again</span>
          <span>100% BYOK</span>
        </div>
      </div>
    </div>
  );
};
