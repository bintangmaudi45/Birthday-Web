import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type SoundType = 'planetClick' | 'planetEnter' | 'planetComplete' | 'returnGalaxy' | 'buttonClick' | 'cardFlip' | 'flowerCollect';

interface SoundState {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  toggleSfx: () => void;
  toggleMusic: () => void;
  play: (type: SoundType) => void;
  unlock: () => void;
}

const SFX_KEY = 'universe-sfx';
const MUSIC_KEY = 'universe-music';

const SoundContext = createContext<SoundState | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const musicNodesRef = useRef<{ oscillators: OscillatorNode[]; lfos: OscillatorNode[]; gain: GainNode } | null>(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    try {
      const sfx = localStorage.getItem(SFX_KEY);
      const music = localStorage.getItem(MUSIC_KEY);
      if (sfx !== null) setSfxEnabled(sfx === 'true');
      if (music !== null) setMusicEnabled(music === 'true');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SFX_KEY, String(sfxEnabled));
    } catch {
      // ignore
    }
  }, [sfxEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(MUSIC_KEY, String(musicEnabled));
    } catch {
      // ignore
    }
  }, [musicEnabled]);

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      const ctx = new Ctor();
      const gain = ctx.createGain();
      gain.gain.value = 0.5;
      gain.connect(ctx.destination);
      ctxRef.current = ctx;
      masterGainRef.current = gain;
    }
    return ctxRef.current;
  }, []);

  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    const ctx = ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    unlockedRef.current = true;
    setAudioUnlocked(true);
  }, [ensureContext]);

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType, volume: number, delay = 0) => {
      if (!sfxEnabled) return;
      const ctx = ensureContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(masterGainRef.current ?? ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    },
    [sfxEnabled, ensureContext]
  );

  const play = useCallback(
    (type: SoundType) => {
      if (!sfxEnabled) return;
      switch (type) {
        case 'planetClick':
          playTone(880, 0.15, 'sine', 0.12);
          playTone(1320, 0.12, 'sine', 0.06, 0.04);
          break;
        case 'planetEnter':
          playTone(440, 0.4, 'sine', 0.08);
          playTone(660, 0.5, 'sine', 0.06, 0.1);
          playTone(880, 0.6, 'sine', 0.04, 0.2);
          break;
        case 'planetComplete':
          playTone(523, 0.2, 'sine', 0.1);
          playTone(659, 0.2, 'sine', 0.1, 0.12);
          playTone(784, 0.3, 'sine', 0.1, 0.24);
          playTone(1047, 0.4, 'sine', 0.08, 0.36);
          break;
        case 'returnGalaxy':
          playTone(660, 0.3, 'sine', 0.07);
          playTone(440, 0.45, 'sine', 0.05, 0.12);
          break;
        case 'buttonClick':
          playTone(660, 0.08, 'sine', 0.06);
          break;
        case 'cardFlip':
          playTone(520, 0.1, 'triangle', 0.07);
          break;
        case 'flowerCollect':
          playTone(700, 0.12, 'sine', 0.08);
          playTone(1000, 0.15, 'sine', 0.05, 0.06);
          break;
      }
    },
    [sfxEnabled, playTone]
  );

  // background ambient music
  useEffect(() => {
    if (!musicEnabled) {
      if (musicNodesRef.current) {
        musicNodesRef.current.oscillators.forEach((osc) => {
          try { osc.stop(); } catch { /* already stopped */ }
        });
        musicNodesRef.current.lfos.forEach((lfo) => {
          try { lfo.stop(); } catch { /* already stopped */ }
        });
        musicNodesRef.current = null;
      }
      return;
    }

    if (!unlockedRef.current) return;
    const ctx = ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (musicNodesRef.current) return;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 3);
    gain.connect(masterGainRef.current ?? ctx.destination);

    const freqs = [220, 277, 330, 415];
    const lfos: OscillatorNode[] = [];
    const oscillators = freqs.map((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      oscGain.gain.value = 0.25 / freqs.length;
      // slow LFO for gentle movement
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.08 + i * 0.03;
      lfoGain.gain.value = 0.015;
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();
      lfos.push(lfo);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      return osc;
    });

    musicNodesRef.current = { oscillators, lfos, gain };

    return () => {
      if (musicNodesRef.current) {
        musicNodesRef.current.oscillators.forEach((osc) => {
          try { osc.stop(); } catch { /* already stopped */ }
        });
        musicNodesRef.current.lfos.forEach((lfo) => {
          try { lfo.stop(); } catch { /* already stopped */ }
        });
        musicNodesRef.current = null;
      }
    };
  }, [musicEnabled, ensureContext, audioUnlocked]);

  const toggleSfx = useCallback(() => setSfxEnabled((prev) => !prev), []);
  const toggleMusic = useCallback(() => {
    setMusicEnabled((prev) => !prev);
    unlock();
  }, [unlock]);

  const value = useMemo<SoundState>(
    () => ({ sfxEnabled, musicEnabled, toggleSfx, toggleMusic, play, unlock }),
    [sfxEnabled, musicEnabled, toggleSfx, toggleMusic, play, unlock]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within SoundProvider');
  return ctx;
}
