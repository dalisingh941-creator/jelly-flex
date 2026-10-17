'use client';

import React, { useId } from 'react';
import { MascotState } from './MascotMatrix';

export type AvatarSpecies =
  | 'cyber-jelly'
  | 'mecha-lobster'
  | 'kitsune-fox'
  | 'astra-owl'
  | 'quantum-orb';

export type AvatarEyeStyle = 'minimal-dots' | 'cyber-visor' | 'matrix-grid' | 'anime-spark';

export type AvatarAccessory = 'none' | 'neon-crown' | 'hacker-headset' | 'angel-halo' | 'stealth-antenna';

export interface CustomAvatarConfig {
  name: string;
  species: AvatarSpecies;
  primaryColor: string;
  secondaryColor: string;
  eyeStyle: AvatarEyeStyle;
  accessory: AvatarAccessory;
  orbitRing: boolean;
}

export const DEFAULT_AVATAR_CONFIG: CustomAvatarConfig = {
  name: 'Nova-Jelly',
  species: 'cyber-jelly',
  primaryColor: '#6366f1',
  secondaryColor: '#a855f7',
  eyeStyle: 'cyber-visor',
  accessory: 'neon-crown',
  orbitRing: true,
};

interface ModularAvatarSVGProps {
  config: CustomAvatarConfig;
  runtimeState?: MascotState;
  size?: number;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  className?: string;
}

