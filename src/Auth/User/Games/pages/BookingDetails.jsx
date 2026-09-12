import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import UserLayout from "../../Userlayout";
import { getBookingDetails } from "../../../api/userapi";

import BookingHero         from "../booking/BookingHero";
import BookingInfo         from "../booking/BookingInfo";
import BookingMembersCard  from "../booking/BookingMembersCard";
import BookingPaymentCard  from "../booking/BookingPaymentCard";
import BookingQRCodeCard   from "../booking/BookingQRCodeCard";
import BookingApprovalCard from "../booking/BookingApprovalCard";
import BookingNotesCard    from "../booking/BookingNotesCard";

// ── Design tokens ─────────────────────────────────────────────────────────────
const VOID   = "#05040A";
const PANEL  = "#0D0A18";
const PURPLE = "#7A2CFF";
const SILVER = "#B9C2D9";
const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const BORDER = "rgba(122,44,255,0.22)";

// ── Back icon ─────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M14.5 5 8 12l6.5 7" stroke={GOLD} strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonBlock({ h = 180, delay = 0 }) {
  const shimmer = `linear-gradient(90deg, ${PANEL} 25%, #1a1232 50%, ${PANEL} 75%)`;
  return (
    <div style={{
      background: PANEL, border: `1px solid ${BORDER}`,
      clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)",
      overflow: "hidden", height: h,
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
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      <SkeletonBlock h={300} delay={0}/>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <SkeletonBlock h={260} delay={0.08}/>
        <SkeletonBlock h={260} delay={0.12}/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <SkeletonBlock h={200} delay={0.16}/>
        <SkeletonBlock h={200} delay={0.2}/>
        <SkeletonBlock h={200} delay={0.24}/>
      </div>
      <SkeletonBlock h={100} delay={0.28}/>
    </div>
  );
}

