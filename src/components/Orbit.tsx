interface Props {
  rx: number;
  ry: number;
  /** 0 = hidden, 1 = full opacity */
  opacity?: number;
}

/**
 * A single faint elliptical orbital path.
 * Decorative — pointer-events: none.
 */
export default function Orbit({ rx, ry, opacity = 1 }: Props) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2"
      style={{
        transform: 'translate(-50%, -50%)',
        zIndex: 4,
        opacity,
        transition: 'opacity 0.6s ease',
      }}
    >
      <div
        className="rounded-[50%]"
        style={{
          width: rx * 2,
          height: ry * 2,
          border: '1px solid rgba(180, 190, 230, 0.12)',
          boxShadow: 'inset 0 0 20px rgba(150,170,220,0.05)',
        }}
      />
    </div>
  );
}
