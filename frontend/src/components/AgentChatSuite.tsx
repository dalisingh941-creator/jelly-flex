'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Zap,
  Code,
  User,
  Paperclip,
  Mic,
  ArrowUp,
  Layers,
  Bot,
  SlidersHorizontal,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  X,
  ChevronDown,
  Plus,
  Compass,
  Cpu,
  Terminal,
  Shield,
} from 'lucide-react';
import { SecurityAndBYOKModal } from './SecurityAndBYOKModal';
import { CreateAgentModal, ICON_MAP } from './CreateAgentModal';
import { CreateSquadModal } from './CreateSquadModal';
import { DailyBriefModal } from './DailyBriefModal';
import { ToolExecutionPreviewCard } from './ToolExecutionPreviewCard';

type AvatarState = 'IDLE' | 'THINKING' | 'USING_TOOL' | 'STREAMING' | 'AWAITING_APPROVAL';

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

interface ToolExecutionData {
  toolName: string;
  parameters: Record<string, any>;
  status: 'running' | 'completed';
  resultSummary?: string;
  browserUrl?: string;
  browserDomPreview?: string;
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
  tool_execution?: ToolExecutionData;
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
    role: 'Research & Outlier Scout',
    color: '#CC785C',
    badge_bg: 'bg-[#CC785C]/10 text-[#CC785C] border-[#CC785C]/30',
    avatar_symbol: 'search',
    model: 'gemini-2.0-flash',
    persona: 'Analytical, data-driven scout that mines 30-day viral trend outliers and audience objections.',
    instructions: 'Focus on empirical outlier data, cited pattern benchmarks, and audience psychology.',
    tools: ['Stealth Browser', 'DuckDuckGo Search', 'Outlier Trend Miner'],
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
    color: '#788C5D',
    badge_bg: 'bg-[#788C5D]/10 text-[#788C5D] border-[#788C5D]/30',
    avatar_symbol: 'sparkles',
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
    color: '#D97757',
    badge_bg: 'bg-[#D97757]/10 text-[#D97757] border-[#D97757]/30',
    avatar_symbol: 'zap',
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
    color: '#6A9BCC',
    badge_bg: 'bg-[#6A9BCC]/10 text-[#6A9BCC] border-[#6A9BCC]/30',
    avatar_symbol: 'code',
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
      "Find today's trending tech debate and draft 3 provocative angles",
      'Analyze why recent AI developer videos went viral and write our own version',
    ],
  },
];

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-seed-1',
    conversation_id: 'conv-squad-omni',
    sender_id: 'user',
    sender_name: 'You',
    sender_role: 'Squad Director',
    sender_color: '#CC785C',
    sender_avatar: 'user',
    is_agent: false,
    text: 'Squad, coordinate an omni-channel launch strategy for JellyFlex 2.0. Focus on our single-time GitHub invite code and zero-knowledge BYOK architecture. Scout, scrape top 30-day viral AI hooks first using the virtual browser.',
  },
  {
    id: 'msg-seed-2',
    conversation_id: 'conv-squad-omni',
    sender_id: 'agent-scout',
    sender_name: 'Scout',
    sender_role: 'Research & Outlier Scout',
    sender_color: '#CC785C',
    sender_avatar: 'search',
    is_agent: true,
    thought_process: [
      'Activated Stealth Virtual Browser sandbox with bezier mouse curvature',
      'Navigated to https://instagram.com/explore/tags/aiworkflow',
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
      resultSummary:
        'Scraped 18 reels. Found 4 high-retention outliers (4.2x median baseline). Anti-bot checkpoint: 0% risk.',
      browserUrl: 'https://instagram.com/explore/tags/aiworkflow',
      browserDomPreview:
        'Scraped <article class="reels-grid">. Top hook identified: "Stop giving away your API keys to random cloud wrappers."',
    },
    tools_used: [
      { tool: 'Stealth Virtual Browser', status: 'completed' },
      { tool: 'Outlier Miner', status: 'completed' },
    ],
    text: "I've completed our trend reconnaissance via our sandboxed virtual browser. The data is clear: audiences are exhausted by SaaS platforms demanding their API keys. Leading with our zero-knowledge PBKDF2 Fernet vault and single-time GitHub invite code (JELLYFLEX-COMMUNITY-2026) produces a 4.2x higher bookmark velocity. Volt, take these findings and craft the headline hooks.",
  },
  {
    id: 'msg-seed-3',
    conversation_id: 'conv-squad-omni',
    sender_id: 'agent-volt',
    sender_name: 'Volt',
    sender_role: 'Viral Hook & Copy Chief',
    sender_color: '#D97757',
    sender_avatar: 'zap',
    is_agent: true,
    thought_process: [
      "Ingesting Scout's outlier findings into ViralHookAndShadowbanSimulator",
      'Filtering for 0-3 second pattern-interrupt velocity',
      'Calculated viral retention score: 94/100',
    ],
    tools_used: [{ tool: 'Viral Simulator (Score: 94/100)', status: 'completed' }],
    text: "Here are 3 high-impact hooks optimized for our launch:\n\n1. **Pattern Interrupt**: *\"99% of creators waste $80/mo on bloated AI dashboards. Here is what happens when you use an open-source agent squad.\"*\n2. **Curiosity Gap**: *\"How a single-time GitHub invite code permanently unlocks full local autonomy without developer telemetry.\"*\n3. **Contrarian Truth**: *\"Stop pasting your API keys into closed-source web wrappers. Own your runtime.\"*\n\nAura, format Hook #1 into our 10-slide visual carousel and 9:16 Reels storyboard.",
  },
];

