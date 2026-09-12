import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUpcomingEvents } from "../../api/userapi";
import EventCard from "./EventCard";
import UserLayout from "../../User/Userlayout";
import { theme, fonts } from "./theme";
import { TicketIcon } from "./Icons";

const LOADING_LINES = [
  "Summoning upcoming events…",
  "Dusting off the red carpet…",
  "Polishing the VIP passes…",
  "Waking up the spotlight…",
  "Counting the good seats…",
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 760 : false
  );
  const [loadingLine, setLoadingLine] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 760);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      setLoadingLine((n) => (n + 1) % LOADING_LINES.length);
    }, 1500);
    return () => clearInterval(id);
  }, [loading]);

  const loadEvents = async () => {
    try {
      const data = await getUpcomingEvents();
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el || events.length === 0) return;
    const slideWidth = el.scrollWidth / events.length;
    const idx = Math.round(el.scrollLeft / slideWidth);
    setActiveSlide(Math.min(idx, events.length - 1));
  };

  return (
    <UserLayout>
      <style>{keyframeStyles}</style>
      <div style={styles.page}>
        <br />
        <br />
        <br />
        <motion.div
          style={{ ...styles.orb, ...styles.orbA }}
          animate={{ x: [0, 24, 0], y: [0, -18, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{ ...styles.orb, ...styles.orbB }}
          animate={{ x: [0, -20, 0], y: [0, 16, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{ ...styles.orb, ...styles.orbC }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.headerBlock}
        >
          <div style={styles.headerTopRow}>
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
                CURATED FOR THE COURT
              </motion.div>
              <h2 style={styles.title}>
                <motion.span
                  style={{ display: "inline-flex" }}
                  animate={{ rotate: [0, -12, 10, -6, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                >
                  <TicketIcon color={theme.gold} size={24} />
                </motion.span>
                Exclusive Events
              </h2>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 22px rgba(15,233,201,0.35)" }}
              whileTap={{ scale: 0.94 }}
              onClick={() => navigate("/user/my-event-bookings")}
              style={styles.myBookingsBtn}
            >
              <TicketIcon color={theme.teal} size={15} />
              My Bookings
            </motion.button>
          </div>

          <p style={styles.subtitle}>
            Reserve your seat at experiences crafted for those who demand more.
          </p>
        </motion.div>

        {loading ? (
          <div style={styles.loadingWrap}>
            <AnimatePresence mode="wait">
              <motion.span
                key={loadingLine}
                style={styles.loadingText}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
              >
                {LOADING_LINES[loadingLine]}
              </motion.span>
            </AnimatePresence>
            <div style={styles.skeletonGrid}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  style={styles.skeletonCard}
                  className="shimmer"
                  animate={{ opacity: [0.35, 0.6, 0.35] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyState}>
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 6, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <TicketIcon color={theme.purpleGlow} size={48} />
            </motion.div>
            <p style={styles.emptyTitle}>No events scheduled right now</p>
            <p style={styles.emptySub}>Check back soon — new experiences are added regularly.</p>
          </motion.div>
        ) : isMobile ? (
          <div style={styles.mobileWrap}>
            <div style={styles.mobileScroller} ref={scrollerRef} onScroll={handleScroll}>
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  style={styles.mobileSlide}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <EventCard event={event} index={i} />
                </motion.div>
              ))}
            </div>
            <div style={styles.dotsRow}>
              {events.map((_, i) => (
                <motion.span
                  key={i}
                  style={styles.dot}
                  animate={{
                    scale: activeSlide === i ? 1.3 : 1,
                    background: activeSlide === i ? theme.teal : theme.border,
                  }}
                  transition={{ duration: 0.25 }}
                />
              ))}
            </div>
            <motion.p
              style={styles.swipeHint}
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              swipe to explore →
            </motion.p>
          </div>
        ) : (
          <div style={styles.grid}>
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.45, ease: "easeOut" }}
                whileHover={{ y: -6 }}
              >
                <EventCard event={event} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}

const keyframeStyles = `
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
    .events-header-row { flex-direction: column; align-items: flex-start; }
  }
`;

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    background: theme.void,
    padding: "clamp(20px, 5vw, 56px) clamp(16px, 5vw, 48px) 80px",
    overflow: "hidden",
    fontFamily: fonts.body,
  },
  orb: { position: "absolute", borderRadius: "50%", filter: "blur(110px)", pointerEvents: "none" },
  orbA: {
    width: 480,
    height: 480,
    top: -220,
    right: -180,
    background: "radial-gradient(circle, rgba(122,44,255,0.28), transparent 70%)",
  },
  orbB: {
    width: 380,
    height: 380,
    bottom: -180,
    left: -150,
    background: "radial-gradient(circle, rgba(15,233,201,0.16), transparent 70%)",
  },
  orbC: {
    width: 220,
    height: 220,
    top: "30%",
    left: "45%",
    background: "radial-gradient(circle, rgba(255,199,86,0.1), transparent 70%)",
  },
  headerBlock: { position: "relative", zIndex: 1, marginBottom: 32, maxWidth: 760 },
  headerTopRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
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
    fontFamily: fonts.display,
    fontWeight: 900,
    fontSize: "clamp(26px, 5vw, 40px)",
    color: theme.text,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 12,
    textShadow: "0 0 24px rgba(122,44,255,0.4)",
  },
  myBookingsBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(15,233,201,0.06)",
    border: `1px solid ${theme.teal}`,
    color: theme.teal,
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "0.02em",
    padding: "10px 16px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    clipPath: "polygon(0% 22%, 10% 0%, 100% 0%, 100% 78%, 90% 100%, 0% 100%)",
    flexShrink: 0,
    marginTop: 4,
  },
  subtitle: { fontSize: 14, color: theme.textDim, margin: "10px 0 0", lineHeight: 1.6 },
  loadingWrap: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: "40px 0",
  },
  loadingText: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: "0.08em", color: theme.textDim },
  skeletonGrid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
    marginTop: 10,
  },
  skeletonCard: {
    height: 280,
    background: `linear-gradient(155deg, ${theme.panel}, ${theme.panelAlt})`,
    border: `1px solid ${theme.border}`,
    position: "relative",
    overflow: "hidden",
  },
  emptyState: {
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
  emptyTitle: { fontFamily: fonts.display, fontWeight: 700, fontSize: 16, color: theme.text, margin: 0 },
  emptySub: { fontFamily: fonts.body, fontSize: 13, color: theme.textDim, margin: 0 },
  grid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 22,
  },
  mobileWrap: { position: "relative", zIndex: 1 },
  mobileScroller: {
    display: "flex",
    overflowX: "auto",
    gap: 16,
    paddingBottom: 8,
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
  },
  mobileSlide: {
    flex: "0 0 86%",
    scrollSnapAlign: "center",
  },
  dotsRow: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: theme.border,
    display: "inline-block",
  },
  swipeHint: {
    textAlign: "center",
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: "0.08em",
    color: theme.textDim,
    marginTop: 10,
  },
};