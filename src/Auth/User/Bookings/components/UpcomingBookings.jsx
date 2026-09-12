import { motion } from "framer-motion";
import BookingCard from "./BookingCard";

const UpcomingBookings = ({ bookings, onView, onCancel }) => {
  return (
    <motion.section
      className="dqd-grid"
      aria-label="Upcoming bookings"
      initial="hidden"
      animate="visible"
    >
      {bookings.map((booking, index) => (
        <BookingCard
          key={`${booking.booking_kind}-${booking.id}`}
          booking={booking}
          onView={onView}
          onCancel={onCancel}
          index={index}
        />
      ))}
    </motion.section>
  );
};

export default UpcomingBookings;