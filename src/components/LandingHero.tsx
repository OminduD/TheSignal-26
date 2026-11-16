import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { DiveRef } from '../types/dive';
import { ChevronDown } from 'lucide-react';

export interface LandingHeroProps {
  diveRef: DiveRef;
  onScrollTo?: (percent: number) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ diveRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainTopicRef = useRef<HTMLDivElement>(null);
  const subTopicRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smootherstep (zero velocity at endpoints for natural underwater fluid inertia)
    const smootherstep = (min: number, max: number, value: number) => {
      const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
      return x * x * x * (x * (x * 6 - 15) + 10);
    };

    const handleTicker = () => {
      if (!containerRef.current) return;
      const p = diveRef.current.progress;

      // Active between 0% and 18% scroll
      if (p <= 0.03) {
        // Pristine surface state
        containerRef.current.style.opacity = '1';
        containerRef.current.style.visibility = 'visible';

        if (mainTopicRef.current) {
          mainTopicRef.current.style.transform = 'translate3d(0, 0px, 0) scale(1)';
          mainTopicRef.current.style.opacity = '1';
          mainTopicRef.current.style.filter = 'none';
        }

        if (subTopicRef.current) {
          subTopicRef.current.style.transform = 'translate3d(0, 0px, 0)';
          subTopicRef.current.style.opacity = '1';
          subTopicRef.current.style.filter = 'none';
        }

        if (scrollHintRef.current) {
          scrollHintRef.current.style.opacity = '1';
        }
      } else if (p < 0.18) {
        // EXITING ANIMATION: Soft water defocus blur, gentle drift, and fluid fade
        const t = smootherstep(0.03, 0.18, p);
        containerRef.current.style.visibility = 'visible';

        if (mainTopicRef.current) {
          const transY = -t * 35;
          const scale = 1 - t * 0.04;
          const blur = t * 8;
          mainTopicRef.current.style.transform = `translate3d(0, ${transY}px, 0) scale(${scale})`;
          mainTopicRef.current.style.opacity = `${Math.max(0, 1 - t * 1.08)}`;
          mainTopicRef.current.style.filter = `blur(${blur}px)`;
        }

        if (subTopicRef.current) {
          const transY = -t * 30;
          const blur = t * 7;
          subTopicRef.current.style.transform = `translate3d(0, ${transY}px, 0)`;
          subTopicRef.current.style.opacity = `${Math.max(0, 1 - t * 1.08)}`;
          subTopicRef.current.style.filter = `blur(${blur}px)`;
        }

        if (scrollHintRef.current) {
          scrollHintRef.current.style.opacity = `${Math.max(0, 1 - t * 1.8)}`;
        }
      } else {
        containerRef.current.style.visibility = 'hidden';
        if (mainTopicRef.current) {
          mainTopicRef.current.style.opacity = '0';
          mainTopicRef.current.style.filter = 'none';
        }
        if (subTopicRef.current) {
          subTopicRef.current.style.opacity = '0';
          subTopicRef.current.style.filter = 'none';
        }
        if (scrollHintRef.current) {
          scrollHintRef.current.style.opacity = '0';
        }
      }
    };

    gsap.ticker.add(handleTicker);
    return () => gsap.ticker.remove(handleTicker);
  }, [diveRef]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-20 pointer-events-none select-none overflow-hidden"
    >
      {/* ================= LEFT-BOTTOM: COLOSSAL ARCHIVO BLACK MAIN TOPIC ================= */}
      <div
        ref={mainTopicRef}
        className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-5 sm:left-10 md:left-12 lg:left-14 max-w-[90vw] sm:max-w-3xl lg:max-w-4xl select-none will-change-transform"
      >
        <h1
          style={{ fontFamily: '"Archivo Black", sans-serif' }}
          className="text-[clamp(4.25rem,18.5vw,7.5rem)] sm:text-7xl md:text-8xl lg:text-[9.5rem] xl:text-[11rem] 2xl:text-[12.5rem] tracking-tight uppercase text-white drop-shadow-[0_10px_50px_rgba(0,0,0,0.95)] leading-[0.82] select-none"
        >
          INTO<br />THE<br />ABYSS
        </h1>

        {/* Mobile-only subtle scroll hint */}
        <div
          ref={scrollHintRef}
          className="flex sm:hidden items-center space-x-1.5 mt-3.5 text-cyan-400/90 font-mono text-[11px] uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
        >
          <span>Scroll to Dive</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </div>

      {/* ================= RIGHT SIDE: SUB TOPIC & TACTICAL LOCATION TELEMETRY ================= */}
      <div
        ref={subTopicRef}
        className="absolute top-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:top-48 md:top-52 lg:top-56 right-4 sm:right-12 md:right-20 max-w-[270px] sm:max-w-sm md:max-w-md text-right will-change-transform"
      >
        <div className="relative pr-3 sm:pr-4 border-r-2 border-cyan-400/80">
          <p
            style={{ fontFamily: 'Arimo, sans-serif' }}
            className="text-xs sm:text-base md:text-lg font-medium text-cyan-50 leading-relaxed drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]"
          >
            An inter-university deep-tech hackathon engineered by the IEEE Computer Society of UCSC.
          </p>

          {/* Tactical Submersible Dispatch & Location Telemetry HUD */}
          <div className="mt-3.5 sm:mt-4 flex flex-col items-end space-y-1.5 font-mono select-none">
            {/* Cyber Telemetry Bracket with Live Pulsing Radar Beacon */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded border border-cyan-400/60 bg-cyan-950/40 backdrop-blur-md text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              {/* Pulsing Sonar Beacon */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-90" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />
              </span>
              <span className="text-[9.5px] sm:text-[11px] tracking-widest uppercase text-cyan-400/80 font-bold">
                LOCATION //
              </span>
              <span className="text-[11px] sm:text-[12.5px] tracking-widest font-extrabold text-white uppercase drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                100% ONLINE
              </span>
            </div>

            {/* Sub-telemetry readout */}
            <div className="flex items-center space-x-2 text-[9px] sm:text-[10px] tracking-widest text-cyan-300/70 uppercase">
              <span className="text-cyan-400/40">[</span>
              <span>VIRTUAL ARENA</span>
              <span className="text-cyan-500">•</span>
              <span>36H SPRINT</span>
              <span className="text-cyan-400/40">]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
