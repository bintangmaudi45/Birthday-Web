interface Props {
  number: number;
  size: number;
  status: 'locked' | 'active' | 'completed';
}

/**
 * Small numbered label attached to a planet.
 * Sits inside the planet's interactive group so it moves with it.
 */
export default function PlanetLabel({ number, size, status }: Props) {
  const offset = size * 0.7 + 14;
  const color =
    status === 'completed'
      ? 'rgba(252,211,77,0.9)'
      : 'rgba(255,255,255,0.85)';

  return (
    <div
      className="pointer-events-none absolute left-1/2"
      style={{
        top: offset,
        transform: 'translateX(-50%)',
        zIndex: 12,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full border backdrop-blur-sm"
        style={{
          width: 22,
          height: 22,
          borderColor: color,
          background: 'rgba(8,10,24,0.55)',
          boxShadow: `0 0 8px ${status === 'completed' ? 'rgba(252,211,77,0.4)' : 'rgba(150,170,220,0.2)'}`,
        }}
      >
        <span
          className="font-[var(--font-display)] text-[10px] font-medium tracking-wider"
          style={{ color }}
        >
          {number}
        </span>
      </div>
    </div>
  );
}
