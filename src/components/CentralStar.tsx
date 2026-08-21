interface Props {
  size: number;
}

/**
 * Luminous central star with pulsing corona and solar flare shimmer.
 * Purely decorative.
 */
export default function CentralStar({ size }: Props) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2"
      style={{ transform: 'translate(-50%, -50%)', zIndex: 9 }}
    >
      {/* outer corona */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 4,
          height: size * 4,
          background:
            'radial-gradient(circle, rgba(255,230,170,0.18) 0%, rgba(255,200,120,0.08) 30%, transparent 65%)',
          animation: 'starPulse 4s ease-in-out infinite',
        }}
      />
      {/* mid corona */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 2.2,
          height: size * 2.2,
          background:
            'radial-gradient(circle, rgba(255,240,200,0.35) 0%, rgba(255,210,140,0.15) 40%, transparent 70%)',
          animation: 'starPulse 3s ease-in-out infinite',
          animationDelay: '0.5s',
        }}
      />
      {/* core */}
      <div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background:
            'radial-gradient(circle at 40% 35%, #fffaf0 0%, #fff0c8 30%, #ffd88a 60%, #f0b860 85%, #c89040 100%)',
          boxShadow:
            '0 0 24px rgba(255,220,150,0.8), 0 0 60px rgba(255,200,120,0.4), 0 0 120px rgba(255,180,80,0.2)',
          animation: 'starCorePulse 3.5s ease-in-out infinite',
        }}
      >
        {/* subtle flare */}
        <div
          className="absolute inset-0 rounded-full opacity-60"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0%, rgba(255,240,200,0.3) 12%, transparent 25%, rgba(255,240,200,0.2) 50%, transparent 62%, rgba(255,240,200,0.25) 87%, transparent 100%)',
            animation: 'starFlare 8s linear infinite',
          }}
        />
      </div>
    </div>
  );
}
