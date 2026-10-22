'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, RefreshCw, Key } from 'lucide-react';

interface MasterAuthLoginModalProps {
  onUnlockSuccess: (sessionToken: string) => void;
}

export const MasterAuthLoginModal: React.FC<MasterAuthLoginModalProps> = ({ onUnlockSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Recovery seed flow
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoverySeed, setRecoverySeed] = useState('');
  const [newPasscode, setNewPasscode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid Master Passcode. Please try again.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('jellyflex_session_token', data.session_token);
      }
      onUnlockSuccess(data.session_token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverySeed.trim() || !newPasscode.trim()) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recovery_seed: recoverySeed.trim(),
          new_passcode: newPasscode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Recovery failed. Check your 12-word seed phrase.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('jellyflex_session_token', data.session_token);
      }
      onUnlockSuccess(data.session_token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing recovery.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumpadClick = (val: string) => {
    setPasscode((prev) => prev + val);
  };

  const handleBackspace = () => {
    setPasscode((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1915]/50 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl bg-[#FAF9F5] border border-[#E8E6DC] shadow-2xl p-6 sm:p-8 text-[#1A1915]">
        {/* Brand Mascot & Lock Icon */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#E8E6DC] bg-white shadow-xs p-1">
            <img
              src="/brand-mascot.png"
              alt="JellyFlex Mascot"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/mascot.jpg';
              }}
            />
          </div>
          <div>
            <h2 className="text-xl font-medium tracking-tight text-[#1A1915]">
              {isRecovering ? 'Emergency Seed Recovery' : 'Hardware Vault Locked'}
            </h2>
            <p className="text-xs text-[#6B6960] mt-1">
              {isRecovering
                ? 'Enter your 12-word recovery phrase to set a new Master Passcode.'
                : 'Enter your Master Passcode to decrypt your local BYOK keys.'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-center">
            {errorMsg}
          </div>
        )}

        {!isRecovering ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Master Passcode"
                autoFocus
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-[#E8E6DC] text-center text-sm font-mono tracking-widest text-[#1A1915] focus:outline-none focus:border-[#CC785C]"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9C94] hover:text-[#1A1915] cursor-pointer"
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick Numpad for Touch / PIN entry */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleNumpadClick(digit)}
                  className="py-2 rounded-xl bg-white hover:bg-[#F5F4ED] border border-[#E8E6DC] text-xs font-mono font-medium text-[#1A1915] transition-colors cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPasscode('')}
                className="py-2 rounded-xl bg-white hover:bg-[#F5F4ED] border border-[#E8E6DC] text-[10px] font-mono uppercase text-[#9E9C94] transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleNumpadClick('0')}
                className="py-2 rounded-xl bg-white hover:bg-[#F5F4ED] border border-[#E8E6DC] text-xs font-mono font-medium text-[#1A1915] transition-colors cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-2 rounded-xl bg-white hover:bg-[#F5F4ED] border border-[#E8E6DC] text-[10px] font-mono uppercase text-[#9E9C94] transition-colors cursor-pointer"
              >
                Del
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !passcode.trim()}
              className="w-full py-2.5 rounded-xl bg-[#CC785C] hover:bg-[#D97757] text-white text-xs font-medium transition-all disabled:opacity-40 cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Decrypting Vault...' : 'Unlock Workspace'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setIsRecovering(true);
                }}
                className="text-xs text-[#6B6960] hover:text-[#CC785C] font-mono cursor-pointer transition-colors"
              >
                Forgot Passcode? Use Recovery Seed
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRecovery} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#6B6960] block mb-1">
                12-Word Recovery Seed Phrase
              </label>
              <textarea
                value={recoverySeed}
                onChange={(e) => setRecoverySeed(e.target.value)}
                placeholder="word1 word2 word3 ... word12"
                rows={3}
                className="w-full p-2.5 rounded-xl bg-white border border-[#E8E6DC] text-xs font-mono text-[#1A1915] focus:outline-none focus:border-[#CC785C]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#6B6960] block mb-1">
                New Master Passcode
              </label>
              <input
                type="password"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="Enter new 4+ digit passcode"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8E6DC] text-xs font-mono text-[#1A1915] focus:outline-none focus:border-[#CC785C]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !recoverySeed.trim() || !newPasscode.trim()}
              className="w-full py-2.5 rounded-xl bg-[#CC785C] hover:bg-[#D97757] text-white text-xs font-medium transition-all disabled:opacity-40 cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Recovering Vault...' : 'Reset Passcode & Unlock'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setIsRecovering(false);
                }}
                className="text-xs text-[#6B6960] hover:text-[#1A1915] font-mono cursor-pointer"
              >
                ← Back to Passcode Entry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
