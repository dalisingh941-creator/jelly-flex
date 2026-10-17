'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, ArrowRight, Lock, Key } from 'lucide-react';

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
      if (
        code.trim().toUpperCase() === 'JELLYFLEX-COMMUNITY-2026' ||
        code.trim().toUpperCase() === 'JELLYFLEX-OPEN-2026'
      ) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#FAF9F5] dark:bg-[#1D1C1A] border border-[#E8E6DC] dark:border-[#302E2B] shadow-2xl p-6 sm:p-8 text-[#141413] dark:text-[#FAF9F5] space-y-6">
        {/* Mascot Avatar & Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#E8E6DC] dark:border-[#302E2B] shadow-sm bg-[#F5F4ED] dark:bg-[#242320] flex items-center justify-center">
              <img
                src="/brand-mascot.png"
                alt="JellyFlex Mascot"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/mascot.jpg';
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-[#CC785C] text-white">
              v2.0
            </span>
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[#141413] dark:text-[#FAF9F5]">
              JellyFlex Community Gateway
            </h2>
            <p className="text-xs text-[#5E5D59] dark:text-[#B0AEA5] mt-1 max-w-xs leading-relaxed font-sans">
              Open-source, local-first conversational multi-agent suite. Enter your single-time GitHub invite code to unlock the platform permanently.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#5E5D59] dark:text-[#87867F]">
              <span>Single-Time Access Code</span>
              <button
                type="button"
                onClick={handleAutofill}
                className="text-[10px] text-[#CC785C] hover:text-[#D97757] font-mono underline cursor-pointer"
              >
                Autofill Community Code
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. JELLYFLEX-COMMUNITY-2026"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E6DC] dark:border-[#302E2B] text-[#141413] dark:text-[#FAF9F5] placeholder-[#87867F] font-mono text-xs tracking-wider focus:outline-none focus:border-[#CC785C] uppercase transition-colors"
                autoFocus
              />
              <Key className="w-3.5 h-3.5 text-[#87867F] absolute left-3 top-3" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#CC785C]/10 border border-[#CC785C]/30 flex items-center gap-2 text-[#CC785C] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full py-2.5 rounded-xl font-medium text-xs bg-[#CC785C] hover:bg-[#D97757] text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Code...
              </span>
            ) : (
              <>
                <span>Permanently Unlock JellyFlex</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#E8E6DC] dark:border-[#302E2B] flex items-center justify-between text-[10px] font-mono text-[#87867F]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#788C5D]" />
            Zero Telemetry
          </span>
          <span>Never Prompts Again</span>
          <span>100% BYOK</span>
        </div>
      </div>
    </div>
  );
};
