import { useEffect, useRef, useState } from 'react';
import { PLANETS } from '@/data/planets';
import StarField from './StarField';
import ReturnToGalaxyButton from './ReturnToGalaxyButton';

interface Props {
  planetId: number;
  onReturn: () => void;
}

/**
 * Placeholder planet environment shown after the entry transition.
 * Temporary — will be replaced by per-planet mission components later.
 */
export default function PlanetPlaceholder({ planetId, onReturn }: Props) {
  const planet = PLANETS.find((p) => p.id === planetId);
  const [appear, setAppear] = useState(false);
  const timerRef = useRef<number>();

  useEffect(() => {
    setAppear(false);
    timerRef.current = window.setTimeout(() => setAppear(true), 200);
    return () => window.clearTimeout(timerRef.current);
  }, [planetId]);

  if (!planet) return null;

  return (
    <div className="fixed inset-0 overflow-hidden">
      <StarField intensity={0.6} className="absolute inset-0" />

      {/* planet atmosphere backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${planet.atmosphere} 0%, #04050c 70%)`,
        }}
      />

      {/* large soft planet body in the distance */}
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: '70vmin',
          height: '70vmin',
          background: `radial-gradient(circle at 35% 30%, ${planet.palette.core} 0%, ${planet.palette.mid} 40%, ${planet.palette.rim} 70%, ${planet.palette.shadow} 100%)`,
          boxShadow: `inset -40px -40px 80px ${planet.palette.shadow}, 0 0 120px ${planet.palette.glow}`,
          opacity: appear ? 0.85 : 0,
          transform: `translate(-50%, -50%) scale(${appear ? 1 : 0.7})`,
          transition: 'all 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* content */}
      <div
        className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center"
        style={{
          opacity: appear ? 1 : 0,
          transform: appear ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s ease 0.5s',
        }}
      >
        <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.5em] text-white/40">
          Planet {planet.id}
        </p>
        <h2
          className="mt-4 font-[var(--font-display)] text-3xl font-light tracking-[0.15em]"
          style={{ color: planet.palette.core }}
        >
          {planet.name.toUpperCase()}
        </h2>
        <div className="mt-8 h-px w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <p className="mt-8 font-[var(--font-body)] text-sm font-light tracking-[0.3em] text-white/50">
          MISSION COMING SOON
        </p>
        <p className="mt-3 max-w-[200px] font-[var(--font-body)] text-xs font-light leading-relaxed text-white/30">
          {planet.missionName}
        </p>
      </div>

      <ReturnToGalaxyButton onReturn={onReturn} />
    </div>
  );
}
