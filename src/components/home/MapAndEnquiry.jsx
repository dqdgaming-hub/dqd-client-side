import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { emailjsConfig } from "../../Auth/User/DashboardComponents/emailjsConfig";

/* ══════════════════════════════════════════════
   THEME
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

const GOOGLE_MAPS_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7859.174438734689!2d76.296995974871!3d9.968259590135524!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b087306fc6f7f17%3A0x39dba6f2646508c!2sDQD%20gaming%20hub!5e0!3m2!1sen!2sin!4v1782466743374!5m2!1sen!2sin";
const GOOGLE_MAPS_DIRECTIONS_URL = "https://maps.app.goo.gl/KgzawVaozWH67PPDA";

/* ══════════════════════════════════════════════
   INLINE ICONS
══════════════════════════════════════════════ */
const IconMapPin = ({ size = 16, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-7.4-7-12a7 7 0 1114 0c0 4.6-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" />
  </svg>
);
const IconMail = ({ size = 16, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5l8.5 6 8.5-6" />
  </svg>
);
const IconRoute = ({ size = 13, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" />
    <path d="M8 19h7a3 3 0 003-3v-1a3 3 0 00-3-3H9a3 3 0 01-3-3v-1a3 3 0 013-3h2" />
  </svg>
);
const IconCheck = ({ size = 36, color = T.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M7.5 12.5l3 3 6-6.5" />
  </svg>
);
const IconSend = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);
const IconSignal = ({ size = 14, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16" />
  </svg>
);

/* ══════════════════════════════════════════════
   FLOATING PARTICLE
══════════════════════════════════════════════ */
function Particle({ x, y, color, delay, size }) {
  return (
    <motion.div
      style={{
        position: "absolute", left: x, top: y,
        width: size, height: size, borderRadius: "50%",
        background: color, filter: `blur(${size / 2.5}px)`,
        pointerEvents: "none", zIndex: 0,
      }}
      animate={{ y: [0, -20, 0, 10, 0], x: [0, 8, -5, 0], opacity: [0.5, 1, 0.3, 0.8, 0.5], scale: [1, 1.4, 0.8, 1.2, 1] }}
      transition={{ duration: 5 + delay * 0.7, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ══════════════════════════════════════════════
   SCAN LINE (animated sweep on cards)
══════════════════════════════════════════════ */
function ScanSweep({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          style={{
            position: "absolute", inset: 0, width: "45%", pointerEvents: "none", zIndex: 2,
            background: "linear-gradient(90deg, transparent, rgba(0,245,255,0.07), transparent)",
          }}
          initial={{ x: "-110%", skewX: "-18deg" }}
          animate={{ x: "310%" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════
   ORBIT RING
══════════════════════════════════════════════ */
function OrbitRing({ size, color, duration, opacity = 0.1 }) {
  return (
    <motion.svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", pointerEvents: "none" }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <circle cx={size/2} cy={size/2} r={size/2 - 2}
        fill="none" stroke={color} strokeWidth="1"
        strokeDasharray="5 16" opacity={opacity} />
    </motion.svg>
  );
}

/* ══════════════════════════════════════════════
   ANIMATED FORM FIELD
══════════════════════════════════════════════ */
function Field({ id, label, type = "text", placeholder, value, onChange, required, as: As = "input" }) {
  const [focused, setFocused] = useState(false);
  const [filled,  setFilled]  = useState(false);

  return (
    <motion.div
      className="dqmq2-field"
      initial={{ opacity: 0, x: -18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
    >
      <motion.label
        className="dqmq2-label"
        htmlFor={id}
        animate={{ color: focused ? T.cyan : T.muted, x: focused ? 2 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {label}
        {required && <span style={{ color: T.pink, marginLeft: 4 }}>*</span>}
      </motion.label>

      <div style={{ position: "relative" }}>
        <As
          id={id}
          className="dqmq2-input"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => { onChange(e); setFilled(e.target.value.length > 0); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          style={{ resize: As === "textarea" ? "vertical" : undefined, minHeight: As === "textarea" ? 90 : undefined }}
        />
        {/* focus glow line */}
        <motion.div
          style={{
            position: "absolute", bottom: 0, left: 0, height: 2,
            background: `linear-gradient(90deg, ${T.cyan}, ${T.purple})`,
            transformOrigin: "left",
          }}
          animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        {/* filled indicator dot */}
        <AnimatePresence>
          {filled && !focused && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                width: 6, height: 6, borderRadius: "50%", background: T.green,
                boxShadow: `0 0 8px ${T.green}`,
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   SUCCESS STATE
══════════════════════════════════════════════ */
function SuccessState() {
  return (
    <motion.div
      style={{ textAlign: "center", padding: "36px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 14 }}
    >
      {/* pulsing check */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], filter: [`drop-shadow(0 0 8px ${T.green})`, `drop-shadow(0 0 24px ${T.green})`, `drop-shadow(0 0 8px ${T.green})`] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <IconCheck size={48} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10, letterSpacing: "0.6em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "0.24em" }}
        transition={{ delay: 0.25, duration: 0.7 }}
        style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", fontWeight: 700, color: T.green, textTransform: "uppercase" }}
      >
        Message Transmitted
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.7rem", color: T.muted, letterSpacing: 1 }}
      >
        We'll respond within 24 hours.
      </motion.div>

      {/* orbit rings around success */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
        <OrbitRing size={160} color={T.green}  duration={5}  opacity={0.18} />
        <OrbitRing size={220} color={T.cyan}   duration={8}  opacity={0.1} />
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function MapAndEnquiry({ onSubmit }) {
  const sectionRef  = useRef(null);
  const [form, setForm]   = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle");   // idle | sending | sent
  const [error,  setError]  = useState("");
  const [mapScan, setMapScan] = useState(false);
  const [formScan, setFormScan] = useState(false);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const headY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setStatus("sending");
    setError("");
    const params = {
      from_name: form.name, from_email: form.email,
      phone: form.phone || "Not provided",
      message: form.message || "No message provided",
      submitted_at: new Date().toLocaleString(),
    };
    try {
      await emailjs.send(emailjsConfig.serviceId, emailjsConfig.templateId, params, { publicKey: emailjsConfig.publicKey });
      if (onSubmit) onSubmit(form);
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setStatus("idle");
      setError("Transmission failed. Please try again.");
    }
  };

  const particles = [
    { x: "4%",  y: "12%", color: T.cyan,   delay: 0,   size: 5 },
    { x: "93%", y: "8%",  color: T.pink,   delay: 1.1, size: 4 },
    { x: "88%", y: "78%", color: T.purple, delay: 0.5, size: 6 },
    { x: "2%",  y: "82%", color: T.amber,  delay: 1.7, size: 3 },
    { x: "48%", y: "3%",  color: T.cyan,   delay: 2.3, size: 4 },
    { x: "60%", y: "95%", color: T.pink,   delay: 0.9, size: 3 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500&display=swap');

        .dqmq2-wrap {
          position: relative;
          background: ${T.bg};
          padding: 90px 0 110px;
          overflow: hidden;
        }
        .dqmq2-wrap::before {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,245,255,0.012) 2px, rgba(0,245,255,0.012) 4px
          );
          pointer-events: none; z-index: 0;
        }
        .dqmq2-bg-orb {
          position: absolute; border-radius: 50%;
          filter: blur(90px); pointer-events: none; z-index: 0;
        }
        .dqmq2-inner {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto; padding: 0 28px;
        }

        /* ── section heading ── */
        .dqmq2-section-heading {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(18px, 2.4vw, 28px);
          font-weight: 900; color: #fff;
          text-transform: uppercase; letter-spacing: 3px;
          margin-bottom: 10px;
          display: flex; align-items: center; gap: 12px;
        }
        .dqmq2-section-sub {
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px; color: ${T.muted};
          letter-spacing: 3px; text-transform: uppercase;
          margin-bottom: 48px;
          display: flex; align-items: center; gap: 10px;
        }
        .dqmq2-section-sub::before {
          content: ''; width: 32px; height: 1px;
          background: ${T.cyan}; opacity: 0.4;
        }

        /* ── grid ── */
        .dqmq2-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          align-items: start;
        }

        /* ── shared card shell ── */
        .dqmq2-card {
          position: relative;
          background: ${T.bgPanel};
          border: 1px solid ${T.border};
          clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px));
          overflow: hidden;
          transition: border-color 0.35s;
        }
        .dqmq2-card:hover { border-color: rgba(0,245,255,0.32); }

        /* corner accents */
        .dqmq2-corner {
          position: absolute; width: 18px; height: 18px;
          pointer-events: none; z-index: 3;
        }
        .dqmq2-corner-tl { top: -1px; left: -1px; border-top: 2px solid ${T.cyan}; border-left: 2px solid ${T.cyan}; }
        .dqmq2-corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid ${T.pink}; border-right: 2px solid ${T.pink}; }

        /* ── map card ── */
        .dqmq2-map-header {
          padding: 14px 20px;
          background: ${T.bgCard};
          border-bottom: 1px solid ${T.border};
          display: flex; align-items: center;
          justify-content: space-between; gap: 10px; flex-wrap: wrap;
        }
        .dqmq2-map-title {
          font-family: 'Orbitron', sans-serif; font-size: 0.7rem;
          font-weight: 700; color: ${T.cyan};
          letter-spacing: 2px; text-transform: uppercase;
          display: flex; align-items: center; gap: 8px;
        }
        .dqmq2-directions {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'Share Tech Mono', monospace; font-size: 0.63rem;
          letter-spacing: 1px; text-transform: uppercase;
          color: ${T.cyan}; text-decoration: none;
          border: 1px solid ${T.cyan}55; padding: 5px 11px;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .dqmq2-directions:hover { background: ${T.cyan}18; box-shadow: 0 0 14px ${T.cyan}22; }
        .dqmq2-map-iframe {
          width: 100%; height: 360px; border: none; display: block;
        }
        /* map overlay pulse */
        .dqmq2-map-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 60px;
          background: linear-gradient(to top, ${T.bgPanel}88, transparent);
          pointer-events: none; z-index: 1;
        }

        /* ── enquiry card ── */
        .dqmq2-enquiry-inner { padding: 26px 26px 28px; }
        .dqmq2-enquiry-title {
          font-family: 'Orbitron', sans-serif; font-size: 0.78rem;
          font-weight: 700; color: ${T.cyan};
          letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 22px;
          display: flex; align-items: center; gap: 8px;
        }

        /* ── field ── */
        .dqmq2-field { margin-bottom: 14px; }
        .dqmq2-label {
          display: block;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.62rem; letter-spacing: 2px;
          text-transform: uppercase; margin-bottom: 6px;
        }
        .dqmq2-input {
          width: 100%; background: ${T.bg};
          border: 1px solid ${T.border};
          color: ${T.text}; padding: 10px 14px;
          font-family: 'Share Tech Mono', monospace; font-size: 0.8rem;
          outline: none; transition: border-color 0.2s; box-sizing: border-box;
        }
        .dqmq2-input:focus { border-color: ${T.cyan}70; }
        .dqmq2-input::placeholder { color: ${T.muted}; }

        /* ── submit btn ── */
        .dqmq2-submit {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, ${T.cyan}18, ${T.purple}30);
          border: 1px solid ${T.cyan}60; color: ${T.cyan};
          font-family: 'Orbitron', sans-serif; font-size: 0.72rem;
          font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
          cursor: pointer;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; overflow: hidden;
          transition: box-shadow 0.25s;
        }
        .dqmq2-submit:hover:not(:disabled) { box-shadow: 0 0 28px ${T.cyan}30; }
        .dqmq2-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .dqmq2-submit-shimmer {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(0,245,255,0.12), transparent);
        }

        /* ── error msg ── */
        .dqmq2-error {
          font-family: 'Share Tech Mono', monospace; font-size: 0.72rem;
          color: ${T.red}; border: 1px solid ${T.red}44;
          padding: 10px 14px; margin-bottom: 14px; letter-spacing: 1px;
        }

        /* ── signal bar decorations ── */
        .dqmq2-signal {
          display: flex; align-items: flex-end; gap: 3px;
        }
        .dqmq2-signal-bar {
          width: 3px; background: ${T.cyan}; border-radius: 1px;
        }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 860px) {
          .dqmq2-grid { grid-template-columns: 1fr; gap: 24px; }
          .dqmq2-wrap { padding: 64px 0 80px; }
          .dqmq2-inner { padding: 0 16px; }
        }
        @media (max-width: 540px) {
          .dqmq2-map-iframe { height: 240px; }
          .dqmq2-enquiry-inner { padding: 18px 16px 22px; }
          .dqmq2-section-heading { font-size: 17px; letter-spacing: 2px; }
        }
        @media (max-width: 380px) {
          .dqmq2-map-iframe { height: 200px; }
          .dqmq2-submit { font-size: 0.63rem; letter-spacing: 2px; }
        }
      `}</style>

      <div className="dqmq2-wrap" ref={sectionRef}>
        {/* ── ambient orbs ── */}
        <motion.div className="dqmq2-bg-orb"
          style={{ width: 500, height: 500, top: -150, left: -100, background: "rgba(0,245,255,0.05)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div className="dqmq2-bg-orb"
          style={{ width: 400, height: 400, bottom: -120, right: -80, background: "rgba(123,47,255,0.05)" }}
          animate={{ scale: [1, 1.14, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* ── floating particles ── */}
        {particles.map((p, i) => <Particle key={i} {...p} />)}

        <div className="dqmq2-inner">

          {/* ── section heading ── */}
          <motion.div style={{ y: headY }}>
            <motion.div
              className="dqmq2-section-heading"
              initial={{ opacity: 0, x: -30, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <IconMapPin size={22} />
              </motion.span>
              <span>Find Us &amp;</span>
              <motion.span
                style={{
                  background: `linear-gradient(135deg, ${T.cyan}, ${T.purple}, ${T.pink})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text", backgroundSize: "200% 200%",
                }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Reach Out
              </motion.span>
            </motion.div>

            <motion.div
              className="dqmq2-section-sub"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <IconSignal size={12} color={T.cyan} />
              DQD Gaming Hub · Kochi, Kerala
            </motion.div>
          </motion.div>

          {/* ── two-col grid ── */}
          <div className="dqmq2-grid">

            {/* ══════════ MAP CARD ══════════ */}
            <motion.div
              className="dqmq2-card"
              initial={{ opacity: 0, x: -50, rotateY: -8 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 130, damping: 18, delay: 0.1 }}
              onViewportEnter={() => { setTimeout(() => setMapScan(true), 200); setTimeout(() => setMapScan(false), 1200); }}
              whileHover={{ y: -4, boxShadow: `0 16px 48px rgba(0,245,255,0.08)` }}
            >
              <div className="dqmq2-corner dqmq2-corner-tl" />
              <div className="dqmq2-corner dqmq2-corner-br" />
              <ScanSweep active={mapScan} />

              {/* orbit rings behind map header */}
              <div style={{ position: "absolute", top: 28, right: -60, pointerEvents: "none", opacity: 0.5 }}>
                <OrbitRing size={120} color={T.cyan} duration={12} opacity={0.12} />
              </div>

              <div className="dqmq2-map-header">
                <motion.span
                  className="dqmq2-map-title"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1], filter: [`drop-shadow(0 0 3px ${T.cyan})`, `drop-shadow(0 0 10px ${T.cyan})`, `drop-shadow(0 0 3px ${T.cyan})`] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <IconMapPin size={14} />
                  </motion.span>
                  DQD Gaming Hub — Kochi
                </motion.span>

                <motion.a
                  className="dqmq2-directions"
                  href={GOOGLE_MAPS_DIRECTIONS_URL}
                  target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
                    <IconRoute />
                  </motion.span>
                  Get Directions
                </motion.a>
              </div>

              <motion.div
                style={{ position: "relative", overflow: "hidden" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.6 }}
              >
                <iframe
                  className="dqmq2-map-iframe"
                  src={GOOGLE_MAPS_EMBED_SRC}
                  title="DQD Gaming Hub Location"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                <div className="dqmq2-map-overlay" />
              </motion.div>

              {/* live signal bars at bottom */}
              <motion.div
                style={{ padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, borderTop: `1px solid ${T.border}` }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <div className="dqmq2-signal">
                  {[8, 12, 16, 20, 14].map((h, i) => (
                    <motion.div key={i} className="dqmq2-signal-bar" style={{ height: h }}
                      animate={{ opacity: [0.3, 1, 0.3], height: [h * 0.6, h, h * 0.6] }}
                      transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </div>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.62rem", color: T.muted, letterSpacing: 2 }}>
                  LIVE LOCATION
                </span>
                <motion.div
                  style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>

            {/* ══════════ ENQUIRY CARD ══════════ */}
            <motion.div
              className="dqmq2-card"
              initial={{ opacity: 0, x: 50, rotateY: 8 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 130, damping: 18, delay: 0.2 }}
              onViewportEnter={() => { setTimeout(() => setFormScan(true), 350); setTimeout(() => setFormScan(false), 1350); }}
              whileHover={{ y: -4, boxShadow: `0 16px 48px rgba(123,47,255,0.08)` }}
            >
              <div className="dqmq2-corner dqmq2-corner-tl" />
              <div className="dqmq2-corner dqmq2-corner-br" />
              <ScanSweep active={formScan} />

              <div style={{ position: "absolute", bottom: -40, left: -40, pointerEvents: "none", opacity: 0.4 }}>
                <OrbitRing size={140} color={T.purple} duration={10} opacity={0.15} />
              </div>

              <div className="dqmq2-enquiry-inner" style={{ position: "relative" }}>
                <motion.div
                  className="dqmq2-enquiry-title"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.span
                    animate={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  >
                    <IconMail size={15} />
                  </motion.span>
                  Send an Enquiry
                </motion.div>

                <AnimatePresence mode="wait">
                  {status === "sent" ? (
                    <motion.div key="success" style={{ position: "relative", minHeight: 300 }}>
                      <SuccessState />
                    </motion.div>
                  ) : (
                    <motion.div key="form"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AnimatePresence>
                        {error && (
                          <motion.div className="dqmq2-error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            ⚠ {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Field id="dqmq2-name"    label="Full Name" placeholder="Your name"       value={form.name}    onChange={e => setForm({ ...form, name: e.target.value })}    required />
                      <Field id="dqmq2-email"   label="Email"     type="email" placeholder="name@gmail.com" value={form.email}   onChange={e => setForm({ ...form, email: e.target.value })}   required />
                      <Field id="dqmq2-phone"   label="Phone"     placeholder="+91 ..."          value={form.phone}   onChange={e => setForm({ ...form, phone: e.target.value })} />
                      <Field id="dqmq2-message" label="Message"   placeholder="Tell us what you need..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} as="textarea" />

                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 180, damping: 16 }}
                      >
                        <motion.button
                          className="dqmq2-submit"
                          type="button"
                          disabled={status === "sending"}
                          onClick={submit}
                          whileHover={status !== "sending" ? { scale: 1.02, y: -2 } : {}}
                          whileTap={status !== "sending" ? { scale: 0.97 } : {}}
                        >
                          {/* shimmer sweep on hover */}
                          <motion.span
                            className="dqmq2-submit-shimmer"
                            initial={{ x: "-100%", skewX: "-18deg" }}
                            whileHover={{ x: "200%" }}
                            transition={{ duration: 0.5 }}
                          />

                          {status === "sending" ? (
                            <>
                              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                <IconSignal size={14} color={T.cyan} />
                              </motion.span>
                              Transmitting…
                            </>
                          ) : (
                            <>
                              <motion.span
                                animate={{ x: [0, 4, 0], y: [0, -2, 0] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <IconSend size={14} />
                              </motion.span>
                              Transmit Message
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}