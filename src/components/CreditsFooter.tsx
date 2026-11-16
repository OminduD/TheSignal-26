import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { DiveRef } from '../types/dive';

export interface CreditsFooterProps {
  diveRef: DiveRef;
}

export const CreditsFooter: React.FC<CreditsFooterProps> = ({ diveRef }) => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateVisibility = () => {
      if (!footerRef.current) return;
      const p = diveRef.current.progress;

      // Only shows after website reaches near the seabed bottom (progress >= 88%)
      if (p >= 0.88) {
        const opacity = Math.min(1, Math.max(0, (p - 0.88) / 0.08));
        footerRef.current.style.opacity = `${opacity}`;
        footerRef.current.style.visibility = 'visible';
        footerRef.current.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
        footerRef.current.style.transform = `translate3d(0, ${(1 - opacity) * 8}px, 0)`;
      } else {
        footerRef.current.style.opacity = '0';
        footerRef.current.style.visibility = 'hidden';
        footerRef.current.style.pointerEvents = 'none';
      }
    };

    gsap.ticker.add(updateVisibility);
    return () => gsap.ticker.remove(updateVisibility);
  }, [diveRef]);

  return (
    <footer
      ref={footerRef}
      aria-label="Site and 3D Asset Credits"
      className="fixed bottom-[max(0.85rem,env(safe-area-inset-bottom))] sm:bottom-4 md:bottom-6 left-5 sm:left-10 md:left-16 max-w-[calc(100vw-5rem)] z-30 select-none opacity-0 invisible pointer-events-none transition-transform will-change-transform bg-transparent border-none shadow-none"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 font-mono text-[10px] sm:text-[11px] text-slate-400/90 tracking-wide">
        {/* Created by OminduD */}
        <a
          href="https://omindu.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 text-slate-300 hover:text-cyan-300 transition-colors group cursor-pointer pointer-events-auto"
          title="Visit omindu.dev"
        >
          <img
            src="./images/logo-white.webp"
            alt="OminduD Logo"
            className="w-3.5 h-3.5 object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
          />
          <span>
            Created by <span className="font-semibold text-white group-hover:text-cyan-200">OminduD</span>
          </span>
        </a>

        {/* Minimal separator */}
        <span className="hidden sm:inline text-slate-500">//</span>

        {/* 3D Submarine Asset Attribution */}
        <div className="flex items-center space-x-1.5 text-[9.5px] sm:text-[10px] text-slate-400 pointer-events-auto">
          <a
            href="https://skfb.ly/66Cno"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-cyan-300 underline underline-offset-2 decoration-slate-600 hover:decoration-cyan-400 transition-colors cursor-pointer"
            title="Submarine on Sketchfab by Coder123123"
          >
            "Submarine"
          </a>
          <span>by</span>
          <span className="text-slate-300">Coder123123</span>
          <a
            href="http://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-300 text-[8.5px] sm:text-[9px] cursor-pointer"
            title="Creative Commons Attribution 4.0 International"
          >
            (CC BY 4.0)
          </a>
        </div>
      </div>
    </footer>
  );
};
