import { PLANETS } from '@/data/planets';
import StarField from './StarField';
import ReturnToGalaxyButton from './ReturnToGalaxyButton';
import LoveMeMission from './missions/LoveMeMission';
import MemoryMission from './missions/MemoryMission';
import GardenMission from './missions/GardenMission';
import SongMission from './missions/SongMission';
import BirthdayMission from './missions/BirthdayMission';

interface Props {
  planetId: number;
  onReturn: () => void;
  onComplete: () => void;
  completed?: boolean;
}

/**
 * Routes to the correct mission component based on planet ID.
 * Provides the shared atmospheric backdrop and return button.
 */
export default function PlanetEnvironment({ planetId, onReturn, onComplete, completed }: Props) {
  const planet = PLANETS.find((p) => p.id === planetId);
  if (!planet) return null;

  const renderMission = () => {
    switch (planetId) {
      case 1:
        return <LoveMeMission onComplete={onComplete} />;
      case 2:
        return <MemoryMission onComplete={onComplete} completed={completed} />;
      case 3:
        return <GardenMission onComplete={onComplete} />;
      case 4:
        return <SongMission onComplete={onComplete} />;
      case 5:
        return <BirthdayMission onComplete={onComplete} />;
      default:
        return null;
    }
  };

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
          opacity: 0.85,
        }}
      />

      {/* mission content */}
      <div className="relative z-20 h-full w-full">{renderMission()}</div>

      <ReturnToGalaxyButton onReturn={onReturn} />
    </div>
  );
}
