'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Settings,
  PanelRight,
  Plus,
  Paperclip,
  Mic,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Globe,
  SlidersHorizontal,
  X,
  Code,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { CreateAgentModal } from './CreateAgentModal';
import { CreateSquadModal } from './CreateSquadModal';
import { DailyBriefModal } from './DailyBriefModal';

interface AgentItem {
  id: string;
  name: string;
  initial: string;
  role: string;
  color: string;
  model: string;
  persona: string;
  instructions: string;
  lastMessage?: string;
  date?: string;
}

interface SquadItem {
  id: string;
  name: string;
  initial: string;
  description: string;
  member_ids: string[];
  color: string;
  lastMessage?: string;
  date?: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_initial: string;
  sender_role: string;
  sender_color: string;
  is_agent: boolean;
  text: string;
  thought_process?: string[];
  tool_execution?: {
    toolName: string;
    parameters: Record<string, any>;
    status: string;
    resultSummary?: string;
  };
  action_card?: {
    title: string;
    description: string;
    buttonText: string;
    status: string;
  };
  created_at?: string;
}

interface AttachedFile {
  name: string;
  sizeKb: number;
  type: string;
  base64?: string;
}

const DEFAULT_AGENTS: AgentItem[] = [
  {
    id: 'agent-scout',
    name: 'Scout',
    initial: 'S',
    role: 'Research & Outliers',
    color: '#0EA5E9',
    model: 'gemini-2.0-flash',
    persona: 'Mines 30-day viral trend outliers and audience objections.',
    instructions: 'Focus on empirical outlier data and benchmarks.',
    lastMessage: 'Scraped 18 reels. Found 4 high-retention outliers.',
    date: 'Oct 17',
  },
  {
    id: 'agent-aura',
    name: 'Aura',
    initial: 'A',
    role: 'Instagram & Visuals',
    color: '#EC4899',
    model: 'gemini-2.0-flash',
    persona: 'Specializes in 0-3s retention hooks and 10-slide carousels.',
    instructions: 'Engineer visual pacing and Instagram keyword SEO.',
    lastMessage: 'Carousel storyboard ready for publishing review.',
    date: 'Oct 17',
  },
  {
    id: 'agent-volt',
    name: 'Volt',
    initial: 'V',
    role: 'Viral Hook Chief',
    color: '#F59E0B',
    model: 'gemini-2.0-flash',
    persona: 'Transforms complex ideas into high-CTR curiosity hooks.',
    instructions: 'Eliminate fluff, apply curiosity gaps, audit shadowban.',
    lastMessage: 'Calculated viral retention score: 94/100.',
    date: 'Oct 16',
  },
  {
    id: 'agent-cipher',
    name: 'Cipher',
    initial: 'C',
    role: 'Code & Automation',
    color: '#8B5CF6',
    model: 'gemini-2.0-flash',
    persona: 'Software engineer specializing in clean-room reverse engineering.',
    instructions: 'Write robust Python, FastAPI, Next.js, and Electron code.',
    lastMessage: 'Encrypted SQLite vault state verified via PBKDF2.',
    date: 'Oct 15',
  },
];

