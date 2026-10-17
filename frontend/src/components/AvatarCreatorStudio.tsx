'use client';

import React, { useState, useRef } from 'react';
import {
  ModularAvatarSVG,
  CustomAvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  AvatarSpecies,
  AvatarEyeStyle,
  AvatarAccessory,
} from './ModularAvatarSVG';
import { MascotState } from './MascotMatrix';
import {
  AnimatedPaletteIcon,
  AnimatedRocketIcon,
  AnimatedCheckIcon,
} from './AnimatedIcons';

interface AvatarCreatorStudioProps {
  onClose?: () => void;
  onSaveConfig?: (config: CustomAvatarConfig) => void;
  initialConfig?: CustomAvatarConfig;
}

const SPECIES_OPTIONS: { id: AvatarSpecies; label: string; desc: string }[] = [
  { id: 'cyber-jelly', label: 'Cyber Jelly', desc: 'Bioluminescent multi-tentacle scout' },
  { id: 'mecha-lobster', label: 'Mecha Lobster', desc: 'Armored carapace & dual cyber-claws' },
  { id: 'kitsune-fox', label: 'Kitsune Fox', desc: 'Multi-tail neon spirit fox' },
  { id: 'astra-owl', label: 'Astra Owl', desc: 'Deep-research chrono analytics core' },
  { id: 'quantum-orb', label: 'Quantum Orb', desc: 'Minimalist geometric energy sphere' },
];

const EYE_STYLES: { id: AvatarEyeStyle; label: string }[] = [
  { id: 'cyber-visor', label: 'Cyber Visor' },
  { id: 'minimal-dots', label: 'Minimal Dots' },
  { id: 'matrix-grid', label: 'Matrix Grid' },
  { id: 'anime-spark', label: 'Anime Spark' },
];

const ACCESSORIES: { id: AvatarAccessory; label: string }[] = [
  { id: 'neon-crown', label: 'Neon Crown' },
  { id: 'angel-halo', label: 'Angel Halo' },
  { id: 'hacker-headset', label: 'Hacker Headset' },
  { id: 'stealth-antenna', label: 'Stealth Antenna' },
  { id: 'none', label: 'None' },
];

const PRESET_PALETTES = [
  { primary: '#6366f1', secondary: '#a855f7', name: 'Cyber Indigo' },
  { primary: '#0ea5e9', secondary: '#10b981', name: 'Emerald Cyan' },
  { primary: '#f43f5e', secondary: '#fbbf24', name: 'Solar Flame' },
  { primary: '#8b5cf6', secondary: '#ec4899', name: 'Neon Synth' },
  { primary: '#0f172a', secondary: '#38bdf8', name: 'Stealth Void' },
];

