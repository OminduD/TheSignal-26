import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DiveRef, DiveState, DepthZone } from '../types/dive';

gsap.registerPlugin(ScrollTrigger);

export interface UseDiveScrollOptions {
  onZoneChange?: (newZone: DepthZone, oldZone: DepthZone) => void;
  onDepthUpdate?: (depthMeters: number) => void;
}

export function useDiveScroll(options?: UseDiveScrollOptions) {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const diveRef: DiveRef = useRef<DiveState>({
    progress: 0,
    velocity: 0,
    depthMeters: 0,
    pressureAtm: 1,
    zone: 'EPIPELAGIC',
    hullIntegrity: 100,
    o2Reserves: 100,
    isAudioMuted: true,
    pointer: { x: 0, y: 0 },
  });

  const lastZoneRef = useRef<DepthZone>('EPIPELAGIC');

  useEffect(() => {
    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    // Sync Lenis scroll events cleanly with GSAP ScrollTrigger
    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // 2. Mouse / Pointer Tracking for Submarine Parallax & Flashlight
    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      diveRef.current.pointer.x = nx;
      diveRef.current.pointer.y = ny;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // 3. GSAP ScrollTrigger across the 650vh track (pure linear momentum without jitter)
    const trigger = ScrollTrigger.create({
      trigger: scrollContainerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        diveRef.current.progress = p;
        diveRef.current.velocity = self.getVelocity();
        diveRef.current.depthMeters = Math.round(p * 10994);
        diveRef.current.pressureAtm = Math.round(1 + p * 1099);

        // Determine Zone
        let currentZone: DepthZone = 'EPIPELAGIC';
        if (p < 0.25) {
          currentZone = 'EPIPELAGIC';
        } else if (p < 0.45) {
          currentZone = 'MESOPELAGIC';
        } else if (p < 0.65) {
          currentZone = 'BATHYPELAGIC';
        } else if (p < 0.85) {
          currentZone = 'ABYSSAL';
        } else {
          currentZone = 'HADAL';
        }

        if (currentZone !== lastZoneRef.current) {
          options?.onZoneChange?.(currentZone, lastZoneRef.current);
          lastZoneRef.current = currentZone;
        }
        diveRef.current.zone = currentZone;

        // Hull Integrity curve: 100% normal, falls to 74% at crush depth threshold (55% - 63%)
        if (p < 0.55) {
          diveRef.current.hullIntegrity = 100;
        } else if (p <= 0.65) {
          const frac = (p - 0.55) / 0.10;
          diveRef.current.hullIntegrity = Math.round(100 - frac * 26);
        } else {
          diveRef.current.hullIntegrity = 74;
        }

        // O2 Reserves: slight realistic decline
        diveRef.current.o2Reserves = Math.round(100 - p * 14);

        // Audio depth update callback
        options?.onDepthUpdate?.(diveRef.current.depthMeters);
      },
    });

    return () => {
      trigger.kill();
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [options]);

  return {
    scrollContainerRef,
    diveRef,
    lenisRef,
  };
}
