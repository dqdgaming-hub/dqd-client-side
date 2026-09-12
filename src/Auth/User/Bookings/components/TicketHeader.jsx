import { motion } from "framer-motion";

const KIND_CONFIG = {
  booking: {
    label: "Game Booking",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="8" cy="12.5" r="1.6" fill="currentColor" />
        <circle cx="16" cy="12.5" r="1.6" fill="currentColor" />
        <path d="M3 10H21" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  combo: {
    label: "Combo Booking",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 12L21 7M12 12V22M12 12L3 7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  event: {
    label: "Event Booking",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L14.5 8.5L21.5 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.5 9.3L9.5 8.5L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
};

const TicketHeader = ({ booking }) => {
  const cfg = KIND_CONFIG[booking.booking_kind] || { label: "Booking", icon: null };

  return (
    <div className="dqd-ticket-header">
      <span className="dqd-ticket-header__bulbs" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.i
            key={i}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
          />
        ))}
      </span>
      <span className="dqd-ticket-header__kind">
        {cfg.icon}
        {cfg.label}
      </span>
      <motion.strong
        className="dqd-ticket-header__id"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {booking.booking_id}
      </motion.strong>
    </div>
  );
};

export default TicketHeader;