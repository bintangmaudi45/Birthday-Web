import { useCallback, useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

type Phase = 'intro' | 'listening' | 'finished' | 'done';

interface LyricLine {
  time: number;
  text: string;
}

const AUDIO_SRC = '/assets/noticing-the-rain.mp3';

const LYRICS: LyricLine[] = [
  { time: 0, text: 'We were only passing time,' },
  { time: 7, text: 'underneath an ordinary sky,' },
  { time: 14, text: 'a few unfinished conversations,' },
  { time: 20, text: 'a few reasons not to say goodbye.' },

  { time: 27, text: 'And somehow, in a little while,' },
  { time: 33, text: 'the days began to feel less plain.' },
  { time: 40, text: 'Nothing changed, or maybe nothing did,' },
  { time: 46, text: 'I just started noticing the rain.' },

  { time: 66, text: "I won't keep the moment still," },
  { time: 73, text: 'let it wander where it wants to go.' },
  { time: 79, text: 'Some things are better left unspoken,' },
  { time: 86, text: 'some are better when you never know.' },

  { time: 94, text: 'Today, you turn twenty-four,' },
  { time: 97, text: 'just another day, and something more.' },
  { time: 100, text: 'The evening seems a little softer,' },
  { time: 104, text: 'the sky a little closer than before.' },

  { time: 108, text: 'And somewhere in the quiet change,' },
  { time: 112, text: "I thought I'd leave a song for you" },
  { time: 117, text: 'not for anything it has to mean,' },
  { time: 123, text: 'just for the days we wandered through.' },

  { time: 144, text: 'And somehow, in a little while,' },
  { time: 151, text: 'the days began to feel less plain.' },
  { time: 157, text: 'Nothing changed, or maybe nothing did,' },
  { time: 164, text: 'I just started noticing the rain.' },

  { time: 171, text: 'So if this finds you someday,' },
  { time: 177, text: 'somewhere far from where we are,' },
  { time: 184, text: 'keep it like a quiet evening' },
  { time: 193, text: 'nothing much, just a little warm.' },
];

export default function SongMission({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timersRef = useRef<number[]>([]);
  const finishedRef = useRef(false);

  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      timersRef.current.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, []);

  // =========================================================
  // FIND ACTIVE LYRIC
  // =========================================================

  const updateLyric = useCallback((currentTime: number) => {
    let activeIndex = -1;

    for (let i = 0; i < LYRICS.length; i++) {
      if (currentTime >= LYRICS[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }

    setCurrentLyricIndex(activeIndex);
  }, []);

  // =========================================================
  // FINISH SONG
  // =========================================================

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;

    finishedRef.current = true;

    setPlaying(false);
    setProgress(1);
    setCurrentLyricIndex(LYRICS.length - 1);
    setPhase('finished');

    const timer1 = window.setTimeout(() => {
      setPhase('done');
    }, 2500);

    const timer2 = window.setTimeout(() => {
      onComplete();
    }, 5000);

    timersRef.current.push(timer1, timer2);
  }, [onComplete]);

  // =========================================================
  // PLAY MP3
  // =========================================================

  const handlePlay = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      console.error('Audio element not found.');
      return;
    }

    try {
      finishedRef.current = false;

      audio.pause();
      audio.currentTime = 0;

      setProgress(0);
      setCurrentLyricIndex(0);
      setPlaying(true);
      setPhase('listening');

      await audio.play();
    } catch (error) {
      console.error('MP3 gagal diputar:', error);

      setPlaying(false);
      setPhase('intro');
      setCurrentLyricIndex(-1);
      setProgress(0);

      console.error(
        'Pastikan file berada di:',
        '/public/assets/noticing-the-rain.mp3'
      );
    }
  }, []);

  // =========================================================
  // AUDIO TIME UPDATE
  // =========================================================

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const currentTime = audio.currentTime;
    const duration = audio.duration;

    if (Number.isFinite(duration) && duration > 0) {
      setProgress(Math.min(currentTime / duration, 1));
    }

    updateLyric(currentTime);
  }, [updateLyric]);

  // =========================================================
  // AUDIO ENDED
  // =========================================================

  const handleEnded = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  // =========================================================
  // AUDIO ERROR
  // =========================================================

  const handleAudioError = useCallback(() => {
    console.error(
      `Tidak bisa menemukan/memuat audio: ${AUDIO_SRC}`
    );

    setPlaying(false);
    setPhase('intro');
    setProgress(0);
    setCurrentLyricIndex(-1);
  }, []);

  const currentLyric =
    currentLyricIndex >= 0
      ? LYRICS[currentLyricIndex]
      : null;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="relative z-30 flex min-h-screen h-full w-full flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{
        color: 'white',
      }}
    >
      {/* =====================================================
          REAL MP3
      ===================================================== */}

      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleAudioError}
      />

      {/* =====================================================
          NEBULA
      ===================================================== */}

      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(100,80,180,0.08), transparent), radial-gradient(ellipse 50% 40% at 30% 70%, rgba(60,40,120,0.06), transparent)',
          animation: playing
            ? 'nebulaBreathe 6s ease-in-out infinite'
            : 'none',
        }}
      />

      {/* =====================================================
          AURORA
      ===================================================== */}

      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{
          opacity: playing ? 0.4 : 0.15,
          transition: 'opacity 1s ease',
        }}
      >
        <div
          className="absolute -inset-x-20 top-1/4"
          style={{
            height: '40%',
            background:
              'linear-gradient(90deg, transparent, rgba(120,100,200,0.15), rgba(80,120,200,0.1), transparent)',
            filter: 'blur(40px)',
            animation:
              'auroraShift 8s ease-in-out infinite',
          }}
        />
      </div>

      {/* =====================================================
          LIGHT RAYS
      ===================================================== */}

      {playing && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 15}%`,
                top: '10%',
                width: 2,
                height: '60%',
                background:
                  'linear-gradient(to bottom, rgba(200,180,255,0.15), transparent)',
                transform: `rotate(${(i - 2) * 8}deg)`,
                animation: `lightRay ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 flex w-full flex-col items-center">
        {/* ===================================================
            CASSETTE
        =================================================== */}

        <div
          className="relative"
          style={{
            animation: 'floatObject 6s ease-in-out infinite',
          }}
        >
          <CassetteSVG
            playing={playing}
            progress={progress}
          />
        </div>

        {/* ===================================================
            INTRO
        =================================================== */}

        {phase === 'intro' && (
          <div
            className="relative z-10 mt-12"
            style={{
              animation: 'fadeInUp 1s ease-out',
            }}
          >
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.5em] text-violet-200/70">
              Planet 04
            </p>

            <p className="mt-4 font-[var(--font-display)] text-xl font-light tracking-wide text-violet-50/90">
              A little something I made.
            </p>

            <p className="mt-3 font-[var(--font-body)] text-sm font-light text-white/60">
              No mission this time.
            </p>

            <p className="font-[var(--font-body)] text-sm font-light text-white/60">
              Just listen.
            </p>
          </div>
        )}

        {/* ===================================================
            LYRICS
        =================================================== */}

        {phase === 'listening' && currentLyric && (
          <div className="relative z-10 mt-10 min-h-[80px] max-w-xl px-4">
            <p
              key={currentLyricIndex}
              className="font-[var(--font-display)] text-lg font-light leading-relaxed tracking-wide text-violet-50/90"
              style={{
                animation: 'fadeInUp 0.8s ease-out',
              }}
            >
              {currentLyric.text}
            </p>
          </div>
        )}

        {/* ===================================================
            LISTENING INDICATOR
        =================================================== */}

        {phase === 'listening' && (
          <div
            className="relative z-10 mt-6"
            style={{
              animation: 'fadeIn 0.5s ease-out',
            }}
          >
            <p className="font-[var(--font-body)] text-xs font-light tracking-[0.3em] text-violet-200/60">
              . . .
            </p>
          </div>
        )}

        {/* ===================================================
            FINISHED
        =================================================== */}

        {phase === 'finished' && (
          <p
            className="relative z-10 mt-12 font-[var(--font-display)] text-xl font-light tracking-wide text-violet-50/90"
            style={{
              animation: 'fadeInUp 1s ease-out',
            }}
          >
            hope you like it.
          </p>
        )}

        {/* ===================================================
            DONE
        =================================================== */}

        {phase === 'done' && (
          <div
            className="relative z-10 mt-12 flex flex-col items-center gap-3"
            style={{
              animation: 'fadeInUp 0.8s ease-out',
            }}
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-violet-200/40 to-transparent" />

            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.4em] text-violet-200/70">
              Mission Complete
            </p>
          </div>
        )}

        {/* ===================================================
            PLAY BUTTON
        =================================================== */}

        {phase === 'intro' && (
          <button
            type="button"
            onClick={handlePlay}
            className="group relative z-10 mt-10 select-none"
            style={{
              touchAction: 'manipulation',
            }}
          >
            <span className="absolute -inset-4 rounded-full bg-violet-400/10 blur-lg transition-all duration-500 group-active:bg-violet-400/25" />

            <span className="relative flex items-center gap-3 rounded-full border border-violet-200/25 bg-white/5 px-8 py-3.5 backdrop-blur-sm transition-all duration-300 group-active:scale-95">
              <Play
                size={16}
                className="text-violet-100/80"
                fill="currentColor"
              />

              <span className="font-[var(--font-display)] text-xs uppercase tracking-[0.3em] text-violet-50/90">
                Play
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ===========================================================
// CASSETTE SVG
// ===========================================================

function CassetteSVG({
  playing,
  progress,
}: {
  playing: boolean;
  progress: number;
}) {
  const reelRotation = playing
    ? `${progress * 720}deg`
    : '0deg';

  return (
    <svg
      width="160"
      height="110"
      viewBox="0 0 160 110"
      style={{
        display: 'block',
        filter:
          'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
      }}
    >
      {/* body */}
      <rect
        x="10"
        y="10"
        width="140"
        height="90"
        rx="6"
        fill="#1a1530"
        stroke="rgba(150,130,220,0.3)"
        strokeWidth="1.5"
      />

      <rect
        x="10"
        y="10"
        width="140"
        height="90"
        rx="6"
        fill="url(#cassetteGrad)"
        opacity="0.3"
      />

      {/* label */}
      <rect
        x="20"
        y="20"
        width="120"
        height="30"
        rx="2"
        fill="rgba(200,190,240,0.08)"
        stroke="rgba(150,130,220,0.15)"
        strokeWidth="0.5"
      />

      <rect
        x="30"
        y="28"
        width="60"
        height="2"
        rx="1"
        fill="rgba(200,190,240,0.2)"
      />

      <rect
        x="30"
        y="34"
        width="40"
        height="2"
        rx="1"
        fill="rgba(200,190,240,0.15)"
      />

      {/* left reel */}
      <g
        style={{
          transformOrigin: '55px 70px',
          transform: `rotate(${reelRotation})`,
        }}
      >
        <circle
          cx="55"
          cy="70"
          r="16"
          fill="#0c0a1a"
          stroke="rgba(150,130,220,0.2)"
          strokeWidth="1"
        />

        <circle
          cx="55"
          cy="70"
          r="4"
          fill="rgba(150,130,220,0.3)"
        />

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

      {/* right reel */}
      <g
        style={{
          transformOrigin: '105px 70px',
          transform: `rotate(${reelRotation})`,
        }}
      >
        <circle
          cx="105"
          cy="70"
          r="16"
          fill="#0c0a1a"
          stroke="rgba(150,130,220,0.2)"
          strokeWidth="1"
        />

        <circle
          cx="105"
          cy="70"
          r="4"
          fill="rgba(150,130,220,0.3)"
        />

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

      {/* tape */}
      <rect
        x="55"
        y="85"
        width="50"
        height="3"
        fill="rgba(120,100,180,0.15)"
      />

      <defs>
        <linearGradient
          id="cassetteGrad"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#3a2f6a"
          />
          <stop
            offset="1"
            stopColor="#1a1530"
          />
        </linearGradient>
      </defs>
    </svg>
  );
}