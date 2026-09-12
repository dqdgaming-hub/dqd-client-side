import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, animate } from "framer-motion";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500&display=swap";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:      "#060610",
  card:    "#0b0b1a",
  panel:   "#0e0e20",
  cyan:    "#00e5ff",
  pink:    "#ff2d78",
  yellow:  "#ffd60a",
  purple:  "#8b5cf6",
  green:   "#00ff94",
  text:    "#e2e2ff",
  muted:   "#5a5a80",
  dimmer:  "#2a2a45",
  // rgba helpers
  cyanDim:   "rgba(0,229,255,0.08)",
  cyanBdr:   "rgba(0,229,255,0.18)",
  cyanMid:   "rgba(0,229,255,0.35)",
  pinkDim:   "rgba(255,45,120,0.08)",
  purpleDim: "rgba(139,92,246,0.12)",
  yellowDim: "rgba(255,214,10,0.10)",
  greenDim:  "rgba(0,255,148,0.08)",
};

// ─── Inline global styles (injected once) ─────────────────────────────────────
const STYLE_ID = "dqw-v2-styles";
function injectGlobalStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    @import url('${FONT_URL}');
    *, *::before, *::after { box-sizing: border-box; }
    @keyframes dqw-scan {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes dqw-flicker {
      0%,100%{ opacity:1 } 92%{ opacity:1 } 93%{ opacity:0.3 } 95%{ opacity:1 }
    }
    @keyframes dqw-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes dqw-orbit {
      from { transform: rotate(0deg) translateX(20px) rotate(0deg); }
      to   { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
    }
    @keyframes dqw-pulse-glow {
      0%, 100% { box-shadow: 0 0 0 rgba(255,214,10,0); }
      50%      { box-shadow: 0 0 26px rgba(255,214,10,0.16); }
    }
    @keyframes dqw-coin-flip {
      0%, 100% { transform: rotateY(0deg) scale(1); }
      45%      { transform: rotateY(180deg) scale(1.08); }
      55%      { transform: rotateY(180deg) scale(1.08); }
    }
    @keyframes dqw-wiggle {
      0%, 100% { transform: rotate(0deg); }
      25%      { transform: rotate(-8deg); }
      75%      { transform: rotate(8deg); }
    }
    @keyframes dqw-shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(el);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function greetingByHour(h) {
  if (h < 5)  return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}
function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("") || "?";
}
function fmtTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const Ico = {
  Calendar: ({ c = T.cyan }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>
    </svg>
  ),
  Trophy: ({ c = T.pink }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 4h8v5a4 4 0 01-8 0V4z"/><path d="M8 5H5a2 2 0 002 4M16 5h3a2 2 0 01-2 4"/>
      <path d="M12 13v3M9 20h6"/><rect x="10" y="16" width="4" height="4" rx="0.5"/>
    </svg>
  ),
  Dice: ({ c = T.purple }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <circle cx="8.5" cy="8.5" r="1" fill={c}/><circle cx="15.5" cy="8.5" r="1" fill={c}/>
      <circle cx="8.5" cy="15.5" r="1" fill={c}/><circle cx="15.5" cy="15.5" r="1" fill={c}/>
      <circle cx="12" cy="12" r="1" fill={c}/>
    </svg>
  ),
  Coin: ({ c = T.yellow }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v10M9.5 9.5C9.5 8.1 10.6 7 12 7s2.5.9 2.5 2-1 1.5-2.5 2-2.5.6-2.5 2 1 2 2.5 2 2.5-.9 2.5-2"/>
    </svg>
  ),
  Close: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Signal: ({ c = T.cyan }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M1 6C1 6 5 2 12 2s11 4 11 4M5 10s2-2 7-2 7 2 7 2M9 14s1-1 3-1 3 1 3 1"/>
      <circle cx="12" cy="18" r="1" fill={c}/>
    </svg>
  ),
  User: ({ c = T.cyan }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

// ─── Lazy Avatar ─────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 48 }) {
  const [state, setState] = useState(src ? "loading" : "fallback");

  useEffect(() => {
    if (!src) { setState("fallback"); return; }
    setState("loading");
    const img = new window.Image();
    img.src = src;
    img.onload  = () => setState("loaded");
    img.onerror = () => setState("fallback");
    return () => { img.onload = null; img.onerror = null; };
  }, [src]);

  const text = initials(name);
  const s = size;

  return (
    <div style={{ width: s, height: s, borderRadius: "50%", position: "relative", flexShrink: 0 }}>
      {/* Rotating ring */}
      <svg
        width={s + 8} height={s + 8}
        style={{ position: "absolute", top: -4, left: -4, animation: "dqw-spin 8s linear infinite" }}
        aria-hidden="true"
      >
        <circle
          cx={(s + 8) / 2} cy={(s + 8) / 2} r={s / 2 + 2}
          fill="none"
          stroke={`url(#ring-grad-${s})`}
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
        <defs>
          <linearGradient id={`ring-grad-${s}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={T.cyan}/>
            <stop offset="50%" stopColor={T.purple}/>
            <stop offset="100%" stopColor={T.pink}/>
          </linearGradient>
        </defs>
      </svg>

      {/* Inner circle */}
      <div style={{
        width: s, height: s, borderRadius: "50%",
        background: T.card,
        border: `1.5px solid ${T.cyanBdr}`,
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        {state === "loading" && (
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(110deg, ${T.card} 25%, ${T.panel} 50%, ${T.card} 75%)`,
            backgroundSize: "200% 100%",
            animation: "dqw-scan 1.5s linear infinite",
          }} />
        )}
        {state === "loaded" && (
          <motion.img
            src={src} alt={name || "Avatar"}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {state === "fallback" && (
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: s * 0.3,
            fontWeight: 700,
            color: T.cyan,
            letterSpacing: "0.05em",
          }}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Animated scan line ───────────────────────────────────────────────────────
function ScanLine() {
  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden",
      pointerEvents: "none", borderRadius: "inherit", zIndex: 0,
    }}>
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        height: "1px",
        background: `linear-gradient(90deg, transparent, ${T.cyan}40, transparent)`,
        animation: "dqw-scan 4s linear infinite",
      }} />
    </div>
  );
}

