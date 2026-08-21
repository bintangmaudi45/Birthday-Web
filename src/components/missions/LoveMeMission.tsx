import { useCallback, useRef, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const PROMPTS = [
  'do you love me?',
  'heyyy??!!',
  'excuse me??!!',
  'reallyyyy?!',
  'kakkk??!!',
  'are you serious??',
  'wow... okay 😭',
];

type Phase = 'playing' | 'knew_it' | 'tease' | 'quick' | 'quick_reward' | 'reward' | 'complete';

export default function LoveMeMission({ onComplete }: Props) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noScale, setNoScale] = useState(1);
  const [noOpacity, setNoOpacity] = useState(1);
  const [yesScale, setYesScale] = useState(1);
  const [showComplete, setShowComplete] = useState(false);
  const [noPressed, setNoPressed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);

  const handleNo = useCallback(() => {
    setNoPressed(true);
    const nextIndex = Math.min(promptIndex + 1, PROMPTS.length - 1);
    setPromptIndex(nextIndex);

    // shrink NO button, grow YES
    setNoScale((s) => Math.max(0.5, s - 0.08));
    setYesScale((s) => s + 0.12);

    // move NO to a random position
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const padding = 40;
      const x = (Math.random() - 0.5) * (rect.width * 0.5);
      const y = (Math.random() - 0.5) * (rect.height * 0.35);
      setNoPos({ x, y });
    }

    // after the last prompt, make NO disappear
    if (nextIndex >= PROMPTS.length - 1) {
      setNoOpacity(0);
    }
  }, [promptIndex]);

  const handleYes = useCallback(() => {
    if (phase !== 'playing') return;
    const responsePhase = noPressed ? 'knew_it' : 'quick';
    setPhase(responsePhase);
    timersRef.current.push(
      window.setTimeout(() => setPhase(noPressed ? 'tease' : 'quick_reward'), 2000),
      window.setTimeout(() => setPhase('reward'), 4500),
      window.setTimeout(() => {
        setShowComplete(true);
        setPhase('complete');
      }, 6500),
      window.setTimeout(() => onComplete(), 8500)
    );
  }, [phase, noPressed, onComplete]);

  const buttonBase =
    'select-none rounded-full border backdrop-blur-sm transition-all duration-500 font-[var(--font-display)] uppercase tracking-[0.25em] active:scale-90';

  return (
    <div
      ref={containerRef}
      className="relative flex h-full flex-col items-center justify-center px-6 text-center"
    >
      {/* drifting particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              left: `${10 + ((i * 37) % 80)}%`,
              top: `${5 + ((i * 53) % 90)}%`,
              background: 'rgba(255, 220, 200, 0.3)',
              animation: `floatParticle ${4 + (i % 5)}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* soft clouds */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 30% 20%, rgba(245,200,180,0.08), transparent), radial-gradient(ellipse 70% 35% at 70% 80%, rgba(200,180,220,0.06), transparent)',
        }}
      />

      {phase === 'playing' && (
        <div
          className="relative z-10 flex flex-col items-center gap-10 rounded-[2rem] px-7 py-6"
          style={{
            background: 'rgba(70, 35, 38, 0.16)',
            boxShadow: '0 12px 50px rgba(40, 16, 20, 0.12)',
            backdropFilter: 'blur(3px)',
          }}
        >
          <p
            key={promptIndex}
            className="font-[var(--font-display)] text-2xl font-light tracking-wide text-[#fff5ed]"
            style={{ animation: 'fadeInUp 0.6s ease-out', textShadow: '0 2px 14px rgba(50, 18, 22, 0.7)' }}
          >
            {PROMPTS[promptIndex]}
          </p>

          <div className="flex items-center gap-6">
            <button
              onClick={handleYes}
              className={buttonBase}
              style={{
                padding: `${12 * yesScale}px ${28 * yesScale}px`,
                fontSize: `${14 * yesScale}px`,
                borderColor: 'rgba(255,200,180,0.4)',
                background: 'rgba(245,180,160,0.12)',
                color: '#fff8f2',
                boxShadow: `0 0 ${20 * yesScale}px rgba(245,166,142,0.45), 0 2px 10px rgba(70,25,30,0.3)`,
              }}
            >
              Yes
            </button>

            <button
              onClick={handleNo}
              className={buttonBase}
              style={{
                padding: `${10 * noScale}px ${22 * noScale}px`,
                fontSize: `${12 * noScale}px`,
                borderColor: 'rgba(255,235,226,0.32)',
                background: 'rgba(60,45,55,0.32)',
                color: 'rgba(255,240,235,0.82)',
                transform: `translate(${noPos.x}px, ${noPos.y}px) scale(${noScale})`,
                opacity: noOpacity,
              }}
            >
              No
            </button>
          </div>
        </div>
      )}

      {(phase === 'knew_it' || phase === 'quick') && (
        <p
          className="relative z-10 rounded-[2rem] bg-[rgba(70,35,38,0.2)] px-7 py-5 font-[var(--font-display)] text-3xl font-light tracking-wide text-[#fff5ed]"
          style={{ animation: 'fadeInUp 0.8s ease-out', textShadow: '0 2px 14px rgba(50, 18, 22, 0.75)' }}
        >
          {phase === 'knew_it' ? 'i knew it.' : 'oh?? that was quick.'}
        </p>
      )}

      {(phase === 'tease' || phase === 'quick_reward') && (
        <p
          className="relative z-10 max-w-xs rounded-[2rem] bg-[rgba(70,35,38,0.2)] px-7 py-5 font-[var(--font-body)] text-base font-light leading-relaxed text-[#fff1e7]"
          style={{ animation: 'fadeInUp 0.8s ease-out', textShadow: '0 2px 12px rgba(50, 18, 22, 0.7)' }}
        >
          {phase === 'tease' ? 'took you long enough thoughhhh.' : 'okeyyy, luv u tooo.'}
        </p>
      )}

      {phase === 'reward' && (
        <p
          className="relative z-10 max-w-xs font-[var(--font-body)] text-sm font-light leading-relaxed text-white/60"
          style={{ animation: 'fadeInUp 0.8s ease-out' }}
        >
          okay, you passed the first stop.
        </p>
      )}

      {showComplete && (
        <div
          className="relative z-10 flex flex-col items-center gap-3"
          style={{ animation: 'fadeInUp 0.8s ease-out' }}
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-rose-200/40 to-transparent" />
          <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.4em] text-rose-200/60">
            Mission Complete
          </p>
        </div>
      )}
    </div>
  );
}
