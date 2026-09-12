import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cancelComboBooking, getUpcomingComboBookings } from "../../api/userapi";
import ComboBookingCard from "./ComboBookingCard";

export default function UpcomingComboBookings({ onTicket, refreshKey = 0 }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setBookings(await getUpcomingComboBookings());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const cancel = async (booking) => {
    if (!window.confirm("Cancel this combo booking?")) return;
    await cancelComboBooking(booking.id);
    await load();
  };

  if (loading) return <PageLoader text="Syncing upcoming slots..." />;

  if (!bookings.length) {
    return <EmptyState title="No upcoming bookings" text="Your next combo night will show up here." />;
  }

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="ucbList">
      <style>{css}</style>
      {bookings.map((b) => (
        <ComboBookingCard key={b.booking_id} booking={b} onTicket={onTicket} onCancel={cancel} />
      ))}
    </motion.div>
  );
}

function PageLoader({ text }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ucbLoader">
      <style>{css}</style>
      <div className="ucbLoaderBar" />
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -9, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14 }}
          className="ucbDot"
        />
      ))}
      <span className="ucbLoaderText">{text}</span>
    </motion.div>
  );
}

function EmptyState({ title, text }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="ucbEmpty">
      <style>{css}</style>
      <motion.div
        className="ucbEmptyIcon"
        animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        ⬡
      </motion.div>
      <h3 className="ucbEmptyTitle">{title}</h3>
      <p className="ucbEmptyText">{text}</p>
    </motion.div>
  );
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const css = `
.ucbList { display: grid; gap: 14px; }

.ucbLoader {
  position: relative;
  overflow: hidden;
  min-height: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #a9c9bd;
  background: rgba(6,20,16,.5);
  border: 1px solid rgba(0,255,159,.16);
  clip-path: polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px);
}

.ucbLoaderBar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff9f, #00e5ff, transparent);
  animation: ucbSweep 1.6s linear infinite;
}

@keyframes ucbSweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.ucbDot { width: 9px; height: 9px; border-radius: 50%; background: #00ff9f; display: inline-block; }

.ucbLoaderText { font-family: 'Share Tech Mono', monospace; font-weight: 700; letter-spacing: .6px; }

.ucbEmpty {
  text-align: center;
  padding: 42px 18px;
  border: 1px solid rgba(0,255,159,.16);
  background: rgba(6,20,16,.4);
  color: #eafff5;
  clip-path: polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px);
}

.ucbEmptyIcon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin: 0 auto 12px;
  background: linear-gradient(135deg, #00ff9f, #00e5ff);
  color: #01110b;
  font-size: 22px;
  clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
}

.ucbEmptyTitle { margin: 0; font-family: 'Orbitron', sans-serif; font-size: 21px; }

.ucbEmptyText { margin: 8px 0 0; color: #8fb3a8; font-family: 'Share Tech Mono', monospace; font-size: 13px; }
`;