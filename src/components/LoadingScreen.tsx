import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useProgress } from '@react-three/drei';
import { SignalLogo } from './SignalLogo';

export interface LoadingScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  minDurationMs = 2200,
}) => {
  const { active, progress: rawThreeProgress, loaded, total } = useProgress();

  const [displayProgress, setDisplayProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // References for 60fps animation loop
  const displayProgressRef = useRef(0);
  const startTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number | null>(null);
  const completionTriggeredRef = useRef(false);

  // Gauge Geometry: 144 radial ticks for ultra-fine high-tech sonar telemetry
  const TOTAL_TICKS = 144;
  const CX = 220;
  const CY = 220;
  const R_INNER = 112;
  const R_OUTER = 124;

  // Precompute tick geometry for maximum performance
  const ticksData = useMemo(() => {
    return Array.from({ length: TOTAL_TICKS }, (_, i) => {
      const angleDeg = (i / TOTAL_TICKS) * 360;
      const rad = (angleDeg * Math.PI) / 180;
      return {
        index: i,
        angleDeg,
        x1: CX + R_INNER * Math.sin(rad),
        y1: CY - R_INNER * Math.cos(rad),
        x2: CX + R_OUTER * Math.sin(rad),
        y2: CY - R_OUTER * Math.cos(rad),
      };
    });
  }, [TOTAL_TICKS]);

  // Floating ambient marine micro-particles (subtle drifting deep-sea motes)
  const particles = useMemo(() => {
    return [
      { id: 1, top: '22%', left: '18%', size: 3, delay: '0s', dur: '6s' },
      { id: 2, top: '75%', left: '24%', size: 2, delay: '1.2s', dur: '7.5s' },
      { id: 3, top: '35%', left: '82%', size: 2.5, delay: '2.5s', dur: '8s' },
      { id: 4, top: '80%', left: '78%', size: 3.5, delay: '0.8s', dur: '6.5s' },
      { id: 5, top: '15%', left: '60%', size: 2, delay: '1.8s', dur: '9s' },
      { id: 6, top: '60%', left: '12%', size: 2.5, delay: '3.1s', dur: '7s' },
    ];
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let isMounted = true;
    startTimeRef.current = performance.now();
    displayProgressRef.current = 0;
    completionTriggeredRef.current = false;

    // Safety fallback timeout
    const safetyTimeout = setTimeout(() => {
      if (!completionTriggeredRef.current && isMounted) {
        displayProgressRef.current = 100;
        setDisplayProgress(100);
      }
    }, 12000);

    const updateFrame = () => {
      if (!isMounted) return;

      const now = performance.now();
      const elapsed = now - startTimeRef.current;

      // Time progress: sweeps steadily 0 to 100 based on minDurationMs
      const timePercent = Math.min(100, (elapsed / minDurationMs) * 100);

      // Real 3D asset progress from Three.js / Drei loader
      let assetPercent = rawThreeProgress;
      if (!active && (total === 0 || loaded >= total)) {
        assetPercent = 100;
      }

      // Determine target progress:
      let target: number;
      if (active && assetPercent < 100) {
        // While downloading large models, tether visual progress to actual download
        target = Math.min(timePercent, assetPercent);
      } else {
        // Assets ready or cached: sweep smoothly to 100%
        target = timePercent;
      }

      // Smooth lerp step towards target
      const current = displayProgressRef.current;
      if (current < target) {
        const step = Math.max(0.35, (target - current) * 0.09);
        const next = Math.min(target, current + step);
        displayProgressRef.current = next;
        setDisplayProgress(next);
      }

      // Completion check: 100% target reached and display caught up
      if (target >= 100 && displayProgressRef.current >= 99.5 && !completionTriggeredRef.current) {
        completionTriggeredRef.current = true;
        displayProgressRef.current = 100;
        setDisplayProgress(100);

        // Hold at 100% for 350ms to celebrate full ring illumination
        setTimeout(() => {
          if (!isMounted) return;
          setIsFading(true);

          // Fade out duration: 700ms
          setTimeout(() => {
            if (!isMounted) return;
            setIsFinished(true);
            document.body.style.overflow = originalOverflow;
            onComplete?.();
          }, 700);
        }, 350);

        return;
      }

      rafIdRef.current = requestAnimationFrame(updateFrame);
    };

    rafIdRef.current = requestAnimationFrame(updateFrame);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      document.body.style.overflow = originalOverflow;
    };
  }, [active, rawThreeProgress, loaded, total, minDurationMs, onComplete]);

  if (isFinished) {
    return null;
  }

  // Active ticks count (0 to TOTAL_TICKS)
  const activeTicksCount = Math.round((displayProgress / 100) * TOTAL_TICKS);

  // Radial spokes angles: at 22.5°, 112.5°, 202.5°, 292.5°
  const spokesAngles = [22.5, 112.5, 202.5, 292.5];

  // Dynamic status subtitle reflecting real mission phases
  const getMissionStatus = (p: number) => {
    if (p < 25) return 'SCANNING OCEAN COLUMN';
    if (p < 55) return 'INITIALIZING SUBMERSIBLE HUD';
    if (p < 85) return 'CALIBRATING HYDROPHONE ARRAY';
    if (p < 100) return 'APPROACHING SURFACE CEILING';
    return 'MISSION READY // 0000m';
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-out select-none ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        // Seamless transition to the site's #010204 background with deep ocean central lighting
        background: 'radial-gradient(ellipse at 50% 50%, #062347 0%, #031224 45%, #010612 75%, #010204 100%)',
      }}
      aria-label="Loading Experience"
      role="progressbar"
      aria-valuenow={Math.round(displayProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Subtle cockpit scanlines effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.05) 2px, rgba(6, 182, 212, 0.05) 4px)',
        }}
      />

      {/* Floating deep-sea marine dust / motes */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-cyan-300 pointer-events-none animate-pulse"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: 0.35,
            boxShadow: '0 0 8px #22d3ee',
            animationDuration: p.dur,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Top Header: The Signal Submarine Telemetry Badge */}
      <div className="absolute top-[max(1.25rem,env(safe-area-inset-top))] left-4 right-4 sm:left-6 sm:right-6 flex items-center justify-between text-[10px] sm:text-[11px] font-mono tracking-widest text-cyan-400/70 select-none">
        <div className="flex items-center space-x-2.5">
          <SignalLogo size={24} animated={true} className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          <span className="text-white font-semibold tracking-wider text-xs sm:text-sm" style={{ fontFamily: '"Quantico", sans-serif' }}>
            THE SIGNAL
          </span>
          <span className="text-cyan-400 font-bold text-xs sm:text-sm">// &apos;26</span>
          <span className="text-cyan-600/70 hidden xs:inline">|</span>
          <span className="text-cyan-300/80 hidden sm:inline">SUBMERSIBLE TELEMETRY</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-cyan-400/50">
          <span>SYS: ACTIVE</span>
          <span>LAT: 24.38°N</span>
          <span>DEPTH: 0000m</span>
        </div>
      </div>

      {/* Central Tactical Gauge */}
      <div className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[460px] sm:h-[460px] max-w-[88vw] max-h-[88vw]">
        {/* Ambient cyan underglow behind the dial */}
        <div className="absolute inset-4 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        <svg
          viewBox="0 0 440 440"
          className="w-full h-full relative z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Cyan bloom filter for active ticks */}
            <filter id="sonar-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.0" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Intense radiant white-cyan bloom for leading edge */}
            <filter id="sonar-glow-bright" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing aura for sonar blips */}
            <filter id="blip-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Linear gradient for sweeping radar ray */}
            <linearGradient id="radar-sweep-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* Rotating Sonar Radar Sweep Beam */}
          <g style={{ transformOrigin: `${CX}px ${CY}px` }} className="animate-spin-slow">
            {/* Subtle radar sector */}
            <path
              d={`M ${CX} ${CY} L ${CX - 22} ${CY - 108} A 110 110 0 0 1 ${CX} ${CY - 110} Z`}
              fill="url(#radar-sweep-grad)"
              opacity="0.6"
            />
            {/* Leading ray */}
            <line
              x1={CX}
              y1={CY}
              x2={CX}
              y2={CY - 110}
              stroke="#22d3ee"
              strokeWidth="1.2"
              strokeOpacity="0.75"
              strokeLinecap="round"
            />
          </g>

          {/* Expanding Sonar Echo Ring */}
          <circle
            cx={CX}
            cy={CY}
            r={108}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="0.8"
            strokeDasharray="4 6"
            opacity="0.35"
          />

          {/* Faint Inner Guide Ring */}
          <circle
            cx={CX}
            cy={CY}
            r={R_INNER - 2}
            fill="none"
            stroke="#0a395c"
            strokeWidth="0.9"
            opacity="0.7"
          />

          {/* Faint Outer Guide Ring */}
          <circle
            cx={CX}
            cy={CY}
            r={R_OUTER + 2}
            fill="none"
            stroke="#0a395c"
            strokeWidth="0.9"
            opacity="0.7"
          />

          {/* 4 Diagonal Radial Spokes (at 22.5°, 112.5°, 202.5°, 292.5°) */}
          {spokesAngles.map((angle, idx) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = CX + (R_OUTER + 4) * Math.sin(rad);
            const y1 = CY - (R_OUTER + 4) * Math.cos(rad);
            const x2 = CX + (R_OUTER + 30) * Math.sin(rad);
            const y2 = CY - (R_OUTER + 30) * Math.cos(rad);
            return (
              <line
                key={`spoke-${idx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#0e4368"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            );
          })}

          {/* Two Sonar Blip Dots (at 292.5° and 112.5°, radius ~101px, exactly opposite) */}
          {(() => {
            const rad1 = (292.5 * Math.PI) / 180;
            const x1 = CX + 101 * Math.sin(rad1);
            const y1 = CY - 101 * Math.cos(rad1);

            const rad2 = (112.5 * Math.PI) / 180;
            const x2 = CX + 101 * Math.sin(rad2);
            const y2 = CY - 101 * Math.cos(rad2);

            return (
              <g>
                <circle
                  cx={x1}
                  cy={y1}
                  r={2.8}
                  fill="#22d3ee"
                  filter="url(#blip-glow)"
                  className="animate-pulse"
                />
                <circle
                  cx={x2}
                  cy={y2}
                  r={2.8}
                  fill="#22d3ee"
                  filter="url(#blip-glow)"
                  className="animate-pulse"
                />
              </g>
            );
          })()}

          {/* Circular Ticks Ring */}
          <g>
            {ticksData.map((tick) => {
              const isActive = tick.index < activeTicksCount;
              const isLeading = isActive && tick.index >= activeTicksCount - 2;

              if (isActive) {
                // Gradient transition from vibrant cyan to bright ice-white at leading edge
                const ratio = activeTicksCount > 1 ? tick.index / (activeTicksCount - 1) : 1;
                const strokeColor = isLeading
                  ? '#ffffff'
                  : ratio > 0.75
                  ? '#cffafe'
                  : ratio > 0.4
                  ? '#22d3ee'
                  : '#06b6d4';

                return (
                  <line
                    key={`tick-${tick.index}`}
                    x1={tick.x1}
                    y1={tick.y1}
                    x2={tick.x2}
                    y2={tick.y2}
                    stroke={strokeColor}
                    strokeWidth={isLeading ? 2.4 : 1.9}
                    strokeLinecap="round"
                    filter={isLeading ? 'url(#sonar-glow-bright)' : 'url(#sonar-glow)'}
                  />
                );
              }

              // Inactive ticks in deep submarine cockpit carbon-cyan
              return (
                <line
                  key={`tick-${tick.index}`}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke="#072238"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              );
            })}
          </g>

          {/* Cardinal Markers (100, 25, 50, 75) */}
          {/* Top: 100 */}
          <text
            x={CX}
            y={CY - 168}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#38bdf8"
            fontSize="12.5"
            fontFamily="'Quantico', 'JetBrains Mono', monospace"
            fontWeight="600"
            letterSpacing="0.08em"
            opacity="0.85"
          >
            100
          </text>

          {/* Right: 25 */}
          <text
            x={CX + 168}
            y={CY}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#38bdf8"
            fontSize="12.5"
            fontFamily="'Quantico', 'JetBrains Mono', monospace"
            fontWeight="600"
            letterSpacing="0.08em"
            opacity="0.85"
          >
            25
          </text>

          {/* Bottom: 50 */}
          <text
            x={CX}
            y={CY + 168}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#38bdf8"
            fontSize="12.5"
            fontFamily="'Quantico', 'JetBrains Mono', monospace"
            fontWeight="600"
            letterSpacing="0.08em"
            opacity="0.85"
          >
            50
          </text>

          {/* Left: 75 */}
          <text
            x={CX - 168}
            y={CY}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#38bdf8"
            fontSize="12.5"
            fontFamily="'Quantico', 'JetBrains Mono', monospace"
            fontWeight="600"
            letterSpacing="0.08em"
            opacity="0.85"
          >
            75
          </text>

          {/* Center Text: LOADING EXPERIENCE */}
          <text
            x={CX}
            y={CY - 12}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#f8fafc"
            fontSize="15"
            fontFamily="'Quantico', 'Inter', sans-serif"
            fontWeight="700"
            letterSpacing="0.25em"
            style={{ filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.4))' }}
          >
            LOADING
          </text>

          <text
            x={CX}
            y={CY + 11}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#f8fafc"
            fontSize="15"
            fontFamily="'Quantico', 'Inter', sans-serif"
            fontWeight="700"
            letterSpacing="0.25em"
            style={{ filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.4))' }}
          >
            EXPERIENCE
          </text>

          {/* Real-time Percentage Telemetry Readout */}
          <text
            x={CX}
            y={CY + 33}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#22d3ee"
            fontSize="12"
            fontFamily="'JetBrains Mono', 'Quantico', monospace"
            fontWeight="600"
            letterSpacing="0.16em"
            style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))' }}
          >
            {Math.round(displayProgress)}%
          </text>

          {/* Live Mission Sub-Status */}
          <text
            x={CX}
            y={CY + 49}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#0284c7"
            fontSize="8"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="600"
            letterSpacing="0.22em"
            opacity="0.9"
          >
            {getMissionStatus(displayProgress)}
          </text>
        </svg>
      </div>

      {/* Bottom Footer Telemetry */}
      <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] inset-x-0 flex items-center justify-center text-[9px] sm:text-[10px] font-mono tracking-[0.2em] sm:tracking-[0.25em] text-cyan-500/40 select-none px-4 text-center">
        <span>STATION READY // SURFACE 0000m // IEEE UCSC</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
