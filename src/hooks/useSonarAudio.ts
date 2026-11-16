import { useRef, useState, useCallback, useEffect } from 'react';

export interface SonarAudioEngine {
  isMuted: boolean;
  toggleAudio: () => void;
  playPing: (freq?: number) => void;
  updateDepth: (depthMeters: number) => void;
}

export function useSonarAudio(): SonarAudioEngine {
  const [isMuted, setIsMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const subOscRef = useRef<OscillatorNode | null>(null);
  const subGainRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isInitializedRef = useRef(false);

  const initAudio = useCallback(() => {
    if (isInitializedRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain
      const master = ctx.createGain();
      master.gain.value = 0; // start silent
      master.connect(ctx.destination);
      masterGainRef.current = master;

      // Ambient Hydrophone Hum: Brown Noise Buffer
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise integration
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // boost volume
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      noiseSourceRef.current = noiseSource;

      // Hydrophone low-pass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 380; // Surface cutoff
      filter.Q.value = 3.5;
      filterRef.current = filter;

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.45;

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(master);
      noiseSource.start();

      // 58Hz Sub-Bass Oscillator (Deep Pressure Rumble)
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.value = 58;
      subOscRef.current = subOsc;

      const subGain = ctx.createGain();
      subGain.gain.value = 0.22;
      subGainRef.current = subGain;

      subOsc.connect(subGain);
      subGain.connect(master);
      subOsc.start();

      isInitializedRef.current = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }

    setIsMuted((prev) => {
      const next = !prev;
      if (masterGainRef.current && ctx) {
        masterGainRef.current.gain.setTargetAtTime(next ? 0 : 0.65, ctx.currentTime, 0.08);
      }
      return next;
    });
  }, [initAudio]);

  const playPing = useCallback((freq = 1320) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Slight pitch glide for underwater chirp
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.9);

      // Ping envelope: instantaneous attack, exponential decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.38, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      // Simple reverberation/echo delay node
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.28;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.42;

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Delay loop
      gain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      feedback.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.5);
    } catch {
      // Audio not permitted yet
    }
  }, []);

  const updateDepth = useCallback((depthMeters: number) => {
    const ctx = audioCtxRef.current;
    const filter = filterRef.current;
    const subGain = subGainRef.current;
    if (!ctx || !filter || !subGain) return;

    // Cutoff frequency drops from ~420Hz (surface) to ~75Hz (Mariana trench)
    const depthFrac = Math.min(1, Math.max(0, depthMeters / 10994));
    const targetFreq = 420 - depthFrac * 345;
    filter.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);

    // Sub-bass rumble increases at extreme depth
    const subVolume = 0.2 + depthFrac * 0.45;
    subGain.gain.setTargetAtTime(subVolume, ctx.currentTime, 0.1);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return { isMuted, toggleAudio, playPing, updateDepth };
}
