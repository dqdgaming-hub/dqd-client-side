import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { getUserDashboard } from "../api/userapi";
import UserLayout from "./UserLayout";
import DashboardWelcome from "./DashboardComponents/DashboardWelcome";
import ExclusiveEventsCarousel from "./DashboardComponents/ExclusiveEventsCarousel";
import DashboardBookings from "./DashboardComponents/DashboardBookings";
import DashboardGames from "./DashboardComponents/DashboardGames";
import DashboardCombos from "./DashboardComponents/DashboardCombos";
import HappyHourCountdown from "./DashboardComponents/HappyHourCountdown";
import DashboardEvents from "./DashboardComponents/DashboardEvents";
import LoyaltyOverview from "./DashboardComponents/LoyaltyOverview";
import DashboardTicker from "./DashboardComponents/DashboardTicker";
import MapAndEnquiry from "./DashboardComponents/MapAndEnquiry";

var $ = {
    bg: "#0a0a0f",
    bgCard: "#0d0d1a",
    bgPanel: "#11111f",
    cyan: "#00f5ff",
    pink: "#ff006e",
    yellow: "#ffd60a",
    green: "#39ff14",
    purple: "#7b2fff",
    red: "#ff3b3b",
    text: "#e0e0ff",
    muted: "#6b6b8a",
    border: "rgba(0,245,255,0.15)",
  },
  Lr = 4e3,
  Rr = () => {
    if (document.getElementById("dqdash-styles")) return;
    let e = document.createElement("style");
    (e.id = "dqdash-styles"),
      (e.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    .dqdash {
      background: ${$.bg};
      color: ${$.text};
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
    }
    .dqdash ::-webkit-scrollbar { width: 6px; height: 6px; }
    .dqdash ::-webkit-scrollbar-track { background: ${$.bgCard}; }
    .dqdash ::-webkit-scrollbar-thumb { background: ${$.cyan}40; border-radius: 3px; }

    .dqdash-body { padding: 28px 24px 56px; max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }
    .dqdash-ticker-row { margin: 0 -24px; }
    @media (max-width: 600px) { .dqdash-body { padding: 20px 16px 40px; } .dqdash-ticker-row { margin: 0 -16px; } }

    .dqdash-grid-2 { display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px; align-items: stretch; }
    @media (max-width: 860px) { .dqdash-grid-2 { grid-template-columns: 1fr; } }


.dqdash-carousel-fullbleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  overflow: hidden;
}

.dqdash-carousel-fullbleed > * {
  width: 100%;
}


    /* ── Error state ── */
    .dqdash-error {
      min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; text-align: center; padding: 24px;
    }
    .dqdash-error-title {
      font-family: 'Orbitron', sans-serif; font-size: 1rem; font-weight: 700; color: ${$.pink}; letter-spacing: 2px; text-transform: uppercase;
    }
    .dqdash-error-msg { font-family: 'Share Tech Mono', monospace; font-size: 0.78rem; color: ${$.muted}; max-width: 420px; }
    .dqdash-retry-btn {
      padding: 10px 28px;
      background: linear-gradient(135deg, ${$.cyan}18, ${$.purple}30);
      border: 1px solid ${$.cyan}60; color: ${$.cyan};
      font-family: 'Orbitron', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      cursor: pointer; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
      transition: background 0.2s;
    }
    .dqdash-retry-btn:hover { background: ${$.cyan}30; }
  `),
      document.head.appendChild(e);
  },
  XZr = ({ size = 30, color = $.pink }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill={color} stroke="none" />
    </svg>
  );
// Each dashboard section slides up as it scrolls into view.
function Reveal({ className, children }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function UserDashboard() {
  let [e, t] = useState(null),
    [n, r] = useState(true),
    [i, a] = useState(null),
    o = useRef(null),
    s = useCallback(async () => {
      r(true), a(null);
      try {
        t(await getUserDashboard()), a(null);
      } catch (e) {
        let t = e?.response?.status;
        e?.response
          ? a({
              type: "app",
              message:
                t === 401
                  ? "Your session has expired. Please log in again."
                  : e?.response?.data?.message || e?.message || "Failed to load your dashboard.",
            })
          : a({
              type: "network",
              message: "Can't reach the server. Retrying…",
            });
      } finally {
        r(false);
      }
    }, []);
  return (
    useEffect(() => {
      Rr(), s();
    }, [s]),
    useEffect(() => {
      if (i?.type !== "network") {
        clearTimeout(o.current);
        return;
      }
      return (o.current = setTimeout(s, Lr)), () => clearTimeout(o.current);
    }, [i, s]),
    n || i?.type === "network" ? (
      <UserLayout isLoading />
    ) : i || !e ? (
      <UserLayout>
        <div className="dqdash">
          <div className="dqdash-error">
            <XZr />
            <div className="dqdash-error-title">Something went wrong</div>
            <div className="dqdash-error-msg">{i?.message || "Failed to load your dashboard."}</div>
            <button className="dqdash-retry-btn" onClick={s}>
              Retry
            </button>
          </div>
        </div>
      </UserLayout>
    ) : (
      <UserLayout>
        <div className="dqdash">
          <div className="dqdash-body" style={{ paddingTop: 0 }}>
            <DashboardWelcome user={e.user_details} stats={e.dashboard_stats} />
            <div className="dqdash-carousel-fullbleed">
              <ExclusiveEventsCarousel events={e.exclusive_events} bookings={e.event_bookings} games={e.games_list} />
            </div>
            <Reveal><DashboardBookings upcoming={e.upcoming_booking} recent={e.recent_bookings} /></Reveal>
            <Reveal><DashboardGames games={e.games_list} /></Reveal>
            <Reveal><DashboardCombos combos={e.combo_offers} /></Reveal>
            <Reveal className="dqdash-grid-2">
              <HappyHourCountdown />
              <LoyaltyOverview loyalty={e.loyalty_points} />
            </Reveal>
            <Reveal><DashboardEvents events={e.event_bookings} isLoading={false} error={null} /></Reveal>
          </div>
          <div className="dqdash-ticker-row">
            <DashboardTicker data={e} />
          </div>
          <div className="dqdash-body" style={{ paddingTop: 40 }}>
            <Reveal><MapAndEnquiry /></Reveal>
          </div>
        </div>
      </UserLayout>
    )
  );
}

//#endregion

export default UserDashboard;
