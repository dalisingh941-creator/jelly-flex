'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AnimatedShieldIcon,
  AnimatedRocketIcon,
  AnimatedSunIcon,
  AnimatedMoonIcon,
  AnimatedLayersIcon,
  AnimatedTerminalIcon,
  AnimatedCheckIcon,
  AnimatedAlertIcon,
} from './AnimatedIcons';
import { SecurityAndBYOKModal } from './SecurityAndBYOKModal';
import { CreateAgentModal } from './CreateAgentModal';
import { CreateSquadModal } from './CreateSquadModal';

interface AgentItem {
  id: string;
  name: string;
  role: string;
  color: string;
  badge_bg: string;
  avatar_symbol: string;
  model: string;
  persona: string;
  instructions: string;
  tools: string[];
  starters: string[];
  is_custom?: boolean;
}

interface SquadItem {
  id: string;
  name: string;
  description: string;
  member_ids: string[];
  starters: string[];
  is_custom?: boolean;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_color: string;
  sender_avatar: string;
  is_agent: boolean;
  text: string;
  thought_process?: string[];
  tools_used?: Array<{ tool: string; status?: string; detail?: string }>;
  created_at?: string;
}

const DEFAULT_AGENTS: AgentItem[] = [
  {
    id: 'agent-scout',
    name: 'Scout',
    role: 'Research & Outlier Scout',
    color: '#06b6d4',
    badge_bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    avatar_symbol: '🔍',
    model: 'gemini-2.0-flash',
    persona: 'Analytical, data-driven scout that mines 30-day viral trend outliers and audience objections.',
    instructions: 'Focus on empirical outlier data, cited pattern benchmarks, and audience psychology.',
    tools: ['DuckDuckGo Search', 'Outlier Trend Miner', 'Google Drive Cipher'],
    starters: [
      'Mine top 30-day viral AI automation outliers on Reddit and X',
      'Perform competitor teardown on top 5 creator growth tools',
      'Analyze audience objections for open-source AI desktop apps',
    ],
  },
  {
    id: 'agent-aura',
    name: 'Aura',
    role: 'Instagram & Visual Strategist',
    color: '#ec4899',
    badge_bg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    avatar_symbol: '✨',
    model: 'gemini-2.0-flash',
    persona: 'Aesthetic director specializing in 0-3s retention hooks and 10-slide carousel outlines.',
    instructions: 'Engineer visual pacing, pattern interrupts, and Instagram keyword-dense SEO.',
    tools: ['Instagram Suite', 'Hook Writer', 'Visual Carousel Briefs'],
    starters: [
      'Draft a 10-slide carousel breaking down clean-room architecture',
      'Generate 3 viral 0-3s retention hooks for a coding workflow Reel',
      'Optimize an Instagram caption with high-volume searchable keywords',
    ],
  },
  {
    id: 'agent-volt',
    name: 'Volt',
    role: 'Viral Hook & Copy Chief',
    color: '#f59e0b',
    badge_bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    avatar_symbol: '⚡',
    model: 'gemini-2.0-flash',
    persona: 'Sharp, provocative copywriter that transforms complex concepts into high-CTR hooks.',
    instructions: 'Eliminate corporate fluff, apply curiosity gaps, and audit for shadowban risks.',
    tools: ['Viral Simulator', 'Shadowban Radar', 'X-Twitter Suite'],
    starters: [
      'Write an 8-tweet viral thread with an irresistible curiosity gap',
      'Audit my hook draft and calculate its viral retention score',
      'Draft a YouTube title and chapter hook package',
    ],
  },
  {
    id: 'agent-cipher',
    name: 'Cipher',
    role: 'Code & Automation Engineer',
    color: '#8b5cf6',
    badge_bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    avatar_symbol: '💻',
    model: 'gemini-2.0-flash',
    persona: 'Precise full-stack software engineer specializing in clean-room reverse engineering.',
    instructions: 'Write robust Python, FastAPI, Next.js, and Electron code with local encryption.',
    tools: ['REA Clean-Room Engine', 'Hardware Fernet Vault', 'Agno OS Workflows'],
    starters: [
      'Generate an autonomous Python script to sync local state with Fernet encryption',
      'Explain the 7 OpenClaw clean-room subsystems implemented in JellyFlex',
      'Write a FastAPI endpoint with rate limiting and SSE streaming',
    ],
  },
];

