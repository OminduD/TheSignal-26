import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ChevronDown, Radio, Shield, Terminal } from 'lucide-react';
import { DiveRef } from '../types/dive';

export const SurfaceHero: React.FC<{ diveRef: DiveRef }> = ({ diveRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTicker = () => {
      if (!containerRef.current) return;
      const p = diveRef.current.progress;
      // Active between 0% and 18% scroll
      if (p <= 0.13) {
        const t = p / 0.13;
        containerRef.current.style.opacity = '1';
        containerRef.current.style.transform = `translateY(${-t * 40}px)`;
        containerRef.current.style.pointerEvents = 'auto';
      } else if (p < 0.19) {
        const t = (p - 0.13) / 0.06;
        containerRef.current.style.opacity = `${1 - t}`;
        containerRef.current.style.transform = `translateY(${-40 - t * 40}px)`;
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
      className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-20 max-w-5xl z-20 transition-opacity duration-75"
    >
      {/* Top Protocol Tag */}
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 backdrop-blur-md mb-6">
        <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="text-xs font-mono tracking-widest text-cyan-200 uppercase font-semibold">
          DEEP-SEA EXPEDITION PROTOCOL // 2026
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-extrabold tracking-tight text-white uppercase leading-[0.95] mb-6">
        THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 drop-shadow-[0_0_35px_rgba(34,211,238,0.4)]">SIGNAL</span>
      </h1>

      {/* Story Narrative Dispatch Copy */}
      <div className="relative pl-5 border-l-2 border-cyan-400/60 max-w-2xl mb-8 space-y-2">
        <p className="font-mono text-xs text-cyan-400/90 tracking-wider">
          04:12 UTC // MARIANA TRENCH HYDROPHONE ARRAY
        </p>
        <p className="font-sans text-base sm:text-lg text-slate-200 font-normal leading-relaxed">
          An unidentifiable rhythmic pulse breached the abyssal floor. Unmanned probes went dark at 3,000 meters.
          We are sending you down.
        </p>
      </div>

      {/* Dispatch Metadata Cards */}
      <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-300 mb-10">
        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>COORDINATES: <strong className="text-white">11°21′N 142°12′E</strong></span>
        </div>
        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>VESSEL: <strong className="text-white">DSV-09 DEEP FLIGHT</strong></span>
        </div>
      </div>

      {/* Sonar Scroll Dive Indicator */}
      <div className="flex items-center space-x-3 text-cyan-300/80 font-mono text-xs">
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-cyan-400/40 bg-cyan-950/40 animate-bounce">
          <ChevronDown className="w-4 h-4 text-cyan-300" />
        </div>
        <div className="tracking-widest uppercase text-[11px] font-semibold text-cyan-200">
          INITIATE DESCENT // SCROLL DOWN TO DIVE
        </div>
      </div>
    </section>
  );
};
