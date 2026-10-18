import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";

var H$1 = {
    bg: "#0a0a0f",
    card: "#0d0d1a",
    panel: "#11111f",
    elevated: "#141428",
    cyan: "#00f5ff",
    pink: "#ff006e",
    yellow: "#ffd60a",
    purple: "#7b2fff",
    green: "#00ff94",
    text: "#e0e0ff",
    muted: "#6b6b8a",
    dim: "#1e1e35",
    border: "rgba(0,245,255,0.13)",
    borderHov: "rgba(0,245,255,0.5)",
  },
  Xt = "dqgm-v4";
function Zt() {
  if (document.getElementById(Xt)) return;
  let e = document.createElement("style");
  (e.id = Xt),
    (e.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500;600&display=swap');

    @keyframes dqgm-scan    { 0%{transform:translateY(-100%)} 100%{transform:translateY(600%)} }
    @keyframes dqgm-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes dqgm-flicker { 0%,89%,91%,96%,100%{opacity:1} 90%{opacity:.35} 95%{opacity:.7} }
    @keyframes dqgm-btn-pulse {
      0%,100% { box-shadow: 0 0 0 0 ${H$1.cyan}00, inset 0 0 0 0 ${H$1.cyan}00; }
      50%      { box-shadow: 0 0 18px 2px ${H$1.cyan}28, inset 0 0 8px 0 ${H$1.cyan}12; }
    }

    .dqgm-root { width: 100%; }

    /* ── Grid ── */
    .dqgm-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
    @media (max-width: 560px)  { .dqgm-grid { grid-template-columns: 1fr; gap: 14px; } }
    @media (min-width: 560px) and (max-width: 860px) { .dqgm-grid { grid-template-columns: repeat(2,1fr); } }

    /* ── Stats bar ── */
    .dqgm-stats {
      display: flex; margin-bottom: 24px;
      background: ${H$1.panel}; border: 1px solid ${H$1.border}; border-radius: 4px;
      overflow: hidden; flex-wrap: wrap;
    }
    .dqgm-stat {
      flex: 1; min-width: 72px; padding: 12px 16px;
      display: flex; flex-direction: column; gap: 3px;
      border-right: 1px solid ${H$1.border};
      position: relative;
    }
    .dqgm-stat:last-child { border-right: none; }
    .dqgm-stat::after {
      content:''; position:absolute; left:0; top:0; bottom:0; width:2px;
      background: linear-gradient(180deg,${H$1.cyan},${H$1.purple}); opacity:.45;
    }
    .dqgm-stat-val {
      font-family:'Orbitron',sans-serif;
      font-size:clamp(0.9rem,2vw,1.05rem); font-weight:700; color:${H$1.cyan};
    }
    .dqgm-stat-lbl {
      font-family:'Share Tech Mono',monospace;
      font-size:0.52rem; letter-spacing:1.5px; color:${H$1.muted}; text-transform:uppercase;
    }
    @media (max-width:480px) { .dqgm-stat { padding:10px 12px; } }

    /* ── Category pills ── */
    .dqgm-cats { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:28px; }
    .dqgm-cat-btn {
      position:relative; padding:7px 16px;
      background:${H$1.panel}; border:1px solid ${H$1.border};
      color:${H$1.muted};
      font-family:'Share Tech Mono',monospace;
      font-size:0.6rem; letter-spacing:2px; text-transform:uppercase;
      clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
      cursor:pointer; transition:color .2s,border-color .2s,background .2s,box-shadow .2s;
      white-space:nowrap; outline:none;
      display:inline-flex; align-items:center; gap:7px;
    }
    .dqgm-cat-btn:hover  { color:${H$1.cyan}; border-color:${H$1.cyan}55; background:${H$1.cyan}0c; }
    .dqgm-cat-btn.active { color:${H$1.cyan}; border-color:${H$1.cyan}90; background:${H$1.cyan}16;
      box-shadow:0 0 16px ${H$1.cyan}1a; }
    .dqgm-cat-btn:focus-visible { outline:1px solid ${H$1.cyan}80; outline-offset:3px; }
    .dqgm-cat-count {
      display:inline-flex; align-items:center; justify-content:center;
      min-width:16px; height:16px; padding:0 3px; border-radius:2px;
      background:${H$1.cyan}1a; color:${H$1.cyan};
      font-size:0.5rem; font-family:'Orbitron',sans-serif; font-weight:700;
    }

    /* ── Card ── */
    .dqgm-card {
      position:relative; background:${H$1.card};
      border:1px solid ${H$1.border}; border-radius:2px;
      overflow:hidden;
      clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));
      display:flex; flex-direction:column;
      transition:border-color .3s,box-shadow .3s;
    }
    .dqgm-card:not(.dqgm-card--maint):hover {
      border-color:${H$1.borderHov};
      box-shadow:0 0 0 1px ${H$1.cyan}1a,0 20px 56px ${H$1.cyan}0e,0 4px 16px rgba(0,0,0,.55);
    }
    .dqgm-card--maint { opacity:.5; pointer-events:none; }

    /* scanline */
    .dqgm-scanline {
      position:absolute; inset:0; pointer-events:none; overflow:hidden; z-index:3;
      opacity:0; transition:opacity .3s;
    }
    .dqgm-card:not(.dqgm-card--maint):hover .dqgm-scanline { opacity:1; }
    .dqgm-scanline::after {
      content:''; position:absolute; left:0; right:0; height:1px;
      background:linear-gradient(90deg,transparent,${H$1.cyan}44,transparent);
      animation:dqgm-scan 3.5s linear infinite;
    }

    /* corner brackets */
    .dqgm-corner {
      position:absolute; width:12px; height:12px; pointer-events:none; z-index:4;
      transition:border-color .3s;
    }
    .dqgm-corner--tl { top:0; left:0;   border-top:1.5px solid ${H$1.cyan}35; border-left:1.5px solid ${H$1.cyan}35; }
    .dqgm-corner--tr { top:0; right:0;  border-top:1.5px solid ${H$1.cyan}35; border-right:1.5px solid ${H$1.cyan}35; }
    .dqgm-corner--bl { bottom:0; left:0;  border-bottom:1.5px solid ${H$1.cyan}35; border-left:1.5px solid ${H$1.cyan}35; }
    .dqgm-corner--br { bottom:0; right:0; border-bottom:1.5px solid ${H$1.cyan}35; border-right:1.5px solid ${H$1.cyan}35; }
    .dqgm-card:not(.dqgm-card--maint):hover .dqgm-corner { border-color:${H$1.cyan}bb; }

    /* ── Image ── */
    .dqgm-img-wrap {
      width:100%; aspect-ratio:16/9; position:relative; overflow:hidden;
      background:${H$1.panel}; flex-shrink:0;
    }
    .dqgm-img {
      width:100%; height:100%; object-fit:cover; display:block;
      filter:saturate(.8) brightness(.88);
      transition:transform .55s cubic-bezier(.22,1,.36,1),filter .4s;
    }
    .dqgm-card:not(.dqgm-card--maint):hover .dqgm-img { transform:scale(1.07); filter:saturate(1.1) brightness(.95); }
    .dqgm-card--maint .dqgm-img { filter:grayscale(.75) brightness(.5); }
    .dqgm-img-overlay {
      position:absolute; inset:0; pointer-events:none; z-index:1;
      background:linear-gradient(180deg,rgba(0,0,0,.05) 30%,rgba(13,13,26,.9) 100%);
    }
    .dqgm-shimmer {
      position:absolute; inset:0;
      background:linear-gradient(90deg,${H$1.card} 25%,${H$1.elevated} 50%,${H$1.card} 75%);
      background-size:200% 100%; animation:dqgm-shimmer 1.6s linear infinite;
    }
    .dqgm-img-fallback {
      width:100%; height:100%; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:8px;
      background:linear-gradient(135deg,${H$1.card},${H$1.panel});
    }
    .dqgm-fallback-lbl {
      font-family:'Share Tech Mono',monospace; font-size:0.52rem;
      letter-spacing:2px; color:${H$1.dim}; text-transform:uppercase;
    }

    /* price chip */
    .dqgm-price-chip {
      position:absolute; bottom:10px; right:10px; z-index:2;
      padding:4px 11px;
      background:rgba(10,10,20,.85);
      border:1px solid ${H$1.yellow}55;
      backdrop-filter:blur(6px);
      clip-path:polygon(7px 0%,100% 0%,calc(100% - 7px) 100%,0% 100%);
      font-family:'Orbitron',sans-serif; font-size:.72rem; font-weight:700; color:${H$1.yellow};
      white-space:nowrap;
    }
    .dqgm-price-chip span {
      font-family:'Share Tech Mono',monospace; font-size:.55rem; color:${H$1.muted}; margin-left:3px;
    }

    /* maintenance banner */
    .dqgm-maint-banner {
      position:absolute; top:0; left:0; right:0; z-index:5;
      display:flex; align-items:center; justify-content:center; gap:7px;
      padding:6px;
      background:repeating-linear-gradient(-45deg,rgba(255,0,110,.22) 0,rgba(255,0,110,.22) 10px,rgba(0,0,0,.1) 10px,rgba(0,0,0,.1) 20px);
      border-bottom:1px solid ${H$1.pink}44;
      font-family:'Share Tech Mono',monospace; font-size:.57rem;
      letter-spacing:2.5px; color:${H$1.pink}; text-transform:uppercase;
      animation:dqgm-flicker 6s infinite;
    }

    /* ── Card body ── */
    .dqgm-body { padding:14px 16px 0; flex:1; display:flex; flex-direction:column; }
    .dqgm-eyebrow { display:flex; align-items:center; gap:6px; margin-bottom:6px; }
    .dqgm-cat-dot {
      width:5px; height:5px; border-radius:50%;
      background:${H$1.cyan}; flex-shrink:0; box-shadow:0 0 6px ${H$1.cyan}99;
    }
    .dqgm-cat-lbl {
      font-family:'Share Tech Mono',monospace; font-size:.59rem;
      color:${H$1.cyan}; letter-spacing:1.5px; text-transform:uppercase;
    }
    .dqgm-name {
      font-family:'Orbitron',sans-serif; font-size:.86rem; font-weight:700;
      color:${H$1.text}; line-height:1.25; margin-bottom:7px; transition:color .25s;
    }
    .dqgm-card:not(.dqgm-card--maint):hover .dqgm-name { color:#fff; }
    .dqgm-desc {
      font-family:'Inter',sans-serif; font-size:.7rem;
      color:${H$1.muted}; line-height:1.55; margin-bottom:12px; flex:1;
      display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
    }

    /* ── Footer ── */
    .dqgm-footer {
      padding:12px 16px 14px; border-top:1px solid ${H$1.border};
      display:flex; flex-direction:column; gap:10px;
    }
    .dqgm-meta { display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .dqgm-id {
      font-family:'Share Tech Mono',monospace; font-size:.53rem;
      color:${H$1.muted}; letter-spacing:1px;
    }
    .dqgm-status {
      display:inline-flex; align-items:center; gap:4px;
      font-family:'Share Tech Mono',monospace; font-size:.55rem;
      letter-spacing:1.5px; text-transform:uppercase;
    }
    .dqgm-status-dot { width:5px; height:5px; border-radius:50%; }

    /* ── Book Now ── */
    .dqgm-book-btn {
      position:relative; width:100%; padding:10px 16px;
      background:linear-gradient(135deg,${H$1.cyan}18,${H$1.purple}28);
      border:1px solid ${H$1.cyan}60; color:${H$1.cyan};
      font-family:'Orbitron',sans-serif; font-size:.62rem; font-weight:700;
      letter-spacing:2.5px; text-transform:uppercase;
      clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
      cursor:pointer; outline:none; overflow:hidden;
      display:flex; align-items:center; justify-content:center; gap:8px;
      transition:background .25s,border-color .25s,color .25s,box-shadow .25s;
      animation:dqgm-btn-pulse 3s ease-in-out infinite;
    }
    .dqgm-book-btn::before {
      content:''; position:absolute; inset:0;
      background:linear-gradient(135deg,${H$1.cyan}00,${H$1.cyan}20,${H$1.cyan}00);
      transform:translateX(-100%);
      transition:transform .45s cubic-bezier(.22,1,.36,1);
    }
    .dqgm-book-btn:hover {
      background:linear-gradient(135deg,${H$1.cyan}28,${H$1.purple}40);
      border-color:${H$1.cyan}cc; color:#fff;
      box-shadow:0 0 24px ${H$1.cyan}30,inset 0 0 12px ${H$1.cyan}0f;
      animation:none;
    }
    .dqgm-book-btn:hover::before { transform:translateX(100%); }
    .dqgm-book-btn:focus-visible { outline:1px solid ${H$1.cyan}; outline-offset:3px; }
    .dqgm-book-btn:active { transform:scale(.98); }

    /* ── Empty state ── */
    .dqgm-empty {
      grid-column:1/-1; display:flex; flex-direction:column; align-items:center; gap:12px;
      padding:60px 24px; text-align:center;
      border:1px dashed ${H$1.border}; border-radius:4px;
    }
    .dqgm-empty-title {
      font-family:'Orbitron',sans-serif; font-size:.8rem; font-weight:700;
      color:${H$1.muted}; letter-spacing:2px; text-transform:uppercase;
    }
    .dqgm-empty-sub {
      font-family:'Share Tech Mono',monospace; font-size:.6rem;
      color:${H$1.muted}44; letter-spacing:1px;
    }
  `),
    document.head.appendChild(e);
}
var U$1 = {
  Controller: ({ size = 16, c = H$1.cyan }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 11h4M8 9v4M15 11h.01M17.5 13h.01" />
      <path d="M7.5 7h9a4 4 0 014 5.6l-1 3.2a2.5 2.5 0 01-4.4 1L14 15h-4l-1.1 1.8a2.5 2.5 0 01-4.4-1l-1-3.2A4 4 0 017.5 7z" />
    </svg>
  ),
  Wrench: ({ size = 11, c = H$1.pink }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  Joystick: ({ size = 32, c = H$1.dim }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="7" r="3" />
      <path d="M12 10v4M8 18h8a2 2 0 002-2v-2H6v2a2 2 0 002 2zM12 14v2" />
    </svg>
  ),
  AlertTriangle: ({ size = 30, c = H$1.dim }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill={c} stroke="none" />
    </svg>
  ),
  Calendar: ({ size = 12, c = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  ),
  ArrowRight: ({ size = 11, c = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
};
function Qt({ src, alt }) {
  let n = useRef(null),
    r = useInView(n, {
      once: true,
      margin: "120px",
    }),
    [i, a] = useState("idle");
  return (
    useEffect(() => {
      if (!r) return;
      if (!src) {
        a("error");
        return;
      }
      a("loading");
      let t = new window.Image();
      return (
        (t.src = src),
        (t.onload = () => a("loaded")),
        (t.onerror = () => a("error")),
        () => {
          (t.onload = null), (t.onerror = null);
        }
      );
    }, [r, src]),
    (
      <div ref={n} className="dqgm-img-wrap">
        {(i === "idle" || i === "loading") && <div className="dqgm-shimmer" aria-hidden="true" />}
        {i === "loaded" && (
          <motion.img
            src={src}
            alt={alt}
            className="dqgm-img"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
        {i === "error" && (
          <div className="dqgm-img-fallback">
            <U$1.Joystick size={32} c={H$1.dim} />
            <span className="dqgm-fallback-lbl">No Preview</span>
          </div>
        )}
        <div className="dqgm-img-overlay" aria-hidden="true" />
      </div>
    )
  );
}
function XT({ game, index, reducedMotion, onBook }) {
  let i = useRef(null),
    a = useInView(i, {
      once: true,
      margin: "60px",
    }),
    o = !!game.maintenance_mode;
  return (
    <motion.div
      ref={i}
      className={`dqgm-card${o ? " dqgm-card--maint" : ""}`}
      initial={{
        opacity: 0,
        y: 28,
      }}
      animate={
        a
          ? {
              opacity: 1,
              y: 0,
            }
          : {
              opacity: 0,
              y: 28,
            }
      }
      transition={{
        delay: reducedMotion ? 0 : index * 0.07,
        duration: reducedMotion ? 0.1 : 0.48,
        ease: [0.22, 1, 0.36, 1],
      }}
      role="article"
      aria-label={`${game.name}${o ? ", under maintenance" : ""}`}
    >
      {["tl", "tr", "bl", "br"].map((e) => (
        <div key={e} className={`dqgm-corner dqgm-corner--${e}`} aria-hidden="true" />
      ))}
      <div className="dqgm-scanline" aria-hidden="true" />
      {o && (
        <div className="dqgm-maint-banner" role="status">
          <U$1.Wrench size={11} c={H$1.pink} />
          {" Under Maintenance"}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <Qt src={game.image} alt={game.name} />
        <div className="dqgm-price-chip">
          {game.price_per_hour}
          {" INR"}
          <span>/hr</span>
        </div>
      </div>
      <div className="dqgm-body">
        {game.category_name && (
          <div className="dqgm-eyebrow">
            <div className="dqgm-cat-dot" aria-hidden="true" />
            <span className="dqgm-cat-lbl">{game.category_name}</span>
          </div>
        )}
        <div className="dqgm-name">{game.name}</div>
        {game.description && (
          <div className="dqgm-desc" title={game.description}>
            {game.description}
          </div>
        )}
      </div>
      <div className="dqgm-footer">
        <div className="dqgm-meta">
          <span className="dqgm-id">#{(game.id || "").slice(0, 8).toUpperCase()}</span>
          <span className="dqgm-status">
            <span
              className="dqgm-status-dot"
              style={{
                background: o ? H$1.pink : H$1.green,
                boxShadow: `0 0 6px ${o ? H$1.pink : H$1.green}`,
              }}
              aria-hidden="true"
            />
            <span style={{ color: o ? H$1.pink : H$1.green }}>{o ? "OFFLINE" : "LIVE"}</span>
          </span>
        </div>
        {!o && (
          <motion.button
            className="dqgm-book-btn"
            onClick={() => onBook?.(game)}
            whileTap={{ scale: 0.97 }}
            aria-label={`Book ${game.name}`}
          >
            <U$1.Calendar size={12} c="currentColor" />
            Book Now
            <U$1.ArrowRight size={11} c="currentColor" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
function XEn({ total, available }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -16,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{ duration: 0.4 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 3,
          height: "1.4em",
          borderRadius: 2,
          flexShrink: 0,
          background: `linear-gradient(180deg, ${H$1.cyan}, ${H$1.purple})`,
        }}
      />
      <U$1.Controller size={18} c={H$1.cyan} />
      <span
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(0.9rem, 2.2vw, 1.2rem)",
          fontWeight: 700,
          color: H$1.cyan,
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        Games
      </span>
      {total > 0 && (
        <span
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.62rem",
            letterSpacing: "1px",
            color: H$1.muted,
            marginLeft: 4,
          }}
        >
          {available}/{total}
          {" online"}
        </span>
      )}
    </motion.div>
  );
}
function XTn({ games }) {
  let t = games.filter((e) => !e.maintenance_mode).length;
  new Set(games.map((e) => e.category_name).filter(Boolean)).size;
  let n = games.length
    ? (games.reduce((e, t) => e + parseFloat(t.price_per_hour || 0), 0) / games.length).toFixed(0)
    : 0;
  games.length, games.length - t, `${n}`;
}
function XNn({ categories, counts, active, onChange }) {
  return (
    <motion.div
      className="dqgm-cats"
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        delay: 0.15,
      }}
      role="group"
      aria-label="Filter by category"
    >
      {categories.map((e) => (
        <button
          key={e}
          className={`dqgm-cat-btn${active === e ? " active" : ""}`}
          onClick={() => onChange(e)}
          aria-pressed={active === e}
        >
          {e}
          <span className="dqgm-cat-count">{counts[e] ?? 0}</span>
        </button>
      ))}
    </motion.div>
  );
}
function XRn({ label }) {
  return (
    <motion.div
      className="dqgm-empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      role="status"
    >
      <U$1.AlertTriangle size={32} c={H$1.dim} />
      <div className="dqgm-empty-title">{label}</div>
      <div className="dqgm-empty-sub">// no entries match this filter //</div>
    </motion.div>
  );
}
function DashboardGames({ games = [], onBook }) {
  let n = useReducedMotion(),
    [r, i] = useState("All"),
    a = useNavigate();
  useEffect(() => {
    Zt();
  }, []);
  let o = Array.isArray(games) ? games : [],
    { categories: s, counts: c } = useMemo(() => {
      let e = {};
      return (
        o.forEach((t) => {
          let n = t.category_name || "Other";
          e[n] = (e[n] || 0) + 1;
        }),
        {
          categories: ["All", ...Object.keys(e)],
          counts: {
            All: o.length,
            ...e,
          },
        }
      );
    }, [o]),
    l = useMemo(() => (r === "All" ? o : o.filter((e) => (e.category_name || "Other") === r)), [o, r]),
    u = useMemo(() => o.filter((e) => !e.maintenance_mode).length, [o]);
  return (
    useEffect(() => {
      s.includes(r) || i("All");
    }, [s, r]),
    o.length ? (
      <div className="dqgm-root">
        <XEn total={o.length} available={u} />
        <XTn games={o} />
        {s.length > 2 && <XNn categories={s} counts={c} active={r} onChange={i} />}
        <AnimatePresence mode="wait">
          <motion.div
            key={r}
            className="dqgm-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {l.length > 0 ? (
              l.map((e, t) => (
                <XT
                  key={e.id ?? t}
                  game={e}
                  index={t}
                  reducedMotion={n}
                  onBook={() => a(`/user/games/${e.id}`)}
                />
              ))
            ) : (
              <XRn label={`No ${r} Games`} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    ) : (
      <div className="dqgm-root">
        <XEn total={0} available={0} />
        <div className="dqgm-grid">
          <XRn label="No Games Available" />
        </div>
      </div>
    )
  );
}

export default DashboardGames;