const DEFAULT_SQUADS: SquadItem[] = [
  {
    id: 'squad-omni',
    name: 'Omni-Channel Launch Squad',
    description: 'Cross-functional team coordinating research, copy, visuals, and distribution in real-time.',
    member_ids: ['agent-scout', 'agent-volt', 'agent-aura', 'agent-cipher'],
    starters: [
      'Plan a 360-degree product launch across Instagram, X, and YouTube',
      'Take our new AI feature and develop research, hooks, visuals, and code specs',
      'Debate the best viral growth tactic for open-source AI desktop tools',
    ],
  },
  {
    id: 'squad-content',
    name: 'Viral Research & Copy Team',
    description: 'Fast-turnaround squad focused on outlier trend intelligence and rapid hook drafting.',
    member_ids: ['agent-scout', 'agent-volt'],
    starters: [
      'Find today\'s trending tech debate and draft 3 provocative angles',
      'Analyze why recent AI developer videos went viral and write our own version',
    ],
  },
];

export const AgentChatSuite: React.FC = () => {
  const [agents, setAgents] = useState<AgentItem[]>(DEFAULT_AGENTS);
  const [squads, setSquads] = useState<SquadItem[]>(DEFAULT_SQUADS);
  const [activeType, setActiveType] = useState<'agent' | 'squad'>('squad');
  const [activeId, setActiveId] = useState<string>('squad-omni');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showRightDrawer, setShowRightDrawer] = useState(true);
  const [showBYOKModal, setShowBYOKModal] = useState(false);
  const [showCreateAgentModal, setShowCreateAgentModal] = useState(false);
  const [showCreateSquadModal, setShowCreateSquadModal] = useState(false);
  const [mascotStatus, setMascotStatus] = useState<'IDLE' | 'THINKING' | 'SYNCING'>('IDLE');
  const [mascotSpeech, setMascotSpeech] = useState<string>('Ready to coordinate specialist agents.');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch agents, squads, and chat history
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, squadsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/v1/agents').catch(() => null),
          fetch('http://127.0.0.1:8000/api/v1/squads').catch(() => null),
        ]);

        if (agentsRes && agentsRes.ok) {
          const aData = await agentsRes.json();
          if (aData.agents?.length) setAgents(aData.agents);
        }
        if (squadsRes && squadsRes.ok) {
          const sData = await squadsRes.json();
          if (sData.squads?.length) setSquads(sData.squads);
        }
      } catch (e) {}
    };
    fetchData();
  }, []);

  // Fetch conversation history when activeId changes
  useEffect(() => {
    const fetchHistory = async () => {
      const convId = `conv-${activeId}`;
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/chat/history/${convId}`);
        if (res.ok) {
          const data = await res.json();
          setChatHistory(data.messages || []);
        } else {
          setChatHistory([]);
        }
      } catch (e) {
        setChatHistory([]);
      }
    };
    fetchHistory();
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSending]);

  const activeAgent = agents.find((a) => a.id === activeId);
  const activeSquad = squads.find((s) => s.id === activeId);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message || isSending) return;

    setInputText('');
    setIsSending(true);
    setMascotStatus('THINKING');
    setMascotSpeech(
      activeType === 'squad'
        ? `Coordinating multi-agent squad collaboration for: "${message.slice(0, 30)}..."`
        : `${activeAgent?.name || 'Agent'} is processing prompt...`
    );

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      conversation_id: `conv-${activeId}`,
      sender_id: 'user',
      sender_name: 'You',
      sender_role: activeType === 'squad' ? 'Squad Director' : 'Architect',
      sender_color: '#6366f1',
      sender_avatar: '👤',
      is_agent: false,
      text: message,
    };
    setChatHistory((prev) => [...prev, tempUserMsg]);

    try {
      if (activeType === 'squad') {
        const res = await fetch('http://127.0.0.1:8000/api/v1/chat/squad', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            squad_id: activeId,
            message,
            conversation_id: `conv-${activeId}`,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.messages) {
            setChatHistory((prev) => [...prev, ...data.messages]);
          }
        }
      } else {
        const res = await fetch('http://127.0.0.1:8000/api/v1/chat/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id: activeId,
            message,
            conversation_id: `conv-${activeId}`,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.message) {
            setChatHistory((prev) => [...prev, data.message]);
          }
        }
      }
    } catch (err) {
      console.error('Chat send error:', err);
    } finally {
      setIsSending(false);
      setMascotStatus('IDLE');
      setMascotSpeech('All responses delivered and state encrypted.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* 1. LEFT SIDEBAR: AGENT & SQUAD NAVIGATOR */}
      <aside className="w-72 lg:w-80 h-full flex flex-col border-r border-white/10 bg-slate-900/70 backdrop-blur-xl shrink-0">
        {/* Brand Header */}
        <div className="h-16 border-b border-white/10 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-indigo-400/40 shadow-[0_0_15px_rgba(99,102,241,0.25)] bg-slate-800 shrink-0">
              <img
                src="/brand-mascot.png"
                alt="JellyFlex"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/mascot.jpg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-tight">JellyFlex</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.0
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Conversational AI Suite</div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <AnimatedSunIcon className="w-4 h-4" /> : <AnimatedMoonIcon className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Channels & Agents */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* GROUP SQUADS (WhatsApp Style) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <AnimatedLayersIcon className="w-3 h-3 text-indigo-400" />
                Group Squads
              </span>
              <button
                type="button"
                onClick={() => setShowCreateSquadModal(true)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                + New Squad
              </button>
            </div>

            {squads.map((squad) => {
              const active = activeType === 'squad' && activeId === squad.id;
              const squadMembers = squad.member_ids
                .map((mid) => agents.find((a) => a.id === mid))
                .filter(Boolean) as AgentItem[];

              return (
                <button
                  key={squad.id}
                  type="button"
                  onClick={() => {
                    setActiveType('squad');
                    setActiveId(squad.id);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all ${
                    active
                      ? 'bg-indigo-600/20 border border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  {/* Overlapping member avatars */}
                  <div className="flex -space-x-2 shrink-0">
                    {squadMembers.slice(0, 3).map((m, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full border border-slate-900 flex items-center justify-center text-[10px] shadow-sm font-bold"
                        style={{ backgroundColor: `${m.color}35`, color: m.color }}
                      >
                        {m.avatar_symbol}
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-white truncate">{squad.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {squad.member_ids.length} Collaborative Agents
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 1-ON-1 SPECIALIST AGENTS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <AnimatedTerminalIcon className="w-3 h-3 text-cyan-400" />
                Specialist Agents (1-on-1)
              </span>
              <button
                type="button"
                onClick={() => setShowCreateAgentModal(true)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                + New Agent
              </button>
            </div>

            {agents.map((agent) => {
              const active = activeType === 'agent' && activeId === agent.id;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => {
                    setActiveType('agent');
                    setActiveId(agent.id);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all ${
                    active
                      ? 'bg-white/10 border border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border"
                    style={{
                      backgroundColor: `${agent.color}25`,
                      borderColor: `${agent.color}50`,
                      color: agent.color,
                    }}
                  >
                    {agent.avatar_symbol}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white truncate">{agent.name}</span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: agent.color }}
                        title="Online & Ready"
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{agent.role}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer: BYOK Vault & Status */}
        <div className="p-3 border-t border-white/10 bg-black/20 space-y-2">
          <button
            type="button"
            onClick={() => setShowBYOKModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <AnimatedShieldIcon active={true} className="w-3.5 h-3.5 text-emerald-400" />
              <span>BYOK Key Vault</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Encrypted
            </span>
          </button>

          <div className="px-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Agno OS • SQLite
            </span>
            <span>Clean-Room Core</span>
          </div>
        </div>
      </aside>

      {/* 2. CENTER STAGE: CLEAN CONVERSATIONAL FEED */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/60 relative">
        {/* Top Chat Header */}
        <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-slate-900/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            {activeType === 'squad' && activeSquad ? (
              <>
                <div className="flex -space-x-2">
                  {activeSquad.member_ids
                    .map((mid) => agents.find((a) => a.id === mid))
                    .filter(Boolean)
                    .map((m, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-slate-950 flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: `${m?.color}35`, color: m?.color }}
                      >
                        {m?.avatar_symbol}
                      </div>
                    ))}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm text-white">{activeSquad.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                      Coordinated Squad
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-md">
                    {activeSquad.description}
                  </div>
                </div>
              </>
            ) : activeAgent ? (
              <>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base border"
                  style={{
                    backgroundColor: `${activeAgent.color}25`,
                    borderColor: `${activeAgent.color}60`,
                    color: activeAgent.color,
                  }}
                >
                  {activeAgent.avatar_symbol}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm text-white">{activeAgent.name}</h2>
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-mono border"
                      style={{
                        backgroundColor: `${activeAgent.color}15`,
                        borderColor: `${activeAgent.color}40`,
                        color: activeAgent.color,
                      }}
                    >
                      {activeAgent.role}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {activeAgent.model}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-md">
                    {activeAgent.persona}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRightDrawer((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{showRightDrawer ? 'Hide Companion' : 'Show Companion'}</span>
            </button>
          </div>
        </header>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Empty state when no messages */}
          {chatHistory.length === 0 && (
            <div className="max-w-xl mx-auto py-12 flex flex-col items-center text-center space-y-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border shadow-xl"
                style={{
                  backgroundColor: activeType === 'squad' ? '#6366f125' : `${activeAgent?.color}25`,
                  borderColor: activeType === 'squad' ? '#6366f160' : `${activeAgent?.color}60`,
                }}
              >
                {activeType === 'squad' ? '👥' : activeAgent?.avatar_symbol || '🤖'}
              </div>

              <div>
                <h3 className="font-bold text-lg text-white">
                  {activeType === 'squad'
                    ? `Collaborative Squad: ${activeSquad?.name}`
                    : `Direct Line to ${activeAgent?.name}`}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
                  {activeType === 'squad'
                    ? activeSquad?.description
                    : activeAgent?.persona}
                </p>
              </div>

              {/* Starter chips */}
              <div className="w-full space-y-2 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Recommended Conversation Starters
                </span>
                <div className="flex flex-col gap-2">
                  {(activeType === 'squad' ? activeSquad?.starters : activeAgent?.starters)?.map(
                    (st, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(st)}
                        className="p-3 rounded-xl bg-slate-900/80 hover:bg-white/10 border border-white/10 text-left text-xs text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <span>{st}</span>
                        <span className="text-slate-500 group-hover:text-indigo-400 font-mono text-sm">
                          →
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.is_agent ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border shadow-md"
                style={{
                  backgroundColor: msg.is_agent ? `${msg.sender_color}30` : '#6366f130',
                  borderColor: msg.is_agent ? msg.sender_color : '#6366f1',
                  color: msg.is_agent ? msg.sender_color : '#fff',
                }}
              >
                {msg.sender_avatar}
              </div>

              {/* Message Body */}
              <div className="space-y-1.5 min-w-0">
                {/* Author Pill */}
                <div
                  className={`flex items-center gap-2 text-[11px] ${
                    msg.is_agent ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <span className="font-semibold text-white">{msg.sender_name}</span>
                  <span
                    className="px-1.5 py-0.2 rounded text-[9px] font-mono border"
                    style={{
                      backgroundColor: `${msg.sender_color}15`,
                      borderColor: `${msg.sender_color}40`,
                      color: msg.sender_color,
                    }}
                  >
                    {msg.sender_role}
                  </span>
                </div>

                {/* Collapsible Thinking Process Foldout */}
                {msg.thought_process && msg.thought_process.length > 0 && (
                  <details className="group rounded-xl bg-slate-900/60 border border-white/5 p-2.5 text-xs text-slate-400">
                    <summary className="cursor-pointer font-mono text-[10px] text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      Thinking Process ({msg.thought_process.length} steps)
                    </summary>
                    <ul className="mt-2 space-y-1 pl-4 list-disc text-[11px] text-slate-400 font-mono">
                      {msg.thought_process.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </details>
                )}

                {/* Main Text Content */}
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.is_agent
                      ? 'bg-slate-900/90 border border-white/10 text-slate-200'
                      : 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Tools used pill */}
                {msg.tools_used && msg.tools_used.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {msg.tools_used.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 border border-white/10 text-slate-400"
                      >
                        ⚡ {t.tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isSending && (
            <div className="flex items-center gap-3 mr-auto max-w-md">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xs animate-pulse">
                ⚡
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center gap-2 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>
                  {activeType === 'squad'
                    ? 'Squad members synthesizing collaborative responses...'
                    : `${activeAgent?.name || 'Agent'} is formulating response...`}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Composer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-lg shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="max-w-4xl mx-auto flex items-end gap-2 p-2 rounded-2xl bg-slate-900 border border-white/15 focus-within:border-indigo-500/70 shadow-2xl transition-all"
          >
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeType === 'squad'
                  ? `Message ${activeSquad?.name} (Shift+Enter for newline)...`
                  : `Message ${activeAgent?.name} (${activeAgent?.role})...`
              }
              className="flex-1 bg-transparent border-0 resize-none text-xs text-white placeholder-slate-500 focus:outline-none p-2 font-sans"
            />

            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0 cursor-pointer"
            >
              <AnimatedRocketIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* 3. RIGHT COMPANION DRAWER: VOXEL MASCOT & TELEMETRY */}
      {showRightDrawer && (
        <aside className="w-72 lg:w-80 h-full border-l border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Companion Matrix
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {mascotStatus}
              </span>
            </div>

            {/* Official Voxel Mascot Visual Card */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative group">
                <div
                  className={`w-28 h-28 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-xl bg-slate-800 ${
                    mascotStatus === 'THINKING'
                      ? 'border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.5)] scale-105'
                      : 'border-white/15'
                  }`}
                >
                  <img
                    src="/brand-mascot.png"
                    alt="Official Mascot"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/mascot.jpg';
                    }}
                  />
                </div>
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-indigo-600 text-white border border-indigo-400/40 shadow-sm">
                  AI Rig
                </span>
              </div>

              {/* Reactive Mascot Speech */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-[11px] text-slate-300 leading-relaxed font-sans">
                "{mascotSpeech}"
              </div>
            </div>

            {/* Active Context Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
              <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Active Channel Specs
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Architecture</span>
                <span className="font-mono text-[10px] text-slate-400">Agno OS 3.1</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Memory Isolation</span>
                <span className="font-mono text-[10px] text-emerald-400 font-semibold">SQLite WAL</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Zero-Knowledge</span>
                <span className="font-mono text-[10px] text-indigo-300 font-semibold">PBKDF2 Fernet</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-[10px] font-mono text-slate-500 text-center">
            JellyFlex 2.0 • 127.0.0.1:8000
          </div>
        </aside>
      )}

      {/* MODALS */}
      {showBYOKModal && <SecurityAndBYOKModal onClose={() => setShowBYOKModal(false)} />}

      <CreateAgentModal
        isOpen={showCreateAgentModal}
        onClose={() => setShowCreateAgentModal(false)}
        onAgentCreated={(newAgent) => {
          setAgents((prev) => [...prev, newAgent]);
          setActiveType('agent');
          setActiveId(newAgent.id);
        }}
      />

      <CreateSquadModal
        isOpen={showCreateSquadModal}
        onClose={() => setShowCreateSquadModal(false)}
        availableAgents={agents}
        onSquadCreated={(newSquad) => {
          setSquads((prev) => [...prev, newSquad]);
          setActiveType('squad');
          setActiveId(newSquad.id);
        }}
      />
    </div>
  );
};
