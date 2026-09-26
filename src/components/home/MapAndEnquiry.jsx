import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
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
   FLOATING PARTICLE (static)
══════════════════════════════════════════════ */
function Particle({ x, y, color, size }) {
  return (
    <div
      style={{
        position: "absolute", left: x, top: y,
        width: size, height: size, borderRadius: "50%",
        background: color, filter: `blur(${size / 2.5}px)`,
        pointerEvents: "none", zIndex: 0, opacity: 0.7,
      }}
    />
  );
}

/* ══════════════════════════════════════════════
   ORBIT RING (static)
══════════════════════════════════════════════ */
function OrbitRing({ size, color, opacity = 0.1 }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <circle cx={size/2} cy={size/2} r={size/2 - 2}
        fill="none" stroke={color} strokeWidth="1"
        strokeDasharray="5 16" opacity={opacity} />
    </svg>
  );
}

/* ══════════════════════════════════════════════
   FORM FIELD (no motion)
══════════════════════════════════════════════ */
function Field({ id, label, type = "text", placeholder, value, onChange, required, as: As = "input" }) {
  const [focused, setFocused] = useState(false);
  const [filled,  setFilled]  = useState(false);

  return (
    <div className="dqmq2-field">
      <label
        className="dqmq2-label"
        htmlFor={id}
        style={{ color: focused ? T.cyan : T.muted }}
      >
        {label}
        {required && <span style={{ color: T.pink, marginLeft: 4 }}>*</span>}
      </label>

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
        <div
          style={{
            position: "absolute", bottom: 0, left: 0, height: 2,
            background: `linear-gradient(90deg, ${T.cyan}, ${T.purple})`,
            transformOrigin: "left",
            transform: focused ? "scaleX(1)" : "scaleX(0)",
            opacity: focused ? 1 : 0,
          }}
        />
        {/* filled indicator dot */}
        {filled && !focused && (
          <div
            style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              width: 6, height: 6, borderRadius: "50%", background: T.green,
              boxShadow: `0 0 8px ${T.green}`,
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SUCCESS STATE
══════════════════════════════════════════════ */
function SuccessState() {
  return (
    <div
      style={{ textAlign: "center", padding: "36px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
    >
      <div style={{ filter: `drop-shadow(0 0 14px ${T.green})` }}>
        <IconCheck size={48} />
      </div>

      <div
        style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.24em" }}
      >
        Message Transmitted
      </div>

      <div
        style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.7rem", color: T.muted, letterSpacing: 1 }}
      >
        We'll respond within 24 hours.
      </div>

      {/* orbit rings around success */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
        <OrbitRing size={160} color={T.green} opacity={0.18} />
        <OrbitRing size={220} color={T.cyan}  opacity={0.1} />
      </div>
    </div>
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
    { x: "4%",  y: "12%", color: T.cyan,   size: 5 },
    { x: "93%", y: "8%",  color: T.pink,   size: 4 },
    { x: "88%", y: "78%", color: T.purple, size: 6 },
    { x: "2%",  y: "82%", color: T.amber,  size: 3 },
    { x: "48%", y: "3%",  color: T.cyan,   size: 4 },
    { x: "60%", y: "95%", color: T.pink,   size: 3 },
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
          transition: border-color 0.35s, box-shadow 0.35s, transform 0.35s;
        }
        .dqmq2-card:hover { border-color: rgba(0,245,255,0.32); transform: translateY(-4px); }

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
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .dqmq2-directions:hover { background: ${T.cyan}18; box-shadow: 0 0 14px ${T.cyan}22; transform: scale(1.05); }
        .dqmq2-map-iframe {
          width: 100%; height: 360px; border: none; display: block;
        }
        /* map overlay */
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
          transition: color 0.2s;
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
          transition: box-shadow 0.25s, transform 0.2s;
        }
        .dqmq2-submit:hover:not(:disabled) { box-shadow: 0 0 28px ${T.cyan}30; transform: scale(1.02) translateY(-2px); }
        .dqmq2-submit:active:not(:disabled) { transform: scale(0.97); }
        .dqmq2-submit:disabled { opacity: 0.55; cursor: not-allowed; }

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
        {/* ── ambient orbs (static) ── */}
        <div className="dqmq2-bg-orb"
          style={{ width: 500, height: 500, top: -150, left: -100, background: "rgba(0,245,255,0.05)" }}
        />
        <div className="dqmq2-bg-orb"
          style={{ width: 400, height: 400, bottom: -120, right: -80, background: "rgba(123,47,255,0.05)" }}
        />

        {/* ── floating particles (static) ── */}
        {particles.map((p, i) => <Particle key={i} {...p} />)}

        <div className="dqmq2-inner">

          {/* ── section heading ── */}
          <div>
            <div className="dqmq2-section-heading">
              <IconMapPin size={22} />
              <span>Find Us &amp;</span>
              <span
                style={{
                  background: `linear-gradient(135deg, ${T.cyan}, ${T.purple}, ${T.pink})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Reach Out
              </span>
            </div>

            <div className="dqmq2-section-sub">
              <IconSignal size={12} color={T.cyan} />
              DQD Gaming Hub · Kochi, Kerala
            </div>
          </div>

          {/* ── two-col grid ── */}
          <div className="dqmq2-grid">

            {/* ══════════ MAP CARD ══════════ */}
            <div className="dqmq2-card">
              <div className="dqmq2-corner dqmq2-corner-tl" />
              <div className="dqmq2-corner dqmq2-corner-br" />

              {/* orbit ring behind map header */}
              <div style={{ position: "absolute", top: 28, right: -60, pointerEvents: "none", opacity: 0.5 }}>
                <OrbitRing size={120} color={T.cyan} opacity={0.12} />
              </div>

              <div className="dqmq2-map-header">
                <span className="dqmq2-map-title">
                  <IconMapPin size={14} />
                  DQD Gaming Hub — Kochi
                </span>

                <a
                  className="dqmq2-directions"
                  href={GOOGLE_MAPS_DIRECTIONS_URL}
                  target="_blank" rel="noopener noreferrer"
                >
                  <IconRoute />
                  Get Directions
                </a>
              </div>

              <div style={{ position: "relative", overflow: "hidden" }}>
                <iframe
                  className="dqmq2-map-iframe"
                  src={GOOGLE_MAPS_EMBED_SRC}
                  title="DQD Gaming Hub Location"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                <div className="dqmq2-map-overlay" />
              </div>

              {/* signal bars at bottom */}
              <div style={{ padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, borderTop: `1px solid ${T.border}` }}>
                <div className="dqmq2-signal">
                  {[8, 12, 16, 20, 14].map((h, i) => (
                    <div key={i} className="dqmq2-signal-bar" style={{ height: h }} />
                  ))}
                </div>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.62rem", color: T.muted, letterSpacing: 2 }}>
                  LIVE LOCATION
                </span>
                <div
                  style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }}
                />
              </div>
            </div>

            {/* ══════════ ENQUIRY CARD ══════════ */}
            <div className="dqmq2-card">
              <div className="dqmq2-corner dqmq2-corner-tl" />
              <div className="dqmq2-corner dqmq2-corner-br" />

              <div style={{ position: "absolute", bottom: -40, left: -40, pointerEvents: "none", opacity: 0.4 }}>
                <OrbitRing size={140} color={T.purple} opacity={0.15} />
              </div>

              <div className="dqmq2-enquiry-inner" style={{ position: "relative" }}>
                <div className="dqmq2-enquiry-title">
                  <IconMail size={15} />
                  Send an Enquiry
                </div>

                {status === "sent" ? (
                  <div style={{ position: "relative", minHeight: 300 }}>
                    <SuccessState />
                  </div>
                ) : (
                  <div>
                    {error && (
                      <div className="dqmq2-error">
                        ⚠ {error}
                      </div>
                    )}

                    <Field id="dqmq2-name"    label="Full Name" placeholder="Your name"       value={form.name}    onChange={e => setForm({ ...form, name: e.target.value })}    required />
                    <Field id="dqmq2-email"   label="Email"     type="email" placeholder="name@gmail.com" value={form.email}   onChange={e => setForm({ ...form, email: e.target.value })}   required />
                    <Field id="dqmq2-phone"   label="Phone"     placeholder="+91 ..."          value={form.phone}   onChange={e => setForm({ ...form, phone: e.target.value })} />
                    <Field id="dqmq2-message" label="Message"   placeholder="Tell us what you need..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} as="textarea" />

                    <div>
                      <button
                        className="dqmq2-submit"
                        type="button"
                        disabled={status === "sending"}
                        onClick={submit}
                      >
                        {status === "sending" ? (
                          <>
                            <IconSignal size={14} color={T.cyan} />
                            Transmitting…
                          </>
                        ) : (
                          <>
                            <IconSend size={14} />
                            Transmit Message
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}