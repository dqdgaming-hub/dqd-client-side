import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Zap, ChevronRight, Star, Shield, Trophy } from "lucide-react";

/* ══════════════════════════════════════════════════
   PILLARS
══════════════════════════════════════════════════ */
const pillars = [
  { icon: Gamepad2, label: "Next-Gen Consoles", color: "#00f5ff" },
  { icon: Zap,      label: "VR Simulators",     color: "#c084fc" },
  { icon: Trophy,   label: "Live Tournaments",   color: "#ff006e" },
  { icon: Shield,   label: "Loyalty Rewards",    color: "#f59e0b" },
];

/* ══════════════════════════════════════════════════
   GLITCH COUNT-UP
══════════════════════════════════════════════════ */
function GlitchNumber({ value, suffix = "", active }) {
  const [display, setDisplay] = useState("??");
  const [glitching, setGlitching] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (!active || done.current) return;
    done.current = true;
    setGlitching(true);
    let ticks = 0;
    const iv = setInterval(() => {
      setDisplay(Math.floor(Math.random() * Math.max(value * 5, 99)).toString());
      ticks++;
      if (ticks >= 14) {
        clearInterval(iv);
        setGlitching(false);
        const dur = 1600;
        const t0 = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - t0) / dur, 1);
          const e = 1 - Math.pow(1 - p, 3);
          const v = Math.round(e * value);
          const formatted = v >= 1_000 ? `${(v / 1000).toFixed(1)}K` : String(v);
          setDisplay(formatted + suffix);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, 60);
    return () => clearInterval(iv);
  }, [active, value, suffix]);

  return <span className={glitching ? "ab-glitch" : ""}>{display}</span>;
}

/* ══════════════════════════════════════════════════
   ORBIT RING (decorative animated SVG)
══════════════════════════════════════════════════ */
function OrbitRing({ size = 300, color = "#00f5ff", duration = 8, opacity = 0.12 }) {
  return (
    <motion.svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", pointerEvents: "none" }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <circle
        cx={size / 2} cy={size / 2} r={size / 2 - 2}
        fill="none" stroke={color}
        strokeWidth="1"
        strokeDasharray="6 18"
        opacity={opacity}
      />
    </motion.svg>
  );
}

