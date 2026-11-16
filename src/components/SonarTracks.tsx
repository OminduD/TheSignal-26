import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Radio, Cpu, Network, Lock, Sparkles, X, ChevronRight } from 'lucide-react';
import { DiveRef, SonarTrack } from '../types/dive';

export const TRACKS: SonarTrack[] = [
  {
    id: 'vec-01',
    code: 'VEC-01',
    title: 'NEURAL ECHOES',
    category: 'AI, Agents & Autonomous Systems',
    description:
      'Architect self-governing multi-agent networks, edge LLM agents, and adaptive neural architectures capable of autonomous consensus in high-latency, disconnected abyssal environments.',
    bounty: '$8,000 BOUNTY',
    requirements: [
      'Resilient autonomous decision-making loops',
      'Local edge inference with zero cloud dependency',
      'Multi-agent collaborative swarming protocols',
    ],
    angleDeg: 42,
    radiusPercent: 62,
  },
  {
    id: 'vec-02',
    code: 'VEC-02',
    title: 'ABYSSAL MESH',
    category: 'Distributed Cloud, Edge & Infrastructure',
    description:
      'Construct high-throughput peer-to-peer transport layers, decentralized storage topologies, and fault-tolerant mesh networks engineered to withstand severe packet corruption and node loss.',
    bounty: '$6,500 BOUNTY',
    requirements: [
      'Gossip & DHT protocol resiliency under partition',
      'Sub-millisecond local state synchronization',
      'Bandwidth-optimized cryptographic compression',
    ],
    angleDeg: 138,
    radiusPercent: 74,
  },
  {
    id: 'vec-03',
    code: 'VEC-03',
    title: 'TRENCH PROTOCOL',
    category: 'Cybersecurity, Cryptography & Privacy',
    description:
      'Design quantum-resistant cryptographic ratchets, zero-knowledge verification pipelines, and adversarial containment systems to protect sensitive sub-sea telemetry from unauthorized decryption.',
    bounty: '$6,000 BOUNTY',
    requirements: [
      'Post-quantum signature integration',
      'ZK proof generation in constrained environments',
      'Active hardware tampering anomaly detection',
    ],
    angleDeg: 228,
    radiusPercent: 66,
  },
  {
    id: 'vec-04',
    code: 'VEC-04',
    title: 'OPEN CURRENT',
    category: 'Wildcard / Open Innovation',
    description:
      'Push the frontier of human-machine interaction, bio-mimetic generative interfaces, procedural graphics, and deep-sea spatial computing. Build the unexpected.',
    bounty: '$4,500 BOUNTY',
    requirements: [
      'Extreme novelty and visual/experiential excellence',
      'High-performance execution & production polish',
      'Real-world operational applicability',
    ],
    angleDeg: 318,
    radiusPercent: 52,
  },
];

export interface SonarTracksProps {
  diveRef: DiveRef;
  onSonarPing?: (freq?: number) => void;
}

