'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Bot,
  Search,
  Sparkles,
  Zap,
  Code,
  Compass,
  Cpu,
  Terminal,
  Layers,
  Shield,
} from 'lucide-react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (agent: any) => void;
}

const COLOR_OPTIONS = [
  { label: 'Terracotta', value: '#CC785C', class: 'bg-[#CC785C]' },
  { label: 'Olive', value: '#788C5D', class: 'bg-[#788C5D]' },
  { label: 'Slate', value: '#6A9BCC', class: 'bg-[#6A9BCC]' },
  { label: 'Amber', value: '#D97757', class: 'bg-[#D97757]' },
  { label: 'Charcoal', value: '#5E5D59', class: 'bg-[#5E5D59]' },
];

export const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  bot: Bot,
  search: Search,
  sparkles: Sparkles,
  zap: Zap,
  code: Code,
  compass: Compass,
  cpu: Cpu,
  terminal: Terminal,
  layers: Layers,
  shield: Shield,
};

const GLYPH_KEYS = ['bot', 'search', 'sparkles', 'zap', 'code', 'compass', 'cpu', 'terminal', 'layers', 'shield'];

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onAgentCreated,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [persona, setPersona] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [selectedGlyph, setSelectedGlyph] = useState(GLYPH_KEYS[0]);
  const [model, setModel] = useState('gemini-2.0-flash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const SelectedIcon = ICON_MAP[selectedGlyph] || Bot;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        role: role.trim(),
        color: selectedColor,
        avatar_symbol: selectedGlyph,
        model,
        persona: persona.trim() || `${name} is an autonomous specialist agent.`,
        instructions:
          instructions.trim() || 'Provide clear, authoritative, and actionable assistance.',
        tools: ['Web Search', 'Dynamic Reasoning', 'Isolated Memory'],
        starters: [
          `How can ${name} assist with your objectives today?`,
          `Analyze our current workflow from the perspective of ${role}`,
        ],
      };

      const res = await fetch('http://127.0.0.1:8000/api/v1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        onAgentCreated(data.agent);
        onClose();
      } else {
        const localAgent = {
          ...payload,
          id: `agent-local-${Date.now()}`,
          badge_bg: 'bg-[#CC785C]/10 text-[#CC785C] border-[#CC785C]/30',
          is_custom: true,
        };
        onAgentCreated(localAgent);
        onClose();
      }
    } catch (err) {
      const localAgent = {
        name,
        role,
        color: selectedColor,
        avatar_symbol: selectedGlyph,
        model,
        persona: persona || `${name} is an autonomous specialist agent.`,
        instructions,
        tools: ['Web Search'],
        starters: [`How can ${name} help?`],
        id: `agent-local-${Date.now()}`,
        badge_bg: 'bg-[#CC785C]/10 text-[#CC785C] border-[#CC785C]/30',
        is_custom: true,
      };
      onAgentCreated(localAgent);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#FAF9F5] dark:bg-[#1D1C1A] border border-[#E8E6DC] dark:border-[#302E2B] shadow-2xl p-6 sm:p-7 text-[#141413] dark:text-[#FAF9F5] space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E8E6DC] dark:border-[#302E2B] pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm"
              style={{
                backgroundColor: `${selectedColor}15`,
                borderColor: `${selectedColor}40`,
                color: selectedColor,
              }}
            >
              <SelectedIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#141413] dark:text-[#FAF9F5]">Create Specialist Agent</h3>
              <p className="text-xs text-[#5E5D59] dark:text-[#B0AEA5]">Configure isolated persona, directives, and tool suite.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#5E5D59] hover:text-[#141413] dark:hover:text-[#FAF9F5] p-1.5 rounded-lg hover:bg-[#F5F4ED] dark:hover:bg-[#242320] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#5E5D59] dark:text-[#87867F] block mb-1">Agent Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nova, Cipher, Vector"
                required
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E6DC] dark:border-[#302E2B] text-[#141413] dark:text-[#FAF9F5] placeholder-[#87867F] focus:outline-none focus:border-[#CC785C]"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase text-[#5E5D59] dark:text-[#87867F] block mb-1">Specialist Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Trend Analyst, Hook Writer"
                required
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E6DC] dark:border-[#302E2B] text-[#141413] dark:text-[#FAF9F5] placeholder-[#87867F] focus:outline-none focus:border-[#CC785C]"
              />
            </div>
          </div>

          {/* Color & Icon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#5E5D59] dark:text-[#87867F] block mb-1">Accent Theme</label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    className={`w-6 h-6 rounded-full ${c.class} transition-transform ${
                      selectedColor === c.value
                        ? 'scale-125 ring-2 ring-[#CC785C] shadow-sm'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase text-[#5E5D59] dark:text-[#87867F] block mb-1">Agent Glyph</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {GLYPH_KEYS.map((k) => {
                  const Icon = ICON_MAP[k] || Bot;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setSelectedGlyph(k)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        selectedGlyph === k
                          ? 'bg-[#CC785C]/15 border border-[#CC785C]/40 text-[#CC785C]'
                          : 'hover:bg-[#F5F4ED] dark:hover:bg-[#242320] text-[#5E5D59] dark:text-[#87867F]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-[11px] font-mono uppercase text-[#5E5D59] dark:text-[#87867F] block mb-1">Execution Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E6DC] dark:border-[#302E2B] text-[#141413] dark:text-[#FAF9F5] focus:outline-none focus:border-[#CC785C] font-mono text-xs"
            >
              <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Fast Reasoning)</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (Via BYOK)</option>
              <option value="gpt-4o">OpenAI GPT-4o (Via BYOK)</option>
              <option value="ollama-local">Local Ollama Offline (100% Free)</option>
            </select>
          </div>

          {/* Persona */}
          <div>
            <label className="text-[11px] font-mono uppercase text-[#5E5D59] dark:text-[#87867F] block mb-1">Persona & Temperament</label>
            <textarea
              rows={2}
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="Describe the agent's demeanor, tone, and strategic background..."
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E6DC] dark:border-[#302E2B] text-[#141413] dark:text-[#FAF9F5] placeholder-[#87867F] focus:outline-none focus:border-[#CC785C]"
            />
          </div>

          {/* System Instructions */}
          <div>
            <label className="text-[11px] font-mono uppercase text-[#5E5D59] dark:text-[#87867F] block mb-1">System Directives</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Specific directives, output constraints, formatting rules..."
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E6DC] dark:border-[#302E2B] text-[#141413] dark:text-[#FAF9F5] placeholder-[#87867F] focus:outline-none focus:border-[#CC785C] font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E6DC] dark:border-[#302E2B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F5F4ED] dark:bg-[#242320] hover:bg-[#E8E6DC] dark:hover:bg-[#302E2B] text-[#5E5D59] dark:text-[#B0AEA5] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-[#CC785C] hover:bg-[#D97757] text-white font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creating...' : 'Deploy Agent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
