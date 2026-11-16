import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Cpu, Network, ShieldCheck, Sparkles, ArrowRight, Globe, Building2, Users } from "lucide-react";
import { DiveRef } from "../types/dive";
import { SignalLogo } from "./SignalLogo";

export interface StorySectionsProps {
  diveRef: DiveRef;
  onOpenRegister: () => void;
}

export const StorySections: React.FC<StorySectionsProps> = ({
  diveRef,
  onOpenRegister,
}) => {
  const sec1Ref = useRef<HTMLDivElement>(null);
  const sec2Ref = useRef<HTMLDivElement>(null);
  const sec3Ref = useRef<HTMLDivElement>(null);
  const sec4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smootherstep (zero velocity at endpoints for natural underwater fluid inertia)
    const smootherstep = (min: number, max: number, value: number) => {
      const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
      return x * x * x * (x * (x * 6 - 15) + 10);
    };

    const updateSection = (
      el: HTMLDivElement | null,
      p: number,
      startIn: number,
      fullIn: number,
      startOut: number,
      endOut: number,
      isRightSide = false,
      persistAtEnd = false,
    ) => {
      if (!el) return;

      const dirX = isRightSide ? 16 : -16;

      if (p < startIn) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        el.style.pointerEvents = "none";
        el.style.filter = "none";
      } else if (p >= startIn && p < fullIn) {
        // ENTRANCE ANIMATION: Smoothly emerging from ocean water blur and floating into crisp focus
        const t = smootherstep(startIn, fullIn, p);
        const blur = (1 - t) * 7;
        const transX = (1 - t) * dirX;
        const transY = (1 - t) * 20;
        const scale = 0.96 + t * 0.04;

        el.style.opacity = `${t}`;
        el.style.transform = `translate3d(${transX}px, ${transY}px, 0) scale(${scale})`;
        el.style.filter = `blur(${blur}px)`;
        el.style.visibility = "visible";
        el.style.pointerEvents = "none";
      } else if (p >= fullIn && p <= startOut) {
        // FULLY VISIBLE & PIN-SHARP
        el.style.opacity = "1";
        el.style.transform = "translate3d(0, 0px, 0) scale(1)";
        el.style.filter = "none";
        el.style.visibility = "visible";
        el.style.pointerEvents = "auto";
      } else if (p > startOut && p <= endOut && !persistAtEnd) {
        // EXITING ANIMATION: Softly dissolving into the deep ocean with defocus blur and gentle drift
        const t = smootherstep(startOut, endOut, p);
        const blur = t * 8;
        const transX = t * (dirX * 0.7);
        const transY = -t * 22;
        const scale = 1 - t * 0.04;

        el.style.opacity = `${Math.max(0, 1 - t * 1.08)}`;
        el.style.transform = `translate3d(${transX}px, ${transY}px, 0) scale(${scale})`;
        el.style.filter = `blur(${blur}px)`;
        el.style.visibility = "visible";
        el.style.pointerEvents = "none";
      } else if (persistAtEnd && p > startOut) {
        // Persists cleanly at seabed touchdown
        el.style.opacity = "1";
        el.style.transform = "translate3d(0, 0px, 0) scale(1)";
        el.style.filter = "none";
        el.style.visibility = "visible";
        el.style.pointerEvents = "auto";
      } else {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        el.style.pointerEvents = "none";
        el.style.filter = "none";
      }
    };

    const handleTicker = () => {
      const p = diveRef.current.progress;

      // Section 1: 20% – 42% (Upper-Left)
      updateSection(sec1Ref.current, p, 0.2, 0.24, 0.38, 0.42, false);

      // Section 2: 44% – 66% (Bottom-Left)
      updateSection(sec2Ref.current, p, 0.44, 0.48, 0.62, 0.66, false);

      // Section 3: 68% – 84% (Upper-Right on desktop, cleanly padded on mobile)
      updateSection(sec3Ref.current, p, 0.68, 0.72, 0.8, 0.84, true);

      // Section 4: 86% – 100% (Center-Left, Touchdown & Organizers)
      updateSection(sec4Ref.current, p, 0.86, 0.9, 1.0, 1.0, false, true);
    };

    gsap.ticker.add(handleTicker);
    return () => gsap.ticker.remove(handleTicker);
  }, [diveRef]);

  return (
    <>
      {/* ================= SECTION 1: MISSION BRIEFING (20% – 42%) ================= */}
      <div
        ref={sec1Ref}
        className="fixed left-5 sm:left-10 md:left-16 top-[max(5.5rem,calc(env(safe-area-inset-top)+4rem))] sm:top-32 md:top-36 max-w-lg w-[calc(100vw-4.5rem)] sm:w-full z-20 pointer-events-none will-change-transform select-none"
      >
        <div className="relative pl-4 sm:pl-7 border-l-2 border-cyan-400/80 bg-transparent space-y-3 sm:space-y-4">
          {/* Heading (Archivo Black, Larger Size) */}
          <h2
            style={{
              fontFamily: '"Archivo Black", sans-serif',
              fontWeight: 400,
              fontStyle: "normal",
            }}
            className="archivo-black-regular text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-tight leading-tight drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]"
          >
            Where Surface Logic Fails, Real Engineering Begins.
          </h2>

          {/* Sub topic (Arimo font) */}
          <p
            style={{ fontFamily: "Arimo, sans-serif" }}
            className="text-xs sm:text-base md:text-lg text-slate-200 font-normal leading-relaxed drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]"
          >
            Beneath 10,000 meters of crushing pressure, standard solutions break
            down. THE SIGNAL challenges Sri Lanka’s sharpest student developers,
            designers, and innovators to descend into uncharted technical
            territory. Over 36 non-stop hours, your crew will architect
            resilient software and build working prototypes built to survive the
            deep.
          </p>

          {/* Mission Telemetry: Location, Host, Crew Size */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-1.5 font-mono text-[10px] sm:text-[11.5px]">
            <div className="border-l border-cyan-400/60 pl-2.5">
              <div className="text-cyan-400 text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center">
                <Globe className="w-3 h-3 text-cyan-400 mr-1 flex-shrink-0" />
                <span>LOCATION</span>
              </div>
              <div className="text-white font-semibold mt-0.5">100% ONLINE</div>
            </div>

            <div className="border-l border-cyan-400/60 pl-2.5">
              <div className="text-cyan-400 text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center">
                <Building2 className="w-3 h-3 text-cyan-400 mr-1 flex-shrink-0" />
                <span>ORGANIZER</span>
              </div>
              <div className="text-white font-semibold mt-0.5 truncate">IEEE CS UCSC</div>
            </div>

            <div className="col-span-2 sm:col-span-1 border-l border-cyan-400/60 pl-2.5">
              <div className="text-cyan-400 text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center">
                <Users className="w-3 h-3 text-cyan-400 mr-1 flex-shrink-0" />
                <span>CREW SIZE</span>
              </div>
              <div className="text-white font-semibold mt-0.5">2–4 Undergrads</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECTION 2: HACKATHON TRACKS (44% – 66%) ================= */}
      <div
        ref={sec2Ref}
        className="fixed left-5 sm:left-10 md:left-16 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] sm:bottom-10 md:bottom-12 max-w-lg w-[calc(100vw-4.5rem)] sm:w-full z-20 pointer-events-none will-change-transform select-none"
      >
        <div className="relative pl-4 sm:pl-7 border-l-2 border-cyan-400/80 bg-transparent space-y-3 sm:space-y-4 max-h-[68dvh] overflow-y-auto">
          {/* Heading (Archivo Black, Larger Size) */}
          <h2
            style={{
              fontFamily: '"Archivo Black", sans-serif',
              fontWeight: 400,
              fontStyle: "normal",
            }}
            className="archivo-black-regular text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-tight leading-tight drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]"
          >
            Choose Your Technical Vector
          </h2>

          {/* 4 Track Items */}
          <div className="space-y-2.5 sm:space-y-3.5 pt-1">
            {/* Track 1 */}
            <div className="group pointer-events-auto transition-transform hover:translate-x-1 duration-150">
              <div className="flex items-center space-x-2 mb-0.5">
                <Cpu className="w-4 h-4 text-cyan-400 flex-shrink-0 drop-shadow-[0_0_8px_#22d3ee]" />
                <h3
                  style={{
                    fontFamily: '"Archivo Black", sans-serif',
                    fontWeight: 400,
                    fontStyle: "normal",
                  }}
                  className="archivo-black-regular text-xs sm:text-base text-cyan-200 uppercase tracking-wide group-hover:text-white transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                >
                  01. Neural Currents (AI &amp; ML)
                </h3>
              </div>
              <p
                style={{ fontFamily: "Arimo, sans-serif" }}
                className="text-[11px] sm:text-sm text-slate-200 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] pl-6"
              >
                Autonomous intelligence built for zero-visibility challenges.
              </p>
            </div>

            {/* Track 2 */}
            <div className="group pointer-events-auto transition-transform hover:translate-x-1 duration-150">
              <div className="flex items-center space-x-2 mb-0.5">
                <Network className="w-4 h-4 text-cyan-400 flex-shrink-0 drop-shadow-[0_0_8px_#22d3ee]" />
                <h3
                  style={{
                    fontFamily: '"Archivo Black", sans-serif',
                    fontWeight: 400,
                    fontStyle: "normal",
                  }}
                  className="archivo-black-regular text-xs sm:text-base text-cyan-200 uppercase tracking-wide group-hover:text-white transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                >
                  02. Abyssal Grid (Cloud &amp; Systems)
                </h3>
              </div>
              <p
                style={{ fontFamily: "Arimo, sans-serif" }}
                className="text-[11px] sm:text-sm text-slate-200 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] pl-6"
              >
                Fault-tolerant architectures engineered for extreme scale.
              </p>
            </div>

            {/* Track 3 */}
            <div className="group pointer-events-auto transition-transform hover:translate-x-1 duration-150">
              <div className="flex items-center space-x-2 mb-0.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 drop-shadow-[0_0_8px_#22d3ee]" />
                <h3
                  style={{
                    fontFamily: '"Archivo Black", sans-serif',
                    fontWeight: 400,
                    fontStyle: "normal",
                  }}
                  className="archivo-black-regular text-xs sm:text-base text-cyan-200 uppercase tracking-wide group-hover:text-white transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                >
                  03. Trench Shield (Cyber &amp; FinTech)
                </h3>
              </div>
              <p
                style={{ fontFamily: "Arimo, sans-serif" }}
                className="text-[11px] sm:text-sm text-slate-200 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] pl-6"
              >
                Fortifying critical digital infrastructure and data pipelines.
              </p>
            </div>

            {/* Track 4 */}
            <div className="group pointer-events-auto transition-transform hover:translate-x-1 duration-150">
              <div className="flex items-center space-x-2 mb-0.5">
                <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 drop-shadow-[0_0_8px_#22d3ee]" />
                <h3
                  style={{
                    fontFamily: '"Archivo Black", sans-serif',
                    fontWeight: 400,
                    fontStyle: "normal",
                  }}
                  className="archivo-black-regular text-xs sm:text-base text-cyan-200 uppercase tracking-wide group-hover:text-white transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                >
                  04. Open Horizon (Open Innovation)
                </h3>
              </div>
              <p
                style={{ fontFamily: "Arimo, sans-serif" }}
                className="text-[11px] sm:text-sm text-slate-200 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] pl-6"
              >
                Bold, boundary-free solutions solving real-world problems.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECTION 3: EVENT TIMELINE (68% – 84%) ================= */}
      <div
        ref={sec3Ref}
        className="fixed left-5 sm:left-auto right-auto sm:right-16 md:right-24 lg:right-28 top-[max(5.5rem,calc(env(safe-area-inset-top)+4rem))] sm:top-32 md:top-36 max-w-lg w-[calc(100vw-4.5rem)] sm:w-full z-20 pointer-events-none will-change-transform select-none"
      >
        <div className="relative pl-4 sm:pl-7 border-l-2 border-cyan-400/80 bg-transparent space-y-3 sm:space-y-4">
          {/* Heading (Archivo Black, Larger Size) */}
          <h2
            style={{
              fontFamily: '"Archivo Black", sans-serif',
              fontWeight: 400,
              fontStyle: "normal",
            }}
            className="archivo-black-regular text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-tight leading-tight drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]"
          >
            Descent Milestones
          </h2>

          {/* 3 Milestones */}
          <div className="space-y-3 sm:space-y-4 pt-1">
            {/* Milestone 1 */}
            <div>
              <div
                style={{
                  fontFamily: '"Archivo Black", sans-serif',
                  fontWeight: 400,
                  fontStyle: "normal",
                }}
                className="archivo-black-regular text-xs sm:text-base text-cyan-300 uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                T-00:00 // Hatch Seal &amp; Kickoff
              </div>
              <p
                style={{ fontFamily: "Arimo, sans-serif" }}
                className="text-[11px] sm:text-sm text-slate-200 mt-0.5 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]"
              >
                Problem vectors transmitted; hacking commences.
              </p>
            </div>

            {/* Milestone 2 */}
            <div>
              <div
                style={{
                  fontFamily: '"Archivo Black", sans-serif',
                  fontWeight: 400,
                  fontStyle: "normal",
                }}
                className="archivo-black-regular text-xs sm:text-base text-sky-300 uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                T+18:00 // Crush Depth Check
              </div>
              <p
                style={{ fontFamily: "Arimo, sans-serif" }}
                className="text-[11px] sm:text-sm text-slate-200 mt-0.5 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]"
              >
                Live mentor hull-inspections and architecture feedback.
              </p>
            </div>

            {/* Milestone 3 */}
            <div>
              <div
                style={{
                  fontFamily: '"Archivo Black", sans-serif',
                  fontWeight: 400,
                  fontStyle: "normal",
                }}
                className="archivo-black-regular text-xs sm:text-base text-blue-300 uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                T+36:00 // Surface &amp; Pitch
              </div>
              <p
                style={{ fontFamily: "Arimo, sans-serif" }}
                className="text-[11px] sm:text-sm text-slate-200 mt-0.5 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]"
              >
                Final prototypes demonstrated before the judging panel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECTION 4: SEABED TOUCHDOWN & ORGANIZERS (86% – 100%) ================= */}
      <div
        ref={sec4Ref}
        className="fixed left-5 sm:left-10 md:left-16 top-1/2 -translate-y-1/2 max-w-lg w-[calc(100vw-4.5rem)] sm:w-full z-20 pointer-events-none will-change-transform select-none"
      >
        <div className="relative pl-4 sm:pl-7 border-l-2 border-cyan-400/80 bg-transparent space-y-3 sm:space-y-3.5">
          {/* Expedition Logo Protocol Tag */}
          <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-cyan-400">
            <SignalLogo size={20} animated={true} showPlate={false} />
            <span>HADAL EXPEDITION // 2026 DEPLOYMENT</span>
          </div>

          {/* Heading (Archivo Black, Larger Size) */}
          <h2
            style={{
              fontFamily: '"Archivo Black", sans-serif',
              fontWeight: 400,
              fontStyle: "normal",
            }}
            className="archivo-black-regular text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-tight leading-tight drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]"
          >
            Ready Your Crew for Descent.
          </h2>

          {/* Copy */}
          <p
            style={{ fontFamily: "Arimo, sans-serif" }}
            className="text-xs sm:text-base md:text-lg text-slate-200 font-normal leading-relaxed drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]"
          >
            Assemble a squad of 2 to 4 undergraduates. Limited oxygen
            reserves-register your team before the airlock seals.
          </p>

          {/* CTA Button */}
          <div className="pt-0.5">
            <button
              onClick={onOpenRegister}
              style={{
                fontFamily: '"Archivo Black", sans-serif',
                fontWeight: 400,
                fontStyle: "normal",
              }}
              className="archivo-black-regular pointer-events-auto py-3.5 px-6 min-h-[48px] rounded-full border border-cyan-400 bg-cyan-500/25 hover:bg-cyan-500/40 active:bg-cyan-400/50 text-white text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center space-x-2 cursor-pointer group active:scale-95"
              aria-label="Register Crew for Hackathon"
            >
              <span>REGISTER CREW</span>
              <ArrowRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Official Organizing Host Showcase (Revealed at 95% scroll - 'Organizers' section) */}
          <div className="pt-2.5 sm:pt-3 border-t border-cyan-400/20">
            <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-semibold mb-2">
              MISSION COMMAND // HOSTED &amp; ORGANIZED BY
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <img
                src="/images/ieee-cs-white.png"
                alt="IEEE Computer Society of UCSC"
                className="h-9 sm:h-12 w-auto max-w-[190px] object-contain opacity-95 hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
              />
              <div className="font-mono text-[10px] sm:text-[11px] text-slate-300 border-l-2 sm:border-l border-cyan-400/40 pl-3 leading-snug space-y-0.5">
                <div className="text-white font-semibold tracking-wide text-xs sm:text-sm">
                  IEEE Computer Society of UCSC
                </div>
                <div className="text-slate-400 text-[9.5px] sm:text-[11px]">
                  University of Colombo School of Computing
                </div>
                <div className="text-cyan-300 text-[10px] sm:text-[10.5px] flex items-center space-x-1.5 pt-0.5">
                  <Globe className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  <span className="font-bold tracking-wider text-cyan-200">LOCATION: 100% ONLINE (VIRTUAL)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
