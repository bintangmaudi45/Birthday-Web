import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { PLANETS, type PlanetConfig, type PlanetStatus } from '@/data/planets';
import { useProgress } from '@/state/ProgressContext';
import { useSound } from '@/state/SoundContext';
import StarField from './StarField';
import CentralStar from './CentralStar';
import Orbit from './Orbit';
import Planet from './Planet';
import PlanetLabel from './PlanetLabel';

export interface SolarSystemHandle {
  startExit: () => void;
}

interface PlanetRuntime {
  angle: number;
  x: number;
  y: number;
  scale: number;
}

type TransitionPhase = 'idle' | 'entering' | 'exiting';

interface Props {
  /** when true, galaxy is the active view (not inside a planet) */
  active: boolean;
  onEnterPlanet: (id: number) => void;
  onExitComplete: () => void;
}

const HITBOX = 72;

const SolarSystem = forwardRef<SolarSystemHandle, Props>(function SolarSystem(
  { active, onEnterPlanet, onExitComplete },
  ref
) {
  const { getStatus, completedPlanets, tourComplete } = useProgress();
  const { play, unlock } = useSound();
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [orbitsVisible, setOrbitsVisible] = useState(true);
  const [transition, setTransition] = useState<TransitionPhase>('idle');
  const [focusedPlanet, setFocusedPlanet] = useState<number | null>(null);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [pulseKeys, setPulseKeys] = useState<Record<number, number>>({});
  const [showFinale, setShowFinale] = useState(false);
  const [finaleStep, setFinaleStep] = useState(0);
  const [introStep, setIntroStep] = useState(0);
  const introShownRef = useRef(false);

  // runtime state stored in refs to avoid re-renders every frame
  const runtimeRef = useRef<Record<number, PlanetRuntime>>({});
  const rafRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // viewport tracking
  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // init runtime
  useEffect(() => {
    const rt: Record<number, PlanetRuntime> = {};
    for (const p of PLANETS) {
      rt[p.id] = {
        angle: p.initialAngle,
        x: 0,
        y: 0,
        scale: 1,
      };
    }
    runtimeRef.current = rt;
  }, []);

  // refs for DOM elements we move each frame
  const groupRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // transition refs
  const transitionRef = useRef({ phase: 'idle' as TransitionPhase, planet: null as number | null, progress: 0 });
  const transitionStartRef = useRef(0);

  const startEntry = useCallback((id: number) => {
    transitionStartRef.current = performance.now();
    transitionRef.current = { phase: 'entering', planet: id, progress: 0 };
    setTransition('entering');
    setFocusedPlanet(id);
    setOrbitsVisible(false);
  }, []);

  const startExit = useCallback(() => {
    transitionStartRef.current = performance.now();
    transitionRef.current = { phase: 'exiting', planet: focusedPlanet, progress: 0 };
    setTransition('exiting');
  }, [focusedPlanet]);

  // expose startExit to parent
  useImperativeHandle(ref, () => ({ startExit }), [startExit]);

  // expose exit to parent via effect
  useEffect(() => {
    if (transition === 'exiting' && transitionProgress >= 1) {
      transitionRef.current = { phase: 'idle', planet: null, progress: 0 };
      setTransition('idle');
      setFocusedPlanet(null);
      setOrbitsVisible(true);
      onExitComplete();
    }
  }, [transition, transitionProgress, onExitComplete]);

  // one-time orientation sequence after the opening flight
  useEffect(() => {
    if (!active || introShownRef.current || completedPlanets.length > 0) return;
    introShownRef.current = true;
    const timers = [
      window.setTimeout(() => setIntroStep(1), 700),
      window.setTimeout(() => setIntroStep(2), 2700),
      window.setTimeout(() => setIntroStep(3), 4700),
      window.setTimeout(() => setIntroStep(4), 6900),
      window.setTimeout(() => setIntroStep(5), 9000),
      window.setTimeout(() => setIntroStep(0), 11400),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [active, completedPlanets.length]);

  // finale sequence
  useEffect(() => {
    if (tourComplete && active) {
      const timers: number[] = [];
      timers.push(window.setTimeout(() => setShowFinale(true), 1000));
      timers.push(window.setTimeout(() => setFinaleStep(1), 3000));
      timers.push(window.setTimeout(() => setFinaleStep(2), 6000));
      timers.push(window.setTimeout(() => setFinaleStep(3), 9000));
      timers.push(window.setTimeout(() => setFinaleStep(4), 11000));
      return () => timers.forEach((t) => window.clearTimeout(t));
    }
  }, [tourComplete, active]);

  // main animation loop
  useEffect(() => {
    const animate = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      const rt = runtimeRef.current;
      const { w, h } = viewport;
      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const cx = w / 2;
      const cy = h / 2;
      const scaleBase = Math.min(w, h) / 700;
      const trans = transitionRef.current;

      // transition progress
      if (trans.phase === 'entering' || trans.phase === 'exiting') {
        const elapsed = now - transitionStartRef.current;
        const dur = 1400;
        trans.progress = Math.min(elapsed / dur, 1);
        setTransitionProgress(trans.progress);
        if (trans.progress >= 1 && trans.phase === 'entering') {
          const planetId = trans.planet;
          trans.phase = 'idle';
          if (planetId) {
            play('planetEnter');
            onEnterPlanet(planetId);
          }
        }
      }

      const enterT = trans.phase === 'entering' ? trans.progress : 0;
      const exitT = trans.phase === 'exiting' ? trans.progress : 0;

      for (const p of PLANETS) {
        const r = rt[p.id];
        if (!r) continue;
        r.angle += p.orbitalSpeed * dt;

        const rx = p.orbitalRadiusX * w * scaleBase * 1.4;
        const ry = p.orbitalRadiusY * h * scaleBase * 1.4;

        let x = cx + Math.cos(r.angle) * rx;
        let y = cy + Math.sin(r.angle) * ry;
        let scale = 0.7 + p.depth * 0.5;
        let opacity = 1;

        const depthFactor = (Math.sin(r.angle) + 1) / 2;
        scale *= 0.85 + depthFactor * 0.3;

        if (trans.phase === 'entering' && trans.planet === p.id) {
          scale *= 1 + enterT * 4;
          opacity = 1;
          x = x + (cx - x) * enterT * 0.3;
          y = y + (cy - y) * enterT * 0.3;
        } else if (trans.phase === 'entering') {
          scale *= 1 - enterT * 0.6;
          opacity = 1 - enterT * 0.8;
        }

        if (trans.phase === 'exiting' && trans.planet === p.id) {
          scale *= 1 + (1 - exitT) * 4;
          opacity = exitT;
        } else if (trans.phase === 'exiting') {
          scale *= 1 - (1 - exitT) * 0.6;
          opacity = exitT;
        }

        r.x = x;
        r.y = y;
        r.scale = scale;

        const group = groupRefs.current[p.id];
        if (group) {
          group.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
          group.style.opacity = String(opacity);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [viewport, onEnterPlanet, play]);

  const handleTap = useCallback(
    (id: number) => {
      unlock();
      play('planetClick');
      setPulseKeys((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

      if (transitionRef.current.phase === 'idle') {
        startEntry(id);
      }
    },
    [play, startEntry, unlock]
  );

  const starSize = Math.min(viewport.w, viewport.h) * 0.07;
  const scaleBase = Math.min(viewport.w, viewport.h) / 700;

  // constellation lines for finale
  const planetPositions = PLANETS.map((p) => runtimeRef.current[p.id]).filter(Boolean);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden bg-[#04050c]">
      <StarField intensity={tourComplete ? 1.2 : 1} className="absolute inset-0" />

      {/* orbits */}
      {PLANETS.map((p) => (
        <Orbit
          key={p.id}
          rx={p.orbitalRadiusX * viewport.w * scaleBase * 1.4}
          ry={p.orbitalRadiusY * viewport.h * scaleBase * 1.4}
          opacity={orbitsVisible ? 1 : 0}
        />
      ))}

      {/* constellation lines for finale */}
      {showFinale && planetPositions.length >= 5 && (
        <svg className="pointer-events-none absolute inset-0" style={{ zIndex: 8 }} width={viewport.w} height={viewport.h}>
          {PLANETS.map((p, i) => {
            const next = PLANETS[(i + 1) % PLANETS.length];
            const a = runtimeRef.current[p.id];
            const b = runtimeRef.current[next.id];
            if (!a || !b) return null;
            return (
              <line
                key={`const-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(252,211,77,0.2)"
                strokeWidth="1"
                style={{
                  animation: `constellationLine 2s ease-out forwards`,
                  animationDelay: `${i * 0.3}s`,
                  opacity: 0,
                }}
              />
            );
          })}
        </svg>
      )}

      {/* central star */}
      <CentralStar size={starSize} />

      {/* planets */}
      {PLANETS.map((p) => {
        const status: PlanetStatus = getStatus(p.id);
        return (
          <div
            key={p.id}
            ref={(el) => { groupRefs.current[p.id] = el; }}
            className="absolute left-0 top-0"
            style={{
              width: 0,
              height: 0,
              zIndex: 10,
              willChange: 'transform, opacity',
              transition: 'none',
            }}
          >
            <button
              onClick={() => handleTap(p.id)}
              aria-label={`Planet ${p.id}`}
              className="absolute"
              style={{
                width: HITBOX,
                height: HITBOX,
                left: -HITBOX / 2,
                top: -HITBOX / 2,
                zIndex: 11,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ zIndex: 10 }}
              >
                <Planet
                  planet={p}
                  status={status}
                  size={p.size}
                  pulseKey={pulseKeys[p.id] ?? 0}
                />
              </div>

              <PlanetLabel number={p.id} size={p.size} status={status} />
            </button>
          </div>
        );
      })}

      {/* transition overlay */}
      {(transition === 'entering' || transition === 'exiting') && focusedPlanet && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 18,
            background: `radial-gradient(circle at 50% 50%, ${
              PLANETS.find((p) => p.id === focusedPlanet)?.atmosphere
            } 0%, transparent ${30 + transitionProgress * 40}%)`,
            opacity: transition === 'entering' ? transitionProgress : 1 - transitionProgress,
          }}
        />
      )}

      {/* galaxy orientation */}
      {introStep > 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center" style={{ zIndex: 24 }}>
          <div key={introStep} style={{ animation: 'galaxyIntro 1.1s ease-out' }}>
            {introStep === 1 && (
              <p className="font-[var(--font-display)] text-xl font-light tracking-[0.18em] text-white/90" style={{ textShadow: '0 2px 18px rgba(0,0,0,0.8)' }}>
                WELCOME TO YOUR UNIVERSE.
              </p>
            )}
            {introStep === 2 && (
              <p className="font-[var(--font-display)] text-xl font-light tracking-wide text-white/80" style={{ textShadow: '0 2px 18px rgba(0,0,0,0.8)' }}>
                There are five stops along the way.
              </p>
            )}
            {introStep === 3 && (
              <p className="font-[var(--font-display)] text-xl font-light tracking-wide text-amber-50/90" style={{ textShadow: '0 2px 18px rgba(0,0,0,0.8)' }}>
                Start from Planet 1.
              </p>
            )}
            {introStep === 4 && (
              <p className="max-w-xs font-[var(--font-body)] text-sm font-light leading-relaxed tracking-wide text-white/75" style={{ textShadow: '0 2px 18px rgba(0,0,0,0.8)' }}>
                Every planet is open to explore.
                <br />
                Choose any little world you like.
              </p>
            )}
            {introStep === 5 && (
              <p className="max-w-xs font-[var(--font-body)] text-xs font-light leading-relaxed tracking-[0.12em] text-amber-100/65" style={{ textShadow: '0 2px 18px rgba(0,0,0,0.8)' }}>
                Your little gifts are waiting at the end of each stop.
              </p>
            )}
          </div>
        </div>
      )}

      {/* progress hint */}
      <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2" style={{ zIndex: 20 }}>
        <div className="flex gap-1.5">
          {PLANETS.map((p) => (
            <div
              key={p.id}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: getStatus(p.id) === 'completed' ? 18 : 8,
                background:
                  getStatus(p.id) === 'completed'
                    ? 'rgba(252,211,77,0.9)'
                    : 'rgba(255,255,255,0.5)',
                boxShadow:
                  getStatus(p.id) === 'completed'
                    ? '0 0 6px rgba(252,211,77,0.6)'
                    : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* FINALE overlay */}
      {showFinale && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 25 }}>
          {finaleStep >= 1 && (
            <p
              className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.5em] text-amber-200/60"
              style={{ animation: 'fadeInUp 1.5s ease-out' }}
            >
              TOUR COMPLETE
            </p>
          )}
          {finaleStep >= 2 && (
            <p
              className="mt-3 font-[var(--font-body)] text-sm font-light tracking-[0.3em] text-white/50"
              style={{ animation: 'fadeInUp 1.5s ease-out' }}
            >
              5 / 5 DESTINATIONS VISITED
            </p>
          )}
          {finaleStep >= 3 && (
            <p
              className="mt-10 font-[var(--font-display)] text-xl font-light tracking-wide text-amber-50/80"
              style={{ animation: 'fadeInUp 1.5s ease-out' }}
            >
              Thanks for coming along.
            </p>
          )}
          {finaleStep >= 4 && (
            <div className="mt-6 flex flex-col items-center gap-4" style={{ animation: 'fadeInUp 1.5s ease-out' }}>
              <p className="font-[var(--font-display)] text-2xl font-light tracking-wide text-amber-50">
                Happy birthday, Kak.
              </p>
              <p className="font-[var(--font-body)] text-sm font-light tracking-[0.2em] text-amber-200/40">
                25.08.2026
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default SolarSystem;
