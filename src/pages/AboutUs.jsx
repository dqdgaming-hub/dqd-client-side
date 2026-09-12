import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = {
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Tag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  Bus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M8 6v6M3 6h18M3 11h18M3 16h18M8 16v2m8-2v2M5 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6z"/>
    </svg>
  ),
  Gamepad: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <rect x="2" y="6" width="20" height="12" rx="5"/>
      <path d="M6 12h4M8 10v4M15 11h.01M17 13h.01"/>
    </svg>
  ),
  Monitor: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  Trophy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M6 2h12M8 2v6a4 4 0 0 0 8 0V2"/>
      <path d="M6 2a4 4 0 0 0 0 8h.5M18 2a4 4 0 0 0 0 8h-.5"/>
      <path d="M12 14v4M8 22h8M12 14a4 4 0 0 0 0-6"/>
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Heart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const steps = 60;
    const increment = to / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, (duration * 1000) / steps);
    return () => clearInterval(timer);
  }, [inView, to, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Section Reveal ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, direction = "up" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const variants = {
    hidden: { opacity: 0, y: direction === "up" ? 40 : -40, x: direction === "left" ? 40 : direction === "right" ? -40 : 0 },
    visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] } },
  };
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? "visible" : "hidden"}>
      {children}
    </motion.div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, accent, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="stat-card" style={{ "--accent": accent }}>
        <div className="stat-glow" />
        <div className="stat-value">
          <Counter to={value} suffix={suffix} />
        </div>
        <div className="stat-label">{label}</div>
      </div>
    </Reveal>
  );
}

