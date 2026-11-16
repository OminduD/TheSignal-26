import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Volume2, VolumeX, ShieldAlert, Activity, Compass, Gauge } from 'lucide-react';
import { DiveRef } from '../types/dive';

export interface CockpitHUDProps {
  diveRef: DiveRef;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
}

export const CockpitHUD: React.FC<CockpitHUDProps> = ({
  diveRef,
  isAudioMuted,
  onToggleAudio,
}) => {
  // DOM element refs for 60fps zero-re-render ticker updates
  const zoneBadgeRef = useRef<HTMLSpanElement>(null);
  const hullTextRef = useRef<HTMLSpanElement>(null);
  const hullBarRef = useRef<HTMLDivElement>(null);
  const hullWarningRef = useRef<HTMLSpanElement>(null);
  const o2TextRef = useRef<HTMLSpanElement>(null);
  const o2BarRef = useRef<HTMLDivElement>(null);
  const depthMetersRef = useRef<HTMLDivElement>(null);
  const pressureRef = useRef<HTMLDivElement>(null);
  const altimeterTapeRef = useRef<HTMLDivElement>(null);
  const progressPercentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastMeters = -1;
    let lastIntegrity = -1;
    let lastZone = '';

    const updateHUD = () => {
      const { depthMeters, pressureAtm, hullIntegrity, o2Reserves, zone, progress } = diveRef.current;

      // Update Depth & Pressure Telemetry
      if (depthMeters !== lastMeters) {
        if (depthMetersRef.current) {
          depthMetersRef.current.textContent = `${depthMeters.toLocaleString()}m`;
        }
        if (pressureRef.current) {
          pressureRef.current.textContent = `${pressureAtm} ATM`;
        }
        if (progressPercentRef.current) {
          progressPercentRef.current.textContent = `${(progress * 100).toFixed(1)}%`;
        }
        if (altimeterTapeRef.current) {
          // Slide ruler tape upward as depth increases
          const offset = -(progress * 180);
          altimeterTapeRef.current.style.transform = `translateY(${offset}px)`;
        }
        lastMeters = depthMeters;
      }

      // Update Zone Badge
      if (zone !== lastZone) {
        if (zoneBadgeRef.current) {
          zoneBadgeRef.current.textContent = zone;
          // Dynamic color styling for zone
          if (zone === 'EPIPELAGIC') {
            zoneBadgeRef.current.className = 'px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]';
          } else if (zone === 'MESOPELAGIC') {
            zoneBadgeRef.current.className = 'px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold bg-blue-950/80 text-blue-300 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.3)]';
          } else if (zone === 'BATHYPELAGIC') {
            zoneBadgeRef.current.className = 'px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40';
          } else if (zone === 'ABYSSAL') {
            zoneBadgeRef.current.className = 'px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
          } else {
            zoneBadgeRef.current.className = 'px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold bg-red-950/80 text-red-300 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse';
          }
        }
        lastZone = zone;
      }

      // Update Hull & O2 Bars
      if (hullIntegrity !== lastIntegrity) {
        if (hullTextRef.current) {
          hullTextRef.current.textContent = `${hullIntegrity}%`;
        }
        if (hullBarRef.current) {
          hullBarRef.current.style.width = `${hullIntegrity}%`;
          if (hullIntegrity <= 75) {
            hullBarRef.current.className = 'h-full transition-all duration-150 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
          } else if (hullIntegrity <= 90) {
            hullBarRef.current.className = 'h-full transition-all duration-150 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]';
          } else {
            hullBarRef.current.className = 'h-full transition-all duration-150 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]';
          }
        }
        if (hullWarningRef.current) {
          hullWarningRef.current.style.display = hullIntegrity <= 75 ? 'inline-flex' : 'none';
        }
        if (o2TextRef.current) {
          o2TextRef.current.textContent = `${o2Reserves}%`;
        }
        if (o2BarRef.current) {
          o2BarRef.current.style.width = `${o2Reserves}%`;
        }
        lastIntegrity = hullIntegrity;
      }
    };

    gsap.ticker.add(updateHUD);
    return () => {
      gsap.ticker.remove(updateHUD);
    };
  }, [diveRef]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden">
      {/* Cockpit Vignette Overlay (Smooth subtle cinematic rim) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_65%,rgba(1,2,4,0.65)_100%)] pointer-events-none" />

      {/* ================= TOP BAR ================= */}
      <header className="relative flex items-center justify-between px-6 py-4 border-b border-cyan-500/15 bg-slate-950/40 backdrop-blur-md">
        {/* Left: Event Wordmark */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          <div className="relative flex items-center justify-center w-7 h-7 rounded border border-cyan-400/50 bg-cyan-950/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold tracking-widest text-sm text-cyan-100">
                THE SIGNAL
              </span>
              <span className="text-[11px] font-mono text-cyan-400/80 font-medium tracking-wider">
                // 2026
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 tracking-wider">
              MARIANA TRENCH EXPEDITION DSV-09
            </div>
          </div>
        </div>

        {/* Center: Live Depth Zone Badge */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase hidden sm:inline">
            ZONE:
          </span>
          <span
            ref={zoneBadgeRef}
            className="px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            EPIPELAGIC
          </span>
        </div>

        {/* Right: Sonar Audio Toggle & System Status */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          <button
            onClick={onToggleAudio}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md border text-xs font-mono font-medium transition-all ${
              !isAudioMuted
                ? 'border-cyan-400/60 bg-cyan-950/80 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Toggle Synthesized Sonar Hydrophone Sound"
          >
            {!isAudioMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="hidden md:inline tracking-wider">HYDROPHONE: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline tracking-wider">AUDIO: MUTED</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ================= TOP-LEFT TELEMETRY HUD ================= */}
      <aside className="absolute top-20 left-6 flex flex-col space-y-3 p-3.5 rounded-lg border border-cyan-500/20 bg-slate-950/65 backdrop-blur-md max-w-[220px]">
        {/* Hull Integrity Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-400 flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-cyan-400 inline" />
              <span>HULL INTEGRITY</span>
            </span>
            <span ref={hullTextRef} className="font-semibold text-cyan-300">
              100%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50">
            <div
              ref={hullBarRef}
              className="h-full w-full bg-cyan-400 transition-all duration-150 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
            />
          </div>
          <span
            ref={hullWarningRef}
            style={{ display: 'none' }}
            className="text-[9px] font-mono text-red-400 tracking-wider font-semibold mt-1 animate-pulse"
          >
            CRUSH DEPTH STRAIN
          </span>
        </div>

        {/* O2 Reserves Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-400 flex items-center space-x-1">
              <Compass className="w-3 h-3 text-cyan-400 inline" />
              <span>O2 RESERVES</span>
            </span>
            <span ref={o2TextRef} className="font-semibold text-cyan-300">
              100%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50">
            <div
              ref={o2BarRef}
              className="h-full w-full bg-sky-400 transition-all duration-150 shadow-[0_0_6px_rgba(56,189,248,0.5)]"
            />
          </div>
        </div>

        {/* Dive Metrics */}
        <div className="pt-2 border-t border-slate-800/70 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-500">DESCENT</div>
            <div ref={progressPercentRef} className="font-semibold text-slate-200">
              0.0%
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-500">BEACON</div>
            <div className="font-semibold text-cyan-300 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              <span>LOCK 10.9k</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT-EDGE ALTIMETER RULER ================= */}
      <aside className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-3 p-3 rounded-lg border border-cyan-500/20 bg-slate-950/65 backdrop-blur-md">
        {/* Altimeter Scale Tape */}
        <div className="relative w-8 h-48 overflow-hidden border-r border-cyan-500/30 flex justify-end pr-1">
          <div
            ref={altimeterTapeRef}
            className="flex flex-col items-end space-y-3 font-mono text-[9px] text-cyan-400/60 transition-transform duration-75"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-1">
                <span className="text-[8px] text-slate-500">{i * 500}</span>
                <span className="w-2.5 h-[1px] bg-cyan-400/50 inline-block" />
              </div>
            ))}
          </div>
          {/* Central Target Reticle Indicator */}
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-3 h-[2px] bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
        </div>

        {/* Live Depth & Hydrostatic Pressure Readout */}
        <div className="flex flex-col space-y-2 font-mono">
          <div>
            <div className="flex items-center space-x-1 text-[10px] uppercase tracking-wider text-slate-400">
              <Gauge className="w-3 h-3 text-cyan-400" />
              <span>DEPTH</span>
            </div>
            <div
              ref={depthMetersRef}
              className="text-lg font-bold text-cyan-200 tracking-tight"
            >
              00,000m
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800">
            <div className="text-[9px] uppercase tracking-wider text-slate-500">PRESSURE</div>
            <div
              ref={pressureRef}
              className="text-xs font-semibold text-slate-300"
            >
              1 ATM
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
