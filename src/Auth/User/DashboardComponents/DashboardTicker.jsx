import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";

// ─── Design Tokens ────────────────────────────────────────────────
const T = {
  bg:      "#070712",
  bgCard:  "#0d0d1a",
  bgPanel: "#11111f",
  cyan:    "#00f5ff",
  pink:    "#ff006e",
  yellow:  "#ffd60a",
  green:   "#39ff14",
  purple:  "#7b2fff",
  red:     "#ff3b3b",
  text:    "#e0e0ff",
  muted:   "#6b6b8a",
  border:  "rgba(0,245,255,0.15)",
};

// ─── Category color map ───────────────────────────────────────────
const CAT = {
  EVENT:   { color: T.pink,   label: "EVENT"   },
  SESSION: { color: T.cyan,   label: "SESSION"  },
  SPIN:    { color: T.purple, label: "SPIN"     },
  LOYALTY: { color: T.green,  label: "LOYALTY"  },
  GAME:    { color: T.cyan,   label: "GAME"     },
  COMBO:   { color: T.yellow, label: "COMBO"    },
};

// ─── Styles ───────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Share+Tech+Mono&display=swap');

  .dqtk-root {
    position: relative;
    width: 100%;
    overflow: hidden;
    /* Double border: outer muted, inner neon glow */
    border-top: 1px solid rgba(0,245,255,0.08);
    border-bottom: 1px solid rgba(0,245,255,0.08);
    box-shadow:
      0 -1px 0 0 rgba(0,245,255,0.22),
      0  1px 0 0 rgba(0,245,255,0.22),
      inset 0 1px 0 0 rgba(123,47,255,0.12),
      inset 0 -1px 0 0 rgba(123,47,255,0.12);
    background: linear-gradient(
      90deg,
      ${T.bgCard} 0%,
      rgba(13,13,26,0.6) 40%,
      rgba(17,17,31,0.6) 60%,
      ${T.bgCard} 100%
    );
  }

  /* Scanline overlay */
  .dqtk-root::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none; z-index: 4;
    background: repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 3px,
      rgba(0,245,255,0.015) 3px,
      rgba(0,245,255,0.015) 4px
    );
  }

  /* Edge fade masks */
  .dqtk-root::before {
    content: '';
    position: absolute; inset: 0; z-index: 3; pointer-events: none;
    background:
      linear-gradient(90deg, ${T.bgCard} 0%, transparent 120px),
      linear-gradient(270deg, ${T.bgCard} 0%, transparent 120px);
  }

  /* Live pill */
  .dqtk-live {
    position: absolute; left: 0; top: 0; bottom: 0; z-index: 5;
    display: flex; align-items: center;
    padding: 0 16px 0 14px;
    background: ${T.bgCard};
    border-right: 1px solid rgba(0,245,255,0.2);
    gap: 7px;
    flex-shrink: 0;
  }
  .dqtk-live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: ${T.red};
    box-shadow: 0 0 6px ${T.red};
    animation: dqtk-blink 1.4s ease-in-out infinite;
  }
  .dqtk-live-label {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.55rem; font-weight: 700;
    color: ${T.red}; letter-spacing: 2.5px;
    text-transform: uppercase;
  }
  @keyframes dqtk-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
  }

  /* Scroll track */
  .dqtk-track {
    display: flex; align-items: center;
    padding: 13px 0 13px 90px; /* leave room for LIVE pill */
    overflow: hidden;
    position: relative; z-index: 2;
  }

  .dqtk-strip {
    display: flex; align-items: center;
    white-space: nowrap;
    will-change: transform;
    user-select: none;
  }

  /* Each item */
  .dqtk-item {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 0 28px;
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(0.64rem, 1.2vw, 0.74rem);
    letter-spacing: 1px;
    color: ${T.text}99;
    flex-shrink: 0;
    cursor: default;
    transition: color 0.2s ease;
  }
  .dqtk-item:hover { color: ${T.text}; }

  /* Type badge */
  .dqtk-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.5rem; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 1px;
    border: 1px solid;
    flex-shrink: 0;
  }

  /* Item text */
  .dqtk-text { flex-shrink: 0; }

  /* Separator */
  .dqtk-sep {
    flex-shrink: 0;
    width: 1px; height: 14px;
    background: rgba(0,245,255,0.18);
    margin: 0 6px;
  }

  /* Pause indicator */
  .dqtk-pause-hint {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    z-index: 6; pointer-events: none;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.52rem; letter-spacing: 1.5px; text-transform: uppercase;
    color: ${T.cyan}; opacity: 0;
    transition: opacity 0.2s ease;
    display: flex; align-items: center; gap: 5px;
  }
  .dqtk-root:hover .dqtk-pause-hint { opacity: 0.75; }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .dqtk-live-dot { animation: none !important; opacity: 1; }
  }
