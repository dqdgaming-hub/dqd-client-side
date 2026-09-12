import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Design Tokens ────────────────────────────────────────────────
const T = {
  bg:      "#070712",
  panel:   "#0d0d1a",
  cyan:    "#00f5ff",
  pink:    "#ff006e",
  green:   "#39ff14",
  red:     "#ff3b3b",
  purple:  "#7b2fff",
  text:    "#e0e0ff",
  muted:   "#6b6b8a",
  border:  "rgba(0,245,255,0.15)",
};

// ─── Global Styles ────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Share+Tech+Mono&display=swap');

  .dqev-root *,
  .dqev-root *::before,
  .dqev-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dqev-root {
    width: 100%;
    font-family: 'Share Tech Mono', monospace;
  }

  /* Section heading */
  .dqev-heading {
    display: flex; align-items: center; gap: 12px;
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(0.85rem, 2vw, 1.1rem);
    font-weight: 700; color: ${T.cyan};
    letter-spacing: 3px; text-transform: uppercase;
    margin-bottom: 28px;
  }
  .dqev-heading-bar {
    width: 3px; height: 1.2em; border-radius: 2px; flex-shrink: 0;
    background: linear-gradient(180deg, ${T.cyan}, ${T.purple});
  }

  /* Scrollable row */
  .dqev-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
  }
  @media (max-width: 480px) {
    .dqev-row { grid-template-columns: 1fr 1fr; gap: 14px; }
  }
  @media (max-width: 340px) {
    .dqev-row { grid-template-columns: 1fr; }
  }

  /* ── Flip card shell ── */
  .dqev-scene {
    width: 100%; aspect-ratio: 3/4;
    perspective: 900px;
    cursor: pointer;
    position: relative;
  }
  .dqev-flipper {
    width: 100%; height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1);
    border-radius: 0;
    will-change: transform;
  }
  .dqev-scene.flipped .dqev-flipper { transform: rotateY(180deg); }

  /* Chamfer clip */
  .dqev-face {
    position: absolute; inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
    overflow: hidden;
  }

  /* ── FRONT ── */
  .dqev-front {
    background: ${T.panel};
    border: 1px solid ${T.border};
  }
  .dqev-front-img {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    transition: transform 0.4s ease;
  }
  .dqev-scene:hover .dqev-front-img { transform: scale(1.04); }

  .dqev-front-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      to top,
      rgba(7,7,18,0.92) 0%,
      rgba(7,7,18,0.4) 45%,
      transparent 100%
    );
    pointer-events: none;
  }
  .dqev-front-footer {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 14px 13px 12px;
  }
  .dqev-front-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(0.62rem, 1.4vw, 0.72rem);
    font-weight: 700; color: ${T.text};
    letter-spacing: 0.5px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .dqev-front-hint {
    margin-top: 6px; display: flex; align-items: center; gap: 5px;
    font-size: 0.58rem; color: ${T.cyan}; letter-spacing: 1.5px; text-transform: uppercase;
    opacity: 0.75;
  }

  /* Front image fallback */
  .dqev-fallback {
    width: 100%; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    background: linear-gradient(135deg, #0d0d1a 0%, #11112a 100%);
    color: ${T.muted};
    font-size: 0.62rem; letter-spacing: 1.5px; text-transform: uppercase;
  }

  /* ── BACK ── */
  .dqev-back {
    transform: rotateY(180deg);
    background: ${T.bg};
    border: 1px solid rgba(123,47,255,0.35);
  }
  /* Holographic diagonal shimmer */
  .dqev-back::before {
    content: '';
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background: linear-gradient(
      135deg,
      rgba(0,245,255,0.07) 0%,
      rgba(123,47,255,0.10) 30%,
      rgba(255,0,110,0.06) 60%,
      rgba(0,245,255,0.04) 100%
    );
  }
  /* Scan-line texture */
  .dqev-back::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 3px,
      rgba(0,245,255,0.02) 3px,
      rgba(0,245,255,0.02) 4px
    );
  }

  .dqev-back-content {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; height: 100%;
    padding: 16px 14px;
  }

  /* Corner accent */
  .dqev-corner {
    position: absolute; top: 0; right: 14px;
    width: 0; height: 0;
    border-left: 14px solid transparent;
    border-top: 14px solid ${T.purple};
    opacity: 0.6;
  }

  /* Thin neon top stripe */
  .dqev-back-stripe {
    height: 2px; width: 100%;
    background: linear-gradient(90deg, ${T.cyan}, ${T.purple}, ${T.pink});
    margin-bottom: 14px; flex-shrink: 0;
    border-radius: 1px;
  }

  .dqev-back-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(0.65rem, 1.5vw, 0.78rem);
    font-weight: 700; color: ${T.text};
    letter-spacing: 0.5px; line-height: 1.4;
    margin-bottom: 14px; flex-shrink: 0;
  }

  .dqev-back-rows { display: flex; flex-direction: column; gap: 10px; flex: 1; }

  .dqev-meta-row {
    display: flex; align-items: flex-start; gap: 8px;
  }
  .dqev-meta-icon { color: ${T.cyan}; flex-shrink: 0; margin-top: 1px; opacity: 0.8; }
  .dqev-meta-block { display: flex; flex-direction: column; gap: 2px; }
  .dqev-meta-label {
    font-size: 0.54rem; color: ${T.muted}; letter-spacing: 1.5px; text-transform: uppercase;
  }
  .dqev-meta-value {
    font-size: 0.68rem; color: ${T.text}; letter-spacing: 0.5px;
  }

  .dqev-back-spacer { flex: 1; }

  /* QR badge */
  .dqev-qr-badge {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 7px 11px; border-radius: 2px;
    font-size: 0.64rem; letter-spacing: 1.5px; text-transform: uppercase;
    border: 1px solid;
    width: 100%;
  }
  .dqev-qr-badge--valid {
    color: ${T.green}; border-color: ${T.green}40; background: ${T.green}0f;
  }
  .dqev-qr-badge--invalid {
    color: ${T.red}; border-color: ${T.red}40; background: ${T.red}0f;
  }
  .dqev-qr-dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
    animation: dqev-pulse 2s ease-in-out infinite;
  }
  .dqev-qr-badge--valid .dqev-qr-dot { background: ${T.green}; }
  .dqev-qr-badge--invalid .dqev-qr-dot { background: ${T.red}; animation: none; }
  @keyframes dqev-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Close hint */
  .dqev-close-hint {
    margin-top: 10px; text-align: center;
    font-size: 0.54rem; color: ${T.muted}; letter-spacing: 1px; text-transform: uppercase;
    opacity: 0.65;
  }

  /* ── Empty state ── */
  .dqev-empty {
    padding: 48px 24px; text-align: center;
    border: 1px dashed ${T.border};
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
    color: ${T.muted}; letter-spacing: 1.5px; font-size: 0.78rem;
    display: flex; flex-direction: column; align-items: center; gap: 16px;
  }
  .dqev-empty-title {
    color: ${T.text}; font-family: 'Orbitron', sans-serif;
    font-size: 0.8rem; letter-spacing: 2px;
  }
  .dqev-empty-sub { font-size: 0.68rem; max-width: 240px; line-height: 1.6; }

  /* ── Loading skeleton ── */
  .dqev-skeleton {
    width: 100%; aspect-ratio: 3/4;
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
    background: linear-gradient(90deg, #0d0d1a 0%, #161630 50%, #0d0d1a 100%);
    background-size: 200% 100%;
    animation: dqev-shimmer 1.8s ease-in-out infinite;
  }
  @keyframes dqev-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* ── Error state ── */
  .dqev-error {
    padding: 20px; text-align: center;
    border: 1px solid ${T.red}30; background: ${T.red}08;
    color: ${T.red}; font-size: 0.72rem; letter-spacing: 1px;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  }

  /* Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    .dqev-flipper { transition-duration: 0.01ms !important; }
    .dqev-qr-dot { animation: none !important; }
    .dqev-skeleton { animation: none !important; }
    .dqev-front-img { transition: none !important; }
  }
`;

function useStyles() {
  useEffect(() => {
    if (document.getElementById("dqev-styles")) return;
    const el = document.createElement("style");
    el.id = "dqev-styles";
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => { /* intentionally keep styles alive for fast re-mounts */ };
  }, []);
}

