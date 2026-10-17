'use client';

import React, { useState } from 'react';
import { AnimatedCheckIcon, AnimatedPaletteIcon } from './AnimatedIcons';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (agent: any) => void;
}

const COLOR_OPTIONS = [
  { label: 'Cyan', value: '#06b6d4', class: 'bg-cyan-500' },
  { label: 'Pink', value: '#ec4899', class: 'bg-pink-500' },
  { label: 'Amber', value: '#f59e0b', class: 'bg-amber-500' },
  { label: 'Indigo', value: '#6366f1', class: 'bg-indigo-500' },
  { label: 'Emerald', value: '#10b981', class: 'bg-emerald-500' },
  { label: 'Rose', value: '#f43f5e', class: 'bg-rose-500' },
];

const AVATAR_SYMBOLS = ['🤖', '🔍', '✨', '⚡', '💻', '🎵', '🎯', '🧠', '🚀', '🔮'];

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onAgentCreated }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [persona, setPersona] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [selectedSymbol, setSelectedSymbol] = useState(AVATAR_SYMBOLS[0]);
  const [model, setModel] = useState('gemini-2.0-flash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        role: role.trim(),
        color: selectedColor,
        avatar_symbol: selectedSymbol,
        model,
        persona: persona.trim() || `${name} is an autonomous specialist agent.`,
        instructions: instructions.trim() || 'Provide clear, authoritative, and actionable assistance.',
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
        // Fallback local creation
        const localAgent = {
          ...payload,
          id: `agent-local-${Date.now()}`,
          badge_bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
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
        avatar_symbol: selectedSymbol,
        model,
        persona: persona || `${name} is an autonomous specialist agent.`,
        instructions,
        tools: ['Web Search'],
        starters: [`How can ${name} help?`],
        id: `agent-local-${Date.now()}`,
        badge_bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        is_custom: true,
      };
      onAgentCreated(localAgent);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 sm:p-7 text-white space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-white/20 shadow-md"
              style={{ backgroundColor: `${selectedColor}25`, borderColor: selectedColor }}
            >
              {selectedSymbol}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Create Custom Agent</h3>
              <p className="text-xs text-slate-400">Configure distinct persona, instructions, and isolated memory.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">Agent Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nova, Echo, Vector"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">Specialist Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Sound Director, Splicer"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Color & Symbol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">Color Theme</label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    className={`w-6 h-6 rounded-full ${c.class} transition-transform ${
                      selectedColor === c.value ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">Avatar Glyph</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {AVATAR_SYMBOLS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSymbol(s)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                      selectedSymbol === s ? 'bg-white/20 border border-white/40 scale-110' : 'hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">Execution Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
            >
              <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Fast Reasoning)</option>
              <option value="gemini-4-argon">Google Gemini 4 Argon (Deep Architecture Tier)</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (Via BYOK)</option>
              <option value="gpt-4o">OpenAI GPT-4o (Via BYOK)</option>
              <option value="ollama-local">Local Ollama Offline (100% Free)</option>
            </select>
          </div>

          {/* Persona */}
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">Persona & Bio</label>
            <textarea
              rows={2}
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="Describe the agent's voice, background, and intellectual temperament..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* System Instructions */}
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">System Instructions</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Specific directives, output constraints, formatting rules, and guidelines..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all cursor-pointer"
            >
              <AnimatedCheckIcon className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creating Agent...' : 'Deploy Agent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
