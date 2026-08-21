import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  onComplete: () => void;
}

type Phase = 'dark' | 'count3' | 'count2' | 'count1' | 'lit' | 'wish' | 'blowing' | 'dark_moment' | 'constellation' | 'message1' | 'message2' | 'done';

export default function BirthdayMission({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('dark');
  const [flamesOut, setFlamesOut] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    timersRef.current.push(
      window.setTimeout(() => setPhase('count3'), 1500),
      window.setTimeout(() => setPhase('count2'), 2500),
      window.setTimeout(() => setPhase('count1'), 3500),
      window.setTimeout(() => setPhase('lit'), 4500),
      window.setTimeout(() => setPhase('wish'), 5500),
      window.setTimeout(() => setPhase('blowing'), 7000)
    );
    return () => timersRef.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const handleBlow = useCallback(() => {
    if (phase !== 'blowing') return;
    setFlamesOut(true);
    setPhase('dark_moment');
    timersRef.current.push(
      window.setTimeout(() => setPhase('constellation'), 1500),
      window.setTimeout(() => setPhase('message1'), 4500),
      window.setTimeout(() => setPhase('message2'), 6500),
      window.setTimeout(() => setPhase('done'), 9000),
      window.setTimeout(() => onComplete(), 11000)
    );
  }, [phase, onComplete]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden">
      {/* base atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            phase === 'dark' || phase === 'dark_moment'
              ? '#04050c'
              : phase === 'constellation' || phase === 'message1' || phase === 'message2' || phase === 'done'
              ? 'radial-gradient(circle at 50% 50%, rgba(20,20,50,0.5), #04050c 80%)'
              : 'radial-gradient(circle at 50% 40%, rgba(60,40,20,0.3), rgba(20,15,10,0.6) 50%, #04050c 90%)',
          transition: 'background 1.5s ease',
        }}
      />

      {/* warm glow when cake appears */}
      {(phase === 'lit' || phase === 'wish' || phase === 'blowing') && !flamesOut && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 55%, rgba(255,180,80,0.15), transparent 50%)',
            animation: 'warmGlow 3s ease-in-out infinite',
          }}
        />
      )}

      {/* countdown */}
      {(phase === 'count3' || phase === 'count2' || phase === 'count1') && (
        <p
          key={phase}
          className="relative z-10 font-[var(--font-display)] text-6xl font-light text-amber-100/80"
          style={{ animation: 'countPulse 1s ease-out' }}
        >
          {phase === 'count3' ? '3' : phase === 'count2' ? '2' : '1'}
        </p>
      )}

      {/* cake */}
      {(phase === 'lit' || phase === 'wish' || phase === 'blowing') && (
        <div
          className="relative z-10"
          style={{ animation: 'fadeInUp 1.5s ease-out' }}
        >
          <CakeSVG flamesLit={!flamesOut} />
        </div>
      )}

      {/* wish text */}
      {phase === 'wish' && (
        <p
          className="absolute bottom-32 z-10 font-[var(--font-display)] text-xl font-light tracking-wide text-amber-50/70"
          style={{ animation: 'fadeInUp 1s ease-out' }}
        >
          make a wish.
        </p>
      )}

      {/* blow instruction */}
      {phase === 'blowing' && (
        <button
          onClick={handleBlow}
          className="absolute bottom-28 z-10 select-none"
          style={{ touchAction: 'manipulation', animation: 'fadeInUp 0.8s ease-out' }}
        >
          <span className="flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/5 px-6 py-3 backdrop-blur-sm transition-all duration-300 active:scale-95">
            <span className="font-[var(--font-display)] text-xs uppercase tracking-[0.3em] text-amber-50/70">
              blow the candles
            </span>
          </span>
        </button>
      )}

      {/* constellation finale */}
      {(phase === 'constellation' || phase === 'message1' || phase === 'message2' || phase === 'done') && (
        <ConstellationView />
      )}

      {/* final messages */}
      {phase === 'message1' && (
        <p
          className="absolute bottom-40 z-20 font-[var(--font-display)] text-2xl font-light tracking-wide text-amber-50"
          style={{ animation: 'fadeInUp 1.5s ease-out' }}
        >
          Happy birthday, Kak.
        </p>
      )}
      {phase === 'message2' && (
        <p
          className="absolute bottom-32 z-20 max-w-[280px] text-center font-[var(--font-body)] text-sm font-light leading-relaxed text-white/50"
          style={{ animation: 'fadeInUp 1s ease-out' }}
        >
          [INSERT PERSONAL BIRTHDAY MESSAGE HERE]
        </p>
      )}
      {phase === 'done' && (
        <div
          className="absolute bottom-28 z-20 flex flex-col items-center gap-3"
          style={{ animation: 'fadeInUp 0.8s ease-out' }}
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />
          <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.4em] text-amber-200/60">
            Mission Complete
          </p>
        </div>
      )}
    </div>
  );
}

