import { motion } from "framer-motion";

const GOLD   = "#D4AF37";
const PURPLE = "#7A2CFF";
const SILVER = "#B9C2D9";
const PANEL  = "#0D0A18";
const BORDER = "rgba(122,44,255,0.22)";

export default function BookingNotesCard({ booking }) {
  const hasNotes = booking?.notes && booking.notes.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: PANEL,
        border:     `1px solid ${BORDER}`,
        clipPath:   "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        padding:    "18px 22px",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Subtle left glow */}
      <div style={{
        position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
        width: 60, height: "100%",
        background: `radial-gradient(circle at left, ${PURPLE}0E, transparent 70%)`,
        pointerEvents: "none",
      }}/>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity }}
          style={{ width: 3, height: 16, background: `linear-gradient(to bottom, ${PURPLE}, ${GOLD}88)` }}
        />
        <span style={{
          fontFamily:    "'Orbitron', monospace",
          fontSize:      10, fontWeight: 700,
          letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase",
        }}>Notes</span>
      </div>

      <p style={{
        fontFamily:    "'Rajdhani', 'Inter', sans-serif",
        fontSize:      13, lineHeight: 1.65,
        color:         hasNotes ? `${SILVER}cc` : `${SILVER}44`,
        letterSpacing: "0.03em",
        margin:        0,
        fontStyle:     hasNotes ? "normal" : "italic",
      }}>
        {hasNotes ? booking.notes : "No notes for this booking."}
      </p>
    </motion.div>
  );
}