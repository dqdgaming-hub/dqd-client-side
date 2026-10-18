import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

var I = {
    bg: "#060610",
    card: "#0b0b1a",
    panel: "#0e0e20",
    glass: "rgba(14,14,32,0.72)",
    cyan: "#00e5ff",
    pink: "#ff2d78",
    yellow: "#ffd60a",
    purple: "#8b5cf6",
    green: "#00ff94",
    red: "#ff3b3b",
    text: "#e2e2ff",
    muted: "#5a5a80",
    dimmer: "#1e1e35",
    cyanDim: "rgba(0,229,255,0.07)",
    cyanBdr: "rgba(0,229,255,0.16)",
    cyanGlow: "rgba(0,229,255,0.22)",
    pinkDim: "rgba(255,45,120,0.08)",
    yellowDim: "rgba(255,214,10,0.08)",
    greenDim: "rgba(0,255,148,0.08)",
    redDim: "rgba(255,59,59,0.08)",
    purpleDim: "rgba(139,92,246,0.10)",
  },
  Mt = "dqbk-v3";
function Nt() {
  if (document.getElementById(Mt)) return;
  let e = document.createElement("style");
  (e.id = Mt),
    (e.textContent = `
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
  `),
    document.head.appendChild(e);
}
function Pt(e) {
  if (!e) return "--";
  let t = new Date(`${e}T00:00:00`);
  return isNaN(t)
    ? e
    : t.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}
