import { useState, useEffect, useRef, useCallback } from "react";
import emailjs from "@emailjs/browser";
import { emailjsConfig } from "./emailjsConfig";
import {
  motion, AnimatePresence, useInView, useReducedMotion,
} from "framer-motion";

/* ══════════════════════════════════════════════════════
   DESIGN TOKENS — unified Vibranium / Black Panther system
   ══════════════════════════════════════════════════════ */
const T = {
  void:         "#030308",
  obsidian:     "#080812",
  panel:        "#0d0d1f",
  elevated:     "#111122",
  surface:      "#0a0a1a",
  purple:       "#7b2fff",
  vibrLight:    "#a855f7",
  vibrGlow:     "#c084fc",
  vibrFaint:    "rgba(123,47,255,0.12)",
  fuchsia:      "#d400ff",
  gold:         "#d4a017",
  goldLight:    "#f0c040",
  text:         "#e2d9f3",
  muted:        "rgba(226,217,243,0.38)",
  dim:          "rgba(226,217,243,0.15)",
  subtle:       "#1a1a32",
  border:       "rgba(123,47,255,0.22)",
  borderHover:  "rgba(168,85,247,0.55)",
  success:      "#22d3a5",
  error:        "#f87171",
};

/* ══════════════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════════════ */
const Icon = {
  MapPin: ({ size = 16, color = T.vibrGlow }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21C12 21 5 13.5 5 9a7 7 0 1 1 14 0c0 4.5-7 12-7 12z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
  Navigation: ({ size = 12, color = T.vibrGlow }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>
  ),
  Mail: ({ size = 14, color = T.vibrGlow }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="M3.5 6.5 12 13l8.5-6.5"/>
    </svg>
  ),
  User: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  AtSign: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M16 8v4a4 4 0 0 0 8 0v-2A10 10 0 1 0 12 22a10 10 0 0 0 6.1-2"/>
    </svg>
  ),
  Phone: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>
    </svg>
  ),
  MessageSquare: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Send: ({ size = 13, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  ),
  Check: ({ size = 22, color = T.success }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  AlertCircle: ({ size = 12, color = T.error }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  WifiOff: ({ size = 28, color = T.muted }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>
    </svg>
  ),
  ExternalLink: ({ size = 11, color = T.vibrGlow }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
};

/* ══════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════ */
const GOOGLE_MAPS_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7859.174438734689!2d76.296995974871!3d9.968259590135524!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b087306fc6f7f17%3A0x39dba6f2646508c!2sDQD%20gaming%20hub!5e0!3m2!1sen!2sin!4v1782466743374!5m2!1sen!2sin";

const GOOGLE_MAPS_DIRECTIONS_URL = "https://maps.app.goo.gl/KgzawVaozWH67PPDA";

/* ══════════════════════════════════════════════════════
   VALIDATION
   ══════════════════════════════════════════════════════ */
const validate = (form) => {
  const errors = {};
  if (!form.name.trim())    errors.name  = "Name is required";
  if (!form.email.trim())   errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email";
  return errors;
};

/* ══════════════════════════════════════════════════════
   MOTION VARIANTS
   ══════════════════════════════════════════════════════ */
const spring = { type: "spring", stiffness: 300, damping: 26 };

const panelIn = (delay = 0) => ({
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] } },
});

const fieldIn = (i) => ({
  hidden:  { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.38, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] } },
});

const successVariant = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.92, transition: { duration: 0.22 } },
};

/* ══════════════════════════════════════════════════════
   GLOBAL STYLES (injected once)
   ══════════════════════════════════════════════════════ */