// ─── Corner accents (clipped corners) ────────────────────────────────────────
function CornerAccents({ color = T.cyan, size = 10 }) {
  const style = (pos) => ({
    position: "absolute",
    width: size, height: size,
    pointerEvents: "none",
    ...pos,
  });
  const lineH = { position: "absolute", left: 0, right: 0, height: "1px", background: color };
  const lineV = { position: "absolute", top: 0, bottom: 0, width: "1px", background: color };
  return (
    <>
      <div style={style({ top: 0, left: 0 })}>
        <div style={{ ...lineH, top: 0 }} /><div style={{ ...lineV, left: 0 }} />
      </div>
      <div style={style({ top: 0, right: 0 })}>
        <div style={{ ...lineH, top: 0 }} /><div style={{ ...lineV, right: 0 }} />
      </div>
      <div style={style({ bottom: 0, left: 0 })}>
        <div style={{ ...lineH, bottom: 0 }} /><div style={{ ...lineV, left: 0 }} />
      </div>
      <div style={style({ bottom: 0, right: 0 })}>
        <div style={{ ...lineH, bottom: 0 }} /><div style={{ ...lineV, right: 0 }} />
      </div>
    </>
  );
}

// ─── Sparkle burst (decorative confetti of light) ─────────────────────────────
function Sparkle({ x, y, delay, size = 6, color = T.yellow }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0.3],
        y: [0, -10, -16, -20],
        rotate: [0, 40, 90],
      }}
      transition={{
        duration: 1.6,
        delay,
        repeat: Infinity,
        repeatDelay: 2.6,
        ease: "easeOut",
      }}
      style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 0l2.3 8.2L23 11l-8.7 2.8L12 22l-2.3-8.2L1 11l8.7-2.8z" />
      </svg>
    </motion.div>
  );
}

