'use client';

import React, { useState } from 'react';
import { AnimatedCheckIcon, AnimatedLayersIcon } from './AnimatedIcons';

interface CreateSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAgents: any[];
  onSquadCreated: (squad: any) => void;
}

export const CreateSquadModal: React.FC<CreateSquadModalProps> = ({
  isOpen,
  onClose,
  availableAgents,
  onSquadCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(
    availableAgents.slice(0, 2).map((a) => a.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleAgent = (id: string) => {
    setSelectedAgentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedAgentIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || 'Collaborative agent squad.',
        member_ids: selectedAgentIds,
        starters: [
          `Collaborate on our next campaign objective`,
          `Sequence a multi-disciplinary plan for this project`,
        ],
      };

      const res = await fetch('http://127.0.0.1:8000/api/v1/squads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        onSquadCreated(data.squad);
        onClose();
      } else {
        const localSquad = {
          ...payload,
          id: `squad-local-${Date.now()}`,
          is_custom: true,
        };
        onSquadCreated(localSquad);
        onClose();
      }
    } catch (err) {
      const localSquad = {
        name,
        description,
        member_ids: selectedAgentIds,
        starters: ['Collaborate on our campaign'],
        id: `squad-local-${Date.now()}`,
        is_custom: true,
      };
      onSquadCreated(localSquad);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 sm:p-7 text-white space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 text-lg shadow-md">
              <AnimatedLayersIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Create Multi-Agent Squad</h3>
              <p className="text-xs text-slate-400">Assemble specialist agents into a collaborative group chat.</p>
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
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">Squad Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Growth & Launch Council, Full-Stack Dev Team"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1">Mission / Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Cross-functional team managing end-to-end campaign lifecycle"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-300 block mb-1.5">
              Select Squad Members ({selectedAgentIds.length} chosen)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {availableAgents.map((agent) => {
                const selected = selectedAgentIds.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => toggleAgent(agent.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      selected
                        ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                        : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{agent.avatar_symbol || '🤖'}</span>
                      <div>
                        <div className="font-semibold text-xs text-white">{agent.name}</div>
                        <div className="text-[10px] text-slate-400">{agent.role}</div>
                      </div>
                    </div>
                    {selected && <AnimatedCheckIcon className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
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
              disabled={isSubmitting || !name.trim() || selectedAgentIds.length === 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              <AnimatedCheckIcon className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Assembling Squad...' : 'Assemble Squad'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
