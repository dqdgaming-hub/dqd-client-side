import { useState, useEffect, useRef } from "react";
import { getHomePage } from "../components/api/homeapi";

/* ── Floating particle for ambient atmosphere ── */
function Particle({ style }) {
  return <span className="combo-particle" style={style} />;
}

/* ── Individual Combo Banner ── */
function ComboBanner({ combo, index }) {
  const [hovered, setHovered] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const handleClick = () => {
    setGrabbed(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setGrabbed(false), 800);
  };

  // Alternate accent per card
  const accent = index % 2 === 0 ? "#ff2d6b" : "#a855f7";
  const accentGlow = index % 2 === 0 ? "rgba(255,45,107,0.4)" : "rgba(168,85,247,0.4)";
  const accentSecondary = index % 2 === 0 ? "#ff6b9d" : "#c084fc";

  return (
    <div
      ref={ref}
      className="combo-banner"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? grabbed
            ? "scale(0.97) translateY(2px)"
            : hovered
            ? "translateY(-6px)"
            : "translateY(0)"
          : `translateY(${60 + index * 10}px)`,
        transition: visible
          ? grabbed
            ? "transform 0.12s ease"
            : "opacity 0.6s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)"
          : `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`,
        transitionDelay: visible ? "0s" : `${index * 0.15}s`,
        "--accent": accent,
        "--accent-glow": accentGlow,
        "--accent-2": accentSecondary,
      }}
    >
      {/* Holographic shimmer overlay */}
      <div
        className="combo-shimmer"
        style={{ opacity: hovered ? 1 : 0 }}
      />

      {/* Left: Image side */}
      <div className="combo-img-side">
        {combo.image ? (
          <img
            src={combo.image}
            alt={combo.name}
            className="combo-img"
            style={{ transform: hovered ? "scale(1.1) rotate(-2deg)" : "scale(1) rotate(0deg)" }}
          />
        ) : (
          <div className="combo-img-placeholder">
            <span style={{ fontSize: 48 }}>🎁</span>
          </div>
        )}
        {/* Price tag floating */}
        <div
          className="combo-price-tag"
          style={{
            background: accent,
            boxShadow: `0 4px 20px ${accentGlow}`,
            transform: hovered ? "rotate(-6deg) scale(1.08)" : "rotate(-4deg) scale(1)",
          }}
        >
          <span className="price-tag-label">INR</span>
          <span className="price-tag-amount">{parseFloat(combo.combo_price).toFixed(0)}</span>
        </div>
      </div>

      {/* Right: Info side */}
      <div className="combo-info-side" style={{ borderLeftColor: `${accent}33` }}>
        {/* Top badge */}
        <div className="combo-top-row">
          <span
            className="combo-badge"
            style={{ color: accent, borderColor: `${accent}55`, background: `${accent}11` }}
          >
            ◈ COMBO DEAL
          </span>
          {combo.loyalty_bonus > 0 && (
            <span className="loyalty-badge" style={{ background: `${accent}22`, color: accentSecondary }}>
              +{combo.loyalty_bonus} XP
            </span>
          )}
        </div>

        {/* Name */}
        <h3
          className="combo-name"
          style={{ textShadow: hovered ? `0 0 24px ${accentGlow}` : "none" }}
        >
          {combo.name}
        </h3>

        {/* Snack included */}
        <div className="combo-snack-row">
          <span className="snack-icon">🍟</span>
          <span className="snack-label">Includes</span>
          <span className="snack-name" style={{ color: accentSecondary }}>
            {combo.snack_name}
          </span>
        </div>

        {/* Divider */}
        <div
          className="combo-divider"
          style={{
            background: `linear-gradient(90deg, ${accent}, transparent)`,
            width: hovered ? "100%" : "40%",
          }}
        />

        {/* CTA */}
        <button
          className="combo-cta"
          style={{
            border: `1px solid ${accent}`,
            color: grabbed ? "#050510" : accent,
            background: grabbed ? accent : `${accent}11`,
            boxShadow: hovered ? `0 0 30px ${accentGlow}` : "none",
          }}
        >
          {grabbed ? "✓ ADDED!" : "GRAB THIS DEAL"}
        </button>
      </div>

      {/* Corner glow */}
      <div
        className="combo-corner-glow"
        style={{ background: accent, opacity: hovered ? 0.12 : 0 }}
      />
    </div>
  );
}

