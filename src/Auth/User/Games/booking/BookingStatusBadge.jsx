import { motion } from "framer-motion";

const STATUS_CONFIG = {
  pending:   { color: "#F4B942", glow: "#F4B94255", label: "PENDING",   icon: "⏳" },
  confirmed: { color: "#00FFB2", glow: "#00FFB255", label: "CONFIRMED", icon: "✦" },
  completed: { color: "#7A2CFF", glow: "#7A2CFF55", label: "COMPLETED", icon: "◆" },
  cancelled: { color: "#FF4D6D", glow: "#FF4D6D55", label: "CANCELLED", icon: "✕" },
};

export default function BookingStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display:       "inline-flex",
        alignItems:    "center",
        gap:           6,
        padding:       "5px 14px 5px 10px",
        background:    `${cfg.glow}`,
        border:        `1px solid ${cfg.color}55`,
        clipPath:      "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
        fontFamily:    "'Orbitron', monospace",
        fontSize:      10,
        fontWeight:    700,
        letterSpacing: "0.18em",
        color:         cfg.color,
        textTransform: "uppercase",
        position:      "relative",
        overflow:      "hidden",
      }}
    >
      {/* Pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 6, height: 6, borderRadius: "50%",
          background: cfg.color,
          boxShadow: `0 0 8px ${cfg.color}`,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </motion.span>
  );
}