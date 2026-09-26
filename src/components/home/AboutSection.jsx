import { useEffect, useRef, useState } from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Zap, ChevronRight, Star, Shield, Trophy } from "lucide-react";

/* ══════════════════════════════════════════════════
   PILLARS
══════════════════════════════════════════════════ */
const pillars = [
  { icon: Gamepad2, label: "Next-Gen Consoles", color: "#00f5ff" },
  { icon: Zap,      label: "VR Simulators",     color: "#c084fc" },
  { icon: Trophy,   label: "Live Tournaments",   color: "#ff006e" },
  { icon: Shield,   label: "Loyalty Rewards",    color: "#f59e0b" },
];

/* ══════════════════════════════════════════════════
   STATIC NUMBER (no glitch / count-up, just formatted final value)
══════════════════════════════════════════════════ */
function StaticNumber({ value, suffix = "" }) {
  const formatted = value >= 1_000 ? `${(value / 1000).toFixed(1)}K` : String(value);
  return <span>{formatted}{suffix}</span>;
}

/* ══════════════════════════════════════════════════
   ORBIT RING (now a static decorative ring, no rotation)
══════════════════════════════════════════════════ */
function OrbitRing({ size = 300, color = "#00f5ff", opacity = 0.12 }) {
  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <circle
        cx={size / 2} cy={size / 2} r={size / 2 - 2}
        fill="none" stroke={color}
        strokeWidth="1"
        strokeDasharray="6 18"
        opacity={opacity}
      />
    </svg>
  );
}

/* ══════════════════════════════════════════════════
   FLOATING PARTICLE (now a static neon dot)
══════════════════════════════════════════════════ */
function Particle({ x, y, color, size }) {
  return (
    <div
      style={{
        position: "absolute", left: x, top: y,
        width: size, height: size,
        borderRadius: "50%", background: color,
        filter: `blur(${size / 3}px)`,
        pointerEvents: "none",
        opacity: 0.8,
      }}
    />
  );
}

