import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";

// ─── Design tokens ────────────────────────────────────────────────
const T = {
  bg:     "#0a0a0f",
  panel:  "#0d0d1a",
  card:   "#11111f",
  cyan:   "#00f5ff",
  yellow: "#ffd60a",
  green:  "#39ff14",
  purple: "#7b2fff",
  pink:   "#ff2d78",
  text:   "#e0e0ff",
  muted:  "#6b6b8a",
  border: "rgba(0,245,255,0.12)",
};

// ─── Inject styles once ────────────────────────────────────────────
const STYLE_ID = "dqd-combo-styles";
function injectStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

    .dqc-root { width: 100%; font-family: 'Share Tech Mono', monospace; }

    /* ── Section heading ── */
    .dqc-heading {
      font-family: 'Orbitron', sans-serif;
      font-size: clamp(0.9rem, 2vw, 1.15rem);
      font-weight: 900; color: ${T.cyan};
      letter-spacing: 3px; text-transform: uppercase;
      display: flex; align-items: center; gap: 14px; margin-bottom: 28px;
    }
    .dqc-heading-line {
      flex: 1; height: 1px;
      background: linear-gradient(90deg, ${T.cyan}50, transparent);
    }
    .dqc-heading-badge {
      font-size: 0.6rem; padding: 2px 10px;
      border: 1px solid ${T.cyan}50; color: ${T.cyan}90;
      letter-spacing: 2px;
    }

    /* ── Slot list ── */
