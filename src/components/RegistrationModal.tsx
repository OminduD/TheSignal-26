import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Shield, Users, Mail, GraduationCap, Compass, Send, ChevronDown, Check } from 'lucide-react';
import { SignalLogo } from './SignalLogo';

export interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRACK_OPTIONS = [
  '01. Neural Currents (AI & ML)',
  '02. Abyssal Grid (Cloud & Systems)',
  '03. Trench Shield (Cybersecurity & FinTech)',
  '04. Open Horizon (Open Innovation)',
];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const [teamName, setTeamName] = useState('');
  const [university, setUniversity] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [email, setEmail] = useState('');
  const [track, setTrack] = useState(TRACK_OPTIONS[0]);
  const [isTrackDropdownOpen, setIsTrackDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [accessHash, setAccessHash] = useState('');

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsTrackDropdownOpen(false);
      }
    };
    if (isTrackDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTrackDropdownOpen]);

  // Lock body scroll while modal is open & listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTrackDropdownOpen) {
          setIsTrackDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isTrackDropdownOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !leaderName || !email) return;

    // Generate unique verification hash
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    setAccessHash(`SIG26-${randomHex}`);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setTeamName('');
    setUniversity('');
    setLeaderName('');
    setEmail('');
    setTrack(TRACK_OPTIONS[0]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg my-auto max-h-[90dvh] overflow-y-auto rounded-2xl border border-cyan-400/40 bg-gradient-to-b from-[#020b18]/98 via-slate-950/98 to-[#010612]/98 backdrop-blur-2xl p-5 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.3),inset_0_1px_0_rgba(34,211,238,0.25)] text-left">
        {/* Tactical HUD Corner Reticles */}
        <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-cyan-400/70 rounded-tl pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-cyan-400/70 rounded-tr pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-cyan-400/70 rounded-bl pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-cyan-400/70 rounded-br pointer-events-none" />

        {/* Glowing Telemetry Top Accent Line */}
        <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none shadow-[0_0_8px_#22d3ee]" />

        {/* Close Button (Min 44x44px touch target) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-colors z-10"
          aria-label="Close Registration Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            {/* Header */}
            <div className="mb-5 sm:mb-6 pr-8">
              <div className="flex items-center space-x-3 mb-2.5">
                <SignalLogo size="lg" animated={true} className="drop-shadow-[0_0_18px_rgba(34,211,238,0.5)] flex-shrink-0" />
                <div>
                  <div className="inline-flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-semibold px-2.5 py-0.5 rounded-full border border-cyan-400/30 bg-cyan-950/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    <Shield className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>EXPEDITION MANIFEST // 2026</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <img
                      src="./images/ieee-cs-white.png"
                      alt="IEEE Computer Society of UCSC"
                      className="h-4 sm:h-5 w-auto object-contain opacity-85"
                    />
                    <span className="text-[10px] font-mono tracking-wider text-slate-400">
                      IEEE CS UCSC
                    </span>
                  </div>
                </div>
              </div>
              <h2
                id="modal-title"
                style={{ fontFamily: '"Archivo Black", sans-serif', fontWeight: 400, fontStyle: 'normal' }}
                className="archivo-black-regular text-2xl sm:text-3xl tracking-tight text-white uppercase drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]"
              >
                Register Your Crew
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                Enter your expedition telemetry to secure your spot in THE SIGNAL 2026.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Team Name */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Team Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abyssal Pioneers"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 text-white text-base sm:text-sm placeholder-slate-500 outline-none transition-all"
                />
              </div>

              {/* University */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>University / Institute *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UCSC"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 text-white text-base sm:text-sm placeholder-slate-500 outline-none transition-all"
                />
              </div>

              {/* Crew Leader Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Leader Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Silva"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 text-white text-base sm:text-sm placeholder-slate-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Mail className="w-3 h-3 text-cyan-400" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@student.cmb.ac.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 text-white text-base sm:text-sm placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Track Selection (Custom Themed Dropdown aligned with Cyber Deep-Sea Theme) */}
              <div ref={dropdownRef} className="relative">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Assigned Track *</span>
                  </div>
                  <span className="text-[9.5px] text-cyan-400/80 font-mono tracking-wider">SECTOR SPEC</span>
                </label>

                {/* Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsTrackDropdownOpen((prev) => !prev)}
                  className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-lg bg-slate-900/90 border flex items-center justify-between text-left text-sm transition-all cursor-pointer backdrop-blur-md outline-none ${
                    isTrackDropdownOpen
                      ? 'border-cyan-400 ring-1 ring-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] text-white'
                      : 'border-slate-700 hover:border-cyan-400/60 text-slate-100 hover:bg-slate-800/80'
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={isTrackDropdownOpen}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] flex-shrink-0" />
                    <span className="font-mono text-xs sm:text-sm text-slate-100 truncate">{track}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan-400 ml-2 flex-shrink-0 transition-transform duration-200 ${
                      isTrackDropdownOpen ? 'rotate-180 text-cyan-300' : ''
                    }`}
                  />
                </button>

                {/* Custom Themed Options Menu (In document flow to prevent overlap & text bleed) */}
                {isTrackDropdownOpen && (
                  <div
                    role="listbox"
                    className="w-full mt-2 p-1.5 rounded-xl bg-[#020b18]/95 border border-cyan-400/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(6,182,212,0.15)] animate-fadeIn space-y-1"
                  >
                    {TRACK_OPTIONS.map((opt) => {
                      const isSelected = track === opt;
                      return (
                        <div
                          key={opt}
                          role="option"
                          aria-selected={isSelected}
                          tabIndex={0}
                          onClick={() => {
                            setTrack(opt);
                            setIsTrackDropdownOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setTrack(opt);
                              setIsTrackDropdownOpen(false);
                            }
                          }}
                          className={`w-full px-3.5 py-2.5 min-h-[42px] rounded-lg text-xs sm:text-sm font-mono flex items-center justify-between transition-all cursor-pointer select-none outline-none ${
                            isSelected
                              ? 'bg-cyan-500/25 text-cyan-200 border-l-2 border-cyan-400 shadow-[inset_0_0_12px_rgba(6,182,212,0.2)] font-semibold'
                              : 'text-slate-300 hover:text-white hover:bg-cyan-950/60 hover:pl-4 focus:bg-cyan-950/60 focus:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 truncate pr-2">
                            <span
                              className={`w-1.5 h-3.5 rounded-full flex-shrink-0 transition-all ${
                                isSelected ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-700'
                              }`}
                            />
                            <span className="truncate">{opt}</span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 ml-1.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit CTA (Min 48px touch height) */}
              <button
                type="submit"
                className="w-full mt-4 min-h-[48px] py-3.5 px-5 rounded-lg border border-cyan-400/80 bg-gradient-to-r from-cyan-500/25 via-sky-500/35 to-blue-500/25 hover:from-cyan-500/35 hover:to-blue-500/35 active:from-cyan-500/50 active:to-blue-500/50 text-white font-mono text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98]"
              >
                <span>TRANSMIT CREW MANIFEST</span>
                <Send className="w-4 h-4 text-cyan-300" />
              </button>
            </form>
          </>
        ) : (
          /* Confirmation State */
          <div className="py-4 sm:py-6 text-center space-y-4 sm:space-y-5 animate-fadeIn">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)]">
              <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-cyan-400" />
            </div>

            <div>
              <div className="text-[10px] sm:text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                TRANSMISSION CONFIRMED // CREW REGISTERED
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
                Airlock Sealed. Welcome Aboard.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 sm:mt-2 max-w-sm mx-auto">
                Your manifest has been logged on the abyssal ledger. Prepare your crew for kickoff.
              </p>
            </div>

            {/* Crew Credentials Receipt */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/70 border border-cyan-400/25 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">VENUE:</span>
                <span className="text-cyan-300 font-semibold truncate ml-2">100% ONLINE (VIRTUAL)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">HOST:</span>
                <span className="text-slate-200 truncate ml-2">IEEE CS UCSC</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">TEAM:</span>
                <span className="text-white font-semibold truncate ml-2">{teamName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">INSTITUTION:</span>
                <span className="text-slate-200 truncate ml-2">{university}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">LEADER:</span>
                <span className="text-slate-200 truncate ml-2">{leaderName} ({email})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">TRACK:</span>
                <span className="text-cyan-300 truncate ml-2">{track}</span>
              </div>
              <div className="flex justify-between pt-1 text-cyan-400">
                <span>ACCESS PASS:</span>
                <span className="font-bold tracking-widest">{accessHash}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full min-h-[44px] py-3 px-4 rounded-lg border border-cyan-400/40 bg-slate-900 hover:bg-slate-800 text-cyan-200 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer active:scale-[0.98]"
            >
              DISMISS AIRLOCK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
