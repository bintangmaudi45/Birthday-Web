import { useEffect, useRef, useState } from 'react';
import StarField from './StarField';

interface Props {
  onStart: () => void;
}

type Phase = 'fadein' | 'welcome' | 'message' | 'button' | 'launching';

const TIMING = {
  fadein: 1200,
  welcome: 2600,
  message: 2600,
};

export default function OpeningSequence({ onStart }: Props) {
  const [phase, setPhase] = useState<Phase>('fadein');
  const [warp, setWarp] = useState(0);
  const [intensity, setIntensity] = useState(0.15);
  const [launching, setLaunching] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase('welcome'), TIMING.fadein));
    timers.push(window.setTimeout(() => setIntensity(0.4), TIMING.fadein + 400));
    timers.push(window.setTimeout(() => setPhase('message'), TIMING.fadein + TIMING.welcome));
    timers.push(window.setTimeout(() => setIntensity(0.7), TIMING.fadein + TIMING.welcome + 600));
    timers.push(
      window.setTimeout(() => setPhase('button'), TIMING.fadein + TIMING.welcome + TIMING.message)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const handleStart = () => {
    if (launching) return;
    setLaunching(true);
    setPhase('launching');
    // ramp warp
    const start = performance.now();
    const duration = 1600;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setWarp(t * t);
      setIntensity(0.7 + t * 0.3);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        onStart();
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#04050c]">
      <StarField intensity={intensity} warp={warp} className="absolute inset-0" />

      {/* faint central glow that grows */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: '60vmin',
          height: '60vmin',
          background:
            'radial-gradient(circle, rgba(255,220,160,0.12) 0%, rgba(120,90,180,0.06) 40%, transparent 70%)',
          opacity: intensity,
          transform: `translate(-50%, -50%) scale(${0.6 + intensity * 0.8 + warp * 1.5})`,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* text content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
        <div
          className="transition-all duration-[1600ms] ease-out"
          style={{
            opacity: phase === 'fadein' ? 0 : 1,
            transform: phase === 'fadein' ? 'translateY(20px)' : 'translateY(0)',
          }}
        >
          <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.5em] text-amber-200/70">
            A Tour Through
          </p>
          <h1 className="mt-3 font-[var(--font-display)] text-2xl font-light tracking-[0.25em] text-white/90 sm:text-3xl">
            YOUR UNIVERSE
          </h1>
        </div>

        {phase !== 'fadein' && (
          <div
            className="mt-10 transition-all duration-[2000ms] ease-out"
            style={{
              opacity: ['welcome', 'message', 'button', 'launching'].includes(phase) ? 1 : 0,
              transform: 'translateY(0)',
            }}
          >
            <p className="font-[var(--font-body)] text-lg font-light tracking-[0.3em] text-white/90">
              WELCOME, KAK.
            </p>
          </div>
        )}

        {(phase === 'message' || phase === 'button' || phase === 'launching') && (
          <div
            className="mt-6 transition-all duration-[2000ms] ease-out"
            style={{
              opacity: phase === 'message' ? 0 : 1,
              transform: phase === 'message' ? 'translateY(10px)' : 'translateY(0)',
            }}
          >
            <p className="max-w-xs font-[var(--font-body)] text-sm font-light leading-relaxed text-white/60">
              I made something for you,
              <br />
              hope you'll like it.
            </p>
          </div>
        )}

        {(phase === 'button' || phase === 'launching') && (
          <button
            onClick={handleStart}
            disabled={launching}
            className="group relative mt-12 select-none"
            style={{
              opacity: launching ? 0 : 1,
              transition: 'opacity 0.6s ease',
            }}
          >
            <span className="absolute -inset-3 rounded-full bg-amber-300/10 blur-md transition-all duration-500 group-active:bg-amber-300/25" />
            <span className="relative flex items-center gap-3 rounded-full border border-amber-200/30 bg-white/5 px-7 py-3 backdrop-blur-sm transition-all duration-300 group-active:scale-95 group-active:border-amber-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]" />
              <span className="font-[var(--font-display)] text-xs uppercase tracking-[0.35em] text-amber-50">
                Start the Tour
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
