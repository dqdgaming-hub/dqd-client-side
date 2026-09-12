import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Design tokens (mirrors GameItems palette) ──────────────────────────────
const VOID    = "#05040A";
const PANEL   = "#0D0A18";
const PURPLE  = "#7A2CFF";
const PURPLE2 = "#3D1A78";
const SILVER  = "#B9C2D9";
const GOLD    = "#D4AF37";
const GOLDHI  = "#F4D886";
const CYAN    = "#00E5FF";
const BORDER  = "rgba(122,44,255,0.22)";

const STEP_PX       = 160;   // px advanced per arrow click
const AUTO_SPEED_PX = 0.55;  // px per rAF tick  (slow crawl)
const PAUSE_MS      = 1800;  // pause duration after user interaction

// ── Arrow SVGs ──────────────────────────────────────────────────────────────
const ChevronLeft = ({ size = 15, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M14.5 5 8 12l6.5 7" stroke={color} strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRight = ({ size = 15, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9.5 5 16 12l-6.5 7" stroke={color} strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Hexagon clip-path label ─────────────────────────────────────────────────
function HexBadge({ label }) {
  return (
    <span style={badge.wrap}>
      <span style={badge.hex} />
      <span style={badge.text}>{label}</span>
    </span>
  );
}
const badge = {
  wrap: { position: "relative", display: "inline-flex", alignItems: "center", gap: 5 },
  hex: {
    display: "inline-block", width: 7, height: 7,
    background: GOLD, clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
    flexShrink: 0,
  },
  text: { lineHeight: 1 },
};

// ── Single Tab pill ─────────────────────────────────────────────────────────
function TabPill({ cat, isAll, selected, onClick }) {
  const active = isAll ? selected === "" : selected === cat?.id;
  const label  = isAll ? "ALL" : cat.name.toUpperCase();

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      style={{
        ...pill.base,
        ...(active ? pill.active : pill.idle),
      }}
    >
      {/* left accent bar */}
      <motion.span
        animate={{ height: active ? "60%" : "0%" }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        style={pill.accentBar}
      />

      {active ? <HexBadge label={label} /> : label}

      {/* glow overlay on active */}
      {active && (
        <motion.span
          layoutId="tab-glow"
          style={pill.glow}
          initial={false}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

const pill = {
  base: {
    position:     "relative",
    display:      "inline-flex",
    alignItems:   "center",
    gap:          6,
    whiteSpace:   "nowrap",
    flexShrink:   0,
    cursor:       "pointer",
    border:       "none",
    outline:      "none",
    fontFamily:   "'Orbitron','Share Tech Mono',monospace",
    fontSize:     11,
    fontWeight:   700,
    letterSpacing: "0.14em",
    padding:      "8px 20px 8px 18px",
    borderRadius: 0,
    // cut-corner top-right
    clipPath:     "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
    overflow:     "hidden",
    transition:   "background 0.2s, color 0.2s",
    userSelect:   "none",
  },
  idle: {
    background: "rgba(122,44,255,0.07)",
    color:      `${SILVER}bb`,
    borderLeft: `1px solid ${BORDER}`,
    borderTop:  `1px solid ${BORDER}`,
    borderRight:`1px solid ${BORDER}`,
    borderBottom:`1px solid ${BORDER}`,
  },
  active: {
    background: `linear-gradient(115deg, rgba(122,44,255,0.22) 0%, rgba(212,175,55,0.1) 100%)`,
    color:      GOLDHI,
    borderLeft:  `1px solid ${GOLD}88`,
    borderTop:   `1px solid ${GOLD}88`,
    borderRight: `1px solid ${GOLD}33`,
    borderBottom:`1px solid ${GOLD}33`,
  },
  accentBar: {
    position:    "absolute",
    left:        0, top: "50%", transform: "translateY(-50%)",
    width:       2.5, borderRadius: 2,
    background:  GOLD,
    boxShadow:   `0 0 8px ${GOLD}`,
    pointerEvents: "none",
  },
  glow: {
    position: "absolute", inset: 0, pointerEvents: "none",
    background: `radial-gradient(ellipse at 30% 50%, ${GOLD}14 0%, transparent 70%)`,
    borderRadius: "inherit",
  },
};

// ── Main Component ──────────────────────────────────────────────────────────
export default function CategoryTabs({ categories = [], selected, onSelect }) {
  const trackRef    = useRef(null);
  const offsetRef   = useRef(0);    // current scroll offset (px)
  const pauseRef    = useRef(false); // true = auto-scroll paused
  const rafRef      = useRef(null);
  const pauseTimer  = useRef(null);

  const [hovered, setHovered]   = useState(false);
  const [leftFade, setLeftFade] = useState(false);

  // We build a tripled list for seamless infinite loop
  const allItems   = [{ id: "", name: "ALL" }, ...categories];
  const tripled    = [...allItems, ...allItems, ...allItems];

  // ── Measure single-copy width ──────────────────────────────────────────
  const getSingleWidth = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    const children = Array.from(el.children);
    const n = allItems.length;
    // sum widths of first N children (gap included via margin)
    let w = 0;
    for (let i = 0; i < n; i++) {
      if (children[i]) w += children[i].getBoundingClientRect().width + 10; // 10 = gap
    }
    return w;
  }, [allItems.length]);

  // ── Snap offset to middle copy on mount ───────────────────────────────
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    // Wait for layout
    requestAnimationFrame(() => {
      const sw = getSingleWidth();
      offsetRef.current = sw; // start at middle copy
      el.style.transform = `translateX(${-offsetRef.current}px)`;
    });
  }, [categories.length, getSingleWidth]);

  // ── rAF auto-scroll ───────────────────────────────────────────────────
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const tick = () => {
      if (!pauseRef.current && !hovered) {
        const sw = getSingleWidth();
        if (sw > 0) {
          offsetRef.current += AUTO_SPEED_PX;
          // loop: jump back by one copy width to stay in middle copy
          if (offsetRef.current >= sw * 2) offsetRef.current -= sw;
          el.style.transform = `translateX(${-offsetRef.current}px)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hovered, getSingleWidth]);

  // ── Fade left edge indicator ──────────────────────────────────────────
  useEffect(() => {
    setLeftFade(offsetRef.current > 20);
  });

  // ── Arrow navigation ──────────────────────────────────────────────────
  const nudge = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const sw = getSingleWidth();

    pauseRef.current = true;
    clearTimeout(pauseTimer.current);

    let target = offsetRef.current + dir * STEP_PX;
    // keep within middle-copy zone
    if (target < 0)       target += sw;
    if (target >= sw * 2) target -= sw;

    // smooth animate
    const start = offsetRef.current;
    const dist  = target - start;
    const dur   = 320;
    let t0 = null;

    const animate = (ts) => {
      if (!t0) t0 = ts;
      const prog = Math.min((ts - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - prog, 3); // cubic ease-out
      offsetRef.current = start + dist * ease;
      el.style.transform = `translateX(${-offsetRef.current}px)`;
      if (prog < 1) requestAnimationFrame(animate);
      else {
        pauseTimer.current = setTimeout(() => { pauseRef.current = false; }, PAUSE_MS);
      }
    };
    requestAnimationFrame(animate);
  };

  // ── Arrow button ──────────────────────────────────────────────────────
  const ArrowBtn = ({ dir }) => (
    <motion.button
      onClick={() => nudge(dir === "left" ? -1 : 1)}
      whileHover={{ scale: 1.12, boxShadow: `0 0 16px ${PURPLE}88` }}
      whileTap={{ scale: 0.88 }}
      style={arrow.btn}
      aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
    >
      {/* corner accents */}
      <span style={{ position:"absolute", top:0, left:0, width:5, height:5, borderTop:`1.5px solid ${GOLD}`, borderLeft:`1.5px solid ${GOLD}`, pointerEvents:"none" }} />
      <span style={{ position:"absolute", top:0, right:0, width:5, height:5, borderTop:`1.5px solid ${GOLD}`, borderRight:`1.5px solid ${GOLD}`, pointerEvents:"none" }} />
      <span style={{ position:"absolute", bottom:0, left:0, width:5, height:5, borderBottom:`1.5px solid ${GOLD}`, borderLeft:`1.5px solid ${GOLD}`, pointerEvents:"none" }} />
      <span style={{ position:"absolute", bottom:0, right:0, width:5, height:5, borderBottom:`1.5px solid ${GOLD}`, borderRight:`1.5px solid ${GOLD}`, pointerEvents:"none" }} />
      {dir === "left" ? <ChevronLeft /> : <ChevronRight />}
    </motion.button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');

        .ct-track-wrap {
          position: relative;
          overflow: hidden;
          flex: 1;
          min-width: 0;
        }

        /* edge fade masks */
        .ct-track-wrap::before,
        .ct-track-wrap::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 56px;
          z-index: 2;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .ct-track-wrap::before {
          left: 0;
          background: linear-gradient(to right, ${VOID} 0%, transparent 100%);
          opacity: var(--fade-l, 0);
        }
        .ct-track-wrap::after {
          right: 0;
          background: linear-gradient(to left, ${VOID} 0%, transparent 100%);
          opacity: 1;
        }

        /* scanline ruler above tabs */
        .ct-ruler {
          height: 1px;
          background: linear-gradient(to right,
            transparent 0%, ${PURPLE}66 20%, ${GOLD}44 50%, ${PURPLE}66 80%, transparent 100%
          );
          margin-bottom: 4px;
          position: relative;
        }
        .ct-ruler::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 60px;
          background: linear-gradient(to right, transparent, ${GOLDHI}88, transparent);
          animation: ct-sweep 3.2s linear infinite;
        }
        @keyframes ct-sweep {
          0%   { left: -60px; }
          100% { left: 100%;  }
        }

        /* label */
        .ct-label {
          font-family: 'Orbitron', monospace;
          font-size: 9px;
          letter-spacing: 0.28em;
          color: ${PURPLE}99;
          text-transform: uppercase;
          white-space: nowrap;
          padding: 0 4px;
          user-select: none;
        }

        .ct-track {
          display: flex;
          align-items: center;
          gap: 10px;
          will-change: transform;
          padding: 6px 2px;
        }

        /* separator dot between pills */
        .ct-sep {
          width: 3px; height: 3px; border-radius: 50%;
          background: ${PURPLE}55; flex-shrink: 0;
        }
      `}</style>

          {/* <span className="ct-label">Select Categories</span> <br /> */}
      <div style={wrap.outer}>
        {/* ── top ruler ── */}
        <div style={{ width: "100%", paddingBottom: 2 }}>
          <div className="ct-ruler" />
        </div>

        {/* ── row: label · track · arrows ── */}
        <div style={wrap.row}>

          {/* left arrow */}
          <ArrowBtn dir="left" />

          {/* scrollable track */}
          <div
            className="ct-track-wrap"
            style={{ "--fade-l": leftFade ? 1 : 0 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="ct-track" ref={trackRef}>
              {tripled.map((cat, idx) => {
                const isAll = cat.id === "";
                return (
                  <TabPill
                    key={`${idx}-${cat.id}`}
                    cat={cat}
                    isAll={isAll}
                    selected={selected}
                    onClick={() => onSelect(isAll ? "" : cat.id)}
                  />
                );
              })}
            </div>
          </div>

          {/* right arrow */}
          <ArrowBtn dir="right" />
        </div>

        {/* ── bottom ruler ── */}
        <div style={{ width: "100%", paddingTop: 2 }}>
          <div className="ct-ruler" style={{ transform: "scaleX(-1)" }} />
        </div>
      </div>
    </>
  );
}

// ── Layout styles ────────────────────────────────────────────────────────────
const wrap = {
  outer: {
    width:        "100%",
    maxWidth:     860,
    display:      "flex",
    flexDirection:"column",
    alignItems:   "stretch",
    gap:          0,
    marginBottom: 28,
    position:     "relative",
    zIndex:       2,
  },
  row: {
    display:    "flex",
    alignItems: "center",
    gap:        8,
    padding:    "0 0",
  },
};

const arrow = {
  btn: {
    position:        "relative",
    width:           32,
    height:          32,
    background:      "rgba(122,44,255,0.08)",
    border:          `1px solid ${PURPLE}44`,
    borderRadius:    4,
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    cursor:          "pointer",
    flexShrink:      0,
    outline:         "none",
    transition:      "border-color 0.2s",
  },

};