/* ══════════════════════════════════════════════════
   FLOATING PARTICLE (tiny neon dot)
══════════════════════════════════════════════════ */
function Particle({ x, y, color, delay, size }) {
  return (
    <motion.div
      style={{
        position: "absolute", left: x, top: y,
        width: size, height: size,
        borderRadius: "50%", background: color,
        filter: `blur(${size / 3}px)`,
        pointerEvents: "none",
      }}
      animate={{
        y: [0, -24, 0, 12, 0],
        x: [0, 10, -6, 0],
        opacity: [0.6, 1, 0.4, 0.9, 0.6],
        scale: [1, 1.4, 0.9, 1.2, 1],
      }}
      transition={{
        duration: 5 + delay,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ══════════════════════════════════════════════════
   STAT BAR ITEM
══════════════════════════════════════════════════ */
function StatBarItem({ value, suffix, label, color, inView, index }) {
  return (
    <motion.div
      className="ab-stat-item"
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 14,
        delay: 0.2 + index * 0.14,
      }}
      whileHover={{ scale: 1.12, y: -4 }}
    >
      <motion.span
        className="ab-stat-val"
        style={{ color }}
        animate={inView ? { textShadow: [`0 0 8px ${color}`, `0 0 32px ${color}`, `0 0 12px ${color}`] } : {}}
        transition={{ duration: 2, delay: 0.8 + index * 0.14, repeat: Infinity, repeatType: "mirror" }}
      >
        <GlitchNumber value={value} suffix={suffix} active={inView} />
      </motion.span>
      <span className="ab-stat-lbl">{label}</span>
      <motion.span
        className="ab-stat-accent"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: 0.6 + index * 0.14, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   PILLAR CARD
══════════════════════════════════════════════════ */
function PillarCard({ icon: Icon, label, color, index }) {
  const [hovered, setHovered] = useState(false);

  /* stagger entry */
  const variants = {
    hidden: { opacity: 0, x: index % 2 === 0 ? -40 : 40, y: 20, rotate: index % 2 === 0 ? -6 : 6 },
    show:   { opacity: 1, x: 0, y: 0, rotate: 0,
               transition: { type: "spring", stiffness: 160, damping: 14, delay: 0.3 + index * 0.08 } },
  };

  return (
    <motion.div
      className="ab-pillar"
      style={{ "--pc": color, "--pc-bg": color + "12", "--pc-bd": color + "33" }}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <motion.span
        className="ab-pillar-icon"
        animate={hovered
          ? { rotate: [0, -15, 15, -8, 8, 0], scale: [1, 1.25, 1.1, 1.2, 1] }
          : { rotate: 0, scale: 1 }
        }
        transition={{ duration: 0.5 }}
      >
        <Icon size={15} />
      </motion.span>
      <span className="ab-pillar-label">{label}</span>

      {/* sweep on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            className="ab-pillar-sweep"
            initial={{ x: "-110%", skewX: "-18deg" }}
            animate={{ x: "200%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   DEFAULT STATS
══════════════════════════════════════════════════ */
const DEFAULT_STATS = {
  total_users: 10000,
  total_games: 500,
  total_events: 50,
};

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function AboutSection({ stats = DEFAULT_STATS }) {
  const navigate    = useNavigate();
  const sectionRef = useRef(null);
  const statRef    = useRef(null);
  const imgRef     = useRef(null);
  const [statInView, setStatInView] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);

  /* mouse parallax for desktop image */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-1, 1], [8, -8]),  { stiffness: 140, damping: 18 });
  const rotY = useSpring(useTransform(mx, [-1, 1], [-8,  8]), { stiffness: 140, damping: 18 });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const textY    = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.96, 1.02, 0.96]);
  const bgY      = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!statRef.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatInView(true); },
      { threshold: 0.25 }
    );
    obs.observe(statRef.current);
    return () => obs.disconnect();
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || !imgRef.current) return;
    const r  = imgRef.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width  - 0.5) * 2);
    my.set(((e.clientY - r.top)  / r.height - 0.5) * 2);
  };
  const handleMouseLeave = () => { mx.set(0); my.set(0); };

  const handleExploreGames = () => {
    navigate("/games");
  };

  const statItems = [
    { value: stats.total_games  ?? 500,   suffix: "+", label: "Games",   color: "#00f5ff" },
    { value: stats.total_users  ?? 10000, suffix: "+", label: "Players",  color: "#c084fc" },
    { value: stats.total_events ?? 50,    suffix: "+", label: "Events",   color: "#ff006e" },
  ];

  /* particles config */
  const particles = [
    { x: "8%",  y: "15%", color: "#00f5ff", delay: 0,   size: 6 },
    { x: "90%", y: "10%", color: "#ff006e", delay: 1.2, size: 4 },
    { x: "75%", y: "70%", color: "#c084fc", delay: 0.6, size: 5 },
    { x: "5%",  y: "75%", color: "#f59e0b", delay: 1.8, size: 3 },
    { x: "50%", y: "5%",  color: "#00f5ff", delay: 2.4, size: 4 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500&display=swap');

        /* ─── SECTION ─── */
        .ab-section {
          position: relative;
          background: #070714;
          overflow: hidden;
          padding: 120px 0 140px;
        }
        .ab-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,245,255,0.012) 2px, rgba(0,245,255,0.012) 4px
          );
          pointer-events: none;
          z-index: 0;
        }
        .ab-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }

        /* ─── INNER GRID ─── */
        .ab-inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        /* ─── TEXT SIDE ─── */
        .ab-eyebrow {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 4px;
          color: #00f5ff;
          text-transform: uppercase;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ab-eyebrow::after {
          content: '';
          flex: 1;
          max-width: 44px;
          height: 1px;
          background: #00f5ff;
          opacity: 0.45;
        }

        .ab-headline {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(30px, 4vw, 54px);
          font-weight: 900;
          line-height: 1.06;
          color: #fff;
          margin: 0 0 22px;
        }
        .ab-headline-grad {
          background: linear-gradient(135deg, #00f5ff 0%, #7c3aed 50%, #ff006e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 200%;
          animation: ab-grad-shift 4s ease infinite;
        }
        @keyframes ab-grad-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .ab-body {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.85;
          color: rgba(255,255,255,0.55);
          margin-bottom: 36px;
          max-width: 480px;
        }

        /* ─── PILLARS ─── */
        .ab-pillars {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 40px;
        }

        .ab-pillar {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--pc-bg, rgba(0,245,255,0.05));
          border: 1px solid var(--pc-bd, rgba(0,245,255,0.12));
          padding: 12px 14px;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
          cursor: default;
          overflow: hidden;
          transition: border-color 0.3s, background 0.3s;
        }
        .ab-pillar:hover {
          background: var(--pc-bg, rgba(0,245,255,0.1));
          border-color: var(--pc, #00f5ff);
        }
        .ab-pillar-icon {
          color: var(--pc, #00f5ff);
          flex-shrink: 0;
          display: flex;
        }
        .ab-pillar-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.82);
          letter-spacing: 0.4px;
        }
        .ab-pillar-sweep {
          position: absolute;
          inset: 0;
          width: 50%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          pointer-events: none;
        }

        /* ─── CTA BUTTON ─── */
        .ab-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #070714;
          background: linear-gradient(135deg, #00f5ff, #0099ff);
          border: none;
          cursor: pointer;
          padding: 15px 30px;
          clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.3s;
        }
        .ab-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #ff006e, #7c3aed);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .ab-cta:hover::before { opacity: 1; }
        .ab-cta > * { position: relative; z-index: 1; }
        .ab-cta:hover { box-shadow: 0 0 44px rgba(255,0,110,0.5); color: #fff; }

        /* ─── VISUAL SIDE ─── */
        .ab-visual {
          position: relative;
          padding-bottom: 36px;
        }

        .ab-img-frame {
          position: relative;
          clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 32px 100%, 0 calc(100% - 32px));
          overflow: hidden;
          transform-style: preserve-3d;
          perspective: 900px;
        }
        .ab-img-frame img {
          width: 100%;
          height: 500px;
          object-fit: cover;
          display: block;
          opacity: 0.88;
          transition: opacity 0.4s;
        }
        .ab-img-frame:hover img { opacity: 1; }

        /* shimmer overlay on image */
        .ab-img-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0,245,255,0.04) 0%,
            transparent 50%,
            rgba(255,0,110,0.04) 100%
          );
          pointer-events: none;
          animation: ab-shimmer 6s ease-in-out infinite;
        }
        @keyframes ab-shimmer {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }

        .ab-corner { position: absolute; width: 44px; height: 44px; z-index: 2; pointer-events: none; }
        .ab-corner-tl { top: -2px; left: -2px; border-top: 2px solid #00f5ff; border-left: 2px solid #00f5ff; }
        .ab-corner-br { bottom: -2px; right: -2px; border-bottom: 2px solid #ff006e; border-right: 2px solid #ff006e; }

        /* orbit rings wrapper */
        .ab-orbit-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
        }

        /* ─── STAT BAR ─── */
        .ab-stat-bar {
          position: absolute;
          bottom: -4px;
          left: 16px;
          right: 16px;
          background: rgba(7,7,20,0.96);
          border: 1px solid rgba(0,245,255,0.18);
          padding: 18px 20px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
          backdrop-filter: blur(12px);
          transition: border-color 0.4s;
          z-index: 3;
        }
        .ab-stat-bar:hover { border-color: rgba(0,245,255,0.38); }

        .ab-stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.07);
          flex-shrink: 0;
        }

        .ab-stat-item {
          text-align: center;
          position: relative;
          padding: 0 8px;
          cursor: default;
        }
        .ab-stat-val {
          font-family: 'Orbitron', sans-serif;
          font-size: 24px;
          font-weight: 700;
          display: block;
          line-height: 1;
          margin-bottom: 5px;
          min-height: 1.1em;
        }
        .ab-stat-lbl {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.38);
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .ab-stat-accent {
          display: block;
          height: 2px;
          margin-top: 7px;
          border-radius: 1px;
          transform-origin: left;
        }

        /* ─── GLITCH ─── */
        .ab-glitch {
          filter: blur(0.8px);
          opacity: 0.5;
          animation: ab-gn-flick 0.06s linear infinite;
          color: rgba(255,255,255,0.45) !important;
          text-shadow: none !important;
        }
        @keyframes ab-gn-flick {
          0%,100% { transform: none; }
          33%      { transform: translateX(2px); }
          66%      { transform: translateX(-2px); }
        }

        /* ═══════════════════════════════════════
           MOBILE STYLES (< 768px)
        ═══════════════════════════════════════ */
        @media (max-width: 900px) {
          .ab-section { padding: 80px 0 100px; }
          .ab-inner {
            grid-template-columns: 1fr;
            gap: 0;
            padding: 0 20px;
          }

          /* Stack: visual first */
          .ab-visual-col { order: -1; margin-bottom: 48px; }
          .ab-text-col   { order: 1; }

          .ab-img-frame img { height: 240px; }

          /* Stat bar becomes a horizontal scroll row on very small screens */
          .ab-stat-bar {
            position: static;
            margin-top: 14px;
            clip-path: none;
            border-radius: 4px;
            padding: 14px 16px;
            gap: 0;
          }

          .ab-stat-val { font-size: 20px; }

          .ab-body { max-width: 100%; }
        }

        @media (max-width: 540px) {
          .ab-pillars { grid-template-columns: 1fr 1fr; }
          .ab-headline { font-size: 26px; }
          .ab-stat-val { font-size: 18px; }
          .ab-section { padding: 60px 0 80px; }
        }

        @media (max-width: 380px) {
          .ab-pillars { grid-template-columns: 1fr; }
          .ab-cta { font-size: 11px; padding: 13px 22px; }
        }
      `}</style>

      <section className="ab-section" ref={sectionRef}>

        {/* ── Ambient orbs ── */}
        <motion.div
          className="ab-bg-orb"
          style={{ width: 600, height: 600, top: -200, left: -150, background: "rgba(0,245,255,0.055)" }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="ab-bg-orb"
          style={{ width: 500, height: 500, bottom: -150, right: -80, background: "rgba(255,0,110,0.055)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="ab-bg-orb"
          style={{ width: 300, height: 300, top: "40%", left: "50%", background: "rgba(124,58,237,0.04)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* ── Floating particles ── */}
        {particles.map((p, i) => <Particle key={i} {...p} />)}

        <div className="ab-inner">

          {/* ══════════ TEXT COLUMN ══════════ */}
          <motion.div
            className="ab-text-col"
            style={{ y: isMobile ? 0 : textY }}
          >
            {/* eyebrow */}
            <motion.div
              className="ab-eyebrow"
              initial={{ opacity: 0, x: -30, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <motion.span
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <Star size={11} />
              </motion.span>
              Est. 2024
            </motion.div>

            {/* headline — letters stagger in */}
            <motion.h2
              className="ab-headline"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Welcome to
              <br />
              <motion.span
                className="ab-headline-grad"
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                whileInView={{ opacity: 1, letterSpacing: "0em" }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                DQD Gaming
              </motion.span>
            </motion.h2>

            {/* body */}
            <motion.p
              className="ab-body"
              initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              Experience next-generation gaming with PlayStation, VR, simulators,
              pool tables, board games, multiplayer arenas, tournaments, exclusive
              events, combo offers, loyalty rewards, and much more — all in one
              immersive venue.
            </motion.p>

            {/* pillars */}
            <motion.div
              className="ab-pillars"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {pillars.map((p, i) => (
                <PillarCard key={p.label} {...p} index={i} />
              ))}
            </motion.div>

            {/* CTA */}
            <motion.button
              className="ab-cta"
              onClick={handleExploreGames}
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.65 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Explore Games</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronRight size={16} />
              </motion.span>
            </motion.button>
          </motion.div>

          {/* ══════════ VISUAL COLUMN ══════════ */}
          <motion.div
            className="ab-visual-col ab-visual"
            initial={{ opacity: 0, x: isMobile ? 0 : 60, y: isMobile ? 40 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* orbit rings */}
            <div className="ab-orbit-wrap" style={{ top: "40%", left: "50%" }}>
              <OrbitRing size={460} color="#00f5ff" duration={14} opacity={0.07} />
              <OrbitRing size={340} color="#ff006e" duration={9}  opacity={0.08} />
              <OrbitRing size={220} color="#c084fc" duration={6}  opacity={0.1} />
            </div>

            {/* 3-D parallax image frame */}
            <motion.div
              ref={imgRef}
              className="ab-img-frame"
              style={isMobile ? { scale: imgScale } : { rotateX: rotX, rotateY: rotY, scale: imgScale }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              whileHover={isMobile ? {} : { scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {/* <div className="ab-corner ab-corner-tl" /> */}
              <div className="ab-corner ab-corner-br" />
              {/* <div className="ab-img-shimmer" /> */}
              <img src="/logo.png" alt="DQD Gaming" />
            </motion.div>

            {/* LIVE STAT BAR */}
            <motion.div
              ref={statRef}
              className="ab-stat-bar"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.4 }}
            >
              {statItems.map((item, i) => (
                <Fragment key={item.label}>
                  <StatBarItem key={item.label} {...item} inView={statInView} index={i} />
                  {i < statItems.length - 1 && (
                    <motion.div
                      key={`div-${i}`}
                      className="ab-stat-divider"
                      initial={{ scaleY: 0 }}
                      animate={statInView ? { scaleY: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                    />
                  )}
                </Fragment>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </section>
    </>
  );
}