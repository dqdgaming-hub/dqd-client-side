import { Users, Gamepad2, CalendarDays, Package } from "lucide-react";

/* ─── Number formatter (no glitch/count-up, just static display) ── */
function StatNumber({ value }) {
  const display = value >= 1_000 ? `${(value / 1000).toFixed(1)}K` : String(value);
  return <span>{display}</span>;
}

/* ─── Card config ────────────────────────────────────────── */
const mkCards = (stats) => [
  {
    key: "users",    Icon: Users,        label: "Registered Users",
    value: stats.total_users       ?? 0,
    color: "#00f5ff", glow: "rgba(0,245,255,0.38)",
    bg: "rgba(0,245,255,0.06)",   border: "rgba(0,245,255,0.20)",
  },
  {
    key: "games",    Icon: Gamepad2,     label: "Available Games",
    value: stats.total_games       ?? 0,
    color: "#7c3aed", glow: "rgba(124,58,237,0.38)",
    bg: "rgba(124,58,237,0.06)",  border: "rgba(124,58,237,0.20)",
  },
  {
    key: "events",   Icon: CalendarDays, label: "Live Events",
    value: stats.total_events      ?? 0,
    color: "#ff006e", glow: "rgba(255,0,110,0.38)",
    bg: "rgba(255,0,110,0.06)",   border: "rgba(255,0,110,0.20)",
  },
  {
    key: "combos",   Icon: Package,      label: "Combo Packs",
    value: stats.total_combo_packs ?? 0,
    color: "#c084fc", glow: "rgba(192,132,252,0.38)",
    bg: "rgba(192,132,252,0.06)", border: "rgba(192,132,252,0.20)",
  },
];

/* ─── Individual card (static) ───────────────────────────── */
function StatCard({ card }) {
  return (
    <div
      className="ssc-card"
      style={{
        "--cc":  card.color,
        "--cg":  card.glow,
        "--cbg": card.bg,
        "--cbd": card.border,
      }}
    >
      {/* Ambient glow */}
      <div className="ssc-glow" />

      {/* Corner tick marks */}
      <div className="ssc-corner ssc-tl" />
      <div className="ssc-corner ssc-br" />

      {/* Icon */}
      <div className="ssc-icon">
        <card.Icon size={22} />
      </div>

      {/* Value */}
      <div className="ssc-value">
        <StatNumber value={card.value} />
      </div>

      {/* Label */}
      <div className="ssc-label">{card.label}</div>

      {/* Bottom bar */}
      <div className="ssc-bar" />
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
          transition: border-color 0.3s;
        }
        .ssc-card:hover { border-color: var(--cc) !important; }

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
        }
        .ssc-card:hover .ssc-corner { opacity: 0.9; }
        .ssc-tl { top: 7px;    left: 7px;    border-width: 2px 0 0 2px; }
        .ssc-br { bottom: 7px; right: 7px;   border-width: 0 2px 2px 0; }

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
            {cards.map((card) => (
              <StatCard key={card.key} card={card} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}