// ─── Icons ────────────────────────────────────────────────────────
const IconTrophy = ({ size = 18, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4h8v5a4 4 0 01-8 0V4z"/>
    <path d="M8 5H5a2 2 0 002 4M16 5h3a2 2 0 01-2 4"/>
    <path d="M12 13v3M9 20h6M10 16h4v4h-4z"/>
  </svg>
);
const IconCalendar = ({ size = 12, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2"/>
    <path d="M16 3v4M8 3v4M3 10h18"/>
  </svg>
);
const IconRotate = ({ size = 10, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6M23 20v-6h-6"/>
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
  </svg>
);
const IconCheckCircle = ({ size = 13, color = T.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M8.5 12.5l2.3 2.3L16 10"/>
  </svg>
);
const IconXCircle = ({ size = 13, color = T.red }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/>
  </svg>
);
const IconImage = ({ size = 28, color = T.muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
);
const IconAlertTriangle = ({ size = 28, color = T.red }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconTag = ({ size = 12, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "—";
  const date = new Date(`${d}T00:00:00`);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Lazy Image with IntersectionObserver ─────────────────────────
function LazyImage({ src, alt, className, onError }) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!imgRef.current) return;
    const ob = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); ob.disconnect(); } },
      { rootMargin: "120px" }
    );
    ob.observe(imgRef.current);
    return () => ob.disconnect();
  }, []);

  return (
    <div ref={imgRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      {inView && (
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease" }}
          onLoad={() => setLoaded(true)}
          onError={onError}
        />
      )}
      {(!inView || !loaded) && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #0d0d1a, #11112a)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <IconImage size={22} color={T.muted} />
        </div>
      )}
    </div>
  );
}

