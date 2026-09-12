import { useEffect, useRef } from "react";
import { mat2d, vec2 } from "gl-matrix";

/**
 * VibraniumField — a canvas of nodes connected by pulsing energy lines,
 * driven by gl-matrix transforms (rotation + radial drift), themed to
 * purple/teal/gold. Used behind ticket stubs and on event card hover.
 *
 * intensity: 0..1 — controls opacity/speed (e.g. animate on hover)
 */
export default function VibraniumField({
  active = true,
  intensity = 1,
  density = 26,
  colorMode = "full", // "full" | "teal" | "gold"
  className,
  style,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const nodesRef = useRef([]);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height, dpr;

    const palette =
      colorMode === "teal"
        ? ["#3FE0C5", "#5CF2D8"]
        : colorMode === "gold"
        ? ["#D4AF37", "#F0D77A"]
        : ["#7A2CFF", "#3FE0C5", "#D4AF37"];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // seed nodes with gl-matrix vec2 positions + per-node transform matrix
    const count = density;
    nodesRef.current = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.25 + Math.random() * 0.65;
      return {
        base: vec2.fromValues(Math.cos(angle) * radius, Math.sin(angle) * radius),
        pos: vec2.create(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.6,
        color: palette[i % palette.length],
        r: 1.2 + Math.random() * 1.8,
      };
    });

    let t = 0;
    const transform = mat2d.create();

    const render = () => {
      t += 0.012 * (0.6 + intensityRef.current * 0.8);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.46;
      const alpha = 0.15 + intensityRef.current * 0.55;

      const nodes = nodesRef.current;

      // gl-matrix: rotate + slight scale pulse each frame
      mat2d.identity(transform);
      mat2d.rotate(transform, transform, t * 0.15);
      const pulse = 1 + Math.sin(t * 1.4) * 0.06;
      mat2d.scale(transform, transform, [pulse, pulse]);

      for (const n of nodes) {
        const drift = 1 + Math.sin(t * n.speed + n.phase) * 0.12;
        const p = vec2.clone(n.base);
        vec2.scale(p, p, drift);
        vec2.transformMat2d(n.pos, p, transform);
      }

      // connections
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.pos[0] - b.pos[0];
          const dy = a.pos[1] - b.pos[1];
          const dist = Math.hypot(dx, dy);
          if (dist < 0.55) {
            const lineAlpha = (1 - dist / 0.55) * alpha * 0.5;
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = lineAlpha;
            ctx.beginPath();
            ctx.moveTo(cx + a.pos[0] * scale, cy + a.pos[1] * scale);
            ctx.lineTo(cx + b.pos[0] * scale, cy + b.pos[1] * scale);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        const x = cx + n.pos[0] * scale;
        const y = cy + n.pos[1] * scale;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, n.r * 4);
        glow.addColorStop(0, n.color);
        glow.addColorStop(1, "transparent");
        ctx.globalAlpha = alpha;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, n.r * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = Math.min(1, alpha * 1.8);
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(x, y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(render);
    };

    if (active) {
      rafRef.current = requestAnimationFrame(render);
    }

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, density, colorMode]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block", ...style }}
    />
  );
}