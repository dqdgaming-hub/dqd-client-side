import { motion } from "framer-motion";
import BookingCard from "./BookingCard";

const BookingHistory = ({ bookings, onView }) => {
  return (
    <motion.section
      className="dqd-grid dqd-grid--history"
      aria-label="Booking history"
      initial="hidden"
      animate="visible"
    >
      {bookings.map((booking, index) => (
        <BookingCard
          key={`${booking.booking_kind}-${booking.id}`}
          booking={booking}
          onView={onView}
          index={index}
        />
      ))}
    </motion.section>
  );
};

export default BookingHistory;