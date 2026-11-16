import React, { useState, useRef, useEffect, useCallback } from "react";

// Character pool for deciphering / decoding glitch effect
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}-=+*^?#";

export interface NavScrambleButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const NavScrambleButton: React.FC<NavScrambleButtonProps> = ({
  label,
  onClick,
  className = "",
  style,
}) => {
  const [displayText, setDisplayText] = useState(label);
  const intervalRef = useRef<number | null>(null);

  const startScramble = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    let iteration = 0;
    const maxIteration = label.length;

    intervalRef.current = window.setInterval(() => {
      setDisplayText(
        label
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < Math.floor(iteration)) {
              return label[index]; // Correct character found & locked in
            }
            // Scrambling character
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join(""),
      );

      // Decodes each character progressively from left to right (~3 cycles per letter)
      iteration += 1 / 2.8;

      if (iteration >= maxIteration) {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setDisplayText(label);
      }
    }, 28);
  }, [label]);

  const stopScramble = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplayText(label);
  }, [label]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <button
      onClick={onClick}
      onMouseEnter={startScramble}
      onMouseLeave={stopScramble}
      style={style}
      className={className}
    >
      <span className="nav-scramble-text">{displayText}</span>
      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee] group-hover:w-full transition-all duration-200" />
    </button>
  );
};
