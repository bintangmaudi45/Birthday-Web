import { useCallback, useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

type Phase = 'intro' | 'listening' | 'finished' | 'done';

export default function SongMission({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    timersRef.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const handlePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setPlaying(true);
    setPhase('listening');
    audio.play().catch(() => {
      // fallback: simulate playback if audio fails
      simulatePlayback();
    });
  }, []);

  const simulatePlayback = useCallback(() => {
    const start = performance.now();
    const duration = 8000; // 8s placeholder
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setProgress(t);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        handleFinish();
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const handleFinish = useCallback(() => {
    setPlaying(false);
    setPhase('finished');
    timersRef.current.push(
      window.setTimeout(() => setPhase('done'), 2500),
      window.setTimeout(() => onComplete(), 5000)
    );
  }, [onComplete]);

  // track real audio progress
  const onTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress(audio.currentTime / audio.duration);
  }, []);

  const onEnded = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
      {/* nebula atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(100,80,180,0.08), transparent), radial-gradient(ellipse 50% 40% at 30% 70%, rgba(60,40,120,0.06), transparent)',
          animation: playing ? 'nebulaBreathe 6s ease-in-out infinite' : 'none',
        }}
      />

      {/* aurora */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ opacity: playing ? 0.4 : 0.15, transition: 'opacity 1s ease' }}
      >
        <div
          className="absolute -inset-x-20 top-1/4"
          style={{
            height: '40%',
            background:
              'linear-gradient(90deg, transparent, rgba(120,100,200,0.15), rgba(80,120,200,0.1), transparent)',
            filter: 'blur(40px)',
            animation: 'auroraShift 8s ease-in-out infinite',
          }}
        />
      </div>

      {/* light rays */}
      {playing && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 15}%`,
                top: '10%',
                width: 2,
                height: '60%',
                background: 'linear-gradient(to bottom, rgba(200,180,255,0.15), transparent)',
                // @ts-expect-error CSS custom property
                '--ray-rot': `${(i - 2) * 8}deg`,
                transform: `rotate(${(i - 2) * 8}deg)`,
                animation: `lightRay ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* music object — floating cassette */}
      <div
        className="relative z-10"
        style={{
          animation: 'floatObject 6s ease-in-out infinite',
        }}
      >
        <CassetteSVG playing={playing} progress={progress} />
      </div>

      {/* text content */}
      <div className="relative z-10 mt-12 flex flex-col items-center gap-4">
        {phase === 'intro' && (
          <div style={{ animation: 'fadeInUp 1s ease-out' }}>
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.5em] text-violet-200/40">
              Planet 04
            </p>
            <p className="mt-4 font-[var(--font-display)] text-xl font-light tracking-wide text-violet-50/80">
              A little something I made.
            </p>
            <p className="mt-3 font-[var(--font-body)] text-sm font-light text-white/40">
              No mission this time.
            </p>
            <p className="font-[var(--font-body)] text-sm font-light text-white/40">
              Just listen.
            </p>
          </div>
        )}

        {phase === 'listening' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <p className="font-[var(--font-body)] text-xs font-light tracking-[0.3em] text-violet-200/40">
              . . .
            </p>
          </div>
        )}

        {phase === 'finished' && (
          <p
            className="font-[var(--font-display)] text-xl font-light tracking-wide text-violet-50/80"
            style={{ animation: 'fadeInUp 1s ease-out' }}
          >
            hope you like it.
          </p>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center gap-3" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-violet-200/40 to-transparent" />
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.4em] text-violet-200/60">
              Mission Complete
            </p>
          </div>
        )}
      </div>

      {/* play button */}
      {phase === 'intro' && (
        <button
          onClick={handlePlay}
          className="group relative z-10 mt-10 select-none"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="absolute -inset-4 rounded-full bg-violet-400/10 blur-lg transition-all duration-500 group-active:bg-violet-400/25" />
          <span className="relative flex items-center gap-3 rounded-full border border-violet-200/25 bg-white/5 px-8 py-3.5 backdrop-blur-sm transition-all duration-300 group-active:scale-95">
            <Play size={16} className="text-violet-100/80" fill="currentColor" />
            <span className="font-[var(--font-display)] text-xs uppercase tracking-[0.3em] text-violet-50/80">
              Play
            </span>
          </span>
        </button>
      )}

      {/* hidden audio element — placeholder source */}
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        preload="auto"
      >
        {/* src will be set when personal audio file is provided */}
      </audio>
    </div>
  );
}

function CassetteSVG({ playing, progress }: { playing: boolean; progress: number }) {
  const reelRotation = playing ? `${progress * 720}deg` : '0deg';
  return (
    <svg width="160" height="110" viewBox="0 0 160 110" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }}>
      {/* cassette body */}
      <rect x="10" y="10" width="140" height="90" rx="6" fill="#1a1530" stroke="rgba(150,130,220,0.3)" strokeWidth="1.5" />
      <rect x="10" y="10" width="140" height="90" rx="6" fill="url(#cassetteGrad)" opacity="0.3" />

      {/* label */}
      <rect x="20" y="20" width="120" height="30" rx="2" fill="rgba(200,190,240,0.08)" stroke="rgba(150,130,220,0.15)" strokeWidth="0.5" />
      <rect x="30" y="28" width="60" height="2" rx="1" fill="rgba(200,190,240,0.2)" />
      <rect x="30" y="34" width="40" height="2" rx="1" fill="rgba(200,190,240,0.15)" />

      {/* reels */}
      <g style={{ transformOrigin: '55px 70px', transform: `rotate(${reelRotation})`, transition: 'transform 0.1s linear' }}>
        <circle cx="55" cy="70" r="16" fill="#0c0a1a" stroke="rgba(150,130,220,0.2)" strokeWidth="1" />
        <circle cx="55" cy="70" r="4" fill="rgba(150,130,220,0.3)" />
        {[0, 60, 120, 180, 240, 300].map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <rect
              key={a}
              x={55 + Math.cos(rad) * 6 - 1}
              y={70 + Math.sin(rad) * 6 - 1}
              width="2"
              height="8"
              fill="rgba(150,130,220,0.2)"
              transform={`rotate(${a} 55 70)`}
            />
          );
        })}
      </g>
      <g style={{ transformOrigin: '105px 70px', transform: `rotate(${reelRotation})`, transition: 'transform 0.1s linear' }}>
        <circle cx="105" cy="70" r="16" fill="#0c0a1a" stroke="rgba(150,130,220,0.2)" strokeWidth="1" />
        <circle cx="105" cy="70" r="4" fill="rgba(150,130,220,0.3)" />
        {[0, 60, 120, 180, 240, 300].map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <rect
              key={a}
              x={105 + Math.cos(rad) * 6 - 1}
              y={70 + Math.sin(rad) * 6 - 1}
              width="2"
              height="8"
              fill="rgba(150,130,220,0.2)"
              transform={`rotate(${a} 105 70)`}
            />
          );
        })}
      </g>

      {/* tape between reels */}
      <rect x="55" y="85" width="50" height="3" fill="rgba(120,100,180,0.15)" />

      <defs>
        <linearGradient id="cassetteGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2f6a" />
          <stop offset="1" stopColor="#1a1530" />
        </linearGradient>
      </defs>
    </svg>
  );
}
