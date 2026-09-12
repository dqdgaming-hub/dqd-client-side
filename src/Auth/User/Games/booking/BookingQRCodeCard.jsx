import { motion } from "framer-motion";

const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const PURPLE = "#7A2CFF";
const SILVER = "#B9C2D9";
const PANEL  = "#0D0A18";
const BORDER = "rgba(122,44,255,0.22)";

export default function BookingQRCodeCard({ booking }) {
  const valid = booking?.is_qr_valid;

  return (
    <div style={{
      background: PANEL,
      border:     `1px solid ${BORDER}`,
      clipPath:   "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
      padding:    "20px 20px 16px",
      height:     "100%",
      boxSizing:  "border-box",
      display:    "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          style={{ width: 3, height: 18, background: `linear-gradient(to bottom, ${PURPLE}, #00FFB2)` }}
        />
        <span style={{
          fontFamily:    "'Orbitron', monospace",
          fontSize:      10, fontWeight: 700,
          letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase",
        }}>QR Check-In</span>
      </div>

      {valid ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flex: 1, justifyContent: "center" }}>
          {/* QR frame */}
          <div style={{
            position:   "relative",
            padding:    6,
            background: `${PURPLE}11`,
            border:     `1px solid ${PURPLE}44`,
            clipPath:   "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          }}>
            <img
              src={booking.qr_code}
              alt="QR Code"
              style={{ display: "block", width: "100%", maxWidth: 110, height: "auto" }}
            />
            {/* Scan line */}
            <motion.div
              animate={{ top: ["10%", "90%", "10%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute", left: "5%", right: "5%",
                height:   2,
                background: `linear-gradient(to right, transparent, #00FFB2cc, transparent)`,
                boxShadow: "0 0 8px #00FFB2",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Token */}
          <div style={{ width: "100%", textAlign: "center" }}>
            <div style={{
              fontFamily:    "'Orbitron', monospace",
              fontSize:      8, letterSpacing: "0.22em",
              color:         `${SILVER}55`, textTransform: "uppercase",
              marginBottom:  4,
            }}>Token</div>
            <div style={{
              fontFamily:    "'Share Tech Mono', monospace",
              fontSize:      11, color: GOLDHI,
              background:    `${GOLD}11`,
              border:        `1px solid ${GOLD}33`,
              padding:       "5px 10px",
              wordBreak:     "break-all",
              letterSpacing: "0.08em",
            }}>
              {booking.qr_token}
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 12, padding: "16px 0",
          }}
        >
          {/* Lock icon */}
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              width: 48, height: 48,
              border: `1.5px solid ${PURPLE}55`,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `${PURPLE}11`,
              fontSize: 20,
            }}
          >🔒</motion.div>
          <p style={{
            fontFamily:    "'Rajdhani', 'Inter', sans-serif",
            fontSize:      11, color: `${SILVER}66`,
            textAlign:     "center", lineHeight: 1.6,
            letterSpacing: "0.04em",
            margin:        0,
          }}>
            QR available after<br/>admin approval
          </p>
        </motion.div>
      )}
    </div>
  );
}