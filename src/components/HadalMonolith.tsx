import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Terminal,
  Send,
  Check,
  Copy,
  Download,
  Shield,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { DiveRef } from "../types/dive";

export interface HadalMonolithProps {
  diveRef: DiveRef;
  onSonarPing?: (freq?: number) => void;
}

interface OperativePass {
  id: string;
  name: string;
  email: string;
  crewName: string;
  vector: string;
  timestamp: string;
  authHash: string;
}

export const HadalMonolith: React.FC<HadalMonolithProps> = ({
  diveRef,
  onSonarPing,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const doorLeftRef = useRef<HTMLDivElement>(null);
  const doorRightRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    operativeName: "",
    email: "",
    crewName: "",
    vector: "VEC-01 // NEURAL ECHOES (AI & Autonomous Agents)",
  });

  const [divePass, setDivePass] = useState<OperativePass | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleTicker = () => {
      if (!containerRef.current) return;
      const p = diveRef.current.progress;

      // Active between 84% and 100% scroll
      if (p < 0.82) {
        containerRef.current.style.opacity = "0";
        containerRef.current.style.pointerEvents = "none";
      } else if (p >= 0.82 && p <= 0.88) {
        // Fade in
        const t = (p - 0.82) / 0.06;
        containerRef.current.style.opacity = `${t}`;
        containerRef.current.style.transform = `translateY(${(1 - t) * 30}px)`;
        containerRef.current.style.pointerEvents = "auto";
      } else {
        // Fully visible at trench floor
        containerRef.current.style.opacity = "1";
        containerRef.current.style.transform = "translateY(0px)";
        containerRef.current.style.pointerEvents = "auto";
      }

      // Obsidian Monolith Doors Slide Apart between 89% and 99%
      if (doorLeftRef.current && doorRightRef.current) {
        if (p < 0.89) {
          doorLeftRef.current.style.transform = "translateX(0%)";
          doorRightRef.current.style.transform = "translateX(0%)";
        } else {
          const doorT = Math.min(1, (p - 0.89) / 0.09);
          const slidePercent = doorT * 105;
          doorLeftRef.current.style.transform = `translateX(-${slidePercent}%)`;
          doorRightRef.current.style.transform = `translateX(${slidePercent}%)`;
        }
      }
    };

    gsap.ticker.add(handleTicker);
    return () => gsap.ticker.remove(handleTicker);
  }, [diveRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.operativeName.trim() || !form.email.trim()) return;

    onSonarPing?.(1650);

    const randomId = "DSV-09-" + Math.floor(1000 + Math.random() * 9000);
    const hash =
      "0x" +
      Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      )
        .join("")
        .toUpperCase();

    const pass: OperativePass = {
      id: randomId,
      name: form.operativeName.trim(),
      email: form.email.trim(),
      crewName: form.crewName.trim() || "SOLO OPERATIVE",
      vector: form.vector,
      timestamp:
        new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
      authHash: hash,
    };

    setDivePass(pass);
  };

  const handleCopyPass = () => {
    if (!divePass) return;
    const text = `=== THE SIGNAL // 2026 OPERATIVE DIVE PASS ===\nPASS ID: ${divePass.id}\nOPERATIVE: ${divePass.name}\nEMAIL: ${divePass.email}\nCREW: ${divePass.crewName}\nVECTOR: ${divePass.vector}\nAUTH HASH: ${divePass.authHash}\nTIMESTAMP: ${divePass.timestamp}\nSTATUS: VERIFIED FOR HADAL ENTRY (10,994m)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setDivePass(null);
    setForm({
      operativeName: "",
      email: "",
      crewName: "",
      vector: "VEC-01 // NEURAL ECHOES (AI & Autonomous Agents)",
    });
  };

  return (
    <section
      ref={containerRef}
      className="absolute inset-0 flex flex-col justify-between items-center px-6 md:px-16 pt-20 pb-6 z-20 pointer-events-none transition-opacity duration-75 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl mx-auto my-auto pointer-events-auto">
        {/* Monolith Chamber Container with sliding doors */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-slate-950/90 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.25)] min-h-[500px]">
          {/* Obsidian Monolith Sliding Left Door */}
          <div
            ref={doorLeftRef}
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-slate-950 via-gray-950 to-slate-900 border-r border-cyan-400/60 z-30 flex items-center justify-end pr-4 transition-transform duration-100 ease-out shadow-[0_0_20px_rgba(0,0,0,0.9)]"
          >
            <div className="space-y-6 text-right font-mono text-[10px] text-cyan-400/40 tracking-widest uppercase">
              <div>// MONOLITH SECTOR L-09</div>
              <div className="w-12 h-[1px] bg-cyan-400/40 ml-auto" />
              <div>PRESSURE RESISTANT SEAL</div>
            </div>
          </div>

          {/* Obsidian Monolith Sliding Right Door */}
          <div
            ref={doorRightRef}
            className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-slate-950 via-gray-950 to-slate-900 border-l border-cyan-400/60 z-30 flex items-center justify-start pl-4 transition-transform duration-100 ease-out shadow-[0_0_20px_rgba(0,0,0,0.9)]"
          >
            <div className="space-y-6 text-left font-mono text-[10px] text-cyan-400/40 tracking-widest uppercase">
              <div>// MONOLITH SECTOR R-09</div>
              <div className="w-12 h-[1px] bg-cyan-400/40" />
              <div>SIGNAL HARVEST CHAMBER</div>
            </div>
          </div>

          {/* Central Interior Terminal Content */}
          <div className="relative z-10 p-6 sm:p-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyan-500/20 pb-4 mb-6">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 mb-2">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  <span>HADAL ZONE // 10,994M TOUCHDOWN</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight uppercase">
                  CREW REGISTRATION{" "}
                  <span className="text-cyan-400">TERMINAL</span>
                </h2>
              </div>
              <div className="text-right font-mono text-xs text-slate-400 mt-2 sm:mt-0">
                <span className="text-cyan-400 font-semibold">
                  SIGNAL SOURCE // REACHED
                </span>
                <div className="text-[10px] text-slate-500">
                  APERTURE READY FOR UPLOAD
                </div>
              </div>
            </div>

            {/* Form vs Generated Pass View */}
            {!divePass ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Operative Name */}
                  <div>
                    <label className="block text-xs font-mono text-cyan-300 mb-1.5 uppercase tracking-wider">
                      Operative Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Commander Sarah Chen"
                      value={form.operativeName}
                      onChange={(e) =>
                        setForm({ ...form, operativeName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-white placeholder-slate-500 text-sm font-sans focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>

                  {/* Comm Link / Email */}
                  <div>
                    <label className="block text-xs font-mono text-cyan-300 mb-1.5 uppercase tracking-wider">
                      Comm Link / Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="sarah@abyss.dev"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-white placeholder-slate-500 text-sm font-sans focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Crew / Team Name */}
                  <div>
                    <label className="block text-xs font-mono text-cyan-300 mb-1.5 uppercase tracking-wider">
                      Crew / Team Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Abyssal Pioneers (or Solo)"
                      value={form.crewName}
                      onChange={(e) =>
                        setForm({ ...form, crewName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-white placeholder-slate-500 text-sm font-sans focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>

                  {/* Selected Signal Vector Dropdown */}
                  <div>
                    <label className="block text-xs font-mono text-cyan-300 mb-1.5 uppercase tracking-wider">
                      Selected Signal Vector *
                    </label>
                    <select
                      value={form.vector}
                      onChange={(e) =>
                        setForm({ ...form, vector: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-white text-sm font-sans focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    >
                      <option value="VEC-01 // NEURAL ECHOES (AI & Autonomous Agents)">
                        VEC-01 // NEURAL ECHOES (AI & Autonomous Agents)
                      </option>
                      <option value="VEC-02 // ABYSSAL MESH (Distributed Systems)">
                        VEC-02 // ABYSSAL MESH (Distributed Systems)
                      </option>
                      <option value="VEC-03 // TRENCH PROTOCOL (Cryptography & Security)">
                        VEC-03 // TRENCH PROTOCOL (Cryptography & Security)
                      </option>
                      <option value="VEC-04 // OPEN CURRENT (Wildcard / Open Track)">
                        VEC-04 // OPEN CURRENT (Wildcard / Open Track)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-3 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ENCRYPTED DIRECT TELEMETRY TO MARIANA COMMAND</span>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 hover:from-cyan-400 hover:to-sky-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
                  >
                    <span>INITIALIZE DIVE</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* ================= GENERATED OPERATIVE DIVE PASS ================= */
              <div className="space-y-6 animate-fadeIn">
                <div className="relative p-6 rounded-xl border-2 border-cyan-400/80 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/60 shadow-[0_0_35px_rgba(6,182,212,0.35)]">
                  {/* Holographic Watermark Badge */}
                  <div className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-400 text-[10px] font-mono font-bold text-cyan-300">
                    <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" />
                    <span>AUTHENTICATED PASS</span>
                  </div>

                  <div className="text-[11px] font-mono text-cyan-400 tracking-widest uppercase mb-1">
                    DSV-09 EXPEDITION PASS // THE SIGNAL 2026
                  </div>
                  <div className="text-2xl font-display font-bold text-white mb-4">
                    {divePass.name}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs border-t border-b border-cyan-500/25 py-3 mb-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">
                        PASS ID
                      </div>
                      <div className="font-bold text-cyan-300">
                        {divePass.id}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">
                        CREW
                      </div>
                      <div className="font-bold text-slate-200 truncate">
                        {divePass.crewName}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">
                        CLEARANCE
                      </div>
                      <div className="font-bold text-cyan-300">
                        10,994m HADAL
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">
                        HASH
                      </div>
                      <div className="font-bold text-slate-300 truncate">
                        {divePass.authHash}
                      </div>
                    </div>
                  </div>

                  <div className="font-mono text-[11px] text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500">ASSIGNED VECTOR:</span>{" "}
                      <span className="text-cyan-200 font-semibold">
                        {divePass.vector}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {divePass.timestamp}
                    </div>
                  </div>
                </div>

                {/* Actions: Copy Data / Register Another */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white text-xs font-mono transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>REGISTER ANOTHER OPERATIVE</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCopyPass}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-cyan-500/40 bg-cyan-950/60 text-cyan-200 hover:bg-cyan-900/60 text-xs font-mono font-medium transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>COPIED TO CLIPBOARD</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY DIVE PASS</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PRINT / SAVE PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Clean Footer Credits as required by Section 6.6 */}
      <footer className="w-full max-w-4xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 pointer-events-auto">
        <div>
          THE SIGNAL // 2026 DEEP-SEA HACKATHON - MARIANA TRENCH EXPLORATION
        </div>
        <div className="mt-2 sm:mt-0">
          3D Submarine model by{" "}
          <a
            href="https://sketchfab.com/Coder123123"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Coder123123
          </a>{" "}
          (
          <a
            href="http://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            CC Attribution
          </a>
          )
        </div>
      </footer>
    </section>
  );
};
