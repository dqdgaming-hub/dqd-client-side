import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const CancelBookingModal = ({ booking, loading, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

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
          onClick={!loading ? onClose : undefined}
        >
          <motion.div
            className="dqd-modal__panel dqd-modal__panel--small"
            initial={{ opacity: 0, y: 40, scale: 0.92, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            style={{ transformPerspective: 900 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="dqd-modal__icon-warn"
              animate={{ rotate: [0, -8, 8, -8, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 16.5H12.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M10.3 3.8L2.4 18C1.9 18.9 2.6 20 3.6 20H20.4C21.4 20 22.1 18.9 21.6 18L13.7 3.8C13.2 2.9 11.8 2.9 10.3 3.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
            </motion.div>

            <h2>Cancel booking?</h2>
            <p>
              This will cancel ticket <strong>{booking?.booking_id}</strong>. Paid
              bookings may be marked for refund review.
            </p>

            <motion.textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={4}
              whileFocus={{ scale: 1.01 }}
            />

            <div className="dqd-modal__actions">
              <motion.button
                type="button"
                className="dqd-btn dqd-btn--ghost"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                disabled={loading}
              >
                Keep Booking
              </motion.button>
              <motion.button
                type="button"
                className="dqd-btn dqd-btn--danger"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                onClick={() => onConfirm(reason)}
              >
                {loading ? (
                  <motion.span
                    className="dqd-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
                {loading ? "Cancelling..." : "Cancel Booking"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CancelBookingModal;