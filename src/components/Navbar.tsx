import React, { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { NavScrambleButton } from './ScrambleText';
import { SignalLogo } from './SignalLogo';

export interface NavbarProps {
  onScrollTo: (percent: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onScrollTo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Briefing', percent: 25 },
    { label: 'Tracks', percent: 50 },
    { label: 'Timeline', percent: 72 },
    { label: 'Organizers', percent: 95 },
  ];

  const handleLinkClick = (percent: number) => {
    onScrollTo(percent);
    setMobileMenuOpen(false);
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-transparent border-none transition-all duration-200">
      <div className="w-full px-4 sm:px-10 md:px-14 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-6 md:pt-7 flex items-center justify-between">
        {/* Left: Event logo / wordmark relocated to far top-left edge, styled with Quantico */}
        <div
          onClick={() => handleLinkClick(0)}
          className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group select-none min-h-[44px]"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLinkClick(0);
            }
          }}
          aria-label="The Signal 2026 Home"
        >
          {/* Official The Signal Hydrophone Sonar Logo */}
          <SignalLogo
            size="md"
            animated={true}
            className="flex-shrink-0 drop-shadow-[0_0_14px_rgba(34,211,238,0.45)] group-hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.7)] transition-all"
          />

          <div
            style={{ fontFamily: '"Quantico", sans-serif' }}
            className="flex items-baseline space-x-1.5 sm:space-x-2 tracking-widest text-lg sm:text-2xl font-bold uppercase text-white group-hover:text-cyan-200 transition-colors drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
          >
            <span>THE SIGNAL</span>
            <span className="text-cyan-400 text-xs sm:text-base font-bold tracking-wider">
              // &apos;26
            </span>
          </div>

          {/* Official IEEE Computer Society UCSC Host Logo in Topbar (Desktop) */}
          <div className="hidden lg:flex items-center pl-3.5 border-l border-slate-700/60 ml-1">
            <img
              src="./images/ieee-cs-white.png"
              alt="IEEE Computer Society of UCSC"
              className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]"
            />
          </div>
        </div>

        {/* Right: Nav Links with Iceberg font and hacker decoding scramble animation on hover (Desktop/Tablet) */}
        <div className="hidden md:flex items-center space-x-8 sm:space-x-10">
          {navLinks.map((link) => (
            <NavScrambleButton
              key={link.label}
              label={link.label}
              onClick={() => handleLinkClick(link.percent)}
              style={{ fontFamily: '"Iceberg", "Geo", cursive, sans-serif' }}
              className="text-sm sm:text-[15px] tracking-widest uppercase text-slate-300 hover:text-cyan-300 transition-colors py-1 relative group cursor-pointer select-none"
            />
          ))}
        </div>

        {/* Mobile menu toggle (Mobile touch target >= 44x44px) */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg text-slate-300 hover:text-white border border-cyan-400/30 bg-slate-950/80 backdrop-blur-md active:bg-cyan-950/50 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-cyan-300" />
            ) : (
              <Menu className="w-5 h-5 text-cyan-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Backdrop Blur */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-3 px-4 pt-3 pb-4 space-y-1 rounded-xl bg-slate-950/95 border border-cyan-400/30 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.9)] animate-fadeIn">
          <div className="flex items-center space-x-2.5 pb-2.5 mb-2 border-b border-cyan-500/20 px-1">
            <SignalLogo size="xs" animated={true} />
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">
              EXPEDITION NAVIGATION // 2026
            </span>
          </div>

          {navLinks.map((link) => (
            <NavScrambleButton
              key={link.label}
              label={link.label}
              onClick={() => handleLinkClick(link.percent)}
              style={{ fontFamily: '"Iceberg", "Geo", cursive, sans-serif' }}
              className="w-full text-left px-3.5 py-3 min-h-[44px] flex items-center text-sm uppercase tracking-widest text-slate-200 hover:text-cyan-200 hover:bg-cyan-950/50 rounded-lg transition-colors relative group active:bg-cyan-900/60"
            />
          ))}

          {/* Mobile Menu Host Credential Footer */}
          <div className="pt-3 mt-2 border-t border-cyan-400/20 flex items-center justify-between px-2 text-[10px] font-mono text-cyan-300/90">
            <img
              src="./images/ieee-cs-white.png"
              alt="IEEE CS UCSC"
              className="h-5 w-auto object-contain opacity-85"
            />
            <span className="flex items-center space-x-1 font-semibold">
              <Globe className="w-3 h-3 text-cyan-400 inline-block" />
              <span>100% ONLINE</span>
            </span>
          </div>
        </div>
      )}
    </nav>
  );
};