function CakeSVG({ flamesLit }: { flamesLit: boolean }) {
  return (
    <svg width="180" height="200" viewBox="0 0 180 200" style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))' }}>
      {/* candle */}
      <rect x="85" y="40" width="10" height="50" rx="2" fill="#e8d5c0" />
      <rect x="85" y="40" width="10" height="50" rx="2" fill="url(#candleGrad)" opacity="0.3" />

      {/* flame */}
      {flamesLit && (
        <g style={{ animation: 'flicker 0.4s ease-in-out infinite' }}>
          <ellipse cx="90" cy="30" rx="5" ry="12" fill="rgba(255,200,80,0.9)" />
          <ellipse cx="90" cy="32" rx="3" ry="8" fill="rgba(255,240,180,0.8)" />
          <circle cx="90" cy="34" r="2" fill="rgba(255,255,255,0.6)" />
        </g>
      )}

      {/* cake top layer */}
      <ellipse cx="90" cy="90" rx="60" ry="12" fill="#f5e6d3" />
      <rect x="30" y="90" width="120" height="40" fill="#f0d8c0" />
      <ellipse cx="90" cy="130" rx="60" ry="12" fill="#e8c8a8" />

      {/* cake bottom layer */}
      <ellipse cx="90" cy="140" rx="70" ry="14" fill="#f5e6d3" />
      <rect x="20" y="140" width="140" height="50" fill="#f0d8c0" />
      <ellipse cx="90" cy="190" rx="70" ry="14" fill="#e8c8a8" />

      {/* frosting drips */}
      <path d="M 30 92 Q 35 100 40 92 Q 45 100 50 92 Q 55 100 60 92 Q 65 100 70 92 Q 75 100 80 92 Q 85 100 90 92 Q 95 100 100 92 Q 105 100 110 92 Q 115 100 120 92 Q 125 100 130 92 Q 135 100 140 92 Q 145 100 150 92"
        fill="none" stroke="rgba(200,150,100,0.3)" strokeWidth="2" />

      {/* decorative dots */}
      {[40, 60, 80, 100, 120, 140].map((x) => (
        <circle key={x} cx={x} cy="160" r="3" fill="rgba(255,200,100,0.4)" />
      ))}

      <defs>
        <linearGradient id="candleGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.5" stopColor="#e8d5c0" />
          <stop offset="1" stopColor="#c4a888" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ConstellationView() {
  // generate stars that appear progressively
  const stars = useRef(
    Array.from({ length: 80 }).map((_, i) => ({
      x: 10 + ((i * 37) % 80),
      y: 5 + ((i * 53) % 90),
      size: 1 + ((i * 7) % 3),
      delay: (i * 0.04) % 3,
    }))
  ).current;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            boxShadow: '0 0 4px rgba(255,255,255,0.6)',
            animation: `starAppear 0.5s ease-out forwards`,
            animationDelay: `${s.delay}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
