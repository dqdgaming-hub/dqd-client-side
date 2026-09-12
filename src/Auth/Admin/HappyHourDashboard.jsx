import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

// ─── Neon tokens ─────────────────────────────────────────────────────────────
const C = {
  cyan:   "#00f5ff",
  pink:   "#ff2d78",
  yellow: "#ffe600",
  green:  "#00ff88",
  bg:     "#0a0a0f",
  card:   "#0d0d1a",
  border: "#1a1a3e",
};

// ─── SVG icon set ─────────────────────────────────────────────────────────────
const Icon = ({ name, size = 22, color = "currentColor" }) => {
  const paths = {
    clock: (
      <g fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <polyline points="12 7 12 12 15.5 14.5"/>
      </g>
    ),
    target: (
      <g fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/>
        <circle cx="12" cy="12" r="5"/>
        <circle cx="12" cy="12" r="1" fill={color}/>
      </g>
    ),
    gift: (
      <g fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="13" rx="1"/>
        <line x1="12" y1="8" x2="12" y2="21"/>
        <path d="M12 8H7.5a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8z"/>
        <path d="M12 8h4.5a2.5 2.5 0 0 0 0-5C14 3 12 8 12 8z"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
      </g>
    ),
    spinner: (
      <g fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/>
        <line x1="12" y1="3" x2="12" y2="12"/>
        <line x1="12" y1="12" x2="18.5" y2="15.5"/>
        <line x1="12" y1="12" x2="5.5" y2="15.5"/>
        <circle cx="12" cy="12" r="1.5" fill={color}/>
      </g>
    ),
    check: (
      <g fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4"/>
        <circle cx="12" cy="12" r="9"/>
      </g>
    ),
    list: (
      <g fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="1.5"/>
        <line x1="3" y1="8" x2="21" y2="8"/>
        <line x1="3" y1="13" x2="21" y2="13"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
        <line x1="9" y1="8" x2="9" y2="21"/>
      </g>
    ),
    arrow: (
      <g fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="13 6 19 12 13 18"/>
      </g>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      {paths[name]}
    </svg>
  );
};

// ─── Nav card definitions ─────────────────────────────────────────────────────
const CARDS = [
  { title: "Happy Hour Slots",  path: "/admin/happy-hour-slots",    icon: "clock",   accent: C.cyan,   desc: "Manage time windows" },
  { title: "Spinner Rewards",   path: "/admin/spinner-rewards",      icon: "target",  accent: C.pink,   desc: "View reward pool"    },
  { title: "Spinner Spins",     path: "/admin/spinner-spins",        icon: "spinner", accent: C.pink,   desc: "Spin history log"    },
  { title: "Verify Happy Hour", path: "/admin/verify-happy-hour",    icon: "check",   accent: C.green,  desc: "Validate sessions"   },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  .hh-wrap {
    font-family: 'Share Tech Mono', monospace;
    min-height: 100vh;
    padding: 2rem 2rem 3rem;
    box-sizing: border-box;
  }

  /* masthead */
  .hh-eyebrow {
    font-size: 0.63rem; letter-spacing: 0.28em; color: #2a2a48;
    text-transform: uppercase; margin: 0 0 0.4rem;
    display: flex; align-items: center; gap: 0.6rem;
  }
  .hh-eyebrow::before {
    content: ''; display: inline-block;
    width: 20px; height: 1px; background: #2a2a48;
  }
  .hh-title {
    font-family: 'Orbitron', sans-serif; font-weight: 900;
    font-size: clamp(1.4rem, 3vw, 2rem);
    color: #00f5ff; letter-spacing: 0.1em; text-transform: uppercase;
    margin: 0 0 2rem;
    text-shadow: 0 0 24px #00f5ff55, 0 0 48px #00f5ff22;
  }

  /* nav grid */
  .hh-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
    gap: 1rem;
    margin-bottom: 2.75rem;
  }

  .hh-card {
    position: relative; display: flex; flex-direction: column;
    background: #0d0d1a; border: 1px solid; text-decoration: none;
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
    padding: 1.2rem 1.2rem 1rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;
  }
  .hh-card::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 1px; background: currentColor; opacity: 0.45;
  }
  .hh-card:hover { transform: translateY(-3px); text-decoration: none; }
  .hh-card:hover .hh-card-arrow { opacity: 1; transform: translateX(4px); }

  .hh-card-icon-wrap {
    width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
    border: 1px solid; border-radius: 2px; margin-bottom: 0.9rem; flex-shrink: 0;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  }
  .hh-card-label {
    font-size: 0.53rem; letter-spacing: 0.24em; text-transform: uppercase;
    opacity: 0.3; color: #fff; margin: 0 0 0.15rem;
  }
  .hh-card-title {
    font-family: 'Orbitron', sans-serif; font-size: 0.76rem; font-weight: 700;
    letter-spacing: 0.04em; margin: 0 0 0.3rem; line-height: 1.3;
  }
  .hh-card-desc { font-size: 0.65rem; color: #32324e; flex: 1; }
  .hh-card-arrow {
    margin-top: 0.8rem; align-self: flex-end; opacity: 0.15;
    transition: opacity 0.2s, transform 0.2s;
  }

  /* section divider */
  .hh-section-head {
    display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;
  }
  .hh-section-title {
    font-family: 'Orbitron', sans-serif; font-size: 0.75rem; font-weight: 700;
    color: #00f5ff; letter-spacing: 0.15em; text-transform: uppercase;
    display: flex; align-items: center; gap: 0.55rem; white-space: nowrap;
  }
  .hh-section-rule { flex: 1; height: 1px; background: linear-gradient(90deg, #00f5ff2a, transparent); }
  .hh-section-link {
    font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase;
    color: #00f5ff55; text-decoration: none; white-space: nowrap;
    transition: color 0.15s;
  }
  .hh-section-link:hover { color: #00f5ffaa; text-decoration: none; }

  /* stat chips */
  .hh-stats { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
  .hh-stat {
    background: #0d0d1a; border: 1px solid #1a1a3e;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
    padding: 0.6rem 1rem; min-width: 90px;
  }
  .hh-stat-val {
    font-family: 'Orbitron', sans-serif; font-size: 1.25rem;
    font-weight: 900; line-height: 1;
  }
  .hh-stat-lbl {
    font-size: 0.56rem; letter-spacing: 0.14em; text-transform: uppercase;
    color: #2e2e50; margin-top: 0.2rem;
  }

  /* bookings panel */
  .hh-panel {
    background: #0d0d1a; border: 1px solid #00f5ff1a;
    clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px));
    overflow: hidden;
  }
  .hh-panel-bar {
    background: linear-gradient(90deg, #00f5ff0a, transparent);
    border-bottom: 1px solid #00f5ff18;
    padding: 0.65rem 1.25rem; display: flex; align-items: center; gap: 0.75rem;
  }
  .hh-panel-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #00f5ff; box-shadow: 0 0 8px #00f5ff;
    flex-shrink: 0;
  }
  .hh-panel-lbl { font-size: 0.6rem; letter-spacing: 0.22em; color: #00f5ff66; text-transform: uppercase; }
  .hh-panel-count { margin-left: auto; font-size: 0.6rem; color: #28284a; letter-spacing: 0.1em; }

  /* table */
  .hh-table-wrap { overflow-x: auto; }
  .hh-table { width: 100%; border-collapse: collapse; min-width: 500px; }
  .hh-table thead tr { border-bottom: 1px solid #1a1a3e; }
  .hh-table th {
    font-family: 'Orbitron', sans-serif; font-size: 0.57rem; font-weight: 700;
    letter-spacing: 0.18em; color: #28284a; text-transform: uppercase;
    padding: 0.7rem 1.1rem; text-align: left;
  }
  .hh-table td {
    padding: 0.78rem 1.1rem; font-size: 0.76rem; color: #6a6a8a;
    border-bottom: 1px solid #0d0d1e;
  }
  .hh-table tbody tr { transition: background 0.12s; }
  .hh-table tbody tr:last-child td { border-bottom: none; }
  .hh-table tbody tr:hover { background: #00f5ff06; }
  .hh-table tbody tr:hover td { color: #9a9ab8; }

  .hh-td-user { color: #c0c0de !important; font-weight: 500; }
  .hh-td-slot { color: #00f5ff55 !important; font-size: 0.7rem; }
  .hh-td-game { color: #ffe60044 !important; font-size: 0.7rem; }
  .hh-td-date { color: #28284a !important; font-size: 0.66rem; }

  .hh-badge {
    display: inline-flex; align-items: center; gap: 0.28rem;
    font-size: 0.57rem; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 0.16rem 0.48rem; border: 1px solid;
    clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%);
  }
  .hh-badge::before {
    content: ''; width: 4px; height: 4px; border-radius: 50%;
    background: currentColor; flex-shrink: 0;
  }
  .hh-badge-ok   { color: #00ff88; border-color: #00ff8840; background: #00ff880d; }
  .hh-badge-pend { color: #ffe600; border-color: #ffe60040; background: #ffe6000d; }

  /* states */
  .hh-state {
    text-align: center; padding: 2.5rem 1rem; font-size: 0.68rem;
    letter-spacing: 0.18em; text-transform: uppercase;
  }
  .hh-state-loading { color: #00f5ff2a; animation: hh-blink 1s step-end infinite; }
  .hh-state-empty   { color: #1c1c34; }
  @keyframes hh-blink { 50% { opacity: 0.2; } }

  /* responsive */
  @media (max-width: 640px) {
    .hh-wrap { padding: 1.25rem 1rem 2rem; }
    .hh-grid { grid-template-columns: 1fr 1fr; gap: 0.7rem; }
    .hh-stats { gap: 0.5rem; }
    .hh-stat { min-width: 78px; padding: 0.5rem 0.75rem; }
    .hh-stat-val { font-size: 1.05rem; }
    .hh-card-title { font-size: 0.68rem; }
    .hh-card { padding: 1rem 1rem 0.85rem; }
  }
  @media (max-width: 380px) {
    .hh-grid { grid-template-columns: 1fr; }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function HappyHourDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    adminApi.getHappyHourBookings()
      .then((d) => setBookings(d || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const redeemed = bookings.filter((b) => b.is_redeemed).length;
  const pending  = bookings.length - redeemed;

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="hh-wrap">

        {/* Masthead */}
        <p className="hh-eyebrow">DQD Gaming · Admin</p>
        <h2 className="hh-title">Spinner & Rewards Management</h2>

        {/* Nav cards */}
        <div className="hh-grid">
          {CARDS.map((card) => (
            <Link
              key={card.title}
              to={card.path}
              className="hh-card"
              style={{
                borderColor: card.accent + "3a",
                boxShadow:   `0 0 18px ${card.accent}09, inset 0 0 16px ${card.accent}04`,
                color:       card.accent,
              }}
            >
              <div
                className="hh-card-icon-wrap"
                style={{ borderColor: card.accent + "3a", background: card.accent + "0c" }}
              >
                <Icon name={card.icon} size={18} color={card.accent} />
              </div>
              <p className="hh-card-label">Module</p>
              <h5 className="hh-card-title" style={{ color: card.accent }}>{card.title}</h5>
              <p className="hh-card-desc">{card.desc}</p>
              <span className="hh-card-arrow">
                <Icon name="arrow" size={13} color={card.accent} />
              </span>
            </Link>
          ))}
        </div>

        {/* Section: Recent Bookings */}
        <div className="hh-section-head">
          <span className="hh-section-title">
            <Icon name="list" size={14} color={C.cyan} />
            Recent Bookings
          </span>
          <div className="hh-section-rule" />
          <Link to="/admin/happy-hour-bookings" className="hh-section-link">
            View all →
          </Link>
        </div>

        {!loading && (
          <div className="hh-stats">
            <div className="hh-stat">
              <div className="hh-stat-val" style={{ color: C.cyan }}>{bookings.length}</div>
              <div className="hh-stat-lbl">Total</div>
            </div>
            <div className="hh-stat">
              <div className="hh-stat-val" style={{ color: C.green }}>{redeemed}</div>
              <div className="hh-stat-lbl">Redeemed</div>
            </div>
            <div className="hh-stat">
              <div className="hh-stat-val" style={{ color: C.yellow }}>{pending}</div>
              <div className="hh-stat-lbl">Pending</div>
            </div>
          </div>
        )}

        <div className="hh-panel">
          <div className="hh-panel-bar">
            <div className="hh-panel-dot" />
            <span className="hh-panel-lbl">Booking Log</span>
            {!loading && (
              <span className="hh-panel-count">{bookings.length} records</span>
            )}
          </div>

          {loading ? (
            <div className="hh-state hh-state-loading">[ Fetching bookings… ]</div>
          ) : bookings.length === 0 ? (
            <div className="hh-state hh-state-empty">No bookings yet</div>
          ) : (
            <div className="hh-table-wrap">
              <table className="hh-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Slot</th>
                    <th>Game</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="hh-td-user">{b.user_name}</td>
                      <td className="hh-td-slot">{b.slot_name}</td>
                      <td className="hh-td-game">{b.game_name}</td>
                      <td>
                        <span className={`hh-badge ${b.is_redeemed ? "hh-badge-ok" : "hh-badge-pend"}`}>
                          {b.is_redeemed ? "Redeemed" : "Pending"}
                        </span>
                      </td>
                      <td className="hh-td-date">
                        {new Date(b.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}