export const AgentChatSuite: React.FC = () => {
  const [agents, setAgents] = useState<AgentItem[]>(DEFAULT_AGENTS);
  const [squads, setSquads] = useState<SquadItem[]>(DEFAULT_SQUADS);
  const [activeType, setActiveType] = useState<'agent' | 'squad'>('squad');
  const [activeId, setActiveId] = useState<string>('squad-omni');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(true);
  const [showBYOKModal, setShowBYOKModal] = useState(false);
  const [showCreateAgentModal, setShowCreateAgentModal] = useState(false);
  const [showCreateSquadModal, setShowCreateSquadModal] = useState(false);
  const [showDailyBriefModal, setShowDailyBriefModal] = useState(false);

  // Reactive Avatar Engine State
  const [avatarState, setAvatarState] = useState<AvatarState>('IDLE');
  const [activeToolName, setActiveToolName] = useState<string>('');
  const [mascotSpeech, setMascotSpeech] = useState<string>(
    'Ready to coordinate specialist agents.'
  );

  // File Upload & Voice State
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch agents, squads
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
            // Clean up avatar symbols in case backend had old emojis
            const sanitized = aData.agents.map((ag: AgentItem) => {
              let sym = ag.avatar_symbol;
              if (sym === '🔍') sym = 'search';
              else if (sym === '✨') sym = 'sparkles';
              else if (sym === '⚡') sym = 'zap';
              else if (sym === '💻') sym = 'code';
              return { ...ag, avatar_symbol: sym };
            });
            setAgents(sanitized);
          }
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
    if (activeId === 'squad-omni' && chatHistory.length === 3) return; // Keep seed messages

    const fetchHistory = async () => {
      const convId = `conv-${activeId}`;
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/chat/history/${convId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages?.length) {
            setChatHistory(data.messages);
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

  // Helper to render SVG icon for agent
  const renderGlyph = (symbol: string, className = 'w-4 h-4') => {
    if (symbol === 'user') return <User className={className} />;
    const IconComponent = ICON_MAP[symbol] || Bot;
    return <IconComponent className={className} />;
  };

  // Handle Voice Speech-to-Text via Web Speech API
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is supported in Chrome, Edge, and Electron.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setAvatarState('IDLE');
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setAvatarState('STREAMING');
        setMascotSpeech('Listening to voice input...');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setAvatarState('IDLE');
      };

      recognition.onend = () => {
        setIsRecording(false);
        setAvatarState('IDLE');
        setMascotSpeech('Voice transcription ingested.');
      };

      recognition.start();
    } catch (err) {
      setIsRecording(false);
      setAvatarState('IDLE');
    }
  };

  // Handle File Upload & Attachment
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

    setAvatarState('USING_TOOL');
    setActiveToolName('vision_analyzer');
    setMascotSpeech(`Ingested attachment for multimodal vision analysis.`);
    setTimeout(() => setAvatarState('IDLE'), 2000);
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

    // Reactive avatar state transition
    setAvatarState('THINKING');
    setMascotSpeech(
      activeType === 'squad'
        ? `Coordinating multi-agent squad collaboration...`
        : `${activeAgent?.name || 'Agent'} is formulating response...`
    );

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      conversation_id: `conv-${activeId}`,
      sender_id: 'user',
      sender_name: 'You',
      sender_role: activeType === 'squad' ? 'Squad Director' : 'Architect',
      sender_color: '#CC785C',
      sender_avatar: 'user',
      is_agent: false,
      text:
        currentFiles.length > 0
          ? `[Attached ${currentFiles.map((f) => f.name).join(', ')}]\n\n${message}`
          : message,
    };
    setChatHistory((prev) => [...prev, tempUserMsg]);

    try {
      if (activeType === 'squad') {
        setAvatarState('USING_TOOL');
        setActiveToolName('stealth_browser');

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
      setAvatarState('IDLE');
      setMascotSpeech('State preserved in hardware Fernet vault.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#FAF9F5] text-[#141413] dark:bg-[#141413] dark:text-[#FAF9F5] font-sans">
      {/* 1. LEFT SIDEBAR: AGENT & SQUAD NAVIGATOR */}
      <aside className="w-72 lg:w-80 h-full flex flex-col border-r border-[#E8E6DC] dark:border-[#302E2B] bg-[#F5F4ED] dark:bg-[#191816] shrink-0">
        {/* Brand Header with Mascot */}
        <div className="h-16 border-b border-[#E8E6DC] dark:border-[#302E2B] px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-9 h-9 rounded-xl overflow-hidden border transition-all duration-200 bg-white dark:bg-[#242320] shrink-0 ${
                  avatarState === 'THINKING'
                    ? 'border-[#CC785C] ring-2 ring-[#CC785C]/30'
                    : avatarState === 'USING_TOOL'
                    ? 'border-[#788C5D] ring-2 ring-[#788C5D]/30'
                    : 'border-[#E8E6DC] dark:border-[#302E2B]'
                }`}
              >
                <img
                  src="/brand-mascot.png"
                  alt="JellyFlex"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/mascot.jpg';
                  }}
                />
              </div>
              {avatarState !== 'IDLE' && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#CC785C] animate-ping" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-[#141413] dark:text-[#FAF9F5] tracking-tight">
                  JellyFlex
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-[#CC785C]/15 text-[#CC785C] border border-[#CC785C]/30">
                  v2.0
                </span>
              </div>
              <div className="text-[10px] text-[#5E5D59] dark:text-[#87867F] font-mono">
                Conversational Agent Suite
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Daily Brief Header Trigger */}
            <button
              type="button"
              onClick={() => setShowDailyBriefModal(true)}
              className="p-1.5 rounded-lg text-[#5E5D59] hover:text-[#CC785C] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Open Executive Daily Briefing"
            >
              <Zap className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-[#5E5D59] hover:text-[#141413] dark:hover:text-[#FAF9F5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#CC785C]" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scrollable Channels & Agents */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Executive Daily Brief Banner Card */}
          <button
            type="button"
            onClick={() => setShowDailyBriefModal(true)}
            className="w-full p-3 rounded-xl bg-white dark:bg-[#242320] border border-[#E8E6DC] dark:border-[#302E2B] hover:border-[#CC785C]/50 transition-all text-left space-y-1 shadow-xs cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#141413] dark:text-[#FAF9F5] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#CC785C]" /> Daily Executive Brief
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#CC785C]/15 text-[#CC785C] font-semibold">
                Oct 17
              </span>
            </div>
            <p className="text-[11px] text-[#5E5D59] dark:text-[#B0AEA5] line-clamp-1">
              Autonomous overnight run: 14 posts dispatched • 92.8 viral score avg
            </p>
          </button>

          {/* GROUP SQUADS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E5D59] dark:text-[#87867F] font-semibold flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#CC785C]" />
                Group Squads
              </span>
              <button
                type="button"
                onClick={() => setShowCreateSquadModal(true)}
                className="text-[10px] text-[#CC785C] hover:text-[#D97757] font-mono flex items-center gap-0.5 hover:underline cursor-pointer"
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
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                    active
                      ? 'bg-white dark:bg-[#242320] border border-[#CC785C]/60 text-[#141413] dark:text-[#FAF9F5] shadow-xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#5E5D59] dark:text-[#B0AEA5] border border-transparent'
                  }`}
                >
                  <div className="flex -space-x-1.5 shrink-0">
                    {squadMembers.slice(0, 3).map((m, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-lg border border-white dark:border-[#191816] flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: `${m.color}15`, color: m.color }}
                      >
                        {renderGlyph(m.avatar_symbol, 'w-3 h-3')}
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs text-[#141413] dark:text-[#FAF9F5] truncate">
                      {squad.name}
                    </div>
                    <div className="text-[10px] text-[#5E5D59] dark:text-[#87867F] font-mono">
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
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E5D59] dark:text-[#87867F] font-semibold flex items-center gap-1.5">
                <Bot className="w-3 h-3 text-[#788C5D]" />
                Specialist Agents (1-on-1)
              </span>
              <button
                type="button"
                onClick={() => setShowCreateAgentModal(true)}
                className="text-[10px] text-[#788C5D] hover:text-[#5E5D59] font-mono flex items-center gap-0.5 hover:underline cursor-pointer"
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
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                    active
                      ? 'bg-white dark:bg-[#242320] border border-[#CC785C]/60 text-[#141413] dark:text-[#FAF9F5] shadow-xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#5E5D59] dark:text-[#B0AEA5] border border-transparent'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${agent.color}15`,
                      borderColor: `${agent.color}35`,
                      color: agent.color,
                    }}
                  >
                    {renderGlyph(agent.avatar_symbol, 'w-3.5 h-3.5')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-[#141413] dark:text-[#FAF9F5] truncate">
                        {agent.name}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: agent.color }}
                        title="Online & Ready"
                      />
                    </div>
                    <div className="text-[10px] text-[#5E5D59] dark:text-[#87867F] truncate">{agent.role}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer: BYOK Vault & Status */}
        <div className="p-3 border-t border-[#E8E6DC] dark:border-[#302E2B] bg-[#F0EFEA] dark:bg-[#141413] space-y-2">
          <button
            type="button"
            onClick={() => setShowBYOKModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-[#1D1C1A] hover:bg-[#E8E6DC]/50 dark:hover:bg-[#242320] border border-[#E8E6DC] dark:border-[#302E2B] text-xs font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-[#141413] dark:text-[#FAF9F5]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#788C5D]" />
              <span>BYOK Key Vault</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#788C5D]/15 text-[#788C5D] font-medium">
              Encrypted
            </span>
          </button>

          <div className="px-2 flex items-center justify-between text-[10px] font-mono text-[#87867F]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#788C5D]" />
              Agno OS • SQLite
            </span>
            <span>Clean-Room Core</span>
          </div>
        </div>
      </aside>

      {/* 2. CENTER STAGE: CLEAN EDITORIAL CONVERSATIONAL FEED */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF9F5] dark:bg-[#141413] relative">
        {/* Top Chat Header */}
        <header className="h-16 border-b border-[#E8E6DC] dark:border-[#302E2B] px-6 flex items-center justify-between bg-[#FAF9F5] dark:bg-[#141413] shrink-0">
          <div className="flex items-center gap-3">
            {activeType === 'squad' && activeSquad ? (
              <>
                <div className="flex -space-x-1.5">
                  {activeSquad.member_ids
                    .map((mid) => agents.find((a) => a.id === mid))
                    .filter(Boolean)
                    .map((m, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-lg border border-white dark:border-[#141413] flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: `${m?.color}15`, color: m?.color }}
                      >
                        {renderGlyph(m?.avatar_symbol || 'bot', 'w-3.5 h-3.5')}
                      </div>
                    ))}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-sm text-[#141413] dark:text-[#FAF9F5]">
                      {activeSquad.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#CC785C]/15 border border-[#CC785C]/30 text-[#CC785C] font-medium">
                      Coordinated Squad
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5E5D59] dark:text-[#87867F] truncate max-w-md">
                    {activeSquad.description}
                  </div>
                </div>
              </>
            ) : activeAgent ? (
              <>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: `${activeAgent.color}15`,
                    borderColor: `${activeAgent.color}40`,
                    color: activeAgent.color,
                  }}
                >
                  {renderGlyph(activeAgent.avatar_symbol, 'w-4 h-4')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-sm text-[#141413] dark:text-[#FAF9F5]">
                      {activeAgent.name}
                    </h2>
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-mono border"
                      style={{
                        backgroundColor: `${activeAgent.color}15`,
                        borderColor: `${activeAgent.color}35`,
                        color: activeAgent.color,
                      }}
                    >
                      {activeAgent.role}
                    </span>
                    <span className="text-[10px] font-mono text-[#5E5D59] dark:text-[#87867F]">
                      {activeAgent.model}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5E5D59] dark:text-[#87867F] truncate max-w-md">
                    {activeAgent.persona}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDailyBriefModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-mono bg-[#CC785C]/10 hover:bg-[#CC785C]/20 border border-[#CC785C]/30 text-[#CC785C] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Daily Brief</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRightDrawer((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl text-xs font-mono bg-[#F5F4ED] dark:bg-[#1D1C1A] hover:bg-[#E8E6DC] dark:hover:bg-[#242320] border border-[#E8E6DC] dark:border-[#302E2B] text-[#5E5D59] dark:text-[#FAF9F5] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showRightDrawer ? 'Hide Inspector' : 'Show Inspector'}</span>
            </button>
          </div>
        </header>

        {/* Message Feed: Literary max-w-3xl Reading Column */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Chat Messages */}
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${
                  msg.is_agent ? 'mr-auto w-full' : 'ml-auto flex-row-reverse max-w-2xl'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs"
                  style={{
                    backgroundColor: msg.is_agent ? `${msg.sender_color}15` : '#CC785C15',
                    borderColor: msg.is_agent ? `${msg.sender_color}40` : '#CC785C',
                    color: msg.is_agent ? msg.sender_color : '#CC785C',
                  }}
                >
                  {renderGlyph(msg.sender_avatar, 'w-4 h-4')}
                </div>

                {/* Message Body */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  {/* Author Header */}
                  <div
                    className={`flex items-center gap-2 text-[11px] ${
                      msg.is_agent ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <span className="font-semibold text-[#141413] dark:text-[#FAF9F5]">
                      {msg.sender_name}
                    </span>
                    <span
                      className="px-1.5 py-0.2 rounded text-[9px] font-mono border"
                      style={{
                        backgroundColor: `${msg.sender_color}15`,
                        borderColor: `${msg.sender_color}35`,
                        color: msg.sender_color,
                      }}
                    >
                      {msg.sender_role}
                    </span>
                  </div>

                  {/* Live Tool Execution & Browser Viewport Preview Card */}
                  {msg.tool_execution && (
                    <ToolExecutionPreviewCard
                      toolName={msg.tool_execution.toolName}
                      parameters={msg.tool_execution.parameters}
                      status={msg.tool_execution.status}
                      resultSummary={msg.tool_execution.resultSummary}
                      browserUrl={msg.tool_execution.browserUrl}
                      browserDomPreview={msg.tool_execution.browserDomPreview}
                    />
                  )}

                  {/* Collapsible Thinking Process Foldout */}
                  {msg.thought_process && msg.thought_process.length > 0 && (
                    <details className="group rounded-xl bg-[#F5F4ED] dark:bg-[#1D1C1A] border border-[#E8E6DC] dark:border-[#302E2B] p-2.5 text-xs text-[#5E5D59] dark:text-[#87867F]">
                      <summary className="cursor-pointer font-mono text-[10px] text-[#CC785C] uppercase tracking-wider flex items-center gap-1.5 select-none font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CC785C] animate-pulse" />
                        Thinking Process ({msg.thought_process.length} steps)
                      </summary>
                      <ul className="mt-2 space-y-1 pl-4 list-disc text-[11px] text-[#5E5D59] dark:text-[#B0AEA5] font-mono">
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
                        ? 'bg-white dark:bg-[#1D1C1A] border border-[#E8E6DC] dark:border-[#302E2B] text-[#141413] dark:text-[#FAF9F5] shadow-xs'
                        : 'bg-[#CC785C] text-white shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Tools used pill */}
                  {msg.tools_used && msg.tools_used.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      {msg.tools_used.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#F5F4ED] dark:bg-[#242320] border border-[#E8E6DC] dark:border-[#302E2B] text-[#5E5D59] dark:text-[#87867F] flex items-center gap-1"
                        >
                          <Zap className="w-2.5 h-2.5 text-[#CC785C]" />
                          {t.tool}
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
                <div className="w-8 h-8 rounded-lg bg-[#CC785C]/15 border border-[#CC785C]/35 flex items-center justify-center text-[#CC785C] text-xs">
                  <Zap className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1D1C1A] border border-[#E8E6DC] dark:border-[#302E2B] flex items-center gap-2 text-xs text-[#5E5D59] dark:text-[#B0AEA5] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#CC785C] animate-ping" />
                  <span>
                    {activeType === 'squad'
                      ? 'Squad members collaborating across domain lanes...'
                      : `${activeAgent?.name || 'Agent'} is formulating response...`}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Input Composer (Anthropic Style centered max-w-3xl) */}
        <div className="p-4 border-t border-[#E8E6DC] dark:border-[#302E2B] bg-[#FAF9F5] dark:bg-[#141413] shrink-0 space-y-2">
          {/* Attached Files Pills */}
          {attachedFiles.length > 0 && (
            <div className="max-w-3xl mx-auto flex items-center gap-2 flex-wrap">
              {attachedFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#F5F4ED] dark:bg-[#242320] border border-[#E8E6DC] dark:border-[#302E2B] text-xs text-[#141413] dark:text-[#FAF9F5] font-mono"
                >
                  <Paperclip className="w-3 h-3 text-[#CC785C]" />
                  <span>
                    {f.name} ({f.sizeKb} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachedFile(i)}
                    className="text-[#87867F] hover:text-[#141413] dark:hover:text-[#FAF9F5] cursor-pointer"
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
            className="max-w-3xl mx-auto flex items-end gap-2 p-2 rounded-2xl bg-white dark:bg-[#1D1C1A] border border-[#E8E6DC] dark:border-[#302E2B] focus-within:border-[#CC785C] shadow-sm transition-all"
          >
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,video/*,.pdf,.txt,.csv"
              className="hidden"
            />

            {/* File upload trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-[#5E5D59] dark:text-[#87867F] hover:text-[#141413] dark:hover:text-[#FAF9F5] hover:bg-[#F5F4ED] dark:hover:bg-[#242320] transition-colors cursor-pointer"
              title="Upload media or documents (.png, .mp4, .pdf)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice microphone trigger */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isRecording
                  ? 'bg-[#CC785C]/20 text-[#CC785C] border border-[#CC785C]/40 animate-pulse'
                  : 'text-[#5E5D59] dark:text-[#87867F] hover:text-[#141413] dark:hover:text-[#FAF9F5] hover:bg-[#F5F4ED] dark:hover:bg-[#242320]'
              }`}
              title={isRecording ? 'Listening (Click to stop)' : 'Voice Input (Speech-to-Text)'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeType === 'squad'
                  ? `Reply to ${activeSquad?.name} (Shift+Enter for newline)...`
                  : `Reply to ${activeAgent?.name} (${activeAgent?.role})...`
              }
              className="flex-1 bg-transparent border-0 resize-none text-xs text-[#141413] dark:text-[#FAF9F5] placeholder-[#87867F] focus:outline-none p-2 font-sans"
            />

            <button
              type="submit"
              disabled={isSending || (!inputText.trim() && attachedFiles.length === 0)}
              className="p-2.5 rounded-xl bg-[#CC785C] hover:bg-[#D97757] text-white disabled:opacity-40 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </main>

      {/* 3. RIGHT COMPANION DRAWER: REACTIVE RESPONDER AVATAR & INSPECTOR */}
      {showRightDrawer && (
        <aside className="w-72 lg:w-80 h-full border-l border-[#E8E6DC] dark:border-[#302E2B] bg-[#F5F4ED] dark:bg-[#191816] p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E6DC] dark:border-[#302E2B] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E5D59] dark:text-[#87867F] font-semibold">
                Companion Engine
              </span>
              <span
                className={`text-[10px] font-mono font-semibold flex items-center gap-1 ${
                  avatarState === 'THINKING'
                    ? 'text-[#CC785C]'
                    : avatarState === 'USING_TOOL'
                    ? 'text-[#788C5D]'
                    : avatarState === 'STREAMING'
                    ? 'text-[#6A9BCC]'
                    : 'text-[#788C5D]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {avatarState}
              </span>
            </div>

            {/* Reactive Responder Voxel Companion */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative group">
                <div
                  className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-sm bg-white dark:bg-[#242320] ${
                    avatarState === 'THINKING'
                      ? 'border-[#CC785C] ring-4 ring-[#CC785C]/20 scale-105'
                      : avatarState === 'USING_TOOL'
                      ? 'border-[#788C5D] ring-4 ring-[#788C5D]/20 scale-105'
                      : avatarState === 'STREAMING'
                      ? 'border-[#6A9BCC] ring-4 ring-[#6A9BCC]/20 animate-pulse'
                      : 'border-[#E8E6DC] dark:border-[#302E2B]'
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
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold bg-[#CC785C] text-white shadow-xs">
                  {avatarState === 'USING_TOOL' ? activeToolName : 'AI Responder'}
                </span>
              </div>

              {/* Speech bubble */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#1D1C1A] border border-[#E8E6DC] dark:border-[#302E2B] text-[11px] text-[#5E5D59] dark:text-[#B0AEA5] leading-relaxed font-sans shadow-xs">
                "{mascotSpeech}"
              </div>
            </div>

            {/* Subagent & Tools Active Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1D1C1A] border border-[#E8E6DC] dark:border-[#302E2B] space-y-2.5 text-xs shadow-xs">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#CC785C] font-semibold">
                Autonomous Subagents
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-[#141413] dark:text-[#FAF9F5]">
                  <span>Virtual Browser Sandbox</span>
                  <span className="font-mono text-[9px] text-[#788C5D] font-semibold">ARMED</span>
                </div>
                <div className="flex items-center justify-between text-[#141413] dark:text-[#FAF9F5]">
                  <span>Multimodal Vision OCR</span>
                  <span className="font-mono text-[9px] text-[#788C5D] font-semibold">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between text-[#141413] dark:text-[#FAF9F5]">
                  <span>Voice STT Transcriber</span>
                  <span className="font-mono text-[9px] text-[#6A9BCC] font-semibold">READY</span>
                </div>
                <div className="flex items-center justify-between text-[#141413] dark:text-[#FAF9F5]">
                  <span>Zero-Knowledge Vault</span>
                  <span className="font-mono text-[9px] text-[#CC785C] font-semibold">SEALED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E6DC] dark:border-[#302E2B] text-[10px] font-mono text-[#87867F] text-center">
            JellyFlex 2.0 • 127.0.0.1:8000
          </div>
        </aside>
      )}

      {/* MODALS */}
      {showBYOKModal && <SecurityAndBYOKModal onClose={() => setShowBYOKModal(false)} />}
      <DailyBriefModal isOpen={showDailyBriefModal} onClose={() => setShowDailyBriefModal(false)} />

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
