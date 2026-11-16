import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export interface AudioToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

export const AudioToggle: React.FC<AudioToggleProps> = ({ isMuted, onToggle }) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 600);
    onToggle();
  };

  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] md:bottom-8 md:right-8 z-40 pointer-events-auto">
      <button
        onClick={handleClick}
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center cursor-pointer group focus:outline-none select-none transition-transform duration-200 active:scale-90"
        title={isMuted ? 'Unmute Hydrophone Sonar Audio' : 'Mute Hydrophone Sonar Audio'}
        aria-label="Toggle Hydrophone Audio"
      >
        {/* ================= 1. EXPANDING SONAR RIPPLE WAVES ================= */}
        {/* Continuous pulsing sonar ping when active */}
        {!isMuted && (
          <>
            <span className="absolute -inset-2 rounded-full border border-cyan-400/40 animate-ping opacity-60 pointer-events-none" />
            <span className="absolute -inset-1 rounded-full bg-cyan-400/20 blur-md animate-pulse pointer-events-none" />
          </>
        )}

        {/* Click ripple animation */}
        {clicked && (
          <span className="absolute -inset-4 rounded-full border-2 border-cyan-300 animate-ping opacity-80 pointer-events-none" />
        )}

        {/* Hover Sonar Aura Ripple */}
        <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500/0 via-cyan-400/20 to-sky-500/0 opacity-0 group-hover:opacity-100 group-hover:scale-110 blur-sm transition-all duration-500 pointer-events-none" />

        {/* ================= 2. TACTICAL RETICLE & ROTATING BEZEL ================= */}
        {/* Outer Rotating Segmented Sonar Ring */}
        <div
          className={`absolute -inset-1 rounded-full border border-dashed transition-all duration-700 pointer-events-none ${
            !isMuted
              ? 'border-cyan-400/70 animate-spin-slow'
              : 'border-slate-700/50 group-hover:border-cyan-400/60 group-hover:animate-spin-slow group-hover:scale-105'
          }`}
        />

        {/* Cardinal Hydrophone Gauge Ticks (N, S, E, W) */}
        <div className="absolute inset-0 pointer-events-none transition-transform duration-500 group-hover:rotate-45">
          <span
            className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-1 h-1 rounded-full transition-colors duration-300 ${
              !isMuted ? 'bg-cyan-300 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-600 group-hover:bg-cyan-400'
            }`}
          />
          <span
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-0.5 w-1 h-1 rounded-full transition-colors duration-300 ${
              !isMuted ? 'bg-cyan-300 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-600 group-hover:bg-cyan-400'
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 w-1 h-1 rounded-full transition-colors duration-300 ${
              !isMuted ? 'bg-cyan-300 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-600 group-hover:bg-cyan-400'
            }`}
          />
          <span
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-0.5 w-1 h-1 rounded-full transition-colors duration-300 ${
              !isMuted ? 'bg-cyan-300 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-600 group-hover:bg-cyan-400'
            }`}
          />
        </div>

        {/* ================= 3. ULTRA-MODERN OBSIDIAN GLASS POD ================= */}
        <div
          className={`relative w-full h-full rounded-full flex items-center justify-center backdrop-blur-2xl border transition-all duration-300 overflow-hidden ${
            !isMuted
              ? 'bg-gradient-to-br from-cyan-950/90 via-slate-950/95 to-sky-950/90 border-cyan-400/90 shadow-[0_0_25px_rgba(6,182,212,0.55),inset_0_0_15px_rgba(34,211,238,0.35)] group-hover:shadow-[0_0_35px_rgba(6,182,212,0.8),inset_0_0_20px_rgba(34,211,238,0.5)] group-hover:border-cyan-300'
              : 'bg-slate-950/85 border-slate-700/60 shadow-[0_4px_25px_rgba(0,0,0,0.85)] group-hover:border-cyan-400/70 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.4),inset_0_0_12px_rgba(6,182,212,0.2)] group-hover:bg-slate-900/90'
          }`}
        >
          {/* Submersible Caustic Specular Glare (Glass Reflection) */}
          <div className="absolute inset-x-1 top-1 h-1/2 rounded-t-full bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none group-hover:from-white/30 transition-all duration-300" />

          {/* Radial Center Glow */}
          <div
            className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
              !isMuted
                ? 'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.25)_0%,transparent_70%)]'
                : 'opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.2)_0%,transparent_70%)]'
            }`}
          />

          {/* ================= 4. DYNAMIC ICON DISPLAY ================= */}
          {!isMuted ? (
            <div className="relative flex items-center justify-center">
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200 group-hover:text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] transition-all duration-300 group-hover:scale-110" />
              {/* Active Sonar Ping Dot */}
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-200 shadow-[0_0_8px_#22d3ee]" />
              </span>
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-cyan-200 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.7)] transition-all duration-300 group-hover:scale-110" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
};