// ─── Feature Pill ─────────────────────────────────────────────────────────────
function FeaturePill({ IconComponent, text, delay }) {
  return (
    <Reveal delay={delay}>
      <motion.div
        className="feature-pill"
        whileHover={{ scale: 1.05, borderColor: "#D4AF37" }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <span className="pill-icon"><IconComponent /></span>
        <span className="pill-text">{text}</span>
      </motion.div>
    </Reveal>
  );
}

// ─── Payment Badge ────────────────────────────────────────────────────────────
function PayBadge({ label, delay }) {
  return (
    <Reveal delay={delay}>
      <motion.div
        className="pay-badge"
        whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(212,175,55,0.3)" }}
      >
        {label}
      </motion.div>
    </Reveal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AboutUs() {
  const stats = [
    { value: 2025, suffix: "", label: "Est. Year", accent: "#D4AF37", delay: 0 },
    { value: 500, suffix: "+", label: "Happy Gamers", accent: "#7A2CFF", delay: 0.1 },
    { value: 100, suffix: "%", label: "Satisfaction", accent: "#D4AF37", delay: 0.2 },
    { value: 5, suffix: "★", label: "Star Rated", accent: "#7A2CFF", delay: 0.3 },
  ];

  const features = [
    { IconComponent: Icon.Gamepad, text: "Game Dealer", delay: 0 },
    { IconComponent: Icon.Monitor, text: "Console Dealer", delay: 0.05 },
    { IconComponent: Icon.Trophy, text: "Gaming Hub", delay: 0.1 },
    { IconComponent: Icon.Zap, text: "Premium Setup", delay: 0.15 },
    { IconComponent: Icon.Globe, text: "Local & Online", delay: 0.2 },
    { IconComponent: Icon.Heart, text: "Customer First", delay: 0.25 },
  ];

  const payments = [
    { label: "Cash", delay: 0 },
    { label: "UPI", delay: 0.05 },
    { label: "Paytm", delay: 0.1 },
    { label: "PhonePe", delay: 0.15 },
    { label: "Amazon Pay", delay: 0.2 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .about-root {
          background: #05040A;
          color: #B9C2D9;
          font-family: 'Rajdhani', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .ambient-layer {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 20%, rgba(122,44,255,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(212,175,55,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 60% 30%, rgba(122,44,255,0.06) 0%, transparent 70%);
        }

        .dot-grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, rgba(185,194,217,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        /* ── Hero ── */
        .hero-section {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 120px 24px 80px;
          text-align: center;
        }

        .hero-eyebrow {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px; letter-spacing: 0.3em;
          color: #7A2CFF; text-transform: uppercase;
          margin-bottom: 20px;
          display: flex; align-items: center; gap: 12px;
        }
        .hero-eyebrow::before, .hero-eyebrow::after {
          content: ''; display: block; width: 40px; height: 1px; background: #7A2CFF;
        }

        .hero-logo-wrap {
          width: 110px; height: 110px;
          margin: 0 auto 32px;
          position: relative;
        }
        .hero-logo-ring {
          position: absolute; inset: -8px; border-radius: 50%;
          border: 1.5px solid rgba(212,175,55,0.3);
          animation: spin-slow 12s linear infinite;
        }
        .hero-logo-ring-2 {
          position: absolute; inset: -18px; border-radius: 50%;
          border: 1px dashed rgba(122,44,255,0.25);
          animation: spin-slow 20s linear infinite reverse;
        }
        .hero-logo-img {
          width: 100%; height: 100%; object-fit: contain;
          border-radius: 50%;
          border: 2px solid rgba(212,175,55,0.5);
          background: #0D0A18;
          padding: 8px;
          position: relative; z-index: 1;
          filter: drop-shadow(0 0 20px rgba(212,175,55,0.3));
        }
        @keyframes spin-slow { to { transform: rotate(360deg); } }

        .hero-title {
          font-family: 'Orbitron', monospace;
          font-size: clamp(2rem, 6vw, 4rem);
          font-weight: 900; line-height: 1.1;
          letter-spacing: -0.02em; color: #fff;
          margin-bottom: 8px;
        }
        .hero-title .gold { color: #D4AF37; }

        .hero-sub {
          font-family: 'Orbitron', monospace;
          font-size: clamp(0.75rem, 2vw, 1rem);
          font-weight: 400; letter-spacing: 0.35em;
          color: #7A2CFF; text-transform: uppercase;
          margin-bottom: 28px;
        }

        .hero-desc {
          max-width: 640px;
          font-size: 1.15rem; font-weight: 400; line-height: 1.7;
          color: #B9C2D9;
          margin: 0 auto 48px;
        }

        .dqd-hr {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.4) 20%, rgba(212,175,55,0.4) 80%, transparent);
          border: none; margin: 0 auto;
        }

        /* ── Stats ── */
        .stats-section {
          position: relative; z-index: 1;
          padding: 80px 24px;
        }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 20px; max-width: 900px; margin: 0 auto;
        }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 400px) { .stats-grid { grid-template-columns: 1fr; } }

        .stat-card {
          position: relative; overflow: hidden;
          background: #0D0A18;
          border: 1px solid rgba(185,194,217,0.1);
          clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
          padding: 28px 20px; text-align: center;
          transition: border-color 0.3s;
        }
        .stat-card:hover { border-color: var(--accent); }
        .stat-glow {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 80%; height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
        }
        .stat-value {
          font-family: 'Orbitron', monospace;
          font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 700;
          color: var(--accent);
          filter: drop-shadow(0 0 12px var(--accent));
          line-height: 1; margin-bottom: 8px;
        }
        .stat-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.7rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: #B9C2D9; opacity: 0.7;
        }

        /* ── Story ── */
        .story-section {
          position: relative; z-index: 1;
          padding: 80px 24px;
          max-width: 1100px; margin: 0 auto;
        }
        .story-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 60px; align-items: center;
        }
        @media (max-width: 768px) { .story-grid { grid-template-columns: 1fr; gap: 40px; } }

        .section-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px; letter-spacing: 0.3em;
          text-transform: uppercase; color: #7A2CFF;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .section-label::after {
          content: ''; display: block; flex: 1; max-width: 60px;
          height: 1px; background: #7A2CFF;
        }

        .story-heading {
          font-family: 'Orbitron', monospace;
          font-size: clamp(1.4rem, 3.5vw, 2.2rem); font-weight: 700;
          color: #fff; line-height: 1.2; margin-bottom: 20px;
        }
        .story-heading .gold { color: #D4AF37; }

        .story-body {
          font-size: 1.05rem; line-height: 1.8;
          color: #B9C2D9; margin-bottom: 16px;
        }

        /* ── Location Card ── */
        .location-card {
          background: #0D0A18;
          border: 1px solid rgba(212,175,55,0.2);
          clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
          padding: 32px; position: relative; overflow: hidden;
        }
        .location-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #7A2CFF, #D4AF37);
        }
        .location-item {
          display: flex; align-items: flex-start; gap: 14px;
          margin-bottom: 20px;
        }
        .location-item:last-child { margin-bottom: 0; }
        .loc-icon {
          width: 36px; height: 36px; flex-shrink: 0;
          background: rgba(122,44,255,0.15);
          border: 1px solid rgba(122,44,255,0.3);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          color: #7A2CFF;
        }
        .loc-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: #7A2CFF;
          margin-bottom: 4px;
        }
        .loc-value {
          font-size: 1rem; font-weight: 500; color: #fff;
          font-family: 'Rajdhani', sans-serif;
        }

        /* ── Map Section ── */
        .map-section {
          position: relative; z-index: 1;
          padding: 0 24px 80px;
          max-width: 1100px; margin: 0 auto;
        }
        .map-header {
          margin-bottom: 24px;
        }
        .map-wrapper {
          position: relative;
          border: 1px solid rgba(212,175,55,0.2);
          clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));
          overflow: hidden;
          background: #0D0A18;
        }
        .map-wrapper::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 2;
          background: linear-gradient(90deg, #7A2CFF, #D4AF37);
        }
        .map-wrapper iframe {
          display: block; width: 100%; height: 400px; border: 0;
          filter: grayscale(0.2) brightness(0.9);
        }

        /* ── Features ── */
        .features-section {
          position: relative; z-index: 1;
          padding: 80px 24px;
          max-width: 1100px; margin: 0 auto; text-align: center;
        }
        .features-heading {
          font-family: 'Orbitron', monospace;
          font-size: clamp(1.2rem, 3vw, 1.8rem); font-weight: 700;
          color: #fff; margin-bottom: 12px;
        }
        .features-sub {
          font-size: 1rem; color: #B9C2D9; opacity: 0.7; margin-bottom: 48px;
        }
        .features-grid {
          display: flex; flex-wrap: wrap; gap: 14px; justify-content: center;
        }

        .feature-pill {
          display: flex; align-items: center; gap: 10px;
          background: #0D0A18;
          border: 1px solid rgba(185,194,217,0.15);
          padding: 12px 20px;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          cursor: default; transition: border-color 0.3s, background 0.3s;
        }
        .feature-pill:hover { background: rgba(122,44,255,0.1); }
        .pill-icon { color: #7A2CFF; display: flex; align-items: center; }
        .pill-text {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          letter-spacing: 0.05em; color: #B9C2D9;
        }

        /* ── Mission ── */
        .mission-section {
          position: relative; z-index: 1;
          padding: 80px 24px;
          max-width: 900px; margin: 0 auto;
        }
        .mission-panel {
          background: linear-gradient(135deg, #0D0A18, rgba(122,44,255,0.05));
          border: 1px solid rgba(212,175,55,0.2);
          clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 32px 100%, 0 calc(100% - 32px));
          padding: 56px 48px; text-align: center;
          position: relative; overflow: hidden;
        }
        @media (max-width: 600px) { .mission-panel { padding: 40px 24px; } }
        .mission-panel::before {
          content: 'DQD'; position: absolute;
          font-family: 'Orbitron', monospace;
          font-size: 160px; font-weight: 900;
          color: rgba(212,175,55,0.03);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          pointer-events: none; user-select: none; white-space: nowrap;
        }
        .mission-quote {
          font-family: 'Orbitron', monospace;
          font-size: clamp(1rem, 3vw, 1.5rem); font-weight: 600;
          color: #D4AF37; line-height: 1.5; margin-bottom: 24px;
          position: relative; z-index: 1;
        }
        .mission-body {
          font-size: 1.05rem; line-height: 1.8; color: #B9C2D9;
          position: relative; z-index: 1;
        }

        /* ── Payment ── */
        .payment-section {
          position: relative; z-index: 1;
          padding: 60px 24px 80px;
          max-width: 800px; margin: 0 auto; text-align: center;
        }
        .payment-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px; letter-spacing: 0.3em;
          text-transform: uppercase; color: #7A2CFF; margin-bottom: 12px;
        }
        .payment-heading {
          font-family: 'Orbitron', monospace;
          font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 32px;
        }
        .payment-row {
          display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;
        }
        .pay-badge {
          background: #0D0A18;
          border: 1px solid rgba(212,175,55,0.25);
          padding: 10px 22px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.8rem; letter-spacing: 0.1em; color: #D4AF37;
          transition: all 0.3s;
          clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
          cursor: default;
        }

        /* ── Footer ── */
        .about-footer {
          position: relative; z-index: 1;
          padding: 32px 24px; text-align: center;
          border-top: 1px solid rgba(185,194,217,0.06);
        }
        .footer-text {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(185,194,217,0.3);
        }
        .footer-text span { color: #D4AF37; }
      `}</style>

      <div className="about-root">
        <div className="ambient-layer" />
        <div className="dot-grid" />

        {/* ── HERO ── */}
        <section className="hero-section">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="hero-eyebrow">Kadavanthra · Kochi</div>
          </motion.div>
            <br/><br/>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <div className="hero-logo-wrap">
              <div className="hero-logo-ring" />
              <div className="hero-logo-ring-2" />
              <img src="/logo.png" alt="DQD Gaming Hub Logo" className="hero-logo-img" />
            </div>
          </motion.div>
 <br/><br/>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <h1 className="hero-title"><span className="gold">DQD</span> Gaming Hub</h1>
            <p className="hero-sub">Dominate · Quest · Destroy</p>
          </motion.div>

          <motion.p className="hero-desc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}>
            Kochi's premier gaming destination — a one-stop hub for game enthusiasts, console seekers, and competitive players. Where every session is a quest and every win rewarded.
          </motion.p>

          <motion.div style={{ width: "100%", maxWidth: 600 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.5 }}>
            <hr className="dqd-hr" />
          </motion.div>
        </section>

        {/* ── STATS ── */}
        <section className="stats-section">
          <div className="stats-grid">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        </section>

        <hr className="dqd-hr" style={{ maxWidth: 900, margin: "0 auto" }} />

        {/* ── STORY ── */}
        <section className="story-section">
          <div className="story-grid">
            <div>
              <Reveal>
                <div className="section-label">Our Story</div>
                <h2 className="story-heading">Born in <span className="gold">2025</span>,<br />Built for Gamers</h2>
                <p className="story-body">
                  Established in February 2025, DQD Gaming Hub emerged at Kadavanthra Junction with a singular mission — to build Kochi's most dedicated gaming ecosystem. From day one, we've been more than a store: we're a community hub where players discover, compete, and connect.
                </p>
                <p className="story-body">
                  We serve customers from across Kochi and Ernakulam, offering a curated range of gaming products and consoles backed by expert advice. Every team member here is a gamer at heart, ensuring you always get honest, informed recommendations.
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.15} direction="left">
              <div className="location-card">
                <div className="location-item">
                  <div className="loc-icon"><Icon.MapPin /></div>
                  <div>
                    <div className="loc-label">Location</div>
                    <div className="loc-value">Kadavanthra Junction, Kochi, Ernakulam</div>
                  </div>
                </div>
                <div className="location-item">
                  <div className="loc-icon"><Icon.Calendar /></div>
                  <div>
                    <div className="loc-label">Established</div>
                    <div className="loc-value">February 2025</div>
                  </div>
                </div>
                <div className="location-item">
                  <div className="loc-icon"><Icon.Tag /></div>
                  <div>
                    <div className="loc-label">Category</div>
                    <div className="loc-value">Game Dealer · Console Dealer · Gaming Hub</div>
                  </div>
                </div>
                <div className="location-item">
                  <div className="loc-icon"><Icon.Bus /></div>
                  <div>
                    <div className="loc-label">Access</div>
                    <div className="loc-value">Easily reachable via multiple modes of transport</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <hr className="dqd-hr" style={{ maxWidth: 1100, margin: "0 auto" }} />

        {/* ── MAP ── */}
        <section className="map-section">
          <Reveal>
            <div className="map-header">
              <div className="section-label">Find Us</div>
              <h2 className="story-heading">We're at <span className="gold">Kadavanthra Junction</span></h2>
            </div>
            <div className="map-wrapper">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.587219367345!2d76.29699597487094!3d9.968259590135487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b087306fc6f7f17%3A0x39dba6f2646508c!2sDQD%20gaming%20hub!5e0!3m2!1sen!2sin!4v1782751280000!5m2!1sen!2sin"
                title="DQD Gaming Hub Location"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </Reveal>
        </section>

        <hr className="dqd-hr" style={{ maxWidth: 1100, margin: "0 auto" }} />

        {/* ── FEATURES ── */}
        <section className="features-section">
          <Reveal>
            <div className="section-label" style={{ justifyContent: "center" }}>What We Offer</div>
            <h2 className="features-heading">Everything a Gamer Needs</h2>
            <p className="features-sub">From the latest console drops to expert gaming advice — we've got your setup covered.</p>
          </Reveal>
          <div className="features-grid">
            {features.map((f) => <FeaturePill key={f.text} {...f} />)}
          </div>
        </section>

        <hr className="dqd-hr" style={{ maxWidth: 900, margin: "0 auto" }} />

        {/* ── MISSION ── */}
        <section className="mission-section">
          <Reveal>
            <div className="mission-panel">
              <p className="mission-quote">"Customer satisfaction is as important as the products we carry."</p>
              <p className="mission-body">
                Our team is dedicated, courteous, and always ready to assist. Whether you're a seasoned pro or a first-time buyer, we take the time to understand your needs and match you with the perfect gaming solution. Our goal is to grow alongside our community — with more products, more services, and a bigger gaming family.
              </p>
            </div>
          </Reveal>
        </section>

        <hr className="dqd-hr" style={{ maxWidth: 900, margin: "0 auto" }} />

        {/* ── PAYMENT ── */}
        <section className="payment-section">
          <Reveal>
            <div className="payment-label">Accepted Payments</div>
            <h3 className="payment-heading">Pay Your Way — We Accept It All</h3>
          </Reveal>
          <div className="payment-row">
            {payments.map((p) => <PayBadge key={p.label} {...p} />)}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <div className="about-footer">
          <p className="footer-text">
            © 2025 <span>DQD Gaming Hub</span> · Kadavanthra Junction, Kochi · All rights reserved
          </p>
        </div>
      </div>
    </>
  );
}