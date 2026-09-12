import { motion } from "framer-motion";
import { useState } from "react";
import { theme, fonts, chamfer } from "./theme";
import { CalendarIcon, ClockIcon, SeatIcon, TicketIcon } from "./Icons";
import VibraniumField from "./VibraniumField";
import VibraniumButton from "./VibraniumButton";
import EventDetailsModal from "./EventDetailsModal";

export default function EventCard({ event, index }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const lowSeats = event.available_slots <= 5;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 44 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -10 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={styles.card}
      >
        <div style={styles.imageWrapper}>
          <img src={event.image} alt="" style={styles.image} />
          <div style={styles.overlay} />

          {/* gl-matrix energy field, intensifies on hover */}
          <div style={styles.fieldLayer}>
            <VibraniumField active intensity={hovered ? 1 : 0.25} density={18} colorMode="full" />
          </div>

          <motion.div
            style={styles.price}
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.25 }}
          >
            INR {event.price}
          </motion.div>

          {lowSeats && (
            <div style={styles.urgentTag}>
              <SeatIcon size={11} color={theme.danger} />
              {event.available_slots} left
            </div>
          )}
        </div>

        <div style={styles.body}>
          <h2 style={styles.title}>{event.title}</h2>

          <p style={styles.desc}>
            {event.description.length > 110
              ? event.description.substring(0, 110) + "…"
              : event.description}
          </p>

          <div style={styles.metaRow}>
            <Meta icon={<CalendarIcon size={13} color={theme.teal} />} value={event.event_date} />
            <Meta icon={<ClockIcon size={13} color={theme.teal} />} value={`${event.start_time} - ${event.end_time}`} />
          </div>

          <VibraniumButton
            variant="primary"
            icon={<TicketIcon size={15} color="#fff" />}
            onClick={() => setOpen(true)}
            fullWidth
          >
            View Details
          </VibraniumButton>
        </div>
      </motion.div>

      {open && <EventDetailsModal event={event} close={() => setOpen(false)} />}
    </>
  );
}

function Meta({ icon, value }) {
  return (
    <div style={styles.metaItem}>
      {icon}
      <span>{value}</span>
    </div>
  );
}

const styles = {
  card: {
    position: "relative",
    background: `linear-gradient(160deg, ${theme.panel}, ${theme.panelAlt})`,
    border: `1px solid ${theme.border}`,
    clipPath: chamfer.card,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 50px -22px rgba(0,0,0,0.65)",
  },
  imageWrapper: { position: "relative", height: 200 },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(5,4,10,0.92), rgba(5,4,10,0.1) 60%)",
  },
  fieldLayer: { position: "absolute", inset: 0, mixBlendMode: "screen" },
  price: {
    position: "absolute",
    right: 14,
    top: 14,
    background: `linear-gradient(135deg, ${theme.purple}, #5A1FCC)`,
    color: "#fff",
    padding: "7px 14px",
    fontFamily: fonts.mono,
    fontWeight: 700,
    fontSize: 13,
    clipPath: chamfer.sm,
    boxShadow: `0 6px 18px -4px ${theme.purpleGlow}`,
  },
  urgentTag: {
    position: "absolute",
    left: 14,
    top: 14,
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "rgba(230,57,80,0.15)",
    border: `1px solid ${theme.danger}`,
    color: theme.danger,
    padding: "5px 10px",
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: "0.06em",
    clipPath: chamfer.sm,
  },
  body: { padding: "20px 20px 22px", display: "flex", flexDirection: "column", flex: 1 },
  title: {
    margin: "0 0 10px",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 18,
    color: theme.text,
    lineHeight: 1.3,
  },
  desc: {
    color: theme.textDim,
    fontSize: 13.5,
    lineHeight: 1.6,
    margin: "0 0 16px",
    flex: 1,
  },
  metaRow: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 18,
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: theme.textDim,
    fontFamily: fonts.body,
  },
};