import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import emailjs from "@emailjs/browser";
import { emailjsConfig } from "./emailjsConfig";

var Z$1 = {
    void: "#030308",
    obsidian: "#080812",
    panel: "#0d0d1f",
    elevated: "#111122",
    surface: "#0a0a1a",
    purple: "#7b2fff",
    vibrLight: "#a855f7",
    vibrGlow: "#c084fc",
    vibrFaint: "rgba(123,47,255,0.12)",
    fuchsia: "#d400ff",
    gold: "#d4a017",
    goldLight: "#f0c040",
    text: "#e2d9f3",
    muted: "rgba(226,217,243,0.38)",
    dim: "rgba(226,217,243,0.15)",
    subtle: "#1a1a32",
    border: "rgba(123,47,255,0.22)",
    borderHover: "rgba(168,85,247,0.55)",
    success: "#22d3a5",
    error: "#f87171",
  },
  Q = {
    MapPin: ({ size = 16, color = Z$1.vibrGlow }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21C12 21 5 13.5 5 9a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    Navigation: ({ size = 12, color = Z$1.vibrGlow }) => (
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
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
    Mail: ({ size = 14, color = Z$1.vibrGlow }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3.5 6.5 12 13l8.5-6.5" />
      </svg>
    ),
    User: ({ size = 12 }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    AtSign: ({ size = 12 }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M16 8v4a4 4 0 0 0 8 0v-2A10 10 0 1 0 12 22a10 10 0 0 0 6.1-2" />
      </svg>
    ),
    Phone: ({ size = 12 }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
      </svg>
    ),
    MessageSquare: ({ size = 12 }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    Send: ({ size = 13, color = "currentColor" }) => (
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
        <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
    Check: ({ size = 22, color = Z$1.success }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    AlertCircle: ({ size = 12, color = Z$1.error }) => (
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
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    WifiOff: ({ size = 28, color = Z$1.muted }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
      </svg>
    ),
    ExternalLink: ({ size = 11, color = Z$1.vibrGlow }) => (
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
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    ),
  },
  Tr =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7859.174438734689!2d76.296995974871!3d9.968259590135524!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b087306fc6f7f17%3A0x39dba6f2646508c!2sDQD%20gaming%20hub!5e0!3m2!1sen!2sin!4v1782466743374!5m2!1sen!2sin",
  Er = "https://maps.app.goo.gl/KgzawVaozWH67PPDA",
  Dr = (e) => {
    let t = {};
    return (
      e.name.trim() || (t.name = "Name is required"),
      e.email.trim()
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email) || (t.email = "Enter a valid email")
        : (t.email = "Email is required"),
      t
    );
  },
  Or = (e = 0) => ({
    hidden: {
      opacity: 0,
      y: 28,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        delay: e,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }),
  kr = (e) => ({
    hidden: {
      opacity: 0,
      x: -12,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.38,
        delay: 0.05 * e,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }),
  Ar = {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.92,
      transition: { duration: 0.22 },
    },
  },
  jr = () => {
    if (document.getElementById("dqmq3-styles")) return;
    let e = document.createElement("style");
    (e.id = "dqmq3-styles"),
      (e.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');

    .dqmq3-section { width: 100%; }

    /* ── Section label strip ── */
    .dqmq3-strip {
      display: flex; align-items: center; gap: 14px; margin-bottom: 32px;
    }
    .dqmq3-strip-line {
      flex: 1; height: 1px;
    }
    .dqmq3-strip-label {
      font-family: 'Orbitron', monospace;
      font-size: clamp(0.52rem, 1vw, 0.62rem);
      font-weight: 700; letter-spacing: 4px; text-transform: uppercase;
      color: ${Z$1.vibrGlow};
      white-space: nowrap;
    }

    /* ── Two-column grid ── */
    .dqmq3-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 22px;
      align-items: stretch;
    }
    @media (max-width: 860px)  { .dqmq3-grid { grid-template-columns: 1fr; } }

    /* ═══════════════════════════════════════════
       MAP PANEL
       ═══════════════════════════════════════════ */
    .dqmq3-map-panel {
      background: ${Z$1.panel};
      border: 1px solid ${Z$1.border};
      /* Signature element: asymmetric angular cut matching the Vibranium navbar */
      clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));
      overflow: hidden;
      display: flex; flex-direction: column;
      min-height: 460px;
      position: relative;
    }

    /* Corner accent marks */
    .dqmq3-corner {
      position: absolute; width: 20px; height: 20px; z-index: 4; pointer-events: none;
    }
    .dqmq3-corner-tl { top: 0; left: 0; border-top: 2px solid ${Z$1.gold}; border-left: 2px solid ${Z$1.gold}; opacity: 0.6; }
    .dqmq3-corner-br { bottom: 0; right: 0; border-bottom: 2px solid ${Z$1.gold}; border-right: 2px solid ${Z$1.gold}; opacity: 0.6; }

    /* Top bar */
    .dqmq3-map-topbar {
      padding: 13px 18px;
      background: ${Z$1.elevated};
      border-bottom: 1px solid ${Z$1.border};
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      flex-wrap: wrap; flex-shrink: 0; position: relative; z-index: 3;
    }
    .dqmq3-map-topbar::after {
      content: '';
      position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(123,47,255,0.6), rgba(212,160,23,0.5), rgba(123,47,255,0.6), transparent);
    }

    .dqmq3-map-name {
      font-family: 'Orbitron', monospace;
      font-size: clamp(0.55rem, 1vw, 0.65rem);
      font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      color: ${Z$1.text};
      display: flex; align-items: center; gap: 8px;
    }

    /* Live pulse dot */
    .dqmq3-live-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: ${Z$1.success};
      box-shadow: 0 0 8px ${Z$1.success};
      flex-shrink: 0;
      animation: dqmq3-livepulse 2.2s ease-in-out infinite;
    }
    @keyframes dqmq3-livepulse {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:0.45; transform:scale(0.75); }
    }

    /* Directions button */
    .dqmq3-dir-btn {
      display: inline-flex; align-items: center; gap: 6px;
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.6rem; letter-spacing: 1.5px; text-transform: uppercase;
      color: ${Z$1.vibrGlow}; text-decoration: none;
      border: 1px solid rgba(123,47,255,0.35);
      padding: 6px 13px;
      background: transparent;
      clip-path: polygon(7px 0%, 100% 0%, calc(100% - 7px) 100%, 0% 100%);
      transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .dqmq3-dir-btn:hover {
      background: rgba(123,47,255,0.15);
      border-color: rgba(168,85,247,0.65);
      box-shadow: 0 0 16px rgba(123,47,255,0.3);
    }
    .dqmq3-dir-btn:focus-visible {
      outline: none; box-shadow: 0 0 0 2px rgba(192,132,252,0.65);
    }

    /* Map body */
    .dqmq3-map-body {
      flex: 1; position: relative;
      background: ${Z$1.surface};
      min-height: 380px;
    }

    /* Skeleton shimmer */
    .dqmq3-skeleton {
      position: absolute; inset: 0; z-index: 1;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(110deg, ${Z$1.surface} 28%, ${Z$1.elevated} 50%, ${Z$1.surface} 72%);
      background-size: 200% 100%;
      animation: dqmq3-shimmer 1.7s linear infinite;
    }
    @keyframes dqmq3-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .dqmq3-map-iframe {
      width: 100%; height: 100%; border: none; display: block;
      position: absolute; inset: 0; z-index: 2; min-height: 380px;
    }

    /* Map error fallback */
    .dqmq3-map-error {
      position: absolute; inset: 0; z-index: 3;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 14px; background: ${Z$1.surface};
    }
    .dqmq3-map-error-label {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.65rem; letter-spacing: 2px; text-transform: uppercase;
      color: ${Z$1.muted};
    }
    .dqmq3-map-error-link {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.62rem; color: ${Z$1.vibrGlow};
      text-decoration: none; letter-spacing: 1px;
      display: flex; align-items: center; gap: 5px;
      border-bottom: 1px solid rgba(192,132,252,0.3);
      padding-bottom: 1px;
    }
    .dqmq3-map-error-link:hover { border-color: ${Z$1.vibrGlow}; }

    /* ═══════════════════════════════════════════
       ENQUIRY PANEL
       ═══════════════════════════════════════════ */
    .dqmq3-enquiry-panel {
      background: ${Z$1.panel};
      border: 1px solid ${Z$1.border};
      clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));
      padding: 28px;
      display: flex; flex-direction: column;
      position: relative; overflow: hidden;
    }
    @media (max-width: 480px) { .dqmq3-enquiry-panel { padding: 20px 16px; } }

    /* subtle ambient glow inside the panel */
    .dqmq3-enquiry-panel::before {
      content: '';
      position: absolute; top: -60px; right: -60px;
      width: 200px; height: 200px; border-radius: 50%;
      background: radial-gradient(circle, rgba(123,47,255,0.1), transparent 70%);
      pointer-events: none;
    }

    .dqmq3-form-title {
      font-family: 'Orbitron', monospace;
      font-size: clamp(0.6rem, 1.2vw, 0.72rem);
      font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
      color: ${Z$1.text};
      display: flex; align-items: center; gap: 10px; margin-bottom: 24px;
      position: relative; z-index: 1;
    }
    .dqmq3-form-title-bar {
      display: block; width: 3px; height: 1.1em;
      background: linear-gradient(180deg, ${Z$1.purple}, ${Z$1.fuchsia});
      border-radius: 2px; flex-shrink: 0;
    }

    /* Fields */
    .dqmq3-field {
      margin-bottom: 14px; position: relative; z-index: 1;
    }
    .dqmq3-field-label {
      display: flex; align-items: center; gap: 7px;
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.58rem; letter-spacing: 2px; text-transform: uppercase;
      color: ${Z$1.muted}; margin-bottom: 7px;
      transition: color 0.2s;
    }
    .dqmq3-field:focus-within .dqmq3-field-label { color: ${Z$1.vibrGlow}; }
    .dqmq3-required { color: ${Z$1.fuchsia}; margin-left: 2px; }

    .dqmq3-input {
      width: 100%; background: ${Z$1.obsidian};
      border: 1px solid rgba(123,47,255,0.18);
      color: ${Z$1.text};
      padding: 10px 14px;
      font-family: 'Share Tech Mono', monospace; font-size: 0.78rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      -webkit-appearance: none;
    }
    .dqmq3-input:focus {
      border-color: ${Z$1.purple};
      box-shadow: 0 0 0 3px rgba(123,47,255,0.15), inset 0 0 12px rgba(123,47,255,0.05);
    }
    .dqmq3-input::placeholder { color: rgba(226,217,243,0.22); }
    .dqmq3-input.is-invalid   { border-color: rgba(248,113,113,0.45); }
    textarea.dqmq3-input { resize: vertical; min-height: 88px; line-height: 1.6; }

    /* Inline field error */
    .dqmq3-field-err {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.56rem; letter-spacing: 1px; text-transform: uppercase;
      color: ${Z$1.error}; margin-top: 5px;
      display: flex; align-items: center; gap: 5px;
    }

    /* Submit */
    .dqmq3-submit {
      width: 100%; padding: 13px;
      background: linear-gradient(135deg, rgba(123,47,255,0.2), rgba(212,0,255,0.3));
      border: 1px solid rgba(123,47,255,0.5);
      color: ${Z$1.text};
      font-family: 'Orbitron', monospace; font-size: 0.68rem;
      font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
      cursor: pointer;
      clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
      display: flex; align-items: center; justify-content: center; gap: 9px;
      position: relative; z-index: 1; overflow: hidden;
      transition: border-color 0.25s, box-shadow 0.25s;
    }
    .dqmq3-submit:hover:not(:disabled) {
      border-color: ${Z$1.vibrLight};
      box-shadow: 0 0 28px rgba(123,47,255,0.4), 0 0 6px rgba(123,47,255,0.3);
    }
    .dqmq3-submit:disabled { cursor: not-allowed; opacity: 0.45; }
    .dqmq3-submit:focus-visible {
      outline: none; box-shadow: 0 0 0 2px rgba(192,132,252,0.65);
    }

    /* Error banner */
    .dqmq3-error-banner {
      background: rgba(248,113,113,0.08);
      border: 1px solid rgba(248,113,113,0.3);
      padding: 10px 13px; margin-bottom: 14px;
      font-family: 'Share Tech Mono', monospace; font-size: 0.62rem;
      letter-spacing: 0.5px; color: ${Z$1.error};
      display: flex; align-items: center; gap: 8px;
      position: relative; z-index: 1;
    }

    /* Success */
    .dqmq3-success {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 14px; padding: 40px 20px; text-align: center;
    }
    .dqmq3-success-ring {
      width: 58px; height: 58px;
      border: 2px solid ${Z$1.success};
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 28px rgba(34,211,165,0.35);
    }
    .dqmq3-success-title {
      font-family: 'Orbitron', monospace;
      font-size: 0.78rem; letter-spacing: 3px; text-transform: uppercase;
      color: ${Z$1.success};
    }
    .dqmq3-success-sub {
      font-family: 'Rajdhani', sans-serif; font-size: 0.9rem;
      color: ${Z$1.muted}; line-height: 1.6;
    }
    .dqmq3-reset-btn {
      margin-top: 8px;
      background: transparent; border: 1px solid rgba(123,47,255,0.25);
      color: ${Z$1.muted}; font-family: 'Share Tech Mono', monospace;
      font-size: 0.58rem; letter-spacing: 2px; text-transform: uppercase;
      padding: 7px 16px; cursor: pointer;
      transition: border-color 0.2s, color 0.2s;
    }
    .dqmq3-reset-btn:hover { border-color: ${Z$1.border}; color: ${Z$1.text}; }
    .dqmq3-reset-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px rgba(192,132,252,0.65); }

    /* Spinner */
    .dqmq3-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(192,132,252,0.25);
      border-top-color: ${Z$1.vibrGlow};
      border-radius: 50%;
      animation: dqmq3-spin 0.7s linear infinite;
      flex-shrink: 0;
    }
    @keyframes dqmq3-spin { to { transform: rotate(360deg); } }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .dqmq3-skeleton { animation: none; }
      .dqmq3-live-dot  { animation: none; }
      .dqmq3-spinner   { animation: none; }
    }
  `),
      document.head.appendChild(e);
  };
function Mr({ color = "rgba(123,47,255,0.45)", width = 36, height = 12 }) {
  let r = width / 3.5;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden="true">
      {[0, 1, 2].map((t) => (
        <line
          key={t}
          x1={t * r + 2}
          y1={height - 1}
          x2={t * r + r - 3}
          y2={1}
          stroke={color}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
function Nr() {
  let [e, t] = useState(false),
    [n, r] = useState(false),
    i = useRef(null),
    a = useInView(i, {
      once: true,
      margin: "0px 0px -60px 0px",
    });
  return (
    <motion.div
      ref={i}
      className="dqmq3-map-panel"
      variants={Or(0)}
      initial="hidden"
      animate={a ? "visible" : "hidden"}
    >
      <span className="dqmq3-corner dqmq3-corner-tl" aria-hidden="true" />
      <span className="dqmq3-corner dqmq3-corner-br" aria-hidden="true" />
      <div className="dqmq3-map-topbar">
        <span className="dqmq3-map-name">
          <span className="dqmq3-live-dot" aria-hidden="true" />
          <Q.MapPin size={13} />
          DQD Gaming Hub — Kochi
        </span>
        <a
          className="dqmq3-dir-btn"
          href={Er}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get directions to DQD Gaming Hub"
        >
          <Q.Navigation size={11} />
          Directions
        </a>
      </div>
      <div className="dqmq3-map-body">
        <AnimatePresence>
          {!e && !n && (
            <motion.div
              className="dqmq3-skeleton"
              exit={{
                opacity: 0,
                transition: { duration: 0.4 },
              }}
              aria-hidden="true"
            >
              <Q.MapPin size={30} color="rgba(123,47,255,0.2)" />
            </motion.div>
          )}
        </AnimatePresence>
        {n ? (
          <div className="dqmq3-map-error" role="alert">
            <Q.WifiOff size={28} color={Z$1.muted} />
            <span className="dqmq3-map-error-label">Map unavailable</span>
            <a className="dqmq3-map-error-link" href={Er} target="_blank" rel="noopener noreferrer">
              <Q.ExternalLink size={11} />
              Open in Google Maps
            </a>
          </div>
        ) : (
          <iframe
            className="dqmq3-map-iframe"
            src={Tr}
            title="DQD Gaming Hub Location"
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => t(true)}
            onError={() => {
              r(true), t(true);
            }}
            style={{
              opacity: +!!e,
              transition: "opacity 0.45s ease",
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
var Pr = [
  {
    key: "name",
    label: "Full Name",
    IconComp: Q.User,
    type: "text",
    placeholder: "Your name",
    autoComplete: "name",
    required: true,
  },
  {
    key: "email",
    label: "Email",
    IconComp: Q.AtSign,
    type: "email",
    placeholder: "you@example.com",
    autoComplete: "email",
    required: true,
  },
  {
    key: "phone",
    label: "Phone",
    IconComp: Q.Phone,
    type: "tel",
    placeholder: "+91 …",
    autoComplete: "tel",
    required: false,
  },
  {
    key: "message",
    label: "Message",
    IconComp: Q.MessageSquare,
    type: "textarea",
    placeholder: "How can we help?",
    autoComplete: "off",
    required: false,
  },
];
function Fr({ onSubmit }) {
  let [t, n] = useState({
      name: "",
      email: "",
      phone: "",
      message: "",
    }),
    [r, i] = useState({}),
    [a, o] = useState({}),
    [s, c] = useState("idle"),
    [l, u] = useState(""),
    d = useReducedMotion(),
    f = useRef(null),
    p = useInView(f, {
      once: true,
      margin: "0px 0px -60px 0px",
    }),
    m = useCallback(
      (e) => (r) => {
        let o = r.target.value;
        if (
          (n((t) => ({
            ...t,
            [e]: o,
          })),
          a[e])
        ) {
          let n = Dr({
            ...t,
            [e]: o,
          });
          i((t) => ({
            ...t,
            [e]: n[e],
          }));
        }
      },
      [t, a],
    ),
    h = useCallback(
      (e) => () => {
        o((t) => ({
          ...t,
          [e]: true,
        }));
        let n = Dr(t);
        i((t) => ({
          ...t,
          [e]: n[e],
        }));
      },
      [t],
    ),
    g = useCallback(async () => {
      o(Object.fromEntries(Pr.map((e) => [e.key, true])));
      let r = Dr(t);
      if ((i(r), !(Object.keys(r).length > 0))) {
        c("sending"), u("");
        try {
          await emailjs.send(
            emailjsConfig.serviceId,
            emailjsConfig.templateId,
            {
              from_name: t.name,
              from_email: t.email,
              phone: t.phone || "Not provided",
              message: t.message || "No message",
              submitted_at: new Date().toLocaleString(),
            },
            { publicKey: emailjsConfig.publicKey },
          ),
            onSubmit?.(t),
            c("sent"),
            n({
              name: "",
              email: "",
              phone: "",
              message: "",
            }),
            o({}),
            i({});
        } catch (e) {
          console.error("EmailJS error:", e),
            c("error"),
            u("Transmission failed. Please check your connection and try again.");
        }
      }
    }, [t, onSubmit]);
  return (
    <motion.div
      ref={f}
      className="dqmq3-enquiry-panel"
      variants={Or(0.1)}
      initial="hidden"
      animate={p ? "visible" : "hidden"}
    >
      <div className="dqmq3-form-title">
        <span className="dqmq3-form-title-bar" aria-hidden="true" />
        <Q.Mail size={14} />
        Send an Enquiry
      </div>
      <AnimatePresence mode="wait">
        {s === "sent" ? (
          <motion.div
            key="success"
            className="dqmq3-success"
            variants={Ar}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="status"
            aria-live="polite"
          >
            <motion.div
              className="dqmq3-success-ring"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 20,
                delay: 0.1,
              }}
            >
              <Q.Check size={24} color={Z$1.success} />
            </motion.div>
            <div className="dqmq3-success-title">Message Transmitted</div>
            <div className="dqmq3-success-sub">We'll respond within 24 hours.</div>
            <motion.button
              className="dqmq3-reset-btn"
              onClick={() => c("idle")}
              whileHover={
                d
                  ? {}
                  : {
                      borderColor: Z$1.border,
                      color: Z$1.text,
                    }
              }
              aria-label="Send another enquiry"
            >
              Send another
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.2 },
            }}
          >
            <AnimatePresence>
              {l && (
                <motion.div
                  className="dqmq3-error-banner"
                  role="alert"
                  initial={{
                    opacity: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{ opacity: 0 }}
                >
                  <Q.AlertCircle size={13} color={Z$1.error} />
                  {l}
                </motion.div>
              )}
            </AnimatePresence>
            {Pr.map((e, n) => {
              let i = !!(a[e.key] && r[e.key]);
              return (
                <motion.div
                  key={e.key}
                  className="dqmq3-field"
                  variants={d ? {} : kr(n)}
                  initial="hidden"
                  animate={p ? "visible" : "hidden"}
                >
                  <label className="dqmq3-field-label" htmlFor={`dqmq3-${e.key}`}>
                    <e.IconComp size={11} />
                    {e.label}
                    {e.required && (
                      <span className="dqmq3-required" aria-hidden="true">
                        *
                      </span>
                    )}
                  </label>
                  {e.type === "textarea" ? (
                    <textarea
                      id={`dqmq3-${e.key}`}
                      className={`dqmq3-input${i ? " is-invalid" : ""}`}
                      placeholder={e.placeholder}
                      value={t[e.key]}
                      onChange={m(e.key)}
                      onBlur={h(e.key)}
                      aria-invalid={i}
                      aria-describedby={i ? `dqmq3-${e.key}-err` : void 0}
                    />
                  ) : (
                    <input
                      id={`dqmq3-${e.key}`}
                      className={`dqmq3-input${i ? " is-invalid" : ""}`}
                      type={e.type}
                      placeholder={e.placeholder}
                      value={t[e.key]}
                      onChange={m(e.key)}
                      onBlur={h(e.key)}
                      aria-invalid={i}
                      aria-required={e.required}
                      aria-describedby={i ? `dqmq3-${e.key}-err` : void 0}
                      autoComplete={e.autoComplete}
                    />
                  )}
                  <AnimatePresence>
                    {i && (
                      <motion.div
                        id={`dqmq3-${e.key}-err`}
                        className="dqmq3-field-err"
                        role="alert"
                        initial={{
                          opacity: 0,
                          y: -4,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <Q.AlertCircle size={11} color={Z$1.error} />
                        {r[e.key]}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            <motion.button
              className="dqmq3-submit"
              onClick={g}
              disabled={s === "sending"}
              whileHover={s === "sending" ? {} : { scale: 1.012 }}
              whileTap={s === "sending" ? {} : { scale: 0.985 }}
              aria-label="Submit enquiry"
            >
              {s === "sending" ? (
                <>
                  <span className="dqmq3-spinner" aria-hidden="true" />
                  Transmitting…
                </>
              ) : (
                <>
                  <Q.Send size={13} />
                  Transmit Message
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
function MapAndEnquiry({ onSubmit }) {
  useEffect(() => {
    jr();
  }, []);
  let t = useRef(null),
    n = useInView(t, {
      once: true,
      margin: "0px 0px -40px 0px",
    });
  return (
    <div className="dqmq3-section" ref={t}>
      <motion.div
        className="dqmq3-strip"
        variants={Or(0)}
        initial="hidden"
        animate={n ? "visible" : "hidden"}
      >
        <div
          className="dqmq3-strip-line"
          style={{ background: `linear-gradient(90deg, ${Z$1.border}, transparent)` }}
          aria-hidden="true"
        />
        <Q.MapPin size={13} color={Z$1.vibrGlow} />
        <span className="dqmq3-strip-label">Find Us & Reach Out</span>
        <Mr color="rgba(212,160,23,0.4)" width={32} height={11} />
        <div
          className="dqmq3-strip-line"
          style={{ background: `linear-gradient(90deg, transparent, ${Z$1.border})` }}
          aria-hidden="true"
        />
      </motion.div>
      <div className="dqmq3-grid">
        <Nr />
        <Fr onSubmit={onSubmit} />
      </div>
    </div>
  );
}

export default MapAndEnquiry;
