import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

const fallbackDashboard = {
  stats: {
    total_users: 0,
    total_bookings: 0,
    total_revenue: 0,
    active_games: 0,
    pending_bookings: 0,
    upcoming_events: 0,
  },
  recent_bookings: [],
  recent_users: [],
  recent_devices: [],
  low_stock_or_maintenance: [],
};

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const STATUS_MAP = {
  confirmed: { color: "rgba(0,255,225,0.12)", border: "rgba(0,255,225,0.35)", text: "#00ffe1" },
  active:    { color: "rgba(0,255,225,0.12)", border: "rgba(0,255,225,0.35)", text: "#00ffe1" },
  completed: { color: "rgba(245,255,0,0.08)", border: "rgba(245,255,0,0.3)",  text: "#f5ff00" },
  pending:   { color: "rgba(255,165,0,0.1)",  border: "rgba(255,165,0,0.35)", text: "#ffa500" },
  cancelled: { color: "rgba(255,0,110,0.1)",  border: "rgba(255,0,110,0.35)", text: "#ff006e" },
  blocked:   { color: "rgba(255,0,110,0.1)",  border: "rgba(255,0,110,0.35)", text: "#ff006e" },
  online: {
  color: "rgba(0,255,225,0.12)",
  border: "rgba(0,255,225,0.35)",
  text: "#00ffe1",
},
offline: {
  color: "rgba(224,248,255,0.06)",
  border: "rgba(224,248,255,0.2)",
  text: "#8ba4aa",
},
};

function StatusPill({ status }) {
  const s = STATUS_MAP[String(status || "pending").toLowerCase()] || STATUS_MAP.pending;
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      fontSize: "0.58rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      fontFamily: "'Share Tech Mono', monospace",
      background: s.color,
      border: `1px solid ${s.border}`,
      color: s.text,
      clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
    }}>
      {status || "pending"}
    </span>
  );
}

