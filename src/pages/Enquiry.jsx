import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { emailjsConfig } from "../Auth/User/DashboardComponents/emailjsConfig";
/* ══════════════════════════════════════════════
   THEME — matches parent MapAndEnquiry exactly
══════════════════════════════════════════════ */
const T = {
  bg:      "#0a0a0f",
  bgCard:  "#0d0d1a",
  bgPanel: "#11111f",
  cyan:    "#00f5ff",
  purple:  "#7b2fff",
  pink:    "#ff006e",
  green:   "#39ff14",
  red:     "#ff4d6d",
  amber:   "#f59e0b",
  text:    "#e0e0ff",
  muted:   "#6b6b8a",
  border:  "rgba(0,245,255,0.15)",
};

/* ══════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════ */
const IconMail    = ({ size = 18, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6 8.5-6"/>
  </svg>
);
const IconUser    = ({ size = 18, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconPhone   = ({ size = 18, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0122 16.9z"/>
  </svg>
);
const IconMsg     = ({ size = 18, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const IconSend    = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
  </svg>
);
const IconCheck   = ({ size = 56, color = T.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/>
  </svg>
);
const IconX       = ({ size = 14, color = T.red }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);
const IconGamepad = ({ size = 20, color = T.purple }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="5"/>
    <path d="M6 12h4M8 10v4M15 11h.01M17 13h.01"/>
  </svg>
);

/* ══════════════════════════════════════════════
   MAGNETIC BUTTON WRAPPER
══════════════════════════════════════════════ */
function MagneticBtn({ children, className, onClick, disabled, type = "button" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouse = (e) => {
    if (disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * 0.22);
    y.set(dy * 0.22);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref} type={type} className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMouse} onMouseLeave={handleLeave}
      onClick={onClick} disabled={disabled}
      whileTap={!disabled ? { scale: 0.96 } : {}}
    >
      {children}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════
   GLITCH TEXT
══════════════════════════════════════════════ */
function GlitchText({ text, style = {} }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const fire = () => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 320);
    };
    const id = setInterval(fire, 3800 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`dqenq-glitch${glitch ? " dqenq-glitch-active" : ""}`} style={style}>
      {text}
      <span aria-hidden="true">{text}</span>
      <span aria-hidden="true">{text}</span>
    </span>
  );
}

/* ══════════════════════════════════════════════
   FLOATING PIXEL SPARKS
══════════════════════════════════════════════ */
function Sparks() {
  const sparks = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 5.5 + 3) % 100}%`,
    size: 2 + (i % 3),
    color: [T.cyan, T.purple, T.pink, T.amber][i % 4],
    duration: 4 + (i % 5),
    delay: (i * 0.4) % 4,
    yRange: [-(20 + (i % 30)), 10 + (i % 20)],
  }));

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {sparks.map((s) => (
        <motion.div key={s.id}
          style={{
            position: "absolute", bottom: 0, left: s.left,
            width: s.size, height: s.size,
            background: s.color, borderRadius: "50%",
            filter: `blur(0.5px)`,
            boxShadow: `0 0 4px ${s.color}`,
          }}
          animate={{
            y: s.yRange,
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.4, 0.8, 0],
          }}
          transition={{
            duration: s.duration, delay: s.delay,
            repeat: Infinity, ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   TYPING PLACEHOLDER
══════════════════════════════════════════════ */
function useTypingPlaceholder(phrases, speed = 70, pause = 1800) {
  const [text, setText] = useState("");
  const [pi, setPi]     = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const phrase = phrases[pi % phrases.length];
    let timeout;
    if (typing) {
      if (text.length < phrase.length) {
        timeout = setTimeout(() => setText(phrase.slice(0, text.length + 1)), speed);
      } else {
        timeout = setTimeout(() => setTyping(false), pause);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), speed / 2);
      } else {
        setPi((p) => p + 1);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [text, typing, pi, phrases, speed, pause]);

  return text;
}

/* ══════════════════════════════════════════════
   FIELD WITH ICON + FOCUS FX
══════════════════════════════════════════════ */
function EnqField({ id, label, icon: Icon, type = "text", value, onChange, required, multiline, placeholder }) {
  const [focused, setFocused] = useState(false);
  const [filled, setFilled]   = useState(false);
  const As = multiline ? "textarea" : "input";

  return (
    <motion.div
      className="dqenq-field"
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
    >
      {/* label row */}
      <div className="dqenq-label-row">
        <motion.span
          className="dqenq-field-icon"
          animate={{
            color: focused ? T.cyan : T.muted,
            filter: focused ? `drop-shadow(0 0 6px ${T.cyan})` : "none",
          }}
          transition={{ duration: 0.25 }}
        >
          <Icon size={15} color="currentColor" />
        </motion.span>
        <motion.label
          htmlFor={id}
          className="dqenq-label"
          animate={{ color: focused ? T.cyan : T.muted }}
          transition={{ duration: 0.2 }}
        >
          {label}
          {required && <span style={{ color: T.pink }}> *</span>}
        </motion.label>
        <AnimatePresence>
          {filled && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}
            >
              <motion.div
                style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* input wrapper */}
      <div style={{ position: "relative" }}>
        {/* left accent bar */}
        <motion.div
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
            background: `linear-gradient(180deg, ${T.cyan}, ${T.purple})`,
            transformOrigin: "top",
          }}
          animate={{ scaleY: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <As
          id={id} type={type} value={value}
          placeholder={placeholder}
          className="dqenq-input"
          onChange={(e) => { onChange(e); setFilled(e.target.value.length > 0); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          style={multiline ? { resize: "vertical", minHeight: 90 } : {}}
        />

        {/* bottom glow line */}
        <motion.div
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 1.5,
            background: `linear-gradient(90deg, ${T.cyan}, ${T.purple}, ${T.pink})`,
            transformOrigin: "left",
          }}
          animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.35 }}
        />
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   CHARACTER COUNT RING
══════════════════════════════════════════════ */
function CharRing({ count, max = 500 }) {
  const pct = Math.min(count / max, 1);
  const r   = 14; const c = 2 * Math.PI * r;
  const over = pct > 0.85;
  return (
    <motion.svg width={36} height={36} viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
      <circle cx="18" cy="18" r={r} fill="none" stroke={T.bgCard} strokeWidth="3"/>
      <motion.circle
        cx="18" cy="18" r={r} fill="none"
        stroke={over ? T.pink : T.cyan}
        strokeWidth="3" strokeLinecap="round"
        strokeDasharray={c}
        animate={{ strokeDashoffset: c * (1 - pct) }}
        transition={{ duration: 0.3 }}
        style={{ rotate: -90, transformOrigin: "18px 18px" }}
      />
      <text x="18" y="22" textAnchor="middle"
        style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, fill: over ? T.pink : T.muted }}>
        {count}
      </text>
    </motion.svg>
  );
}

/* ══════════════════════════════════════════════
   SUCCESS SCREEN
══════════════════════════════════════════════ */
function SuccessScreen({ name }) {
  return (
    <motion.div
      className="dqenq-success"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 16 }}
    >
      {/* concentric pulse rings */}
      {[80, 130, 180].map((s, i) => (
        <motion.div key={s}
          style={{
            position: "absolute", top: "50%", left: "50%",
            width: s, height: s,
            marginLeft: -s / 2, marginTop: -s / 2,
            borderRadius: "50%",
            border: `1px solid ${T.green}`,
            pointerEvents: "none",
          }}
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity }}
        />
      ))}

      <motion.div
        animate={{
          filter: [`drop-shadow(0 0 8px ${T.green})`, `drop-shadow(0 0 28px ${T.green})`, `drop-shadow(0 0 8px ${T.green})`],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <IconCheck size={60} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14, letterSpacing: "0.6em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "0.2em" }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="dqenq-success-title"
      >
        Signal Received!
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="dqenq-success-sub"
      >
        {name ? `Hey ${name}, we` : "We"}'ll ping you back within 24h.
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}
      >
        {["DQD", "·", "KOCHI", "·", "GAMING HUB"].map((w, i) => (
          <motion.span key={i}
            style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: T.muted, letterSpacing: 1 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
          >
            {w}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function Enquiry({ onSubmit }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError]   = useState("");
  const [hoverBtn, setHoverBtn] = useState(false);

  const msgPlaceholder = useTypingPlaceholder([
    "Ask about game availability…",
    "Enquire about console deals…",
    "Need a custom gaming setup?",
    "Want to know our trade-in rates?",
  ]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.email) return;
    setStatus("sending");
    setError("");
    const params = {
      from_name:    form.name,
      from_email:   form.email,
      phone:        form.phone || "Not provided",
      message:      form.message || "No message provided",
      submitted_at: new Date().toLocaleString(),
    };
    try {
      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        params,
        { publicKey: emailjsConfig.publicKey }
      );
      if (onSubmit) onSubmit(form);
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("idle");
      setError("Transmission failed. Check your connection and try again.");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        /* ── SECTION WRAPPER ── */
        .dqenq-section {
          position: relative;
          background: ${T.bg};
          padding: 96px 24px 112px;
          overflow: hidden;
          isolation: isolate;
        }
        /* scanline texture */
        .dqenq-section::before {
          content: '';
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,245,255,0.01) 3px, rgba(0,245,255,0.01) 4px
          );
        }

        /* ── AMBIENT ORBS ── */
        .dqenq-orb {
          position: absolute; border-radius: 50%;
          filter: blur(100px); pointer-events: none; z-index: 0;
        }

        /* ── INNER CONTAINER ── */
        .dqenq-inner {
          position: relative; z-index: 1;
          max-width: 680px; margin: 0 auto;
        }

        /* ── EYEBROW ── */
        .dqenq-eyebrow {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px; letter-spacing: 0.28em;
          text-transform: uppercase; color: ${T.muted};
          margin-bottom: 12px;
          display: flex; align-items: center; gap: 10px;
        }
        .dqenq-eyebrow-line {
          flex: 1; max-width: 48px; height: 1px;
          background: linear-gradient(90deg, ${T.cyan}, transparent);
        }

        /* ── HEADING ── */
        .dqenq-heading {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(1.6rem, 4.5vw, 2.6rem);
          font-weight: 900; line-height: 1.1;
          color: #fff; margin-bottom: 6px;
          letter-spacing: -0.01em;
        }

        /* ── GLITCH EFFECT ── */
        .dqenq-glitch {
          position: relative; display: inline-block;
          background: linear-gradient(90deg, ${T.cyan}, ${T.purple});
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dqenq-glitch span { position: absolute; top: 0; left: 0; width: 100%; }
        .dqenq-glitch span:first-of-type  { color: ${T.pink}; -webkit-text-fill-color: ${T.pink}; opacity: 0; clip-path: polygon(0 30%, 100% 30%, 100% 50%, 0 50%); }
        .dqenq-glitch span:last-of-type   { color: ${T.cyan}; -webkit-text-fill-color: ${T.cyan}; opacity: 0; clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); }
        .dqenq-glitch-active span:first-of-type { animation: glitch1 0.32s steps(3) forwards; }
        .dqenq-glitch-active span:last-of-type  { animation: glitch2 0.32s steps(3) 0.05s forwards; }
        @keyframes glitch1 {
          0%   { opacity: 1; transform: translate(-3px, 0); }
          50%  { opacity: 1; transform: translate(3px,  1px); }
          100% { opacity: 0; transform: translate(0, 0); }
        }
        @keyframes glitch2 {
          0%   { opacity: 1; transform: translate(3px, 0); }
          50%  { opacity: 1; transform: translate(-3px, -1px); }
          100% { opacity: 0; transform: translate(0, 0); }
        }

        /* ── SUB HEADING ── */
        .dqenq-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 1.05rem; color: ${T.muted};
          margin-bottom: 44px; line-height: 1.6;
        }

        /* ── CARD ── */
        .dqenq-card {
          position: relative;
          background: ${T.bgPanel};
          border: 1px solid ${T.border};
          clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
          overflow: hidden;
          padding: 36px 36px 40px;
        }
        /* top gradient bar */
        .dqenq-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, ${T.cyan}, ${T.purple}, ${T.pink});
        }
        /* corner accents */
        .dqenq-corner-tl {
          position: absolute; top: -1px; left: -1px;
          width: 22px; height: 22px;
          border-top: 2px solid ${T.cyan}; border-left: 2px solid ${T.cyan};
          pointer-events: none;
        }
        .dqenq-corner-br {
          position: absolute; bottom: -1px; right: -1px;
          width: 22px; height: 22px;
          border-bottom: 2px solid ${T.pink}; border-right: 2px solid ${T.pink};
          pointer-events: none;
        }

        /* ── CARD HEADER ── */
        .dqenq-card-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 1px solid ${T.border};
        }
        .dqenq-card-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: ${T.cyan};
        }
        .dqenq-live-dot {
          margin-left: auto;
          display: flex; align-items: center; gap: 6px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.6rem; letter-spacing: 2px; color: ${T.muted};
        }

        /* ── FIELDS ── */
        .dqenq-field { margin-bottom: 18px; }

        .dqenq-label-row {
          display: flex; align-items: center; gap: 7px;
          margin-bottom: 7px;
        }
        .dqenq-field-icon {
          display: flex; align-items: center; flex-shrink: 0;
        }
        .dqenq-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.62rem; letter-spacing: 2px;
          text-transform: uppercase;
        }

        .dqenq-input {
          width: 100%;
          background: ${T.bg};
          border: 1px solid ${T.border};
          color: ${T.text};
          padding: 11px 14px 11px 18px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.82rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
          caret-color: ${T.cyan};
        }
        .dqenq-input:focus { border-color: ${T.cyan}55; background: rgba(0,245,255,0.025); }
        .dqenq-input::placeholder { color: ${T.muted}; font-size: 0.75rem; }

        /* ── TWO-COL ROW ── */
        .dqenq-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 480px) {
          .dqenq-row { grid-template-columns: 1fr; }
        }

        /* ── MESSAGE FOOTER ── */
        .dqenq-msg-footer {
          display: flex; align-items: center; gap: 8px;
          margin-top: 6px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.6rem; letter-spacing: 1.5px; color: ${T.muted};
        }

        /* ── SUBMIT BUTTON ── */
        .dqenq-submit {
          width: 100%; margin-top: 24px;
          padding: 16px 24px;
          background: linear-gradient(135deg, rgba(0,245,255,0.1), rgba(123,47,255,0.25));
          border: 1px solid ${T.cyan}60;
          color: ${T.cyan};
          font-family: 'Orbitron', sans-serif;
          font-size: 0.74rem; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase;
          cursor: pointer; position: relative; overflow: hidden;
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: box-shadow 0.3s, border-color 0.3s;
        }
        .dqenq-submit:hover:not(:disabled) {
          box-shadow: 0 0 40px ${T.cyan}28, inset 0 0 20px rgba(0,245,255,0.06);
          border-color: ${T.cyan};
        }
        .dqenq-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── ERROR ── */
        .dqenq-error {
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(255,77,109,0.07);
          border: 1px solid ${T.red}44;
          padding: 10px 14px; margin-bottom: 18px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.7rem; color: ${T.red}; letter-spacing: 1px;
        }

        /* ── SUCCESS ── */
        .dqenq-success {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 14px;
          padding: 52px 20px;
          position: relative; text-align: center;
          min-height: 320px;
        }
        .dqenq-success-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem; font-weight: 700;
          color: ${T.green}; text-transform: uppercase; letter-spacing: 0.2em;
        }
        .dqenq-success-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 1rem; color: ${T.muted};
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 600px) {
          .dqenq-section { padding: 72px 16px 88px; }
          .dqenq-card { padding: 26px 20px 30px; }
          .dqenq-heading { font-size: 1.5rem; }
        }
        @media (max-width: 380px) {
          .dqenq-submit { font-size: 0.64rem; letter-spacing: 2px; }
        }
      `}</style>

      <section className="dqenq-section">
        {/* ambient orbs */}
        <motion.div className="dqenq-orb"
          style={{ width: 480, height: 480, top: -180, right: -120, background: "rgba(123,47,255,0.07)" }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 9, repeat: Infinity }}
        />
        <motion.div className="dqenq-orb"
          style={{ width: 360, height: 360, bottom: -100, left: -80, background: "rgba(0,245,255,0.05)" }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, delay: 1.5 }}
        />

        {/* floating pixel sparks */}
        <Sparks />

        <div className="dqenq-inner">

          {/* ── SECTION HEADER ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
              
          >
            <br/>
            {/* <br/> */}
            
            <div className="dqenq-eyebrow"  >
              <div className="dqenq-eyebrow-line"  />
              DQD Gaming Hub · Kochi
              <div className="dqenq-eyebrow-line" style={{ background: `linear-gradient(90deg, transparent, ${T.purple})` }} />
            </div>

            <h2 className="dqenq-heading">
              Drop Us a{" "}
              <GlitchText text="Signal" />
            </h2>
            <motion.p
              className="dqenq-sub"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Questions about consoles, games, or gear? Transmit your enquiry — our team responds within 24 hours.
            </motion.p>
          </motion.div>

          {/* ── ENQUIRY CARD ── */}
          <motion.div
            className="dqenq-card"
            initial={{ opacity: 0, y: 40, rotateX: 6 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.15 }}
            whileHover={{ boxShadow: `0 20px 60px rgba(0,245,255,0.07)` }}
          >
            <div className="dqenq-corner-tl" />
            <div className="dqenq-corner-br" />

            {/* card header */}
            <div className="dqenq-card-header">
              <motion.span
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
              >
                <IconGamepad size={18} color={T.purple} />
              </motion.span>
              <span className="dqenq-card-title">Send an Enquiry</span>
              <div className="dqenq-live-dot">
                <motion.div
                  style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }}
                  animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                ONLINE
              </div>
            </div>

            {/* FORM / SUCCESS */}
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SuccessScreen name={form.name} />
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -16 }}>

                  {/* error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="dqenq-error"
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
                      >
                        <IconX size={13} color={T.red} />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* name + email row */}
                  <div className="dqenq-row">
                    <EnqField
                      id="dqenq-name" label="Full Name" icon={IconUser}
                      value={form.name} onChange={set("name")}
                      placeholder="Your name" required
                    />
                    <EnqField
                      id="dqenq-email" label="Email" icon={IconMail}
                      type="email" value={form.email} onChange={set("email")}
                      placeholder="name@email.com" required
                    />
                  </div>

                  {/* phone */}
                  <EnqField
                    id="dqenq-phone" label="Phone (optional)" icon={IconPhone}
                    value={form.phone} onChange={set("phone")}
                    placeholder="+91 98765 43210"
                  />

                  {/* message */}
                  <EnqField
                    id="dqenq-message" label="Message" icon={IconMsg}
                    value={form.message} onChange={set("message")}
                    placeholder={msgPlaceholder || "Tell us what you need…"}
                    multiline
                  />

                  {/* char count row */}
                  <div className="dqenq-msg-footer">
                    <CharRing count={form.message.length} />
                    <span>{form.message.length} / 500 chars</span>
                    <motion.span
                      style={{ marginLeft: "auto", color: T.cyan, fontSize: "0.58rem", letterSpacing: 2 }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ENCRYPTED · SECURE
                    </motion.span>
                  </div>

                  {/* SUBMIT */}
                  <MagneticBtn
                    className="dqenq-submit"
                    onClick={submit}
                    disabled={status === "sending" || !form.name || !form.email}
                    onMouseEnter={() => setHoverBtn(true)}
                    onMouseLeave={() => setHoverBtn(false)}
                  >
                    {/* shimmer sweep */}
                    <motion.span
                      style={{
                        position: "absolute", inset: 0, pointerEvents: "none",
                        background: "linear-gradient(90deg, transparent, rgba(0,245,255,0.14), transparent)",
                        skewX: "-18deg",
                      }}
                      initial={{ x: "-110%" }}
                      animate={hoverBtn ? { x: "220%" } : { x: "-110%" }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    />

                    {status === "sending" ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                        >
                          <IconMail size={15} color={T.cyan} />
                        </motion.span>
                        Transmitting…
                      </>
                    ) : (
                      <>
                        <motion.span
                          animate={{ x: [0, 5, 0], y: [0, -3, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity }}
                        >
                          <IconSend size={15} />
                        </motion.span>
                        Transmit Message
                      </>
                    )}
                  </MagneticBtn>

                  {/* footer note */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 }}
                    style={{
                      marginTop: 16, textAlign: "center",
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: "0.6rem", letterSpacing: "0.15em",
                      color: T.muted,
                    }}
                  >
                    No spam. Just gaming talk.{" "}
                    <motion.span
                      style={{ color: T.cyan }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      ↗ DQD Gaming Hub, Kadavanthra, Kochi
                    </motion.span>
                  </motion.p>

                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </>
  );
}