/* ── Main Combo Section ── */
export default function Combo() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const particles = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${3 + Math.random() * 4}px`,
      delay: `${Math.random() * 4}s`,
      duration: `${4 + Math.random() * 4}s`,
      color: i % 3 === 0 ? "#ff2d6b" : i % 3 === 1 ? "#a855f7" : "#00f0ff",
    }))
  );

  useEffect(() => {
    getHomePage()
      .then((res) => setCombos(res.data.combo_packs || []))
      .catch(() => setError("Failed to load combos."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="combo-loader">
        <div className="combo-loader-ring" />
        <p className="combo-loader-text">LOADING DEALS…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="combo-error">
        <span>⚠</span> {error}
      </div>
    );
  }

  return (
    <section className="combo-section">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

        /* ── ROOT ── */
        .combo-section {
          background: #050510;
          padding: 60px 0 80px;
          font-family: 'Share Tech Mono', monospace;
          position: relative;
          overflow: hidden;
          min-height: 100vh;
        }

        /* Deep space BG */
        .combo-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 30%, rgba(255,45,107,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 80% 70%, rgba(168,85,247,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── PARTICLES ── */
        .combo-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: combo-float var(--dur, 5s) ease-in-out infinite alternate;
          animation-delay: var(--delay, 0s);
          opacity: 0.5;
        }
        @keyframes combo-float {
          from { transform: translateY(0) scale(1); opacity: 0.3; }
          to   { transform: translateY(-20px) scale(1.5); opacity: 0.7; }
        }

        /* ── SECTION HEADER ── */
        .combo-section-header {
          text-align: center;
          margin-bottom: 52px;
          position: relative;
          z-index: 1;
          padding: 0 20px;
        }
        .combo-eyebrow {
          font-family: 'Orbitron', monospace;
          font-size: 10px;
          letter-spacing: 7px;
          color: #ff2d6b;
          text-transform: uppercase;
          margin-bottom: 10px;
          display: block;
          opacity: 0.8;
        }
        .combo-title {
          font-family: 'Orbitron', monospace;
          font-size: clamp(28px, 6vw, 56px);
          font-weight: 900;
          color: #fff;
          margin: 0;
          line-height: 1.1;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .combo-title .pink { color: #ff2d6b; text-shadow: 0 0 30px rgba(255,45,107,0.8); }
        .combo-title .purple { color: #a855f7; text-shadow: 0 0 30px rgba(168,85,247,0.8); }
        .combo-subtitle {
          color: rgba(255,255,255,0.4);
          font-size: 12px;
          letter-spacing: 3px;
          margin-top: 12px;
          display: block;
        }
        .combo-header-ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 16px;
        }
        .ornament-line {
          height: 1px;
          width: 60px;
          background: linear-gradient(90deg, transparent, #ff2d6b44);
        }
        .ornament-line.right { background: linear-gradient(90deg, #a855f744, transparent); }
        .ornament-diamond {
          width: 8px;
          height: 8px;
          background: linear-gradient(45deg, #ff2d6b, #a855f7);
          transform: rotate(45deg);
          animation: diamond-spin 3s linear infinite;
        }
        @keyframes diamond-spin {
          to { transform: rotate(405deg); }
        }

        /* ── COMBO LIST ── */
        .combo-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 1;
        }

        /* ── COMBO BANNER ── */
        .combo-banner {
          display: grid;
          grid-template-columns: 220px 1fr;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.07);
          background: linear-gradient(135deg, #0a0a1a 0%, #0f0f1e 100%);
          overflow: hidden;
          position: relative;
          cursor: pointer;
          min-height: 180px;
        }

        /* Shimmer */
        .combo-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(255,255,255,0.04) 50%,
            transparent 70%
          );
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 3;
        }

        /* Corner glow */
        .combo-corner-glow {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 0;
        }

        /* Image side */
        .combo-img-side {
          position: relative;
          overflow: hidden;
          background: #08081a;
        }
        .combo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }
        .combo-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0d0d25, #1a0d2e);
        }

        /* Price tag */
        .combo-price-tag {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%) rotate(-4deg);
          padding: 6px 18px;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.3s ease;
          z-index: 2;
          min-width: 80px;
        }
        .price-tag-label {
          font-family: 'Orbitron', monospace;
          font-size: 9px;
          font-weight: 700;
          color: rgba(0,0,0,0.7);
          letter-spacing: 2px;
        }
        .price-tag-amount {
          font-family: 'Orbitron', monospace;
          font-size: 26px;
          font-weight: 900;
          color: #050510;
          line-height: 1;
        }

        /* Info side */
        .combo-info-side {
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
          border-left: 1px solid;
          position: relative;
          z-index: 1;
        }
        .combo-top-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .combo-badge {
          font-family: 'Orbitron', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 3px;
          padding: 4px 12px;
          border-radius: 4px;
          border: 1px solid;
          text-transform: uppercase;
        }
        .loyalty-badge {
          font-family: 'Orbitron', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .combo-name {
          font-family: 'Orbitron', monospace;
          font-size: clamp(16px, 3vw, 24px);
          font-weight: 900;
          color: #fff;
          margin: 0;
          letter-spacing: 0.5px;
          transition: text-shadow 0.3s ease;
        }
        .combo-snack-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .snack-icon { font-size: 16px; }
        .snack-label { color: rgba(255,255,255,0.4); }
        .snack-name { font-weight: 700; }
        .combo-divider {
          height: 2px;
          border-radius: 2px;
          transition: width 0.4s ease;
        }
        .combo-cta {
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          text-transform: uppercase;
          align-self: flex-start;
          transition: all 0.25s ease;
        }
        .combo-cta:hover { letter-spacing: 4px; }

        /* ── LOADER ── */
        .combo-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 20px;
          background: #050510;
        }
        .combo-loader-ring {
          width: 56px;
          height: 56px;
          border: 3px solid #1a0d2e;
          border-top-color: #ff2d6b;
          border-right-color: #a855f7;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .combo-loader-text {
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          letter-spacing: 6px;
          background: linear-gradient(90deg, #ff2d6b, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: pulse-text 1.4s ease-in-out infinite;
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .combo-error {
          font-family: 'Orbitron', monospace;
          text-align: center;
          color: #ff2d6b;
          padding: 60px 20px;
          font-size: 14px;
          letter-spacing: 2px;
          background: #050510;
        }

        /* ── MOBILE ── */
        @media (max-width: 600px) {
          .combo-section { padding: 40px 0 60px; }
          .combo-list { padding: 0 12px; gap: 16px; }

          .combo-banner {
            grid-template-columns: 1fr;
            grid-template-rows: 200px auto;
            min-height: auto;
          }
          .combo-img-side { height: 200px; }
          .combo-img { height: 200px; }
          .combo-price-tag {
            bottom: 12px;
            left: auto;
            right: 16px;
            transform: rotate(-3deg) !important;
          }
          .combo-info-side {
            border-left: none;
            border-top: 1px solid;
            padding: 18px 16px 20px;
          }
          .combo-name { font-size: 18px; }
          .combo-cta { font-size: 10px; padding: 9px 16px; align-self: stretch; text-align: center; }
          .combo-badge { font-size: 8px; }
        }

        @media (min-width: 601px) and (max-width: 900px) {
          .combo-banner { grid-template-columns: 180px 1fr; }
        }
      `}</style>

      {/* Ambient particles */}
      {particles.current.map((p) => (
        <Particle
          key={p.id}
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            "--dur": p.duration,
            "--delay": p.delay,
          }}
        />
      ))}

      {/* Header */}
      <div className="combo-section-header">
        <span className="combo-eyebrow">// LIMITED TIME OFFERS</span>
        <h1 className="combo-title">
          <span className="pink">COMBO</span> <span className="purple">PACKS</span>
        </h1>
        <span className="combo-subtitle">STACK YOUR XP · SAVE MORE · PLAY LONGER</span>
        <div className="combo-header-ornament">
          <span className="ornament-line" />
          <span className="ornament-diamond" />
          <span className="ornament-line right" />
        </div>
      </div>

      {/* Combo list */}
      <div className="combo-list">
        {combos.map((combo, i) => (
          <ComboBanner key={combo.id} combo={combo} index={i} />
        ))}
        {combos.length === 0 && (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', monospace", fontSize: 13, letterSpacing: 3, padding: "60px 0" }}>
            NO ACTIVE DEALS RIGHT NOW
          </div>
        )}
      </div>
    </section>
  );
}