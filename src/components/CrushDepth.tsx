import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AlertOctagon, Flame, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';
import { DiveRef } from '../types/dive';

export const CrushDepth: React.FC<{ diveRef: DiveRef }> = ({ diveRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flashlightRef = useRef<HTMLDivElement>(null);
  const [flashlightPos, setFlashlightPos] = useState({ x: 400, y: 300 });
  const hasUserMovedRef = useRef(false);

  useEffect(() => {
    // 1. Zero-re-render Ticker Visibility (64% to 82% scroll)
    const handleTicker = () => {
      if (!containerRef.current) return;
      const p = diveRef.current.progress;

      if (p < 0.62) {
        containerRef.current.style.opacity = '0';
        containerRef.current.style.pointerEvents = 'none';
      } else if (p >= 0.62 && p <= 0.67) {
        const t = (p - 0.62) / 0.05;
        containerRef.current.style.opacity = `${t}`;
        containerRef.current.style.transform = `translateY(${(1 - t) * 30}px)`;
        containerRef.current.style.pointerEvents = 'auto';
      } else if (p > 0.67 && p <= 0.79) {
        containerRef.current.style.opacity = '1';
        containerRef.current.style.transform = 'translateY(0px)';
        containerRef.current.style.pointerEvents = 'auto';
      } else if (p > 0.79 && p <= 0.84) {
        const t = (p - 0.79) / 0.05;
        containerRef.current.style.opacity = `${1 - t}`;
        containerRef.current.style.transform = `translateY(${-t * 30}px)`;
        containerRef.current.style.pointerEvents = 'none';
      } else {
        containerRef.current.style.opacity = '0';
        containerRef.current.style.pointerEvents = 'none';
      }

      // Automatic sine-wave sweep fallback if mouse hasn't moved
      if (!hasUserMovedRef.current && flashlightRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const time = performance.now() * 0.001;
        const autoX = rect.width * 0.5 + Math.sin(time * 0.9) * (rect.width * 0.35);
        const autoY = rect.height * 0.5 + Math.cos(time * 0.7) * (rect.height * 0.25);
        flashlightRef.current.style.background = `radial-gradient(circle 320px at ${autoX}px ${autoY}px, rgba(34,211,238,0.18) 0%, rgba(6,182,212,0.05) 50%, rgba(2,6,18,0.55) 80%, rgba(2,6,18,0.78) 100%)`;
      }
    };

    gsap.ticker.add(handleTicker);
    return () => gsap.ticker.remove(handleTicker);
  }, [diveRef]);

  // Mouse flashlight tracking
  useEffect(() => {
    const handlePointer = (e: MouseEvent) => {
      if (!containerRef.current || !flashlightRef.current) return;
      hasUserMovedRef.current = true;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setFlashlightPos({ x, y });
      flashlightRef.current.style.background = `radial-gradient(circle 320px at ${x}px ${y}px, rgba(34,211,238,0.2) 0%, rgba(6,182,212,0.06) 50%, rgba(2,6,18,0.55) 80%, rgba(2,6,18,0.78) 100%)`;
    };

    window.addEventListener('mousemove', handlePointer, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointer);
  }, []);

  const scheduleEvents = [
    {
      time: 'T+00:00',
      title: 'DIVE COMMENCES',
      desc: 'Signal vectors decrypted. Codebases initialized. Operatives plunge into the abyss.',
      tag: 'TRANSMISSION LIVE',
    },
    {
      time: 'T+12:00',
      title: 'PRESSURE CHECK',
      desc: 'First architectural check-in. Hydrophone AMA with deep-sea technical mentors.',
      tag: 'TELEMETRY SYNC',
    },
    {
      time: 'T+36:00',
      title: 'CODE FREEZE',
      desc: 'Repositories locked. Automated stress testing under simulated Hadal network corruption.',
      tag: 'ABYSSAL FREEZE',
    },
    {
      time: 'T+48:00',
      title: 'SURFACE & DEMO',
      desc: 'Submersibles surface. Live worldwide demo to the Grand Admiralty and prize allocation.',
      tag: 'EXTRACTION COMPLETE',
    },
  ];

  return (
    <section
      ref={containerRef}
      className="absolute inset-0 flex flex-col justify-center items-center px-6 md:px-16 z-20 pointer-events-none transition-opacity duration-75 overflow-hidden"
    >
      {/* Dynamic Radial Flashlight Mask Layer (Translucent so 3D submarine stays visible) */}
      <div
        ref={flashlightRef}
        className="absolute inset-0 pointer-events-none transition-[background] duration-75 z-10"
        style={{
          background: `radial-gradient(circle 320px at ${flashlightPos.x}px ${flashlightPos.y}px, rgba(34,211,238,0.2) 0%, rgba(6,182,212,0.06) 50%, rgba(2,6,18,0.55) 80%, rgba(2,6,18,0.78) 100%)`,
        }}
      />

      <div className="relative z-20 max-w-5xl w-full pointer-events-auto py-12">
        {/* Crush Depth Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border border-red-500/40 bg-red-950/60 backdrop-blur-md text-[11px] font-mono text-red-300 tracking-widest uppercase mb-3 animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>CRUSH DEPTH THRESHOLD // 6,000M - 8,500M</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight uppercase mb-2">
            MISSION <span className="text-cyan-400">CHRONOLOGY</span>
          </h2>
          <p className="font-mono text-xs sm:text-sm text-cyan-300/80 max-w-lg">
            MOVE YOUR RETICLE TO ILLUMINATE THE ABYSSAL SCHEDULE & EXPEDITION CODEX
          </p>
        </div>

        {/* 48-Hour Event Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {scheduleEvents.map((evt, idx) => (
            <div
              key={idx}
              className="relative p-5 rounded-xl border border-cyan-500/25 bg-slate-950/70 backdrop-blur-md hover:border-cyan-400/60 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-base font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors">
                  {evt.time}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                  {evt.tag}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-1">
                {evt.title}
              </h3>
              <p className="font-sans text-xs text-slate-300 leading-relaxed">
                {evt.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Rules & Protocol Codex */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>CREW SIZE: <strong>1 - 4 OPERATIVES</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>IP OWNERSHIP: <strong>100% BUILDER OWNED</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>VERIFICATION: <strong>PUBLIC REPOSITORY + DEMO</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>CRUSH PROTOCOL: <strong>ZERO UNTESTED COMMITS</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
};
