import { motion } from "framer-motion";

const PAYMENT_CONFIG = {
  paid: { label: "Paid", color: "#3FE0C5" },
  pending: { label: "Payment pending", color: "#D4AF37" },
  failed: { label: "Payment failed", color: "#FF4D6D" },
  refunded: { label: "Refunded", color: "#7A2CFF" },
};

const PaymentBadge = ({ status }) => {
  const cfg = PAYMENT_CONFIG[status] || { label: status, color: "#B9C2D9" };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="dqd-chip dqd-chip--payment"
      style={{ "--chip-color": cfg.color }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="20" height="14" rx="2" stroke={cfg.color} strokeWidth="2" />
        <path d="M2 10H22" stroke={cfg.color} strokeWidth="2" />
        <path d="M6 15H10" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" />
      </svg>
      {cfg.label}
    </motion.span>
  );
};

export default PaymentBadge;