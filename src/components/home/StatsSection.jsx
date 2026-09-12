import { motion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Users, Gamepad2, CalendarDays, Package } from "lucide-react";

/* ─── Glitch → count-up number ──────────────────────────── */
function GlitchNumber({ value, active }) {
  const [display, setDisplay] = useState("??");
  const [glitching, setGlitching] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (!active || done.current) return;
    done.current = true;

    // Phase 1 — rapid random flicker
    setGlitching(true);
    let ticks = 0;
    const iv = setInterval(() => {
      setDisplay(Math.floor(Math.random() * Math.max(value * 5, 99)).toString());
      ticks++;
      if (ticks >= 12) {
        clearInterval(iv);
        setGlitching(false);

        // Phase 2 — smooth count-up
        const dur = 1500;
        const t0 = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - t0) / dur, 1);
          const e = 1 - Math.pow(1 - p, 3);
          const v = Math.round(e * value);
          setDisplay(v >= 1_000 ? `${(v / 1000).toFixed(1)}K` : String(v));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, 65);
    return () => clearInterval(iv);
  }, [active, value]);

  return <span className={glitching ? "gn-glitch" : ""}>{display}</span>;
}

/* ─── Card config ────────────────────────────────────────── */
const mkCards = (stats) => [
  {
    key: "users",    Icon: Users,        label: "Registered Users",
    value: stats.total_users       ?? 0,
    color: "#00f5ff", glow: "rgba(0,245,255,0.38)",
    bg: "rgba(0,245,255,0.06)",   border: "rgba(0,245,255,0.20)",
    from: { x: -70, y: 30, rotate: -10 },
  },
  {
    key: "games",    Icon: Gamepad2,     label: "Available Games",
    value: stats.total_games       ?? 0,
    color: "#7c3aed", glow: "rgba(124,58,237,0.38)",
    bg: "rgba(124,58,237,0.06)",  border: "rgba(124,58,237,0.20)",
    from: { x: -20, y: 70, rotate: 7 },
  },
  {
    key: "events",   Icon: CalendarDays, label: "Live Events",
    value: stats.total_events      ?? 0,
    color: "#ff006e", glow: "rgba(255,0,110,0.38)",
    bg: "rgba(255,0,110,0.06)",   border: "rgba(255,0,110,0.20)",
    from: { x: 20, y: 70, rotate: -7 },
  },
  {
    key: "combos",   Icon: Package,      label: "Combo Packs",
    value: stats.total_combo_packs ?? 0,
    color: "#c084fc", glow: "rgba(192,132,252,0.38)",
    bg: "rgba(192,132,252,0.06)", border: "rgba(192,132,252,0.20)",
    from: { x: 70, y: 30, rotate: 10 },
  },
];

