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

type SoundType =
  | 'planetClick'
  | 'planetEnter'
  | 'planetComplete'
  | 'returnGalaxy'
  | 'buttonClick'
  | 'cardFlip'
  | 'flowerCollect';

interface SoundState {
  sfxEnabled: boolean;
  musicEnabled: boolean;

  toggleSfx: () => void;
  toggleMusic: () => void;

  play: (type: SoundType) => void;
  unlock: () => void;

  stopMusic: () => void;
  resumeMusic: () => void;
}

const SFX_KEY = 'universe-sfx';
const MUSIC_KEY = 'universe-music';

const MUSIC_FILE = `${import.meta.env.BASE_URL}assets/birthday-song.mp3`;
const MUSIC_VOLUME = 0.25;

const SoundContext =
  createContext<SoundState | null>(null);

export function SoundProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [sfxEnabled, setSfxEnabled] =
    useState(true);

  const [musicEnabled, setMusicEnabled] =
    useState(true);

  const ctxRef =
    useRef<AudioContext | null>(null);

  const masterGainRef =
    useRef<GainNode | null>(null);

  const musicRef =
    useRef<HTMLAudioElement | null>(null);

  const unlockedRef =
    useRef(false);

  const musicEnabledRef =
    useRef(true);

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    try {
      const savedSfx =
        localStorage.getItem(SFX_KEY);

      const savedMusic =
        localStorage.getItem(MUSIC_KEY);

      if (savedSfx !== null) {
        setSfxEnabled(
          savedSfx === 'true'
        );
      }

      if (savedMusic !== null) {
        const enabled =
          savedMusic === 'true';

        setMusicEnabled(enabled);
        musicEnabledRef.current =
          enabled;
      }
    } catch {
      // ignore
    }
  }, []);

  // =====================================================
  // SYNC MUSIC STATE
  // =====================================================

  useEffect(() => {
    musicEnabledRef.current =
      musicEnabled;
  }, [musicEnabled]);

  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        SFX_KEY,
        String(sfxEnabled)
      );
    } catch {
      // ignore
    }
  }, [sfxEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(
        MUSIC_KEY,
        String(musicEnabled)
      );
    } catch {
      // ignore
    }
  }, [musicEnabled]);

  // =====================================================
  // AUDIO CONTEXT
  // =====================================================

  const ensureContext =
    useCallback(() => {
      if (!ctxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as unknown as {
              webkitAudioContext?:
                typeof AudioContext;
            }
          ).webkitAudioContext;

        if (!AudioContextClass) {
          return null;
        }

        const ctx =
          new AudioContextClass();

        const masterGain =
          ctx.createGain();

        masterGain.gain.value =
          0.55;

        masterGain.connect(
          ctx.destination
        );

        ctxRef.current = ctx;
        masterGainRef.current =
          masterGain;
      }

      return ctxRef.current;
    }, []);

  // =====================================================
  // CREATE WEBSITE MUSIC
  // =====================================================

  useEffect(() => {
    const audio =
      new Audio(MUSIC_FILE);

    audio.loop = true;
    audio.preload = 'auto';
    audio.volume =
      MUSIC_VOLUME;

    audio.setAttribute(
      'playsinline',
      ''
    );

    audio.addEventListener(
      'canplay',
      () => {
        console.log(
          '🎵 Website background music loaded'
        );
      }
    );

    audio.addEventListener(
      'error',
      () => {
        console.error(
          '❌ Website background music error:',
          audio.error
        );
      }
    );

    musicRef.current =
      audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;

      musicRef.current =
        null;
    };
  }, []);

  // =====================================================
  // START WEBSITE MUSIC
  // =====================================================

  const startMusic =
    useCallback(() => {
      const music =
        musicRef.current;

      if (!music) return;

      if (
        !musicEnabledRef.current
      ) {
        return;
      }

      music.volume =
        MUSIC_VOLUME;

      music
        .play()
        .then(() => {
          console.log(
            '🎵 Website background music playing'
          );
        })
        .catch((error) => {
          console.warn(
            '⚠️ Website music could not play:',
            error
          );
        });
    }, []);

  // =====================================================
  // STOP WEBSITE MUSIC
  // =====================================================

  const stopMusic =
    useCallback(() => {
      const music =
        musicRef.current;

      if (!music) return;

      music.pause();

      console.log(
        '🔇 Website background music STOPPED'
      );
    }, []);

  // =====================================================
  // RESUME WEBSITE MUSIC
  // =====================================================

  const resumeMusic =
    useCallback(() => {
      if (
        !musicEnabledRef.current
      ) {
        return;
      }

      startMusic();
    }, [startMusic]);

  // =====================================================
  // UNLOCK AUDIO
  //
  // IMPORTANT:
  // unlock() TIDAK lagi menjalankan
  // website background music.
  // =====================================================

  const unlock =
    useCallback(() => {
      const ctx =
        ensureContext();

      if (
        ctx &&
        ctx.state === 'suspended'
      ) {
        ctx.resume().catch(() => {});
      }

      unlockedRef.current =
        true;

      console.log(
        '🔓 Audio unlocked'
      );
    }, [ensureContext]);

  // =====================================================
  // PLAY SFX TONE
  // =====================================================

  const playTone =
    useCallback(
      (
        frequency: number,
        duration: number,
        type: OscillatorType,
        volume: number,
        delay = 0
      ) => {
        if (!sfxEnabled) return;

        const ctx =
          ensureContext();

        if (!ctx) return;

        if (
          ctx.state === 'suspended'
        ) {
          ctx.resume().catch(() => {});
        }

        const now =
          ctx.currentTime +
          delay;

        const oscillator =
          ctx.createOscillator();

        const gain =
          ctx.createGain();

        oscillator.type =
          type;

        oscillator.frequency.setValueAtTime(
          frequency,
          now
        );

        gain.gain.setValueAtTime(
          0.0001,
          now
        );

        gain.gain.linearRampToValueAtTime(
          volume,
          now + 0.02
        );

        gain.gain.exponentialRampToValueAtTime(
          0.001,
          now + duration
        );

        oscillator.connect(gain);

        gain.connect(
          masterGainRef.current ??
            ctx.destination
        );

        oscillator.start(now);

        oscillator.stop(
          now +
            duration +
            0.05
        );
      },
      [
        sfxEnabled,
        ensureContext,
      ]
    );

  // =====================================================
  // PLAY SFX
  // =====================================================

  const play =
    useCallback(
      (type: SoundType) => {
        if (
          !unlockedRef.current
        ) {
          unlock();
        }

        if (!sfxEnabled) return;

        switch (type) {
          case 'planetClick':
            playTone(
              880,
              0.15,
              'sine',
              0.12
            );

            playTone(
              1320,
              0.12,
              'sine',
              0.06,
              0.04
            );
            break;

          case 'planetEnter':
            playTone(
              440,
              0.4,
              'sine',
              0.08
            );

            playTone(
              660,
              0.5,
              'sine',
              0.06,
              0.1
            );

            playTone(
              880,
              0.6,
              'sine',
              0.04,
              0.2
            );
            break;

          case 'planetComplete':
            playTone(
              523,
              0.2,
              'sine',
              0.1
            );

            playTone(
              659,
              0.2,
              'sine',
              0.1,
              0.12
            );

            playTone(
              784,
              0.3,
              'sine',
              0.1,
              0.24
            );

            playTone(
              1047,
              0.4,
              'sine',
              0.08,
              0.36
            );
            break;

          case 'returnGalaxy':
            playTone(
              660,
              0.3,
              'sine',
              0.07
            );

            playTone(
              440,
              0.45,
              'sine',
              0.05,
              0.12
            );
            break;

          case 'buttonClick':
            playTone(
              660,
              0.08,
              'sine',
              0.06
            );
            break;

          case 'cardFlip':
            playTone(
              520,
              0.1,
              'triangle',
              0.07
            );
            break;

          case 'flowerCollect':
            playTone(
              700,
              0.12,
              'sine',
              0.08
            );

            playTone(
              1000,
              0.15,
              'sine',
              0.05,
              0.06
            );
            break;
        }
      },
      [
        sfxEnabled,
        playTone,
        unlock,
      ]
    );

  // =====================================================
  // TOGGLE SFX
  // =====================================================

  const toggleSfx =
    useCallback(() => {
      setSfxEnabled(
        previous => !previous
      );

      unlock();
    }, [unlock]);

  // =====================================================
  // TOGGLE MUSIC
  // =====================================================

  const toggleMusic =
    useCallback(() => {
      const music =
        musicRef.current;

      const nextEnabled =
        !musicEnabledRef.current;

      musicEnabledRef.current =
        nextEnabled;

      setMusicEnabled(
        nextEnabled
      );

      if (nextEnabled) {
        startMusic();
      } else {
        music?.pause();
      }
    }, [startMusic]);

  // =====================================================
  // CONTEXT
  // =====================================================

  const value =
    useMemo<SoundState>(
      () => ({
        sfxEnabled,
        musicEnabled,

        toggleSfx,
        toggleMusic,

        play,
        unlock,

        stopMusic,
        resumeMusic,
      }),
      [
        sfxEnabled,
        musicEnabled,
        toggleSfx,
        toggleMusic,
        play,
        unlock,
        stopMusic,
        resumeMusic,
      ]
    );

  return (
    <SoundContext.Provider
      value={value}
    >
      {children}
    </SoundContext.Provider>
  );
}

// =====================================================
// USE SOUND
// =====================================================

export function useSound() {
  const ctx =
    useContext(SoundContext);

  if (!ctx) {
    throw new Error(
      'useSound must be used within SoundProvider'
    );
  }

  return ctx;
}