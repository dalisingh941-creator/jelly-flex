'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Copy, Check, Eye, EyeOff, Cpu, KeyRound } from 'lucide-react';

interface MasterAuthSetupModalProps {
  onSetupSuccess: (sessionToken: string) => void;
}

export const MasterAuthSetupModal: React.FC<MasterAuthSetupModalProps> = ({ onSetupSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recovery seed step
  const [recoverySeed, setRecoverySeed] = useState<string | null>(null);
  const [hardwareSalt, setHardwareSalt] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmedSaved, setConfirmedSaved] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (passcode.length < 4) {
      setErrorMsg('Master Passcode / PIN must be at least 4 digits or characters.');
      return;
    }

    if (passcode !== confirmPasscode) {
      setErrorMsg('Passcodes do not match. Please verify your entry.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, confirm_passcode: confirmPasscode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to initialize master passcode.');
      }

      setRecoverySeed(data.recovery_seed);
      setHardwareSalt(data.hardware_salt);
      setSessionToken(data.session_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('jellyflex_session_token', data.session_token);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error configuring zero-knowledge vault.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySeed = () => {
    if (!recoverySeed) return;
    navigator.clipboard.writeText(recoverySeed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFinishSetup = () => {
    if (!confirmedSaved) {
      setErrorMsg('Please confirm you have safely stored your 12-word recovery seed.');
      return;
    }
    if (sessionToken) {
      onSetupSuccess(sessionToken);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1915]/50 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-[#FAF9F5] border border-[#E8E6DC] shadow-2xl p-6 sm:p-8 text-[#1A1915]">
        {/* Brand Mascot & Header */}
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
              {recoverySeed ? 'Vault Recovery Seed' : 'Setup Master Passcode'}
            </h2>
            <p className="text-xs text-[#6B6960] mt-1 max-w-sm">
              {recoverySeed
                ? 'Record this 12-word recovery seed phrase in a secure offline location.'
                : 'Zero-knowledge local security. Your Master Passcode derives a hardware-bound Fernet key to encrypt all BYOK API credentials.'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {!recoverySeed ? (
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#6B6960] block mb-1.5">
                Master Passcode / PIN
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter 4+ digit PIN or strong password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-[#E8E6DC] text-sm font-mono text-[#1A1915] focus:outline-none focus:border-[#CC785C]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9C94] hover:text-[#1A1915]"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#6B6960] block mb-1.5">
                Confirm Master Passcode
              </label>
              <input
                type={showPasscode ? 'text' : 'password'}
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                placeholder="Re-enter your passcode to verify"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8E6DC] text-sm font-mono text-[#1A1915] focus:outline-none focus:border-[#CC785C]"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E8E6DC] flex items-center gap-2.5 text-xs text-[#6B6960]">
              <Cpu className="w-4 h-4 text-[#CC785C] shrink-0" />
              <span>Hardware Salt Binding: PBKDF2HMAC (480,000 iterations) + Fernet AES-128</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !passcode}
              className="w-full py-2.5 rounded-xl bg-[#CC785C] hover:bg-[#D97757] text-white text-xs font-medium transition-all disabled:opacity-40 cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Initializing Hardware Vault...' : 'Create Vault & Generate Recovery Seed'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-white border border-[#E8E6DC] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#6B6960]">
                <span className="font-mono text-[10px] uppercase">12-Word Seed Phrase</span>
                <button
                  type="button"
                  onClick={handleCopySeed}
                  className="flex items-center gap-1 text-[#CC785C] hover:underline font-mono text-[11px] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Words'}</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {recoverySeed.split(' ').map((word, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded-lg bg-[#FAF9F5] border border-[#E8E6DC] text-center text-xs font-mono text-[#1A1915]"
                  >
                    <span className="text-[10px] text-[#9E9C94] mr-1">{idx + 1}.</span>
                    {word}
                  </div>
                ))}
              </div>
            </div>

            {hardwareSalt && (
              <div className="text-[11px] font-mono text-[#6B6960] flex items-center justify-between px-1">
                <span>Hardware Salt Digest:</span>
                <span className="text-[#1A1915] font-semibold">{hardwareSalt.slice(0, 16)}...</span>
              </div>
            )}

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E8E6DC] cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedSaved}
                onChange={(e) => setConfirmedSaved(e.target.checked)}
                className="mt-0.5 rounded text-[#CC785C] focus:ring-[#CC785C]"
              />
              <span className="text-xs text-[#6B6960]">
                I have written down or stored my 12-word recovery seed phrase in a safe location. I understand it cannot be recovered if lost.
              </span>
            </label>

            <button
              type="button"
              onClick={handleFinishSetup}
              disabled={!confirmedSaved}
              className="w-full py-2.5 rounded-xl bg-[#CC785C] hover:bg-[#D97757] text-white text-xs font-medium transition-all disabled:opacity-40 cursor-pointer shadow-xs"
            >
              Continue to BYOK Onboarding Wizard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
