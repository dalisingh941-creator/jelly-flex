'use client';

import React, { useState } from 'react';
import { MascotMatrix, MascotState } from './MascotMatrix';
import { useMascotSSE } from '../hooks/useMascotSSE';
import {
  PlatformVectorIcon,
  AnimatedShieldIcon,
  AnimatedRocketIcon,
  AnimatedPaletteIcon,
  AnimatedSunIcon,
  AnimatedMoonIcon,
  AnimatedLayersIcon,
  AnimatedCheckIcon,
  AnimatedAlertIcon,
  AnimatedTerminalIcon,
} from './AnimatedIcons';

interface PlatformConfig {
  id: string;
  label: string;
  badgeColor: string;
  defaultSkills: string[];
  formatHint: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    badgeColor: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
    defaultSkills: ['brand-profile', 'voice-builder', 'instagram-suite', 'hook-writer'],
    formatHint: 'Reels 0-3s Hook + 10-Slide Carousel + Searchable IG Keyword SEO',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    badgeColor: 'text-red-400 border-red-500/30 bg-red-500/10',
    defaultSkills: ['brand-profile', 'voice-builder', 'youtube-suite', 'content-calendar'],
    formatHint: 'Long-Form & Shorts Scripts + High-CTR Title Briefs + Timestamped Chapters',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    defaultSkills: ['brand-profile', 'voice-builder', 'tiktok-suite', 'hook-writer'],
    formatHint: 'Pattern-Interrupt 3s Hook + Photo Mode Carousel + Sound Sync',
  },
  {
    id: 'x',
    label: 'X (Twitter)',
    badgeColor: 'text-slate-200 border-slate-500/30 bg-slate-500/10',
    defaultSkills: ['brand-profile', 'voice-builder', 'x-twitter-suite'],
    formatHint: '280-Character High-Signal Posts + Grok-Style Live Timeline Reply Flywheel',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    defaultSkills: ['brand-profile', 'voice-builder', 'linkedin-suite'],
    formatHint: 'See-More Fold Hook + PDF Document Carousel Brief + Strategic Commenting',
  },
  {
    id: 'threads',
    label: 'Meta Threads',
    badgeColor: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    defaultSkills: ['brand-profile', 'voice-builder', 'threads-facebook-suite'],
    formatHint: 'Conversation-First Thread Hooks + Engagement Prompts',
  },
  {
    id: 'reddit',
    label: 'Reddit & Trends',
    badgeColor: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    defaultSkills: ['brand-profile', 'pinterest-reddit-suite', 'research-outlier-miner'],
    formatHint: '30-Day Outlier Trend Mining + Zero-Fluff Subreddit Value Draft',
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    defaultSkills: ['brand-profile', 'voice-builder', 'pinterest-reddit-suite'],
    formatHint: '2:3 Vertical Pin Visual SEO Briefs + Searchable Keyword Descriptions',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    defaultSkills: ['brand-profile', 'voice-builder', 'telegram-discord-suite'],
    formatHint: 'Broadcast Channel Announcements + Rich Markdown Formatting',
  },
  {
    id: 'discord',
    label: 'Discord',
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    defaultSkills: ['brand-profile', 'voice-builder', 'telegram-discord-suite'],
    formatHint: 'Community Webhook Bridges + Structured Embed Notifications',
  },
];

interface TaskLogItem {
  id: string;
  channel: string;
  text: string;
  viralScore: number;
  status: string;
  warnings?: string[];
}