export const ModularAvatarSVG: React.FC<ModularAvatarSVGProps> = ({
  config,
  runtimeState = 'IDLE',
  size = 200,
  svgRef,
  className = '',
}) => {
  const uid = useId();
  const glowFilterId = `avatar-glow-${uid}`;
  const bodyGradId = `avatar-grad-${uid}`;

  // Override color during alerts
  const activePrimary =
    runtimeState === 'AWAITING_APPROVAL'
      ? '#f59e0b'
      : runtimeState === 'ERROR'
      ? '#ef4444'
      : runtimeState === 'COMPLETED'
      ? '#10b981'
      : config.primaryColor;

  const activeSecondary =
    runtimeState === 'THINKING'
      ? '#d8b4fe'
      : runtimeState === 'SYNCING'
      ? '#60a5fa'
      : config.secondaryColor;

  const renderBodyGeometry = () => {
    switch (config.species) {
      case 'mecha-lobster':
        return (
          <g>
            {/* Claws */}
            <path
              d="M45 95 C 20 75, 25 45, 50 55 C 40 70, 45 80, 60 85 Z"
              fill={activeSecondary}
              opacity="0.9"
            />
            <path
              d="M155 95 C 180 75, 175 45, 150 55 C 160 70, 155 80, 140 85 Z"
              fill={activeSecondary}
              opacity="0.9"
            />
            {/* Carapace */}
            <path
              d="M55 85 C 55 38, 145 38, 145 85 C 145 112, 125 125, 100 125 C 75 125, 55 112, 55 85 Z"
              fill={`url(#${bodyGradId})`}
              filter={`url(#${glowFilterId})`}
            />
          </g>
        );

      case 'kitsune-fox':
        return (
          <g>
            {/* Ears */}
            <polygon points="55,75 45,28 82,52" fill={activeSecondary} />
            <polygon points="145,75 155,28 118,52" fill={activeSecondary} />
            {/* Head */}
            <path
              d="M52 75 C 52 45, 148 45, 148 75 C 148 105, 122 122, 100 126 C 78 122, 52 105, 52 75 Z"
              fill={`url(#${bodyGradId})`}
              filter={`url(#${glowFilterId})`}
            />
          </g>
        );

      case 'astra-owl':
        return (
          <g>
            <path
              d="M52 82 C 48 40, 152 40, 148 82 C 148 115, 125 125, 100 125 C 75 125, 52 115, 52 82 Z"
              fill={`url(#${bodyGradId})`}
              filter={`url(#${glowFilterId})`}
            />
            <polygon points="95,84 105,84 100,95" fill="#fbbf24" />
          </g>
        );

      case 'quantum-orb':
        return (
          <g>
            <circle
              cx="100"
              cy="82"
              r="44"
              fill={`url(#${bodyGradId})`}
              filter={`url(#${glowFilterId})`}
            />
            <circle cx="100" cy="82" r="32" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
          </g>
        );

      case 'cyber-jelly':
      default:
        return (
          <g>
            <path
              d="M50 95 C 50 42, 150 42, 150 95 C 150 114, 135 114, 120 108 C 105 102, 95 102, 80 108 C 65 114, 50 114, 50 95 Z"
              fill={`url(#${bodyGradId})`}
              filter={`url(#${glowFilterId})`}
            />
            <path
              d="M60 82 C 65 52, 135 52, 140 82"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
    }
  };

  const renderEyeStyle = () => {
    switch (config.eyeStyle) {
      case 'cyber-visor':
        return (
          <g>
            <rect x="70" y="74" width="60" height="12" rx="6" fill="#0b101d" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <rect x="74" y="77" width="52" height="6" rx="3" fill="#38bdf8" className="animate-pulse" />
          </g>
        );
      case 'matrix-grid':
        return (
          <g>
            <rect x="80" y="76" width="12" height="12" rx="2" fill="#10b981" />
            <rect x="108" y="76" width="12" height="12" rx="2" fill="#10b981" />
          </g>
        );
      case 'anime-spark':
        return (
          <g>
            <ellipse cx="85" cy="80" rx="7" ry="9" fill="#ffffff" />
            <circle cx="87" cy="77" r="3" fill="#a855f7" />
            <ellipse cx="115" cy="80" rx="7" ry="9" fill="#ffffff" />
            <circle cx="117" cy="77" r="3" fill="#a855f7" />
          </g>
        );
      case 'minimal-dots':
      default:
        return (
          <g>
            <circle cx="85" cy="80" r="4.5" fill="#ffffff" />
            <circle cx="115" cy="80" r="4.5" fill="#ffffff" />
          </g>
        );
    }
  };

  const renderAccessory = () => {
    switch (config.accessory) {
      case 'neon-crown':
        return (
          <polygon
            points="75,44 87,24 100,38 113,24 125,44"
            fill="#fbbf24"
            stroke="#f59e0b"
            strokeWidth="1.5"
            className="animate-float-slow"
          />
        );
      case 'angel-halo':
        return (
          <ellipse
            cx="100"
            cy="28"
            rx="32"
            ry="7"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            className="animate-pulse"
          />
        );
      case 'hacker-headset':
        return (
          <g>
            <path d="M46 80 A 54 54 0 0 1 154 80" fill="none" stroke="#64748b" strokeWidth="4" />
            <rect x="42" y="74" width="10" height="20" rx="4" fill="#38bdf8" />
            <rect x="148" y="74" width="10" height="20" rx="4" fill="#38bdf8" />
          </g>
        );
      case 'stealth-antenna':
        return (
          <g>
            <line x1="100" y1="44" x2="100" y2="18" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="100" cy="16" r="4" fill="#f43f5e" className="animate-ping" style={{ animationDuration: '1.8s' }} />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 hover:scale-105`}
    >
      <defs>
        <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id={bodyGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={activePrimary} />
          <stop offset="100%" stopColor={activeSecondary} />
        </linearGradient>
      </defs>

      {/* Orbital Ring Layer */}
      {config.orbitRing && (
        <circle
          cx="100"
          cy="95"
          r="72"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          className="animate-spin"
          style={{ animationDuration: '16s' }}
        />
      )}

      {/* Lower Appendages */}
      <g opacity="0.8">
        <path d="M75 110 C 65 135, 60 155, 72 175" stroke={activeSecondary} strokeWidth="3" strokeLinecap="round" />
        <path d="M90 115 C 85 145, 95 165, 90 185" stroke={activeSecondary} strokeWidth="3" strokeLinecap="round" />
        <path d="M110 115 C 115 145, 105 165, 110 185" stroke={activeSecondary} strokeWidth="3" strokeLinecap="round" />
        <path d="M125 110 C 135 135, 140 155, 128 175" stroke={activeSecondary} strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Body Geometry */}
      {renderBodyGeometry()}

      {/* Accessory Layer */}
      {renderAccessory()}

      {/* Eye Matrix */}
      {renderEyeStyle()}
    </svg>
  );
};