function L(e) {
  if (!e) return "--";
  let [t, n] = e.split(":"),
    r = parseInt(t, 10);
  return isNaN(r) ? e : `${r % 12 || 12}:${n} ${r >= 12 ? "PM" : "AM"}`;
}
function Ft(e) {
  if (!e) return null;
  let t = new Date(`${e}T00:00:00`),
    n = new Date();
  n.setHours(0, 0, 0, 0);
  let r = Math.round((t - n) / 864e5);
  return r === 0 ? "TODAY" : r === 1 ? "TOMORROW" : r > 1 && r <= 6 ? `IN ${r} DAYS` : null;
}
function It(e) {
  switch ((e || "").toLowerCase()) {
    case "confirmed":
      return {
        accent: I.green,
        dim: I.greenDim,
      };
    case "completed":
      return {
        accent: I.cyan,
        dim: I.cyanDim,
      };
    case "pending":
      return {
        accent: I.yellow,
        dim: I.yellowDim,
      };
    case "cancelled":
      return {
        accent: I.red,
        dim: I.redDim,
      };
    default:
      return {
        accent: I.muted,
        dim: "rgba(90,90,128,0.12)",
      };
  }
}
function Lt(e) {
  switch ((e || "").toLowerCase()) {
    case "paid":
    case "completed":
      return {
        accent: I.green,
        dim: I.greenDim,
      };
    case "pending":
      return {
        accent: I.yellow,
        dim: I.yellowDim,
      };
    case "failed":
      return {
        accent: I.red,
        dim: I.redDim,
      };
    case "refunded":
      return {
        accent: I.purple,
        dim: I.purpleDim,
      };
    default:
      return {
        accent: I.muted,
        dim: "rgba(90,90,128,0.12)",
      };
  }
}
function Rt(e) {
  return !Array.isArray(e) || e.length === 0 ? "Solo" : e.map((e) => e.name).join(", ");
}
var R = {
  Ticket: ({ c = I.cyan, size = 18 }) => (
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
      <path d="M3 9a2 2 0 100 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 100-4V6a2 2 0 00-2-2H5a2 2 0 00-2 2v3z" />
      <path d="M14 4v16" strokeDasharray="2 3" />
    </svg>
  ),
  Controller: ({ c = I.muted, size = 16 }) => (
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
  Calendar: ({ c = "currentColor", size = 12 }) => (
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
  Clock: ({ c = "currentColor", size = 12 }) => (
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  Check: ({ c = I.green, size = 13 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.3 2.3L16 10" />
    </svg>
  ),
  X: ({ c = I.red, size = 13 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </svg>
  ),
  Coin: ({ c = I.yellow, size = 14 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5C9.5 8.1 10.6 7 12 7s2.5.9 2.5 2-1 1.5-2.5 2-2.5.6-2.5 2 1 2 2.5 2 2.5-.9 2.5-2" />
    </svg>
  ),
  Chevron: ({ c = I.muted, size = 14, up }) => (
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
      style={{ transform: up ? "rotate(180deg)" : "none" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Users: ({ c = I.purple, size = 12 }) => (
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
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Qr: ({ c = I.cyan, size = 13 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h.01M14 18h3M18 14v7M17 14h.01" />
    </svg>
  ),
  Lightning: ({ c = I.yellow, size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={c} stroke="none" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
    </svg>
  ),
};
function XZ_1({ color = I.cyanBdr, size = 10 }) {
  let n = {
      position: "absolute",
      pointerEvents: "none",
    },
    r = {
      position: "absolute",
      height: "1px",
      background: color,
      width: size,
    },
    i = {
      position: "absolute",
      width: "1px",
      background: color,
      height: size,
    };
  return (
    <>
      <div
        style={{
          ...n,
          top: 0,
          left: 0,
        }}
      >
        <div
          style={{
            ...r,
            top: 0,
            left: 0,
          }}
        />
        <div
          style={{
            ...i,
            top: 0,
            left: 0,
          }}
        />
      </div>
      <div
        style={{
          ...n,
          top: 0,
          right: 0,
        }}
      >
        <div
          style={{
            ...r,
            top: 0,
            right: 0,
          }}
        />
        <div
          style={{
            ...i,
            top: 0,
            right: 0,
          }}
        />
      </div>
      <div
        style={{
          ...n,
          bottom: 0,
          left: 0,
        }}
      >
        <div
          style={{
            ...r,
            bottom: 0,
            left: 0,
          }}
        />
        <div
          style={{
            ...i,
            bottom: 0,
            left: 0,
          }}
        />
      </div>
      <div
        style={{
          ...n,
          bottom: 0,
          right: 0,
        }}
      >
        <div
          style={{
            ...r,
            bottom: 0,
            right: 0,
          }}
        />
        <div
          style={{
            ...i,
            bottom: 0,
            right: 0,
          }}
        />
      </div>
    </>
  );
}
function XZt({ color = I.cyan, duration = "6s" }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent 0%, ${color}28 40%, ${color}55 50%, ${color}28 60%, transparent 100%)`,
          animation: `dqbk-scan ${duration} linear infinite`,
        }}
      />
    </div>
  );
}
function B$1({ accent, dim, icon, children, size = "sm" }) {
  let a = size === "lg" ? "0.65rem" : "0.57rem";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: size === "lg" ? "10px 14px" : "3px 9px",
        background: dim,
        border: `1px solid ${accent}45`,
        borderRadius: "2px",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: a,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        color: accent,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {children}
    </span>
  );
}
function Bt({ src, alt, style, fallbackSize = 20 }) {
  let [i, a] = useState(src ? "loading" : "fallback");
  return (
    useEffect(() => {
      if (!src) {
        a("fallback");
        return;
      }
      a("loading");
      let t = new window.Image();
      return (
        (t.src = src),
        (t.onload = () => a("loaded")),
        (t.onerror = () => a("fallback")),
        () => {
          (t.onload = null), (t.onerror = null);
        }
      );
    }, [src]),
    (
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: I.card,
          ...style,
        }}
      >
        {i === "loading" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(90deg, ${I.card} 25%, ${I.panel} 50%, ${I.card} 75%)`,
              backgroundSize: "200% 100%",
              animation: "dqbk-shimmer 1.6s linear infinite",
            }}
          />
        )}
        {i === "loaded" && (
          <motion.img
            src={src}
            alt={alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}
        {i === "fallback" && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, ${I.card}, ${I.panel})`,
            }}
          >
            <R.Controller c={I.dimmer} size={fallbackSize} />
          </div>
        )}
      </div>
    )
  );
}
function Vt({ icon, children, sub }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -18,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 26,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 3,
            height: 14,
            background: I.cyan,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            width: 3,
            height: 6,
            background: I.purple,
            borderRadius: 2,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {icon}
        <span
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)",
            fontWeight: 700,
            color: I.cyan,
            letterSpacing: "3px",
            textTransform: "uppercase",
            animation: "dqbk-flicker 8s ease-in-out infinite",
          }}
        >
          {children}
        </span>
        {sub && (
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.62rem",
              letterSpacing: "2px",
              color: I.muted,
              textTransform: "uppercase",
              borderLeft: `1px solid ${I.cyanBdr}`,
              paddingLeft: 10,
            }}
          >
            {sub}
          </span>
        )}
      </div>
    </motion.div>
  );
}
function V({ label, value, accent, icon }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.52rem",
          letterSpacing: "2.5px",
          color: I.muted,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontFamily: accent ? "'Orbitron', sans-serif" : "'Share Tech Mono', monospace",
          fontSize: accent ? "0.88rem" : "0.76rem",
          fontWeight: accent ? 700 : 400,
          color: accent || I.text,
          lineHeight: 1.2,
        }}
      >
        {value || "--"}
      </div>
    </div>
  );
}
function Ht({ booking, reducedMotion }) {
  let n = It(booking.status),
    r = Lt(booking.payment_status),
    i = Ft(booking.booking_date),
    a = booking.item_name || "Gaming Session";
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 24,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: reducedMotion ? 0.1 : 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: "relative",
        marginBottom: 36,
      }}
    >
      <div
        style={{
          position: "relative",
          height: "clamp(180px, 28vw, 280px)",
          borderRadius: "6px 6px 0 0",
          overflow: "hidden",
          border: `1px solid ${I.cyanBdr}`,
          borderBottom: "none",
        }}
      >
        <Bt
          src={booking.item_image}
          alt={a}
          style={{
            width: "100%",
            height: "100%",
          }}
          fallbackSize={40}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
            linear-gradient(0deg, rgba(6,6,16,1) 0%, rgba(6,6,16,0.6) 40%, rgba(6,6,16,0.1) 100%),
            linear-gradient(90deg, rgba(6,6,16,0.8) 0%, transparent 50%)
          `,
          }}
        />
        <XZt color={I.cyan} duration="8s" />
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: n.accent,
              animation: "dqbk-pulse-ring 2s ease-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.6rem",
              letterSpacing: "3px",
              color: I.muted,
              textTransform: "uppercase",
            }}
          >
            Next Session
          </span>
        </div>
        {i && (
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              background: I.cyan,
              color: I.bg,
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.55rem",
              fontWeight: 700,
              letterSpacing: "2px",
              padding: "4px 12px",
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
            }}
          >
            {i}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 18,
            left: 18,
            right: "30%",
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(1rem, 3.5vw, 1.6rem)",
              fontWeight: 900,
              color: I.text,
              lineHeight: 1.1,
              textShadow: `0 0 30px ${I.cyan}50`,
              animation: "dqbk-flicker 10s ease-in-out infinite",
            }}
          >
            {a}
          </div>
          <div
            style={{
              marginTop: 4,
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.62rem",
              letterSpacing: "2.5px",
              color: I.cyan,
              textTransform: "uppercase",
            }}
          >
            {booking.booking_id}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            display: "flex",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          <R.Coin c={I.yellow} size={16} />
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
              fontWeight: 900,
              color: I.yellow,
              textShadow: `0 0 20px ${I.yellow}60`,
            }}
          >
            {booking.total_amount}
          </span>
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.6rem",
              color: I.muted,
              paddingBottom: 2,
            }}
          >
            INR
          </span>
        </div>
      </div>
      <div
        style={{
          position: "relative",
          background: I.card,
          border: `1px solid ${I.cyanBdr}`,
          borderTop: "1px solid rgba(0,229,255,0.08)",
          borderRadius: "0 0 6px 6px",
          padding: "clamp(14px, 2.5vw, 20px) clamp(16px, 3vw, 24px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "16px 24px",
          alignItems: "center",
        }}
      >
        <XZ_1 size={8} />
        <V label="Date" value={Pt(booking.booking_date)} icon={<R.Calendar c={I.cyan} />} />
        <V
          label="Time"
          value={`${L(booking.start_time)} – ${L(booking.end_time)}`}
          icon={<R.Clock c={I.purple} />}
        />
        <V label="Players" value={Rt(booking.members)} icon={<R.Users c={I.purple} />} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          <div
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.52rem",
              letterSpacing: "2.5px",
              color: I.muted,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Status
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
            }}
          >
            <B$1 accent={n.accent} dim={n.dim}>
              {booking.status}
            </B$1>
            <B$1 accent={r.accent} dim={r.dim}>
              {booking.payment_status}
            </B$1>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          <div
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.52rem",
              letterSpacing: "2.5px",
              color: I.muted,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            QR Code
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <R.Qr c={booking.is_qr_valid ? I.green : I.red} />
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.65rem",
                letterSpacing: "1px",
                color: booking.is_qr_valid ? I.green : I.red,
              }}
            >
              {booking.is_qr_valid ? "VALID" : "INVALID"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
function Ut({ children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          flex: 1,
          height: "1px",
          background: `linear-gradient(90deg, ${I.cyanBdr}, transparent)`,
        }}
      />
      <span
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.58rem",
          letterSpacing: "3px",
          color: I.muted,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: `linear-gradient(270deg, ${I.cyanBdr}, transparent)`,
        }}
      />
    </div>
  );
}
function Wt({ b, idx, reducedMotion }) {
  let [r, i] = useState(false),
    a = It(b.status),
    o = Lt(b.payment_status),
    s = b.item_name || "Gaming Session";
  return (
    <>
      <motion.tr
        className="dqbk-row-hover"
        initial={{
          opacity: 0,
          x: -10,
        }}
        animate={{
          opacity: 1,
          x: 0,
          transition: {
            delay: idx * 0.045,
            duration: 0.3,
          },
        }}
        onClick={() => i((e) => !e)}
        style={{
          cursor: "pointer",
          background: r ? "rgba(0,229,255,0.04)" : "transparent",
          transition: "background 0.2s",
          borderBottom: `1px solid ${I.cyanBdr}`,
        }}
      >
        <td style={{ padding: "10px 12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                position: "relative",
                flexShrink: 0,
              }}
            >
              <Bt
                src={b.item_image}
                alt={s}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 4,
                }}
                fallbackSize={13}
              />
              {r && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 4,
                    border: `1px solid ${I.cyan}`,
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.73rem",
                color: I.text,
              }}
            >
              {s}
            </span>
          </div>
        </td>
        <td style={{ padding: "10px 12px" }}>
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.68rem",
              color: I.cyan,
            }}
          >
            {b.booking_id}
          </span>
        </td>
        <td style={{ padding: "10px 12px" }}>
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.68rem",
              color: `${I.text}99`,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <R.Calendar c={I.cyan} />
            {Pt(b.booking_date)}
          </span>
        </td>
        <td style={{ padding: "10px 12px" }}>
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.68rem",
              color: `${I.text}88`,
            }}
          >
            {L(b.start_time)}–{L(b.end_time)}
          </span>
        </td>
        <td style={{ padding: "10px 12px" }}>
          <B$1 accent={a.accent} dim={a.dim}>
            {b.status}
          </B$1>
        </td>
        <td style={{ padding: "10px 12px" }}>
          <B$1 accent={o.accent} dim={o.dim}>
            {b.payment_status}
          </B$1>
        </td>
        <td style={{ padding: "10px 12px" }}>
          {b.is_qr_valid ? <R.Check c={I.green} /> : <R.X c={I.red} />}
        </td>
        <td style={{ padding: "10px 12px" }}>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: I.yellow,
            }}
          >
            {b.total_amount}{" "}
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.6rem",
                color: I.muted,
                fontWeight: 400,
              }}
            >
              INR
            </span>
          </span>
        </td>
        <td
          style={{
            padding: "10px 10px",
            textAlign: "center",
          }}
        >
          <motion.div animate={{ rotate: r ? 180 : 0 }} transition={{ duration: 0.22 }}>
            <R.Chevron c={r ? I.cyan : I.muted} />
          </motion.div>
        </td>
      </motion.tr>
      <AnimatePresence>
        {r && (
          <motion.tr key="exp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={9} style={{ padding: 0 }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    padding: "14px 16px 16px 62px",
                    background: I.panel,
                    borderBottom: `1px solid ${I.cyanBdr}`,
                    borderLeft: `2px solid ${I.cyan}30`,
                    display: "flex",
                    gap: 32,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    {
                      label: "Players",
                      value: Rt(b.members),
                    },
                    {
                      label: "Base price",
                      value: b.base_price ? `${b.base_price} INR` : "--",
                    },
                    {
                      label: "Discount",
                      value: b.discount_price ? `${b.discount_price} INR` : "--",
                    },
                    {
                      label: "Created",
                      value: b.created_at ? new Date(b.created_at).toLocaleDateString("en-GB") : "--",
                    },
                  ].map(({ label, value }) => (
                    <V key={label} label={label} value={value} />
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
function Gt({ items, reducedMotion }) {
  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        position: "relative",
        background: I.card,
        border: `1px solid ${I.cyanBdr}`,
        borderRadius: "6px",
      }}
    >
      <XZ_1 size={12} />
      <XZt color={I.purple} duration="10s" />
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 720,
          position: "relative",
          zIndex: 1,
        }}
      >
        <thead>
          <tr>
            {["Item", "Booking ID", "Date", "Time", "Status", "Payment", "QR", "Amount", ""].map((e, t) => (
              <th
                key={t}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.56rem",
                  letterSpacing: "2px",
                  color: I.muted,
                  textTransform: "uppercase",
                  borderBottom: `1px solid ${I.cyanBdr}`,
                  background: I.panel,
                  whiteSpace: "nowrap",
                }}
              >
                {e}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((e, n) => (
            <Wt key={e.id ?? n} b={e} idx={n} reducedMotion={reducedMotion} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Kt({ b, idx, reducedMotion }) {
  let [r, i] = useState(false),
    a = It(b.status),
    o = Lt(b.payment_status),
    s = b.item_name || "Gaming Session";
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          delay: idx * 0.065,
          duration: 0.38,
        },
      }}
      style={{
        position: "relative",
        background: I.card,
        border: `1px solid ${I.cyanBdr}`,
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <XZ_1 size={8} />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 3,
          background: a.accent,
          opacity: 0.7,
        }}
      />
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "14px 14px 10px 18px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            position: "relative",
            flexShrink: 0,
          }}
        >
          <Bt
            src={b.item_image}
            alt={s}
            style={{
              width: 46,
              height: 46,
              borderRadius: 4,
            }}
            fallbackSize={16}
          />
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: I.text,
              marginBottom: 3,
              lineHeight: 1.2,
            }}
          >
            {s}
          </div>
          <div
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.59rem",
              color: I.cyan,
              letterSpacing: "1px",
            }}
          >
            {b.booking_id}
          </div>
        </div>
        <div
          style={{
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: I.yellow,
            }}
          >
            {b.total_amount}
          </div>
          <div
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.52rem",
              color: I.muted,
              letterSpacing: "1px",
            }}
          >
            INR
          </div>
        </div>
      </div>
      <div
        style={{
          padding: "0 14px 10px 18px",
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.66rem",
            color: `${I.text}88`,
          }}
        >
          <R.Calendar c={I.cyan} />
          {Pt(b.booking_date)}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.66rem",
            color: `${I.text}88`,
          }}
        >
          <R.Clock c={I.purple} />
          {L(b.start_time)}–{L(b.end_time)}
        </span>
      </div>
      <div
        style={{
          padding: "0 14px 12px 18px",
          display: "flex",
          gap: 5,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <B$1 accent={a.accent} dim={a.dim}>
          {b.status}
        </B$1>
        <B$1 accent={o.accent} dim={o.dim}>
          {b.payment_status}
        </B$1>
        {b.is_qr_valid ? (
          <B$1 accent={I.green} dim={I.greenDim} icon={<R.Check c={I.green} size={11} />}>
            QR OK
          </B$1>
        ) : (
          <B$1 accent={I.red} dim={I.redDim} icon={<R.X c={I.red} size={11} />}>
            QR Fail
          </B$1>
        )}
      </div>
      <button
        onClick={() => i((e) => !e)}
        style={{
          width: "100%",
          padding: "6px 14px",
          background: r ? `${I.cyan}10` : I.dimmer,
          border: "none",
          borderTop: `1px solid ${I.cyanBdr}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.57rem",
          letterSpacing: "2px",
          color: r ? I.cyan : I.muted,
          cursor: "pointer",
          textTransform: "uppercase",
          transition: "background 0.2s, color 0.2s",
        }}
      >
        {r ? "COLLAPSE" : "EXPAND"}
        <motion.div animate={{ rotate: r ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <R.Chevron c={r ? I.cyan : I.muted} size={12} />
        </motion.div>
      </button>
      <AnimatePresence>
        {r && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "12px 14px 14px 18px",
                background: I.panel,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px 16px",
                borderTop: `1px solid ${I.cyanBdr}`,
              }}
            >
              {[
                {
                  label: "Players",
                  value: Rt(b.members),
                },
                {
                  label: "Base price",
                  value: b.base_price ? `${b.base_price} INR` : "--",
                },
                {
                  label: "Discount",
                  value: b.discount_price ? `${b.discount_price} INR` : "--",
                },
                {
                  label: "Created",
                  value: b.created_at ? new Date(b.created_at).toLocaleDateString("en-GB") : "--",
                },
              ].map(({ label, value }) => (
                <V key={label} label={label} value={value} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
function useIsNarrow(e = 760) {
  let [t, n] = useState(() => (typeof window < "u" ? window.innerWidth < e : false));
  return (
    useEffect(() => {
      let t = window.matchMedia(`(max-width: ${e - 1}px)`),
        r = (e) => n(e.matches);
      return t.addEventListener("change", r), n(t.matches), () => t.removeEventListener("change", r);
    }, [e]),
    t
  );
}
function Jt({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: "30px 20px",
        textAlign: "center",
        border: `1px dashed ${I.cyanBdr}`,
        borderRadius: "4px",
        marginBottom: 24,
        position: "relative",
      }}
    >
      <R.Controller c={I.dimmer} size={28} />
      <div
        style={{
          marginTop: 10,
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.7rem",
          letterSpacing: "1.5px",
          color: I.muted,
        }}
      >
        {message}
      </div>
    </motion.div>
  );
}
function DashboardBookings({ upcoming, recent = [] }) {
  let n = useReducedMotion(),
    r = useIsNarrow(),
    i = Array.isArray(recent) ? recent : [];
  return (
    useEffect(() => {
      Nt();
    }, []),
    (
      <div
        style={{
          width: "100%",
          color: I.text,
        }}
      >
        <Vt icon={<R.Ticket c={I.cyan} size={18} />} sub={`${i.length} PAST`}>
          My Bookings
        </Vt>
        {upcoming ? (
          <Ht booking={upcoming} reducedMotion={n} />
        ) : (
          <Jt message="No upcoming session booked yet" />
        )}
        {i.length > 0 && (
          <>
            <Ut>Recent Bookings</Ut>
            {r ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {i.map((e, t) => (
                  <Kt key={e.id ?? t} b={e} idx={t} reducedMotion={n} />
                ))}
              </div>
            ) : (
              <Gt items={i} reducedMotion={n} />
            )}
          </>
        )}
        {i.length === 0 && upcoming && <Jt message="No past bookings yet — your history will appear here" />}
      </div>
    )
  );
}

export default DashboardBookings;