export const SonarTracks: React.FC<SonarTracksProps> = ({ diveRef, onSonarPing }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTrack, setSelectedTrack] = useState<SonarTrack>(TRACKS[0]);
  const [isDossierOpen, setIsDossierOpen] = useState(true);

  useEffect(() => {
    const handleTicker = () => {
      if (!containerRef.current) return;
      const p = diveRef.current.progress;

      // Active between 40% and 62% scroll
      if (p < 0.38) {
        containerRef.current.style.opacity = '0';
        containerRef.current.style.pointerEvents = 'none';
      } else if (p >= 0.38 && p <= 0.43) {
        // Fade in
        const t = (p - 0.38) / 0.05;
        containerRef.current.style.opacity = `${t}`;
        containerRef.current.style.transform = `translateY(${(1 - t) * 30}px)`;
        containerRef.current.style.pointerEvents = 'auto';
      } else if (p > 0.43 && p <= 0.58) {
        // Fully visible
        containerRef.current.style.opacity = '1';
        containerRef.current.style.transform = 'translateY(0px)';
        containerRef.current.style.pointerEvents = 'auto';
      } else if (p > 0.58 && p <= 0.63) {
        // Fade out
        const t = (p - 0.58) / 0.05;
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

  const handleSelectTrack = (track: SonarTrack) => {
    setSelectedTrack(track);
    setIsDossierOpen(true);
    onSonarPing?.(1400);
  };

  const getVectorIcon = (id: string) => {
    switch (id) {
      case 'vec-01': return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'vec-02': return <Network className="w-4 h-4 text-sky-400" />;
      case 'vec-03': return <Lock className="w-4 h-4 text-emerald-400" />;
      default: return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <section
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-between px-6 md:px-16 lg:px-24 z-20 pointer-events-none transition-opacity duration-75 overflow-y-auto"
    >
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-16">
        {/* Left Side: Chapter Intro & Track Dossier (7 Cols) */}
        <div className="lg:col-span-7 space-y-5 pointer-events-auto">
          {/* Chapter Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border border-cyan-400/30 bg-cyan-950/50 backdrop-blur-md text-[11px] font-mono text-cyan-300 tracking-widest uppercase">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>CHAPTER 03 // BATHYPELAGIC CONTACTS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight uppercase leading-tight">
            SONAR <span className="text-cyan-400">VECTORS</span>
          </h2>

          <p className="font-sans text-sm sm:text-base text-slate-300 max-w-xl font-light">
            Hydrophone arrays have isolated 4 harmonic transmission vectors emitting from the trench.
            Click sonar contacts or select a vector to inspect dossier parameters.
          </p>

          {/* Quick Vector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {TRACKS.map((t) => {
              const active = selectedTrack.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTrack(t)}
                  className={`flex flex-col p-2.5 rounded-lg border text-left transition-all ${
                    active
                      ? 'border-cyan-400 bg-cyan-950/80 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300">
                      {t.code}
                    </span>
                    {getVectorIcon(t.id)}
                  </div>
                  <span className="text-xs font-display font-semibold truncate">
                    {t.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Holographic Track Dossier Card */}
          {isDossierOpen && selectedTrack && (
            <div className="relative p-6 rounded-xl border border-cyan-500/30 bg-slate-950/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] animate-fadeIn">
              {/* Close Button */}
              <button
                onClick={() => setIsDossierOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Minimize Dossier"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-3 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
                  {selectedTrack.code}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedTrack.category}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-2xl font-display font-bold text-white">
                  {selectedTrack.title}
                </h3>
                <span className="text-sm font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">
                  {selectedTrack.bounty}
                </span>
              </div>

              <p className="font-sans text-sm text-slate-300 leading-relaxed mb-4">
                {selectedTrack.description}
              </p>

              <div className="border-t border-slate-800/80 pt-3">
                <div className="text-[11px] font-mono tracking-wider text-cyan-400 uppercase mb-2">
                  TARGET OBJECTIVES:
                </div>
                <ul className="space-y-1.5 font-mono text-xs text-slate-300">
                  {selectedTrack.requirements.map((req, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Rotating 360° Sonar Radar Screen (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center items-center pointer-events-auto">
          <div className="relative w-72 h-72 sm:w-88 sm:h-88 rounded-full border border-cyan-500/30 bg-slate-950/70 backdrop-blur-md shadow-[0_0_40px_rgba(6,182,212,0.18)] p-3">
            {/* Range Rings */}
            <div className="absolute inset-4 rounded-full border border-cyan-500/20" />
            <div className="absolute inset-12 rounded-full border border-cyan-500/20" />
            <div className="absolute inset-20 rounded-full border border-cyan-500/25" />
            <div className="absolute inset-28 rounded-full border border-cyan-500/30" />

            {/* Crosshairs */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-500/25" />
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyan-500/25" />

            {/* Degree Markers */}
            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-400/70">
              000°
            </span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-cyan-400/70">
              090°
            </span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-400/70">
              180°
            </span>
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-cyan-400/70">
              270°
            </span>

            {/* 360° Rotating Radar Sweep Line */}
            <div className="absolute inset-0 rounded-full overflow-hidden animate-[spin_6s_linear_infinite] pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, rgba(34, 211, 238, 0.4) 0deg, rgba(6, 182, 212, 0.08) 55deg, transparent 75deg)',
                }}
              />
              <div className="absolute top-0 left-1/2 w-[1.5px] h-1/2 bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
            </div>

            {/* Central Submersible Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-cyan-300 bg-cyan-500/40 shadow-[0_0_10px_#22d3ee]" />

            {/* Interactive Glowing Radar Blips */}
            {TRACKS.map((track) => {
              const isSelected = selectedTrack.id === track.id;
              // Polar to Cartesian in % from center (50%, 50%)
              const rad = (track.angleDeg - 90) * (Math.PI / 180);
              const r = track.radiusPercent * 0.44; // keep inside radius
              const left = 50 + r * Math.cos(rad);
              const top = 50 + r * Math.sin(rad);

              return (
                <button
                  key={track.id}
                  onClick={() => handleSelectTrack(track)}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  className={`group absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer transition-transform hover:scale-125 focus:outline-none`}
                  title={`${track.code} // ${track.title}`}
                >
                  <span
                    className={`relative flex h-3.5 w-3.5 items-center justify-center`}
                  >
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isSelected ? 'bg-cyan-300' : 'bg-cyan-500'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isSelected
                          ? 'bg-cyan-300 shadow-[0_0_12px_#67e8f9]'
                          : 'bg-cyan-400'
                      }`}
                    />
                  </span>

                  {/* Blip Tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-slate-950/90 border border-cyan-500/40 text-[9px] font-mono text-cyan-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {track.code}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