// ─── Count-up number, ticks up whenever the value changes ────────────────────
function CountUp({ value, reducedMotion }) {
  const [display, setDisplay] = useState(reducedMotion ? value : 0);
  const prevValue = useRef(reducedMotion ? value : 0);

  useEffect(() => {
    if (reducedMotion) { setDisplay(value); prevValue.current = value; return; }
    const controls = animate(prevValue.current, value, {
      duration: 1.15,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value, reducedMotion]);

  return <>{fmtNum(display)}</>;
}

// ─── Loyalty stat card — the hero of the panel ────────────────────────────────
function StatCard({ icon, label, value, accent, bg, delay = 0, reducedMotion }) {
  const [hovered, setHovered] = useState(false);
  const [popped, setPopped] = useState(false);

  const sparkles = useRef(
    Array.from({ length: 5 }).map((_, i) => ({
      x: `${8 + Math.random() * 78}%`,
      y: `${12 + Math.random() * 58}%`,
      delay: i * 0.4,
      size: 5 + Math.random() * 5,
    }))
  ).current;

  const handlePop = () => {
    if (popped) return;
    setPopped(true);
    setTimeout(() => setPopped(false), 650);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { delay, duration: reducedMotion ? 0.1 : 0.5, ease: [0.22, 1, 0.36, 1] } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onTap={handlePop}
      whileHover={reducedMotion ? {} : { y: -2 }}
      whileTap={reducedMotion ? {} : { scale: 0.97 }}
      style={{
        position: "relative",
        background: `linear-gradient(155deg, ${T.panel} 0%, ${T.card} 100%)`,
        border: `1px solid ${hovered ? accent + "70" : T.cyanBdr}`,
        borderRadius: "10px",
        padding: "11px 13px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        overflow: "hidden",
        width: "100%",
        transition: "border-color 0.25s",
        animation: reducedMotion ? "none" : "dqw-pulse-glow 3.4s ease-in-out infinite",
      }}
    >
      {/* Ambient hover glow */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(circle at 18% 45%, ${accent}22 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Diagonal shimmer sweep */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(100deg, transparent 40%, ${accent}14 50%, transparent 60%)`,
        backgroundSize: "250% 100%",
        animation: reducedMotion ? "none" : "dqw-shimmer 5s linear infinite",
        pointerEvents: "none",
      }} />

      {/* Sparkle field */}
      {!reducedMotion && sparkles.map((s, i) => (
        <Sparkle key={i} x={s.x} y={s.y} delay={s.delay} size={s.size} color={accent} />
      ))}

      {/* Coin well — flips like a tossed coin, wiggles on tap */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: bg,
        border: `1px solid ${accent}45`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        perspective: "200px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: "100%",
          animation: reducedMotion
            ? "none"
            : popped
              ? "dqw-wiggle 0.5s ease-in-out"
              : "dqw-coin-flip 3.8s ease-in-out infinite",
        }}>
          {icon}
        </div>

        {/* Tap pop ring */}
        <AnimatePresence>
          {popped && (
            <motion.div
              initial={{ opacity: 0.7, scale: 0.6 }}
              animate={{ opacity: 0, scale: 2.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: `1.5px solid ${accent}`,
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(0.95rem, 3vw, 1.15rem)",
          fontWeight: 900,
          color: T.text,
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}>
          <CountUp value={value} reducedMotion={reducedMotion} />
        </div>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.5rem",
          letterSpacing: "2px",
          color: T.muted,
          textTransform: "uppercase",
          marginTop: "3px",
        }}>
          {label}
        </div>
      </div>

      {/* Decorative trailing hint arrow */}
      <motion.div
        animate={reducedMotion ? {} : { x: [0, 4, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ marginLeft: "auto", color: accent, opacity: 0.55, position: "relative", zIndex: 1 }}
        aria-hidden="true"
      >
        <Ico.ChevronRight />
      </motion.div>
    </motion.div>
  );
}

// ─── Floating toast ───────────────────────────────────────────────────────────
function Toast({ user, greeting, firstName, onExpand, onDismiss, reducedMotion }) {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setProgress(0), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { duration: reducedMotion ? 0.1 : 0.5, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ x: 40, opacity: 0, transition: { duration: 0.3 } }}
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        right: "52px",
        top: "35%",
        transform: "translateY(-50%)",
        zIndex: 9999,
        width: "clamp(220px, 30vw, 280px)",
        background: T.card,
        border: `1px solid ${T.cyanBdr}`,
        borderRadius: "8px",
        padding: "14px 16px",
        overflow: "hidden",
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${T.cyanBdr}`,
      }}
    >
      <ScanLine />
      <CornerAccents color={T.cyan} size={8} />

      <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative", zIndex: 1 }}>
        <Avatar src={user?.profile_image} name={user?.full_name} size={38} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: T.cyan,
            marginBottom: "3px",
            animation: "dqw-flicker 6s ease-in-out infinite",
          }}>
            {greeting}, {firstName}
          </div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.6rem",
            color: T.muted,
            letterSpacing: "0.5px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            Dashboard ready
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          <button
            onClick={onExpand}
            aria-label="View details"
            style={{
              background: T.cyanDim, border: `1px solid ${T.cyanBdr}`,
              borderRadius: "4px", width: 26, height: 26,
              display: "grid", placeItems: "center",
              color: T.cyan, cursor: "pointer",
            }}
          >
            <Ico.ChevronRight />
          </button>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              background: "transparent", border: `1px solid ${T.dimmer}`,
              borderRadius: "4px", width: 26, height: 26,
              display: "grid", placeItems: "center",
              color: T.muted, cursor: "pointer",
            }}
          >
            <Ico.Close />
          </button>
        </div>
      </div>

      {/* Progress drain bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "2px", background: T.cyanDim,
      }}>
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 5, ease: "linear" }}
          onAnimationComplete={onDismiss}
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${T.cyan}, ${T.purple})`,
            transformOrigin: "left",
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Trigger tab — round, floating, and draggable along the edge ─────────────
function Tab({ onClick, panelOpen, reducedMotion }) {
  const y = useMotionValue(0);
  const [topPercent, setTopPercent] = useState(35);
  const [dragging, setDragging] = useState(false);

  const handleDragEnd = useCallback((_, info) => {
    setDragging(false);
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const deltaPercent = (info.offset.y / vh) * 100;
    const presets = [12, 30, 50, 70, 88];
    let candidate = topPercent + deltaPercent;
    candidate = Math.max(8, Math.min(92, candidate));
    const snapped = presets.reduce((a, b) => (Math.abs(b - candidate) < Math.abs(a - candidate) ? b : a));
    setTopPercent(snapped);
    animate(y, 0, { type: "spring", stiffness: 380, damping: 28 });
  }, [topPercent, y]);

  return (
    <motion.button
      onTap={onClick}
      drag="y"
      dragElastic={0.2}
      dragMomentum={false}
      dragConstraints={{ top: -260, bottom: 260 }}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      initial={{ x: 10, opacity: 0, scale: 0.6 }}
      animate={{ x: 0, opacity: 1, scale: 1, transition: { delay: 0.8, duration: 0.4 } }}
      whileHover={reducedMotion ? {} : { scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={panelOpen ? "Close profile panel" : "Open profile panel — drag to reposition"}
      aria-expanded={panelOpen}
      style={{
        position: "fixed",
        right: "10px",
        top: `calc(${topPercent}% - 21px)`,
        y,
        zIndex: 9998,
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: panelOpen
          ? `radial-gradient(circle at 32% 28%, ${T.cyan}30, ${T.card} 72%)`
          : `radial-gradient(circle at 32% 28%, ${T.panel}, ${T.card} 75%)`,
        border: `1.5px solid ${panelOpen ? T.cyanMid : T.cyanBdr}`,
        display: "grid",
        placeItems: "center",
        cursor: dragging ? "grabbing" : "grab",
        color: T.cyan,
        boxShadow: panelOpen
          ? "0 0 24px rgba(0,229,255,0.32), 0 4px 18px rgba(0,0,0,0.55)"
          : "0 0 14px rgba(0,229,255,0.14), 0 4px 18px rgba(0,0,0,0.55)",
        transition: "background 0.22s, box-shadow 0.22s, border-color 0.22s",
        touchAction: "none",
      }}
    >
      {/* Orbiting dashed ring accessory */}
      <svg
        width={50} height={50}
        style={{ position: "absolute", top: -4, left: -4, animation: reducedMotion ? "none" : "dqw-spin 9s linear infinite" }}
        aria-hidden="true"
      >
        <circle cx={25} cy={25} r={21} fill="none" stroke="url(#tab-ring-grad)" strokeWidth="1.1" strokeDasharray="3 5" />
        <defs>
          <linearGradient id="tab-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={T.cyan}/>
            <stop offset="100%" stopColor={T.pink}/>
          </linearGradient>
        </defs>
      </svg>

      {/* Idle radar ping so it reads as alive & grabbable */}
      {!panelOpen && !dragging && !reducedMotion && (
        <motion.span
          aria-hidden="true"
          animate={{ scale: [1, 1.55], opacity: [0.35, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `1px solid ${T.cyan}`, pointerEvents: "none",
          }}
        />
      )}

      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          width: 18,
          height: 18,
          objectFit: "contain",
          pointerEvents: "none",
          filter: panelOpen
            ? "brightness(0) saturate(100%) invert(83%) sepia(76%) saturate(400%) hue-rotate(155deg) brightness(105%)"
            : "brightness(0) invert(1) opacity(0.85)",
          transition: "filter 0.22s",
        }}
      />

      {/* Grip dots — hints that this button can be dragged */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", bottom: 4,
          display: "flex", gap: 2, pointerEvents: "none",
        }}
      >
        <span style={{ width: 2, height: 2, borderRadius: "50%", background: T.muted }} />
        <span style={{ width: 2, height: 2, borderRadius: "50%", background: T.muted }} />
        <span style={{ width: 2, height: 2, borderRadius: "50%", background: T.muted }} />
      </div>
    </motion.button>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function Panel({ user, stats, greeting, reducedMotion, onClose }) {
  const firstName = user?.full_name?.split(" ")[0] || "Player";
  const hour = new Date().getHours();

  const statItems = [
    // { key: "bookings", label: "Bookings",    value: stats?.total_bookings  ?? 0, Icon: Ico.Calendar, accent: T.cyan,   bg: T.cyanDim   },
    // { key: "events",   label: "Events",      value: stats?.total_events    ?? 0, Icon: Ico.Trophy,   accent: T.pink,   bg: T.pinkDim   },
    // { key: "spins",    label: "Spins",       value: stats?.total_spins     ?? 0, Icon: Ico.Dice,     accent: T.purple, bg: T.purpleDim },
    { key: "points",   label: "Loyalty pts", value: stats?.loyalty_points ?? user?.loyalty_points ?? 0, Icon: Ico.Coin, accent: T.yellow, bg: T.yellowDim },
  ];

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-80, 80], [3, -3]);
  const rotY = useTransform(mx, [-120, 120], [-3, 3]);

  const handleMouseMove = useCallback((e) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left - rect.width  / 2);
    my.set(e.clientY - rect.top  - rect.height / 2);
  }, [mx, my, reducedMotion]);

  const handleMouseLeave = useCallback(() => {
    mx.set(0); my.set(0);
  }, [mx, my]);

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { duration: reducedMotion ? 0.1 : 0.42, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ x: 40, opacity: 0, transition: { duration: 0.25 } }}
      role="dialog"
      aria-modal="false"
      aria-label="Profile panel"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "fixed",
        right: "44px",
        top: "35%",
        transform: "translateY(-50%)",
        zIndex: 9997,
        width: "clamp(270px, 28vw, 320px)",
        maxWidth: "calc(100vw - 56px)",
        background: T.card,
        border: `1px solid ${T.cyanBdr}`,
        borderRadius: "10px 0 0 10px",
        overflow: "hidden",
        boxShadow: `-6px 0 40px rgba(0,0,0,0.7), 0 0 0 1px ${T.cyanBdr}`,
      }}
    >
      {/* Tilt wrapper */}
      <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}>

        {/* Decorative: ambient glow top-left */}
        <div style={{
          position: "absolute", top: -30, left: -30,
          width: 120, height: 120, borderRadius: "50%",
          background: `radial-gradient(circle, ${T.cyan}12 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <ScanLine />
        <CornerAccents color={T.cyan} size={12} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, padding: "20px 18px 16px" }}>

          {/* Close */}
          <motion.button
            onClick={onClose}
            whileHover={{ color: T.pink }}
            aria-label="Close panel"
            style={{
              position: "absolute", top: 12, right: 12,
              background: "transparent", border: "none",
              color: T.muted, cursor: "pointer",
              display: "grid", placeItems: "center",
              width: 26, height: 26,
              borderRadius: "4px",
              transition: "color 0.2s",
            }}
          >
            <Ico.Close />
          </motion.button>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
            <Avatar src={user?.profile_image} name={user?.full_name} size={52} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.55rem",
                letterSpacing: "3px",
                color: T.muted,
                textTransform: "uppercase",
                marginBottom: "4px",
              }}>
                {greeting}
              </div>
              <div style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(0.82rem, 2vw, 0.96rem)",
                fontWeight: 700,
                color: T.text,
                lineHeight: 1.15,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {user?.full_name || "Player"}
              </div>
              {user?.email && (
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.58rem",
                  color: T.muted,
                  marginTop: "4px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {user.email}
                </div>
              )}
            </div>
          </div>

          {/* Divider with label */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: T.cyanBdr }} />
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.52rem",
              letterSpacing: "2.5px",
              color: T.muted,
              textTransform: "uppercase",
            }}>
              Activity
            </span>
            <div style={{ flex: 1, height: "1px", background: T.cyanBdr }} />
          </div>

          {/* Stats — just the loyalty points hero card */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", marginBottom: "14px" }}>
            {statItems.map((s, i) => (
              <StatCard
                key={s.key}
                icon={<s.Icon c={s.accent} />}
                label={s.label}
                value={s.value}
                accent={s.accent}
                bg={s.bg}
                delay={i * 0.06}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>

          {/* Footer: status row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "10px",
            borderTop: `1px solid ${T.cyanBdr}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Ico.Signal />
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.55rem",
                letterSpacing: "1.5px",
                color: T.muted,
                textTransform: "uppercase",
              }}>
                Online
              </span>
            </div>
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.55rem",
              letterSpacing: "1px",
              color: T.muted,
            }}>
              {fmtTime(new Date())}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function DashboardWelcome({ user, stats }) {
  const reducedMotion = useReducedMotion();

  const [panelOpen,    setPanelOpen]    = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => { injectGlobalStyles(); }, []);

  // Auto-show toast after mount
  useEffect(() => {
    const t = setTimeout(() => setToastVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  const greeting  = greetingByHour(new Date().getHours());
  const firstName = user?.full_name?.split(" ")[0] || "Player";

  const openPanel = () => {
    setToastVisible(false);
    setPanelOpen(true);
  };

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toastVisible && !panelOpen && (
          <Toast
            user={user}
            greeting={greeting}
            firstName={firstName}
            onExpand={openPanel}
            onDismiss={() => setToastVisible(false)}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {panelOpen && (
          <Panel
            user={user}
            stats={stats}
            greeting={greeting}
            reducedMotion={reducedMotion}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Persistent trigger tab — round, floating, draggable to reposition */}
      <Tab
        onClick={panelOpen ? () => setPanelOpen(false) : openPanel}
        panelOpen={panelOpen}
        reducedMotion={reducedMotion}
      />
    </>
  );
}