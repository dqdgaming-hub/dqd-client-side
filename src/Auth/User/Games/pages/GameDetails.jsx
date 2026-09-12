import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import UserLayout from "../../Userlayout";
import { getGameDetails } from "../../../api/userapi";

// ── Design tokens ─────────────────────────────────────────────────────────────
const VOID    = "#05040A";
const PANEL   = "#0D0A18";
const PANEL2  = "#110E1F";
const PURPLE  = "#7A2CFF";
const FUCHSIA = "#C026D3";
const SILVER  = "#B9C2D9";
const GOLD    = "#D4AF37";
const GOLDHI  = "#F4D886";
const RED     = "#FF4D6D";
const BORDER  = "rgba(122,44,255,0.22)";

// ── Back icon ─────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M14.5 5 8 12l6.5 7" stroke={GOLD} strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Maintenance icon ──────────────────────────────────────────────────────────
const WrenchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
      stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Floating particle ─────────────────────────────────────────────────────────
function Particle({ style, dur, delay }) {
  return (
    <motion.div
      style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", ...style }}
      animate={{ y: [0, -28, 0], opacity: [style.opacity * 0.35, style.opacity, style.opacity * 0.35] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ h, delay = 0, clip = true }) {
  const shimmer = `linear-gradient(90deg, ${PANEL} 25%, #1a1232 50%, ${PANEL} 75%)`;
  return (
    <div style={{
      height: h, background: PANEL,
      border: `1px solid ${BORDER}`,
      clipPath: clip ? "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)" : "none",
      overflow: "hidden",
    }}>
      <motion.div
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay }}
        style={{ height: "100%", background: shimmer, backgroundSize: "400% 100%" }}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Skeleton h={340} delay={0} clip={false} />
      <Skeleton h={80}  delay={0.08} />
      <Skeleton h={120} delay={0.14} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Skeleton h={90} delay={0.18} />
        <Skeleton h={90} delay={0.22} />
        <Skeleton h={90} delay={0.26} />
      </div>
      <Skeleton h={56}  delay={0.3} />
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent = PURPLE, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 + index * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background:  PANEL2,
        border:      `1px solid ${accent}33`,
        clipPath:    "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
        padding:     "14px 14px 14px",
        position:    "relative",
        overflow:    "hidden",
      }}
    >
      {/* Corner accent glow */}
      <div style={{
        position:   "absolute", top: 0, right: 0,
        width: 50, height: 50,
        background: `radial-gradient(circle at top right, ${accent}22, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Icon bubble */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background:  `${accent}18`,
        border:      `1.5px solid ${accent}44`,
        display:     "flex", alignItems: "center", justifyContent: "center",
        fontSize:    15, marginBottom: 10,
      }}>{icon}</div>

      <div style={{
        fontFamily:    "'Orbitron', monospace",
        fontSize:      8, fontWeight: 700,
        letterSpacing: "0.18em",
        color:         `${SILVER}55`,
        textTransform: "uppercase",
        marginBottom:  5,
      }}>{label}</div>

      <div style={{
        fontFamily:    "'Share Tech Mono', monospace",
        fontSize:      "clamp(14px, 3vw, 18px)",
        fontWeight:    700,
        color:         accent === GOLD ? GOLDHI : SILVER,
        letterSpacing: "0.04em",
        lineHeight:    1.1,
      }}>{value}</div>
    </motion.div>
  );
}

// ── Stagger variants ──────────────────────────────────────────────────────────
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] } },
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GameDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [game,    setGame]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => { loadGame(); }, []);

  const loadGame = async () => {
    setLoading(true);
    try {
      const res = await getGameDetails(id);
      setGame(res.data);
    } finally {
      setLoading(false);
    }
  };

  const particles = [
    { w: 5, l: "6%",  t: "10%", c: GOLD,    o: 0.3,  dur: 4.2, d: 0   },
    { w: 4, l: "90%", t: "20%", c: PURPLE,  o: 0.44, dur: 3.6, d: 0.8 },
    { w: 6, l: "70%", t: "72%", c: GOLD,    o: 0.26, dur: 5.1, d: 1.3 },
    { w: 3, l: "20%", t: "80%", c: PURPLE,  o: 0.46, dur: 3.9, d: 0.5 },
    { w: 5, l: "50%", t: "6%",  c: FUCHSIA, o: 0.28, dur: 4.7, d: 2.1 },
    { w: 4, l: "82%", t: "52%", c: GOLD,    o: 0.35, dur: 3.3, d: 1.0 },
  ];

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap');
          *, *::before, *::after { box-sizing: border-box; }

          .gd-back { transition: background 0.2s, border-color 0.2s; }
          .gd-back:hover {
            background:   rgba(212,175,55,0.1) !important;
            border-color: ${GOLD}88 !important;
          }
          .gd-back:hover .gd-arrow { transform: translateX(-3px); }
          .gd-arrow { transition: transform 0.2s ease; display: inline-flex; }

          .gd-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

          @media (max-width: 600px) {
            .gd-stats { grid-template-columns: 1fr 1fr !important; }
            .gd-page  { padding: 14px 12px 80px !important; }
          }
          @media (max-width: 380px) {
            .gd-stats { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <div
          className="gd-page"
          style={{
            minHeight:     "100vh",
            background:    VOID,
            position:      "relative",
            overflow:      "hidden",
            padding:       "clamp(16px, 3vw, 32px) clamp(12px, 4vw, 28px) 80px",
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            fontFamily:    "'Inter','Segoe UI',sans-serif",
          }}
        >
          {/* ── Ambient orbs ── */}
          <div style={{
            position: "absolute", top: "-10%", left: "-6%",
            width: "min(520px, 85vw)", height: "min(520px, 85vw)", borderRadius: "50%",
            background: `radial-gradient(circle, ${PURPLE}16 0%, transparent 70%)`,
            filter: "blur(72px)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "4%", right: "-5%",
            width: "min(420px, 68vw)", height: "min(420px, 68vw)", borderRadius: "50%",
            background: `radial-gradient(circle, ${GOLD}0D 0%, transparent 70%)`,
            filter: "blur(72px)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: `radial-gradient(circle, ${SILVER} 1px, transparent 1px)`,
            backgroundSize: "28px 28px", opacity: 0.03,
          }} />
          {particles.map((p, i) => (
            <Particle key={i} dur={p.dur} delay={p.d} style={{
              width: p.w, height: p.w, left: p.l, top: p.t,
              background: p.c, opacity: p.o, boxShadow: `0 0 8px ${p.c}`,
            }} />
          ))}

          {/* ── Content column ── */}
          <div style={{ width: "100%", maxWidth: 780, position: "relative", zIndex: 2 }}>

            {/* ── Back button ── */}
            <motion.button
              className="gd-back"
              onClick={() => navigate(-1)}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display:       "inline-flex", alignItems: "center", gap: 7,
                marginBottom:  22, padding: "8px 18px 8px 12px",
                background:    "rgba(122,44,255,0.07)",
                border:        `1px solid ${BORDER}`,
                clipPath:      "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
                cursor:        "pointer", outline: "none",
                fontFamily:    "'Orbitron', monospace", fontSize: 9, fontWeight: 700,
                letterSpacing: "0.22em", color: `${GOLD}cc`, textTransform: "uppercase",
              }}
            >
              <span className="gd-arrow"><BackIcon /></span>
              Back
            </motion.button>

            {/* ── Skeleton / Content ── */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial="hidden" animate="visible"
                  variants={containerVariants}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >

                  {/* ── Hero image card ── */}
                  <motion.div variants={itemVariants}>
                    <div style={{
                      position: "relative", overflow: "hidden",
                      background: PANEL,
                      border:     `1px solid ${BORDER}`,
                      clipPath:   "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px))",
                    }}>
                      {/* Image */}
                      <div style={{ position: "relative", height: "clamp(200px, 38vw, 360px)", overflow: "hidden" }}>
                        <motion.img
                          src={game.image} alt={game.name}
                          onLoad={() => setImgLoaded(true)}
                          initial={{ scale: 1.08, filter: "brightness(0.6)" }}
                          animate={imgLoaded
                            ? { scale: 1, filter: "brightness(1)" }
                            : { scale: 1.08, filter: "brightness(0.6)" }}
                          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                        {/* Gradient overlay */}
                        <div style={{
                          position: "absolute", inset: 0,
                          background: `linear-gradient(to bottom, transparent 25%, ${PANEL}CC 80%, ${PANEL} 100%)`,
                        }} />
                        {/* Purple top-left glow */}
                        <div style={{
                          position: "absolute", top: 0, left: 0, width: 120, height: 120,
                          background: `radial-gradient(circle at top left, ${PURPLE}33, transparent 70%)`,
                          pointerEvents: "none",
                        }} />
                        {/* Animated gold right trace */}
                        <motion.div
                          animate={{ opacity: [0.3, 0.85, 0.3] }}
                          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                          style={{
                            position: "absolute", top: 0, right: 0,
                            width: 2, height: "100%",
                            background: `linear-gradient(to bottom, transparent, ${GOLD}99, transparent)`,
                          }}
                        />
                        {/* Animated bottom scan line */}
                        <motion.div
                          animate={{ opacity: [0, 0.6, 0], y: [0, 20, 0] }}
                          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                          style={{
                            position: "absolute", bottom: "28%", left: 0, right: 0,
                            height: 1,
                            background: `linear-gradient(to right, transparent 5%, ${PURPLE}66 40%, ${GOLD}44 60%, transparent 95%)`,
                            pointerEvents: "none",
                          }}
                        />

                        {/* Category chip — overlaid on image */}
                        <motion.div
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3, duration: 0.45 }}
                          style={{
                            position: "absolute", top: 16, left: 16,
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "5px 13px 5px 10px",
                            background: `${PANEL}CC`,
                            border: `1px solid ${FUCHSIA}55`,
                            clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%)",
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            style={{ width: 5, height: 5, borderRadius: "50%", background: FUCHSIA, boxShadow: `0 0 6px ${FUCHSIA}` }}
                          />
                          <span style={{
                            fontFamily: "'Orbitron', monospace", fontSize: 8, fontWeight: 700,
                            letterSpacing: "0.2em", color: FUCHSIA, textTransform: "uppercase",
                          }}>{game.category?.name}</span>
                        </motion.div>

                        {/* Maintenance badge on image */}
                        {game.maintenance_mode && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{
                              position: "absolute", top: 16, right: 16,
                              display: "inline-flex", alignItems: "center", gap: 6,
                              padding: "5px 12px",
                              background: `${RED}22`,
                              border: `1px solid ${RED}55`,
                              clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%)",
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            <WrenchIcon />
                            <span style={{
                              fontFamily: "'Orbitron', monospace", fontSize: 7, fontWeight: 700,
                              letterSpacing: "0.16em", color: RED, textTransform: "uppercase",
                            }}>Maintenance</span>
                          </motion.div>
                        )}
                      </div>

                      {/* ── Title block ── */}
                      <div style={{ padding: "18px 24px 22px" }}>
                        <div style={{
                          fontFamily: "'Orbitron', monospace", fontSize: 8,
                          letterSpacing: "0.28em", color: `${GOLD}66`,
                          textTransform: "uppercase", marginBottom: 8,
                        }}>◈ GAME SESSION</div>

                        <motion.h1
                          initial={{ opacity: 0, x: -14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          style={{
                            fontFamily:    "'Orbitron', monospace",
                            fontSize:      "clamp(20px, 4.5vw, 32px)",
                            fontWeight:    900,
                            color:         GOLDHI,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            margin:        "0 0 14px",
                            lineHeight:    1.08,
                            textShadow:    `0 0 28px ${GOLD}44`,
                          }}
                        >{game.name}</motion.h1>

                        {/* Bottom rule */}
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.28, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          style={{
                            height: 1, transformOrigin: "left",
                            background: `linear-gradient(to right, ${PURPLE}88, ${GOLD}55, transparent)`,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* ── Description card ── */}
                  {game.description && (
                    <motion.div variants={itemVariants}>
                      <div style={{
                        background: PANEL,
                        border:     `1px solid ${BORDER}`,
                        clipPath:   "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)",
                        padding:    "18px 20px",
                        position:   "relative",
                        overflow:   "hidden",
                      }}>
                        {/* Left accent bar */}
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2.1, repeat: Infinity }}
                          style={{
                            position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                            background: `linear-gradient(to bottom, ${PURPLE}cc, ${PURPLE}22)`,
                          }}
                        />
                        <div style={{ paddingLeft: 12 }}>
                          <div style={{
                            fontFamily: "'Orbitron', monospace", fontSize: 8, fontWeight: 700,
                            letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase",
                            marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
                          }}>
                            <span>About</span>
                          </div>
                          <p style={{
                            fontFamily:    "'Rajdhani', 'Inter', sans-serif",
                            fontSize:      "clamp(13px, 2.2vw, 14px)",
                            lineHeight:    1.75,
                            color:         `${SILVER}cc`,
                            letterSpacing: "0.03em",
                            margin:        0,
                          }}>{game.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Stats grid ── */}
                  <motion.div variants={itemVariants} className="gd-stats">
                    <StatCard
                      label="Price per Hour"
                      value={`INR ${Number(game.price_per_hour).toFixed(2)}`}
                      icon="✦"
                      accent={GOLD}
                      index={0}
                    />
                    <StatCard
                      label="Min Players"
                      value={game.min_capacity}
                      icon="◆"
                      accent={PURPLE}
                      index={1}
                    />
                    <StatCard
                      label="Max Players"
                      value={game.max_capacity}
                      icon="◈"
                      accent={FUCHSIA}
                      index={2}
                    />
                  </motion.div>

                  {/* ── CTA button ── */}
                  <motion.div variants={itemVariants}>
                    {game.maintenance_mode ? (
                      <div style={{
                        display:    "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap:        12,
                        padding:    "20px 22px",
                        background: `${RED}09`,
                        border:     `1px solid ${RED}33`,
                        clipPath:   "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <motion.div
                            animate={{ rotate: [0, 20, -20, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            style={{ fontSize: 20 }}
                          >🔧</motion.div>
                          <div>
                            <div style={{
                              fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 700,
                              letterSpacing: "0.18em", color: RED, textTransform: "uppercase",
                              marginBottom: 3,
                            }}>Under Maintenance</div>
                            <div style={{
                              fontFamily: "'Rajdhani', 'Inter', sans-serif",
                              fontSize: 12, color: `${SILVER}55`, letterSpacing: "0.04em",
                            }}>This game is temporarily unavailable for booking.</div>
                          </div>
                        </div>
                        <div style={{
                          width: "100%", height: 1,
                          background: `linear-gradient(to right, transparent, ${RED}44, transparent)`,
                        }} />
                        <button
                          disabled
                          style={{
                            width:      "100%", padding: "14px",
                            background: `${RED}11`,
                            border:     `1px solid ${RED}33`,
                            clipPath:   "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                            cursor:     "not-allowed",
                            fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 700,
                            letterSpacing: "0.22em", color: `${RED}66`, textTransform: "uppercase",
                          }}
                        >Booking Unavailable</button>
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => navigate(`/user/games/${game.id}/book`)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          width:       "100%", padding: "16px 24px",
                          background:  `linear-gradient(135deg, ${PURPLE}cc, ${GOLD}88)`,
                          border:      `1px solid ${GOLD}77`,
                          clipPath:    "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                          cursor:      "pointer", outline: "none",
                          fontFamily:  "'Orbitron', monospace", fontSize: 12, fontWeight: 900,
                          letterSpacing: "0.26em", color: GOLDHI, textTransform: "uppercase",
                          boxShadow:   `0 0 32px ${PURPLE}44, 0 0 14px ${GOLD}22`,
                          position:    "relative", overflow: "hidden",
                          transition:  "box-shadow 0.3s",
                        }}
                      >
                        {/* Sweep shimmer */}
                        <motion.div
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
                          style={{
                            position: "absolute", top: 0, left: 0,
                            width: "35%", height: "100%",
                            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.09), transparent)",
                            pointerEvents: "none",
                          }}
                        />
                        ◈ Book Now
                      </motion.button>
                    )}
                  </motion.div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </>
    </UserLayout>
  );
}