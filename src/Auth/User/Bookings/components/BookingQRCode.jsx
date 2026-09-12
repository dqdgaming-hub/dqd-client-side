import { motion } from "framer-motion";

const BookingQRCode = ({ booking }) => {
  return (
    <div className="dqd-qr">
      <motion.div
        className="dqd-qr__frame"
        initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
      >
        <span className="dqd-qr__corner dqd-qr__corner--tl" />
        <span className="dqd-qr__corner dqd-qr__corner--tr" />
        <span className="dqd-qr__corner dqd-qr__corner--bl" />
        <span className="dqd-qr__corner dqd-qr__corner--br" />
        {booking.qr_code_url ? (
          <img src={booking.qr_code_url} alt={`${booking.booking_id} QR code`} />
        ) : (
          <div className="dqd-qr__placeholder">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.6" />
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.6" />
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.6" />
              <path d="M14 14H17V17H14V14Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M18 14H21V17" stroke="currentColor" strokeWidth="1.6" />
              <path d="M14 18H17V21" stroke="currentColor" strokeWidth="1.6" />
              <path d="M18 18H21V21H18" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
        )}
        <motion.span
          className="dqd-qr__scanline"
          animate={{ top: ["6%", "94%", "6%"] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="dqd-qr__sweep"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      <div className="dqd-qr__meta">
        <p>
          <span>Token</span>
          {booking.qr_token}
        </p>
        <p>
          <span>ID</span>
          {booking.booking_id}
        </p>
      </div>
    </div>
  );
};

export default BookingQRCode;