// ─── Single Event Card ────────────────────────────────────────────
function EventCard({ ev, index }) {
  const [flipped, setFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const hasImg = !!ev.event_image && !imgError;

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div
        className={`dqev-scene${flipped ? " flipped" : ""}`}
        onClick={() => setFlipped(f => !f)}
        role="button"
        tabIndex={0}
        aria-label={`${ev.event_title} — click to ${flipped ? "hide" : "show"} details`}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && setFlipped(f => !f)}
      >
        <div className="dqev-flipper">
          {/* ── FRONT ── */}
          <div className="dqev-face dqev-front">
            {hasImg ? (
              <LazyImage
                src={ev.event_image}
                alt={ev.event_title}
                className="dqev-front-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="dqev-fallback">
                <IconTrophy size={30} color={T.muted} />
                <span>No image</span>
              </div>
            )}
            <div className="dqev-front-overlay" />
            <div className="dqev-front-footer">
              <div className="dqev-front-title">{ev.event_title}</div>
              <div className="dqev-front-hint">
                <IconRotate size={9} color={T.cyan} /> Tap to reveal
              </div>
            </div>
          </div>

          {/* ── BACK ── */}
          <div className="dqev-face dqev-back">
            <div className="dqev-corner" />
            <div className="dqev-back-content">
              <div className="dqev-back-stripe" />

              <div className="dqev-back-title">{ev.event_title}</div>

              <div className="dqev-back-rows">
                <div className="dqev-meta-row">
                  <span className="dqev-meta-icon"><IconCalendar size={12} /></span>
                  <div className="dqev-meta-block">
                    <span className="dqev-meta-label">Date</span>
                    <span className="dqev-meta-value">{formatDate(ev.event_date)}</span>
                  </div>
                </div>

                {ev.category && (
                  <div className="dqev-meta-row">
                    <span className="dqev-meta-icon"><IconTag size={12} /></span>
                    <div className="dqev-meta-block">
                      <span className="dqev-meta-label">Category</span>
                      <span className="dqev-meta-value">{ev.category}</span>
                    </div>
                  </div>
                )}

                {ev.location && (
                  <div className="dqev-meta-row">
                    <span className="dqev-meta-icon">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={T.cyan} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </span>
                    <div className="dqev-meta-block">
                      <span className="dqev-meta-label">Venue</span>
                      <span className="dqev-meta-value">{ev.location}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="dqev-back-spacer" />

              <div
                className={`dqev-qr-badge dqev-qr-badge--${ev.is_qr_valid ? "valid" : "invalid"}`}
                role="status"
                aria-live="polite"
              >
                <span className="dqev-qr-dot" />
                {ev.is_qr_valid
                  ? <><IconCheckCircle size={12} /> QR Ticket Valid</>
                  : <><IconXCircle size={12} /> QR Ticket Invalid</>
                }
              </div>

              <div className="dqev-close-hint">Tap to flip back</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────
function SkeletonGrid({ count = 4 }) {
  return (
    <div className="dqev-row">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="dqev-skeleton" />
      ))}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────
export default function DashboardEvents({
  events = [],
  loading = false,
  error = null,
}) {
  useStyles();

  return (
    <div className="dqev-root">
      {/* Section Heading */}
      <div className="dqev-heading">
        <div className="dqev-heading-bar" />
        <IconTrophy size={16} color={T.cyan} />
        Events Booked
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="dqev-error" role="alert">
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 6 }}>
            <IconAlertTriangle size={16} color={T.red} />
            <strong>Failed to load events</strong>
          </div>
          <span style={{ fontSize: "0.65rem", opacity: 0.75 }}>{typeof error === "string" ? error : "Please try again later."}</span>
        </div>
      )}

      {/* Loading */}
      {loading && <SkeletonGrid count={4} />}

      {/* Events grid */}
      {!loading && !error && events.length > 0 && (
        <div className="dqev-row">
          {events.map((ev, i) => (
            <EventCard key={ev.id ?? i} ev={ev} index={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && events.length === 0 && (
        <motion.div
          className="dqev-empty"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <IconTrophy size={30} color={T.muted} />
          <div className="dqev-empty-title">No Events Yet</div>
          <div className="dqev-empty-sub">
            You haven't registered for any events. Check the Events section to join upcoming tournaments.
          </div>
        </motion.div>
      )}
    </div>
  );
}