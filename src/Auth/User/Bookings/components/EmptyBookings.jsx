import { motion } from "framer-motion";

const EmptyBookings = ({ type }) => {
  return (
    <motion.section
      className="dqd-empty"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className="dqd-empty__beam"
        initial={{ opacity: 0, scaleX: 0.6 }}
        animate={{ opacity: [0, 0.5, 0.35], scaleX: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        aria-hidden="true"
      />
      <motion.div
        className="dqd-empty__icon"
        animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L14.5 8.5L21.5 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.5 9.3L9.5 8.5L12 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </motion.div>
      <h2>{type === "upcoming" ? "No upcoming tickets" : "No booking history"}</h2>
      <p>
        {type === "upcoming"
          ? "Your confirmed games, combos, and events will appear here."
          : "Completed and cancelled bookings will show up here."}
      </p>
    </motion.section>
  );
};

export default EmptyBookings;