/* ─── Individual card ────────────────────────────────────── */
function StatCard({ card, index }) {
  const [inView, setInView]     = useState(false);
  const [iconHit, setIconHit]   = useState(false);
  const [scanOn, setScanOn]     = useState(false);
  const rotX  = useSpring(0, { stiffness: 220, damping: 24 });
  const rotY  = useSpring(0, { stiffness: 220, damping: 24 });
  const cardRef = useRef(null);

  const onMouseMove = (e) => {
    if (!cardRef.current) return;
    const r  = cardRef.current.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
    const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    rotX.set(-ny * 16);
    rotY.set( nx * 16);
  };
  const onMouseLeave = () => { rotX.set(0); rotY.set(0); };

  return (
    /* Outer float wrapper — CSS animation, separate from Framer transforms */
    <div className={`ssc-float ssc-f${index}`}>
      <motion.div
        ref={cardRef}
        className="ssc-card"
        style={{
          "--cc":  card.color,
          "--cg":  card.glow,
          "--cbg": card.bg,
          "--cbd": card.border,
          rotateX: rotX,
          rotateY: rotY,
          transformPerspective: "900px",
        }}
        initial={{ opacity: 0, scale: 0.78, ...card.from }}
        whileInView={{
          opacity: 1, scale: 1, x: 0, y: 0, rotate: 0,
          transition: { type: "spring", stiffness: 170, damping: 13, delay: index * 0.11 },
        }}
        viewport={{ once: true }}
        onViewportEnter={() => {
          setInView(true);
          setTimeout(() => setScanOn(true), 80 + index * 120);
          setTimeout(() => { setScanOn(false); setIconHit(true); }, 1100 + index * 120);
        }}
        whileHover={{
          scale: 1.07,
          transition: { type: "spring", stiffness: 320, damping: 22 },
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {/* Scan sweep — triggered once on enter */}
        {scanOn && <div className="ssc-scan" key="scan" />}

        {/* Ambient glow */}
        <div className="ssc-glow" />

        {/* Corner tick marks */}
        <div className="ssc-corner ssc-tl" />
        <div className="ssc-corner ssc-br" />

        {/* Icon — spins once on enter, spins again on hover */}
        <motion.div
          className="ssc-icon"
          animate={iconHit ? { rotate: [0, 360], scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ rotate: 360, scale: 1.2, transition: { duration: 0.4 } }}
        >
          <card.Icon size={22} />
        </motion.div>

        {/* Value */}
        <div className="ssc-value">
          <GlitchNumber value={card.value} active={inView} />
        </div>

        {/* Label */}
        <div className="ssc-label">{card.label}</div>

        {/* Animated bottom bar */}
        <motion.div
          className="ssc-bar"
          initial={{ scaleX: 0 }}
          whileInView={{
            scaleX: 1,
            transition: { delay: 0.6 + index * 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] },
          }}
          viewport={{ once: true }}
          style={{ transformOrigin: "left" }}
        />
      </motion.div>
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────── */
export default function StatsSection({ stats }) {
  const cards = mkCards(stats);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');

        .ssc-section {
          background: linear-gradient(180deg, #0a0a1a 0%, #06061a 100%);
          padding: 80px 0;
          position: relative;
          overflow: hidden;
        }
        .ssc-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent 0px, transparent 3px,
            rgba(255,255,255,0.011) 3px, rgba(255,255,255,0.011) 4px
          );
          pointer-events: none;
        }
        .ssc-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }

        .ssc-eyebrow {
          text-align: center;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 5px;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
          margin-bottom: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .ssc-eyebrow::before, .ssc-eyebrow::after {
          content: '';
          flex: 1;
          max-width: 80px;
          height: 1px;
          background: rgba(255,255,255,0.09);
        }

        .ssc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        /* ── Float animations (staggered per card) ── */
        @keyframes ssf0 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-8px)}  }
        @keyframes ssf1 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-5px)}  }
        @keyframes ssf2 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-10px)} }
        @keyframes ssf3 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-7px)}  }
        .ssc-f0 { animation: ssf0 3.2s ease-in-out 1.5s infinite; }
        .ssc-f1 { animation: ssf1 2.8s ease-in-out 1.9s infinite; }
        .ssc-f2 { animation: ssf2 3.6s ease-in-out 1.3s infinite; }
        .ssc-f3 { animation: ssf3 3.0s ease-in-out 1.7s infinite; }

        /* ── Card ── */
        .ssc-card {
          position: relative;
          background: var(--cbg);
          border: 1px solid var(--cbd);
          clip-path: polygon(
            0 0, calc(100% - 20px) 0, 100% 20px,
            100% 100%, 20px 100%, 0 calc(100% - 20px)
          );
          padding: 32px 24px 30px;
          text-align: center;
          overflow: hidden;
          cursor: default;
          transform-style: preserve-3d;
          transition: border-color 0.3s;
        }
        .ssc-card:hover { border-color: var(--cc) !important; }

        /* Scan sweep */
        @keyframes ssc-sweep {
          0%   { transform: translateX(-120%) skewX(-18deg); opacity: 1; }
          100% { transform: translateX(320%)  skewX(-18deg); opacity: 0; }
        }
        .ssc-scan {
          position: absolute;
          inset: 0 0 0 0;
          width: 45%;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.09) 50%, transparent 100%);
          animation: ssc-sweep 0.9s ease-out forwards;
          pointer-events: none;
          z-index: 0;
        }

        /* Ambient glow */
        .ssc-glow {
          position: absolute;
          top: -10px; left: 50%;
          transform: translateX(-50%);
          width: 110px; height: 110px;
          border-radius: 50%;
          background: var(--cg);
          filter: blur(38px);
          opacity: 0.45;
          pointer-events: none;
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .ssc-card:hover .ssc-glow {
          opacity: 1;
          transform: translateX(-50%) scale(1.5);
        }

        /* Corner marks */
        .ssc-corner {
          position: absolute;
          width: 14px; height: 14px;
          border-color: var(--cc);
          border-style: solid;
          opacity: 0.4;
          pointer-events: none;
          transition: opacity 0.3s;
          animation: ssc-blink 3s ease-in-out infinite;
        }
        .ssc-card:hover .ssc-corner { opacity: 0.9; }
        .ssc-tl { top: 7px;    left: 7px;    border-width: 2px 0 0 2px; }
        .ssc-br { bottom: 7px; right: 7px;   border-width: 0 2px 2px 0; animation-delay: 1.5s; }
        @keyframes ssc-blink {
          0%,85%,100% { opacity: 0.4; }
          90% { opacity: 1; }
        }

        /* Glitch number effect */
        .gn-glitch {
          filter: blur(0.8px);
          opacity: 0.55;
          animation: gn-flick 0.06s linear infinite;
          color: rgba(255,255,255,0.5) !important;
          text-shadow: none !important;
        }
        @keyframes gn-flick {
          0%,100% { transform: none; }
          33%     { transform: translateX(2px); }
          66%     { transform: translateX(-2px); }
        }

        /* Icon */
        .ssc-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px; height: 52px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          clip-path: polygon(
            0 0, calc(100% - 10px) 0, 100% 10px,
            100% 100%, 10px 100%, 0 calc(100% - 10px)
          );
          color: var(--cc);
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
          cursor: pointer;
        }
        .ssc-card:hover .ssc-icon {
          background: rgba(255,255,255,0.08);
          border-color: var(--cc);
          box-shadow: 0 0 20px var(--cg);
        }

        /* Value */
        .ssc-value {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 900;
          color: var(--cc);
          display: block;
          line-height: 1;
          text-shadow: 0 0 28px var(--cg);
          position: relative;
          z-index: 1;
          margin-bottom: 12px;
          min-height: 1.1em;
          transition: text-shadow 0.3s;
        }
        .ssc-card:hover .ssc-value {
          text-shadow: 0 0 48px var(--cg);
        }

        /* Label */
        .ssc-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.32);
          letter-spacing: 2px;
          text-transform: uppercase;
          position: relative;
          z-index: 1;
          transition: color 0.3s;
        }
        .ssc-card:hover .ssc-label { color: rgba(255,255,255,0.6); }

        /* Bottom bar */
        .ssc-bar {
          position: absolute;
          bottom: 0; left: 20px; right: 20px;
          height: 2px;
          background: linear-gradient(90deg, var(--cc), transparent);
          opacity: 0.3;
          transition: opacity 0.3s;
        }
        .ssc-card:hover .ssc-bar { opacity: 0.7; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .ssc-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (max-width: 540px) {
          .ssc-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .ssc-card { padding: 22px 14px 20px; }
          .ssc-icon { width: 42px; height: 42px; margin-bottom: 14px; }
          .ssc-section { padding: 52px 0; }
          .ssc-inner { padding: 0 16px; }
        }
      `}</style>

      <section className="ssc-section">
        <div className="ssc-inner">
          <div className="ssc-eyebrow">Platform Stats</div>
          <div className="ssc-grid">
            {cards.map((card, i) => (
              <StatCard key={card.key} card={card} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}