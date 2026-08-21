import { useCallback, useRef, useState } from 'react';
import { ProgressProvider, useProgress } from '@/state/ProgressContext';
import { SoundProvider, useSound } from '@/state/SoundContext';
import OpeningSequence from '@/components/OpeningSequence';
import SolarSystem, { type SolarSystemHandle } from '@/components/SolarSystem';
import PlanetEnvironment from '@/components/PlanetEnvironment';
import SoundControls from '@/components/SoundControls';

type View = 'opening' | 'galaxy' | 'planet';

function Experience() {
  const { tourStarted, currentPlanet, enterPlanet, exitPlanet, completePlanet, startTour, completedPlanets } = useProgress();
  const { play, unlock } = useSound();
  const [view, setView] = useState<View>('opening');
  const [exiting, setExiting] = useState(false);
  const solarRef = useRef<SolarSystemHandle>(null);

  const handleStart = useCallback(() => {
    unlock();
    startTour();
    setView('galaxy');
  }, [startTour, unlock]);

  const handleEnterPlanet = useCallback(
    (id: number) => {
      enterPlanet(id);
      setView('planet');
    },
    [enterPlanet]
  );

  const handleMissionComplete = useCallback(() => {
    if (currentPlanet) {
      completePlanet(currentPlanet);
      play('planetComplete');
    }
  }, [currentPlanet, completePlanet, play]);

  const handleReturnToGalaxy = useCallback(() => {
    play('returnGalaxy');
    setExiting(true);
    solarRef.current?.startExit();
  }, [play]);

  const handleExitComplete = useCallback(() => {
    setExiting(false);
    exitPlanet();
    setView('galaxy');
  }, [exitPlanet]);

  if (view === 'opening' && !tourStarted) {
    return (
      <>
        <OpeningSequence onStart={handleStart} />
        <SoundControls />
      </>
    );
  }

  return (
    <>
      <SolarSystem
        ref={solarRef}
        active={view === 'galaxy'}
        onEnterPlanet={handleEnterPlanet}
        onExitComplete={handleExitComplete}
      />
      {view === 'planet' && currentPlanet && (
        <div
          style={{
            opacity: exiting ? 0 : 1,
            transition: 'opacity 1.4s ease-in',
            pointerEvents: exiting ? 'none' : 'auto',
          }}
        >
          <PlanetEnvironment
            planetId={currentPlanet}
            onReturn={handleReturnToGalaxy}
            onComplete={handleMissionComplete}
            completed={completedPlanets.includes(currentPlanet)}
          />
        </div>
      )}
      <SoundControls />
    </>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <SoundProvider>
        <Experience />
      </SoundProvider>
    </ProgressProvider>
  );
}
