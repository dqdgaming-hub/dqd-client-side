import { motion } from "framer-motion";
import BookingQRCode from "./BookingQRCode";
import BookingStatus from "./BookingStatus";
import TicketCountdown from "./TicketCountdown";
import TicketHeader from "./TicketHeader";
import PaymentBadge from "./PaymentBadge";
import LoyaltyBadge from "./LoyaltyBadge";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const formatDay = (value) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(new Date(value));

const formatTime = (value) => (value ? value.slice(0, 5) : "");

const DETAIL_ICONS = {
  date: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9.5H21M8 3V6M16 3V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  time: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12L15 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  people: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 20C3 16.5 5.5 14.5 9 14.5C12.5 14.5 15 16.5 15 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 8.5C16.6 8.2 17.5 7.2 17.5 6C17.5 4.6 16.4 3.5 15 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16.5 14.7C18.8 15.2 20.5 16.8 20.5 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  amount: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8.5H14C15.1 8.5 16 9.3 16 10.3C16 11.3 15.1 12 14 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 12H14.5C15.6 12 16.5 12.8 16.5 13.8C16.5 14.8 15.6 15.5 14.5 15.5H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 6.5V17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

/* Deterministic pseudo-barcode bars derived from the booking id, so it
   looks like a real ticket barcode but never changes on re-render */
const Barcode = ({ seed = "" }) => {
  const bars = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  }
  for (let i = 0; i < 28; i++) {
    hash = (hash * 1103515245 + 12345) % 2147483648;
    bars.push(1 + (hash % 4));
  }
  return (
    <svg className="dqd-barcode" viewBox="0 0 220 30" preserveAspectRatio="none" aria-hidden="true">
      {bars.map((w, i) => {
        const x = bars.slice(0, i).reduce((a, b) => a + b + 2, 0);
        return <rect key={i} x={x} y="0" width={w} height="30" fill="currentColor" />;
      })}
    </svg>
  );
};

const BookingTicket = ({ booking, compact = false }) => {
  return (
    <motion.div
      className={`dqd-ticket ${compact ? "dqd-ticket--compact" : ""}`}
      initial={{ opacity: 0, rotateX: -8, y: 10 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformPerspective: 900 }}
    >
      <span className="dqd-ticket__notch dqd-ticket__notch--top" />
      <span className="dqd-ticket__notch dqd-ticket__notch--bottom" />

      <TicketHeader booking={booking} />

      <div className="dqd-ticket__body">
        <div className="dqd-ticket__details">
          <BookingStatus status={booking.status} />
          <h2>{booking.title}</h2>

          <dl className="dqd-ticket__grid">
            <div>
              <dt>{DETAIL_ICONS.date}Date</dt>
              <dd>
                {formatDay(booking.booking_date)}, {formatDate(booking.booking_date)}
              </dd>
            </div>
            <div>
              <dt>{DETAIL_ICONS.time}Time</dt>
              <dd>
                {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
              </dd>
            </div>
            <div>
              <dt>{DETAIL_ICONS.people}People</dt>
              <dd>{booking.total_people}</dd>
            </div>
            <div>
              <dt>{DETAIL_ICONS.amount}Amount</dt>
              <dd>INR {booking.price_paid || booking.total_amount}</dd>
            </div>
          </dl>

          <div className="dqd-ticket__badges">
            <PaymentBadge status={booking.payment_status} />
            {!!booking.loyalty_points_earned && (
              <LoyaltyBadge points={booking.loyalty_points_earned} />
            )}
          </div>

          {booking.can_cancel && <TicketCountdown startsAt={booking.starts_at} />}
        </div>

        <div className="dqd-ticket__tear" aria-hidden="true">
          <span className="dqd-ticket__tear-line" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="dqd-ticket__tear-icon">
            <path d="M12 2V22M12 2L9 5M12 2L15 5M12 22L9 19M12 22L15 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          </svg>
        </div>

        <div className="dqd-ticket__stub">
          <BookingQRCode booking={booking} />
          <p className="dqd-ticket__admit">ADMIT ONE</p>
        </div>
      </div>

      <div className="dqd-ticket__footer">
        <Barcode seed={booking.booking_id || booking.qr_token || ""} />
        <span className="dqd-ticket__footer-id">{booking.booking_id}</span>
      </div>
    </motion.div>
  );
};

export default BookingTicket;