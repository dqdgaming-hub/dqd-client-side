import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, useReducedMotion, useAnimationControls } from "framer-motion";

var X$1 = {
    bg: "#070712",
    bgCard: "#0d0d1a",
    bgPanel: "#11111f",
    cyan: "#00f5ff",
    pink: "#ff006e",
    yellow: "#ffd60a",
    green: "#39ff14",
    purple: "#7b2fff",
    red: "#ff3b3b",
    text: "#e0e0ff",
    muted: "#6b6b8a",
    border: "rgba(0,245,255,0.15)",
  },
  sr = {
    EVENT: {
      color: X$1.pink,
      label: "EVENT",
    },
    SESSION: {
      color: X$1.cyan,
      label: "SESSION",
    },
    SPIN: {
      color: X$1.purple,
      label: "SPIN",
    },
    LOYALTY: {
      color: X$1.green,
      label: "LOYALTY",
    },
    GAME: {
      color: X$1.cyan,
      label: "GAME",
    },
    COMBO: {
      color: X$1.yellow,
      label: "COMBO",
    },
  },
  cr = `
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
      ${X$1.bgCard} 0%,
      rgba(13,13,26,0.6) 40%,
      rgba(17,17,31,0.6) 60%,
      ${X$1.bgCard} 100%
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
      linear-gradient(90deg, ${X$1.bgCard} 0%, transparent 120px),
      linear-gradient(270deg, ${X$1.bgCard} 0%, transparent 120px);
  }

  /* Live pill */
  .dqtk-live {
    position: absolute; left: 0; top: 0; bottom: 0; z-index: 5;
    display: flex; align-items: center;
    padding: 0 16px 0 14px;
    background: ${X$1.bgCard};
    border-right: 1px solid rgba(0,245,255,0.2);
    gap: 7px;
    flex-shrink: 0;
  }
  .dqtk-live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: ${X$1.red};
    box-shadow: 0 0 6px ${X$1.red};
    animation: dqtk-blink 1.4s ease-in-out infinite;
  }
  .dqtk-live-label {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.55rem; font-weight: 700;
    color: ${X$1.red}; letter-spacing: 2.5px;
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
    color: ${X$1.text}99;
    flex-shrink: 0;
    cursor: default;
    transition: color 0.2s ease;
  }
  .dqtk-item:hover { color: ${X$1.text}; }

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
    color: ${X$1.cyan}; opacity: 0;
    transition: opacity 0.2s ease;
    display: flex; align-items: center; gap: 5px;
  }
  .dqtk-root:hover .dqtk-pause-hint { opacity: 0.75; }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .dqtk-live-dot { animation: none !important; opacity: 1; }
  }
`;
function useTickerStyles() {
  useEffect(() => {
    if (document.getElementById("dqtk-styles")) return;
    let e = document.createElement("style");
    (e.id = "dqtk-styles"), (e.textContent = cr), document.head.appendChild(e);
  }, []);
}
var XUr = ({ size = 11, color }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 4h8v5a4 4 0 01-8 0V4z" />
      <path d="M8 5H5a2 2 0 002 4M16 5h3a2 2 0 01-2 4" />
      <path d="M12 13v3M9 20h6" />
    </svg>
  ),
  XDr = ({ size = 11, color }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  ),
  XFr = ({ size = 11, color }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  XPr = ({ size = 11, color }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  XMr = ({ size = 11, color }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <line x1="18" y1="11" x2="18.01" y2="11" />
      <rect x="2" y="6" width="20" height="12" rx="2" />
    </svg>
  ),
  XHr = ({ size = 11, color }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  XGr = ({ size = 9, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
function XR({ type, color, size = 11 }) {
  switch (type) {
    case "EVENT":
      return <XUr size={size} color={color} />;
    case "SESSION":
      return <XDr size={size} color={color} />;
    case "SPIN":
      return <XPr size={size} color={color} />;
    case "LOYALTY":
      return <XFr size={size} color={color} />;
    case "GAME":
      return <XMr size={size} color={color} />;
    case "COMBO":
      return <XHr size={size} color={color} />;
    default:
      return <XPr size={size} color={color} />;
  }
}
function vr(e) {
  if (!e) return "";
  let t = new Date(`${e}T00:00:00`);
  return Number.isNaN(t.getTime())
    ? e
    : t.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
}
function yr(e) {
  return e.title || e.event_title || "Event";
}
function br(e) {
  return e.date || e.event_date || "";
}
function xr(e) {
  if (!e) return [];
  let t = [];
  if (
    ((e.exclusive_events || []).forEach((e) =>
      t.push({
        type: "EVENT",
        text: `${yr(e)}${br(e) ? " — " + vr(br(e)) : ""}`,
      }),
    ),
    e.upcoming_booking)
  ) {
    let n = e.upcoming_booking;
    t.push({
      type: "SESSION",
      text: `${n.item_name || "Booking"}${n.booking_date ? " — " + vr(n.booking_date) : ""}`,
    });
  }
  return (
    typeof e.loyalty_points?.current_points == "number" &&
      t.push({
        type: "LOYALTY",
        text: `${e.loyalty_points.current_points} pts balance`,
      }),
    (e.games_list || []).slice(0, 5).forEach((e) =>
      t.push({
        type: "GAME",
        text: `${e.name} — ${e.price_per_hour} INR/hr`,
      }),
    ),
    (e.combo_offers || []).forEach((e) =>
      t.push({
        type: "COMBO",
        text: `${e.name} — ${e.combo_price} INR (+${e.loyalty_bonus} pts)`,
      }),
    ),
    t
  );
}
var Sr = 55;
function Cr({ items }) {
  let t = useReducedMotion(),
    n = useAnimationControls(),
    r = useRef(null),
    [i, a] = useState(0),
    [o, s] = useState(false),
    c = useRef(null);
  useEffect(() => {
    if (!r.current) return;
    let e = new ResizeObserver(() => {
      r.current && a(r.current.scrollWidth / 2);
    });
    return e.observe(r.current), () => e.disconnect();
  }, [items]);
  let l = useCallback(() => {
    if (!i || t) return;
    let e = i / Sr;
    c.current = n.start({
      x: [-0, -i],
      transition: {
        duration: e,
        ease: "linear",
        repeat: 1 / 0,
        repeatType: "loop",
      },
    });
  }, [n, i, t]);
  useEffect(() => {
    l();
  }, [l]),
    useEffect(() => {
      o ? n.stop() : l();
    }, [o, n, l]);
  let u = useMemo(() => [...items, ...items], [items]);
  return (
    <div className="dqtk-track" onMouseEnter={() => s(true)} onMouseLeave={() => s(false)}>
      <motion.div ref={r} className="dqtk-strip" animate={n} style={t ? { x: 0 } : void 0}>
        {u.map((e, t) => {
          let n = sr[e.type] || sr.GAME;
          return (
            <span key={t} className="dqtk-item">
              <span
                className="dqtk-badge"
                style={{
                  color: n.color,
                  borderColor: `${n.color}40`,
                  background: `${n.color}0e`,
                }}
              >
                <XR type={e.type} color={n.color} size={10} />
                {n.label}
              </span>
              <span className="dqtk-text">{e.text}</span>
              <span className="dqtk-sep" />
            </span>
          );
        })}
      </motion.div>
      <span className="dqtk-pause-hint">
        <XGr size={9} color={X$1.cyan} />
        paused
      </span>
    </div>
  );
}
function DashboardTicker({ data, error = null }) {
  useTickerStyles();
  let n = useMemo(() => {
    try {
      return xr(data);
    } catch {
      return [];
    }
  }, [data]);
  return error || !n.length ? null : (
    <motion.div
      className="dqtk-root"
      initial={{
        opacity: 0,
        y: -4,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="dqtk-live" aria-hidden="true">
        <span className="dqtk-live-dot" />
        <span className="dqtk-live-label">Live</span>
      </div>
      <Cr items={n} />
    </motion.div>
  );
}

export default DashboardTicker;
