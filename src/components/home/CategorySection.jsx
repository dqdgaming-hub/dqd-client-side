import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Gift, Sparkles, ChevronLeft, ChevronRight, Tag, Utensils, Star, Zap, Package } from "lucide-react";

/* ─────────────────────────────────────
   THEME TOKENS
───────────────────────────────────── */
const T = {
  purple: "#7A2CFF",
  fuchsia:"#C026D3",
  gold:   "#D4AF37",
  cyan:   "#00f5ff",
  lilac:  "#c084fc",
  pink:   "#ff006e",
  amber:  "#f59e0b",
  border: "rgba(122,44,255,0.22)",
};

const ACCENT_CYCLE = [T.lilac, T.cyan, T.pink, T.amber];

/* ─────────────────────────────────────
   SCAN SWEEP
───────────────────────────────────── */
function ScanSweep({ trigger }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          style={{
            position: "absolute", inset: 0, width: "55%",
            background: "linear-gradient(90deg, transparent, rgba(192,132,252,0.13), transparent)",
            pointerEvents: "none", zIndex: 6, skewX: "-16deg",
          }}
          initial={{ x: "-130%" }} animate={{ x: "290%" }} exit={{ opacity: 0 }}
          transition={{ duration: 0.72, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────
   COMBO CARD  (inline — no extra import needed)
───────────────────────────────────── */
function ComboCard({ combo, index = 0, onBook }) {
  const cardRef    = useRef(null);
  const overlayRef = useRef(null);
  const fadeRef    = useRef(null);

  const [hovered, setHovered] = useState(false);
  const [scanned, setScanned] = useState(false);

  const accent = ACCENT_CYCLE[index % ACCENT_CYCLE.length];

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    cardRef.current.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const handleMouseEnter = () => {
    setHovered(true);
    if (fadeRef.current)    fadeRef.current.style.opacity    = "0";
    if (overlayRef.current) overlayRef.current.style.opacity = "1";
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (fadeRef.current)    fadeRef.current.style.opacity    = "1";
    if (overlayRef.current) overlayRef.current.style.opacity = "0";
  };

  const triggerScan = () => {
    setTimeout(() => {
      setScanned(true);
      setTimeout(() => setScanned(false), 900);
    }, 200 + index * 90);
  };

  return (
    <motion.div
      ref={cardRef}
      className="cc2-card"
      style={{
        "--acc":        accent,
        "--acc-shadow": `${accent}66`,
        "--card-gradient": `linear-gradient(145deg, ${accent}14 0%, #0d0d28 35%, #130f2a 100%)`,
        "--mx": "50%",
        "--my": "50%",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onViewportEnter={triggerScan}
      whileHover={{ y: -10, scale: 1.026, rotateY: 2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* ChromaGrid layers */}
      <div className="cc2-spotlight" />
      <div ref={overlayRef} className="cc2-chroma-overlay" />
      <div ref={fadeRef}    className="cc2-chroma-fade"    />

      <ScanSweep trigger={scanned} />

      {/* corner ticks */}
      <div className="cc2-corner cc2-tl" style={{ borderColor: accent }} />
      <div className="cc2-corner cc2-br" style={{ borderColor: T.pink  }} />

      {/* ambient glow */}
      <div className="cc2-ambient"
        style={{ background: `radial-gradient(ellipse at 65% 0%, ${accent}1a, transparent 65%)` }}
      />

      {/* IMAGE */}
      <div className="cc2-img-wrap">
        <img src={combo.image} alt={combo.name} className="cc2-img" loading="lazy" />
        <div className="cc2-img-fade" />

        <div className="cc2-badge" style={{ background: `${accent}cc` }}>
          <Tag size={9} /><span>COMBO</span>
        </div>

        <div className="cc2-price-overlay">
          <span className="cc2-price-label">INR</span>
          <span className="cc2-price-val" style={{ color: accent, textShadow: `0 0 20px ${accent}99` }}>
            {parseFloat(combo.combo_price).toFixed(0)}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="cc2-body">
        <h5 className="cc2-name">{combo.name}</h5>

        <div className="cc2-details">
          <div className="cc2-row">
            <span className="cc2-row-icon" style={{ color: T.pink }}><Utensils size={12} /></span>
            <span className="cc2-row-label">Snack</span>
            <span className="cc2-row-val">{combo.snack_name}</span>
          </div>
          <div className="cc2-row">
            <span className="cc2-row-icon" style={{ color: accent }}><Zap size={12} /></span>
            <span className="cc2-row-label">Price</span>
            <span className="cc2-row-val" style={{ color: accent }}>
              ₹{parseFloat(combo.combo_price).toFixed(2)}
            </span>
          </div>
          <div className="cc2-row">
            <span className="cc2-row-icon" style={{ color: T.amber }}><Star size={12} /></span>
            <span className="cc2-row-label">Loyalty</span>
            <span className="cc2-row-val" style={{ color: T.amber }}>
              +{combo.loyalty_bonus} pts
            </span>
          </div>
        </div>

        <div className="cc2-footer">
          <button className="cc2-book-btn" onClick={(e) => { e.stopPropagation(); onBook?.(combo); }}>
            <span className="cc2-pkg-icon"><Package size={13} /></span>
            Book Now
          </button>
          <div className="cc2-pts">
            <Star size={9} style={{ color: T.amber }} /><span>+{combo.loyalty_bonus}</span>
          </div>
        </div>

        <div className="cc2-accent-line"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   CAROUSEL DOTS
───────────────────────────────────── */
function CarouselDots({ total, active }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div key={i}
          style={{
            borderRadius: 4, height: 4,
            background: i === active ? T.lilac : "rgba(255,255,255,0.2)",
          }}
          animate={{ width: i === active ? 20 : 6, opacity: i === active ? 1 : 0.45 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────
   FLOATING PARTICLE
───────────────────────────────────── */
function Particle({ x, y, color, delay, size }) {
  return (
    <motion.div style={{
      position: "absolute", left: x, top: y,
      width: size, height: size, borderRadius: "50%",
      background: color, filter: `blur(${size / 2.5}px)`,
      pointerEvents: "none", zIndex: 0,
    }}
      animate={{ y: [0, -22, 0, 12, 0], x: [0, 9, -5, 0], opacity: [0.5, 1, 0.3, 0.8, 0.5] }}
      transition={{ duration: 5 + delay * 0.8, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ─────────────────────────────────────
   COMBO SECTION
───────────────────────────────────── */
export default function ComboSection({ combos = [], onBook }) {
  const sectionRef = useRef(null);
  const scrollRef  = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const headY = useTransform(scrollYProgress, [0, 1], [28, -28]);

  const scrollCarousel = (dir) => {
    if (!scrollRef.current) return;
    const w = (scrollRef.current.firstChild?.offsetWidth ?? 280) + 14;
    scrollRef.current.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const w = (scrollRef.current.firstChild?.offsetWidth ?? 280) + 14;
    setActiveIdx(Math.round(scrollRef.current.scrollLeft / w));
  };

  if (!combos.length) return null;

  const particles = [
    { x: "3%",  y: "12%", color: T.lilac,  delay: 0,   size: 5 },
    { x: "94%", y: "8%",  color: T.pink,   delay: 1.1, size: 4 },
    { x: "88%", y: "78%", color: T.cyan,   delay: 0.6, size: 5 },
    { x: "2%",  y: "80%", color: T.amber,  delay: 1.8, size: 3 },
    { x: "50%", y: "4%",  color: T.purple, delay: 2.2, size: 4 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&display=swap');

        /* ══════════════════════════════════
           SECTION
        ══════════════════════════════════ */
        .cs2-section {
          position: relative;
          background: linear-gradient(180deg, #0a0a1a 0%, #0e0920 100%);
          padding: 90px 0 110px;
          overflow: hidden;
        }
        .cs2-section::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, ${T.purple}, ${T.pink}, transparent);
        }
        .cs2-section::after {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(122,44,255,0.013) 2px, rgba(122,44,255,0.013) 4px
          );
          pointer-events: none; z-index: 0;
        }
        .cs2-bg-orb {
          position: absolute; border-radius: 50%;
          filter: blur(90px); pointer-events: none; z-index: 0;
        }
        .cs2-inner {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto; padding: 0 28px;
        }

        /* ── HEADER ── */
        .cs2-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 52px; gap: 16px; flex-wrap: wrap;
        }
        .cs2-title-block { display: flex; align-items: center; gap: 16px; }
        .cs2-icon-wrap {
          width: 54px; height: 54px;
          background: linear-gradient(135deg, rgba(122,44,255,0.18), rgba(192,38,211,0.12));
          border: 1px solid rgba(122,44,255,0.34);
          display: flex; align-items: center; justify-content: center;
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
          color: ${T.lilac}; flex-shrink: 0; overflow: hidden;
        }
        .cs2-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(20px, 3vw, 34px);
          font-weight: 900; color: #fff; margin: 0;
        }
        .cs2-title-grad {
          background: linear-gradient(135deg, ${T.lilac}, ${T.pink});
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; background-size: 200% 200%;
          animation: cs2-grad 4s ease infinite;
        }
        @keyframes cs2-grad {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .cs2-subtitle {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px; color: rgba(192,132,252,0.7);
          letter-spacing: 3px; display: block; margin-top: 5px;
          text-transform: uppercase;
        }
        .cs2-badge {
          display: flex; align-items: center; gap: 7px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px; letter-spacing: 2px; color: ${T.pink};
          background: rgba(255,0,110,0.07);
          border: 1px solid rgba(255,0,110,0.25);
          padding: 9px 18px;
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
          align-self: center;
        }

        /* ══════════════════════════════════
           CHROMA GRID  (desktop)
        ══════════════════════════════════ */
        .cs2-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
          align-items: start;
        }

        /* ══════════════════════════════════
           CARD  (ChromaGrid-style)
        ══════════════════════════════════ */
        .cc2-card {
          position: relative;
          width: 100%; height: 100%;
          overflow: hidden;
          background: var(--card-gradient, linear-gradient(145deg, #0d0d28, #130f2a));
          border: 1px solid ${T.border};
          clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
          display: flex; flex-direction: column;
          cursor: pointer;
          transition: border-color 0.35s;
          --mx: 50%; --my: 50%;
        }
        .cc2-card:hover { border-color: var(--acc, ${T.lilac})55; }

        /* ── ChromaGrid overlay (dim everything outside cursor radius) ── */
        .cc2-chroma-overlay {
          position: absolute; inset: 0;
          pointer-events: none; z-index: 5;
          backdrop-filter: grayscale(1) brightness(0.72);
          -webkit-backdrop-filter: grayscale(1) brightness(0.72);
          background: rgba(0,0,0,0.001);
          opacity: 0;
          transition: opacity 0.3s ease;
          mask-image: radial-gradient(
            circle 180px at var(--mx) var(--my),
            transparent 0%, transparent 15%,
            rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.24) 48%,
            rgba(0,0,0,0.40) 62%, rgba(0,0,0,0.56) 76%,
            rgba(0,0,0,0.72) 88%, white 100%
          );
          -webkit-mask-image: radial-gradient(
            circle 180px at var(--mx) var(--my),
            transparent 0%, transparent 15%,
            rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.24) 48%,
            rgba(0,0,0,0.40) 62%, rgba(0,0,0,0.56) 76%,
            rgba(0,0,0,0.72) 88%, white 100%
          );
        }

        /* ── ChromaGrid fade (initial greyed state) ── */
        .cc2-chroma-fade {
          position: absolute; inset: 0;
          pointer-events: none; z-index: 4;
          backdrop-filter: grayscale(1) brightness(0.72);
          -webkit-backdrop-filter: grayscale(1) brightness(0.72);
          background: rgba(0,0,0,0.001);
          opacity: 1;
          transition: opacity 0.28s ease;
          mask-image: radial-gradient(
            circle 180px at var(--mx) var(--my),
            white 0%, white 15%,
            rgba(255,255,255,0.90) 30%, rgba(255,255,255,0.76) 48%,
            rgba(255,255,255,0.60) 62%, rgba(255,255,255,0.44) 76%,
            rgba(255,255,255,0.28) 88%, transparent 100%
          );
          -webkit-mask-image: radial-gradient(
            circle 180px at var(--mx) var(--my),
            white 0%, white 15%,
            rgba(255,255,255,0.90) 30%, rgba(255,255,255,0.76) 48%,
            rgba(255,255,255,0.60) 62%, rgba(255,255,255,0.44) 76%,
            rgba(255,255,255,0.28) 88%, transparent 100%
          );
        }

        /* mouse spotlight */
        .cc2-spotlight {
          position: absolute; inset: 0; z-index: 3; pointer-events: none;
          background: radial-gradient(circle 160px at var(--mx) var(--my), rgba(255,255,255,0.07), transparent 70%);
          opacity: 0; transition: opacity 0.35s;
        }
        .cc2-card:hover .cc2-spotlight { opacity: 1; }

        .cc2-ambient {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
        }

        /* corner ticks */
        .cc2-corner {
          position: absolute; width: 18px; height: 18px;
          z-index: 7; pointer-events: none; border-style: solid;
        }
        .cc2-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        .cc2-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

        /* IMAGE */
        .cc2-img-wrap { position: relative; overflow: hidden; flex-shrink: 0; }
        .cc2-img {
          width: 100%; height: 195px; object-fit: cover; display: block;
          transition: transform 0.55s ease, filter 0.45s ease;
          filter: brightness(0.82) saturate(1.2);
        }
        .cc2-card:hover .cc2-img { transform: scale(1.08); filter: brightness(1) saturate(1.45); }
        .cc2-img-fade {
          position: absolute; bottom: 0; left: 0; right: 0; height: 55%;
          background: linear-gradient(to top, #130f2a, transparent); pointer-events: none;
        }
        .cc2-badge {
          position: absolute; top: 11px; left: 11px;
          display: flex; align-items: center; gap: 5px; color: #fff;
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px; letter-spacing: 2px; padding: 4px 9px;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
          z-index: 2; transition: transform 0.25s;
        }
        .cc2-card:hover .cc2-badge { transform: scale(1.06); }
        .cc2-price-overlay {
          position: absolute; bottom: 10px; right: 13px;
          display: flex; align-items: baseline; gap: 3px; z-index: 2;
          transition: transform 0.3s;
        }
        .cc2-card:hover .cc2-price-overlay { transform: translateY(-4px); }
        .cc2-price-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px; color: rgba(255,255,255,0.45); letter-spacing: 1px;
        }
        .cc2-price-val {
          font-family: 'Orbitron', sans-serif;
          font-size: 22px; font-weight: 900; line-height: 1;
        }

        /* BODY */
        .cc2-body {
          padding: 16px 16px 14px;
          display: flex; flex-direction: column; flex: 1;
          position: relative; z-index: 1; gap: 10px;
        }
        .cc2-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 14px; font-weight: 700;
          color: #fff; margin: 0; line-height: 1.3;
          transition: color 0.3s;
        }
        .cc2-card:hover .cc2-name { color: var(--acc); }

        .cc2-details { display: flex; flex-direction: column; gap: 6px; }
        .cc2-row { display: flex; align-items: center; gap: 7px; font-family: 'Share Tech Mono', monospace; font-size: 11px; }
        .cc2-row-icon { flex-shrink: 0; display: flex; }
        .cc2-row-label { color: rgba(255,255,255,0.32); letter-spacing: 1px; text-transform: uppercase; font-size: 10px; }
        .cc2-row-val { color: rgba(255,255,255,0.8); margin-left: auto; }

        /* FOOTER */
        .cc2-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; gap: 8px; }
        .cc2-book-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'Orbitron', sans-serif; font-size: 10px;
          font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
          color: #08080f; background: var(--acc);
          border: none; cursor: pointer; padding: 8px 14px;
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cc2-book-btn:hover { transform: scale(1.05); box-shadow: 0 0 18px var(--acc-shadow, rgba(192,132,252,0.5)); }
        .cc2-book-btn:active { transform: scale(0.96); }

        .cc2-pts {
          display: flex; align-items: center; gap: 4px;
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          color: ${T.amber}; letter-spacing: 1px;
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25);
          padding: 5px 10px;
          clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
        }

        .cc2-accent-line {
          height: 2px; border-radius: 1px;
          transform: scaleX(0); transform-origin: left;
          transition: transform 1s cubic-bezier(0.22,1,0.36,1);
        }
        .cc2-card:hover .cc2-accent-line { transform: scaleX(1); }

        @keyframes cc2-pkg-slide {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(4px); }
        }
        .cc2-pkg-icon { animation: cc2-pkg-slide 1.4s ease-in-out infinite; display: flex; }

        /* ══════════════════════════════════
           MOBILE CAROUSEL
        ══════════════════════════════════ */
        .cs2-carousel-wrap { position: relative; }
        .cs2-carousel {
          display: flex; overflow-x: auto;
          gap: 14px; padding-bottom: 8px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .cs2-carousel::-webkit-scrollbar { display: none; }
        .cs2-carousel > * { flex: 0 0 78vw; scroll-snap-align: start; min-width: 0; }

        .cs2-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 36px; height: 36px;
          background: rgba(122,44,255,0.25);
          border: 1px solid rgba(122,44,255,0.4);
          color: ${T.lilac}; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
          z-index: 5;
          transition: transform 0.2s;
        }
        .cs2-arrow:hover { transform: translateY(-50%) scale(1.1); }
        .cs2-arrow:active { transform: translateY(-50%) scale(0.92); }
        .cs2-arrow-l { left: -14px; }
        .cs2-arrow-r { right: -14px; }

        /* ══════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ══════════════════════════════════ */
        @media (max-width: 1200px) {
          .cs2-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .cs2-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
        }
        @media (max-width: 640px) {
          .cs2-section { padding: 60px 0 80px; }
          .cs2-inner { padding: 0 16px; }
          .cs2-header { margin-bottom: 36px; }
          .cs2-grid { display: none !important; }
          .cs2-carousel-wrap { display: block !important; }
          .cs2-carousel > * { flex: 0 0 83vw; }
          .cc2-img { height: 165px; }
        }
        @media (max-width: 400px) {
          .cs2-carousel > * { flex: 0 0 91vw; }
          .cs2-arrow { display: none; }
        }
      `}</style>

      <section className="cs2-section" ref={sectionRef}>
        {/* Ambient orbs */}
        <motion.div className="cs2-bg-orb"
          style={{ width: 500, height: 500, top: -150, left: -120, background: "rgba(122,44,255,0.07)" }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div className="cs2-bg-orb"
          style={{ width: 420, height: 420, bottom: -120, right: -80, background: "rgba(192,38,211,0.06)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        {particles.map((p, i) => <Particle key={i} {...p} />)}

        <div className="cs2-inner">

          {/* HEADER */}
          <motion.div className="cs2-header" style={{ y: headY }}>
            <motion.div
              className="cs2-title-block"
              initial={{ opacity: 0, x: -36, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <motion.div className="cs2-icon-wrap"
                animate={{ boxShadow: [`0 0 0px ${T.purple}00`, `0 0 22px ${T.purple}55`, `0 0 0px ${T.purple}00`] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.span
                  animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                >
                  <Gift size={22} />
                </motion.span>
              </motion.div>
              <div>
                <h2 className="cs2-title">
                  Combo&nbsp;<span className="cs2-title-grad">Offers</span>
                </h2>
                <span className="cs2-subtitle">Game + Snack Bundles</span>
              </div>
            </motion.div>

            <motion.div
              className="cs2-badge"
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.2 }}
              animate={{ boxShadow: [`0 0 0px ${T.pink}00`, `0 0 18px ${T.pink}44`, `0 0 0px ${T.pink}00`] }}
            >
              <motion.span
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.25, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Sparkles size={12} />
              </motion.span>
              Best Deals
            </motion.div>
          </motion.div>

          {/* DESKTOP GRID */}
          <motion.div
            className="cs2-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {combos.map((combo, i) => (
              <motion.div
                key={combo.id}
                style={{ height: "100%" }}
                variants={{
                  hidden:   { opacity: 0, y: 55, rotateX: -18, scale: 0.88 },
                  visible: {
                    opacity: 1, y: 0, rotateX: 0, scale: 1,
                    transition: { type: "spring", stiffness: 140, damping: 16, delay: i * 0.09 },
                  },
                }}
              >
                <ComboCard combo={combo} index={i} onBook={onBook} />
              </motion.div>
            ))}
          </motion.div>

          {/* MOBILE CAROUSEL  (hidden on desktop via CSS) */}
          <div className="cs2-carousel-wrap" style={{ display: "none" }}>
            <motion.div
              className="cs2-carousel" ref={scrollRef} onScroll={handleScroll}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {combos.map((combo, i) => (
                <div key={combo.id} style={{ minWidth: 0 }}>
                  <ComboCard combo={combo} index={i} onBook={onBook} />
                </div>
              ))}
            </motion.div>

            <AnimatePresence>
              {activeIdx > 0 && (
                <motion.button className="cs2-arrow cs2-arrow-l" onClick={() => scrollCarousel(-1)}
                  initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                >
                  <ChevronLeft size={18} />
                </motion.button>
              )}
              {activeIdx < combos.length - 1 && (
                <motion.button className="cs2-arrow cs2-arrow-r" onClick={() => scrollCarousel(1)}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                >
                  <ChevronRight size={18} />
                </motion.button>
              )}
            </AnimatePresence>

            <CarouselDots total={combos.length} active={activeIdx} />
          </div>

        </div>
      </section>
    </>
  );
}