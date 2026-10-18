import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { CalendarDays, Gamepad2, Package, Users } from "lucide-react";
import { homeCss } from "./homeStyles";

const css = `
.st2 { padding: clamp(40px, 6vw, 72px) 0; background: linear-gradient(180deg, #05040a, #0a0918 50%, #05040a); }
.st2-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.st2-card { --c: #00f5ff; position: relative; overflow: hidden; padding: 22px 18px; border-radius: 22px; text-align: center;
  background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--c) 18%, transparent), transparent 70%), #0d0c1d;
  border: 1px solid color-mix(in srgb, var(--c) 28%, transparent); transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s; }
.st2-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px color-mix(in srgb, var(--c) 18%, transparent); }
.st2-ico { width: 46px; height: 46px; margin: 0 auto 12px; display: grid; place-items: center; border-radius: 14px; color: var(--c);
  background: color-mix(in srgb, var(--c) 12%, transparent); box-shadow: 0 0 24px color-mix(in srgb, var(--c) 25%, transparent); }
.st2-val { font: 900 clamp(28px, 4vw, 44px)/1 'Orbitron', sans-serif; color: #fff; text-shadow: 0 0 22px color-mix(in srgb, var(--c) 55%, transparent); }
.st2-val small { font-size: .55em; color: var(--c); }
.st2-lbl { margin-top: 8px; font: 700 12px/1.3 'Share Tech Mono', monospace; letter-spacing: .16em; text-transform: uppercase; color: #a9a3c8; }
@media (max-width: 760px) { .st2-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; } .st2-card { padding: 18px 12px; } }
`;

const CARDS = [
  { key: "total_users", label: "Registered players", Icon: Users, c: "#00f5ff" },
  { key: "total_games", label: "Games to play", Icon: Gamepad2, c: "#7b2fff" },
  { key: "total_events", label: "Live events", Icon: CalendarDays, c: "#ff2d78" },
  { key: "total_combo_packs", label: "Combo packs", Icon: Package, c: "#ffd60a" },
];

function CountUp({ value }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!seen) return undefined;
    if (reduce) {
      const id = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(id);
    }
    const controls = animate(0, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [seen, value, reduce]);
  const text = shown >= 1000 ? `${(shown / 1000).toFixed(1)}K` : String(shown);
  return (
    <span ref={ref}>
      {text}
      <small>+</small>
    </span>
  );
}

export default function StatsSection({ stats = {} }) {
  return (
    <section className="hm-sec st2" aria-label="DQD Gaming in numbers">
      <style>{homeCss + css}</style>
      <div className="hm-in">
        <div className="st2-grid">
          {CARDS.map(({ key, label, Icon, c }, i) => (
            <motion.div
              key={key}
              className="st2-card"
              style={{ "--c": c }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="st2-ico"><Icon size={22} aria-hidden="true" /></div>
              <div className="st2-val"><CountUp value={Number(stats[key]) || 0} /></div>
              <div className="st2-lbl">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