const injectStyles = () => {
  if (document.getElementById("dqmq3-styles")) return;
  const s = document.createElement("style");
  s.id = "dqmq3-styles";
  s.textContent = `
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
      color: ${T.vibrGlow};
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
      background: ${T.panel};
      border: 1px solid ${T.border};
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
    .dqmq3-corner-tl { top: 0; left: 0; border-top: 2px solid ${T.gold}; border-left: 2px solid ${T.gold}; opacity: 0.6; }
    .dqmq3-corner-br { bottom: 0; right: 0; border-bottom: 2px solid ${T.gold}; border-right: 2px solid ${T.gold}; opacity: 0.6; }

    /* Top bar */
    .dqmq3-map-topbar {
      padding: 13px 18px;
      background: ${T.elevated};
      border-bottom: 1px solid ${T.border};
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
      color: ${T.text};
      display: flex; align-items: center; gap: 8px;
    }

    /* Live pulse dot */
    .dqmq3-live-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: ${T.success};
      box-shadow: 0 0 8px ${T.success};
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
      color: ${T.vibrGlow}; text-decoration: none;
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
      background: ${T.surface};
      min-height: 380px;
    }

    /* Skeleton shimmer */
    .dqmq3-skeleton {
      position: absolute; inset: 0; z-index: 1;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(110deg, ${T.surface} 28%, ${T.elevated} 50%, ${T.surface} 72%);
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
      gap: 14px; background: ${T.surface};
    }
    .dqmq3-map-error-label {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.65rem; letter-spacing: 2px; text-transform: uppercase;
      color: ${T.muted};
    }
    .dqmq3-map-error-link {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.62rem; color: ${T.vibrGlow};
      text-decoration: none; letter-spacing: 1px;
      display: flex; align-items: center; gap: 5px;
      border-bottom: 1px solid rgba(192,132,252,0.3);
      padding-bottom: 1px;
    }
    .dqmq3-map-error-link:hover { border-color: ${T.vibrGlow}; }

    /* ═══════════════════════════════════════════
       ENQUIRY PANEL
       ═══════════════════════════════════════════ */
    .dqmq3-enquiry-panel {
      background: ${T.panel};
      border: 1px solid ${T.border};
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
      color: ${T.text};
      display: flex; align-items: center; gap: 10px; margin-bottom: 24px;
      position: relative; z-index: 1;
    }
    .dqmq3-form-title-bar {
      display: block; width: 3px; height: 1.1em;
      background: linear-gradient(180deg, ${T.purple}, ${T.fuchsia});
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
      color: ${T.muted}; margin-bottom: 7px;
      transition: color 0.2s;
    }
    .dqmq3-field:focus-within .dqmq3-field-label { color: ${T.vibrGlow}; }
    .dqmq3-required { color: ${T.fuchsia}; margin-left: 2px; }

    .dqmq3-input {
      width: 100%; background: ${T.obsidian};
      border: 1px solid rgba(123,47,255,0.18);
      color: ${T.text};
      padding: 10px 14px;
      font-family: 'Share Tech Mono', monospace; font-size: 0.78rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      -webkit-appearance: none;
    }
    .dqmq3-input:focus {
      border-color: ${T.purple};
      box-shadow: 0 0 0 3px rgba(123,47,255,0.15), inset 0 0 12px rgba(123,47,255,0.05);
    }
    .dqmq3-input::placeholder { color: rgba(226,217,243,0.22); }
    .dqmq3-input.is-invalid   { border-color: rgba(248,113,113,0.45); }
    textarea.dqmq3-input { resize: vertical; min-height: 88px; line-height: 1.6; }

    /* Inline field error */
    .dqmq3-field-err {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.56rem; letter-spacing: 1px; text-transform: uppercase;
      color: ${T.error}; margin-top: 5px;
      display: flex; align-items: center; gap: 5px;
    }

    /* Submit */
    .dqmq3-submit {
      width: 100%; padding: 13px;
      background: linear-gradient(135deg, rgba(123,47,255,0.2), rgba(212,0,255,0.3));
      border: 1px solid rgba(123,47,255,0.5);
      color: ${T.text};
      font-family: 'Orbitron', monospace; font-size: 0.68rem;
      font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
      cursor: pointer;
      clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
      display: flex; align-items: center; justify-content: center; gap: 9px;
      position: relative; z-index: 1; overflow: hidden;
      transition: border-color 0.25s, box-shadow 0.25s;
    }
    .dqmq3-submit:hover:not(:disabled) {
      border-color: ${T.vibrLight};
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
      letter-spacing: 0.5px; color: ${T.error};
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
      border: 2px solid ${T.success};
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 28px rgba(34,211,165,0.35);
    }
    .dqmq3-success-title {
      font-family: 'Orbitron', monospace;
      font-size: 0.78rem; letter-spacing: 3px; text-transform: uppercase;
      color: ${T.success};
    }
    .dqmq3-success-sub {
      font-family: 'Rajdhani', sans-serif; font-size: 0.9rem;
      color: ${T.muted}; line-height: 1.6;
    }
    .dqmq3-reset-btn {
      margin-top: 8px;
      background: transparent; border: 1px solid rgba(123,47,255,0.25);
      color: ${T.muted}; font-family: 'Share Tech Mono', monospace;
      font-size: 0.58rem; letter-spacing: 2px; text-transform: uppercase;
      padding: 7px 16px; cursor: pointer;
      transition: border-color 0.2s, color 0.2s;
    }
    .dqmq3-reset-btn:hover { border-color: ${T.border}; color: ${T.text}; }
    .dqmq3-reset-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px rgba(192,132,252,0.65); }

    /* Spinner */
    .dqmq3-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(192,132,252,0.25);
      border-top-color: ${T.vibrGlow};
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
  `;
  document.head.appendChild(s);
};

