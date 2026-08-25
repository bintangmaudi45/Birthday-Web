import { useCallback, useEffect, useRef, useState } from 'react';
import { useSound } from '@/state/SoundContext';

interface Props {
  onComplete: () => void;
  completed?: boolean;
}

interface MemoryCard {
  id: number;
  pairId: string;
  image: string;
  flipped: boolean;
  matched: boolean;
}

const memoryImages = [
  `${import.meta.env.BASE_URL}memories/WhatsApp_Image_2026-08-20_at_05.02.04.jpeg`,
  `${import.meta.env.BASE_URL}memories/WhatsApp_Image_2026-08-20_at_05.02.03_(2).jpeg`,
  `${import.meta.env.BASE_URL}memories/WhatsApp_Image_2026-08-20_at_05.02.03_(1).jpeg`,
  `${import.meta.env.BASE_URL}memories/WhatsApp_Image_2026-08-20_at_05.02.02.jpeg`,
];

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

function createCards(): MemoryCard[] {
  return shuffle(
    memoryImages.flatMap((image, pairIndex) => [
      {
        id: pairIndex * 2,
        pairId: `photo-${pairIndex}`,
        image,
        flipped: false,
        matched: false,
      },
      {
        id: pairIndex * 2 + 1,
        pairId: `photo-${pairIndex}`,
        image,
        flipped: false,
        matched: false,
      },
    ])
  );
}

type Phase =
  | 'intro-stop'
  | 'intro-line'
  | 'intro-instruction'
  | 'playing'
  | 'complete'
  | 'message1'
  | 'message2'
  | 'done';

