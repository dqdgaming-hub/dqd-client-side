import { AnimatePresence, motion } from "framer-motion";
import BookingMembers from "./BookingMembers";
import BookingTicket from "./BookingTicket";

const BookingDetailsModal = ({ booking, onClose, onCancel }) => {
  return (
    <AnimatePresence>
      {booking && (
        <motion.div
          className="dqd-modal"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="dqd-modal__panel"
            initial={{ opacity: 0, y: 50, scale: 0.93, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{ transformPerspective: 1000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              type="button"
              className="dqd-modal__close"
              onClick={onClose}
              aria-label="Close"
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.button>

            <BookingTicket booking={booking} />
            <BookingMembers members={booking.members || []} />

            {booking.notes && (
              <motion.div
                className="dqd-modal__notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h3>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 4H19V18L15 22V4H5V20L9 16H19" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  Notes
                </h3>
                <p>{booking.notes}</p>
              </motion.div>
            )}

            {booking.can_cancel && (
              <motion.button
                type="button"
                className="dqd-btn dqd-btn--danger dqd-btn--block"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCancel(booking)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Cancel Booking
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingDetailsModal;