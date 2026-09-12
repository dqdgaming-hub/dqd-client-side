import { motion } from "framer-motion";
import BookingStatusBadge from "./BookingStatusBadge";

const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const PURPLE = "#7A2CFF";
const SILVER = "#B9C2D9";
const PANEL  = "#0D0A18";
const BORDER = "rgba(122,44,255,0.22)";

export default function BookingHero({ booking }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position:   "relative",
        overflow:   "hidden",
        background: PANEL,
        border:     `1px solid ${BORDER}`,
        clipPath:   "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px))",
      }}
    >
      {/* ── Game image with overlay ── */}
      <div style={{ position: "relative", height: "clamp(160px, 28vw, 260px)", overflow: "hidden" }}>
        <motion.img
          src={booking.game?.image}
          alt={booking.game?.name}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", display: "block",
          }}
        />

        {/* Dark gradient bottom */}
        <div style={{
          position:   "absolute", inset: 0,
          background: `linear-gradient(to bottom, transparent 30%, ${PANEL}EE 90%, ${PANEL} 100%)`,
        }}/>

        {/* Purple top-left corner accent */}
        <div style={{
          position:    "absolute", top: 0, left: 0,
          width:       80, height: 80,
          background:  `radial-gradient(circle at top left, ${PURPLE}44, transparent 70%)`,
          pointerEvents: "none",
        }}/>

        {/* Gold right edge trace */}
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position:   "absolute", top: 0, right: 0,
            width:      2, height: "100%",
            background: `linear-gradient(to bottom, transparent, ${GOLD}99, transparent)`,
          }}
        />
      </div>

      {/* ── Info section ── */}
      <div style={{ padding: "20px 24px 24px" }}>
        {/* Corner notch label */}
        <div style={{
          fontFamily:    "'Orbitron', monospace",
          fontSize:      9,
          letterSpacing: "0.28em",
          color:         `${GOLD}88`,
          textTransform: "uppercase",
          marginBottom:  10,
        }}>
          ◈ BOOKING DETAILS
        </div>

        <div style={{
          display:        "flex",
          flexWrap:       "wrap",
          alignItems:     "flex-start",
          justifyContent: "space-between",
          gap:            12,
        }}>
          {/* Left: name + status */}
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily:    "'Orbitron', monospace",
                fontSize:      "clamp(18px, 4vw, 26px)",
                fontWeight:    900,
                color:         GOLDHI,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin:        "0 0 10px",
                lineHeight:    1.1,
                textShadow:    `0 0 24px ${GOLD}55`,
              }}
            >
              {booking.game?.name}
            </motion.h2>
            <BookingStatusBadge status={booking.status} />
          </div>

          {/* Right: booking ID chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            style={{
              display:       "flex",
              flexDirection: "column",
              alignItems:    "flex-end",
              gap:           4,
            }}
          >
            <span style={{
              fontFamily:    "'Orbitron', monospace",
              fontSize:      8,
              letterSpacing: "0.22em",
              color:         `${SILVER}66`,
              textTransform: "uppercase",
            }}>Booking ID</span>
            <div style={{
              fontFamily:    "'Share Tech Mono', monospace",
              fontSize:      13,
              color:         GOLD,
              background:    `${GOLD}11`,
              border:        `1px solid ${GOLD}33`,
              padding:       "5px 12px",
              clipPath:      "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)",
              letterSpacing: "0.1em",
            }}>
              {booking.booking_id}
            </div>
          </motion.div>
        </div>

        {/* Bottom rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop:      16,
            height:         1,
            transformOrigin: "left",
            background:     `linear-gradient(to right, ${PURPLE}88, ${GOLD}55, transparent)`,
          }}
        />
      </div>
    </motion.div>
  );
}