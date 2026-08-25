import { useCallback, useEffect, useRef, useState } from 'react';
import { useSound } from '@/state/SoundContext';

interface Props {
  onComplete: () => void;
}

interface FlowerSpot {
  id: number;
  x: number;
  y: number;
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
  { id: 1, x: 14, y: 70, color: FLOWER_COLORS[0], size: 28 },
  { id: 2, x: 79, y: 67, color: FLOWER_COLORS[1], size: 24 },
  { id: 3, x: 34, y: 80, color: FLOWER_COLORS[2], size: 26 },
  { id: 4, x: 63, y: 76, color: FLOWER_COLORS[3], size: 22 },
  { id: 5, x: 21, y: 53, color: FLOWER_COLORS[4], size: 20 },
  { id: 6, x: 86, y: 44, color: FLOWER_COLORS[5], size: 26 },
  { id: 7, x: 50, y: 87, color: FLOWER_COLORS[6], size: 24 },
];

type Phase =
  | 'garden'
  | 'bouquet'
  | 'message1'
  | 'message2'
  | 'done';

export default function GardenMission({ onComplete }: Props) {
  const { play } = useSound();

  const [flowers, setFlowers] = useState<FlowerSpot[]>(
    FLOWER_POSITIONS.map((flower) => ({
      ...flower,
      found: false,
    }))
  );

  const [foundCount, setFoundCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('garden');
  const [collecting, setCollecting] = useState<number | null>(null);

  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, []);

  const handleFlowerTap = useCallback(
    (id: number) => {
      const flower = flowers.find((item) => item.id === id);

      if (!flower || flower.found) return;

      play('flowerCollect');

      setFlowers((previous) =>
        previous.map((item) =>
          item.id === id
            ? { ...item, found: true }
            : item
        )
      );

      setCollecting(id);

      setFoundCount((current) => {
        const next = current + 1;

        if (next === 7) {
          /*
           * FLOW:
           * 1. Wait a little after collecting the final flower
           * 2. Bouquet appears
           * 3. "for you." appears
           * 4. Longer message
           * 5. Mission complete
           */

          timersRef.current.push(
            window.setTimeout(
              () => setPhase('bouquet'),
              1400
            ),

            window.setTimeout(
              () => setPhase('message1'),
              6200
            ),

            window.setTimeout(
              () => setPhase('message2'),
              9800
            ),

            window.setTimeout(
              () => setPhase('done'),
              13200
            ),

            window.setTimeout(
              () => onComplete(),
              15500
            )
          );
        }

        return next;
      });

      window.setTimeout(() => {
        setCollecting(null);
      }, 900);
    },
    [flowers, onComplete, play]
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">

      {/* =====================================================
          GARDEN VIDEO
      ===================================================== */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={`${import.meta.env.BASE_URL}assets/garden.mp4`}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* soft overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(10,20,10,0.12) 55%, rgba(5,10,5,0.38))',
        }}
      />

      {/* dreamy center glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,220,190,0.10), transparent 62%)',
        }}
      />

      {/* =====================================================
          FLOATING POLLEN
      ===================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, index) => (
          <div
            key={index}
            className="absolute rounded-full"
            style={{
              width: 3 + (index % 3),
              height: 3 + (index % 3),
              left: `${(index * 17 + 5) % 95}%`,
              top: `${(index * 23 + 12) % 85}%`,
              background: 'rgba(255,240,190,0.55)',
              animation: `floatPollen ${5 + (index % 4)}s ease-in-out infinite`,
              animationDelay: `${index * 0.25}s`,
            }}
          />
        ))}
      </div>

      {/* =====================================================
          BUTTERFLIES
      ===================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${20 + index * 50}%`,
              top: `${30 + index * 20}%`,
              animation: `butterflyPath ${8 + index * 3}s ease-in-out infinite`,
              animationDelay: `${index * 2}s`,
            }}
          >
            <div
              style={{
                animation: 'flutter 0.3s ease-in-out infinite',
              }}
            >
              <svg width="20" height="14" viewBox="0 0 20 14">
                <ellipse
                  cx="6"
                  cy="7"
                  rx="5"
                  ry="6"
                  fill="rgba(255,150,100,0.65)"
                />
                <ellipse
                  cx="14"
                  cy="7"
                  rx="5"
                  ry="6"
                  fill="rgba(255,150,100,0.65)"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          FLOWER HUNT
      ===================================================== */}
      {phase === 'garden' && (
        <>
          {flowers.map((flower) => (
            <button
              key={flower.id}
              type="button"
              aria-label={`Find flower ${flower.id}`}
              onClick={() => handleFlowerTap(flower.id)}
              disabled={flower.found}
              className="absolute appearance-none border-0 bg-transparent p-0"
              style={{
                left: `${flower.x}%`,
                top: `${flower.y}%`,
                width: 64,
                height: 64,

                transform: 'translate(-50%, -50%)',

                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',

                zIndex: 20,

                cursor: flower.found
                  ? 'default'
                  : 'pointer',

                opacity: flower.found ? 0 : 1,

                /*
                 * Initial entrance:
                 * tiny → bigger → settle
                 */
                animation: `flowerPopIn 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${flower.id * 0.08}s both`,

                transition:
                  'opacity 0.55s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',

                filter:
                  flower.found
                    ? 'blur(2px)'
                    : 'none',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  animation:
                    `flowerFloat ${2.8 + (flower.id % 3) * 0.4}s ease-in-out infinite`,
                  animationDelay:
                    `${flower.id * 0.2}s`,
                }}
              >
                <FlowerSVG
                  color={flower.color}
                  size={flower.size}
                  id={flower.id}
                />
              </div>
            </button>
          ))}

          {/* =================================================
              COLLECTION PARTICLES
          ================================================= */}
          {collecting !== null && (
            <div
              className="pointer-events-none absolute"
              style={{
                left: `${
                  FLOWER_POSITIONS.find(
                    (flower) =>
                      flower.id === collecting
                  )?.x
                }%`,
                top: `${
                  FLOWER_POSITIONS.find(
                    (flower) =>
                      flower.id === collecting
                  )?.y
                }%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 30,
              }}
            >
              {Array.from({ length: 10 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="absolute rounded-full"
                    style={{
                      width: 5 + (index % 3),
                      height: 5 + (index % 3),

                      background:
                        FLOWER_POSITIONS.find(
                          (flower) =>
                            flower.id === collecting
                        )?.color,

                      boxShadow:
                        '0 0 8px rgba(255,255,255,0.7)',

                      animation:
                        'collectParticle 0.9s ease-out forwards',

                      animationDelay:
                        `${index * 0.045}s`,

                      // @ts-expect-error CSS custom property
                      '--angle': `${index * 36}deg`,
                    }}
                  />
                )
              )}
            </div>
          )}

          {/* =================================================
              COUNTER
          ================================================= */}
          <div
            className="absolute left-1/2 top-7 -translate-x-1/2"
            style={{ zIndex: 40 }}
          >
            <span
              className="
                block
                whitespace-nowrap
                rounded-full
                border border-white/10
                bg-black/30
                px-5
                py-2
                font-[var(--font-body)]
                text-xs
                font-light
                tracking-[0.2em]
                text-white/90
                shadow-lg
                backdrop-blur-md
              "
            >
              flowers found: {foundCount} / 7
            </span>
          </div>

          {/* =================================================
              CLEAR INSTRUCTION
              DITARUH DI ATAS AGAR TIDAK KETUTUP RETURN BUTTON
          ================================================= */}
          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[4.8rem]
              z-40
              w-full
              -translate-x-1/2
              px-8
              text-center
            "
          >
            <div
              className="
                mx-auto
                max-w-[320px]
                rounded-2xl
                border
                border-white/10
                bg-black/20
                px-5
                py-3
                backdrop-blur-sm
              "
              style={{
                animation:
                  'fadeInUp 1.2s ease-out',
              }}
            >
              <p
                className="
                  font-[var(--font-body)]
                  text-[11px]
                  font-light
                  leading-relaxed
                  tracking-[0.08em]
                  text-white/80
                "
              >
                Find all seven little flowers
                hidden around the garden.
                <br />
                <span className="text-white/55">
                  Just tap each flower you find.
                </span>
              </p>
            </div>
          </div>
        </>
      )}

      {/* =====================================================
          BOUQUET REVEAL
      ===================================================== */}
      {(phase === 'bouquet' ||
        phase === 'message1' ||
        phase === 'message2' ||
        phase === 'done') && (
        <div
          className="
            absolute
            inset-0
            z-50
            flex
            flex-col
            items-center
            justify-start
            overflow-hidden
            px-6
          "
          style={{
            background:
              'rgba(4,5,12,0.32)',
            backdropFilter:
              'blur(4px)',
            animation:
              'fadeIn 1.2s ease-out',
          }}
        >

          {/* =================================================
              BOUQUET
          ================================================= */}
          {phase !== 'done' && (
            <div
              className="
                relative
                mt-[10vh]
                flex
                items-center
                justify-center
              "
              style={{
                animation:
                  'bouquetReveal 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  width: '75%',
                  height: '55%',
                  background:
                    'radial-gradient(circle, rgba(255,190,210,0.18), transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />

              <img
                src={`${import.meta.env.BASE_URL}assets/bouquet.png`}
                alt="A bouquet of flowers"
                className="
                  relative
                  h-auto
                  w-[min(74vw,460px)]
                  object-contain
                "
                style={{
                  filter:
                    'drop-shadow(0 18px 45px rgba(255,210,190,0.48))',
                }}
              />
            </div>
          )}

          {/* =================================================
              MESSAGE 1
          ================================================= */}
          {phase === 'message1' && (
            <div
              className="
                absolute
                left-0
                right-0
                top-[72%]
                flex
                justify-center
                px-8
              "
              style={{
                animation:
                  'fadeInUp 1.4s ease-out',
              }}
            >
              <p
                className="
                  font-[var(--font-display)]
                  text-2xl
                  font-light
                  tracking-wide
                  text-rose-50
                  drop-shadow-lg
                "
              >
                for you.
              </p>
            </div>
          )}

          {/* =================================================
              MESSAGE 2
          ================================================= */}
          {phase === 'message2' && (
            <div
              className="
                absolute
                left-0
                right-0
                top-[68%]
                flex
                justify-center
                px-8
              "
              style={{
                animation:
                  'fadeInUp 1.4s ease-out',
              }}
            >
              <p
                className="
                  max-w-[310px]
                  text-center
                  font-[var(--font-body)]
                  text-sm
                  font-light
                  leading-relaxed
                  tracking-wide
                  text-white/80
                  drop-shadow-lg
                "
              >
                the first little thing
                <br />
                from this tour.
              </p>
            </div>
          )}

          {/* =================================================
              DONE
          ================================================= */}
          {phase === 'done' && (
            <div
              className="
                absolute
                left-0
                right-0
                top-[70%]
                flex
                flex-col
                items-center
                gap-3
              "
              style={{
                animation:
                  'fadeInUp 1s ease-out',
              }}
            >
              <div
                className="
                  h-px
                  w-12
                  bg-gradient-to-r
                  from-transparent
                  via-rose-200/40
                  to-transparent
                "
              />

              <p
                className="
                  font-[var(--font-display)]
                  text-[11px]
                  uppercase
                  tracking-[0.4em]
                  text-rose-200/70
                "
              >
                Mission Complete
              </p>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}
      <style>{`
        @keyframes flowerPopIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.12) rotate(-10deg);
          }

          45% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.18) rotate(4deg);
          }

          72% {
            transform: translate(-50%, -50%) scale(0.94) rotate(-2deg);
          }

          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
        }

        @keyframes flowerFloat {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }

          50% {
            transform: translateY(-4px) rotate(1.5deg);
          }
        }

        @keyframes bouquetReveal {
          0% {
            opacity: 0;
            transform: scale(0.08) translateY(40px);
          }

          45% {
            opacity: 1;
            transform: scale(1.08) translateY(-4px);
          }

          70% {
            transform: scale(0.97) translateY(0);
          }

          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function FlowerSVG({
  color,
  size,
  id,
}: {
  color: string;
  size: number;
  id: number;
}) {
  const gradientId = `flowerGradient-${id}`;
  const centerGradientId = `centerGradient-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      style={{
        overflow: 'visible',
        filter:
          'drop-shadow(0 4px 5px rgba(0,0,0,0.45))',
      }}
    >
      <defs>
        {/* Main petal gradient */}
        <radialGradient id={gradientId}>
          <stop
            offset="0%"
            stopColor="#ffffff"
            stopOpacity="0.42"
          />

          <stop
            offset="35%"
            stopColor={color}
            stopOpacity="0.98"
          />

          <stop
            offset="100%"
            stopColor={color}
            stopOpacity="0.68"
          />
        </radialGradient>

        {/* Flower center gradient */}
        <radialGradient id={centerGradientId}>
          <stop
            offset="0%"
            stopColor="#fffde7"
          />

          <stop
            offset="45%"
            stopColor="#ffe58a"
          />

          <stop
            offset="100%"
            stopColor="#d9a83f"
          />
        </radialGradient>
      </defs>

      {/* soft flower shadow */}
      <ellipse
        cx="15"
        cy="22"
        rx="8"
        ry="2.5"
        fill="rgba(0,0,0,0.22)"
        filter="blur(1px)"
      />

      {/* petals */}
      {[0, 72, 144, 216, 288].map(
        (angle) => {
          const rad =
            (angle * Math.PI) / 180;

          const cx =
            15 + Math.cos(rad) * 7.3;

          const cy =
            15 + Math.sin(rad) * 7.3;

          return (
            <g key={angle}>
              {/* darker lower petal */}
              <ellipse
                cx={cx + 0.5}
                cy={cy + 1}
                rx="5.3"
                ry="7.2"
                fill="rgba(0,0,0,0.16)"
                transform={`rotate(${angle} ${cx} ${cy})`}
              />

              {/* main petal */}
              <ellipse
                cx={cx}
                cy={cy}
                rx="5"
                ry="7"
                fill={`url(#${gradientId})`}
                transform={`rotate(${angle} ${cx} ${cy})`}
              />

              {/* petal highlight */}
              <ellipse
                cx={cx - 1}
                cy={cy - 1.5}
                rx="1.8"
                ry="3"
                fill="rgba(255,255,255,0.20)"
                transform={`rotate(${angle} ${cx} ${cy})`}
              />
            </g>
          );
        }
      )}

      {/* center shadow */}
      <circle
        cx="15"
        cy="15.7"
        r="4.3"
        fill="rgba(0,0,0,0.18)"
      />

      {/* center */}
      <circle
        cx="15"
        cy="14.7"
        r="4"
        fill={`url(#${centerGradientId})`}
      />

      {/* center highlight */}
      <circle
        cx="13.8"
        cy="13.4"
        r="1.2"
        fill="rgba(255,255,255,0.7)"
      />

      {/* tiny center dots */}
      {[0, 72, 144, 216, 288].map(
        (angle) => {
          const rad =
            (angle * Math.PI) / 180;

          return (
            <circle
              key={`dot-${angle}`}
              cx={
                15 +
                Math.cos(rad) * 2.2
              }
              cy={
                14.7 +
                Math.sin(rad) * 2.2
              }
              r="0.45"
              fill="rgba(150,100,30,0.45)"
            />
          );
        }
      )}
    </svg>
  );
}