'use client';

import React, { useId } from 'react';
import { MascotState } from '../hooks/useMascotSSE';

export { type MascotState };

interface MascotMatrixProps {
  state: MascotState;
  size?: number;
  statusDetail?: string;
  className?: string;
}

export const MascotMatrix: React.FC<MascotMatrixProps> = ({
  state = 'IDLE',
  size = 190,
  statusDetail,
  className = '',
}) => {
  const uid = useId();
  const glowFilterId = `mascot-glow-${uid}`;
  const gradId = `mascot-grad-${uid}`;
  const eyeGradId = `mascot-eye-${uid}`;

  // State-driven color palettes
  const stateThemes: Record<
    MascotState,
    {
      primary: string;
      secondary: string;
      glow: string;
      badgeBg: string;
      badgeText: string;
      pulseRate: string;
    }
  > = {
    IDLE: {
      primary: '#6366f1',
      secondary: '#a855f7',
      glow: 'rgba(99, 102, 241, 0.4)',
      badgeBg: 'bg-indigo-500/15 border-indigo-500/30',
      badgeText: 'text-indigo-300',
      pulseRate: 'animate-pulse',
    },
    THINKING: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      glow: 'rgba(236, 72, 153, 0.5)',
      badgeBg: 'bg-purple-500/15 border-purple-500/30',
      badgeText: 'text-purple-300',
      pulseRate: 'animate-spin',
    },
    SYNCING: {
      primary: '#0ea5e9',
      secondary: '#10b981',
      glow: 'rgba(14, 165, 233, 0.5)',
      badgeBg: 'bg-cyan-500/15 border-cyan-500/30',
      badgeText: 'text-cyan-300',
      pulseRate: 'animate-pulse',
    },
    AWAITING_APPROVAL: {
      primary: '#f59e0b',
      secondary: '#ef4444',
      glow: 'rgba(245, 158, 11, 0.6)',
      badgeBg: 'bg-amber-500/15 border-amber-500/30',
      badgeText: 'text-amber-300',
      pulseRate: 'animate-bounce',
    },
    COMPLETED: {
      primary: '#10b981',
      secondary: '#06b6d4',
      glow: 'rgba(16, 185, 129, 0.5)',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
      badgeText: 'text-emerald-300',
      pulseRate: 'animate-pulse',
    },
    ERROR: {
      primary: '#f43f5e',
      secondary: '#991b1b',
      glow: 'rgba(244, 63, 94, 0.6)',
      badgeBg: 'bg-rose-500/15 border-rose-500/30',
      badgeText: 'text-rose-300',
      pulseRate: 'animate-pulse',
    },
  };

  const currentTheme = stateThemes[state] || stateThemes.IDLE;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Orbital Background Rings */}
        <div
          className={`absolute rounded-full border border-indigo-500/20 w-[115%] h-[115%] transition-all duration-700 ${
            state === 'THINKING' ? 'animate-spin' : 'animate-float-slow'
          }`}
          style={{ animationDuration: state === 'THINKING' ? '3s' : '6s' }}
        />
        <div
          className="absolute rounded-full border border-white/[0.05] w-[130%] h-[130%] animate-ping"
          style={{ animationDuration: '4s' }}
        />

        {/* 60fps Native SVG Mascot */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105 drop-shadow-2xl"
        >
          <defs>
            <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentTheme.primary} />
              <stop offset="100%" stopColor={currentTheme.secondary} />
            </linearGradient>

            <linearGradient id={eyeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={currentTheme.primary} />
            </linearGradient>
          </defs>

          {/* Ambient Inner Halo */}
          <circle cx="100" cy="90" r="50" fill={currentTheme.glow} opacity="0.3" filter={`url(#${glowFilterId})`} />

          {/* Tentacles / Appendages with smooth cubic curves */}
          <g opacity="0.85">
            <path
              d="M75 110 C 65 135, 60 155, 72 175 C 75 160, 75 140, 80 115"
              stroke={`url(#${gradId})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              className={state === 'THINKING' ? 'animate-pulse' : ''}
            />
            <path
              d="M90 115 C 85 145, 95 165, 90 185 C 95 165, 95 145, 95 118"
              stroke={`url(#${gradId})`}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M105 118 C 110 145, 105 165, 110 185 C 105 165, 105 145, 100 115"
              stroke={`url(#${gradId})`}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M120 115 C 125 140, 125 160, 128 175 C 140 155, 135 135, 125 110"
              stroke={`url(#${gradId})`}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </g>

          {/* Main Bell / Cap */}
          <path
            d="M50 100 C 50 45, 150 45, 150 100 C 150 118, 135 118, 120 112 C 105 106, 95 106, 80 112 C 65 118, 50 118, 50 100 Z"
            fill={`url(#${gradId})`}
            filter={`url(#${glowFilterId})`}
            opacity="0.95"
          />

          {/* Bioluminescent Ridge Highlight */}
          <path
            d="M60 85 C 65 55, 135 55, 140 85"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Eye Matrix: Morphs by State */}
          {state === 'THINKING' ? (
            <g className="animate-pulse">
              <line x1="78" y1="88" x2="94" y2="88" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              <line x1="106" y1="88" x2="122" y2="88" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            </g>
          ) : state === 'AWAITING_APPROVAL' ? (
            <g className="animate-bounce">
              <circle cx="86" cy="86" r="6" fill="#ffffff" />
              <circle cx="86" cy="86" r="2.5" fill="#f59e0b" />
              <circle cx="114" cy="86" r="6" fill="#ffffff" />
              <circle cx="114" cy="86" r="2.5" fill="#f59e0b" />
            </g>
          ) : state === 'ERROR' ? (
            <g>
              <line x1="80" y1="82" x2="92" y2="92" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="92" y1="82" x2="80" y2="92" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="108" y1="82" x2="120" y2="92" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="120" y1="82" x2="108" y2="92" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : state === 'COMPLETED' ? (
            <g>
              <path d="M78 86 Q86 94 94 86" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M106 86 Q114 94 122 86" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          ) : (
            /* IDLE / SYNCING: Sleek Visor Arcs */
            <g>
              <ellipse cx="86" cy="86" rx="5" ry="6" fill="#ffffff" />
              <circle cx="88" cy="84" r="2" fill={currentTheme.primary} />
              <ellipse cx="114" cy="86" rx="5" ry="6" fill="#ffffff" />
              <circle cx="116" cy="84" r="2" fill={currentTheme.primary} />
            </g>
          )}

          {/* Floating Sensor Nodes */}
          <circle cx="100" cy="52" r="3" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2s' }} />
        </svg>
      </div>

      {/* State & Detail Telemetry */}
      <div className="mt-4 flex flex-col items-center space-y-1.5 text-center max-w-[220px]">
        <span
          className={`px-3 py-1 rounded-full text-[11px] font-mono tracking-wider font-semibold border ${currentTheme.badgeBg} ${currentTheme.badgeText}`}
        >
          {state}
        </span>
        {statusDetail && (
          <p className="text-[11px] text-slate-400 font-sans leading-snug line-clamp-2">
            {statusDetail}
          </p>
        )}
      </div>
    </div>
  );
};
