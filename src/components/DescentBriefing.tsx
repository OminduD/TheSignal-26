import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Clock, Trophy, Users, AlertTriangle } from 'lucide-react';
import { DiveRef } from '../types/dive';

export const DescentBriefing: React.FC<{ diveRef: DiveRef }> = ({ diveRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTicker = () => {
      if (!containerRef.current) return;
      const p = diveRef.current.progress;

      // Active between 20% and 38% scroll
      if (p < 0.19) {
        containerRef.current.style.opacity = '0';
        containerRef.current.style.pointerEvents = 'none';
      } else if (p >= 0.19 && p <= 0.24) {
        // Fade in
        const t = (p - 0.19) / 0.05;
        containerRef.current.style.opacity = `${t}`;
        containerRef.current.style.transform = `translateY(${(1 - t) * 30}px)`;
        containerRef.current.style.pointerEvents = 'auto';
      } else if (p > 0.24 && p <= 0.35) {
        // Fully visible
        containerRef.current.style.opacity = '1';
        containerRef.current.style.transform = 'translateY(0px)';
        containerRef.current.style.pointerEvents = 'auto';
      } else if (p > 0.35 && p <= 0.40) {
        // Fade out
        const t = (p - 0.35) / 0.05;
        containerRef.current.style.opacity = `${1 - t}`;
        containerRef.current.style.transform = `translateY(${-t * 30}px)`;
        containerRef.current.style.pointerEvents = 'none';
      } else {
        containerRef.current.style.opacity = '0';
        containerRef.current.style.pointerEvents = 'none';
      }
    };

    gsap.ticker.add(handleTicker);
    return () => gsap.ticker.remove(handleTicker);
  }, [diveRef]);

  return (
    <section
      ref={containerRef}
      className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-20 max-w-5xl z-20 pointer-events-none transition-opacity duration-75"
    >
      {/* Chapter Tag */}
      <div className="flex items-center space-x-2 px-3 py-1 rounded border border-cyan-400/30 bg-cyan-950/40 backdrop-blur-md mb-4 text-[11px] font-mono text-cyan-300 tracking-widest uppercase">
        <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
        <span>CHAPTER 02 // MESOPELAGIC DESCENT</span>
      </div>

      {/* Masked Upward Line Reveal Typography Headline */}
      <h2 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight uppercase mb-4 leading-tight">
        MISSION <span className="text-cyan-400">PARAMETERS</span>
      </h2>

      <p className="font-sans text-base sm:text-lg text-slate-300 max-w-2xl font-light leading-relaxed mb-8">
        Assemble your crew. Decode the abyss. Four hundred operatives will plunge into 48 hours of
        uninterrupted algorithmic creation to intercept, parse, and harness the pulse before the Trench seals.
      </p>

      {/* 3 Translucent Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        {/* Card 1: 48 Hours */}
        <div className="group relative p-5 rounded-xl border border-cyan-500/20 bg-slate-950/65 backdrop-blur-md hover:border-cyan-400/50 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-3 text-cyan-400">
            <Clock className="w-5 h-5 text-cyan-300" />
            <span className="text-[10px] font-mono tracking-widest text-slate-400">TIMELINE</span>
          </div>
          <div className="text-3xl font-display font-bold text-white mb-1">
            48 HOURS
          </div>
          <p className="text-xs font-mono text-slate-400 leading-normal">
            Non-stop collaborative build cycle from initial dive to surface demo.
          </p>
        </div>

        {/* Card 2: $25,000 Bounty Pool */}
        <div className="group relative p-5 rounded-xl border border-cyan-500/20 bg-slate-950/65 backdrop-blur-md hover:border-cyan-400/50 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-3 text-cyan-400">
            <Trophy className="w-5 h-5 text-cyan-300" />
            <span className="text-[10px] font-mono tracking-widest text-slate-400">BOUNTY</span>
          </div>
          <div className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-400 mb-1">
            $25,000
          </div>
          <p className="text-xs font-mono text-slate-400 leading-normal">
            Bounty pool distributed across four primary technical vectors.
          </p>
        </div>

        {/* Card 3: 400 Operatives */}
        <div className="group relative p-5 rounded-xl border border-cyan-500/20 bg-slate-950/65 backdrop-blur-md hover:border-cyan-400/50 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-3 text-cyan-400">
            <Users className="w-5 h-5 text-cyan-300" />
            <span className="text-[10px] font-mono tracking-widest text-slate-400">SLOTS</span>
          </div>
          <div className="text-3xl font-display font-bold text-white mb-1">
            400 CREW
          </div>
          <p className="text-xs font-mono text-slate-400 leading-normal">
            Vetted engineers, researchers, and system designers globally.
          </p>
        </div>
      </div>
    </section>
  );
};
