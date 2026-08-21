export type PlanetStatus = 'locked' | 'active' | 'completed';

export interface PlanetConfig {
  id: number;
  name: string;
  missionName: string;
  // orbital geometry (in viewport-relative units, scaled at runtime)
  orbitalRadiusX: number;
  orbitalRadiusY: number;
  orbitalSpeed: number; // radians per second
  initialAngle: number; // radians
  rotationSpeed: number; // degrees per second
  size: number; // base diameter in px (mobile)
  depth: number; // 0..1, higher = closer
  // visual palette
  palette: {
    core: string;
    mid: string;
    rim: string;
    glow: string;
    shadow: string;
  };
  // atmosphere placeholder tint
  atmosphere: string;
}

export const PLANETS: PlanetConfig[] = [
  {
    id: 1,
    name: 'Peach',
    missionName: 'DO YOU LOVE ME?',
    orbitalRadiusX: 0.22,
    orbitalRadiusY: 0.13,
    orbitalSpeed: 0.32,
    initialAngle: 0,
    rotationSpeed: 18,
    size: 64,
    depth: 0.9,
    palette: {
      core: '#fff4e8',
      mid: '#f7c9a8',
      rim: '#e89a86',
      glow: 'rgba(245, 166, 142, 0.55)',
      shadow: '#7a3b4d',
    },
    atmosphere: 'rgba(245, 166, 142, 0.25)',
  },
  {
    id: 2,
    name: 'Indigo',
    missionName: 'MEMORY MATCHING',
    orbitalRadiusX: 0.32,
    orbitalRadiusY: 0.19,
    orbitalSpeed: 0.22,
    initialAngle: 1.1,
    rotationSpeed: 14,
    size: 56,
    depth: 0.7,
    palette: {
      core: '#cfe0ff',
      mid: '#6f8fe6',
      rim: '#4a5fd0',
      glow: 'rgba(90, 110, 220, 0.5)',
      shadow: '#1a1f4a',
    },
    atmosphere: 'rgba(90, 110, 220, 0.25)',
  },
  {
    id: 3,
    name: 'Verdant',
    missionName: 'FLOWER GARDEN + BOUQUET',
    orbitalRadiusX: 0.42,
    orbitalRadiusY: 0.25,
    orbitalSpeed: 0.16,
    initialAngle: 2.3,
    rotationSpeed: 10,
    size: 50,
    depth: 0.55,
    palette: {
      core: '#e6fff0',
      mid: '#5fd8b0',
      rim: '#1f9e7a',
      glow: 'rgba(60, 200, 150, 0.5)',
      shadow: '#0d3a2e',
    },
    atmosphere: 'rgba(60, 200, 150, 0.25)',
  },
  {
    id: 4,
    name: 'Nocturne',
    missionName: 'PERSONAL SONG',
    orbitalRadiusX: 0.52,
    orbitalRadiusY: 0.31,
    orbitalSpeed: 0.11,
    initialAngle: 3.6,
    rotationSpeed: 8,
    size: 46,
    depth: 0.42,
    palette: {
      core: '#d8d2f0',
      mid: '#6a5fa0',
      rim: '#3a2f6a',
      glow: 'rgba(150, 130, 220, 0.5)',
      shadow: '#0c0a2a',
    },
    atmosphere: 'rgba(150, 130, 220, 0.25)',
  },
  {
    id: 5,
    name: 'Aurum',
    missionName: 'BIRTHDAY',
    orbitalRadiusX: 0.62,
    orbitalRadiusY: 0.37,
    orbitalSpeed: 0.07,
    initialAngle: 4.8,
    rotationSpeed: 6,
    size: 42,
    depth: 0.3,
    palette: {
      core: '#fff6d8',
      mid: '#f0c060',
      rim: '#c8922a',
      glow: 'rgba(240, 200, 100, 0.55)',
      shadow: '#3a2a0a',
    },
    atmosphere: 'rgba(240, 200, 100, 0.25)',
  },
];
