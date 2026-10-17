'use client';

import React, { useState } from 'react';
import { Layers, Check, X, Users, Bot } from 'lucide-react';
import { ICON_MAP } from './CreateAgentModal';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#FAF9F5] dark:bg-[#1D1C1A] border border-[#E8E6DC] dark:border-[#302E2B] shadow-2xl p-6 sm:p-7 text-[#141413] dark:text-[#FAF9F5] space-y-5">
        <div className="flex items-center justify-between border-b border-[#E8E6DC] dark:border-[#302E2B] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#CC785C]/15 border border-[#CC785C]/30 flex items-center justify-center text-[#CC785C] shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#141413] dark:text-[#FAF9F5]">Create Agent Squad</h3>
              <p className="text-xs text-[#5E5D59] dark:text-[#B0AEA5]">Assemble specialist agents into a coordinated group feed.</p>
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
          <div>
            <label className="text-[11px] font-mono uppercase text-[#5E5D59] dark:text-[#87867F] block mb-1">Squad Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Growth & Launch Council, Full-Stack Dev Team"
              required
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E6DC] dark:border-[#302E2B] text-[#141413] dark:text-[#FAF9F5] placeholder-[#87867F] focus:outline-none focus:border-[#CC785C]"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-[#5E5D59] dark:text-[#87867F] block mb-1">Mission / Directive</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Cross-functional team managing end-to-end campaign lifecycle"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E6DC] dark:border-[#302E2B] text-[#141413] dark:text-[#FAF9F5] placeholder-[#87867F] focus:outline-none focus:border-[#CC785C]"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-[#5E5D59] dark:text-[#87867F] block mb-1.5">
              Select Squad Members ({selectedAgentIds.length} chosen)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {availableAgents.map((agent) => {
                const selected = selectedAgentIds.includes(agent.id);
                const Icon = ICON_MAP[agent.avatar_symbol] || Bot;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => toggleAgent(agent.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      selected
                        ? 'bg-[#CC785C]/10 border-[#CC785C]/40 text-[#141413] dark:text-[#FAF9F5]'
                        : 'bg-white dark:bg-[#141413] border-[#E8E6DC] dark:border-[#302E2B] text-[#5E5D59] dark:text-[#87867F] hover:border-[#CC785C]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${agent.color}15`,
                          borderColor: `${agent.color}35`,
                          color: agent.color,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-xs text-[#141413] dark:text-[#FAF9F5]">{agent.name}</div>
                        <div className="text-[10px] text-[#5E5D59] dark:text-[#87867F] truncate">{agent.role}</div>
                      </div>
                    </div>
                    {selected && <Check className="w-3.5 h-3.5 text-[#CC785C]" />}
                  </button>
                );
              })}
            </div>
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
              disabled={isSubmitting || !name.trim() || selectedAgentIds.length === 0}
              className="px-5 py-2 rounded-xl bg-[#CC785C] hover:bg-[#D97757] text-white font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Assembling...' : 'Assemble Squad'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
