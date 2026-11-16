import React, { useId } from 'react';

export interface SignalLogoProps {
  /**
   * Display variant:
   * - 'icon': Just the standalone deep-sea sonar emblem
   * - 'full': Emblem plus stylized "THE SIGNAL // '26" wordmark
   * - 'badge': Tech badge lockup with telemetry border
   */
  variant?: 'icon' | 'full' | 'badge';
  /**
   * Explicit size in pixels or standard preset ('sm' | 'md' | 'lg' | 'xl')
   * Default: 'md' (36px)
   */
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * Whether to render the deep abyssal substrate backing plate
   * Default: true
   */
  showPlate?: boolean;
  /**
   * Enable real-time deep-sea acoustic sonar ping & beacon animations
   * Default: true
   */
  animated?: boolean;
  /**
   * Optional subline text for 'full' variant
   */
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP: Record<string, number> = {
  xs: 22,
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
  '2xl': 88,
};

/**
 * Official THE SIGNAL 2026 Deep-Sea Hackathon Logo
 * Engineered with high-tech hydrophone sonar aesthetics, point-symmetric acoustic S-waveforms,
 * and bioluminescent abyssal cyan glow.
 */
export const SignalLogo: React.FC<SignalLogoProps> = ({
  variant = 'icon',
  size = 'md',
  showPlate = true,
  animated = true,
  subtitle,
  className = '',
  style,
}) => {
  const reactId = useId().replace(/:/g, '');
  const prefix = `sig-${reactId}`;

  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 36;

  // Icon SVG Element
  const renderIcon = () => (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        flexShrink: 0,
      }}
      className={`select-none overflow-visible transition-transform duration-300 group-hover:scale-105 ${
        animated ? 'signal-logo-animated' : ''
      }`}
      role="img"
      aria-label="The Signal 2026 Emblem"
    >
      <defs>
        {/* Cyan to Deep Abyss Gradient */}
        <linearGradient id={`${prefix}-cyanGrad`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="15%" stopColor="#67e8f9" />
          <stop offset="55%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Radiating Sonar Arcs Top-Right Gradient */}
        <linearGradient id={`${prefix}-arcTop`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="60%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>

        {/* Radiating Sonar Arcs Bottom-Left Gradient */}
        <linearGradient id={`${prefix}-arcBot`} x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="60%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>

        {/* Ambient Hydrophone Radial Glow */}
        <radialGradient id={`${prefix}-radialGlow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#06b6d4" stopOpacity="0.3" />
          <stop offset="85%" stopColor="#0284c7" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#010614" stopOpacity="0" />
        </radialGradient>

        {/* Bioluminescent Bloom Filters */}
        <filter id={`${prefix}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`${prefix}-intense`} x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="3.6" result="blur2" />
          <feGaussianBlur stdDeviation="1.2" result="blur1" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Substrate Base Plate */}
      {showPlate && (
        <rect
          width="94"
          height="94"
          x="3"
          y="3"
          rx="22"
          fill="#010714"
          stroke="#0a3866"
          strokeWidth="1.6"
          className="transition-colors group-hover:stroke-cyan-500/50"
        />
      )}

      {/* Sonar Reference Circles */}
      <circle cx="50" cy="50" r="39" stroke="#06284f" strokeWidth="1" strokeDasharray="2 4" opacity="0.65" />
      <circle cx="50" cy="50" r="28" stroke="#07366b" strokeWidth="0.8" opacity="0.55" />
      <circle cx="50" cy="50" r="15" stroke="#0b4f94" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />

      {/* Ambient Radial Core Light */}
      <circle cx="50" cy="50" r="30" fill={`url(#${prefix}-radialGlow)`} />

      {/* Dynamic Animated Sonar Ping Wave (Radio/Acoustic Pulse) */}
      {animated && (
        <circle
          cx="50"
          cy="50"
          r="10"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1.2"
          className="animate-ping"
          style={{
            transformOrigin: '50px 50px',
            animationDuration: '3s',
            opacity: 0.5,
          }}
        />
      )}

      {/* HUD Corner Reticles */}
      <path
        d="M 11 23 L 11 11 L 23 11"
        stroke="#0284c7"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M 77 11 L 89 11 L 89 23"
        stroke="#0284c7"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M 11 77 L 11 89 L 23 89"
        stroke="#0284c7"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M 77 89 L 89 89 L 89 77"
        stroke="#0284c7"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />

      {/* Four Cardinal Telemetry Calibrator Ticks */}
      <line x1="50" y1="4" x2="50" y2="10" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="90" x2="50" y2="96" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="50" x2="10" y2="50" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <line x1="90" y1="50" x2="96" y2="50" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />

      {/* Radiating Acoustic Sonar Wavefronts (Echo Pulse Top-Right) */}
      <path
        d="M 64 22 C 72 26 78 32 81 40"
        stroke={`url(#${prefix}-arcTop)`}
        strokeWidth="2.6"
        strokeLinecap="round"
        filter={`url(#${prefix}-glow)`}
        className="transition-all duration-300 group-hover:opacity-100"
      />
      <path
        d="M 72 15 C 83 21 91 30 94 41"
        stroke="#0ea5e9"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Radiating Acoustic Sonar Wavefronts (Echo Pulse Bottom-Left) */}
      <path
        d="M 36 78 C 28 74 22 68 19 60"
        stroke={`url(#${prefix}-arcBot)`}
        strokeWidth="2.6"
        strokeLinecap="round"
        filter={`url(#${prefix}-glow)`}
        className="transition-all duration-300 group-hover:opacity-100"
      />
      <path
        d="M 28 85 C 17 79 9 70 6 59"
        stroke="#0ea5e9"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* THE SIGNAL "S" EMBLEM: Point-symmetric cybernetic sonar current */}
      <path
        d="M 32 32 C 32 20 42 16 54 16 C 66 16 75 22 75 32 C 75 42 67 46 56 49 L 44 53 C 33 56 25 60 25 70 C 25 80 34 86 46 86 C 58 86 68 80 68 68"
        stroke={`url(#${prefix}-cyanGrad)`}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${prefix}-intense)`}
      />

      {/* Superluminescent Core Neon Trace */}
      <path
        d="M 33 32 C 33 22 43 18.5 54 18.5 C 64 18.5 72 23.5 72 32 C 72 40 65 43.5 54 46.5 L 46 49.5 C 35 52.5 28 56 28 66 C 28 77 36 82.5 46 82.5 C 57 82.5 65 77.5 65 68"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />

      {/* Central Mariana Hydrophone Sonar Beacon (Emitter Core) */}
      <circle
        cx="50"
        cy="50"
        r="5.2"
        fill="#ffffff"
        filter={`url(#${prefix}-intense)`}
        className={animated ? 'animate-pulse' : ''}
      />
      <circle cx="50" cy="50" r="2.2" fill="#011024" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} style={style}>
        {renderIcon()}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-slate-950/85 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.15)] group transition-all hover:border-cyan-400/60 ${className}`}
        style={style}
      >
        {renderIcon()}
        <div className="flex flex-col text-left">
          <div className="flex items-baseline space-x-1.5 font-bold tracking-widest text-white text-sm" style={{ fontFamily: '"Quantico", sans-serif' }}>
            <span>THE SIGNAL</span>
            <span className="text-cyan-400 text-xs">// &apos;26</span>
          </div>
          {subtitle && (
            <span className="text-[9px] font-mono tracking-wider text-cyan-300/70 uppercase">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full Wordmark variant
  return (
    <div className={`inline-flex items-center space-x-3 group ${className}`} style={style}>
      {renderIcon()}
      <div className="flex flex-col text-left select-none">
        <div
          style={{ fontFamily: '"Quantico", sans-serif' }}
          className="flex items-baseline space-x-1.5 tracking-widest text-lg sm:text-2xl font-bold uppercase text-white group-hover:text-cyan-200 transition-colors drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
        >
          <span>THE SIGNAL</span>
          <span className="text-cyan-400 text-xs sm:text-base font-bold tracking-wider">
            // &apos;26
          </span>
        </div>
        {subtitle && (
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-cyan-400/80 uppercase">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default SignalLogo;