const statConfig = [
  { key: "total_users",      label: "Total Users",      accent: "#00ffe1", prefix: "",  icon: "U" },
  { key: "total_bookings",   label: "Total Bookings",   accent: "#f5ff00", prefix: "",  icon: "B" },
  { key: "total_revenue",    label: "Total Revenue",    accent: "#00ffe1", prefix: "₹", icon: "R", money: true },
  { key: "active_games",     label: "Active Games",     accent: "#f5ff00", prefix: "",  icon: "G" },
  { key: "pending_bookings", label: "Pending Bookings", accent: "#ffa500", prefix: "",  icon: "P" },
  { key: "upcoming_events",  label: "Upcoming Events",  accent: "#7b2fff", prefix: "",  icon: "E" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&display=swap');

  :root {
    --cp-void:   #05050f;
    --cp-cyan:   #00ffe1;
    --cp-pink:   #ff006e;
    --cp-yellow: #f5ff00;
    --cp-text:   #e0f8ff;
    --cp-muted:  rgba(224,248,255,0.28);
    --cp-panel:  rgba(8,8,24,0.85);
    --cp-border: rgba(0,255,225,0.1);
  }

  /* ── Fonts base ── */
  .adm-db * { box-sizing: border-box; margin: 0; padding: 0; }
  .adm-db { font-family: 'Share Tech Mono', monospace; color: var(--cp-text); }

  /* ── Hero ── */
  .adm-hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--cp-border);
    position: relative;
  }
  .adm-hero::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0;
    width: 120px; height: 1px;
    background: linear-gradient(90deg, var(--cp-cyan), transparent);
    box-shadow: 0 0 8px rgba(0,255,225,0.4);
  }
  .adm-kicker {
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(0,255,225,0.45);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .adm-kicker::before { content: '//'; color: rgba(0,255,225,0.25); }
  .adm-h1 {
    font-family: 'Orbitron', monospace;
    font-size: 1.8rem;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1.05;
    color: var(--cp-text);
    margin-bottom: 6px;
  }
  .adm-h1 span {
    color: var(--cp-cyan);
    text-shadow: 0 0 18px rgba(0,255,225,0.55);
  }
  .adm-hero-sub {
    font-size: 0.7rem;
    color: var(--cp-muted);
    letter-spacing: 0.04em;
  }
  .adm-hero-sub::before { content: '> '; color: rgba(0,255,225,0.25); }

  /* ── Primary button ── */
  .adm-btn-primary {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 22px;
    height: 42px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: 'Orbitron', monospace;
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #000;
    transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
    flex-shrink: 0;
  }
  .adm-btn-primary-bg {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--cp-cyan) 0%, #00c8b0 50%, var(--cp-yellow) 100%);
  }
  .adm-btn-primary-hover {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--cp-yellow) 0%, var(--cp-cyan) 100%);
    opacity: 0;
    transition: opacity 0.25s;
  }
  .adm-btn-primary:hover .adm-btn-primary-hover { opacity: 1; }
  .adm-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(0,255,225,0.35);
  }
  .adm-btn-primary:active { transform: scale(0.98); }
  .adm-btn-primary-inner {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 7px;
    font-weight: 700; color: #000;
  }

  /* ── Ghost button ── */
  .adm-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    height: 28px;
    background: transparent;
    border: 1px solid rgba(0,255,225,0.2);
    color: rgba(0,255,225,0.45);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%);
  }
  .adm-btn-ghost:hover {
    border-color: rgba(0,255,225,0.5);
    color: var(--cp-cyan);
    background: rgba(0,255,225,0.05);
    box-shadow: 0 0 12px rgba(0,255,225,0.1);
  }

  /* ── Alert ── */
  .adm-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    margin-bottom: 20px;
    background: rgba(255,0,110,0.07);
    border: 1px solid rgba(255,0,110,0.28);
    color: #ff6ea3;
    font-size: 0.72rem;
    font-family: 'Share Tech Mono', monospace;
    letter-spacing: 0.04em;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
    animation: alertIn 0.24s ease;
  }
  @keyframes alertIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform:none; } }

  /* ── Stats grid ── */
  .adm-stats {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    margin-bottom: 24px;
  }
  @media (max-width: 1100px) { .adm-stats { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 640px)  { .adm-stats { grid-template-columns: repeat(2, 1fr); } }

  .adm-stat {
    position: relative;
    padding: 16px 14px 14px;
    background: var(--cp-panel);
    border: 1px solid var(--cp-border);
    overflow: hidden;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
    transition: border-color 0.22s, box-shadow 0.22s;
    cursor: default;
  }
  .adm-stat:hover {
    border-color: rgba(0,255,225,0.28);
    box-shadow: 0 0 20px rgba(0,255,225,0.06) inset;
  }
  .adm-stat-glow {
    position: absolute;
    top: -20px; right: -20px;
    width: 70px; height: 70px;
    border-radius: 50%;
    filter: blur(28px);
    pointer-events: none;
    opacity: 0.35;
  }
  .adm-stat-label {
    font-size: 0.56rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--cp-muted);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .adm-stat-label::before { content: '//'; color: rgba(0,255,225,0.2); font-size: 0.48rem; }
  .adm-stat-val {
    font-family: 'Orbitron', monospace;
    font-size: 1.3rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.04em;
  }
  .adm-stat-loading {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    color: rgba(0,255,225,0.25);
    letter-spacing: 0.08em;
    animation: blink 1s steps(1) infinite;
  }
  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.2;} }

  /* Corner accent on stat card */
  .adm-stat::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 10px; height: 10px;
    border-top: 1px solid;
    border-right: 1px solid;
    opacity: 0.5;
  }

  /* ── Two-col grid ── */
  .adm-two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 14px;
  }
  @media (max-width: 860px) { .adm-two-col { grid-template-columns: 1fr; } }

  /* ── Panel ── */
  .adm-panel {
    background: var(--cp-panel);
    border: 1px solid var(--cp-border);
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
    position: relative;
    overflow: hidden;
    margin-bottom: 14px;
  }
  .adm-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, var(--cp-cyan), rgba(245,255,0,0.5), transparent);
    opacity: 0.35;
  }

  .adm-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(0,255,225,0.07);
  }
  .adm-panel-title {
    font-family: 'Orbitron', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--cp-text);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .adm-panel-title::before {
    content: '';
    display: inline-block;
    width: 3px; height: 12px;
    background: var(--cp-cyan);
    box-shadow: 0 0 6px var(--cp-cyan);
  }

  /* ── Table ── */
  .adm-table-wrap {
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0,255,225,0.2) transparent;
  }
  .adm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.72rem;
    font-family: 'Share Tech Mono', monospace;
  }
  .adm-table thead tr {
    border-bottom: 1px solid rgba(0,255,225,0.1);
  }
  .adm-table th {
    padding: 10px 14px;
    text-align: left;
    font-size: 0.56rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(0,255,225,0.35);
    font-weight: 400;
    white-space: nowrap;
  }
  .adm-table th::before { content: '# '; opacity: 0.4; }
  .adm-table td {
    padding: 10px 14px;
    color: rgba(224,248,255,0.65);
    border-bottom: 1px solid rgba(0,255,225,0.04);
    white-space: nowrap;
  }
  .adm-table tbody tr:last-child td { border-bottom: none; }
  .adm-table tbody tr:hover td {
    background: rgba(0,255,225,0.025);
    color: rgba(224,248,255,0.9);
  }
  .adm-table .adm-booking-id {
    color: rgba(0,255,225,0.6);
    font-size: 0.65rem;
    letter-spacing: 0.06em;
  }
  .adm-table .adm-amount {
    color: rgba(245,255,0,0.7);
    font-weight: 500;
  }
  .adm-empty {
    padding: 28px 14px;
    text-align: center;
    color: rgba(224,248,255,0.18);
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .adm-empty::before { content: '[ '; }
  .adm-empty::after  { content: ' ]'; }

  /* ── User list ── */
  .adm-user-list { padding: 0; }
  .adm-user-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 18px;
    border-bottom: 1px solid rgba(0,255,225,0.04);
    transition: background 0.18s;
  }
  .adm-user-row:last-child { border-bottom: none; }
  .adm-user-row:hover { background: rgba(0,255,225,0.025); }
  .adm-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(0,255,225,0.08);
    border: 1px solid rgba(0,255,225,0.2);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    font-family: 'Orbitron', monospace;
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--cp-cyan);
    text-shadow: 0 0 8px rgba(0,255,225,0.5);
  }
  .adm-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .adm-user-info { flex: 1; min-width: 0; }
  .adm-user-name {
    font-size: 0.72rem;
    color: rgba(224,248,255,0.8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }
  .adm-user-email {
    font-size: 0.6rem;
    color: rgba(224,248,255,0.3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 0.02em;
  }

  /* ── Attention grid ── */
  .adm-attention-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    padding: 14px 18px;
  }
  .adm-attention-card {
    padding: 14px;
    background: rgba(255,0,110,0.04);
    border: 1px solid rgba(255,0,110,0.18);
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
    transition: border-color 0.2s, background 0.2s;
  }
  .adm-attention-card:hover {
    background: rgba(255,0,110,0.07);
    border-color: rgba(255,0,110,0.35);
  }
  .adm-attention-name {
    font-family: 'Orbitron', monospace;
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: rgba(224,248,255,0.85);
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  .adm-attention-cat {
    font-size: 0.58rem;
    color: rgba(255,0,110,0.55);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .adm-attention-cat::before { content: '◆'; font-size: 0.4rem; }
  .adm-attention-reason {
    font-size: 0.65rem;
    color: rgba(224,248,255,0.35);
    line-height: 1.5;
  }
`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    const token = adminApi.getToken();
    const role  = adminApi.getRole();

    if (!token || role !== "admin") {
      navigate("/sign-in", { replace: true });
      return;
    }

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await adminApi.getDashboard();
        if (mounted && data) setDashboard({ ...fallbackDashboard, ...data, stats: {
      ...fallbackDashboard.stats,
      ...(data.stats || {}),
    },
    recent_bookings: data.recent_bookings || [],
    recent_users: data.recent_users || [],
    recent_devices: data.recent_devices || [],
    low_stock_or_maintenance:
      data.low_stock_or_maintenance || [], });
      } catch (err) {
        if (mounted) { setError(err.message || "Something went wrong."); }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [navigate]);

  const stats = dashboard.stats || fallbackDashboard.stats;

  return (
    <>
      <style>{css}</style>
      <div className="adm-db">
        <AdminLayout>

          {/* ── Hero ── */}
          <section className="adm-hero">
            <div>
              <p className="adm-kicker">Admin Dashboard</p>
              <h1 className="adm-h1">Control <span>Center</span></h1>
              <p className="adm-hero-sub">
                Monitor bookings, users, games, events, and revenue from one place.
              </p>
            </div>
            <button className="adm-btn-primary" type="button" onClick={() => navigate("/admin/bookings")}>
              <div className="adm-btn-primary-bg" />
              <div className="adm-btn-primary-hover" />
              <span className="adm-btn-primary-inner">▶ Manage Bookings</span>
            </button>
          </section>

          {error && (
            <div className="adm-alert">⚠ {error}</div>
          )}

          {/* ── Stats ── */}
          <section className="adm-stats" aria-label="Admin stats">
            {statConfig.map((s) => (
              <article
                key={s.key}
                className="adm-stat"
                style={{ "--accent": s.accent }}
              >
                <div
                  className="adm-stat-glow"
                  style={{ background: s.accent }}
                />
                {/* corner accent color */}
                <style>{`.adm-stat:nth-child(${statConfig.indexOf(s) + 1})::after { border-color: ${s.accent}; }`}</style>
                <p className="adm-stat-label">{s.label}</p>
                {loading ? (
                  <div className="adm-stat-loading">LOADING…</div>
                ) : (
                  <div className="adm-stat-val" style={{ color: s.accent, textShadow: `0 0 14px ${s.accent}55` }}>
                    {s.money ? formatMoney(stats[s.key]) : stats[s.key]}
                  </div>
                )}
              </article>
            ))}
          </section>

          {/* ── Two-col panels ── */}
          <div className="adm-two-col">

            {/* Recent Bookings */}
            <article className="adm-panel">
              <div className="adm-panel-head">
                <h2 className="adm-panel-title">Recent Bookings</h2>
                <button className="adm-btn-ghost" type="button" onClick={() => navigate("/admin/bookings")}>
                  View All →
                </button>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>User</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recent_bookings.length === 0 ? (
                      <tr>
                        <td colSpan="5">
                          <div className="adm-empty">
                            {loading ? "Loading bookings…" : "No recent bookings"}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      dashboard.recent_bookings.map((b) => (
                        <tr key={b.id || b.booking_id}>
                          <td className="adm-booking-id">{b.booking_id || "-"}</td>
                          <td>{b.user_name || b.user_email || "-"}</td>
                          <td>{formatDate(b.booking_date)}</td>
                          <td><StatusPill status={b.status} /></td>
                          <td className="adm-amount">{formatMoney(b.total_amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            {/* Recent Users */}
            <article className="adm-panel">
              <div className="adm-panel-head">
                <h2 className="adm-panel-title">Recent Users</h2>
                <button className="adm-btn-ghost" type="button" onClick={() => navigate("/admin/users")}>
                  View All →
                </button>
              </div>
              <div className="adm-user-list">
                {dashboard.recent_users.length === 0 ? (
                  <div className="adm-empty">
                    {loading ? "Loading users…" : "No recent users"}
                  </div>
                ) : (
                  dashboard.recent_users.map((u) => (
                    <div className="adm-user-row" key={u.id || u.email}>
                      <div className="adm-avatar">
                        {u.profile_image_url
                          ? <img src={u.profile_image_url} alt={u.full_name || u.email} />
                          : <span>{(u.full_name || u.email || "U").charAt(0).toUpperCase()}</span>
                        }
                      </div>
                      <div className="adm-user-info">
                        <div className="adm-user-name">{u.full_name || "User"}</div>
                        <div className="adm-user-email">{u.email}</div>
                      </div>
                      <StatusPill status={u.is_active ? "active" : "blocked"} />
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>


 {/* ── Needs Attention ── */}
          <section className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-panel-title">Needs Attention</h2>
              <button className="adm-btn-ghost" type="button" onClick={() => navigate("/admin/games")}>
                Review Games →
              </button>
            </div>
            <div className="adm-attention-grid">
              {dashboard.low_stock_or_maintenance.length === 0 ? (
                <div className="adm-empty" style={{ gridColumn: "1/-1" }}>
                  {loading ? "Checking games…" : "All systems nominal"}
                </div>
              ) : (
                dashboard.low_stock_or_maintenance.map((item) => (
                  <div className="adm-attention-card" key={item.id}>
                    <div className="adm-attention-name">{item.name}</div>
                    <div className="adm-attention-cat">{item.category_name || "Gaming Item"}</div>
                    <div className="adm-attention-reason">{item.reason || "Maintenance mode enabled."}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          
{/* Device Sessions */}
<section className="adm-panel">
  <div className="adm-panel-head">
    <h2 className="adm-panel-title">Recent Device Sessions</h2>

    <span className="adm-hero-sub">
      {
        dashboard.recent_devices.filter(
          (device) => device.is_online
        ).length
      }{" "}
      online
    </span>
  </div>

  <div className="adm-table-wrap">
    <table className="adm-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Device</th>
          <th>Browser</th>
          <th>Operating System</th>
          <th>IP Address</th>
          <th>Login Time</th>
          <th>Last Seen</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {dashboard.recent_devices.length === 0 ? (
          <tr>
            <td colSpan="8">
              <div className="adm-empty">
                {loading
                  ? "Loading device sessions…"
                  : "No device sessions"}
              </div>
            </td>
          </tr>
        ) : (
          dashboard.recent_devices.map((device, index) => (
            <tr
              key={
                device.id ||
                device.device_id ||
                `${device.user}-${device.ip_address}-${index}`
              }
            >
              <td>{device.user || "-"}</td>

              <td>
                <div>{device.device_name || "Unknown"}</div>

                {device.device_type && (
                  <div className="adm-user-email">
                    {device.device_type}
                  </div>
                )}
              </td>

              <td>{device.browser || "Unknown"}</td>

              <td>
                {device.operating_system || "Unknown"}
              </td>

              <td className="adm-booking-id">
                {device.ip_address || "-"}
              </td>

              <td>{formatDateTime(device.login_at)}</td>

              <td>{formatDateTime(device.last_seen)}</td>

              <td>
                <StatusPill
                  status={
                    device.is_online ? "online" : "offline"
                  }
                />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</section>
         

        </AdminLayout>
      </div>
    </>
  );
}
