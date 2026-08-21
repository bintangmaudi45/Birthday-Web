import { useEffect, useRef } from 'react';
import type { PlanetConfig, PlanetStatus } from '@/data/planets';

interface Props {
  planet: PlanetConfig;
  status: PlanetStatus;
  size: number;
  /** increments on each tap to retrigger pulse animation */
  pulseKey: number;
}

/**
 * The visual planet body — layered gradients for illuminated/shadowed sides,
 * atmospheric rim light, and surface bands. Decorative (pointer-events none);
 * the hitbox is handled by the parent interactive group.
 *
 * Rotation is handled via CSS animation (GPU-friendly, no per-frame JS).
 * Tap pulse is retriggered via `pulseKey` using the Web Animations API.
 */
export default function Planet({ planet, status, size, pulseKey }: Props) {
  const { palette } = planet;
  const dim = 1;
  const completedBoost = status === 'completed' ? 1.25 : 1;
  const brightness = 1 + (status === 'completed' ? 0.15 : 0);
  const visualRef = useRef<HTMLDivElement>(null);

  // rotation duration from rotationSpeed (deg/s → seconds per full rotation)
  const rotationDuration = 360 / planet.rotationSpeed;

  // retrigger tap pulse via Web Animations API
  useEffect(() => {
    if (pulseKey === 0) return;
    const el = visualRef.current;
    if (!el) return;
    el.animate(
      [
        { transform: 'scale(1)', filter: 'brightness(1) saturate(1)' },
        { transform: 'scale(1.2)', filter: 'brightness(1.5) saturate(1.3)', offset: 0.4 },
        { transform: 'scale(1)', filter: 'brightness(1) saturate(1)' },
      ],
      { duration: 600, easing: 'ease-out' }
    );
  }, [pulseKey]);

  return (
    <div
      ref={visualRef}
      className="planet-visual relative"
      style={{
        width: size,
        height: size,
        filter: `brightness(${brightness}) saturate(${dim * completedBoost})`,
        // @ts-expect-error CSS custom property for animation duration
        '--rot-dur': `${rotationDuration}s`,
      }}
    >
      {/* atmospheric glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 1.8,
          height: size * 1.8,
          background: `radial-gradient(circle, ${palette.glow} 0%, transparent 60%)`,
          opacity: dim * 0.7,
          animation: status === 'completed' ? 'planetHalo 3s ease-in-out infinite' : undefined,
        }}
      />

      {/* planet body */}
      <div
        className="planet-body relative overflow-hidden rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 32% 30%, ${palette.core} 0%, ${palette.mid} 45%, ${palette.rim} 75%, ${palette.shadow} 100%)`,
          boxShadow: `inset -${size * 0.18}px -${size * 0.18}px ${size * 0.3}px ${palette.shadow},
                      inset ${size * 0.08}px ${size * 0.08}px ${size * 0.15}px rgba(255,255,255,0.15),
                      0 0 ${size * 0.4}px ${palette.glow}`,
        }}
      >
        {/* surface bands / texture — rotates via CSS animation */}
        <div
          className="planet-surface absolute inset-0 rounded-full opacity-40"
          style={{
            background: `repeating-linear-gradient(90deg,
              transparent 0px,
              ${palette.rim}22 ${size * 0.04}px,
              transparent ${size * 0.08}px,
              ${palette.mid}18 ${size * 0.12}px,
              transparent ${size * 0.2}px)`,
            mixBlendMode: 'overlay',
            animation: `planetSpin var(--rot-dur) linear infinite`,
          }}
        />
        {/* cloud highlight — rotates at different speed */}
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `radial-gradient(ellipse 60% 20% at 50% 35%, ${palette.core}55, transparent 70%)`,
            animation: `planetSpin ${rotationDuration * 1.4}s linear infinite`,
          }}
        />
        {/* rim light */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow: `inset 0 0 ${size * 0.12}px ${palette.glow}`,
          }}
        />
      </div>

      {/* completed halo ring */}
      {status === 'completed' && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 1.35,
            height: size * 1.35,
            border: `1px solid ${palette.glow}`,
            opacity: 0.5,
            animation: 'planetHalo 3s ease-in-out infinite',
          }}
        />
      )}

      {/* lock indicator — removed; all planets accessible */}

      {/* completed sparkles */}
      {status === 'completed' && <Sparkles size={size} />}
    </div>
  );
}

function Sparkles({ size }: { size: number }) {
  const sparkles = useRef(
    Array.from({ length: 6 }).map((_, i) => {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      const dist = size * (0.65 + Math.random() * 0.2);
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        delay: i * 0.4 + Math.random() * 0.5,
        scale: 0.6 + Math.random() * 0.5,
      };
    })
  ).current;

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2" style={{ width: 0, height: 0 }}>
      {sparkles.map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: s.x,
            top: s.y,
            transform: `translate(-50%, -50%) scale(${s.scale})`,
            animation: `sparkleTwinkle 2.5s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8">
            <path
              d="M4 0 L4.8 3.2 L8 4 L4.8 4.8 L4 8 L3.2 4.8 L0 4 L3.2 3.2 Z"
              fill="rgba(255,240,200,0.9)"
              style={{ filter: 'drop-shadow(0 0 3px rgba(255,220,150,0.7))' }}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
