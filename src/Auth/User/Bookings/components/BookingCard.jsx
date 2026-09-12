import { motion } from "framer-motion";
import BookingTicket from "./BookingTicket";

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.94, rotate: -1.5 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { delay: Math.min(i * 0.07, 0.45), duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const BookingCard = ({ booking, onView, onCancel, index = 0 }) => {
  return (
    <motion.article
      className="dqd-card"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, rotate: -0.4, transition: { duration: 0.25 } }}
      layout
    >
      <motion.span
        className="dqd-card__spotlight"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        aria-hidden="true"
      />
      <BookingTicket booking={booking} compact />
      <div className="dqd-card__actions">
        <motion.button
          type="button"
          className="dqd-btn dqd-btn--ghost"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onView(booking)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M2 12C2 12 5.5 5.5 12 5.5C18.5 5.5 22 12 22 12C22 12 18.5 18.5 12 18.5C5.5 18.5 2 12 2 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
          </svg>
          View Details
        </motion.button>
        {booking.can_cancel && onCancel && (
          <motion.button
            type="button"
            className="dqd-btn dqd-btn--danger"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onCancel(booking)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Cancel
          </motion.button>
        )}
      </div>
    </motion.article>
  );
};

export default BookingCard;