import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number; // depth 0..1
  r: number;
  baseAlpha: number;
  twinkle: number;
  twinkleSpeed: number;
}

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  trail: { x: number; y: number }[];
  life: number;
  maxLife: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  len: number;
}

interface Props {
  /** 0 = quiet deep space (opening), 1 = full galaxy ambience */
  intensity?: number;
  /** warp effect strength 0..1 (stars stretch toward viewer) */
  warp?: number;
  className?: string;
}

/**
 * Single full-screen canvas rendering all decorative space layers:
 * nebula, stars, dust, asteroids, shooting stars.
 * Purely decorative — pointer-events: none is set by the parent.
 */
export default function StarField({ intensity = 1, warp = 0, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intensityRef = useRef(intensity);
  const warpRef = useRef(warp);

  intensityRef.current = intensity;
  warpRef.current = warp;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let stars: Star[] = [];
    let dust: Dust[] = [];
    let asteroids: Asteroid[] = [];
    let shooting: ShootingStar[] = [];

    let nebulaOffset = 0;

    function init() {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const starCount = Math.min(260, Math.floor((width * height) / 4500));
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random(),
        r: Math.random() * 1.3 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      }));

      const dustCount = Math.min(50, Math.floor((width * height) / 22000));
      dust = Array.from({ length: dustCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.25 + 0.05,
      }));
    }

    init();
    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(init, 150);
    };
    window.addEventListener('resize', onResize);

    let raf = 0;
    let last = performance.now();

    function spawnAsteroid() {
      const fromLeft = Math.random() > 0.5;
      const y = Math.random() * height;
      const speed = Math.random() * 0.6 + 0.3;
      asteroids.push({
        x: fromLeft ? -20 : width + 20,
        y,
        vx: fromLeft ? speed : -speed,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.6 + 0.8,
        trail: [],
        life: 0,
        maxLife: Math.random() * 400 + 300,
      });
    }

    function spawnShootingStar() {
      const startX = Math.random() * width;
      const startY = Math.random() * height * 0.4;
      const angle = Math.PI * 0.25 + Math.random() * 0.2;
      const speed = Math.random() * 6 + 4;
      shooting.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 40 + 30,
        len: Math.random() * 80 + 60,
      });
    }

    function drawNebula() {
      if (!ctx) return;
      const t = nebulaOffset;
      const blobs = [
        { cx: width * 0.25, cy: height * 0.3, r: width * 0.5, color: 'rgba(40, 30, 90, 0.10)' },
        { cx: width * 0.75, cy: height * 0.65, r: width * 0.55, color: 'rgba(20, 50, 90, 0.09)' },
        { cx: width * 0.5, cy: height * 0.5, r: width * 0.4, color: 'rgba(70, 40, 110, 0.06)' },
      ];
      for (const b of blobs) {
        const dx = Math.sin(t * 0.3 + b.cx) * 20;
        const dy = Math.cos(t * 0.25 + b.cy) * 15;
        const grad = ctx.createRadialGradient(b.cx + dx, b.cy + dy, 0, b.cx + dx, b.cy + dy, b.r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    }

    function frame(now: number) {
      if (!ctx) return;
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      const inten = intensityRef.current;
      const w = warpRef.current;

      ctx.clearRect(0, 0, width, height);

      // deep space base
      const base = ctx.createLinearGradient(0, 0, 0, height);
      base.addColorStop(0, '#05060f');
      base.addColorStop(0.5, '#070a1a');
      base.addColorStop(1, '#04050c');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      if (inten > 0.05) {
        ctx.globalAlpha = inten;
        drawNebula();
        ctx.globalAlpha = 1;
      }

      nebulaOffset += 0.002 * dt;

      // stars
      for (const s of stars) {
        s.twinkle += s.twinkleSpeed * dt;
        const tw = 0.5 + 0.5 * Math.sin(s.twinkle);
        let alpha = s.baseAlpha * (0.4 + 0.6 * tw) * inten;
        // parallax drift
        s.x += (0.01 + s.z * 0.02) * dt;
        if (s.x > width + 5) s.x = -5;

        if (w > 0.01) {
          // warp: stretch star from center outward
          const cx = width / 2;
          const cy = height / 2;
          const dx = s.x - cx;
          const dy = s.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const stretch = w * (8 + s.z * 20);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = s.r;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + (dx / dist) * stretch, s.y + (dy / dist) * stretch);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // dust
      for (const d of dust) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.x < 0) d.x = width;
        if (d.x > width) d.x = 0;
        if (d.y < 0) d.y = height;
        if (d.y > height) d.y = 0;
        ctx.fillStyle = `rgba(180, 190, 230, ${d.alpha * inten})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // asteroids
      if (inten > 0.3 && Math.random() < 0.004 * dt) spawnAsteroid();
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.life += dt;
        a.trail.push({ x: a.x, y: a.y });
        if (a.trail.length > 14) a.trail.shift();

        // trail
        for (let j = 0; j < a.trail.length; j++) {
          const p = a.trail[j];
          const ta = (j / a.trail.length) * 0.4 * inten;
          ctx.fillStyle = `rgba(255, 220, 170, ${ta})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, a.size * (j / a.trail.length) * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(220, 210, 200, ${0.8 * inten})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
        ctx.fill();

        if (a.life > a.maxLife || a.x < -40 || a.x > width + 40) {
          asteroids.splice(i, 1);
        }
      }

      // shooting stars
      if (inten > 0.4 && Math.random() < 0.0015 * dt) spawnShootingStar();
      for (let i = shooting.length - 1; i >= 0; i--) {
        const s = shooting[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life += dt;
        const lifeRatio = 1 - s.life / s.maxLife;
        if (lifeRatio <= 0) {
          shooting.splice(i, 1);
          continue;
        }
        const tailX = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.len;
        const tailY = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.len;
        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * lifeRatio * inten})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ pointerEvents: 'none', display: 'block' }}
    />
  );
}