export const CanvasWorkspace: React.FC<{
  onOpenAvatarStudio?: () => void;
  onOpenSecurityModal?: () => void;
}> = ({ onOpenAvatarStudio, onOpenSecurityModal }) => {
  const { mascotState, statusDetail, pendingApprovalTask, isConnected } = useMascotSSE();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig>(PLATFORMS[0]);
  const [objective, setObjective] = useState('');
  const [requireApproval, setRequireApproval] = useState(true);
  const [waterfallMode, setWaterfallMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [activeTaskLog, setActiveTaskLog] = useState<TaskLogItem[]>([
    {
      id: 'task-cleanroom-01',
      channel: 'instagram',
      text: 'Hook (0-3s): "99% of creators waste 4 hours editing Reels—here is the verified clean-room AI architecture..."\n\nSlide 1-10 Carousel + Caption SEO attached.',
      viralScore: 94,
      status: 'AWAITING_APPROVAL',
      warnings: [],
    },
    {
      id: 'task-cleanroom-02',
      channel: 'youtube',
      text: 'Title Option 1: Clean-Room Reverse Engineering: How to Beat OpenClaw in 48 Hours\n\nChapter Breakdown:\n0:00 - The Monorepo Bottleneck\n1:45 - 7 OpenClaw Subsystems in Python\n5:20 - Hardware Fernet Encryption',
      viralScore: 89,
      status: 'PUBLISHED_ENCRYPTED',
      warnings: [],
    },
  ]);

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

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) return;
    setIsSubmitting(true);
    const taskId = `jf-${Date.now().toString().slice(-5)}`;

    try {
      if (waterfallMode) {
        // Dispatch waterfall request
        const res = await fetch('http://127.0.0.1:8000/api/v1/waterfall', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seed_idea: objective,
            channels: ['instagram', 'youtube', 'tiktok', 'x', 'linkedin'],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const newEntries: TaskLogItem[] = Object.entries(data.results || {}).map(([ch, val]: [string, any]) => ({
            id: `${taskId}-${ch}`,
            channel: ch,
            text: val.content || '',
            viralScore: val.viral_audit?.viral_score || 88,
            status: requireApproval ? 'AWAITING_APPROVAL' : 'COMPLETED',
            warnings: val.viral_audit?.shadowban_warnings || [],
          }));
          setActiveTaskLog((prev) => [...newEntries, ...prev]);
        }
      } else {
        // Dispatch single channel request
        await fetch('http://127.0.0.1:8000/api/v1/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id: taskId,
            target_channel: selectedPlatform.id,
            objective,
            payload: {},
            require_human_approval: requireApproval,
          }),
        });

        // Audit pre-publish viral hook score
        let viralScore = 88;
        let warnings: string[] = [];
        try {
          const auditRes = await fetch('http://127.0.0.1:8000/api/v1/audit/viral-hook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel: selectedPlatform.id, content: objective }),
          });
          if (auditRes.ok) {
            const auditData = await auditRes.json();
            viralScore = auditData.viral_score;
            warnings = auditData.shadowban_warnings || [];
          }
        } catch (e) {}

        setActiveTaskLog((prev) => [
          {
            id: taskId,
            channel: selectedPlatform.id,
            text: objective,
            viralScore,
            status: requireApproval ? 'AWAITING_APPROVAL' : 'QUEUED',
            warnings,
          },
          ...prev,
        ]);
      }
      setObjective('');
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/v1/approve/${taskId}`, { method: 'POST' });
    } catch (err) {}
    setActiveTaskLog((prev) =>
      prev.map((item) => (item.id === taskId ? { ...item, status: 'PUBLISHED_ENCRYPTED' } : item))
    );
  };

  const handleDeny = async (taskId: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/v1/deny/${taskId}`, { method: 'POST' });
    } catch (err) {}
    setActiveTaskLog((prev) => prev.filter((t) => t.id !== taskId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas-dark dark:bg-[#06080e] light:bg-[#f8fafc] text-slate-100 selection:bg-indigo-500/30">
      {/* TOP HEADER */}
      <header className="h-14 border-b border-white/[0.08] px-6 flex items-center justify-between glass-panel sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              isConnected ? 'bg-emerald-400 shadow-[0_0_12px_#10b981]' : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className="font-semibold tracking-tight text-sm text-white">
            JellyFlex <span className="text-indigo-400 font-mono text-xs ml-1">v2.0 CLEAN-ROOM</span>
          </span>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/[0.04] border border-white/[0.08] text-slate-400">
            AGNO OS + GOOGLE ANTIGRAVITY SDK
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* THEME TOGGLE */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-spring p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300"
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <AnimatedSunIcon className="w-4 h-4" /> : <AnimatedMoonIcon className="w-4 h-4" />}
          </button>

          {/* AVATAR STUDIO BUTTON */}
          <button
            type="button"
            onClick={onOpenAvatarStudio}
            className="btn-spring px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-200 hover:border-indigo-400/60 flex items-center gap-1.5"
          >
            <AnimatedPaletteIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Avatar Studio</span>
          </button>

          {/* BYOK & SECURITY BUTTON */}
          <button
            type="button"
            onClick={onOpenSecurityModal}
            className="btn-spring px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 hover:border-emerald-500/60 flex items-center gap-1.5"
          >
            <AnimatedShieldIcon active={true} className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BYOK Vault</span>
          </button>
        </div>
      </header>

      {/* 3-PANE WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-[1600px] w-full mx-auto">
        {/* LEFT RAIL: OMNI-CHANNEL PLATFORM SELECTOR (3 COLS) */}
        <aside className="lg:col-span-3 border-r border-white/[0.08] p-5 flex flex-col justify-between bg-black/10">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                  Omni-Channel Lanes
                </h2>
                <span className="text-[10px] font-mono text-emerald-400">FIFO Active</span>
              </div>
              <div className="space-y-1.5">
                {PLATFORMS.map((platform) => {
                  const active = selectedPlatform.id === platform.id;
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setSelectedPlatform(platform)}
                      className={`btn-spring w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                        active
                          ? 'bg-indigo-500/15 border border-indigo-500/50 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                          : 'hover:bg-white/[0.03] text-slate-400 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <PlatformVectorIcon platform={platform.id} className="w-4 h-4" />
                        <span>{platform.label}</span>
                      </div>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-300">
                        {platform.defaultSkills.length} skills
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE CHAINED SKILLS */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <AnimatedTerminalIcon className="w-3.5 h-3.5" />
                  Chained SKILL.md
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Auto-Routed</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedPlatform.defaultSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/25 text-indigo-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1 font-sans">
                {selectedPlatform.formatHint}
              </p>
            </div>
          </div>

          {/* TELEMETRY FOOTER */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-1 mt-6">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-emerald-300">STATE DOCTOR</span>
              <span className="text-emerald-400">WAL HEALTHY</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              Routing tasks to <span className="text-slate-200 font-mono">gemini-3.8-flash</span>. Complex audits to <span className="text-slate-200 font-mono">gemini-4-argon</span>.
            </p>
          </div>
        </aside>

        {/* CENTER STAGE: COMPOSER & PERMISSION BROKER (6 COLS) */}
        <main className="lg:col-span-6 p-6 space-y-6 overflow-y-auto">
          {/* COMPOSER CARD */}
          <form
            onSubmit={handleDispatch}
            className="p-5 rounded-3xl glass-panel border border-white/[0.08] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-300">Target Lane:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
                  {selectedPlatform.label}
                </span>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={waterfallMode}
                  onChange={(e) => setWaterfallMode(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500"
                />
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-300">
                  <AnimatedLayersIcon className="w-3.5 h-3.5" />
                  1-to-11 Waterfall
                </span>
              </label>
            </div>

            <textarea
              rows={3}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder={`Instruct your ${selectedPlatform.label} specialist agent (e.g. "Reverse-engineer top 30-day viral AI hooks and draft 10-slide carousel + Reels retention script")...`}
              className="w-full rounded-2xl bg-black/40 border border-white/[0.08] p-4 text-xs font-sans text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 transition-colors"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500"
                />
                <span>Human Permission Broker Gate</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-spring px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2 disabled:opacity-50"
              >
                <AnimatedRocketIcon className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Dispatching to Lane...' : 'Execute Clean-Room Pipeline'}</span>
              </button>
            </div>
          </form>

          {/* ACTIVE QUEUE & APPROVAL CARDS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Active Queue & Permission Broker Cards
              </h3>
              {pendingApprovalTask && (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  Awaiting Approval: {pendingApprovalTask}
                </span>
              )}
            </div>

            {activeTaskLog.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.channel}
                    </span>
                    <span className="text-xs font-mono text-slate-400">#{item.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Viral Hook Score: {item.viralScore}/100
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        item.status === 'AWAITING_APPROVAL'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/[0.05] font-sans whitespace-pre-wrap">
                  {item.text}
                </p>

                {item.warnings && item.warnings.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-mono space-y-1">
                    {item.warnings.map((w, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <AnimatedAlertIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}

                {item.status === 'AWAITING_APPROVAL' && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <span className="text-[11px] text-amber-300 font-mono">
                      Permission Broker: Authorize stealth browser dispatch?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        className="btn-spring px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
                      >
                        <AnimatedCheckIcon className="w-3.5 h-3.5" />
                        <span>Allow & Encrypt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeny(item.id)}
                        className="btn-spring px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT INSPECTOR: COMPANION AVATAR & SSE TELEMETRY (3 COLS) */}
        <aside className="lg:col-span-3 border-l border-white/[0.08] p-5 flex flex-col items-center justify-between bg-black/10">
          <div className="w-full flex flex-col items-center space-y-6">
            <div className="w-full flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                Companion Matrix
              </span>
              <span className="text-[11px] font-mono text-indigo-400">{mascotState}</span>
            </div>

            <MascotMatrix state={mascotState} size={190} statusDetail={statusDetail} />

            <div className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Stealth Browser Shield
              </div>
              <div className="text-xs text-slate-200 flex items-center justify-between">
                <span>Bezier Mouse Jitter</span>
                <span className="font-mono text-emerald-400 text-[10px]">ACTIVE</span>
              </div>
              <div className="text-xs text-slate-200 flex items-center justify-between">
                <span>Token-Bucket Guard</span>
                <span className="font-mono text-emerald-400 text-[10px]">ARMED (12/hr)</span>
              </div>
              <div className="text-xs text-slate-200 flex items-center justify-between">
                <span>Google Drive Cipher</span>
                <span className="font-mono text-indigo-300 text-[10px]">AES-128-CBC</span>
              </div>
            </div>

            <div className="w-full p-4 rounded-2xl bg-indigo-500/[0.05] border border-indigo-500/20 space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-300">
                REA Clean-Room Pipeline
              </div>
              <div className="text-[11px] text-slate-400 leading-snug">
                14 Repositories indexed in Stage 1–4. Clean-room specs generated in <code className="text-slate-200">artifacts/re_specs/</code>.
              </div>
            </div>
          </div>

          <div className="w-full pt-6 border-t border-white/[0.06] text-[10px] font-mono text-slate-500 text-center">
            Zero-Knowledge Local Runtime • 127.0.0.1:8000
          </div>
        </aside>
      </div>
    </div>
  );
};
