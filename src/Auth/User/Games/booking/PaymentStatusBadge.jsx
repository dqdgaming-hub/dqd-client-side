import { motion } from "framer-motion";

const PAY_CONFIG = {
  paid:    { color: "#00FFB2", label: "PAID",    icon: "✦" },
  pending: { color: "#F4B942", label: "PENDING", icon: "⏳" },
  failed:  { color: "#FF4D6D", label: "FAILED",  icon: "✕" },
  refunded:{ color: "#B9C2D9", label: "REFUNDED",icon: "↩" },
};

export default function PaymentStatusBadge({ status }) {
  const cfg = PAY_CONFIG[status] || PAY_CONFIG.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            8,
        marginBottom:   14,
        padding:        "8px 14px",
        background:     `${cfg.color}11`,
        border:         `1px solid ${cfg.color}44`,
        clipPath:       "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }}
      />
      <span style={{
        fontFamily:    "'Orbitron', monospace",
        fontSize:      9,
        fontWeight:    700,
        letterSpacing: "0.2em",
        color:         cfg.color,
        textTransform: "uppercase",
      }}>Payment {cfg.label}</span>
    </motion.div>
  );
}