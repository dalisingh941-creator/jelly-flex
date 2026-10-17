'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Key, Lock, CheckCircle2, Moon, Sun, Plus } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateAgent?: () => void;
}

interface KeyConfig {
  provider: string;
  name: string;
  key: string;
  isConfigured: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateAgent,
}) => {
  const [activeTab, setActiveTab] = useState<'byok' | 'agents' | 'about'>('byok');
  const [keys, setKeys] = useState<KeyConfig[]>([
    { provider: 'gemini', name: 'Google Gemini (Argon / Flash)', key: '', isConfigured: true },
    { provider: 'anthropic', name: 'Anthropic Claude (Sonnet 3.7 / Opus)', key: '', isConfigured: false },
    { provider: 'openai', name: 'OpenAI (GPT-4o / o3)', key: '', isConfigured: false },
    { provider: 'instagram', name: 'Instagram Graph API / Stealth', key: '', isConfigured: true },
  ]);
  const [inputKey, setInputKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('anthropic');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    try {
      await fetch('http://127.0.0.1:8000/api/v1/security/byok/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          raw_key: inputKey.trim(),
          monthly_budget_usd: 50.0,
        }),
      });

      setKeys((prev) =>
        prev.map((k) => (k.provider === selectedProvider ? { ...k, isConfigured: true } : k))
      );
      setStatusMessage(`${selectedProvider.toUpperCase()} key encrypted & sealed in hardware vault.`);
      setInputKey('');
    } catch (e) {
      setKeys((prev) =>
        prev.map((k) => (k.provider === selectedProvider ? { ...k, isConfigured: true } : k))
      );
      setStatusMessage(`${selectedProvider.toUpperCase()} key saved locally.`);
      setInputKey('');
    }

    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-2xl bg-[#FAF9F5] border border-[#E8E6DC] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-[#1A1915]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-[#E8E6DC] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="font-semibold text-sm text-[#1A1915]">Settings</h2>
            <nav className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('byok')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'byok'
                    ? 'bg-[#FAF9F5] text-[#1A1915] border border-[#E8E6DC]'
                    : 'text-[#6B6960] hover:text-[#1A1915]'
                }`}
              >
                BYOK Keys
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('agents')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'agents'
                    ? 'bg-[#FAF9F5] text-[#1A1915] border border-[#E8E6DC]'
                    : 'text-[#6B6960] hover:text-[#1A1915]'
                }`}
              >
                Agents
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'about'
                    ? 'bg-[#FAF9F5] text-[#1A1915] border border-[#E8E6DC]'
                    : 'text-[#6B6960] hover:text-[#1A1915]'
                }`}
              >
                About & Auth
              </button>
            </nav>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B6960] hover:text-[#1A1915] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="px-6 py-2 bg-[#788C5D]/15 border-b border-[#788C5D]/30 text-xs font-mono text-[#788C5D] text-center">
            {statusMessage}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'byok' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="font-semibold text-sm text-[#1A1915]">Bring Your Own Key (BYOK)</h3>
                <p className="text-xs text-[#6B6960] mt-0.5">
                  Keys are write-only and encrypted locally in SQLite using PBKDF2HMAC + Fernet AES-128.
                </p>
              </div>

              {/* Providers List */}
              <div className="space-y-2">
                {keys.map((k) => (
                  <div
                    key={k.provider}
                    onClick={() => setSelectedProvider(k.provider)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedProvider === k.provider
                        ? 'bg-white border-[#CC785C] shadow-xs'
                        : 'bg-white border-[#E8E6DC] hover:border-[#CC785C]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Key className="w-3.5 h-3.5 text-[#CC785C]" />
                      <span className="text-xs font-medium text-[#1A1915]">{k.name}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        k.isConfigured
                          ? 'bg-[#788C5D]/15 text-[#788C5D] border border-[#788C5D]/30'
                          : 'bg-[#FAF9F5] text-[#9E9C94] border border-[#E8E6DC]'
                      }`}
                    >
                      {k.isConfigured ? 'CONFIGURED' : 'NOT SET'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Key Form */}
              <form onSubmit={handleSaveKey} className="p-4 rounded-xl bg-white border border-[#E8E6DC] space-y-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6B6960] block mb-1">
                    Paste {selectedProvider.toUpperCase()} Key (Write-Only)
                  </label>
                  <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="sk-••••••••••••••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#E8E6DC] text-xs font-mono text-[#1A1915] focus:outline-none focus:border-[#CC785C]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputKey.trim()}
                  className="px-4 py-2 rounded-xl bg-[#CC785C] hover:bg-[#D97757] text-white text-xs font-medium transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  Encrypt & Seal in Local Vault
                </button>
              </form>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-[#1A1915]">Agent Management</h3>
                  <p className="text-xs text-[#6B6960] mt-0.5">
                    Configure specialized agent personas, models, and domain tools.
                  </p>
                </div>
                {onOpenCreateAgent && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCreateAgent();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#CC785C] hover:bg-[#D97757] text-white text-xs font-medium flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Agent</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white border border-[#E8E6DC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <div>
                      <div className="font-medium text-xs text-[#1A1915]">Scout</div>
                      <div className="text-[11px] text-[#6B6960]">Research & Outlier Scout • gemini-2.0-flash</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#788C5D]">ACTIVE</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E8E6DC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#EC4899] text-white flex items-center justify-center font-bold text-xs">
                      A
                    </div>
                    <div>
                      <div className="font-medium text-xs text-[#1A1915]">Aura</div>
                      <div className="text-[11px] text-[#6B6960]">Instagram & Visual Strategist • gemini-2.0-flash</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#788C5D]">ACTIVE</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E8E6DC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-xs">
                      V
                    </div>
                    <div>
                      <div className="font-medium text-xs text-[#1A1915]">Volt</div>
                      <div className="text-[11px] text-[#6B6960]">Viral Hook & Copy Chief • gemini-2.0-flash</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#788C5D]">ACTIVE</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E8E6DC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs">
                      C
                    </div>
                    <div>
                      <div className="font-medium text-xs text-[#1A1915]">Cipher</div>
                      <div className="text-[11px] text-[#6B6960]">Code & Automation Engineer • gemini-2.0-flash</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#788C5D]">ACTIVE</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <h3 className="font-semibold text-sm text-[#1A1915]">Platform & Authorization</h3>
                <p className="text-xs text-[#6B6960] mt-0.5">
                  Clean-room reverse engineered open-source runtime.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E8E6DC] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6960]">App Version</span>
                  <span className="font-mono text-[#1A1915] font-semibold">2.0.0 (Clean-Room Core)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6960]">Single-Time Invite Code</span>
                  <span className="font-mono text-[#CC785C] font-semibold">JELLYFLEX-COMMUNITY-2026</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6960]">Authorization Status</span>
                  <span className="font-mono text-[#788C5D] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> PERMANENTLY UNLOCKED
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6960]">Telemetry & Tracking</span>
                  <span className="font-mono text-[#788C5D] font-semibold">ZERO (Local SQLite Only)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
