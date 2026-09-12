import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Gift, Sparkles, Utensils, Star, Zap, Package, X, RotateCw, ChevronRight, Flame } from "lucide-react";
import ComboCard, { T, ACCENT_CYCLE } from "./ComboCard";

/* ─────────────────────────────────────
   Small hook: are we on a phone-sized viewport?
───────────────────────────────────── */
function useIsMobile(breakpoint = 720) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

/* Spring presets reused across the focused-card choreography */
const SPRING_STAGE = { type: "spring", stiffness: 240, damping: 24, mass: 0.9 };
const SPRING_FLIP = { duration: 0.75, ease: [0.34, 1.56, 0.64, 1] };

/* ══════════════════════════════════════
   DESKTOP CARD — "Data Slab"
   A distinct desktop-only design: 3D pointer-tilt, holographic
   shine sweep on hover, animated scan-line, glowing rim, and a
   price readout that looks like a HUD readout rather than the
   mobile card's poster-style layout.
══════════════════════════════════════ */
function DesktopComboCard({ combo, index, onOpen }) {
  const accent = ACCENT_CYCLE[index % ACCENT_CYCLE.length];
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 200, damping: 20 });
  const shineX = useTransform(mx, [0, 1], ["-20%", "120%"]);

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const handleLeave = () => {
    setHovered(false);
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      className="dc-card"
      ref={ref}
      style={{ "--acc": accent, rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      onClick={() => onOpen(combo, index)}
      initial={{ opacity: 0, y: 50, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 220, damping: 22 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className="dc-glow-ring"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35 }}
      />

      <div className="dc-corner dc-tl" />
      <div className="dc-corner dc-br" />

      {/* image band */}
      <div className="dc-media">
        <motion.img
          src={combo.image}
          alt={combo.name}
          className="dc-img"
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="dc-media-fade" />

        {/* holographic shine sweep */}
        <motion.div
          className="dc-shine"
          style={{ left: shineX }}
          animate={{ opacity: hovered ? 0.55 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* scanline, only animates on hover */}
        <motion.div
          className="dc-scan"
          animate={hovered ? { top: ["0%", "100%"] } : { top: "0%" }}
          transition={hovered ? { duration: 1.6, repeat: Infinity, ease: "linear" } : { duration: 0 }}
        />

        <div className="dc-tag">
          <Flame size={10} /> COMBO
        </div>

        <motion.div
          className="dc-loyalty"
          animate={{ y: hovered ? -3 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Star size={11} /> +{combo.loyalty_bonus}
        </motion.div>
      </div>

      {/* HUD-style info panel */}
      <div className="dc-panel">
        <div className="dc-row-top">
          <h4 className="dc-name">{combo.name}</h4>
          <motion.span
            className="dc-price"
            animate={{ textShadow: hovered ? `0 0 18px ${accent}` : `0 0 0px ${accent}00` }}
          >
            ₹{parseFloat(combo.combo_price).toFixed(0)}
          </motion.span>
        </div>

        <div className="dc-meta">
          <span className="dc-meta-item">
            <Utensils size={11} /> {combo.snack_name}
          </span>
        </div>

        <motion.div
          className="dc-cta"
          animate={{
            gap: hovered ? "10px" : "6px",
            background: hovered ? `${accent}22` : "rgba(255,255,255,0.03)",
          }}
          transition={{ duration: 0.3 }}
        >
          <span>View combo</span>
          <motion.span
            className="dc-cta-arrow"
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <ChevronRight size={14} />
          </motion.span>
        </motion.div>
      </div>

      {/* animated bottom accent bar */}
      <motion.div
        className="dc-bar"
        animate={{ scaleX: hovered ? 1 : 0.35, opacity: hovered ? 1 : 0.5 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </motion.div>
  );
}

/* ══════════════════════════════════════
   FOCUSED / FLIP CARD  (the "ejected" card)
   Shared by desktop + mobile. Front face uses layoutId matching
   the mobile mini card's ids; desktop card doesn't share layoutId
   (different DOM shape) so it gets a clean fade/scale entrance instead.
══════════════════════════════════════ */
function FocusedCard({ combo, index, onClose, morph }) {
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();
  const accent = ACCENT_CYCLE[index % ACCENT_CYCLE.length];

  const handleBook = (e) => {
    e.stopPropagation();
    navigate("/sign-in");
  };

  const wrapProps = morph
    ? { layoutId: `combo-card-${combo.id}` }
    : { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 } };
  const imgProps = morph ? { layoutId: `combo-img-${combo.id}` } : {};

  return (
    <motion.div
      className="fc-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* radial glow that blooms in behind the stage */}
      <motion.div
        className="fc-glow"
        style={{ background: `radial-gradient(circle, ${accent}33, transparent 70%)` }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1.4 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      <motion.div
        className="fc-stage"
        style={{ "--acc": accent }}
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 20, opacity: 0, transition: { duration: 0.22 } }}
        transition={SPRING_STAGE}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          className="fc-close"
          onClick={onClose}
          aria-label="Close"
          initial={{ opacity: 0, scale: 0, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 400, damping: 20 }}
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.85 }}
        >
          <X size={16} />
        </motion.button>

        <motion.div
          {...wrapProps}
          className="fc-morph-wrap"
          transition={SPRING_STAGE}
        >
          <motion.div
            className="fc-flip"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={SPRING_FLIP}
            onClick={() => setFlipped((f) => !f)}
            style={{ transformStyle: "preserve-3d" }}
          >
          {/* ── FRONT ── */}
          <div
            className="fc-face fc-front"
            style={{ "--acc": accent }}
          >
            <div className="fc-corner fc-tl" style={{ borderColor: accent }} />
            <div className="fc-corner fc-br" style={{ borderColor: T.pink }} />

            <motion.img
              {...imgProps}
              src={combo.image}
              alt={combo.name}
              className="fc-img"
              transition={SPRING_STAGE}
            />
            <div className="fc-img-fade" />

            <motion.div
              className="fc-badge"
              style={{ background: `${accent}cc` }}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.35 }}
            >
              COMBO
            </motion.div>

            <motion.div
              className="fc-price"
              style={{ color: accent, textShadow: `0 0 22px ${accent}99` }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.32, type: "spring", stiffness: 380, damping: 16 }}
            >
              ₹{parseFloat(combo.combo_price).toFixed(0)}
            </motion.div>

            <motion.div
              className="fc-front-foot"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <h5 className="fc-name">{combo.name}</h5>
              <motion.span
                className="fc-hint"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                <RotateCw size={12} /> tap to view details
              </motion.span>
            </motion.div>
          </div>

          {/* ── BACK ── */}
          <div className="fc-face fc-back" style={{ "--acc": accent }}>
            <motion.h5
              className="fc-back-name"
              style={{ color: accent }}
              initial={false}
              animate={{ opacity: flipped ? 1 : 0, y: flipped ? 0 : 10 }}
              transition={{ delay: flipped ? 0.3 : 0, duration: 0.3 }}
            >
              {combo.name}
            </motion.h5>

            <div className="fc-rows">
              {[
                { icon: <Utensils size={14} />, color: T.pink, label: "Snack", val: combo.snack_name },
                { icon: <Zap size={14} />, color: accent, label: "Price", val: `₹${parseFloat(combo.combo_price).toFixed(2)}` },
                { icon: <Star size={14} />, color: T.amber, label: "Loyalty", val: `+${combo.loyalty_bonus} pts` },
              ].map((row, i) => (
                <motion.div
                  key={row.label}
                  className="fc-row"
                  initial={false}
                  animate={{ opacity: flipped ? 1 : 0, x: flipped ? 0 : -18 }}
                  transition={{ delay: flipped ? 0.32 + i * 0.08 : 0, duration: 0.32, ease: "easeOut" }}
                >
                  <span className="fc-row-icon" style={{ color: row.color }}>{row.icon}</span>
                  <span className="fc-row-label">{row.label}</span>
                  <span className="fc-row-val" style={{ color: row.color === accent ? accent : undefined }}>
                    {row.val}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.button
              className="fc-book-btn"
              style={{ "--acc": accent }}
              onClick={handleBook}
              initial={false}
              animate={{ opacity: flipped ? 1 : 0, y: flipped ? 0 : 16 }}
              transition={{ delay: flipped ? 0.55 : 0, duration: 0.35 }}
              whileHover={{ scale: 1.04, boxShadow: `0 0 26px ${accent}` }}
              whileTap={{ scale: 0.96 }}
            >
              <Package size={14} /> Book Now <ChevronRight size={14} />
            </motion.button>

            <motion.span
              className="fc-back-hint"
              initial={false}
              animate={{ opacity: flipped ? 1 : 0 }}
              transition={{ delay: flipped ? 0.6 : 0, duration: 0.3 }}
            >
              tap card to flip back
            </motion.span>
          </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   SECTION
══════════════════════════════════════ */
export default function ComboSection({ combos = [] }) {
  const isMobile = useIsMobile();
  const [openIdx, setOpenIdx] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleOpen = useCallback((_combo, idx) => setOpenIdx(idx), []);
  const handleClose = useCallback(() => setOpenIdx(null), []);

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, handleClose]);

  const particles = useMemo(
    () => [
      { x: "3%", y: "10%", color: T.lilac, delay: 0 },
      { x: "94%", y: "8%", color: T.pink, delay: 1.1 },
      { x: "88%", y: "80%", color: T.cyan, delay: 0.6 },
      { x: "2%", y: "78%", color: T.amber, delay: 1.8 },
    ],
    []
  );

  if (!combos.length) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&display=swap');

        /* ── SECTION SHELL ── */
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
        .cs2-orb {
          position: absolute; border-radius: 50%; filter: blur(90px);
          pointer-events: none; z-index: 0;
        }
        .cs2-particle {
          position: absolute; width: 5px; height: 5px; border-radius: 50%;
          pointer-events: none; z-index: 0; filter: blur(2px);
        }

        .cs2-inner { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 0 28px; }

        /* ── HEADER ── */
        .cs2-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 56px; }
        .cs2-title-block { display: flex; align-items: center; gap: 16px; }
        .cs2-icon-wrap {
          width: 54px; height: 54px;
          background: linear-gradient(135deg, rgba(122,44,255,0.18), rgba(255,0,110,0.12));
          border: 1px solid rgba(122,44,255,0.34);
          display: flex; align-items: center; justify-content: center;
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
          color: ${T.lilac}; flex-shrink: 0;
        }
        .cs2-title { font-family: 'Orbitron', sans-serif; font-size: clamp(20px, 3vw, 34px); font-weight: 900; color: #fff; margin: 0; }
        .cs2-title-grad {
          background: linear-gradient(135deg, ${T.lilac}, ${T.pink});
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          background-size: 200% 200%; animation: cs2-grad 4s ease infinite;
        }
        @keyframes cs2-grad { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .cs2-subtitle { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: rgba(192,132,252,0.7); letter-spacing: 3px; display: block; margin-top: 5px; text-transform: uppercase; }
        .cs2-best-badge {
          display: flex; align-items: center; gap: 7px;
          font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: ${T.pink};
          background: rgba(255,0,110,0.07); border: 1px solid rgba(255,0,110,0.25); padding: 9px 18px;
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
        }

        /* ══════════════════════════════════
           DESKTOP GRID + "DATA SLAB" CARD
        ══════════════════════════════════ */
        .cs2-desktop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 28px;
          padding: 10px 0 20px;
        }

        .dc-card {
          position: relative;
          cursor: pointer;
          border-radius: 18px;
          background: linear-gradient(160deg, #10102c 0%, #150f2c 55%, #0c0a1f 100%);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 18px 40px rgba(0,0,0,0.5);
          transform-style: preserve-3d;
          overflow: hidden;
          will-change: transform;
        }
        .dc-glow-ring {
          position: absolute; inset: -1px; border-radius: 18px; pointer-events: none; z-index: 5;
          box-shadow: 0 0 0 1px var(--acc), 0 0 34px 2px color-mix(in srgb, var(--acc) 55%, transparent);
        }
        .dc-corner {
          position: absolute; width: 26px; height: 26px; z-index: 6; pointer-events: none;
          border-style: solid; border-color: var(--acc); opacity: 0.85;
        }
        .dc-tl { top: 10px; left: 10px; border-width: 2px 0 0 2px; }
        .dc-br { bottom: 10px; right: 10px; border-width: 0 2px 2px 0; }

        .dc-media { position: relative; width: 100%; height: 190px; overflow: hidden; }
        .dc-img { width: 100%; height: 100%; object-fit: cover; display: block; transform-origin: center; }
        .dc-media-fade {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to bottom, rgba(10,8,22,0) 45%, rgba(12,10,28,0.95) 100%);
        }
        .dc-shine {
          position: absolute; top: -20%; width: 40%; height: 140%; z-index: 2;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-18deg);
          pointer-events: none;
        }
        .dc-scan {
          position: absolute; left: 0; right: 0; height: 2px; z-index: 2;
          background: linear-gradient(90deg, transparent, var(--acc), transparent);
          box-shadow: 0 0 10px var(--acc);
          pointer-events: none;
        }
        .dc-tag {
          position: absolute; top: 12px; left: 12px; z-index: 3;
          display: flex; align-items: center; gap: 5px;
          font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1.5px;
          color: #08080f; background: var(--acc); padding: 4px 9px 4px 7px;
          border-radius: 0 0 8px 0;
        }
        .dc-loyalty {
          position: absolute; top: 12px; right: 12px; z-index: 3;
          display: flex; align-items: center; gap: 4px;
          font-family: 'Share Tech Mono', monospace; font-size: 10px; color: ${T.amber};
          background: rgba(5,5,15,0.55); border: 1px solid rgba(251,191,36,0.35);
          padding: 4px 8px; border-radius: 20px; backdrop-filter: blur(3px);
        }

        .dc-panel { position: relative; z-index: 2; padding: 16px 16px 18px; display: flex; flex-direction: column; gap: 10px; }
        .dc-row-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .dc-name {
          font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 16px; color: #fff;
          margin: 0; line-height: 1.2;
        }
        .dc-price {
          font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 17px; color: var(--acc);
          white-space: nowrap; flex-shrink: 0;
        }
        .dc-meta { display: flex; flex-wrap: wrap; gap: 8px; }
        .dc-meta-item {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'Share Tech Mono', monospace; font-size: 10.5px; color: rgba(255,255,255,0.55);
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
          padding: 4px 9px; border-radius: 20px;
        }
        .dc-cta {
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 1.2px;
          text-transform: uppercase; color: #fff;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
          padding: 9px 12px; margin-top: 2px;
        }
        .dc-cta-arrow { display: flex; color: var(--acc); }

        .dc-bar {
          position: absolute; left: 0; right: 0; bottom: 0; height: 3px;
          background: linear-gradient(90deg, var(--acc), ${T.pink});
          transform-origin: left center;
        }

        /* ── MINI CARD (mobile carousel, unchanged) ── */
        .cc-mini {
          position: relative; overflow: hidden; cursor: pointer;
          background: linear-gradient(150deg, #0d0d28, #130f2a);
          border: 2px solid rgba(255,255,255,0.08);
          clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
          box-shadow: 0 10px 26px rgba(0,0,0,0.45);
          transform-style: preserve-3d;
        }
        .cc-mini-sweep {
          position: absolute; inset: -40%; z-index: 0; opacity: 0.35; pointer-events: none;
        }
        .cc-mini-img { width: 100%; height: 100%; object-fit: cover; display: block; position: relative; z-index: 1; }
        .cc-mini-fade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,5,15,0.92) 0%, rgba(5,5,15,0.15) 45%, transparent 65%); z-index: 1; }
        .cc-mini-corner { position: absolute; width: 16px; height: 16px; z-index: 3; border-style: solid; pointer-events: none; }
        .cc-mini-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        .cc-mini-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }
        .cc-mini-badge {
          position: absolute; top: 9px; left: 9px; color: #fff;
          font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1.5px;
          padding: 3px 8px; z-index: 2; display: flex; align-items: center; gap: 4px;
          clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
        }
        .cc-mini-price {
          position: absolute; top: 9px; right: 10px;
          font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 15px; z-index: 2;
        }
        .cc-mini-foot { position: absolute; left: 10px; right: 10px; bottom: 9px; z-index: 2; display: flex; flex-direction: column; gap: 4px; }
        .cc-mini-name {
          font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 13px; color: #fff;
          text-shadow: 0 1px 6px rgba(0,0,0,0.8); line-height: 1.15;
        }
        .cc-mini-pts {
          display: inline-flex; align-items: center; gap: 3px; width: fit-content;
          font-family: 'Share Tech Mono', monospace; font-size: 9px; color: ${T.amber};
          background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 3px;
        }
        .cc-mini-ring { position: absolute; inset: 0; pointer-events: none; z-index: 4; }

        /* ── MOBILE CAROUSEL (unchanged) ── */
        .cs2-carousel-wrap { position: relative; display: none; }
        .cs2-carousel {
          display: flex; gap: 14px; overflow-x: auto; padding: 8px 4px 14px;
          scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .cs2-carousel::-webkit-scrollbar { display: none; }
        .cs2-carousel .cc-mini { flex: 0 0 62vw; max-width: 260px; height: 320px; scroll-snap-align: center; }
        .cs2-dots { display: flex; justify-content: center; gap: 6px; margin-top: 6px; }
        .cs2-dot { height: 4px; border-radius: 2px; background: rgba(255,255,255,0.22); transition: all 0.25s; }
        .cs2-dot.active { width: 20px; background: ${T.lilac}; }
        .cs2-dot:not(.active) { width: 6px; }

        /* ── FOCUSED / FLIP OVERLAY ── */
        .fc-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(3,3,10,0.82); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .fc-glow {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          pointer-events: none; filter: blur(20px);
        }
        .fc-stage { position: relative; perspective: 1400px; width: 340px; height: 460px; }
        .fc-morph-wrap { position: relative; width: 100%; height: 100%; }
        .fc-close {
          position: absolute; top: -14px; right: -14px; z-index: 20;
          width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2);
          background: #0d0d28; color: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .fc-flip {
          position: relative; width: 100%; height: 100%;
          transform-style: preserve-3d; cursor: pointer;
        }
        .fc-face {
          position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden;
          overflow: hidden; background: linear-gradient(150deg, #0d0d28, #130f2a);
          border: 1px solid var(--acc); box-shadow: 0 30px 70px rgba(0,0,0,0.6), 0 0 40px var(--acc);
          clip-path: polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 26px 100%, 0 calc(100% - 26px));
        }
        .fc-corner { position: absolute; width: 22px; height: 22px; border-style: solid; z-index: 3; }
        .fc-tl { top: -1px; left: -1px; border-width: 3px 0 0 3px; }
        .fc-br { bottom: -1px; right: -1px; border-width: 0 3px 3px 0; }

        .fc-front { display: flex; flex-direction: column; }
        .fc-img { width: 100%; height: 62%; object-fit: cover; display: block; }
        .fc-img-fade { position: absolute; left: 0; right: 0; top: 30%; height: 45%; background: linear-gradient(to bottom, transparent, #130f2a 92%); }
        .fc-badge {
          position: absolute; top: 16px; left: 16px; color: #fff;
          font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; padding: 5px 11px; z-index: 2;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
        }
        .fc-price {
          position: absolute; top: 16px; right: 18px; font-family: 'Orbitron', sans-serif;
          font-weight: 900; font-size: 26px; z-index: 2;
        }
        .fc-front-foot { position: relative; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 10px; padding: 10px 20px; }
        .fc-name { font-family: 'Orbitron', sans-serif; font-size: 18px; font-weight: 800; color: #fff; margin: 0; }
        .fc-hint { display: flex; align-items: center; gap: 6px; font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--acc); letter-spacing: 1px; }

        .fc-back { transform: rotateY(180deg); display: flex; flex-direction: column; padding: 26px 22px; gap: 18px; }
        .fc-back-name { font-family: 'Orbitron', sans-serif; font-size: 17px; font-weight: 800; margin: 6px 0 0; }
        .fc-rows { display: flex; flex-direction: column; gap: 12px; flex: 1; justify-content: center; }
        .fc-row { display: flex; align-items: center; gap: 10px; font-family: 'Rajdhani', sans-serif; font-size: 15px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; }
        .fc-row-icon { flex-shrink: 0; display: flex; }
        .fc-row-label { color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px; font-size: 11px; font-family: 'Share Tech Mono', monospace; }
        .fc-row-val { margin-left: auto; color: #fff; font-weight: 600; }
        .fc-book-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: #08080f; background: var(--acc); border: none; cursor: pointer;
          padding: 13px 0; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }
        .fc-back-hint { text-align: center; font-family: 'Share Tech Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }

        /* ── RESPONSIVE ── */
        @media (max-width: 720px) {
          .cs2-section { padding: 60px 0 80px; }
          .cs2-inner { padding: 0 16px; }
          .cs2-desktop-grid { display: none; }
          .cs2-carousel-wrap { display: block; }
          .fc-stage { width: 90vw; max-width: 340px; height: 68vh; max-height: 500px; }
        }
      `}</style>

      <section className="cs2-section">
        <motion.div className="cs2-orb" style={{ width: 500, height: 500, top: -150, left: -120, background: "rgba(122,44,255,0.07)" }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 10, repeat: Infinity }} />
        <motion.div className="cs2-orb" style={{ width: 420, height: 420, bottom: -120, right: -80, background: "rgba(255,0,110,0.06)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 13, repeat: Infinity, delay: 3 }} />
        {particles.map((p, i) => (
          <motion.div key={i} className="cs2-particle" style={{ left: p.x, top: p.y, background: p.color }}
            animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 5 + p.delay, delay: p.delay, repeat: Infinity }} />
        ))}

        <div className="cs2-inner">
          {/* HEADER */}
          <div className="cs2-header">
            <motion.div className="cs2-title-block" initial={{ opacity: 0, x: -36 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <motion.div className="cs2-icon-wrap" animate={{ boxShadow: [`0 0 0px ${T.purple}00`, `0 0 22px ${T.purple}55`, `0 0 0px ${T.purple}00`] }} transition={{ duration: 3, repeat: Infinity }}>
                <Gift size={22} />
              </motion.div>
              <div>
                <h2 className="cs2-title">Combo&nbsp;<span className="cs2-title-grad">Offers</span></h2>
                <span className="cs2-subtitle">Game + Snack Bundles</span>
              </div>
            </motion.div>
            <motion.div className="cs2-best-badge" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", delay: 0.2 }}>
              <Sparkles size={12} /> Best Deals
            </motion.div>
          </div>

          {/* DESKTOP GRID — new "Data Slab" card design */}
          <div className="cs2-desktop-grid">
            {combos.map((combo, i) => (
              <DesktopComboCard key={combo.id} combo={combo} index={i} onOpen={handleOpen} />
            ))}
          </div>

          {/* MOBILE CAROUSEL — unchanged */}
          <div className="cs2-carousel-wrap">
            <div
              className="cs2-carousel"
              onScroll={(e) => {
                const w = e.currentTarget.firstChild?.offsetWidth + 14 || 260;
                setActiveIdx(Math.round(e.currentTarget.scrollLeft / w));
              }}
            >
              {combos.map((combo, i) => (
                <ComboCard
                  key={combo.id}
                  combo={combo}
                  index={i}
                  onOpen={handleOpen}
                  dimmed={openIdx !== null}
                  isOpen={openIdx === i}
                />
              ))}
            </div>
            <div className="cs2-dots">
              {combos.map((_, i) => <div key={i} className={`cs2-dot ${i === activeIdx ? "active" : ""}`} />)}
            </div>
          </div>
        </div>
      </section>

      {/* FOCUSED / FLIP CARD */}
      <AnimatePresence mode="popLayout">
        {openIdx !== null && (
          <FocusedCard
            key={combos[openIdx].id}
            combo={combos[openIdx]}
            index={openIdx}
            onClose={handleClose}
            morph={isMobile}
          />
        )}
      </AnimatePresence>
    </>
  );
}