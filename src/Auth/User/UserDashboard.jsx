import { useState, useEffect, useCallback, useRef } from "react";
import UserLayout from "./UserLayout";
import { getUserDashboard, postUserSpin } from "../api/userapi";

import DashboardWelcome from "./DashboardComponents/DashboardWelcome";
import ExclusiveEventsCarousel from "./DashboardComponents/ExclusiveEventsCarousel";
import DashboardBookings from "./DashboardComponents/DashboardBookings";
import DashboardGames from "./DashboardComponents/DashboardGames";
import DashboardCombos from "./DashboardComponents/DashboardCombos";

import DashboardSpinner from "./DashboardComponents/DashboardSpinner";
import HappyHourCountdown from "./DashboardComponents/HappyHourCountdown";

import DashboardEvents from "./DashboardComponents/DashboardEvents";
import LoyaltyOverview from "./DashboardComponents/LoyaltyOverview";
import DashboardTicker from "./DashboardComponents/DashboardTicker";
import MapAndEnquiry from "./DashboardComponents/MapAndEnquiry";

// ── Design tokens (DQD cyberpunk system) ──────────────────────────────────────
const T = {
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
};

// Retry cadence for network-level failures (server unreachable) — auto-retry
// quietly in the background while the PageLoader / game keeps the user busy.
const NETWORK_RETRY_MS = 4000;

const injectStyles = () => {
  if (document.getElementById("dqdash-styles")) return;
  const s = document.createElement("style");
  s.id = "dqdash-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    .dqdash {
      background: ${T.bg};
      color: ${T.text};
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
    }
    .dqdash ::-webkit-scrollbar { width: 6px; height: 6px; }
    .dqdash ::-webkit-scrollbar-track { background: ${T.bgCard}; }
    .dqdash ::-webkit-scrollbar-thumb { background: ${T.cyan}40; border-radius: 3px; }

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
      font-family: 'Orbitron', sans-serif; font-size: 1rem; font-weight: 700; color: ${T.pink}; letter-spacing: 2px; text-transform: uppercase;
    }
    .dqdash-error-msg { font-family: 'Share Tech Mono', monospace; font-size: 0.78rem; color: ${T.muted}; max-width: 420px; }
    .dqdash-retry-btn {
      padding: 10px 28px;
      background: linear-gradient(135deg, ${T.cyan}18, ${T.purple}30);
      border: 1px solid ${T.cyan}60; color: ${T.cyan};
      font-family: 'Orbitron', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      cursor: pointer; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
      transition: background 0.2s;
    }
    .dqdash-retry-btn:hover { background: ${T.cyan}30; }
  `;
  document.head.appendChild(s);
};

const IconAlertTriangle = ({ size = 30, color = T.pink }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="0.6" fill={color} stroke="none" />
  </svg>
);

export default function UserDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // error is either null, or { type: "network" | "app", message }
  //  - "network": request never reached a server (offline, backend down,
  //    ERR_CONNECTION_REFUSED, timeout). Treated like a loading state —
  //    the PageLoader/game stays up and we quietly retry in the background.
  //  - "app": the server responded but with a failure (401, 500, validation).
  //    Shown as a real error card since retrying alone won't fix it.
  const [error, setError] = useState(null);

  const retryTimer = useRef(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserDashboard();
      setData(res);
      setError(null);
    } catch (err) {
      const status = err?.response?.status;

      if (!err?.response) {
        // No response at all: network/connection failure, not an app error.
        setError({ type: "network", message: "Can't reach the server. Retrying…" });
      } else {
        const message =
          status === 401
            ? "Your session has expired. Please log in again."
            : err?.response?.data?.message || err?.message || "Failed to load your dashboard.";
        setError({ type: "app", message });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    injectStyles();
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto-retry quietly while the failure is network-level. Stops as soon as
  // the error clears (success) or changes to an app-level error.
  useEffect(() => {
    if (error?.type !== "network") {
      clearTimeout(retryTimer.current);
      return;
    }
    retryTimer.current = setTimeout(fetchDashboard, NETWORK_RETRY_MS);
    return () => clearTimeout(retryTimer.current);
  }, [error, fetchDashboard]);

  if (loading) {
    return <UserLayout isLoading />;
  }

  // Server unreachable — keep the arena shell + PageLoader (with its game)
  // up instead of a dead-end error screen. We're retrying automatically.
  if (error?.type === "network") {
    return <UserLayout isLoading />;
  }

  if (error || !data) {
    return (
      <UserLayout>
        <div className="dqdash">
          <div className="dqdash-error">
            <IconAlertTriangle />
            <div className="dqdash-error-title">Something went wrong</div>
            <div className="dqdash-error-msg">{error?.message || "Failed to load your dashboard."}</div>
            <button className="dqdash-retry-btn" onClick={fetchDashboard}>
              Retry
            </button>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="dqdash">
        <div className="dqdash-body" style={{ paddingTop: 0 }}>
          <DashboardWelcome user={data.user_details} stats={data.dashboard_stats} />
          <div className="dqdash-carousel-fullbleed" >
  <ExclusiveEventsCarousel events={data.exclusive_events} />
</div>

          <DashboardBookings upcoming={data.upcoming_booking} recent={data.recent_bookings} />

          <DashboardGames games={data.games_list} />

          <DashboardCombos combos={data.combo_offers} />

          <div className="dqdash-grid-2">
            <HappyHourCountdown />
            <LoyaltyOverview loyalty={data.loyalty_points} />
          </div>

          <DashboardEvents events={data.event_bookings} isLoading={false} error={null} />
        </div>

        <div className="dqdash-ticker-row">
          <DashboardTicker data={data} />
        </div>

        <div className="dqdash-body" style={{ paddingTop: 40 }}>
          <MapAndEnquiry />
        </div>
      </div>
    </UserLayout>
  );
}