import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { PLANETS, type PlanetStatus } from '@/data/planets';

const STORAGE_KEY = 'universe-tour-progress';

interface ProgressState {
  tourStarted: boolean;
  currentPlanet: number | null;
  completedPlanets: number[];
  tourComplete: boolean;
  startTour: () => void;
  enterPlanet: (id: number) => void;
  exitPlanet: () => void;
  completePlanet: (id: number) => void;
  resetTour: () => void;
  getStatus: (id: number) => PlanetStatus;
  activePlanetId: number;
}

const ProgressContext = createContext<ProgressState | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [tourStarted, setTourStarted] = useState(false);
  const [currentPlanet, setCurrentPlanet] = useState<number | null>(null);
  const [completedPlanets, setCompletedPlanets] = useState<number[]>([]);
  const [tourComplete, setTourComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.completedPlanets)) setCompletedPlanets(data.completedPlanets);
        if (typeof data.tourStarted === 'boolean') setTourStarted(data.tourStarted);
        if (typeof data.tourComplete === 'boolean') setTourComplete(data.tourComplete);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tourStarted, completedPlanets, tourComplete })
      );
    } catch {
      // ignore
    }
  }, [tourStarted, completedPlanets, tourComplete, hydrated]);

  const activePlanetId = useMemo(
    () => (completedPlanets.length < PLANETS.length ? completedPlanets.length + 1 : 0),
    [completedPlanets]
  );

  const getStatus = useCallback(
    (id: number): PlanetStatus => {
      if (completedPlanets.includes(id)) return 'completed';
      return 'active';
    },
    [completedPlanets]
  );

  const startTour = useCallback(() => setTourStarted(true), []);

  const enterPlanet = useCallback((id: number) => setCurrentPlanet(id), []);

  const exitPlanet = useCallback(() => setCurrentPlanet(null), []);

  const completePlanet = useCallback((id: number) => {
    setCompletedPlanets((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      if (next.length >= PLANETS.length) setTourComplete(true);
      return next;
    });
  }, []);

  const resetTour = useCallback(() => {
    setCompletedPlanets([]);
    setTourComplete(false);
    setTourStarted(false);
    setCurrentPlanet(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<ProgressState>(
    () => ({
      tourStarted,
      currentPlanet,
      completedPlanets,
      tourComplete,
      startTour,
      enterPlanet,
      exitPlanet,
      completePlanet,
      resetTour,
      getStatus,
      activePlanetId,
    }),
    [tourStarted, currentPlanet, completedPlanets, tourComplete, startTour, enterPlanet, exitPlanet, completePlanet, resetTour, getStatus, activePlanetId]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