/* ══════════════════════════════════════════════════════
   VIBRANIUM SLASH (decorative)
   ══════════════════════════════════════════════════════ */
function VibraniumSlash({ color = "rgba(123,47,255,0.45)", width = 36, height = 12 }) {
  const gap = width / 3.5;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <line key={i}
          x1={i * gap + 2} y1={height - 1}
          x2={i * gap + gap - 3} y2={1}
          stroke={color} strokeWidth="1.3" strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   MAP PANEL
   ══════════════════════════════════════════════════════ */
function MapPanel() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError,  setMapError]  = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  return (
    <motion.div
      ref={ref}
      className="dqmq3-map-panel"
      variants={panelIn(0)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {/* Corner accents */}
      <span className="dqmq3-corner dqmq3-corner-tl" aria-hidden="true"/>
      <span className="dqmq3-corner dqmq3-corner-br" aria-hidden="true"/>

      {/* Top bar */}
      <div className="dqmq3-map-topbar">
        <span className="dqmq3-map-name">
          <span className="dqmq3-live-dot" aria-hidden="true"/>
          <Icon.MapPin size={13}/>
          DQD Gaming Hub — Kochi
        </span>
        <a
          className="dqmq3-dir-btn"
          href={GOOGLE_MAPS_DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get directions to DQD Gaming Hub"
        >
          <Icon.Navigation size={11}/>
          Directions
        </a>
      </div>

      {/* Map body */}
      <div className="dqmq3-map-body">
        {/* Skeleton */}
        <AnimatePresence>
          {!mapLoaded && !mapError && (
            <motion.div
              className="dqmq3-skeleton"
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              aria-hidden="true"
            >
              <Icon.MapPin size={30} color="rgba(123,47,255,0.2)"/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error fallback */}
        {mapError ? (
          <div className="dqmq3-map-error" role="alert">
            <Icon.WifiOff size={28} color={T.muted}/>
            <span className="dqmq3-map-error-label">Map unavailable</span>
            <a
              className="dqmq3-map-error-link"
              href={GOOGLE_MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon.ExternalLink size={11}/>
              Open in Google Maps
            </a>
          </div>
        ) : (
          <iframe
            className="dqmq3-map-iframe"
            src={GOOGLE_MAPS_EMBED_SRC}
            title="DQD Gaming Hub Location"
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setMapLoaded(true)}
            onError={() => { setMapError(true); setMapLoaded(true); }}
            style={{ opacity: mapLoaded ? 1 : 0, transition: "opacity 0.45s ease" }}
          />
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   ENQUIRY FORM
   ══════════════════════════════════════════════════════ */
const FIELDS = [
  { key: "name",    label: "Full Name", IconComp: Icon.User,          type: "text",     placeholder: "Your name",         autoComplete: "name",  required: true  },
  { key: "email",   label: "Email",     IconComp: Icon.AtSign,        type: "email",    placeholder: "you@example.com",   autoComplete: "email", required: true  },
  { key: "phone",   label: "Phone",     IconComp: Icon.Phone,         type: "tel",      placeholder: "+91 …",             autoComplete: "tel",   required: false },
  { key: "message", label: "Message",   IconComp: Icon.MessageSquare, type: "textarea", placeholder: "How can we help?",  autoComplete: "off",   required: false },
];

function EnquiryForm({ onSubmit }) {
  const [form,        setForm]       = useState({ name: "", email: "", phone: "", message: "" });
  const [errors,      setErrors]     = useState({});
  const [touched,     setTouched]    = useState({});
  const [status,      setStatus]     = useState("idle"); // idle | sending | sent | error
  const [globalError, setGlobalError] = useState("");
  const reduceMotion = useReducedMotion();
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  const handleChange = useCallback((key) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
    if (touched[key]) {
      const errs = validate({ ...form, [key]: val });
      setErrors((prev) => ({ ...prev, [key]: errs[key] }));
    }
  }, [form, touched]);

  const handleBlur = useCallback((key) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    const errs = validate(form);
    setErrors((prev) => ({ ...prev, [key]: errs[key] }));
  }, [form]);

  const handleSubmit = useCallback(async () => {
    const allTouched = Object.fromEntries(FIELDS.map((f) => [f.key, true]));
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("sending");
    setGlobalError("");

    try {
      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        {
          from_name: form.name,
          from_email: form.email,
          phone: form.phone || "Not provided",
          message: form.message || "No message",
          submitted_at: new Date().toLocaleString(),
        },
        { publicKey: emailjsConfig.publicKey }
      );
      onSubmit?.(form);
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", message: "" });
      setTouched({});
      setErrors({});
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
      setGlobalError("Transmission failed. Please check your connection and try again.");
    }
  }, [form, onSubmit]);

  return (
    <motion.div
      ref={ref}
      className="dqmq3-enquiry-panel"
      variants={panelIn(0.1)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <div className="dqmq3-form-title">
        <span className="dqmq3-form-title-bar" aria-hidden="true"/>
        <Icon.Mail size={14}/>
        Send an Enquiry
      </div>

      <AnimatePresence mode="wait">
        {status === "sent" ? (
          /* ── Success ── */
          <motion.div
            key="success"
            className="dqmq3-success"
            variants={successVariant}
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
              transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.1 }}
            >
              <Icon.Check size={24} color={T.success}/>
            </motion.div>
            <div className="dqmq3-success-title">Message Transmitted</div>
            <div className="dqmq3-success-sub">
              We'll respond within 24 hours.
            </div>
            <motion.button
              className="dqmq3-reset-btn"
              onClick={() => setStatus("idle")}
              whileHover={reduceMotion ? {} : { borderColor: T.border, color: T.text }}
              aria-label="Send another enquiry"
            >
              Send another
            </motion.button>
          </motion.div>
        ) : (
          /* ── Form ── */
          <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>

            {/* Global error */}
            <AnimatePresence>
              {globalError && (
                <motion.div
                  className="dqmq3-error-banner"
                  role="alert"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Icon.AlertCircle size={13} color={T.error}/>
                  {globalError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fields */}
            {FIELDS.map((f, i) => {
              const isInvalid = !!(touched[f.key] && errors[f.key]);
              return (
                <motion.div
                  key={f.key}
                  className="dqmq3-field"
                  variants={reduceMotion ? {} : fieldIn(i)}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                >
                  <label className="dqmq3-field-label" htmlFor={`dqmq3-${f.key}`}>
                    <f.IconComp size={11}/>
                    {f.label}
                    {f.required && <span className="dqmq3-required" aria-hidden="true">*</span>}
                  </label>

                  {f.type === "textarea" ? (
                    <textarea
                      id={`dqmq3-${f.key}`}
                      className={`dqmq3-input${isInvalid ? " is-invalid" : ""}`}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={handleChange(f.key)}
                      onBlur={handleBlur(f.key)}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? `dqmq3-${f.key}-err` : undefined}
                    />
                  ) : (
                    <input
                      id={`dqmq3-${f.key}`}
                      className={`dqmq3-input${isInvalid ? " is-invalid" : ""}`}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={handleChange(f.key)}
                      onBlur={handleBlur(f.key)}
                      aria-invalid={isInvalid}
                      aria-required={f.required}
                      aria-describedby={isInvalid ? `dqmq3-${f.key}-err` : undefined}
                      autoComplete={f.autoComplete}
                    />
                  )}

                  <AnimatePresence>
                    {isInvalid && (
                      <motion.div
                        id={`dqmq3-${f.key}-err`}
                        className="dqmq3-field-err"
                        role="alert"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <Icon.AlertCircle size={11} color={T.error}/>
                        {errors[f.key]}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Submit */}
            <motion.button
              className="dqmq3-submit"
              onClick={handleSubmit}
              disabled={status === "sending"}
              whileHover={status !== "sending" ? { scale: 1.012 } : {}}
              whileTap={status !== "sending"   ? { scale: 0.985 } : {}}
              aria-label="Submit enquiry"
            >
              {status === "sending" ? (
                <><span className="dqmq3-spinner" aria-hidden="true"/>Transmitting…</>
              ) : (
                <><Icon.Send size={13}/>Transmit Message</>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT EXPORT
   ══════════════════════════════════════════════════════ */
export default function MapAndEnquiry({ onSubmit }) {
  useEffect(() => { injectStyles(); }, []);

  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  return (
    <div className="dqmq3-section" ref={ref}>
      {/* Section label strip */}
      <motion.div
        className="dqmq3-strip"
        variants={panelIn(0)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <div
          className="dqmq3-strip-line"
          style={{ background: `linear-gradient(90deg, ${T.border}, transparent)` }}
          aria-hidden="true"
        />
        <Icon.MapPin size={13} color={T.vibrGlow}/>
        <span className="dqmq3-strip-label">Find Us &amp; Reach Out</span>
        <VibraniumSlash color="rgba(212,160,23,0.4)" width={32} height={11}/>
        <div
          className="dqmq3-strip-line"
          style={{ background: `linear-gradient(90deg, transparent, ${T.border})` }}
          aria-hidden="true"
        />
      </motion.div>

      <div className="dqmq3-grid">
        <MapPanel/>
        <EnquiryForm onSubmit={onSubmit}/>
      </div>
    </div>
  );
}