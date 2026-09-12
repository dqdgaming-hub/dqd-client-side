import { motion } from "framer-motion";
import { theme, fonts, chamfer } from "./theme";
import { CalendarIcon, ClockIcon, CoinIcon, TicketIcon } from "./Icons";
import StatusBadge from "./StatusBadge";
import VibraniumButton from "./VibraniumButton";

export default function BookingCard({ booking, onCancel, onViewTicket }) {
  const canCancel =
    onCancel &&
    !["cancelled", "attended", "rejected"].includes(booking.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={styles.card}
    >
      <div style={styles.imageBand}>
        <img src={booking.event_image} alt={booking.event_title} style={styles.image} />
        <div style={styles.imageOverlay} />
        <div style={styles.stripe} />
        <div style={styles.headerFloat}>
          <div>
            <h2 style={styles.title}>{booking.event_title}</h2>
            <div style={styles.bookingIdRow}>
              <TicketIcon size={12} color={theme.textDim} />
              <span>{booking.booking_id}</span>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* perforated divider between banner and info */}
      <div style={styles.perfLine}>
        <span style={styles.notch("left")} />
        <span style={styles.dashes} />
        <span style={styles.notch("right")} />
      </div>

      <div style={styles.body}>
        <div style={styles.infoGrid}>
          <Info icon={<CalendarIcon size={15} color={theme.teal} />} label="Date" value={booking.event_date} />
          <Info
            icon={<ClockIcon size={15} color={theme.teal} />}
            label="Time"
            value={`${booking.start_time} - ${booking.end_time}`}
          />
          <Info icon={<CoinIcon size={15} color={theme.gold} />} label="Amount" value={`INR ${booking.amount_paid}`} />
        </div>

        <div style={styles.buttons}>
          <VibraniumButton
            variant="primary"
            icon={<TicketIcon size={15} color="#fff" />}
            onClick={onViewTicket}
            fullWidth
          >
            View Ticket
          </VibraniumButton>

          {canCancel && (
            <VibraniumButton variant="danger" onClick={() => onCancel(booking.id)} fullWidth>
              Cancel Booking
            </VibraniumButton>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div style={styles.infoCard}>
      <span style={styles.infoIcon}>{icon}</span>
      <div>
        <div style={styles.infoLabel}>{label}</div>
        <div style={styles.infoValue}>{value}</div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: `linear-gradient(160deg, ${theme.panel}, ${theme.panelAlt})`,
    border: `1px solid ${theme.border}`,
    clipPath: chamfer.card,
    marginBottom: 26,
    boxShadow: "0 20px 50px -20px rgba(0,0,0,0.6)",
  },
  imageBand: { position: "relative", height: 210 },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  imageOverlay: {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(to top, ${theme.panel} 5%, rgba(12,10,20,0.35) 60%, rgba(12,10,20,0.15))`,
  },
  stripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.purple}, ${theme.teal}, ${theme.gold})`,
  },
  headerFloat: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "20px 22px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 20,
    color: theme.text,
    lineHeight: 1.25,
    textShadow: "0 2px 12px rgba(0,0,0,0.6)",
  },
  bookingIdRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    fontFamily: fonts.mono,
    fontSize: 11,
    color: theme.textDim,
    letterSpacing: "0.05em",
  },
  perfLine: {
    position: "relative",
    height: 1,
    background: theme.border,
    margin: "0 22px",
  },
  notch: (side) => ({
    position: "absolute",
    top: -8,
    [side]: -30,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: theme.void,
  }),
  dashes: { display: "none" },
  body: { padding: "22px 22px 24px" },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
    marginBottom: 22,
  },
  infoCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(122,44,255,0.05)",
    border: `1px solid ${theme.border}`,
    padding: "12px 14px",
    clipPath: chamfer.sm,
  },
  infoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    flexShrink: 0,
    background: "rgba(63,224,197,0.08)",
    clipPath: chamfer.sm,
  },
  infoLabel: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: "0.12em",
    color: theme.textFaint,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: 14,
    color: theme.text,
  },
  buttons: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
};