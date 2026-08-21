import { useCallback, useEffect, useRef, useState } from 'react';
import { useSound } from '@/state/SoundContext';

interface Props {
  onComplete: () => void;
}

interface FlowerSpot {
  id: number;
  x: number; // percentage
  y: number; // percentage
  found: boolean;
  color: string;
  size: number;
}

const FLOWER_COLORS = [
  '#ff6b8a',
  '#ffd93d',
  '#f0a050',
  '#e8638e',
  '#c4a8e8',
  '#ff8c61',
  '#7ec8a0',
];

const FLOWER_POSITIONS: Omit<FlowerSpot, 'found'>[] = [
  { id: 1, x: 15, y: 72, color: FLOWER_COLORS[0], size: 28 },
  { id: 2, x: 78, y: 68, color: FLOWER_COLORS[1], size: 24 },
  { id: 3, x: 35, y: 82, color: FLOWER_COLORS[2], size: 26 },
  { id: 4, x: 62, y: 78, color: FLOWER_COLORS[3], size: 22 },
  { id: 5, x: 22, y: 55, color: FLOWER_COLORS[4], size: 20 },
  { id: 6, x: 85, y: 45, color: FLOWER_COLORS[5], size: 26 },
  { id: 7, x: 50, y: 88, color: FLOWER_COLORS[6], size: 24 },
];

type Phase = 'garden' | 'bouquet' | 'message1' | 'message2' | 'done';