const DEFAULT_SQUADS: SquadItem[] = [
  {
    id: 'squad-omni',
    name: 'Omni-Channel Launch Squad',
    initial: 'O',
    description: 'Cross-functional team coordinating research, copy, visuals, and distribution.',
    member_ids: ['agent-scout', 'agent-volt', 'agent-aura', 'agent-cipher'],
    color: '#10B981',
    lastMessage: 'Squad coordination active across 4 domain lanes.',
    date: 'Oct 17',
  },
  {
    id: 'squad-content',
    name: 'Viral Research & Copy Team',
    initial: 'R',
    description: 'Fast-turnaround squad for outlier intelligence and rapid hook drafting.',
    member_ids: ['agent-scout', 'agent-volt'],
    color: '#5E5D59',
    lastMessage: 'Hook drafts scored for 0-3s velocity.',
    date: 'Oct 16',
  },
];

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-seed-1',
    conversation_id: 'conv-squad-omni',
    sender_id: 'user',
    sender_name: 'You',
    sender_initial: 'Y',
    sender_role: 'Squad Director',
    sender_color: '#CC785C',
    is_agent: false,
    text: 'Squad, coordinate an omni-channel launch strategy for JellyFlex 2.0. Focus on our single-time GitHub invite code and zero-knowledge BYOK architecture. Scout, scrape top 30-day viral AI hooks first using the virtual browser.',
  },
  {
    id: 'msg-seed-2',
    conversation_id: 'conv-squad-omni',
    sender_id: 'agent-scout',
    sender_name: 'Scout',
    sender_initial: 'S',
    sender_role: 'Research & Outliers',
    sender_color: '#0EA5E9',
    is_agent: true,
    thought_process: [
      'Activated Stealth Virtual Browser sandbox with bezier mouse curvature',
      'Scraped 18 competitor posts and benchmarked 30-day viral outliers',
      'Identified top audience trigger: distrust of developer key leakage & SaaS vendor lock-in',
    ],
    tool_execution: {
      toolName: 'stealth_browser.scrape_outliers',
      parameters: {
        target_url: 'https://instagram.com/explore/tags/aiworkflow',
        stealth_profile: 'bezier_cubic_jitter',
        max_results: 18,
      },
      status: 'completed',
      resultSummary: 'Scraped 18 reels. Found 4 high-retention outliers (4.2x median baseline). Anti-bot checkpoint: 0% risk.',
    },
    action_card: {
      title: 'Scraped 18 Reels (4.2x Median Baseline)',
      description: 'Audience trigger identified: High demand for local-first BYOK privacy and zero cloud key telemetry.',
      buttonText: 'View Outlier Data',
      status: 'VERIFIED',
    },
    text: "I've completed our trend reconnaissance via our sandboxed virtual browser. The data is clear: audiences are exhausted by SaaS platforms demanding their API keys. Leading with our zero-knowledge PBKDF2 Fernet vault and single-time GitHub invite code produces a 4.2x higher bookmark velocity. Volt, take these findings and craft the headline hooks.",
  },
  {
    id: 'msg-seed-3',
    conversation_id: 'conv-squad-omni',
    sender_id: 'agent-volt',
    sender_name: 'Volt',
    sender_initial: 'V',
    sender_role: 'Viral Hook Chief',
    sender_color: '#F59E0B',
    is_agent: true,
    thought_process: [
      "Ingesting Scout's outlier findings into ViralHookSimulator",
      'Calculated viral retention score: 94/100',
    ],
    action_card: {
      title: 'Publish Approved 5-Slide Carousel to Instagram',
      description: 'Episode 1: "Stop Giving Away Your API Keys". Caption reviewed and verified safe.',
      buttonText: 'Publish the carousel now',
      status: 'READY',
    },
    text: "Here are 3 high-impact hooks optimized for our launch:\n\n1. Pattern Interrupt: \"99% of creators waste $80/mo on bloated AI dashboards. Here is what happens when you use an open-source agent squad.\"\n2. Curiosity Gap: \"How a single-time GitHub invite code permanently unlocks full local autonomy without developer telemetry.\"\n3. Contrarian Truth: \"Stop pasting your API keys into closed-source web wrappers. Own your runtime.\"\n\nAura, format Hook #1 into our 10-slide visual carousel and 9:16 Reels storyboard.",
  },
];

