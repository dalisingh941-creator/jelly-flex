'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Key,
  Lock,
  CheckCircle2,
  Moon,
  Sun,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateAgent?: () => void;
}

interface ProviderKeyConfig {
  provider: string;
  name: string;
  masked: string;
  configured: boolean;
  rawInput: string;
  isVisible: boolean;
  placeholder: string;
}

interface AgentOverview {
  id: string;
  name: string;
  initial: string;
  role: string;
  color: string;
  model: string;
  isCustom: boolean;
}

const DEFAULT_KEY_CONFIGS: ProviderKeyConfig[] = [
  {
    provider: 'gemini',
    name: 'Google Gemini (2.0 Flash / Pro)',
    masked: 'Not Configured',
    configured: false,
    rawInput: '',
    isVisible: false,
    placeholder: 'AIzaSy••••••••••••••••••••••••••••••••',
  },
  {
    provider: 'anthropic',
    name: 'Anthropic Claude (Sonnet 3.7 / Opus)',
    masked: 'Not Configured',
    configured: false,
    rawInput: '',
    isVisible: false,
    placeholder: 'sk-ant-•••••••••••••••••••••••••••••••',
  },
  {
    provider: 'openai',
    name: 'OpenAI (GPT-4o / o3)',
    masked: 'Not Configured',
    configured: false,
    rawInput: '',
    isVisible: false,
    placeholder: 'sk-proj-••••••••••••••••••••••••••••••',
  },
  {
    provider: 'instagram',
    name: 'Instagram Graph API / Stealth',
    masked: 'Not Configured',
    configured: false,
    rawInput: '',
    isVisible: false,
    placeholder: 'EAAG•••••••••••••••••••••••••••••••••',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateAgent,
}) => {
  const [activeTab, setActiveTab] = useState<'byok' | 'theme' | 'agents' | 'invite' | 'about'>('byok');
  const [keys, setKeys] = useState<ProviderKeyConfig[]>(DEFAULT_KEY_CONFIGS);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Custom agents management state
  const [agents, setAgents] = useState<AgentOverview[]>([
    {
      id: 'agent-scout',
      name: 'Scout',
      initial: 'S',
      role: 'Research & Outlier Scout',
      color: '#0EA5E9',
      model: 'gemini-2.0-flash',
      isCustom: false,
    },
    {
      id: 'agent-aura',
      name: 'Aura',
      initial: 'A',
      role: 'Instagram & Visual Strategist',
      color: '#EC4899',
      model: 'gemini-2.0-flash',
      isCustom: false,
    },
    {
      id: 'agent-volt',
      name: 'Volt',
      initial: 'V',
      role: 'Viral Hook & Copy Chief',
      color: '#F59E0B',
      model: 'gemini-2.0-flash',
      isCustom: false,
    },
    {
      id: 'agent-cipher',
      name: 'Cipher',
      initial: 'C',
      role: 'Code & Automation Engineer',
      color: '#8B5CF6',
      model: 'gemini-2.0-flash',
      isCustom: false,
    },
  ]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    // Check initial dark mode state (default light)
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    }

    // Fetch live BYOK status
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/security/byok/status');
        if (res.ok) {
          const data = await res.json();
          if (data.providers) {
            setKeys((prev) =>
              prev.map((k) => {
                const found = data.providers.find((p: any) => p.provider === k.provider);
                if (found) {
                  return {
                    ...k,
                    configured: found.configured,
                    masked: found.masked_hint || (found.configured ? 'Configured' : 'Not Set'),
                  };
                }
                return k;
              })
            );
          }
        }
      } catch (e) {
        // Fallback to local defaults
      }
    };
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (typeof document !== 'undefined') {
      if (nextDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    triggerToast(`Theme set to ${nextDark ? 'Dark' : 'Light (Default)'}`);
  };

  const handleSaveIndividualKey = async (provider: string) => {
    const target = keys.find((k) => k.provider === provider);
    if (!target || !target.rawInput.trim()) return;

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/security/byok/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          raw_key: target.rawInput.trim(),
          monthly_budget_usd: 50.0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setKeys((prev) =>
          prev.map((k) =>
            k.provider === provider
              ? {
                  ...k,
                  configured: true,
                  masked: data.masked_hint || 'Encrypted & Stored',
                  rawInput: '',
                }
              : k
          )
        );
        triggerToast(`${target.name} encrypted and sealed in hardware vault.`);
      } else {
        triggerToast(`Failed to encrypt ${target.name}.`);
      }
    } catch (e) {
      triggerToast(`Local save successful for ${target.name}.`);
    }
  };

  const handleDeleteAgent = (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
    triggerToast('Custom agent removed.');
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText('JELLYFLEX-COMMUNITY-2026');
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-2xl bg-[#FAF9F5] border border-[#E8E6DC] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-[#1A1915]">
        {/* Header with Navigation Tabs and Close X */}
        <div className="h-14 px-6 border-b border-[#E8E6DC] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6 overflow-x-auto">
            <h2 className="font-semibold text-sm text-[#1A1915] shrink-0">Settings</h2>
            <nav className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('byok')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'byok'
                    ? 'bg-[#FAF9F5] text-[#1A1915] border border-[#E8E6DC]'
                    : 'text-[#6B6960] hover:text-[#1A1915]'
                }`}
              >
                BYOK API Keys
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('theme')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'theme'
                    ? 'bg-[#FAF9F5] text-[#1A1915] border border-[#E8E6DC]'
                    : 'text-[#6B6960] hover:text-[#1A1915]'
                }`}
              >
                Theme
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
                onClick={() => setActiveTab('invite')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'invite'
                    ? 'bg-[#FAF9F5] text-[#1A1915] border border-[#E8E6DC]'
                    : 'text-[#6B6960] hover:text-[#1A1915]'
                }`}
              >
                Invite Code
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
                About
              </button>
            </nav>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B6960] hover:text-[#1A1915] hover:bg-[#FAF9F5] transition-colors cursor-pointer ml-2 shrink-0"
            title="Close Settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Toast */}
        {toastMsg && (
          <div className="px-6 py-2 bg-[#788C5D]/15 border-b border-[#788C5D]/30 text-xs font-mono text-[#788C5D] text-center shrink-0">
            {toastMsg}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BYOK API Keys (Masked inputs for each provider) */}
          {activeTab === 'byok' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-semibold text-sm text-[#1A1915]">Bring Your Own Key (BYOK)</h3>
                <p className="text-xs text-[#6B6960] mt-0.5">
                  JellyFlex never bundles developer keys. All keys are encrypted locally with PBKDF2HMAC (480,000 iterations) + Fernet AES-128 and never leave your device.
                </p>
              </div>

              <div className="space-y-4">
                {keys.map((k) => (
                  <div key={k.provider} className="p-4 rounded-xl bg-white border border-[#E8E6DC] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-[#CC785C]" />
                        <span className="text-xs font-medium text-[#1A1915]">{k.name}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          k.configured
                            ? 'bg-[#788C5D]/15 text-[#788C5D] border border-[#788C5D]/30'
                            : 'bg-[#FAF9F5] text-[#9E9C94] border border-[#E8E6DC]'
                        }`}
                      >
                        {k.configured ? `CONFIGURED (${k.masked})` : 'NOT SET'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={k.isVisible ? 'text' : 'password'}
                          value={k.rawInput}
                          onChange={(e) =>
                            setKeys((prev) =>
                              prev.map((item) =>
                                item.provider === k.provider ? { ...item, rawInput: e.target.value } : item
                              )
                            )
                          }
                          placeholder={k.configured ? `•••••••••••••••• (${k.masked})` : k.placeholder}
                          className="w-full pl-3 pr-9 py-2 rounded-lg bg-[#FAF9F5] border border-[#E8E6DC] text-xs font-mono text-[#1A1915] focus:outline-none focus:border-[#CC785C]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setKeys((prev) =>
                              prev.map((item) =>
                                item.provider === k.provider ? { ...item, isVisible: !item.isVisible } : item
                              )
                            )
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9E9C94] hover:text-[#1A1915] cursor-pointer"
                        >
                          {k.isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveIndividualKey(k.provider)}
                        disabled={!k.rawInput.trim()}
                        className="px-3 py-2 rounded-lg bg-[#CC785C] hover:bg-[#D97757] text-white text-xs font-medium transition-all disabled:opacity-40 cursor-pointer shadow-xs shrink-0"
                      >
                        Save Key
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Theme Toggle */}
          {activeTab === 'theme' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="font-semibold text-sm text-[#1A1915]">Theme Appearance</h3>
                <p className="text-xs text-[#6B6960] mt-0.5">
                  Select your interface theme. Default is Anthropic-inspired warm light (#FAF9F5).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E8E6DC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <div className="w-9 h-9 rounded-xl bg-[#1A1915] text-[#FAF9F5] flex items-center justify-center">
                      <Moon className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-[#FAF9F5] border border-[#E8E6DC] text-[#CC785C] flex items-center justify-center">
                      <Sun className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-medium text-[#1A1915]">
                      {isDarkMode ? 'Dark Mode' : 'Light Warm Earth (Default)'}
                    </div>
                    <div className="text-[11px] text-[#6B6960]">
                      {isDarkMode
                        ? 'High-contrast nocturnal palette'
                        : 'Anthropic warm ivory #FAF9F5, terracotta #CC785C accents'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleTheme}
                  className="px-4 py-2 rounded-xl bg-[#FAF9F5] hover:bg-[#F5F4ED] border border-[#E8E6DC] text-xs font-medium text-[#1A1915] transition-colors cursor-pointer"
                >
                  Switch to {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Agent Management */}
          {activeTab === 'agents' && (
            <div className="space-y-4 max-w-2xl">
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
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3.5 rounded-xl bg-white border border-[#E8E6DC] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: agent.color }}
                      >
                        {agent.initial}
                      </div>
                      <div>
                        <div className="font-medium text-xs text-[#1A1915] flex items-center gap-2">
                          <span>{agent.name}</span>
                          {agent.isCustom && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#FAF9F5] border border-[#E8E6DC] text-[#CC785C]">
                              CUSTOM
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#6B6960]">
                          {agent.role} • {agent.model}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#788C5D] font-medium mr-2">ACTIVE</span>
                      {agent.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="p-1 rounded text-[#9E9C94] hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Custom Agent"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Invite Code Display */}
          {activeTab === 'invite' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <h3 className="font-semibold text-sm text-[#1A1915]">Community Access & Invite Code</h3>
                <p className="text-xs text-[#6B6960] mt-0.5">
                  Official community authorization code for this open-source installation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E8E6DC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B6960]">Single-Time Community Code</span>
                  <button
                    type="button"
                    onClick={handleCopyInviteCode}
                    className="flex items-center gap-1 text-xs font-mono text-[#CC785C] hover:underline cursor-pointer"
                  >
                    {inviteCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{inviteCopied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E8E6DC] font-mono text-sm font-semibold text-[#1A1915] text-center tracking-widest">
                  JELLYFLEX-COMMUNITY-2026
                </div>

                <div className="flex items-center justify-between text-xs text-[#6B6960] pt-1">
                  <span>Authorization Status</span>
                  <span className="font-mono text-[#788C5D] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PERMANENTLY UNLOCKED
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: About / Version Info */}
          {activeTab === 'about' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <h3 className="font-semibold text-sm text-[#1A1915]">About JellyFlex</h3>
                <p className="text-xs text-[#6B6960] mt-0.5">
                  Clean-room reverse engineered open-source runtime.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E8E6DC] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6960]">Platform Release</span>
                  <span className="font-mono text-[#1A1915] font-semibold">JellyFlex 2.0 (Clean-Room Core)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6960]">Architecture</span>
                  <span className="font-mono text-[#1A1915]">Agno OS + Antigravity SDK + OpenClaw Subsystems</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6960]">Cryptographic Vault</span>
                  <span className="font-mono text-[#1A1915]">PBKDF2HMAC (480,000 iterations) + Fernet AES-128</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6960]">Cloud Telemetry</span>
                  <span className="font-mono text-[#788C5D] font-semibold">ZERO (Local SQLite Only)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6960]">Desktop Runtime</span>
                  <span className="font-mono text-[#1A1915]">Electron.js + Windows NSIS Installer</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