export const AvatarCreatorStudio: React.FC<AvatarCreatorStudioProps> = ({
  onClose,
  onSaveConfig,
  initialConfig = DEFAULT_AVATAR_CONFIG,
}) => {
  const [config, setConfig] = useState<CustomAvatarConfig>(initialConfig);
  const [testState, setTestState] = useState<MascotState>('IDLE');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name.toLowerCase().replace(/\s+/g, '-')}-avatar.svg`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('SVG vector exported successfully.');
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name.toLowerCase().replace(/\s+/g, '-')}-preset.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Preset JSON configuration exported.');
  };

  const handleSave = () => {
    onSaveConfig?.(config);
    triggerToast('Avatar saved as active companion.');
    setTimeout(() => onClose?.(), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div className="w-full max-w-5xl rounded-3xl glass-panel border border-white/[0.12] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="px-7 py-5 border-b border-white/[0.08] flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <AnimatedPaletteIcon className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Parametric SVG Avatar Creator Studio
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Vector Rig • 60fps Native Shaders • Standalone Vector & JSON Exporter
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="btn-spring px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-300 font-mono"
            >
              Close
            </button>
          )}
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMsg && (
          <div className="px-6 py-2 bg-indigo-600 text-white text-xs font-mono text-center animate-bounce">
            {toastMsg}
          </div>
        )}

        {/* BODY */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto p-7 gap-7">
          {/* LEFT: LIVE PREVIEW & STATE TESTER (5 COLS) */}
          <div className="md:col-span-5 flex flex-col items-center justify-between p-6 rounded-2xl bg-black/20 border border-white/[0.06] space-y-6">
            <div className="w-full flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Vector Rig Output
              </span>
              <span className="text-[11px] font-mono text-indigo-300 font-medium">
                {testState}
              </span>
            </div>

            <div className="flex items-center justify-center p-6 bg-white/[0.02] rounded-3xl border border-white/[0.05] w-full">
              <ModularAvatarSVG
                config={config}
                runtimeState={testState}
                size={230}
                svgRef={svgRef}
              />
            </div>

            {/* RUNTIME STATE EMULATOR */}
            <div className="w-full space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Test Agent State Morphing:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['IDLE', 'THINKING', 'SYNCING', 'AWAITING_APPROVAL', 'COMPLETED', 'ERROR'] as MascotState[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTestState(st)}
                      className={`btn-spring px-2 py-1.5 rounded-lg text-[10px] font-mono text-center border transition-all ${
                        testState === st
                          ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                          : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:border-white/[0.15]'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* EXPORT ACTIONS */}
            <div className="w-full grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleExportSVG}
                className="btn-spring py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono text-slate-200"
              >
                Export .SVG
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                className="btn-spring py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono text-slate-200"
              >
                Export Preset
              </button>
            </div>
          </div>

          {/* RIGHT: PARAMETRIC RIG CONTROLS (7 COLS) */}
          <div className="md:col-span-7 space-y-5">
            {/* AVATAR CODENAME */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Avatar Identifier
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full rounded-xl bg-black/40 border border-white/[0.1] px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* SPECIES SELECTOR */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Base Species Architecture
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SPECIES_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConfig({ ...config, species: item.id })}
                    className={`btn-spring p-3 rounded-xl border text-left transition-all ${
                      config.species === item.id
                        ? 'bg-indigo-500/15 border-indigo-500 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15] text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR PALETTES */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Chromatic Aura Shaders
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        primaryColor: pal.primary,
                        secondaryColor: pal.secondary,
                      })
                    }
                    className="btn-spring px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.2] flex items-center gap-2 text-[11px] text-slate-300"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: `linear-gradient(135deg, ${pal.primary}, ${pal.secondary})` }}
                    />
                    <span>{pal.name}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">Primary Color</span>
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-full h-8 rounded-lg bg-transparent cursor-pointer border border-white/[0.1]"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">Secondary Accent</span>
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                    className="w-full h-8 rounded-lg bg-transparent cursor-pointer border border-white/[0.1]"
                  />
                </div>
              </div>
            </div>

            {/* EYE STYLE */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Eye Matrix Shaders
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EYE_STYLES.map((eye) => (
                  <button
                    key={eye.id}
                    type="button"
                    onClick={() => setConfig({ ...config, eyeStyle: eye.id })}
                    className={`btn-spring py-2 px-2.5 rounded-xl border text-center text-xs font-mono transition-all ${
                      config.eyeStyle === eye.id
                        ? 'bg-indigo-500/20 border-indigo-500 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/[0.15]'
                    }`}
                  >
                    {eye.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ACCESSORIES */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Headgear & Accessories
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACCESSORIES.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setConfig({ ...config, accessory: acc.id })}
                    className={`btn-spring py-2 px-2.5 rounded-xl border text-center text-xs font-mono transition-all ${
                      config.accessory === acc.id
                        ? 'bg-indigo-500/20 border-indigo-500 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/[0.15]'
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SAVE ACTION */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleSave}
                className="btn-spring w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.4)]"
              >
                <AnimatedCheckIcon className="w-4 h-4" />
                <span>Save & Set As Companion Avatar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