`;

function useStyles() {
  useEffect(() => {
    if (document.getElementById("dqtk-styles")) return;
    const el = document.createElement("style");
    el.id = "dqtk-styles";
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);
}

// ─── Icons ────────────────────────────────────────────────────────
const IconTrophy = ({ size = 11, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4h8v5a4 4 0 01-8 0V4z"/>
    <path d="M8 5H5a2 2 0 002 4M16 5h3a2 2 0 01-2 4"/>
    <path d="M12 13v3M9 20h6"/>
  </svg>
);
const IconCalendar = ({ size = 11, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2"/>
    <path d="M16 3v4M8 3v4M3 10h18"/>
  </svg>
);
const IconStar = ({ size = 11, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconZap = ({ size = 11, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconGamepad = ({ size = 11, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
    <line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/>
    <rect x="2" y="6" width="20" height="12" rx="2"/>
  </svg>
);
const IconTag = ({ size = 11, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const IconPause = ({ size = 9, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <rect x="6" y="4" width="4" height="16" rx="1"/>
    <rect x="14" y="4" width="4" height="16" rx="1"/>
  </svg>
);

// ─── Icon per category ────────────────────────────────────────────
function CategoryIcon({ type, color, size = 11 }) {
  switch (type) {
    case "EVENT":   return <IconTrophy size={size} color={color} />;
    case "SESSION": return <IconCalendar size={size} color={color} />;
    case "SPIN":    return <IconZap size={size} color={color} />;
    case "LOYALTY": return <IconStar size={size} color={color} />;
    case "GAME":    return <IconGamepad size={size} color={color} />;
    case "COMBO":   return <IconTag size={size} color={color} />;
    default:        return <IconZap size={size} color={color} />;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "";
  const date = new Date(`${d}T00:00:00`);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
function normalizeTitle(ev) { return ev.title || ev.event_title || "Event"; }
function normalizeDate(ev)  { return ev.date  || ev.event_date  || ""; }

// ─── Build items from data ────────────────────────────────────────
function buildItems(data) {
  if (!data) return [];
  const list = [];

  (data.exclusive_events || []).forEach(e =>
    list.push({
      type: "EVENT",
      text: `${normalizeTitle(e)}${normalizeDate(e) ? " — " + formatDate(normalizeDate(e)) : ""}`,
    })
  );

  if (data.upcoming_booking) {
    const b = data.upcoming_booking;
    list.push({
      type: "SESSION",
      text: `${b.item_name || "Booking"}${b.booking_date ? " — " + formatDate(b.booking_date) : ""}`,
    });
  }

  if (data.spinner?.can_spin) {
    list.push({ type: "SPIN", text: "Free spin available now" });
  }

  if (typeof data.loyalty_points?.current_points === "number") {
    list.push({ type: "LOYALTY", text: `${data.loyalty_points.current_points} pts balance` });
  }

  (data.games_list || []).slice(0, 5).forEach(g =>
    list.push({ type: "GAME", text: `${g.name} — ${g.price_per_hour} INR/hr` })
  );

  (data.combo_offers || []).forEach(c =>
    list.push({ type: "COMBO", text: `${c.name} — ${c.combo_price} INR (+${c.loyalty_bonus} pts)` })
  );

  return list;
}

// ─── Ticker strip (animated) ──────────────────────────────────────
const SCROLL_SPEED = 55; // px per second

function TickerStrip({ items }) {
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimationControls();
  const stripRef = useRef(null);
  const [stripWidth, setStripWidth] = useState(0);
  const [hovered, setHovered] = useState(false);
  const animRef = useRef(null);

  // Measure the width of one copy of the items
  useEffect(() => {
    if (!stripRef.current) return;
    const ob = new ResizeObserver(() => {
      if (stripRef.current) {
        setStripWidth(stripRef.current.scrollWidth / 2); // doubled
      }
    });
    ob.observe(stripRef.current);
    return () => ob.disconnect();
  }, [items]);

  const runAnimation = useCallback(() => {
    if (!stripWidth || prefersReducedMotion) return;
    const duration = stripWidth / SCROLL_SPEED;
    animRef.current = controls.start({
      x: [-0, -stripWidth],
      transition: {
        duration,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });
  }, [controls, stripWidth, prefersReducedMotion]);

  useEffect(() => { runAnimation(); }, [runAnimation]);

  useEffect(() => {
    if (hovered) controls.stop();
    else runAnimation();
  }, [hovered, controls, runAnimation]);

  // Double items for seamless loop
  const doubled = useMemo(() => [...items, ...items], [items]);

  return (
    <div
      className="dqtk-track"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        ref={stripRef}
        className="dqtk-strip"
        animate={controls}
        style={prefersReducedMotion ? { x: 0 } : undefined}
      >
        {doubled.map((item, i) => {
          const cat = CAT[item.type] || CAT.GAME;
          return (
            <span key={i} className="dqtk-item">
              {/* Badge */}
              <span
                className="dqtk-badge"
                style={{
                  color: cat.color,
                  borderColor: `${cat.color}40`,
                  background: `${cat.color}0e`,
                }}
              >
                <CategoryIcon type={item.type} color={cat.color} size={10} />
                {cat.label}
              </span>
              {/* Text */}
              <span className="dqtk-text">{item.text}</span>
              {/* Separator */}
              <span className="dqtk-sep" />
            </span>
          );
        })}
      </motion.div>

      {/* Pause hint */}
      <span className="dqtk-pause-hint">
        <IconPause size={9} color={T.cyan} />
        paused
      </span>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function DashboardTicker({ data, error = null }) {
  useStyles();

  const items = useMemo(() => {
    try { return buildItems(data); }
    catch { return []; }
  }, [data]);

  // Nothing to show
  if (error || !items.length) return null;

  return (
    <motion.div
      className="dqtk-root"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* LIVE indicator — fixed left */}
      <div className="dqtk-live" aria-hidden="true">
        <span className="dqtk-live-dot" />
        <span className="dqtk-live-label">Live</span>
      </div>

      {/* Scrolling content */}
      <TickerStrip items={items} />
    </motion.div>
  );
}