/* ══════════════════════════════════════════════════
   STAT BAR ITEM
══════════════════════════════════════════════════ */
function StatBarItem({ value, suffix, label, color }) {
  return (
    <div className="ab-stat-item">
      <span
        className="ab-stat-val"
        style={{ color, textShadow: `0 0 12px ${color}` }}
      >
        <StaticNumber value={value} suffix={suffix} />
      </span>
      <span className="ab-stat-lbl">{label}</span>
      <span
        className="ab-stat-accent"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PILLAR CARD
══════════════════════════════════════════════════ */
function PillarCard({ icon: Icon, label, color }) {
  return (
    <div
      className="ab-pillar"
      style={{ "--pc": color, "--pc-bg": color + "12", "--pc-bd": color + "33" }}
    >
      <span className="ab-pillar-icon">
        <Icon size={15} />
      </span>
      <span className="ab-pillar-label">{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   DEFAULT STATS
══════════════════════════════════════════════════ */
const DEFAULT_STATS = {
  total_users: 10000,
  total_games: 500,
  total_events: 50,
};

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function AboutSection({ stats = DEFAULT_STATS }) {
  const navigate    = useNavigate();
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleExploreGames = () => {
    navigate("/games");
  };

  const statItems = [
    { value: stats.total_games  ?? 500,   suffix: "+", label: "Games",   color: "#00f5ff" },
    { value: stats.total_users  ?? 10000, suffix: "+", label: "Players",  color: "#c084fc" },
    { value: stats.total_events ?? 50,    suffix: "+", label: "Events",   color: "#ff006e" },
  ];

  /* particles config */
  const particles = [
    { x: "8%",  y: "15%", color: "#00f5ff", size: 6 },
    { x: "90%", y: "10%", color: "#ff006e", size: 4 },
    { x: "75%", y: "70%", color: "#c084fc", size: 5 },
    { x: "5%",  y: "75%", color: "#f59e0b", size: 3 },
    { x: "50%", y: "5%",  color: "#00f5ff", size: 4 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500&display=swap');

        /* ─── SECTION ─── */
        .ab-section {
          position: relative;
          background: #070714;
          overflow: hidden;
          padding: 120px 0 140px;
        }
        .ab-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,245,255,0.012) 2px, rgba(0,245,255,0.012) 4px
          );
          pointer-events: none;
          z-index: 0;
        }
        .ab-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }

        /* ─── INNER GRID ─── */
        .ab-inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        /* ─── TEXT SIDE ─── */
        .ab-eyebrow {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 4px;
          color: #00f5ff;
          text-transform: uppercase;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ab-eyebrow::after {
          content: '';
          flex: 1;
          max-width: 44px;
          height: 1px;
          background: #00f5ff;
          opacity: 0.45;
        }

        .ab-headline {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(30px, 4vw, 54px);
          font-weight: 900;
          line-height: 1.06;
          color: #fff;
          margin: 0 0 22px;
        }
        .ab-headline-grad {
          background: linear-gradient(135deg, #00f5ff 0%, #7c3aed 50%, #ff006e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ab-body {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.85;
          color: rgba(255,255,255,0.55);
          margin-bottom: 36px;
          max-width: 480px;
        }

        /* ─── PILLARS ─── */
        .ab-pillars {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 40px;
        }

        .ab-pillar {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--pc-bg, rgba(0,245,255,0.05));
          border: 1px solid var(--pc-bd, rgba(0,245,255,0.12));
          padding: 12px 14px;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
          cursor: default;
          overflow: hidden;
          transition: border-color 0.3s, background 0.3s;
        }
        .ab-pillar:hover {
          background: var(--pc-bg, rgba(0,245,255,0.1));
          border-color: var(--pc, #00f5ff);
        }
        .ab-pillar-icon {
          color: var(--pc, #00f5ff);
          flex-shrink: 0;
          display: flex;
        }
        .ab-pillar-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.82);
          letter-spacing: 0.4px;
        }

        /* ─── CTA BUTTON ─── */
        .ab-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #070714;
          background: linear-gradient(135deg, #00f5ff, #0099ff);
          border: none;
          cursor: pointer;
          padding: 15px 30px;
          clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.3s;
        }
        .ab-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #ff006e, #7c3aed);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .ab-cta:hover::before { opacity: 1; }
        .ab-cta > * { position: relative; z-index: 1; }
        .ab-cta:hover { box-shadow: 0 0 44px rgba(255,0,110,0.5); color: #fff; }

        /* ─── VISUAL SIDE ─── */
        .ab-visual {
          position: relative;
          padding-bottom: 36px;
        }

        .ab-img-frame {
          position: relative;
          clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 32px 100%, 0 calc(100% - 32px));
          overflow: hidden;
        }
        .ab-img-frame img {
          width: 100%;
          height: 500;
          object-fit: cover;
          display: block;
          opacity: 0.88;
          transition: opacity 0.4s;
        }
        .ab-img-frame:hover img { opacity: 1; }

        .ab-corner { position: absolute; width: 44px; height: 44px; z-index: 2; pointer-events: none; }
        .ab-corner-tl { top: -2px; left: -2px; border-top: 2px solid #00f5ff; border-left: 2px solid #00f5ff; }
        .ab-corner-br { bottom: -2px; right: -2px; border-bottom: 2px solid #ff006e; border-right: 2px solid #ff006e; }

        /* orbit rings wrapper */
        .ab-orbit-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
        }

        /* ─── STAT BAR ─── */
        .ab-stat-bar {
          position: absolute;
          bottom: -4px;
          left: 16px;
          right: 16px;
          background: rgba(7,7,20,0.96);
          border: 1px solid rgba(0,245,255,0.18);
          padding: 18px 20px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
          backdrop-filter: blur(12px);
          transition: border-color 0.4s;
          z-index: 3;
        }
        .ab-stat-bar:hover { border-color: rgba(0,245,255,0.38); }

        .ab-stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.07);
          flex-shrink: 0;
        }

        .ab-stat-item {
          text-align: center;
          position: relative;
          padding: 0 8px;
          cursor: default;
        }
        .ab-stat-val {
          font-family: 'Orbitron', sans-serif;
          font-size: 24px;
          font-weight: 700;
          display: block;
          line-height: 1;
          margin-bottom: 5px;
          min-height: 1.1em;
        }
        .ab-stat-lbl {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.38);
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .ab-stat-accent {
          display: block;
          height: 2px;
          margin-top: 7px;
          border-radius: 1px;
        }

        /* ═══════════════════════════════════════
           MOBILE STYLES (< 768px)
        ═══════════════════════════════════════ */
        @media (max-width: 900px) {
          .ab-section { padding: 80px 0 100px; }
          .ab-inner {
            grid-template-columns: 1fr;
            gap: 0;
            padding: 0 20px;
          }

          /* Stack: visual first */
          .ab-visual-col { order: -1; margin-bottom: 48px; }
          .ab-text-col   { order: 1; }

          .ab-img-frame img { height: 380px; padding:24px; }

          /* Stat bar becomes a horizontal scroll row on very small screens */
          .ab-stat-bar {
            position: static;
            margin-top: 14px;
            clip-path: none;
            border-radius: 4px;
            padding: 14px 16px;
            gap: 0;
          }

          .ab-stat-val { font-size: 20px; }

          .ab-body { max-width: 100%; }
        }

        @media (max-width: 540px) {
          .ab-pillars { grid-template-columns: 1fr 1fr; }
          .ab-headline { font-size: 26px; }
          .ab-stat-val { font-size: 18px; }
          .ab-section { padding: 60px 0 80px; }
        }

        @media (max-width: 380px) {
          .ab-pillars { grid-template-columns: 1fr; }
          .ab-cta { font-size: 11px; padding: 13px 22px; }
        }
      `}</style>

      <section className="ab-section" ref={sectionRef}>

        {/* ── Ambient orbs (static) ── */}
        <div
          className="ab-bg-orb"
          style={{ width: 600, height: 600, top: -200, left: -150, background: "rgba(0,245,255,0.055)" }}
        />
        <div
          className="ab-bg-orb"
          style={{ width: 500, height: 500, bottom: -150, right: -80, background: "rgba(255,0,110,0.055)" }}
        />
        <div
          className="ab-bg-orb"
          style={{ width: 300, height: 300, top: "40%", left: "50%", background: "rgba(124,58,237,0.04)" }}
        />

        {/* ── Floating particles (static) ── */}
        {particles.map((p, i) => <Particle key={i} {...p} />)}

        <div className="ab-inner">

          {/* ══════════ TEXT COLUMN ══════════ */}
          <div className="ab-text-col">
            {/* eyebrow */}
            <div className="ab-eyebrow">
              <Star size={11} />
              Est. 2024
            </div>

            {/* headline */}
            <h2 className="ab-headline">
              Welcome to
              <br />
              <span className="ab-headline-grad">DQD Gaming</span>
            </h2>

            {/* body */}
            <p className="ab-body">
              Experience next-generation gaming with PlayStation, VR, simulators,
              pool tables, board games, multiplayer arenas, tournaments, exclusive
              events, combo offers, loyalty rewards, and much more — all in one
              immersive venue.
            </p>

            {/* pillars */}
            <div className="ab-pillars">
              {pillars.map((p) => (
                <PillarCard key={p.label} {...p} />
              ))}
            </div>

            {/* CTA */}
            <button className="ab-cta" onClick={handleExploreGames}>
              <span>Explore Games</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* ══════════ VISUAL COLUMN ══════════ */}
          <div className="ab-visual-col ab-visual">
            {/* orbit rings */}
            <div className="ab-orbit-wrap" style={{ top: "40%", left: "50%" }}>
              <OrbitRing size={460} color="#00f5ff" opacity={0.07} />
              <OrbitRing size={340} color="#ff006e" opacity={0.08} />
              <OrbitRing size={220} color="#c084fc" opacity={0.1} />
            </div>

            {/* image frame */}
            <div className="ab-img-frame">
              <div className="ab-corner ab-corner-br" />
              <img src="/logo.png" alt="DQD Gaming" />
            </div>

            {/* LIVE STAT BAR */}
            <div className="ab-stat-bar">
              {statItems.map((item, i) => (
                <Fragment key={item.label}>
                  <StatBarItem {...item} />
                  {i < statItems.length - 1 && (
                    <div key={`div-${i}`} className="ab-stat-divider" />
                  )}
                </Fragment>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}