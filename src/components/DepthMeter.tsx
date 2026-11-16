import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { DiveRef } from "../types/dive";

export interface DepthMeterProps {
  diveRef: DiveRef;
}

const RULER_HEIGHT = 200; // Modern compact instrument height in pixels

// Depth intervals marked directly along the bar
const TICKS = [
  { label: "0M", frac: 0, major: true },
  { label: "", frac: 1000 / 10994, major: false },
  { label: "2K", frac: 2000 / 10994, major: true },
  { label: "", frac: 3000 / 10994, major: false },
  { label: "4K", frac: 4000 / 10994, major: true },
  { label: "", frac: 5000 / 10994, major: false },
  { label: "6K", frac: 6000 / 10994, major: true },
  { label: "", frac: 7000 / 10994, major: false },
  { label: "8K", frac: 8000 / 10994, major: true },
  { label: "", frac: 9000 / 10994, major: false },
  { label: "10K", frac: 10000 / 10994, major: true },
  { label: "11K", frac: 1.0, major: true },
];

export const DepthMeter: React.FC<DepthMeterProps> = ({ diveRef }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const fillLineRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const updateMeter = () => {
      const { progress } = diveRef.current;
      const clampedP = Math.min(1, Math.max(0, progress));
      const yOffset = clampedP * RULER_HEIGHT;

      // GPU hardware transform for pointer tracking
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      }

      // Live illuminated depth fill bar
      if (fillLineRef.current) {
        fillLineRef.current.style.height = `${yOffset}px`;
      }

      // Dynamically highlight numbers marked on the bar as the pointer descends
      TICKS.forEach((tick, i) => {
        const el = tickRefs.current[i];
        if (el) {
          if (clampedP >= tick.frac) {
            el.style.color = "#a5f3fc"; // Bright cyan-200
            el.style.opacity = "1";
          } else {
            el.style.color = "rgba(103, 232, 249, 0.45)"; // Dim cyan-300
            el.style.opacity = "0.6";
          }
        }
      });
    };

    gsap.ticker.add(updateMeter);
    return () => gsap.ticker.remove(updateMeter);
  }, [diveRef]);

  return (
    <aside
      aria-label="Ocean Depth Telemetry Bar"
      className="fixed right-1.5 sm:right-5 top-1/2 -translate-y-1/2 z-30 pointer-events-none select-none flex items-center bg-transparent border-none shadow-none"
    >
      {/* ================= MODERN MINIMALIST DEPTH BAR ================= */}
      <div className="relative w-10 sm:w-14 h-[200px] flex justify-end">
        {/* Background Track Guide Line */}
        <div className="absolute right-0 top-0 bottom-0 w-[1.5px] bg-cyan-400/20 rounded-full" />

        {/* Active Depth Progress Fill Line */}
        <div
          ref={fillLineRef}
          className="absolute right-0 top-0 w-[2px] bg-gradient-to-b from-cyan-400 via-sky-300 to-white shadow-[0_0_10px_#22d3ee] rounded-full transition-all duration-75"
          style={{ height: "0px" }}
        />

        {/* Numbers & Precision Ticks Marked Along the Bar */}
        {TICKS.map((tick, i) => (
          <div
            key={i}
            className="absolute right-0 flex items-center font-mono -translate-y-1/2 pr-0.5"
            style={{ top: `${tick.frac * 100}%` }}
          >
            {tick.major ? (
              <>
                <span
                  ref={(el) => (tickRefs.current[i] = el)}
                  style={{ fontFamily: '"Quantico", monospace' }}
                  className="text-[7.5px] sm:text-[9.5px] font-bold tracking-wider mr-1 sm:mr-1.5 transition-colors duration-150"
                >
                  {tick.label}
                </span>
                <span className="w-2 sm:w-2.5 h-[1.5px] bg-cyan-400/60 inline-block rounded-l-sm" />
              </>
            ) : (
              <span className="w-1 sm:w-1.5 h-[1px] bg-cyan-400/25 inline-block mr-0.5" />
            )}
          </div>
        ))}

        {/* Dynamic Pointer (Goes down on scroll - Numbers ONLY on bar, NOT on pointer) */}
        <div
          ref={cursorRef}
          className="absolute right-0 top-0 flex items-center -translate-y-1/2 will-change-transform translate-x-[3px]"
          style={{ transform: "translate3d(0, 0px, 0)" }}
        >
          {/* Futuristic Glowing Pointer Pip */}
          <div className="relative flex items-center justify-center">
            {/* Outer pulse aura */}
            <span className="animate-ping absolute inline-flex h-3 sm:h-3.5 w-3 sm:w-3.5 rounded-full bg-cyan-400 opacity-60" />
            {/* Glow halo */}
            <span className="absolute inline-flex h-3.5 sm:h-4 w-3.5 sm:w-4 rounded-full bg-cyan-400/40 blur-[2px]" />
            {/* Crisp center pip */}
            <span className="relative inline-flex rounded-full h-1.5 sm:h-2 w-1.5 sm:w-2 bg-white shadow-[0_0_8px_#ffffff,0_0_14px_#22d3ee] border border-cyan-300" />
          </div>
        </div>
      </div>
    </aside>
  );
};