export default function MemoryMission({
  onComplete,
  completed = false,
}: Props) {
  const { play } = useSound();

  const [cards, setCards] = useState<MemoryCard[]>(() => createCards());
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [phase, setPhase] = useState<Phase>(
    completed ? 'done' : 'intro-stop'
  );

  const lockRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (completed) return undefined;

    timersRef.current.push(
      window.setTimeout(() => setPhase('intro-line'), 1500),
      window.setTimeout(() => setPhase('intro-instruction'), 3500),
      window.setTimeout(() => setPhase('playing'), 5200)
    );

    return () =>
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, [completed]);

  useEffect(
    () => () =>
      timersRef.current.forEach((timer) => window.clearTimeout(timer)),
    []
  );

  const finishMission = useCallback(() => {
    timersRef.current.push(
      window.setTimeout(() => setPhase('complete'), 700),
      window.setTimeout(() => setPhase('message1'), 2300),
      window.setTimeout(() => setPhase('message2'), 4500),
      window.setTimeout(() => setPhase('done'), 6700),
      window.setTimeout(() => onComplete(), 7200)
    );
  }, [onComplete]);

  const handleFlip = useCallback(
    (cardId: number) => {
      if (lockRef.current || phase !== 'playing') return;

      const card = cards.find((item) => item.id === cardId);

      if (!card || card.flipped || card.matched) return;

      play('cardFlip');

      const nextFlippedIds = [...flippedIds, cardId];

      setFlippedIds(nextFlippedIds);

      setCards((current) =>
        current.map((item) =>
          item.id === cardId ? { ...item, flipped: true } : item
        )
      );

      if (nextFlippedIds.length !== 2) return;

      lockRef.current = true;

      const first = cards.find(
        (item) => item.id === nextFlippedIds[0]
      );

      const second = cards.find(
        (item) => item.id === nextFlippedIds[1]
      );

      if (!first || !second) return;

      if (first.pairId === second.pairId) {
        timersRef.current.push(
          window.setTimeout(() => {
            setCards((current) =>
              current.map((item) =>
                item.pairId === first.pairId
                  ? { ...item, matched: true }
                  : item
              )
            );

            setFlippedIds([]);

            setMatchedPairs((current) => {
              const next = current + 1;

              if (next === memoryImages.length) {
                finishMission();
              }

              return next;
            });

            lockRef.current = false;
          }, 650)
        );
      } else {
        timersRef.current.push(
          window.setTimeout(() => {
            setCards((current) =>
              current.map((item) =>
                item.id === first.id || item.id === second.id
                  ? { ...item, flipped: false }
                  : item
              )
            );

            setFlippedIds([]);
            lockRef.current = false;
          }, 850)
        );
      }
    },
    [cards, finishMission, flippedIds, phase, play]
  );

  const showGame = phase === 'playing';

  const showMessages =
    phase === 'complete' ||
    phase === 'message1' ||
    phase === 'message2' ||
    phase === 'done';

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 42%, rgba(76, 102, 205, 0.14), transparent 68%), radial-gradient(circle at 20% 80%, rgba(35, 180, 205, 0.06), transparent 35%)',
          animation: showGame
            ? 'nebulaBreathe 12s ease-in-out infinite'
            : 'none',
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(190,220,255,0.7) 0 1px, transparent 1.5px)',
          backgroundSize: '72px 72px',
          animation: 'archiveDrift 24s linear infinite',
        }}
      />

      {phase === 'intro-stop' && (
        <p
          className="relative z-10 font-[var(--font-display)] text-xl uppercase tracking-[0.48em] text-cyan-100/85"
          style={{
            animation: 'fadeInUp 0.9s ease-out',
            textShadow: '0 2px 18px rgba(55,120,220,0.65)',
          }}
        >
          STOP 02
        </p>
      )}

      {phase === 'intro-line' && (
        <p
          className="relative z-10 max-w-xs font-[var(--font-display)] text-2xl font-light tracking-wide text-[#eaf3ff]"
          style={{
            animation: 'fadeInUp 0.9s ease-out',
            textShadow: '0 2px 18px rgba(30,50,120,0.8)',
          }}
        >
          let&apos;s see what you remember.
        </p>
      )}

      {phase === 'intro-instruction' && (
        <p
          className="relative z-10 font-[var(--font-display)] text-xl font-light tracking-[0.12em] text-cyan-50/90"
          style={{
            animation: 'fadeInUp 0.9s ease-out',
            textShadow: '0 2px 18px rgba(30,80,150,0.8)',
          }}
        >
          match the cards.
        </p>
      )}

      {showGame && (
        <div
          className="relative z-10 flex w-full max-w-[360px] flex-col items-center gap-4"
          style={{ animation: 'fadeIn 0.8s ease-out' }}
        >
          <p
            className="font-[var(--font-body)] text-[11px] font-light uppercase tracking-[0.25em] text-cyan-100/75"
            style={{
              textShadow: '0 1px 10px rgba(20,40,100,0.9)',
            }}
          >
            memories matched: {matchedPairs} / {memoryImages.length}
          </p>

          <div className="grid w-full grid-cols-2 gap-3">
            {cards.map((card) => {
              const revealed = card.flipped || card.matched;

              return (
                <button
                  key={card.id}
                  onClick={() => handleFlip(card.id)}
                  disabled={card.matched}
                  aria-label={
                    revealed
                      ? 'Revealed memory'
                      : 'Face-down memory card'
                  }
                  className="relative aspect-square w-full rounded-xl text-left"
                  style={{
                    perspective: '900px',
                    touchAction: 'manipulation',
                  }}
                >
                  <div
                    className="relative h-full w-full transition-transform duration-500"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: revealed
                        ? 'rotateY(180deg)'
                        : 'rotateY(0deg)',
                      transitionTimingFunction:
                        'cubic-bezier(0.22, 0.61, 0.36, 1)',
                    }}
                  >
                    <div
                      className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl border border-cyan-100/20 bg-[#111a3a]/75 shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="h-10 w-10 rotate-45 border border-cyan-100/30" />
                      <div className="pointer-events-none absolute inset-2 rounded-lg border border-indigo-200/10" />
                    </div>

                    <div
                      className="absolute inset-0 overflow-hidden rounded-xl border"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        borderColor: card.matched
                          ? 'rgba(120,235,220,0.85)'
                          : 'rgba(130,170,240,0.45)',
                        boxShadow: card.matched
                          ? '0 0 24px rgba(90,220,210,0.38)'
                          : '0 8px 24px rgba(0,0,0,0.35)',
                      }}
                    >
                      <img
                        src={card.image}
                        alt="Personal memory"
                        className="h-full w-full object-cover"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-100/10 via-transparent to-indigo-950/25" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showMessages && (
        <div
          className="relative z-10 flex flex-col items-center gap-5 text-center"
          style={{ animation: 'memoryGather 1.2s ease-out' }}
        >
          {phase === 'complete' && (
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.42em] text-cyan-100/80">
              MISSION COMPLETE
            </p>
          )}

          {phase === 'message1' && (
            <p
              className="max-w-xs font-[var(--font-body)] text-sm font-light leading-relaxed text-[#edf5ff]"
              style={{
                animation: 'fadeInUp 0.9s ease-out',
                textShadow: '0 2px 14px rgba(20,35,100,0.9)',
              }}
            >
              Funny how some moments become memories without us even
              realizing it.
            </p>
          )}

          {phase === 'message2' && (
            <p
              className="max-w-xs font-[var(--font-body)] text-sm font-light leading-relaxed text-cyan-50/85"
              style={{ animation: 'fadeInUp 0.9s ease-out' }}
            >
              glad these ones happened.
            </p>
          )}

          {phase === 'done' && (
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.42em] text-cyan-100/80">
              MISSION COMPLETE
            </p>
          )}
        </div>
      )}
    </div>
  );
}