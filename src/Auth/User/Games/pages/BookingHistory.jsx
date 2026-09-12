import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import UserLayout from "../../Userlayout";
import { getBookingHistory } from "../../../api/userapi";
import BookingHistoryCard from "../booking/BookingHistoryCard";

const VOID   = "#05040A";
const PANEL  = "#0D0A18";
const PURPLE = "#7A2CFF";
const SILVER = "#B9C2D9";
const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const BORDER = "rgba(122,44,255,0.22)";

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function HistorySkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          background: PANEL, border: `1px solid ${BORDER}`, height: 140,
          clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))",
          overflow: "hidden",
        }}>
          <motion.div
            animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: i * 0.12 }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg,${PANEL} 25%,#1a1232 50%,${PANEL} 75%)`,
              backgroundSize: "400% 100%",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 18, padding: "64px 24px",
        background: PANEL, border: `1px solid ${BORDER}`,
        clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px))",
      }}
    >
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{
          width: 56, height: 56, borderRadius: "50%",
          background: `radial-gradient(circle,${PURPLE}33,transparent 70%)`,
          border: `1px solid ${PURPLE}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke={`${PURPLE}cc`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <line x1="8" y1="14" x2="8" y2="14"/>
        </svg>
      </motion.div>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.24em", color: `${GOLD}88`,
          textTransform: "uppercase", marginBottom: 8,
        }}>No Records Found</div>
        <div style={{
          fontFamily: "'Rajdhani','Inter',sans-serif", fontSize: 13,
          color: `${SILVER}55`, letterSpacing: "0.04em",
        }}>Your booking history will appear here</div>
      </div>
    </motion.div>
  );
}

export default function BookingHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await getBookingHistory();
      setHistory(res.results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: VOID,
        padding: "clamp(16px,3vw,32px) clamp(12px,4vw,28px) 100px",
        fontFamily: "'Inter','Segoe UI',sans-serif",
        position: "relative", overflow: "hidden",
      }}>

        {/* Ambient orbs */}
        <div style={{
          position:"fixed",top:"-10%",left:"-5%",
          width:"min(480px,80vw)",height:"min(480px,80vw)",borderRadius:"50%",
          background:`radial-gradient(circle,${PURPLE}14 0%,transparent 70%)`,
          filter:"blur(72px)",pointerEvents:"none",zIndex:0,
        }}/>
        <div style={{
          position:"fixed",bottom:"5%",right:"-4%",
          width:"min(360px,64vw)",height:"min(360px,64vw)",borderRadius:"50%",
          background:`radial-gradient(circle,${GOLD}0C 0%,transparent 70%)`,
          filter:"blur(72px)",pointerEvents:"none",zIndex:0,
        }}/>

        <div style={{ position:"relative", zIndex:1, maxWidth:760, margin:"0 auto" }}>

          {/* Page header */}
          <motion.div
            initial={{ opacity:0, y:14 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
            style={{ marginBottom:28 }}
          >
            <div style={{
              fontFamily:"'Orbitron',monospace", fontSize:8,
              letterSpacing:"0.28em", color:`${GOLD}66`,
              textTransform:"uppercase", marginBottom:6,
            }}>◈ MISSION LOG</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
              <h1 style={{
                fontFamily:"'Orbitron',monospace",
                fontSize:"clamp(18px,4vw,26px)", fontWeight:900,
                color:GOLDHI, textTransform:"uppercase",
                letterSpacing:"0.06em", margin:0,
                textShadow:`0 0 28px ${GOLD}44`,
              }}>Booking History</h1>
              {!loading && history.length > 0 && (
                <motion.div
                  initial={{ opacity:0, scale:0.88 }}
                  animate={{ opacity:1, scale:1 }}
                  style={{
                    fontFamily:"'Share Tech Mono',monospace", fontSize:10,
                    color:`${PURPLE}cc`, background:`${PURPLE}22`,
                    border:`1px solid ${PURPLE}44`, padding:"4px 12px",
                    clipPath:"polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)",
                    letterSpacing:"0.1em",
                  }}
                >{history.length} Records</motion.div>
              )}
            </div>
            {/* Divider */}
            <div style={{ marginTop:14, height:1, position:"relative", overflow:"hidden" }}>
              <div style={{
                position:"absolute", inset:0,
                background:`linear-gradient(90deg,${PURPLE}88,${GOLD}66,transparent)`,
              }}/>
              <motion.div
                animate={{ x:["-100%","200%"] }}
                transition={{ duration:2.4, repeat:Infinity, ease:"easeInOut", repeatDelay:1.5 }}
                style={{
                  position:"absolute", top:0, left:0,
                  width:"30%", height:"100%",
                  background:`linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)`,
                }}
              />
            </div>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <HistorySkeleton />
              </motion.div>
            ) : history.length === 0 ? (
              <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <EmptyState />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ display:"flex", flexDirection:"column", gap:14 }}
              >
                {history.map((booking) => (
                  <motion.div key={booking.id} variants={itemVariants}>
                    <BookingHistoryCard
                      booking={booking}
                      onClick={() => navigate(`/user/bookings/${booking.id}`)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </UserLayout>
  );
}