.dqc-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 900px) {
  .dqc-list {
    grid-template-columns: 1fr;
  }
}
    /* ── Slot row ── */
    .dqc-slot {
      position: relative; display: flex; align-items: stretch;
      background: ${T.panel};
      border: 1px solid ${T.border};
      overflow: hidden; cursor: pointer;
      clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
      transition: border-color 0.25s;
      outline: none;
      height: 100%;
    }
    .dqc-slot:focus-visible { outline: 2px solid ${T.cyan}; outline-offset: 2px; }
    .dqc-slot.active  { border-color: ${T.yellow}60; }
    .dqc-slot:not(.active):hover { border-color: ${T.cyan}40; }

    /* index column */
    .dqc-index-col {
      width: 36px; flex-shrink: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: flex-start; padding-top: 16px; gap: 6px;
      border-right: 1px solid ${T.border};
    }
    .dqc-index-num {
      font-family: 'Orbitron', sans-serif; font-size: 0.55rem;
      font-weight: 700; color: ${T.muted}; letter-spacing: 1px;
    }
    .dqc-index-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: ${T.muted};
      transition: background 0.2s, box-shadow 0.2s;
    }
    .dqc-slot.active .dqc-index-dot {
      background: ${T.yellow};
      box-shadow: 0 0 8px ${T.yellow};
    }

    /* thumbnail */
    .dqc-thumb {
      width: 120px; flex-shrink: 0;
      position: relative; overflow: hidden;
      background: ${T.card};
    }
    @media (max-width: 600px) { .dqc-thumb { width: 80px; } }
    .dqc-thumb img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: filter 0.35s, transform 0.4s;
    }
    .dqc-slot.active .dqc-thumb img,
    .dqc-slot:hover .dqc-thumb img {
      filter: brightness(0.55) saturate(1.4);
      transform: scale(1.08);
    }
    .dqc-thumb-fallback {
      width: 100%; height: 100%; min-height: 80px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, ${T.card}, ${T.panel});
    }
    .dqc-thumb-scanlines {
      position: absolute; inset: 0; pointer-events: none;
      background: repeating-linear-gradient(
        0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px
      );
    }

    /* body */
    .dqc-body {
      flex: 1; min-width: 0;
      padding: 14px 18px; display: flex; flex-direction: column; justify-content: center; gap: 6px;
    }

    .dqc-name {
      font-family: 'Orbitron', sans-serif;
      font-size: clamp(0.75rem, 1.6vw, 0.92rem);
      font-weight: 700; color: ${T.text}; letter-spacing: 1px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .dqc-slot.active .dqc-name { color: ${T.yellow}; }

    .dqc-meta-row {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }
    .dqc-tag {
      font-size: 0.6rem; letter-spacing: 1.5px; text-transform: uppercase;
      padding: 2px 8px; color: ${T.cyan}; border: 1px solid ${T.cyan}30;
    }

    /* expanded details */
    .dqc-details-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px;
      padding-top: 10px; border-top: 1px solid ${T.border}; margin-top: 4px;
    }
    .dqc-detail-item { display: flex; flex-direction: column; gap: 2px; }
    .dqc-detail-label { font-size: 0.58rem; color: ${T.muted}; letter-spacing: 1.5px; text-transform: uppercase; }
    .dqc-detail-val   { font-size: 0.7rem; color: ${T.cyan}; }
    .dqc-loyalty-row {
      display: flex; align-items: center; gap: 6px; margin-top: 6px;
      font-size: 0.62rem; color: ${T.green}; letter-spacing: 1px; text-transform: uppercase;
    }

    /* price + CTA column */
    .dqc-cta-col {
      flex-shrink: 0; width: 130px; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 10px;
      padding: 14px 12px; border-left: 1px solid ${T.border};
    }
    @media (max-width: 480px) {
      .dqc-cta-col { width: 100%; border-left: none; border-top: 1px solid ${T.border}; flex-direction: row; justify-content: space-between; padding: 10px 14px; }
    }
    .dqc-price-block { text-align: center; }
    .dqc-price-label { font-size: 0.52rem; color: ${T.muted}; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 3px; }
    .dqc-price-val {
      font-family: 'Orbitron', sans-serif; font-size: clamp(1rem, 2.2vw, 1.2rem);
      font-weight: 900; color: ${T.yellow};
    }
    .dqc-price-currency { font-size: 0.55em; vertical-align: top; margin-top: 3px; display: inline-block; color: ${T.yellow}90; }

    .dqc-book-btn {
      font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
      padding: 7px 16px; border: none; cursor: pointer;
      clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
      background: linear-gradient(135deg, ${T.yellow}, #ff9500);
      color: ${T.bg}; transition: filter 0.2s, transform 0.15s;
      white-space: nowrap;
    }
    .dqc-book-btn:hover  { filter: brightness(1.15); transform: scaleX(1.04); }
    .dqc-book-btn:active { transform: scaleX(0.97); filter: brightness(0.9); }

    /* active slot overlay glow */
    .dqc-slot-glow {
      position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(90deg, ${T.yellow}06, transparent 60%);
    }

    /* mobile layout switch */
    @media (max-width: 480px) {
      .dqc-slot { flex-wrap: wrap; clip-path: none; border-radius: 2px; }
      .dqc-cta-col { width: 100%; }
      .dqc-details-grid { grid-template-columns: 1fr 1fr; }
    }

    /* empty state */
    .dqc-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 48px 24px; gap: 14px;
      border: 1px dashed ${T.border};
      clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
    }
    .dqc-empty-title { font-family: 'Orbitron', sans-serif; font-size: 0.75rem; color: ${T.muted}; letter-spacing: 3px; text-transform: uppercase; }
    .dqc-empty-sub   { font-size: 0.65rem; color: ${T.muted}60; letter-spacing: 1.5px; }

    /* skeleton */
    .dqc-skeleton-row {
      display: flex; gap: 0; overflow: hidden;
      border: 1px solid ${T.border};
      clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
    }
    .dqc-skel-block {
      background: linear-gradient(90deg, ${T.panel} 25%, ${T.card} 50%, ${T.panel} 75%);
      background-size: 200% 100%;
      animation: dqc-shimmer 1.6s infinite;
    }
    @keyframes dqc-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `;
  document.head.appendChild(el);
}

// ─── SVG Icons (inline, no deps) ──────────────────────────────────
const IconGift = ({ size = 20, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="9" width="18" height="13" rx="1" />
    <path d="M3 9h18v4H3z" fill={color} stroke="none" opacity="0.18" />
    <path d="M12 9V22" />
    <path d="M8 3c0 3.3 4 6 4 6s4-2.7 4-6a4 4 0 00-8 0z" />
  </svg>
);
const IconSnack = ({ size = 13, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 11l19-9-9 19-2-8-8-2z" />
  </svg>
);
const IconCoin = ({ size = 13, color = T.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M12 8v8M9 10h4.5a1.5 1.5 0 010 3H9" />
  </svg>
);
const IconEmpty = ({ size = 36, color = T.muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const IconError = ({ size = 36, color = T.pink }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="16" r="0.5" fill={color} />
  </svg>
);
const IconChevron = ({ size = 14, color = T.muted, open = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconImage = ({ size = 28, color = T.muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);

// ─── Skeleton loader ───────────────────────────────────────────────
function ComboSkeleton({ count = 3 }) {
  return (
    <div className="dqc-list" aria-busy="true" aria-label="Loading combos">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="dqc-skeleton-row" style={{ height: 90 }}>
          <div className="dqc-skel-block" style={{ width: 36 }} />
          <div className="dqc-skel-block" style={{ width: 120, borderLeft: `1px solid ${T.border}` }} />
          <div className="dqc-skel-block" style={{ flex: 1, margin: "12px 18px", borderRadius: 1 }} />
          <div className="dqc-skel-block" style={{ width: 130, borderLeft: `1px solid ${T.border}` }} />
        </div>
      ))}
    </div>
  );
}

// ─── Lazy image with IntersectionObserver ─────────────────────────
function LazyThumb({ src, alt, id, onBroken }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!src) { onBroken(id); return; }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "120px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [src, id, onBroken]);

  const handleError = useCallback(() => { setErrored(true); onBroken(id); }, [id, onBroken]);

  return (
    <div ref={ref} className="dqc-thumb">
      {visible && src && !errored ? (
        <img src={src} alt={alt} onError={handleError} loading="lazy" decoding="async" />
      ) : (
        <div className="dqc-thumb-fallback">
          <IconImage size={28} />
        </div>
      )}
      <div className="dqc-thumb-scanlines" />
    </div>
  );
}

// ─── Single combo row ─────────────────────────────────────────────
const rowVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

const detailVariants = {
  closed: { height: 0, opacity: 0 },
  open:   { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

function ComboRow({ combo, index, isActive, onToggle, onBroken, prefersReduced }) {
  const c = combo;

  const motionProps = prefersReduced
    ? {}
    : { variants: rowVariants, custom: index, initial: "hidden", animate: "visible" };

  return (
    <motion.div {...motionProps} layout>
      <div
        className={`dqc-slot${isActive ? " active" : ""}`}
        onClick={() => onToggle(c.id)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle(c.id)}
        tabIndex={0}
        role="button"
        aria-expanded={isActive}
        aria-label={`${c.name}, ${c.combo_price} INR`}
      >
        {/* Active glow overlay */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="dqc-slot-glow"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* Index column */}
        <div className="dqc-index-col">
          <span className="dqc-index-num">{String(index + 1).padStart(2, "0")}</span>
          <div className="dqc-index-dot" />
        </div>

        {/* Thumbnail */}
        <LazyThumb src={c.image} alt={c.name} id={c.id} onBroken={onBroken} />

        {/* Body */}
        <div className="dqc-body">
          <div className="dqc-name">{c.name}</div>
          <div className="dqc-meta-row">
            <span className="dqc-tag"><IconSnack size={10} color={T.cyan} /> &nbsp;{c.snack_name}</span>
            <span className="dqc-tag" style={{ borderColor: `${T.green}30`, color: T.green }}>
              <IconCoin size={10} color={T.green} /> &nbsp;+{c.loyalty_bonus} pts
            </span>
            <IconChevron size={13} color={isActive ? T.yellow : T.muted} open={isActive} />
          </div>

          {/* Expanded details */}
          <AnimatePresence initial={false}>
            {isActive && (
              <motion.div
                variants={detailVariants}
                initial="closed" animate="open" exit="closed"
                style={{ overflow: "hidden" }}
              >
                <div className="dqc-details-grid">
                  <div className="dqc-detail-item">
                    <span className="dqc-detail-label">Snack Item</span>
                    <span className="dqc-detail-val">{c.snack_name}</span>
                  </div>
                  <div className="dqc-detail-item">
                    <span className="dqc-detail-label">Snack Price</span>
                    <span className="dqc-detail-val">{c.snack_price} INR</span>
                  </div>
                  <div className="dqc-detail-item">
                    <span className="dqc-detail-label">Combo Price</span>
                    <span className="dqc-detail-val">{c.combo_price} INR</span>
                  </div>
                  {c.description && (
                    <div className="dqc-detail-item" style={{ gridColumn: "1 / -1" }}>
                      <span className="dqc-detail-label">Details</span>
                      <span className="dqc-detail-val" style={{ color: T.text, fontSize: "0.68rem" }}>{c.description}</span>
                    </div>
                  )}
                </div>
                <div className="dqc-loyalty-row">
                  <IconCoin size={12} color={T.green} />
                  +{c.loyalty_bonus} loyalty points on booking
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA column */}
        <div className="dqc-cta-col">
          <div className="dqc-price-block">
            <div className="dqc-price-label">Combo</div>
            <div className="dqc-price-val">
              <span className="dqc-price-currency">₹</span>
              {c.combo_price}
            </div>
          </div>
          <motion.button
            className="dqc-book-btn"
            whileTap={prefersReduced ? {} : { scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); /* trigger booking flow */ }}
            aria-label={`Book ${c.name}`}
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Error boundary ────────────────────────────────────────────────
import { Component } from "react";
class CombosErrorBoundary extends Component {
  state = { hasError: false, message: "" };
  static getDerivedStateFromError(err) { return { hasError: true, message: err.message }; }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="dqc-empty" style={{ borderColor: `${T.pink}40` }}>
        <IconError />
        <div className="dqc-empty-title" style={{ color: T.pink }}>Component Error</div>
        <div className="dqc-empty-sub">{this.state.message || "Failed to render combos."}</div>
      </div>
    );
  }
}

// ─── Main export ──────────────────────────────────────────────────
export default function DashboardCombos({ combos = [], loading = false, error = null }) {
  useEffect(() => { injectStyles(); }, []);
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "0px 0px -60px 0px" });

  const [activeId, setActiveId] = useState(null);
  const [brokenImgs, setBrokenImgs] = useState(new Set());

  const handleToggle = useCallback((id) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  const handleBroken = useCallback((id) => {
    setBrokenImgs((prev) => { const next = new Set(prev); next.add(id); return next; });
  }, []);

  const sectionVariants = prefersReduced ? {} : {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <CombosErrorBoundary>
      <motion.section
        ref={sectionRef}
        className="dqc-root"
        variants={sectionVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        aria-label="Combo Offers"
      >
        {/* Heading */}
        <div className="dqc-heading">
          <IconGift size={18} />
          Combo Offers
          <div className="dqc-heading-line" />
          {!loading && !error && combos.length > 0 && (
            <span className="dqc-heading-badge">{combos.length} ACTIVE</span>
          )}
        </div>

        {/* States */}
        {loading && <ComboSkeleton count={3} />}

        {!loading && error && (
          <div className="dqc-empty" style={{ borderColor: `${T.pink}40` }}>
            <IconError />
            <div className="dqc-empty-title" style={{ color: T.pink }}>Failed to Load</div>
            <div className="dqc-empty-sub">{error}</div>
          </div>
        )}

        {!loading && !error && combos.length === 0 && (
          <div className="dqc-empty">
            <IconEmpty />
            <div className="dqc-empty-title">No Combo Offers</div>
            <div className="dqc-empty-sub">// Check back later for exclusive deals //</div>
          </div>
        )}

        {!loading && !error && combos.length > 0 && (
          <motion.div className="dqc-list" layout>
            {combos.map((combo, i) => (
              <ComboRow
                key={combo.id}
                combo={combo}
                index={i}
                isActive={activeId === combo.id}
                onToggle={handleToggle}
                onBroken={handleBroken}
                prefersReduced={prefersReduced}
              />
            ))}
          </motion.div>
        )}
      </motion.section>
    </CombosErrorBoundary>
  );
}