export const AgentChatSuite: React.FC<{ onLockWorkspace?: () => void }> = ({
  onLockWorkspace,
}) => {
  const [agents, setAgents] = useState<AgentItem[]>(DEFAULT_AGENTS);
  const [squads, setSquads] = useState<SquadItem[]>(DEFAULT_SQUADS);
  const [activeType, setActiveType] = useState<'agent' | 'squad'>('squad');
  const [activeId, setActiveId] = useState<string>('squad-omni');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [useMascotCompanionAvatar, setUseMascotCompanionAvatar] = useState(false);

  // Panel Toggles
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCreateAgentModal, setShowCreateAgentModal] = useState(false);
  const [showCreateSquadModal, setShowCreateSquadModal] = useState(false);
  const [showDailyBriefModal, setShowDailyBriefModal] = useState(false);

  // Voice & File Upload
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch agents & squads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, squadsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/v1/agents').catch(() => null),
          fetch('http://127.0.0.1:8000/api/v1/squads').catch(() => null),
        ]);

        if (agentsRes && agentsRes.ok) {
          const aData = await agentsRes.json();
          if (aData.agents?.length) {
            const colors = ['#0EA5E9', '#EC4899', '#F59E0B', '#8B5CF6'];
            const mapped = aData.agents.map((ag: any, idx: number) => ({
              id: ag.id,
              name: ag.name,
              initial: ag.name.charAt(0).toUpperCase(),
              role: ag.role,
              color: colors[idx % colors.length] || '#0EA5E9',
              model: ag.model || 'gemini-2.0-flash',
              persona: ag.persona || '',
              instructions: ag.instructions || '',
              lastMessage: 'Ready to assist.',
              date: 'Oct 17',
            }));
            setAgents(mapped);
          }
        }
        if (squadsRes && squadsRes.ok) {
          const sData = await squadsRes.json();
          if (sData.squads?.length) {
            const mappedSquads = sData.squads.map((sq: any) => ({
              id: sq.id,
              name: sq.name,
              initial: sq.name.charAt(0).toUpperCase(),
              description: sq.description || '',
              member_ids: sq.member_ids || [],
              color: '#10B981',
              lastMessage: 'Coordinated squad active.',
              date: 'Oct 17',
            }));
            setSquads(mappedSquads);
          }
        }
      } catch (e) {}
    };
    fetchData();
  }, []);

  // Fetch conversation history
  useEffect(() => {
    if (activeId === 'squad-omni' && chatHistory.length === 3) return;

    const fetchHistory = async () => {
      const convId = `conv-${activeId}`;
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/chat/history/${convId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages?.length) {
            const cleaned = data.messages.map((m: any) => ({
              id: m.id,
              conversation_id: m.conversation_id,
              sender_id: m.sender_id,
              sender_name: m.sender_name,
              sender_initial: (m.sender_name || 'A').charAt(0).toUpperCase(),
              sender_role: m.sender_role,
              sender_color: m.sender_color || '#CC785C',
              is_agent: m.is_agent,
              text: m.text,
              thought_process: m.thought_process,
              created_at: m.created_at,
            }));
            setChatHistory(cleaned);
          } else {
            setChatHistory([]);
          }
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
  const currentTitle = activeType === 'squad' ? activeSquad?.name : activeAgent?.name;
  const currentInitial = activeType === 'squad' ? activeSquad?.initial || 'O' : activeAgent?.initial || 'A';
  const currentColor = activeType === 'squad' ? activeSquad?.color || '#10B981' : activeAgent?.color || '#0EA5E9';

  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is supported in Chrome, Edge, and Electron.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result?.toString().split(',')[1];
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            sizeKb: Math.round(file.size / 1024),
            type: file.type || 'application/octet-stream',
            base64,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachedFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message && attachedFiles.length === 0) return;
    if (isSending) return;

    setInputText('');
    const currentFiles = [...attachedFiles];
    setAttachedFiles([]);
    setIsSending(true);

    const tempUserMsg: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      conversation_id: `conv-${activeId}`,
      sender_id: 'user',
      sender_name: 'You',
      sender_initial: 'Y',
      sender_role: activeType === 'squad' ? 'Squad Director' : 'Architect',
      sender_color: '#CC785C',
      is_agent: false,
      text:
        currentFiles.length > 0
          ? `[Attached ${currentFiles.map((f) => f.name).join(', ')}]\n\n${message}`
          : message,
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
            const mapped = data.messages.map((m: any) => ({
              ...m,
              sender_initial: (m.sender_name || 'A').charAt(0).toUpperCase(),
            }));
            setChatHistory((prev) => [...prev, ...mapped]);
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
            const m = data.message;
            setChatHistory((prev) => [
              ...prev,
              {
                ...m,
                sender_initial: (m.sender_name || 'A').charAt(0).toUpperCase(),
              },
            ]);
          }
        }
      }
    } catch (err) {
      console.error('Chat send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#FAF9F5] text-[#1A1915]">
      {/* 1. TOP BAR (Fixed, Full Width, ~48px) */}
      <header className="h-12 border-b border-[#E8E6DC] px-4 flex items-center justify-between bg-white shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Left Sidebar Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsLeftSidebarOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-[#6B6960] hover:text-[#1A1915] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            title="Toggle Left Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Official Brand Mascot in Top-Left Navigation */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-[#E8E6DC] bg-white shrink-0">
              <img
                src="/brand-mascot.png"
                alt="JellyFlex Mascot"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/mascot.jpg';
                }}
              />
            </div>
            <span className="font-semibold text-xs tracking-tight text-[#1A1915]">JellyFlex</span>
          </div>
        </div>

        {/* Center Current Agent / Squad Name in clean sans-serif */}
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
            style={{ backgroundColor: currentColor }}
          >
            {currentInitial}
          </div>
          <span className="text-xs font-medium text-[#1A1915]">{currentTitle}</span>
        </div>

        {/* Right Action Icons: Lock Vault, Settings Gear & Right Panel Toggle */}
        <div className="flex items-center gap-1.5">
          {onLockWorkspace && (
            <button
              type="button"
              onClick={onLockWorkspace}
              className="p-1.5 rounded-lg text-[#6B6960] hover:text-[#CC785C] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              title="Lock Hardware Vault"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 rounded-lg text-[#6B6960] hover:text-[#1A1915] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            title="Settings (BYOK, Agents, Version)"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsRightPanelOpen((prev) => !prev)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isRightPanelOpen
                ? 'bg-[#FAF9F5] text-[#CC785C]'
                : 'text-[#6B6960] hover:text-[#1A1915] hover:bg-[#FAF9F5]'
            }`}
            title="Toggle Companion Panel"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR (Collapsible, 280px wide) */}
        {isLeftSidebarOpen && (
          <aside className="w-[280px] h-full flex flex-col border-r border-[#E8E6DC] bg-white shrink-0 z-10">
            {/* Top: + New Chat Button */}
            <div className="p-3 border-b border-[#E8E6DC]/60">
              <button
                type="button"
                onClick={() => {
                  setActiveType('squad');
                  setActiveId('squad-omni');
                  setChatHistory([]);
                }}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF9F5] hover:bg-[#F5F4ED] border border-[#E8E6DC] text-xs font-medium text-[#CC785C] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Chat</span>
              </button>
            </div>

            {/* Conversation History List & Sections */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {/* Section Divider: Agents */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 pt-1 pb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E9C94] font-medium">
                    Agents
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCreateAgentModal(true)}
                    className="text-[10px] text-[#CC785C] hover:underline font-mono"
                  >
                    + New
                  </button>
                </div>

                {agents.map((agent) => {
                  const isSelected = activeType === 'agent' && activeId === agent.id;
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => {
                        setActiveType('agent');
                        setActiveId(agent.id);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected ? 'bg-[#FAF9F5] border border-[#E8E6DC]' : 'hover:bg-[#FAF9F5]/60 border border-transparent'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: agent.color }}
                      >
                        {agent.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-[#1A1915] truncate">
                            {agent.name}
                          </span>
                          <span className="text-[10px] text-[#9E9C94] font-mono shrink-0 ml-1">
                            {agent.date || 'Oct 17'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6B6960] truncate">
                          {agent.lastMessage || agent.role}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Section Divider: Squads */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 pt-1 pb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E9C94] font-medium">
                    Squads
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCreateSquadModal(true)}
                    className="text-[10px] text-[#CC785C] hover:underline font-mono"
                  >
                    + New
                  </button>
                </div>

                {squads.map((squad) => {
                  const isSelected = activeType === 'squad' && activeId === squad.id;
                  return (
                    <button
                      key={squad.id}
                      type="button"
                      onClick={() => {
                        setActiveType('squad');
                        setActiveId(squad.id);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected ? 'bg-[#FAF9F5] border border-[#E8E6DC]' : 'hover:bg-[#FAF9F5]/60 border border-transparent'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: squad.color }}
                      >
                        {squad.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-[#1A1915] truncate">
                            {squad.name}
                          </span>
                          <span className="text-[10px] text-[#9E9C94] font-mono shrink-0 ml-1">
                            ({squad.member_ids.length} members)
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6B6960] truncate">
                          {squad.lastMessage || squad.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom: User Profile & BYOK Link */}
            <div className="p-3 border-t border-[#E8E6DC] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#CC785C] text-white flex items-center justify-center font-semibold text-xs">
                  A
                </div>
                <div className="text-xs font-medium text-[#1A1915]">Anurag Singh</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="text-[11px] font-mono text-[#788C5D] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>BYOK Vault</span>
                </button>

                {onLockWorkspace && (
                  <button
                    type="button"
                    onClick={onLockWorkspace}
                    className="p-1 rounded text-[#9E9C94] hover:text-[#CC785C] transition-colors cursor-pointer"
                    title="Lock Vault"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* CENTER CHAT AREA (Always visible, takes remaining width) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF9F5] relative">
          {/* Scrollable Message Container */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
              {chatHistory.length === 0 ? (
                /* Claude-style Clean Welcome State when no messages */
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#E8E6DC] bg-white shadow-xs p-1">
                    <img
                      src="/brand-mascot.png"
                      alt="JellyFlex"
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/mascot.jpg';
                      }}
                    />
                  </div>
                  <h2 className="text-2xl font-serif text-[#1A1915] font-normal">
                    How can I help you today?
                  </h2>
                  <p className="text-xs text-[#6B6960] max-w-sm">
                    Autonomous omni-channel agent squad with zero cloud telemetry and local hardware BYOK key vault.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleSendMessage('Scout top 30-day viral AI automation outliers on Reddit and X')
                      }
                      className="px-3 py-1.5 rounded-full bg-white border border-[#E8E6DC] text-xs text-[#6B6960] hover:text-[#1A1915] hover:border-[#CC785C]/50 transition-colors cursor-pointer"
                    >
                      Mine 30-day viral outliers
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendMessage('Draft a 10-slide carousel breaking down clean-room architecture')
                      }
                      className="px-3 py-1.5 rounded-full bg-white border border-[#E8E6DC] text-xs text-[#6B6960] hover:text-[#1A1915] hover:border-[#CC785C]/50 transition-colors cursor-pointer"
                    >
                      Draft a 10-slide carousel
                    </button>
                  </div>
                </div>
              ) : (
                chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.is_agent ? 'items-start' : 'items-end'}`}
                  >
                    {/* Agent Header (Small circular avatar + agent name) */}
                    {msg.is_agent && (
                      <div className="flex items-center gap-2 mb-1.5 pl-0.5">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                          style={{ backgroundColor: msg.sender_color }}
                        >
                          {msg.sender_initial}
                        </div>
                        <span className="font-semibold text-xs text-[#1A1915]">{msg.sender_name}</span>
                        <span className="text-[10px] text-[#9E9C94] font-mono">{msg.sender_role}</span>
                      </div>
                    )}

                    {/* Tool Execution Card (Small collapsible card with tool name, parameters, result) */}
                    {msg.tool_execution && (
                      <div className="mb-2 w-full max-w-xl bg-white border border-[#E8E6DC] rounded-xl p-3 space-y-2 text-xs shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Code className="w-3.5 h-3.5 text-[#0EA5E9]" />
                            <span className="font-mono text-xs font-semibold text-[#1A1915]">
                              {msg.tool_execution.toolName}
                            </span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[#788C5D]/15 text-[#788C5D] font-semibold">
                            {msg.tool_execution.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                          {Object.entries(msg.tool_execution.parameters).map(([k, v]) => (
                            <span key={k} className="px-1.5 py-0.5 rounded bg-[#FAF9F5] border border-[#E8E6DC] text-[#6B6960]">
                              {k}: <span className="text-[#1A1915]">{String(v)}</span>
                            </span>
                          ))}
                        </div>

                        {msg.tool_execution.resultSummary && (
                          <div className="text-[11px] text-[#6B6960] pt-1 border-t border-[#E8E6DC]/60">
                            {msg.tool_execution.resultSummary}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Collapsible Thinking Process */}
                    {msg.thought_process && msg.thought_process.length > 0 && (
                      <details className="mb-2 max-w-xl text-left bg-white border border-[#E8E6DC] rounded-xl px-3 py-2 text-xs text-[#6B6960] cursor-pointer shadow-2xs">
                        <summary className="font-mono text-[10px] uppercase tracking-wider text-[#CC785C] font-semibold select-none flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#CC785C]" />
                          Thinking Process ({msg.thought_process.length} steps)
                        </summary>
                        <ul className="mt-2 space-y-1 pl-4 list-disc text-[11px] text-[#6B6960] font-sans">
                          {msg.thought_process.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </details>
                    )}

                    {/* Main Message Bubble */}
                    <div
                      className={`text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.is_agent
                          ? 'text-[#1A1915] max-w-xl py-1'
                          : 'bg-[#F0EDE4] text-[#1A1915] px-4 py-2.5 rounded-2xl max-w-md shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Inline Action Card (Cue by Manus Style) */}
                    {msg.action_card && (
                      <div className="mt-3 w-full max-w-xl bg-white border border-[#E8E6DC] rounded-2xl p-4 space-y-3 shadow-2xs">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-xs text-[#1A1915]">
                              {msg.action_card.title}
                            </div>
                            <div className="text-xs text-[#6B6960] leading-relaxed">
                              {msg.action_card.description}
                            </div>
                          </div>
                          <div className="w-4 h-4 rounded-full border-2 border-[#788C5D] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-[#788C5D] stroke-[3]" />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#E8E6DC]/60 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#788C5D] font-semibold">
                            STATUS: {msg.action_card.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSendMessage(msg.action_card?.buttonText)}
                            className="px-4 py-1.5 rounded-xl bg-[#CC785C] hover:bg-[#D97757] text-white font-medium text-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            {msg.action_card.buttonText}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-[#6B6960] pl-1">
                  <span className="w-2 h-2 rounded-full bg-[#CC785C] animate-ping" />
                  <span>Formulating response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed Bottom Input Bar (Warm white #FFFFFF card with subtle shadow) */}
          <div className="p-4 bg-[#FAF9F5] shrink-0">
            <div className="max-w-2xl mx-auto space-y-2">
              {attachedFiles.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {attachedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E6DC] text-xs font-mono text-[#1A1915]"
                    >
                      <Paperclip className="w-3 h-3 text-[#CC785C]" />
                      <span>{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachedFile(i)}
                        className="text-[#9E9C94] hover:text-[#1A1915]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="w-full bg-white border border-[#E8E6DC] rounded-2xl p-2.5 flex items-center gap-2 shadow-xs focus-within:border-[#CC785C] transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*,.pdf,.txt,.csv"
                  className="hidden"
                />

                {/* Paperclip attachment icon */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg text-[#6B6960] hover:text-[#1A1915] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                  title="Attach document or media"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Microphone icon */}
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isRecording
                      ? 'bg-[#CC785C]/15 text-[#CC785C] animate-pulse'
                      : 'text-[#6B6960] hover:text-[#1A1915] hover:bg-[#FAF9F5]'
                  }`}
                  title={isRecording ? 'Listening (Click to stop)' : 'Voice Input'}
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${currentTitle || 'JellyFlex'}...`}
                  className="flex-1 bg-transparent border-0 text-xs text-[#1A1915] placeholder-[#9E9C94] focus:outline-none px-2"
                />

                {/* Send arrow button in terracotta #CC785C circle */}
                <button
                  type="submit"
                  disabled={isSending || (!inputText.trim() && attachedFiles.length === 0)}
                  className="w-7 h-7 rounded-full bg-[#CC785C] hover:bg-[#D97757] text-white flex items-center justify-center disabled:opacity-30 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 3. RIGHT COMPANION PANEL (Collapsible, 300px wide, default CLOSED) */}
        {isRightPanelOpen && (
          <aside className="w-[300px] h-full flex flex-col border-l border-[#E8E6DC] bg-white p-5 shrink-0 overflow-y-auto space-y-6 z-10 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between border-b border-[#E8E6DC] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E9C94] font-semibold">
                Companion Engine
              </span>
              <button
                type="button"
                onClick={() => setIsRightPanelOpen(false)}
                className="text-[#9E9C94] hover:text-[#1A1915] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Current Agent Profile Card */}
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E6DC] space-y-3">
              <div className="flex items-center gap-3">
                {useMascotCompanionAvatar ? (
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E8E6DC] bg-white shrink-0 p-0.5">
                    <img
                      src="/brand-mascot.png"
                      alt="JellyFlex Mascot Companion"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/mascot.jpg';
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm text-white font-bold"
                    style={{ backgroundColor: currentColor }}
                  >
                    {currentInitial}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-xs text-[#1A1915]">{currentTitle}</div>
                  <div className="text-[10px] text-[#6B6960] font-mono">
                    {activeType === 'squad' ? `${activeSquad?.member_ids.length} Agents` : activeAgent?.model}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#6B6960] leading-relaxed">
                {activeType === 'squad' ? activeSquad?.description : activeAgent?.persona}
              </p>

              {/* Companion Avatar Selector Option */}
              <div className="pt-1 border-t border-[#E8E6DC]/60 flex items-center justify-between text-[11px]">
                <span className="text-[#6B6960]">Companion Avatar:</span>
                <button
                  type="button"
                  onClick={() => setUseMascotCompanionAvatar(!useMascotCompanionAvatar)}
                  className="px-2 py-0.5 rounded-lg bg-white border border-[#E8E6DC] text-[10px] font-mono text-[#CC785C] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                >
                  {useMascotCompanionAvatar ? 'Voxel Mascot' : 'Letter Avatar'}
                </button>
              </div>
            </div>

            {/* Daily Brief Button (Feature trigger in companion panel) */}
            <button
              type="button"
              onClick={() => setShowDailyBriefModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF9F5] border border-[#E8E6DC] text-xs font-medium text-[#1A1915] flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#CC785C]" />
                <span>Executive Daily Brief</span>
              </div>
              <span className="text-[9px] font-mono text-[#CC785C] font-semibold">Oct 17</span>
            </button>

            {/* Active Skills List */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#9E9C94] font-semibold">
                Active Skills & Tools
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E6DC]/70 text-[11px]">
                  <span>Stealth Virtual Browser</span>
                  <span className="text-[9px] font-mono text-[#788C5D] font-semibold">ARMED</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E6DC]/70 text-[11px]">
                  <span>Outlier Trend Miner</span>
                  <span className="text-[9px] font-mono text-[#788C5D] font-semibold">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E6DC]/70 text-[11px]">
                  <span>Multimodal Vision OCR</span>
                  <span className="text-[9px] font-mono text-[#788C5D] font-semibold">READY</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E6DC]/70 text-[11px]">
                  <span>Hardware Key Vault</span>
                  <span className="text-[9px] font-mono text-[#CC785C] font-semibold">SEALED</span>
                </div>
              </div>
            </div>

            {/* Token Usage Meter */}
            <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E8E6DC] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#6B6960]">Token Budget (Local BYOK)</span>
                <span className="font-mono text-[#1A1915] font-semibold">$1.42 / $50</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#E8E6DC] overflow-hidden">
                <div className="h-full bg-[#CC785C] rounded-full" style={{ width: '4%' }} />
              </div>
              <div className="text-[10px] text-[#9E9C94] font-mono">Zero cloud markup • 100% direct</div>
            </div>
          </aside>
        )}
      </div>

      {/* MODALS */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onOpenCreateAgent={() => setShowCreateAgentModal(true)}
      />

      <DailyBriefModal
        isOpen={showDailyBriefModal}
        onClose={() => setShowDailyBriefModal(false)}
      />

      <CreateAgentModal
        isOpen={showCreateAgentModal}
        onClose={() => setShowCreateAgentModal(false)}
        onAgentCreated={(newAgent) => {
          setAgents((prev) => [
            ...prev,
            {
              ...newAgent,
              initial: newAgent.name.charAt(0).toUpperCase(),
            },
          ]);
          setActiveType('agent');
          setActiveId(newAgent.id);
        }}
      />

      <CreateSquadModal
        isOpen={showCreateSquadModal}
        onClose={() => setShowCreateSquadModal(false)}
        availableAgents={agents}
        onSquadCreated={(newSquad) => {
          setSquads((prev) => [
            ...prev,
            {
              ...newSquad,
              initial: newSquad.name.charAt(0).toUpperCase(),
            },
          ]);
          setActiveType('squad');
          setActiveId(newSquad.id);
        }}
      />
    </div>
  );
};
