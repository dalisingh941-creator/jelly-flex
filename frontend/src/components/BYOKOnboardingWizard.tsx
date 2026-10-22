'use client';

import React, { useState } from 'react';
import { Key, ShieldCheck, Eye, EyeOff, Sparkles, Check, ArrowRight } from 'lucide-react';

interface BYOKOnboardingWizardProps {
  onComplete: () => void;
}

interface ProviderField {
  provider: string;
  name: string;
  placeholder: string;
  description: string;
  isRequired: boolean;
}

const PROVIDERS: ProviderField[] = [
  {
    provider: 'gemini',
    name: 'Google Gemini API Key',
    placeholder: 'AIzaSy••••••••••••••••••••••••••••••••',
    description: 'Powers Scout, Aura, Volt, and Cipher agents with 2.0 Flash / Pro reasoning.',
    isRequired: true,
  },
  {
    provider: 'anthropic',
    name: 'Anthropic Claude API Key',
    placeholder: 'sk-ant-•••••••••••••••••••••••••••••••',
    description: 'Enables Sonnet 3.7 & Opus for deep narrative synthesis and copy editing.',
    isRequired: false,
  },
  {
    provider: 'openai',
    name: 'OpenAI API Key',
    placeholder: 'sk-proj-••••••••••••••••••••••••••••••',
    description: 'Optional GPT-4o / o3 fallback for multi-model squad verification.',
    isRequired: false,
  },
  {
    provider: 'instagram',
    name: 'Instagram Graph API Token',
    placeholder: 'EAAG•••••••••••••••••••••••••••••••••',
    description: 'Direct publishing and analytics for Instagram business accounts.',
    isRequired: false,
  },
];

export const BYOKOnboardingWizard: React.FC<BYOKOnboardingWizardProps> = ({ onComplete }) => {
  const [keys, setKeys] = useState<Record<string, string>>({
    gemini: '',
    anthropic: '',
    openai: '',
    instagram: '',
  });
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleVisibility = (prov: string) => {
    setVisible((prev) => ({ ...prev, [prov]: !prev[prov] }));
  };

  const handleKeyChange = (prov: string, val: string) => {
    setKeys((prev) => ({ ...prev, [prov]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Ensure at least one key is provided or gemini is configured
    const hasAnyKey = Object.values(keys).some((k) => k.trim().length > 0);
    if (!hasAnyKey) {
      setErrorMsg('Please configure at least one API key (e.g. Gemini) to power your agent squad.');
      return;
    }

    setIsSaving(true);
    try {
      // Save each non-empty key to the hardware-bound Fernet SQLite vault
      for (const [provider, keyVal] of Object.entries(keys)) {
        if (keyVal.trim()) {
          const res = await fetch('http://127.0.0.1:8000/api/v1/security/byok/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider,
              raw_key: keyVal.trim(),
              monthly_budget_usd: 50.0,
            }),
          });
          if (!res.ok) {
            console.warn(`Failed to save key for ${provider}`);
          }
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('jellyflex_byok_onboarded', 'true');
      }

      onComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving keys to encrypted vault.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1915]/50 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl bg-[#FAF9F5] border border-[#E8E6DC] shadow-2xl p-6 sm:p-8 text-[#1A1915] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6 shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#E8E6DC] bg-white shadow-xs p-1">
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
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#CC785C] font-semibold">
              Step 2 of 2 • Zero-Knowledge Onboarding
            </span>
            <h2 className="text-xl font-medium tracking-tight text-[#1A1915] mt-1">
              Bring Your Own API Keys (BYOK)
            </h2>
            <p className="text-xs text-[#6B6960] mt-1 max-w-md">
              JellyFlex is 100% open-source and never bundles developer keys. Your API keys are encrypted locally using your Master Passcode and stored in SQLite.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 shrink-0">
            {errorMsg}
          </div>
        )}

        {/* Scrollable Provider Keys Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {PROVIDERS.map((p) => {
            const isShown = visible[p.provider] || false;
            return (
              <div key={p.provider} className="p-3.5 rounded-xl bg-white border border-[#E8E6DC] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-[#CC785C]" />
                    <span className="text-xs font-medium text-[#1A1915]">{p.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      p.isRequired
                        ? 'bg-[#CC785C]/15 text-[#CC785C]'
                        : 'bg-[#FAF9F5] text-[#9E9C94] border border-[#E8E6DC]'
                    }`}
                  >
                    {p.isRequired ? 'RECOMMENDED' : 'OPTIONAL'}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={isShown ? 'text' : 'password'}
                    value={keys[p.provider]}
                    onChange={(e) => handleKeyChange(p.provider, e.target.value)}
                    placeholder={p.placeholder}
                    className="w-full pl-3 pr-9 py-2 rounded-lg bg-[#FAF9F5] border border-[#E8E6DC] text-xs font-mono text-[#1A1915] focus:outline-none focus:border-[#CC785C]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(p.provider)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9E9C94] hover:text-[#1A1915] cursor-pointer"
                  >
                    {isShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-[11px] text-[#6B6960]">{p.description}</p>
              </div>
            );
          })}

          <div className="pt-2 shrink-0">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-[#CC785C] hover:bg-[#D97757] text-white text-xs font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <span>{isSaving ? 'Encrypting & Saving Keys...' : 'Save Keys & Launch JellyFlex Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
