import { motion } from "framer-motion";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#D4AF37" },
  confirmed: { label: "Confirmed", color: "#3FE0C5" },
  approved: { label: "Approved", color: "#3FE0C5" },
  completed: { label: "Completed", color: "#7A2CFF" },
  attended: { label: "Attended", color: "#7A2CFF" },
  cancelled: { label: "Cancelled", color: "#FF4D6D" },
  rejected: { label: "Rejected", color: "#FF4D6D" },
};

const StatusIcon = ({ status, color }) => {
  if (status === "cancelled" || status === "rejected") {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <path d="M6 6L18 18M18 6L6 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === "completed" || status === "attended") {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <path d="M5 12L10 17L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "pending") {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
        <path d="M12 7V12L15 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" fill={color} />
    </svg>
  );
};

const BookingStatus = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#B9C2D9" };
  const isLive = status === "confirmed" || status === "approved";

  return (
    <motion.span
      initial={{ opacity: 0, x: -10, skewX: -6 }}
      animate={{ opacity: 1, x: 0, skewX: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="dqd-status"
      style={{ "--status-color": cfg.color }}
    >
      {isLive && (
        <motion.span
          className="dqd-status__pulse"
          animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <StatusIcon status={status} color={cfg.color} />
      {cfg.label}
    </motion.span>
  );
};

export default BookingStatus;