// ── Floating particle ─────────────────────────────────────────────────────────
function Particle({ style, dur, delay }) {
  return (
    <motion.div
      style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", ...style }}
      animate={{ y: [0, -28, 0], opacity: [style.opacity * 0.4, style.opacity, style.opacity * 0.4] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ── Stagger variants ──────────────────────────────────────────────────────────
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BookingDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBooking(); }, []);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const res = await getBookingDetails(id);
      setBooking(res.data);
    } finally {
      setLoading(false);
    }
  };

  const particles = [
    { w: 5,  l: "8%",  t: "12%", c: GOLD,   o: 0.35, dur: 4.2, d: 0    },
    { w: 4,  l: "22%", t: "55%", c: PURPLE, o: 0.45, dur: 3.6, d: 0.7  },
    { w: 6,  l: "72%", t: "18%", c: GOLD,   o: 0.3,  dur: 5.1, d: 1.2  },
    { w: 3,  l: "88%", t: "68%", c: PURPLE, o: 0.5,  dur: 3.9, d: 0.4  },
    { w: 5,  l: "44%", t: "80%", c: GOLD,   o: 0.28, dur: 4.6, d: 1.9  },
    { w: 4,  l: "60%", t: "38%", c: PURPLE, o: 0.38, dur: 3.3, d: 0.9  },
    { w: 3,  l: "16%", t: "82%", c: GOLD,   o: 0.32, dur: 5.4, d: 2.3  },
    { w: 5,  l: "92%", t: "30%", c: PURPLE, o: 0.42, dur: 4.0, d: 0.6  },
  ];

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap');

          *, *::before, *::after { box-sizing: border-box; }

          .bd-page { font-family: 'Inter', 'Segoe UI', sans-serif; }

          /* ── Row layouts ── */
          .bd-row2 {
            display: grid;
            grid-template-columns: 1.15fr 1fr;
            gap: 16px;
          }
          .bd-row3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
          }

          /* ── Tablet: row3 becomes 2+1 */
          @media (max-width: 860px) {
            .bd-row2  { grid-template-columns: 1fr !important; }
            .bd-row3  { grid-template-columns: 1fr 1fr !important; }
          }

          /* ── Mobile: everything stacks ── */
          @media (max-width: 560px) {
            .bd-row3 { grid-template-columns: 1fr !important; }
            .bd-page { padding: 14px 12px 72px !important; }
          }

          /* ── Back button ── */
          .bd-back { transition: background 0.2s, border-color 0.2s, color 0.2s; }
          .bd-back:hover {
            background:   rgba(212,175,55,0.1) !important;
            border-color: ${GOLD}88 !important;
            color:        ${GOLDHI} !important;
          }
          .bd-back:hover .bd-arrow { transform: translateX(-3px); }
          .bd-arrow { transition: transform 0.2s ease; display: inline-flex; }

          /* ── Card equal-height rows ── */
          .bd-row2 > *, .bd-row3 > * { min-height: 0; }
        `}</style>

        <div
          className="bd-page"
          style={{
            minHeight:      "100vh",
            background:     VOID,
            position:       "relative",
            overflow:       "hidden",
            padding:        "clamp(16px, 3vw, 32px) clamp(12px, 4vw, 28px) 80px",
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
          }}
        >
          {/* ── Ambient orbs ── */}
          <div style={{
            position: "absolute", top: "-8%", left: "-5%",
            width: "min(500px, 80vw)", height: "min(500px, 80vw)", borderRadius: "50%",
            background: `radial-gradient(circle, ${PURPLE}16 0%, transparent 70%)`,
            filter: "blur(70px)", pointerEvents: "none",
          }}/>
          <div style={{
            position: "absolute", bottom: "4%", right: "-4%",
            width: "min(400px, 66vw)", height: "min(400px, 66vw)", borderRadius: "50%",
            background: `radial-gradient(circle, ${GOLD}0D 0%, transparent 70%)`,
            filter: "blur(70px)", pointerEvents: "none",
          }}/>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(ellipse at 50% 0%, transparent 55%, ${VOID}cc 100%)`,
          }}/>

          {/* ── Particles ── */}
          {particles.map((p, i) => (
            <Particle key={i} dur={p.dur} delay={p.d} style={{
              width:      p.w, height: p.w,
              left:       p.l, top:    p.t,
              background: p.c,
              opacity:    p.o,
              boxShadow:  `0 0 8px ${p.c}`,
            }}/>
          ))}

          {/* ── Hex-dot grid overlay ── */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.035,
            backgroundImage: `radial-gradient(circle, ${SILVER} 1px, transparent 1px)`,
            backgroundSize:  "28px 28px",
          }}/>

          {/* ── Content column ── */}
          <div style={{ width: "100%", maxWidth: 940, position: "relative", zIndex: 2 }}>

            {/* ── Back button ── */}
            <motion.button
              className="bd-back"
              onClick={() => navigate(-1)}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display:       "inline-flex",
                alignItems:    "center",
                gap:           7,
                marginBottom:  22,
                padding:       "8px 18px 8px 12px",
                background:    "rgba(122,44,255,0.07)",
                border:        `1px solid ${BORDER}`,
                clipPath:      "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
                cursor:        "pointer",
                fontFamily:    "'Orbitron', monospace",
                fontSize:      9,
                fontWeight:    700,
                letterSpacing: "0.22em",
                color:         `${GOLD}cc`,
                textTransform: "uppercase",
                outline:       "none",
              }}
            >
              <span className="bd-arrow"><BackIcon/></span>
              Back
            </motion.button>

            {/* ── Page content ── */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                  <LoadingSkeleton/>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Row 1: Hero — full width */}
                  <motion.div variants={itemVariants}>
                    <BookingHero booking={booking}/>
                  </motion.div>

                  {/* Row 2: Info | Payment */}
                  <motion.div variants={itemVariants} className="bd-row2">
                    <BookingInfo        booking={booking}/>
                    <BookingPaymentCard booking={booking}/>
                  </motion.div>

                  {/* Row 3: Members | QR | Approval */}
                  <motion.div variants={itemVariants} className="bd-row3">
                    <BookingMembersCard  booking={booking}/>
                    <BookingQRCodeCard   booking={booking}/>
                    <BookingApprovalCard booking={booking}/>
                  </motion.div>

                  {/* Row 4: Notes — full width */}
                  <motion.div variants={itemVariants}>
                    <BookingNotesCard booking={booking}/>
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