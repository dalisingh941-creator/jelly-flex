'use client';

import React, { useState } from 'react';
import { Terminal, CheckCircle2, Clock, Lock, Shield, ChevronDown, ChevronUp, Globe } from 'lucide-react';

interface ToolExecutionProps {
  toolName: string;
  parameters: Record<string, any>;
  status: 'running' | 'completed';
  resultSummary?: string;
  browserUrl?: string;
  browserDomPreview?: string;
}

export const ToolExecutionPreviewCard: React.FC<ToolExecutionProps> = ({
  toolName,
  parameters,
  status,
  resultSummary,
  browserUrl = 'https://www.instagram.com/explore/tags/cleanroom',
  browserDomPreview,
}) => {
  const [isBrowserExpanded, setIsBrowserExpanded] = useState(false);

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#1D1C1A] border border-[#E8E6DC] dark:border-[#302E2B] shadow-sm overflow-hidden text-xs my-2 transition-all">
      {/* Tool Header */}
      <div className="px-4 py-3 bg-[#F5F4ED] dark:bg-[#242320] border-b border-[#E8E6DC] dark:border-[#302E2B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#CC785C]/10 border border-[#CC785C]/30 flex items-center justify-center text-[#CC785C]">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-[#141413] dark:text-[#FAF9F5] text-xs font-mono">{toolName}</span>
            <span className="text-[10px] font-mono text-[#5E5D59] dark:text-[#87867F] ml-2">tool execution</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold flex items-center gap-1 ${
              status === 'running'
                ? 'bg-[#CC785C]/15 text-[#CC785C] border border-[#CC785C]/30 animate-pulse'
                : 'bg-[#788C5D]/15 text-[#788C5D] border border-[#788C5D]/30'
            }`}
          >
            {status === 'running' ? <Clock className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
            {status}
          </span>

          {(toolName.toLowerCase().includes('browser') || toolName.toLowerCase().includes('search')) && (
            <button
              type="button"
              onClick={() => setIsBrowserExpanded((p) => !p)}
              className="px-2 py-0.5 rounded text-[10px] text-[#CC785C] hover:bg-[#CC785C]/10 font-mono transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{isBrowserExpanded ? 'Hide Viewport' : 'Inspect Viewport'}</span>
              {isBrowserExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Tool Arguments */}
      <div className="px-4 py-2 flex flex-wrap gap-2 text-[11px] font-mono bg-[#FAF9F5]/50 dark:bg-[#1D1C1A]">
        {Object.entries(parameters).map(([key, val]) => (
          <span
            key={key}
            className="px-2 py-0.5 rounded bg-[#F5F4ED] dark:bg-[#242320] border border-[#E8E6DC] dark:border-[#302E2B]"
          >
            <span className="text-[#87867F]">{key}:</span>{' '}
            <span className="text-[#141413] dark:text-[#FAF9F5] font-medium">{String(val)}</span>
          </span>
        ))}
      </div>

      {/* Result summary */}
      {resultSummary && (
        <div className="px-4 py-2.5 text-[11px] text-[#5E5D59] dark:text-[#B0AEA5] border-t border-[#E8E6DC]/60 dark:border-[#302E2B]/60 leading-relaxed font-sans">
          {resultSummary}
        </div>
      )}

      {/* Collapsible Stealth Browser Viewport */}
      {isBrowserExpanded && (
        <div className="m-3 rounded-xl border border-[#E8E6DC] dark:border-[#302E2B] bg-[#FAF9F5] dark:bg-[#141413] overflow-hidden">
          {/* Simulated Browser Chrome */}
          <div className="px-3 py-2 bg-[#F5F4ED] dark:bg-[#1D1C1A] border-b border-[#E8E6DC] dark:border-[#302E2B] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8E6DC] dark:bg-[#302E2B]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8E6DC] dark:bg-[#302E2B]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8E6DC] dark:bg-[#302E2B]" />
            </div>

            <div className="flex-1 max-w-sm mx-3 px-2.5 py-1 rounded-md bg-white dark:bg-[#242320] border border-[#E8E6DC] dark:border-[#302E2B] text-[10px] font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#5E5D59] dark:text-[#87867F] truncate">
                <Lock className="w-3 h-3 text-[#788C5D] shrink-0" />
                <span className="text-[#141413] dark:text-[#FAF9F5]">{browserUrl}</span>
              </span>
              <span className="text-[9px] text-[#788C5D] font-bold ml-2">200 OK</span>
            </div>

            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#788C5D]/15 text-[#788C5D] border border-[#788C5D]/30 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5" />
              Stealth Bezier Active
            </span>
          </div>

          {/* Browser DOM Viewport Content */}
          <div className="p-3.5 space-y-2 text-xs font-mono text-[#141413] dark:text-[#FAF9F5] min-h-[90px]">
            <div className="flex items-center justify-between text-[10px] text-[#87867F] border-b border-[#E8E6DC] dark:border-[#302E2B] pb-1">
              <span>Cloud Viewport [1280x720]</span>
              <span>Coordinates: x:428, y:612 (Jitter 14ms)</span>
            </div>

            <p className="text-[11px] text-[#5E5D59] dark:text-[#B0AEA5] font-sans leading-relaxed">
              {browserDomPreview ||
                'DOM Tree extracted: 4 outlier Reels scraped with viral ratio > 4.5x median baseline. No captchas or bot checkpoints encountered.'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[9px] font-mono text-[#788C5D] flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#788C5D]" />
                Anti-Fingerprint Masking: 100% Verified
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