export default function GardenMission({ onComplete }: Props) {
  const { play } = useSound();
  const [flowers, setFlowers] = useState<FlowerSpot[]>(
    FLOWER_POSITIONS.map((f) => ({ ...f, found: false }))
  );
  const [foundCount, setFoundCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('garden');
  const [collecting, setCollecting] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => () => timersRef.current.forEach((t) => window.clearTimeout(t)), []);

  const handleFlowerTap = useCallback(
    (id: number) => {
      play('flowerCollect');
      setFlowers((prev) => prev.map((f) => (f.id === id ? { ...f, found: true } : f)));
      setCollecting(id);
      setFoundCount((c) => {
        const next = c + 1;
        if (next >= FLOWER_POSITIONS.length) {
          timersRef.current.push(
            window.setTimeout(() => setPhase('bouquet'), 1200),
            window.setTimeout(() => setPhase('message1'), 3500),
            window.setTimeout(() => setPhase('message2'), 5500),
            window.setTimeout(() => setPhase('done'), 7500),
            window.setTimeout(() => onComplete(), 9500)
          );
        }
        return next;
      });
      window.setTimeout(() => setCollecting(null), 800);
    },
    [onComplete, play]
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* SKY background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, #87ceeb 0%, #b0d8f0 35%, #d4e8d0 55%, #a8c890 75%, #7a9a6a 100%)',
        }}
      />

      {/* drifting clouds */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${60 + i * 20}px`,
              height: `${30 + i * 8}px`,
              left: `${i * 25}%`,
              top: `${5 + i * 8}%`,
              background: 'rgba(255,255,255,0.6)',
              filter: 'blur(8px)',
              animation: `driftCloud ${20 + i * 5}s linear infinite`,
              animationDelay: `${i * 3}s`,
            }}
          />
        ))}
      </div>

      {/* distant hills */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{
          height: '40%',
          background: 'linear-gradient(to top, rgba(90,130,80,0.4), transparent)',
          clipPath: 'polygon(0 60%, 15% 40%, 30% 55%, 50% 35%, 70% 50%, 85% 40%, 100% 55%, 100% 100%, 0 100%)',
        }}
      />

      {/* trees — middle ground */}
      <div className="pointer-events-none absolute bottom-[15%] left-[8%]">
        <TreeShape height={80} />
      </div>
      <div className="pointer-events-none absolute bottom-[12%] right-[10%]">
        <TreeShape height={100} />
      </div>
      <div className="pointer-events-none absolute bottom-[18%] left-[40%]">
        <TreeShape height={60} />
      </div>

      {/* grass foreground */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{
          height: '20%',
          background: 'linear-gradient(to top, #6a8a5a, rgba(106,138,90,0.3))',
        }}
      />

      {/* floating pollen particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 4,
              height: 4,
              left: `${(i * 13 + 7) % 95}%`,
              top: `${(i * 17 + 20) % 80}%`,
              background: 'rgba(255,240,180,0.5)',
              animation: `floatPollen ${5 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* butterflies */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${20 + i * 50}%`,
              top: `${30 + i * 20}%`,
              animation: `butterflyPath ${8 + i * 3}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`,
            }}
          >
            <div style={{ animation: `flutter 0.3s ease-in-out infinite` }}>
              <svg width="20" height="14" viewBox="0 0 20 14">
                <ellipse cx="6" cy="7" rx="5" ry="6" fill="rgba(255,150,100,0.6)" />
                <ellipse cx="14" cy="7" rx="5" ry="6" fill="rgba(255,150,100,0.6)" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {phase === 'garden' && (
        <>
          {/* hidden flowers */}
          {flowers.map((flower) => (
            <button
              key={flower.id}
              onClick={() => !flower.found && handleFlowerTap(flower.id)}
              disabled={flower.found}
              className="absolute"
              style={{
                left: `${flower.x}%`,
                top: `${flower.y}%`,
                width: 48,
                height: 48,
                transform: 'translate(-50%, -50%)',
                touchAction: 'manipulation',
                zIndex: 5,
                opacity: flower.found ? 0 : 1,
                transition: collecting === flower.id ? 'opacity 0.6s ease, transform 0.6s ease' : 'none',
                transformOrigin: 'center',
              }}
            >
              <FlowerSVG color={flower.color} size={flower.size} />
            </button>
          ))}

          {/* collecting particle effect */}
          {collecting !== null && (
            <div
              className="pointer-events-none absolute"
              style={{
                left: `${FLOWER_POSITIONS.find((f) => f.id === collecting)?.x}%`,
                top: `${FLOWER_POSITIONS.find((f) => f.id === collecting)?.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 6,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: FLOWER_POSITIONS.find((f) => f.id === collecting)?.color,
                    animation: `collectParticle 0.8s ease-out forwards`,
                    animationDelay: `${i * 0.05}s`,
                    // @ts-expect-error CSS custom property
                    '--angle': `${i * 60}deg`,
                  }}
                />
              ))}
            </div>
          )}

          {/* progress counter */}
          <div className="absolute left-1/2 top-8 z-10 -translate-x-1/2">
            <span className="rounded-full bg-black/20 px-4 py-1.5 font-[var(--font-body)] text-xs font-light tracking-widest text-white/80 backdrop-blur-sm">
              flowers found: {foundCount} / {FLOWER_POSITIONS.length}
            </span>
          </div>
        </>
      )}

      {(phase === 'bouquet' || phase === 'message1' || phase === 'message2' || phase === 'done') && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center"
          style={{
            background: 'rgba(4,5,12,0.6)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 1s ease-out',
          }}
        >
          {/* Bouquet */}
          {phase !== 'done' && (
            <div
              style={{
                animation: 'bouquetReveal 2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              <img
                src="/memories/WhatsApp_Image_2026-08-21_at_20.07.58.jpeg"
                alt="A bouquet of flowers"
                className="h-auto w-[min(78vw,520px)] object-contain"
                style={{ mixBlendMode: 'screen', filter: 'drop-shadow(0 12px 30px rgba(255,210,190,0.35))' }}
              />
            </div>
          )}

          {phase === 'message1' && (
            <p
              className="mt-8 font-[var(--font-display)] text-2xl font-light tracking-wide text-rose-50"
              style={{ animation: 'fadeInUp 1s ease-out' }}
            >
              for you.
            </p>
          )}
          {phase === 'message2' && (
            <p
              className="mt-4 max-w-xs font-[var(--font-body)] text-sm font-light leading-relaxed text-white/60"
              style={{ animation: 'fadeInUp 1s ease-out' }}
            >
              the first little thing from this tour.
            </p>
          )}
          {phase === 'done' && (
            <div className="flex flex-col items-center gap-3" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-rose-200/40 to-transparent" />
              <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.4em] text-rose-200/60">
                Mission Complete
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TreeShape({ height }: { height: number }) {
  return (
    <div style={{ width: height * 0.7, height }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse 50% 60% at 50% 40%, rgba(60,100,50,0.7), rgba(50,80,40,0.5))',
          borderRadius: '50% 50% 40% 40%',
          filter: 'blur(2px)',
        }}
      />
    </div>
  );
}

function FlowerSVG({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}>
      <circle cx="15" cy="15" r="4" fill="#fff3a0" />
      {[0, 72, 144, 216, 288].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <ellipse
            key={angle}
            cx={15 + Math.cos(rad) * 8}
            cy={15 + Math.sin(rad) * 8}
            rx="5"
            ry="7"
            fill={color}
            opacity={0.85}
            transform={`rotate(${angle} ${15 + Math.cos(rad) * 8} ${15 + Math.sin(rad) * 8})`}
          />
        );
      })}
    </svg>
  );
}

