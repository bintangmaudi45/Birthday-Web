import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  onComplete: () => void;
}

type Phase =
  | 'dark'
  | 'count3'
  | 'count2'
  | 'count1'
  | 'lit'
  | 'wish'
  | 'blowing'
  | 'celebration'
  | 'dark_moment'
  | 'constellation'
  | 'message'
  | 'done';

const MESSAGE_DURATION = 30;

export default function BirthdayMission({
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<Phase>('dark');
  const [flamesOut, setFlamesOut] = useState(false);

  const timersRef = useRef<number[]>([]);
  const celebrationAudioRef =
    useRef<AudioContext | null>(null);

  const lastMessageRef = useRef<HTMLParagraphElement | null>(
    null
  );

  const completedRef = useRef(false);

  // =====================================================
  // INTRO
  // =====================================================

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase('count3'), 1500),
      window.setTimeout(() => setPhase('count2'), 2500),
      window.setTimeout(() => setPhase('count1'), 3500),
      window.setTimeout(() => setPhase('lit'), 4500),
      window.setTimeout(() => setPhase('wish'), 5500),
      window.setTimeout(() => setPhase('blowing'), 7000),
    ];

    timersRef.current.push(...timers);

    return () => {
      timersRef.current.forEach((timer) => {
        window.clearTimeout(timer);
      });

      timersRef.current = [];

      if (celebrationAudioRef.current) {
        celebrationAudioRef.current.close().catch(() => {});
      }
    };
  }, []);

  // =====================================================
  // DETECT LAST MESSAGE
  // =====================================================
  //
  // INI BAGIAN PALING PENTING.
  //
  // Kita TIDAK menunggu animation selesai.
  //
  // Begitu "Happy 24th, Kakk ♡" masuk ke layar,
  // mission langsung complete.
  //

  useEffect(() => {
    if (phase !== 'message') return;

    const lastMessage = lastMessageRef.current;

    if (!lastMessage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          entry.isIntersecting &&
          !completedRef.current
        ) {
          completedRef.current = true;

          observer.disconnect();

          setPhase('done');

          // LANGSUNG COMPLETE
          onComplete();
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(lastMessage);

    return () => {
      observer.disconnect();
    };
  }, [phase, onComplete]);

  // =====================================================
  // CELEBRATION SOUND
  // =====================================================

  const playCelebration = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();

      celebrationAudioRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // =================================================
      // APPLAUSE
      // =================================================

      for (let i = 0; i < 55; i++) {
        const start =
          now + Math.random() * 3.2;

        const duration =
          0.035 + Math.random() * 0.065;

        const bufferSize = Math.floor(
          ctx.sampleRate * duration
        );

        const buffer = ctx.createBuffer(
          1,
          bufferSize,
          ctx.sampleRate
        );

        const data = buffer.getChannelData(0);

        for (let j = 0; j < bufferSize; j++) {
          data[j] =
            (Math.random() * 2 - 1) *
            Math.exp(-j / (bufferSize * 0.2));
        }

        const source =
          ctx.createBufferSource();

        const gain = ctx.createGain();

        const filter =
          ctx.createBiquadFilter();

        source.buffer = buffer;

        filter.type = 'bandpass';

        filter.frequency.value =
          800 + Math.random() * 2200;

        filter.Q.value = 0.8;

        gain.gain.setValueAtTime(
          0.0001,
          start
        );

        gain.gain.linearRampToValueAtTime(
          0.08 + Math.random() * 0.14,
          start + 0.008
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + duration
        );

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start(start);
        source.stop(start + duration);
      }

      // =================================================
      // CHEERING
      // =================================================

      const cheerNotes = [
        { freq: 523, delay: 0.05 },
        { freq: 659, delay: 0.13 },
        { freq: 784, delay: 0.22 },
        { freq: 1047, delay: 0.32 },
        { freq: 1319, delay: 0.43 },
      ];

      cheerNotes.forEach(({ freq, delay }) => {
        const osc = ctx.createOscillator();

        const gain = ctx.createGain();

        const start = now + delay;

        osc.type = 'sine';

        osc.frequency.value = freq;

        gain.gain.setValueAtTime(
          0.0001,
          start
        );

        gain.gain.linearRampToValueAtTime(
          0.05,
          start + 0.04
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + 1.3
        );

        osc.connect(gain);

        gain.connect(ctx.destination);

        osc.start(start);

        osc.stop(start + 1.35);
      });

      // =================================================
      // SMALL CROWD EFFECT
      // =================================================

      for (let i = 0; i < 10; i++) {
        const osc = ctx.createOscillator();

        const gain = ctx.createGain();

        const start =
          now +
          0.1 +
          Math.random() * 1.1;

        osc.type = 'triangle';

        osc.frequency.setValueAtTime(
          280 + Math.random() * 160,
          start
        );

        osc.frequency.linearRampToValueAtTime(
          450 + Math.random() * 300,
          start + 0.35
        );

        gain.gain.setValueAtTime(
          0.0001,
          start
        );

        gain.gain.linearRampToValueAtTime(
          0.025,
          start + 0.05
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + 0.8
        );

        osc.connect(gain);

        gain.connect(ctx.destination);

        osc.start(start);

        osc.stop(start + 0.85);
      }
    } catch {
      // Ignore audio errors
    }
  }, []);

  // =====================================================
  // BLOW CANDLE
  // =====================================================

  const handleBlow = useCallback(() => {
    if (phase !== 'blowing') return;

    setFlamesOut(true);

    playCelebration();

    setPhase('celebration');

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('dark_moment');
      }, 3000),

      window.setTimeout(() => {
        setPhase('constellation');
      }, 4000),

      window.setTimeout(() => {
        setPhase('message');
      }, 5000)
    );
  }, [phase, playCelebration]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={{
        background: '#04050c',
      }}
    >
      {/* =================================================
          ANIMATIONS
      ================================================= */}

      <style>{`

        @keyframes birthdayCredits {
          from {
            transform: translate3d(0, 100vh, 0);
          }

          to {
            transform: translate3d(
              0,
              calc(-100% - 100vh),
              0
            );
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes countPulse {
          0% {
            opacity: 0;
            transform: scale(0.75);
          }

          50% {
            opacity: 1;
            transform: scale(1);
          }

          100% {
            opacity: 0;
            transform: scale(1.05);
          }
        }

        @keyframes warmGlow {
          0%,
          100% {
            opacity: 0.5;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes flicker {
          0% {
            transform: scale(1) translateY(0);
          }

          50% {
            transform: scale(1.08) translateY(-1px);
          }

          100% {
            transform: scale(0.95) translateY(1px);
          }
        }

        @keyframes starAppear {
          from {
            opacity: 0;
            transform: scale(0);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

      `}</style>

      {/* =================================================
          BASE ATMOSPHERE
      ================================================= */}

      <div
        className="absolute inset-0"
        style={{
          background:
            phase === 'dark' ||
            phase === 'dark_moment'
              ? '#04050c'
              : phase === 'constellation' ||
                phase === 'message' ||
                phase === 'done'
              ? 'radial-gradient(circle at 50% 50%, rgba(20,20,50,0.5), #04050c 80%)'
              : 'radial-gradient(circle at 50% 40%, rgba(60,40,20,0.3), rgba(20,15,10,0.6) 50%, #04050c 90%)',
          transition:
            'background 1.5s ease',
        }}
      />

      {/* =================================================
          WARM GLOW
      ================================================= */}

      {(phase === 'lit' ||
        phase === 'wish' ||
        phase === 'blowing') &&
        !flamesOut && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 55%, rgba(255,180,80,0.15), transparent 50%)',
              animation:
                'warmGlow 3s ease-in-out infinite',
            }}
          />
        )}

      {/* =================================================
          COUNTDOWN
      ================================================= */}

      {(phase === 'count3' ||
        phase === 'count2' ||
        phase === 'count1') && (
        <p
          key={phase}
          className="relative z-10 font-[var(--font-display)] text-6xl font-light text-amber-100/80"
          style={{
            animation:
              'countPulse 1s ease-out',
          }}
        >
          {phase === 'count3'
            ? '3'
            : phase === 'count2'
            ? '2'
            : '1'}
        </p>
      )}

      {/* =================================================
          CAKE
      ================================================= */}

      {(phase === 'lit' ||
        phase === 'wish' ||
        phase === 'blowing' ||
        phase === 'celebration' ||
        phase === 'dark_moment') && (
        <div
          className="relative z-10"
          style={{
            animation:
              'fadeInUp 1.5s ease-out',
          }}
        >
          <CakeSVG
            flamesLit={!flamesOut}
          />
        </div>
      )}

      {/* =================================================
          WISH
      ================================================= */}

      {phase === 'wish' && (
        <p
          className="absolute bottom-32 z-10 font-[var(--font-display)] text-xl font-light tracking-wide text-amber-50/70"
          style={{
            animation:
              'fadeInUp 1s ease-out',
          }}
        >
          make a wish.
        </p>
      )}

      {/* =================================================
          BLOW BUTTON
      ================================================= */}

      {phase === 'blowing' && (
        <button
          type="button"
          onClick={handleBlow}
          className="absolute bottom-28 z-10 select-none"
          style={{
            touchAction: 'manipulation',
            animation:
              'fadeInUp 0.8s ease-out',
          }}
        >
          <span className="flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/5 px-6 py-3 backdrop-blur-sm transition-all duration-300 active:scale-95">
            <span className="font-[var(--font-display)] text-xs uppercase tracking-[0.3em] text-amber-50/70">
              blow the candles
            </span>
          </span>
        </button>
      )}

      {/* =================================================
          CELEBRATION
      ================================================= */}

      {phase === 'celebration' && (
        <div
          className="pointer-events-none absolute bottom-28 z-20 text-center"
          style={{
            animation:
              'fadeInUp 0.8s ease-out',
          }}
        >
          <p className="font-[var(--font-display)] text-lg tracking-wide text-amber-50/80">
            yayyy ✦
          </p>
        </div>
      )}

      {/* =================================================
          CONSTELLATION
      ================================================= */}

      {(phase === 'constellation' ||
        phase === 'message' ||
        phase === 'done') && (
        <ConstellationView />
      )}

      {/* =================================================
          MESSAGE
          SATU BLOK — TANPA JEDA
      ================================================= */}

      {phase === 'message' && (
        <div
          className="absolute inset-0 z-20 overflow-hidden"
          style={{
            pointerEvents: 'none',
          }}
        >
          <div
            className="absolute left-0 top-0 w-full"
            style={{
              animation: `birthdayCredits ${MESSAGE_DURATION}s linear forwards`,
              willChange: 'transform',
            }}
          >
            <div
              className="mx-auto flex w-full max-w-[380px] px-7 text-center"
              style={{
                paddingTop: '0',
                paddingBottom: '30vh',
              }}
            >
              {/* =================================================
                  SATU PARAGRAF CONTINUOUS
              ================================================= */}

              <p className="w-full font-[var(--font-body)] text-sm font-light leading-[2.25] text-white/75">

                <span className="font-[var(--font-display)] text-lg tracking-wide text-amber-50">
                  Hellowwwww,
                  <br />
                  Happy Birthdayyyy Kakkkk ♡
                </span>

                <br />
                <br />

                I hope you'll have plenty of
                <br />
                good days, good stories,
                <br />
                and little things worth
                <br />
                smiling about.

                <br />
                <br />

                Andddddddd...

                <br />
                <br />

                I'm glad I get to know you
                <br />
                in this lifetime.

                <br />
                <br />

                <span
                  ref={lastMessageRef}
                  className="font-[var(--font-display)] text-xl tracking-wide text-amber-50"
                >
                  Happy 24th, Kakk ♡
                </span>

              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          DONE
      ================================================= */}

      {phase === 'done' && (
        <div
          className="absolute bottom-28 z-20 flex flex-col items-center gap-3"
          style={{
            animation:
              'fadeInUp 0.8s ease-out',
          }}
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

// =====================================================
// CAKE
// =====================================================

function CakeSVG({
  flamesLit,
}: {
  flamesLit: boolean;
}) {
  return (
    <svg
      width="180"
      height="200"
      viewBox="0 0 180 200"
      style={{
        filter:
          'drop-shadow(0 8px 20px rgba(0,0,0,0.5))',
      }}
    >
      <rect
        x="85"
        y="40"
        width="10"
        height="50"
        rx="2"
        fill="#e8d5c0"
      />

      <rect
        x="85"
        y="40"
        width="10"
        height="50"
        rx="2"
        fill="url(#candleGrad)"
        opacity="0.3"
      />

      {flamesLit && (
        <g
          style={{
            transformOrigin:
              '90px 30px',
            animation:
              'flicker 0.4s ease-in-out infinite',
          }}
        >
          <ellipse
            cx="90"
            cy="30"
            rx="5"
            ry="12"
            fill="rgba(255,200,80,0.9)"
          />

          <ellipse
            cx="90"
            cy="32"
            rx="3"
            ry="8"
            fill="rgba(255,240,180,0.8)"
          />

          <circle
            cx="90"
            cy="34"
            r="2"
            fill="rgba(255,255,255,0.6)"
          />
        </g>
      )}

      <ellipse
        cx="90"
        cy="90"
        rx="60"
        ry="12"
        fill="#f5e6d3"
      />

      <rect
        x="30"
        y="90"
        width="120"
        height="40"
        fill="#f0d8c0"
      />

      <ellipse
        cx="90"
        cy="130"
        rx="60"
        ry="12"
        fill="#e8c8a8"
      />

      <ellipse
        cx="90"
        cy="140"
        rx="70"
        ry="14"
        fill="#f5e6d3"
      />

      <rect
        x="20"
        y="140"
        width="140"
        height="50"
        fill="#f0d8c0"
      />

      <ellipse
        cx="90"
        cy="190"
        rx="70"
        ry="14"
        fill="#e8c8a8"
      />

      <path
        d="
          M 30 92
          Q 35 100 40 92
          Q 45 100 50 92
          Q 55 100 60 92
          Q 65 100 70 92
          Q 75 100 80 92
          Q 85 100 90 92
          Q 95 100 100 92
          Q 105 100 110 92
          Q 115 100 120 92
          Q 125 100 130 92
          Q 135 100 140 92
          Q 145 100 150 92
        "
        fill="none"
        stroke="rgba(200,150,100,0.3)"
        strokeWidth="2"
      />

      {[40, 60, 80, 100, 120, 140].map(
        (x) => (
          <circle
            key={x}
            cx={x}
            cy="160"
            r="3"
            fill="rgba(255,200,100,0.4)"
          />
        )
      )}

      <defs>
        <linearGradient
          id="candleGrad"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0"
            stopColor="#fff"
          />

          <stop
            offset="0.5"
            stopColor="#e8d5c0"
          />

          <stop
            offset="1"
            stopColor="#c4a888"
          />
        </linearGradient>
      </defs>
    </svg>
  );
}

// =====================================================
// CONSTELLATION
// =====================================================

function ConstellationView() {
  const stars = useRef(
    Array.from({ length: 80 }).map(
      (_, i) => ({
        x: 10 + ((i * 37) % 80),
        y: 5 + ((i * 53) % 90),
        size: 1 + ((i * 7) % 3),
        delay: (i * 0.04) % 3,
      })
    )
  ).current;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {stars.map((star, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            boxShadow:
              '0 0 4px rgba(255,255,255,0.6)',
            animation:
              'starAppear 0.5s ease-out forwards',
            animationDelay: `${star.delay}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}