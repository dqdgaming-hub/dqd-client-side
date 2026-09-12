import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import UserLayout from "../../User/Userlayout";
import {
  getUpcomingEventBookings,
  getPreviousEventBookings,
  cancelEventBooking,
} from "../../api/userapi";

import BookingCard from "./BookingCard";
import QRCodeModal from "./QRCodeModal";
import VibraniumButton from "./VibraniumButton";
import { theme, fonts, chamfer, fontImport } from "./theme";
import { TicketIcon, ArrowLeftIcon, CoinIcon, CalendarIcon, StarIcon } from "./Icons";

function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("upcoming");
  const [upcoming, setUpcoming] = useState([]);
  const [previous, setPrevious] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [up, prev] = await Promise.all([
        getUpcomingEventBookings(),
        getPreviousEventBookings(),
      ]);
      setUpcoming(up);
      setPrevious(prev);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelEventBooking(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Unable to cancel booking.");
    }
  };

  const bookings = tab === "upcoming" ? upcoming : previous;

  return (
    <UserLayout>
      <style>{fontImport + extraStyles}</style>
      <div style={styles.page}>
        <br />
        <br />
        <br />
        <motion.div
          style={{ ...styles.orb, ...styles.orbA }}
          animate={{ x: [0, 22, 0], y: [0, -16, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{ ...styles.orb, ...styles.orbB }}
          animate={{ x: [0, -18, 0], y: [0, 14, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.header}
          className="bookings-header"
        >
          <div>
            <motion.div
              style={styles.eyebrow}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <motion.span
                style={styles.eyebrowBar}
                animate={{ width: [22, 34, 22] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              YOUR RESERVATIONS
            </motion.div>
            <h1 style={styles.title}>
              <motion.span
                style={{ display: "inline-flex" }}
                animate={{ rotate: [0, -10, 8, -5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              >
                <TicketIcon size={28} color={theme.gold} />
              </motion.span>
              Booking Wallet
            </h1>
            <p style={styles.subtitle}>Every ticket you've claimed, stored in one vault.</p>
          </div>

          <div style={styles.actions}>
            <VibraniumButton
              variant="ghost"
              icon={<ArrowLeftIcon size={14} color={theme.teal} />}
              onClick={() => navigate("/user/events")}
            >
              Events
            </VibraniumButton>
          </div>
        </motion.div>

        {/* STATS */}
        <div style={styles.stats} className="bookings-stats">
          <StatCard icon={<CalendarIcon size={20} color={theme.teal} />} value={upcoming.length} label="Upcoming" accent={theme.teal} delay={0} />
          <StatCard icon={<TicketIcon size={20} color={theme.gold} />} value={previous.length} label="Previous" accent={theme.gold} delay={0.08} />
          <StatCard icon={<CoinIcon size={20} color={theme.purple} />} value={upcoming.length + previous.length} label="Total Tickets" accent={theme.purple} delay={0.16} />
        </div>

        {/* TABS */}
        <div style={styles.tabs}>
          <TabButton active={tab === "upcoming"} onClick={() => setTab("upcoming")} label="Upcoming" count={upcoming.length} />
          <TabButton active={tab === "previous"} onClick={() => setTab("previous")} label="Previous" count={previous.length} />
        </div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" style={styles.loadingWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  style={styles.skeleton}
                  className="shimmer"
                  animate={{ opacity: [0.35, 0.6, 0.35] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          ) : bookings.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.empty}>
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 6, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <TicketIcon size={44} color={theme.purpleGlow} />
              </motion.div>
              <p style={styles.emptyTitle}>No {tab} bookings</p>
              <p style={styles.emptySub}>
                {tab === "upcoming" ? "Reserve an event to see your ticket here." : "Attended events will appear here."}
              </p>
              {tab === "upcoming" && (
                <VibraniumButton variant="primary" onClick={() => navigate("/user/events")} style={{ marginTop: 6 }}>
                  Browse Events
                </VibraniumButton>
              )}
            </motion.div>
          ) : (
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.grid} className="bookings-grid">
              {bookings.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -5 }}
                  onDoubleClick={() => setSelectedBooking(booking)}
                >
                  <BookingCard
                    booking={booking}
                    onCancel={tab === "upcoming" ? cancelBooking : undefined}
                    onViewTicket={() => setSelectedBooking(booking)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <QRCodeModal booking={selectedBooking} close={() => setSelectedBooking(null)} />
    </UserLayout>
  );
}

function StatCard({ icon, value, label, accent, delay }) {
  const count = useCountUp(value, 900);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -5, boxShadow: `0 10px 30px ${accent}22` }}
      style={{ ...styles.statCard, borderColor: `${accent}33` }}
    >
      <motion.div
        style={{ ...styles.statIcon, background: `${accent}14` }}
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <div>
        <h2 style={{ ...styles.statValue, color: theme.text }}>{count}</h2>
        <span style={styles.statLabel}>{label}</span>
      </div>
    </motion.div>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <motion.button
      onClick={onClick}
      style={{ ...styles.tab, ...(active ? styles.activeTab : {}) }}
      whileTap={{ scale: 0.95 }}
    >
      {active && (
        <motion.div layoutId="tabHighlight" style={styles.tabHighlight} transition={{ type: "spring", stiffness: 350, damping: 30 }} />
      )}
      <span style={styles.tabContent}>
        {label}
        <motion.span
          key={count}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
          style={styles.tabCount(active)}
        >
          {count}
        </motion.span>
      </span>
    </motion.button>
  );
}

const extraStyles = `
  @keyframes shimmerSweep {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .shimmer {
    background-image: linear-gradient(
      100deg,
      rgba(255,255,255,0) 30%,
      rgba(255,255,255,0.06) 50%,
      rgba(255,255,255,0) 70%
    );
    background-size: 400px 100%;
    animation: shimmerSweep 1.8s infinite;
  }
  @media (max-width: 640px) {
    .bookings-header { flex-direction: column; align-items: flex-start; }
    .bookings-stats { grid-template-columns: 1fr !important; }
    .bookings-grid { grid-template-columns: 1fr !important; }
  }
`;

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    background: theme.void,
    padding: "clamp(20px, 5vw, 48px) clamp(16px, 5vw, 44px) 80px",
    overflow: "hidden",
    fontFamily: fonts.body,
  },
  orb: { position: "absolute", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" },
  orbA: { width: 460, height: 460, top: -200, right: -160, background: "radial-gradient(circle, rgba(122,44,255,0.25), transparent 70%)" },
  orbB: { width: 380, height: 380, bottom: -160, left: -140, background: "radial-gradient(circle, rgba(63,224,197,0.14), transparent 70%)" },
  header: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 34,
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: "0.18em",
    color: theme.teal,
    marginBottom: 10,
  },
  eyebrowBar: { width: 22, height: 2, background: theme.teal, display: "inline-block" },
  title: {
    margin: 0,
    fontFamily: fonts.display,
    fontWeight: 900,
    fontSize: "clamp(26px, 5vw, 38px)",
    color: theme.text,
    display: "flex",
    alignItems: "center",
    gap: 12,
    textShadow: "0 0 24px rgba(122,44,255,0.4)",
  },
  subtitle: { color: theme.textDim, marginTop: 8, fontSize: 14 },
  actions: { display: "flex", gap: 12, flexWrap: "wrap" },
  stats: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 30,
  },
  statCard: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: `linear-gradient(160deg, ${theme.panel}, ${theme.panelAlt})`,
    border: "1px solid",
    padding: "20px 22px",
    clipPath: chamfer.md,
  },
  statIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    clipPath: chamfer.sm,
  },
  statValue: { margin: 0, fontFamily: fonts.display, fontSize: 26, fontWeight: 700 },
  statLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.08em", color: theme.textDim },
  tabs: { position: "relative", zIndex: 1, display: "flex", gap: 10, marginBottom: 26, flexWrap: "wrap" },
  tab: {
    position: "relative",
    padding: "12px 22px",
    border: `1px solid ${theme.border}`,
    background: "transparent",
    color: theme.textDim,
    cursor: "pointer",
    clipPath: chamfer.sm,
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: 14,
    overflow: "hidden",
  },
  activeTab: { color: "#fff", border: `1px solid transparent` },
  tabHighlight: {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(135deg, ${theme.purple}, #5A1FCC)`,
    zIndex: 0,
  },
  tabContent: { position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 },
  tabCount: (active) => ({
    fontFamily: fonts.mono,
    fontSize: 11,
    padding: "1px 7px",
    background: active ? "rgba(255,255,255,0.2)" : "rgba(122,44,255,0.12)",
    color: active ? "#fff" : theme.textDim,
    display: "inline-block",
  }),
  loadingWrap: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 20 },
  skeleton: { height: 340, background: `linear-gradient(155deg, ${theme.panel}, ${theme.panelAlt})`, border: `1px solid ${theme.border}`, position: "relative", overflow: "hidden" },
  grid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 24,
    alignItems: "start",
  },
  empty: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "70px 20px",
    border: `1px dashed ${theme.border}`,
    gap: 10,
  },
  emptyTitle: { fontFamily: fonts.display, fontWeight: 700, fontSize: 17, color: theme.text, margin: 0, textTransform: "capitalize" },
  emptySub: { fontSize: 13, color: theme.textDim, margin: 0 },
};