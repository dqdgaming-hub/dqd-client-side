import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:         "#060610",
  card:       "#0b0b1a",
  panel:      "#0e0e20",
  glass:      "rgba(14,14,32,0.72)",
  cyan:       "#00e5ff",
  pink:       "#ff2d78",
  yellow:     "#ffd60a",
  purple:     "#8b5cf6",
  green:      "#00ff94",
  red:        "#ff3b3b",
  text:       "#e2e2ff",
  muted:      "#5a5a80",
  dimmer:     "#1e1e35",
  cyanDim:    "rgba(0,229,255,0.07)",
  cyanBdr:    "rgba(0,229,255,0.16)",
  cyanGlow:   "rgba(0,229,255,0.22)",
  pinkDim:    "rgba(255,45,120,0.08)",
  yellowDim:  "rgba(255,214,10,0.08)",
  greenDim:   "rgba(0,255,148,0.08)",
  redDim:     "rgba(255,59,59,0.08)",
  purpleDim:  "rgba(139,92,246,0.10)",
};

const STYLE_ID = "dqbk-v3";
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    @keyframes dqbk-scan {
      0%   { transform: translateY(-120%); }
      100% { transform: translateY(600px); }
    }
    @keyframes dqbk-shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes dqbk-pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(0,229,255,0.25); }
      70%  { box-shadow: 0 0 0 8px rgba(0,229,255,0); }
      100% { box-shadow: 0 0 0 0 rgba(0,229,255,0); }
    }
    @keyframes dqbk-ticker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes dqbk-flicker {
      0%,100% { opacity: 1; } 92% { opacity: 1; } 93% { opacity: 0.7; } 96% { opacity: 1; }
    }
    .dqbk-row-hover:hover { background: rgba(0,229,255,0.04) !important; }
    .dqbk-row-hover:hover td { color: #e2e2ff; }
  `;
  document.head.appendChild(el);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "--";
  const dt = new Date(`${d}T00:00:00`);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(t) {
  if (!t) return "--";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  if (isNaN(hour)) return t;
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}
function relativeLabel(d) {
  if (!d) return null;
  const target = new Date(`${d}T00:00:00`);
  const today  = new Date(); today.setHours(0, 0, 0, 0);
  const diff   = Math.round((target - today) / 86400000);
  if (diff === 0)             return "TODAY";
  if (diff === 1)             return "TOMORROW";
  if (diff > 1 && diff <= 6) return `IN ${diff} DAYS`;
  return null;
}
function statusColor(s) {
  switch ((s || "").toLowerCase()) {
    case "confirmed": return { accent: T.green,  dim: T.greenDim };
    case "completed": return { accent: T.cyan,   dim: T.cyanDim  };
    case "pending":   return { accent: T.yellow, dim: T.yellowDim };
    case "cancelled": return { accent: T.red,    dim: T.redDim   };
    default:          return { accent: T.muted,  dim: "rgba(90,90,128,0.12)" };
  }
}
function paymentColor(s) {
  switch ((s || "").toLowerCase()) {
    case "paid":
    case "completed": return { accent: T.green,  dim: T.greenDim  };
    case "pending":   return { accent: T.yellow, dim: T.yellowDim };
    case "failed":    return { accent: T.red,    dim: T.redDim    };
    case "refunded":  return { accent: T.purple, dim: T.purpleDim };
    default:          return { accent: T.muted,  dim: "rgba(90,90,128,0.12)" };
  }
}
function membersDisplay(members) {
  if (!Array.isArray(members) || members.length === 0) return "Solo";
  return members.map(m => m.name).join(", ");
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ico = {
  Ticket: ({ c = T.cyan, size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9a2 2 0 100 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 100-4V6a2 2 0 00-2-2H5a2 2 0 00-2 2v3z"/>
      <path d="M14 4v16" strokeDasharray="2 3"/>
    </svg>
  ),
  Controller: ({ c = T.muted, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 11h4M8 9v4M15 11h.01M17.5 13h.01"/>
      <path d="M7.5 7h9a4 4 0 014 5.6l-1 3.2a2.5 2.5 0 01-4.4 1L14 15h-4l-1.1 1.8a2.5 2.5 0 01-4.4-1l-1-3.2A4 4 0 017.5 7z"/>
    </svg>
  ),
  Calendar: ({ c = "currentColor", size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>
    </svg>
  ),
  Clock: ({ c = "currentColor", size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
    </svg>
  ),
  Check: ({ c = T.green, size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.3 2.3L16 10"/>
    </svg>
  ),
  X: ({ c = T.red, size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/>
    </svg>
  ),
  Coin: ({ c = T.yellow, size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v10M9.5 9.5C9.5 8.1 10.6 7 12 7s2.5.9 2.5 2-1 1.5-2.5 2-2.5.6-2.5 2 1 2 2.5 2 2.5-.9 2.5-2"/>
    </svg>
  ),
  Chevron: ({ c = T.muted, size = 14, up }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: up ? "rotate(180deg)" : "none" }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Users: ({ c = T.purple, size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Qr: ({ c = T.cyan, size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path d="M14 14h.01M14 18h3M18 14v7M17 14h.01"/>
    </svg>
  ),
  Lightning: ({ c = T.yellow, size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={c} stroke="none" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9z"/>
    </svg>
  ),
};

// ─── Corner brackets ──────────────────────────────────────────────────────────
function Corners({ color = T.cyanBdr, size = 10 }) {
  const s = { position: "absolute", pointerEvents: "none" };
  const h = { position: "absolute", height: "1px", background: color, width: size };
  const v = { position: "absolute", width: "1px", background: color, height: size };
  return (
    <>
      <div style={{ ...s, top: 0, left: 0 }}><div style={{ ...h, top: 0, left: 0 }}/><div style={{ ...v, top: 0, left: 0 }}/></div>
      <div style={{ ...s, top: 0, right: 0 }}><div style={{ ...h, top: 0, right: 0 }}/><div style={{ ...v, top: 0, right: 0 }}/></div>
      <div style={{ ...s, bottom: 0, left: 0 }}><div style={{ ...h, bottom: 0, left: 0 }}/><div style={{ ...v, bottom: 0, left: 0 }}/></div>
      <div style={{ ...s, bottom: 0, right: 0 }}><div style={{ ...h, bottom: 0, right: 0 }}/><div style={{ ...v, bottom: 0, right: 0 }}/></div>
    </>
  );
}

// ─── Scan line ────────────────────────────────────────────────────────────────
function ScanLine({ color = T.cyan, duration = "6s" }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }} aria-hidden="true">
      <div style={{
        position: "absolute", left: 0, right: 0, height: "1px",
        background: `linear-gradient(90deg, transparent 0%, ${color}28 40%, ${color}55 50%, ${color}28 60%, transparent 100%)`,
        animation: `dqbk-scan ${duration} linear infinite`,
      }}/>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ accent, dim, icon, children, size = "sm" }) {
  const fs = size === "lg" ? "0.65rem" : "0.57rem";
  const px = size === "lg" ? "10px 14px" : "3px 9px";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: px,
      background: dim,
      border: `1px solid ${accent}45`,
      borderRadius: "2px",
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: fs, letterSpacing: "1.5px",
      textTransform: "uppercase", color: accent, whiteSpace: "nowrap",
    }}>
      {icon}{children}
    </span>
  );
}

// ─── Lazy image ───────────────────────────────────────────────────────────────
function LazyImg({ src, alt, style, fallbackSize = 20 }) {
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
  return (
    <div style={{ position: "relative", overflow: "hidden", background: T.card, ...style }}>
      {state === "loading" && (
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(90deg, ${T.card} 25%, ${T.panel} 50%, ${T.card} 75%)`,
          backgroundSize: "200% 100%", animation: "dqbk-shimmer 1.6s linear infinite",
        }}/>
      )}
      {state === "loaded" && (
        <motion.img src={src} alt={alt}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
      {state === "fallback" && (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${T.card}, ${T.panel})` }}>
          <Ico.Controller c={T.dimmer} size={fallbackSize}/>
        </div>
      )}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, children, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}
    >
      {/* Left accent stack */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
        <div style={{ width: 3, height: 14, background: T.cyan, borderRadius: 2 }}/>
        <div style={{ width: 3, height: 6,  background: T.purple, borderRadius: 2 }}/>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon}
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)",
          fontWeight: 700, color: T.cyan,
          letterSpacing: "3px", textTransform: "uppercase",
          animation: "dqbk-flicker 8s ease-in-out infinite",
        }}>
          {children}
        </span>
        {sub && (
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.62rem", letterSpacing: "2px",
            color: T.muted, textTransform: "uppercase",
            borderLeft: `1px solid ${T.cyanBdr}`, paddingLeft: 10,
          }}>
            {sub}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Data label+value pair ────────────────────────────────────────────────────
function DataField({ label, value, accent, icon }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "0.52rem", letterSpacing: "2.5px",
        color: T.muted, textTransform: "uppercase",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        {icon}{label}
      </div>
      <div style={{
        fontFamily: accent ? "'Orbitron', sans-serif" : "'Share Tech Mono', monospace",
        fontSize: accent ? "0.88rem" : "0.76rem",
        fontWeight: accent ? 700 : 400,
        color: accent || T.text,
        lineHeight: 1.2,
      }}>
        {value || "--"}
      </div>
    </div>
  );
}

// ─── Upcoming hero ────────────────────────────────────────────────────────────
function UpcomingCard({ booking, reducedMotion }) {
  const sc   = statusColor(booking.status);
  const pc   = paymentColor(booking.payment_status);
  const when = relativeLabel(booking.booking_date);
  const name = booking.item_name || "Gaming Session";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.1 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "relative", marginBottom: 36 }}
    >
      {/* Hero image strip */}
      <div style={{
        position: "relative",
        height: "clamp(180px, 28vw, 280px)",
        borderRadius: "6px 6px 0 0",
        overflow: "hidden",
        border: `1px solid ${T.cyanBdr}`,
        borderBottom: "none",
      }}>
        <LazyImg src={booking.item_image} alt={name}
          style={{ width: "100%", height: "100%" }} fallbackSize={40}/>

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `
            linear-gradient(0deg, rgba(6,6,16,1) 0%, rgba(6,6,16,0.6) 40%, rgba(6,6,16,0.1) 100%),
            linear-gradient(90deg, rgba(6,6,16,0.8) 0%, transparent 50%)
          `,
        }}/>

        {/* Scan line on image */}
        <ScanLine color={T.cyan} duration="8s"/>

        {/* "NEXT SESSION" eyebrow — top-left */}
        <div style={{
          position: "absolute", top: 16, left: 16,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc.accent, animation: "dqbk-pulse-ring 2s ease-out infinite" }}/>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.6rem", letterSpacing: "3px",
            color: T.muted, textTransform: "uppercase",
          }}>
            Next Session
          </span>
        </div>

        {/* Relative time badge */}
        {when && (
          <div style={{
            position: "absolute", top: 14, right: 16,
            background: T.cyan, color: T.bg,
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "0.55rem", fontWeight: 700, letterSpacing: "2px",
            padding: "4px 12px",
            clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
          }}>
            {when}
          </div>
        )}

        {/* Bottom-left: event name overlaid on image */}
        <div style={{ position: "absolute", bottom: 18, left: 18, right: "30%", zIndex: 2 }}>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(1rem, 3.5vw, 1.6rem)",
            fontWeight: 900, color: T.text,
            lineHeight: 1.1, textShadow: `0 0 30px ${T.cyan}50`,
            animation: "dqbk-flicker 10s ease-in-out infinite",
          }}>
            {name}
          </div>
          <div style={{
            marginTop: 4,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.62rem", letterSpacing: "2.5px",
            color: T.cyan, textTransform: "uppercase",
          }}>
            {booking.booking_id}
          </div>
        </div>

        {/* Amount — bottom right of image */}
        <div style={{
          position: "absolute", bottom: 16, right: 16,
          display: "flex", alignItems: "flex-end", gap: 4,
        }}>
          <Ico.Coin c={T.yellow} size={16}/>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            fontWeight: 900, color: T.yellow,
            textShadow: `0 0 20px ${T.yellow}60`,
          }}>
            {booking.total_amount}
          </span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: T.muted, paddingBottom: 2 }}>INR</span>
        </div>
      </div>

      {/* Bottom info bar */}
      <div style={{
        position: "relative",
        background: T.card,
        border: `1px solid ${T.cyanBdr}`,
        borderTop: `1px solid rgba(0,229,255,0.08)`,
        borderRadius: "0 0 6px 6px",
        padding: "clamp(14px, 2.5vw, 20px) clamp(16px, 3vw, 24px)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "16px 24px",
        alignItems: "center",
      }}>
        <Corners size={8}/>

        {/* Date */}
        <DataField
          label="Date"
          value={formatDate(booking.booking_date)}
          icon={<Ico.Calendar c={T.cyan}/>}
        />

        {/* Time */}
        <DataField
          label="Time"
          value={`${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`}
          icon={<Ico.Clock c={T.purple}/>}
        />

        {/* Players */}
        <DataField
          label="Players"
          value={membersDisplay(booking.members)}
          icon={<Ico.Users c={T.purple}/>}
        />

        {/* Status badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.52rem", letterSpacing: "2.5px", color: T.muted, textTransform: "uppercase", marginBottom: 2 }}>Status</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            <Badge accent={sc.accent} dim={sc.dim}>{booking.status}</Badge>
            <Badge accent={pc.accent} dim={pc.dim}>{booking.payment_status}</Badge>
          </div>
        </div>

        {/* QR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.52rem", letterSpacing: "2.5px", color: T.muted, textTransform: "uppercase", marginBottom: 2 }}>QR Code</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Ico.Qr c={booking.is_qr_valid ? T.green : T.red}/>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.65rem", letterSpacing: "1px",
              color: booking.is_qr_valid ? T.green : T.red,
            }}>
              {booking.is_qr_valid ? "VALID" : "INVALID"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Divider with label ───────────────────────────────────────────────────────
function Divider({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${T.cyanBdr}, transparent)` }}/>
      <span style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "0.58rem", letterSpacing: "3px",
        color: T.muted, textTransform: "uppercase", whiteSpace: "nowrap",
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(270deg, ${T.cyanBdr}, transparent)` }}/>
    </div>
  );
}

// ─── Desktop expandable row ───────────────────────────────────────────────────
function BookingRow({ b, idx, reducedMotion }) {
  const [open, setOpen] = useState(false);
  const sc   = statusColor(b.status);
  const pc   = paymentColor(b.payment_status);
  const name = b.item_name || "Gaming Session";

  return (
    <>
      <motion.tr
        className="dqbk-row-hover"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.045, duration: 0.3 } }}
        onClick={() => setOpen(v => !v)}
        style={{
          cursor: "pointer",
          background: open ? "rgba(0,229,255,0.04)" : "transparent",
          transition: "background 0.2s",
          borderBottom: `1px solid ${T.cyanBdr}`,
        }}
      >
        {/* Item */}
        <td style={{ padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <LazyImg src={b.item_image} alt={name} style={{ width: 36, height: 36, borderRadius: 4 }} fallbackSize={13}/>
              {open && <div style={{ position: "absolute", inset: 0, borderRadius: 4, border: `1px solid ${T.cyan}` }}/>}
            </div>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.73rem", color: T.text }}>{name}</span>
          </div>
        </td>
        {/* ID */}
        <td style={{ padding: "10px 12px" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.68rem", color: T.cyan }}>{b.booking_id}</span>
        </td>
        {/* Date */}
        <td style={{ padding: "10px 12px" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.68rem", color: `${T.text}99`, display: "flex", alignItems: "center", gap: 5 }}>
            <Ico.Calendar c={T.cyan}/>{formatDate(b.booking_date)}
          </span>
        </td>
        {/* Time */}
        <td style={{ padding: "10px 12px" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.68rem", color: `${T.text}88` }}>
            {formatTime(b.start_time)}–{formatTime(b.end_time)}
          </span>
        </td>
        {/* Status */}
        <td style={{ padding: "10px 12px" }}><Badge accent={sc.accent} dim={sc.dim}>{b.status}</Badge></td>
        {/* Payment */}
        <td style={{ padding: "10px 12px" }}><Badge accent={pc.accent} dim={pc.dim}>{b.payment_status}</Badge></td>
        {/* QR */}
        <td style={{ padding: "10px 12px" }}>
          {b.is_qr_valid ? <Ico.Check c={T.green}/> : <Ico.X c={T.red}/>}
        </td>
        {/* Amount */}
        <td style={{ padding: "10px 12px" }}>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.82rem", fontWeight: 700, color: T.yellow }}>{b.total_amount} <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: T.muted, fontWeight: 400 }}>INR</span></span>
        </td>
        {/* Chevron */}
        <td style={{ padding: "10px 10px", textAlign: "center" }}>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
            <Ico.Chevron c={open ? T.cyan : T.muted}/>
          </motion.div>
        </td>
      </motion.tr>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.tr key="exp"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <td colSpan={9} style={{ padding: 0 }}>
              <motion.div
                initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{
                  padding: "14px 16px 16px 62px",
                  background: T.panel,
                  borderBottom: `1px solid ${T.cyanBdr}`,
                  borderLeft: `2px solid ${T.cyan}30`,
                  display: "flex", gap: 32, flexWrap: "wrap",
                }}>
                  {[
                    { label: "Players",    value: membersDisplay(b.members) },
                    { label: "Base price", value: b.base_price ? `${b.base_price} INR` : "--" },
                    { label: "Discount",   value: b.discount_price ? `${b.discount_price} INR` : "--" },
                    { label: "Created",    value: b.created_at ? new Date(b.created_at).toLocaleDateString("en-GB") : "--" },
                  ].map(({ label, value }) => (
                    <DataField key={label} label={label} value={value}/>
                  ))}
                </div>
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Desktop table ────────────────────────────────────────────────────────────
function BookingsTable({ items, reducedMotion }) {
  const COLS = ["Item", "Booking ID", "Date", "Time", "Status", "Payment", "QR", "Amount", ""];
  return (
    <div style={{
      width: "100%", overflowX: "auto",
      position: "relative",
      background: T.card,
      border: `1px solid ${T.cyanBdr}`,
      borderRadius: "6px",
    }}>
      <Corners size={12}/>
      <ScanLine color={T.purple} duration="10s"/>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720, position: "relative", zIndex: 1 }}>
        <thead>
          <tr>
            {COLS.map((h, i) => (
              <th key={i} style={{
                textAlign: "left", padding: "10px 12px",
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.56rem", letterSpacing: "2px",
                color: T.muted, textTransform: "uppercase",
                borderBottom: `1px solid ${T.cyanBdr}`,
                background: T.panel,
                whiteSpace: "nowrap",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((b, i) => (
            <BookingRow key={b.id ?? i} b={b} idx={i} reducedMotion={reducedMotion}/>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Mobile booking card ──────────────────────────────────────────────────────
function BookingCard({ b, idx, reducedMotion }) {
  const [open, setOpen] = useState(false);
  const sc   = statusColor(b.status);
  const pc   = paymentColor(b.payment_status);
  const name = b.item_name || "Gaming Session";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.065, duration: 0.38 } }}
      style={{
        position: "relative",
        background: T.card,
        border: `1px solid ${T.cyanBdr}`,
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <Corners size={8}/>

      {/* Left accent bar keyed to status */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
        background: sc.accent, opacity: 0.7,
      }}/>

      {/* Header row */}
      <div style={{ display: "flex", gap: 12, padding: "14px 14px 10px 18px", alignItems: "flex-start" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <LazyImg src={b.item_image} alt={name}
            style={{ width: 46, height: 46, borderRadius: 4 }} fallbackSize={16}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", fontWeight: 700, color: T.text, marginBottom: 3, lineHeight: 1.2 }}>{name}</div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.59rem", color: T.cyan, letterSpacing: "1px" }}>{b.booking_id}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.9rem", fontWeight: 700, color: T.yellow }}>{b.total_amount}</div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.52rem", color: T.muted, letterSpacing: "1px" }}>INR</div>
        </div>
      </div>

      {/* Meta strip */}
      <div style={{
        padding: "0 14px 10px 18px",
        display: "flex", gap: 16, flexWrap: "wrap",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Share Tech Mono', monospace", fontSize: "0.66rem", color: `${T.text}88` }}>
          <Ico.Calendar c={T.cyan}/>{formatDate(b.booking_date)}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Share Tech Mono', monospace", fontSize: "0.66rem", color: `${T.text}88` }}>
          <Ico.Clock c={T.purple}/>{formatTime(b.start_time)}–{formatTime(b.end_time)}
        </span>
      </div>

      {/* Badge row */}
      <div style={{
        padding: "0 14px 12px 18px",
        display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center",
      }}>
        <Badge accent={sc.accent} dim={sc.dim}>{b.status}</Badge>
        <Badge accent={pc.accent} dim={pc.dim}>{b.payment_status}</Badge>
        {b.is_qr_valid
          ? <Badge accent={T.green} dim={T.greenDim} icon={<Ico.Check c={T.green} size={11}/>}>QR OK</Badge>
          : <Badge accent={T.red}   dim={T.redDim}   icon={<Ico.X c={T.red} size={11}/>}>QR Fail</Badge>
        }
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", padding: "6px 14px",
          background: open ? `${T.cyan}10` : T.dimmer,
          border: "none", borderTop: `1px solid ${T.cyanBdr}`,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          fontFamily: "'Share Tech Mono', monospace", fontSize: "0.57rem", letterSpacing: "2px",
          color: open ? T.cyan : T.muted, cursor: "pointer", textTransform: "uppercase",
          transition: "background 0.2s, color 0.2s",
        }}
      >
        {open ? "COLLAPSE" : "EXPAND"}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <Ico.Chevron c={open ? T.cyan : T.muted} size={12}/>
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "12px 14px 14px 18px",
              background: T.panel,
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "12px 16px",
              borderTop: `1px solid ${T.cyanBdr}`,
            }}>
              {[
                { label: "Players",    value: membersDisplay(b.members) },
                { label: "Base price", value: b.base_price ? `${b.base_price} INR` : "--" },
                { label: "Discount",   value: b.discount_price ? `${b.discount_price} INR` : "--" },
                { label: "Created",    value: b.created_at ? new Date(b.created_at).toLocaleDateString("en-GB") : "--" },
              ].map(({ label, value }) => (
                <DataField key={label} label={label} value={value}/>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── useIsMobile ──────────────────────────────────────────────────────────────
function useIsMobile(bp = 760) {
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < bp : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`);
    const fn  = (e) => setMobile(e.matches);
    mq.addEventListener("change", fn);
    setMobile(mq.matches);
    return () => mq.removeEventListener("change", fn);
  }, [bp]);
  return mobile;
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        padding: "30px 20px", textAlign: "center",
        border: `1px dashed ${T.cyanBdr}`, borderRadius: "4px",
        marginBottom: 24, position: "relative",
      }}
    >
      <Ico.Controller c={T.dimmer} size={28}/>
      <div style={{ marginTop: 10, fontFamily: "'Share Tech Mono', monospace", fontSize: "0.7rem", letterSpacing: "1.5px", color: T.muted }}>
        {message}
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardBookings({ upcoming, recent = [] }) {
  const reducedMotion = useReducedMotion();
  const isMobile     = useIsMobile();
  const safeRecent   = Array.isArray(recent) ? recent : [];

  useEffect(() => { injectStyles(); }, []);

  return (
    <div style={{ width: "100%", color: T.text }}>
      <SectionHeader icon={<Ico.Ticket c={T.cyan} size={18}/>} sub={`${safeRecent.length} PAST`}>
        My Bookings
      </SectionHeader>

      {upcoming
        ? <UpcomingCard booking={upcoming} reducedMotion={reducedMotion}/>
        : <Empty message="No upcoming session booked yet"/>
      }

      {safeRecent.length > 0 && (
        <>
          <Divider>Recent Bookings</Divider>
          {isMobile
            ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {safeRecent.map((b, i) => (
                  <BookingCard key={b.id ?? i} b={b} idx={i} reducedMotion={reducedMotion}/>
                ))}
              </div>
            )
            : <BookingsTable items={safeRecent} reducedMotion={reducedMotion}/>
          }
        </>
      )}

      {safeRecent.length === 0 && upcoming && (
        <Empty message="No past bookings yet — your history will appear here"/>
      )}
    </div>
  );
}