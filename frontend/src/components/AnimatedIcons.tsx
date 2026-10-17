'use client';

import React from 'react';

export const AnimatedShieldIcon: React.FC<{ active?: boolean; className?: string }> = ({
  active = true,
  className = 'w-4 h-4',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} transition-transform duration-300 hover:scale-110`}
  >
    <path
      d="M12 2L4 5.5V11.5C4 16.8 7.4 21.6 12 23C16.6 21.6 20 16.8 20 11.5V5.5L12 2Z"
      stroke={active ? '#10b981' : '#64748b'}
      strokeWidth="1.8"
      fill={active ? 'rgba(16, 185, 129, 0.15)' : 'none'}
      className={active ? 'animate-pulse' : ''}
    />
    <path
      d="M9 12L11 14L15.5 9.5"
      stroke={active ? '#34d399' : '#64748b'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AnimatedRocketIcon: React.FC<{ launching?: boolean; className?: string }> = ({
  launching = false,
  className = 'w-4 h-4',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} transition-all duration-300 ${
      launching ? 'animate-bounce text-indigo-400' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
    }`}
  >
    <path
      d="M4.5 16.5C3 18 3 21 3 21C3 21 6 21 7.5 19.5C8.3 18.7 8.3 17.3 7.5 16.5C6.7 15.7 5.3 15.7 4.5 16.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="rgba(99, 102, 241, 0.2)"
    />
    <path
      d="M14.5 4C17.5 4 20 6.5 20 9.5C20 13 17 16.5 13 18.5L5.5 11C7.5 7 11 4 14.5 4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="15" cy="9" r="1.5" fill="currentColor" />
  </svg>
);

export const AnimatedKeyVaultIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} transition-transform duration-300 group-hover:rotate-12`}
  >
    <circle
      cx="8"
      cy="15"
      r="4"
      stroke="#fbbf24"
      strokeWidth="1.8"
      fill="rgba(251, 191, 36, 0.15)"
    />
    <path
      d="M11 12L19 4M16 7L18.5 9.5M19 4L21 6"
      stroke="#fbbf24"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AnimatedPulseRadarIcon: React.FC<{ color?: string; className?: string }> = ({
  color = '#38bdf8',
  className = 'w-4 h-4',
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="3" fill={color} />
    <circle
      cx="12"
      cy="12"
      r="7"
      stroke={color}
      strokeWidth="1.5"
      opacity="0.6"
      className="animate-ping"
      style={{ animationDuration: '2.4s' }}
    />
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.2" opacity="0.3" />
  </svg>
);

export const AnimatedTrashShredderIcon: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} transition-transform duration-300 group-hover:scale-110`}
  >
    <path
      d="M3 6H21M8 6V4C8 3.4 8.4 3 9 3H15C15.6 3 16 3.4 16 4V6M19 6V14C19 15.1 18.1 16 17 16H7C5.9 16 5 15.1 5 14V6"
      stroke="#f43f5e"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M8 19V22M12 18V22M16 19V22"
      stroke="#fb7185"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="animate-pulse"
    />
  </svg>
);

export const AnimatedSparkleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} transition-all duration-300 hover:rotate-45 text-amber-400`}
  >
    <path
      d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill="rgba(251, 191, 36, 0.2)"
    />
  </svg>
);

export const AnimatedTerminalIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M6 9L10 12L6 15" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const AnimatedCheckIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="1.8" fill="rgba(16, 185, 129, 0.15)" />
    <path d="M8 12L11 15L16 9" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AnimatedAlertIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${className} animate-pulse text-amber-400`}>
    <path
      d="M12 2L2 21H22L12 2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="rgba(245, 158, 11, 0.15)"
      strokeLinejoin="round"
    />
    <line x1="12" y1="9" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="17.5" r="1" fill="currentColor" />
  </svg>
);

export const AnimatedLayersIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <polygon points="12,2 2,7 12,12 22,7" stroke="#6366f1" strokeWidth="1.8" fill="rgba(99, 102, 241, 0.2)" />
    <polyline points="2,12 12,17 22,12" stroke="#a855f7" strokeWidth="1.8" />
    <polyline points="2,17 12,22 22,17" stroke="#38bdf8" strokeWidth="1.8" />
  </svg>
);

export const AnimatedPaletteIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C13.5 22 14.5 21 14.5 19.5C14.5 18.8 14.2 18.2 13.8 17.7C13.4 17.2 13.2 16.7 13.2 16C13.2 14.6 14.3 13.5 15.7 13.5H18C20.2 13.5 22 11.7 22 9.5C22 5.4 17.5 2 12 2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="rgba(168, 85, 247, 0.15)"
    />
    <circle cx="7.5" cy="11.5" r="1.5" fill="#f43f5e" />
    <circle cx="10.5" cy="7.5" r="1.5" fill="#fbbf24" />
    <circle cx="15.5" cy="7.5" r="1.5" fill="#10b981" />
  </svg>
);

export const AnimatedSunIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${className} text-amber-400 hover:rotate-90 transition-transform duration-500`}>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" fill="rgba(251, 191, 36, 0.2)" />
    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const AnimatedMoonIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${className} text-indigo-300 hover:-rotate-12 transition-transform duration-500`}>
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(99, 102, 241, 0.15)"
    />
  </svg>
);

export const PlatformVectorIcon: React.FC<{ platform: string; className?: string }> = ({
  platform,
  className = 'w-4 h-4',
}) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="2" y="4" width="20" height="16" rx="4" stroke="currentColor" strokeWidth="1.8" />
          <polygon points="10,8 16,12 10,16" fill="currentColor" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M9 12A4 4 0 1 0 13 16V4C14.5 6 16.5 7 19 7V10C16.8 10 14.8 9.2 13 8V16A6 6 0 1 1 7 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'x':
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M4 4L10.5 13.5L4 20H6L11.5 14.5L16 20H20L13.5 10.5L19.5 4H17.5L12.5 9L8.5 4H4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="7" cy="7" r="1.5" fill="currentColor" />
          <line x1="7" y1="11" x2="7" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 18V13.5C12 12.1 13.1 11 14.5 11C15.9 11 17 12.1 17 13.5V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="11" x2="12" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'reddit':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="9" cy="13" r="1.5" fill="currentColor" />
          <circle cx="15" cy="13" r="1.5" fill="currentColor" />
          <path d="M9.5 16C10.5 17 13.5 17 14.5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="6" x2="15" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="16" cy="3" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'threads':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 8C9.5 8 8 9.8 8 12C8 14.2 9.8 16 12 16C13.8 16 15 14.8 15.5 13.5C16 11 14.5 9 12 9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'pinterest':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M10 18L12.5 9C12.5 9 13.5 7.5 15 8.5C16.5 9.5 15.5 12 14 13C12.5 14 12 16 12 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M21 3L3 10.5L9.5 13.5L17 7.5L11.5 15.5L11 21L14.5 17.5L18.5 20L21 3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'discord':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M5 8C7 5 17 5 19 8C20 12.5 18 18 16 19L14 16.5C15 16 15.5 15.5 15.5 15.5C13 17 11 17 8.5 15.5C8.5 15.5 9 16 10 16.5L8 19C6 18 4 12.5 5 8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="12" r="1.5" fill="currentColor" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      );
  }
};
