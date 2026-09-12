import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

const neon = { cyan: "#00f5ff", pink: "#ff2d78", yellow: "#ffe600",  card: "#0d0d1a" };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  .hhb-wrap { font-family: 'Share Tech Mono', monospace; background: ${neon.bg}; min-height: 100vh; padding: 2rem; }
  .hhb-title {
    font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 1.6rem;
    color: ${neon.cyan}; text-shadow: 0 0 20px ${neon.cyan}55;
    letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 0.25rem;
  }
  .hhb-subtitle { font-size: 0.65rem; letter-spacing: 0.2em; color: #3a3a5a; margin-bottom: 2rem; text-transform: uppercase; }

  .hhb-stats { display: flex; gap: 1rem; margin-bottom: 1.75rem; flex-wrap: wrap; }
  .hhb-stat {
    background: ${neon.card}; border: 1px solid #1a1a3e;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
    padding: 0.75rem 1.25rem; min-width: 120px;
  }
  .hhb-stat-val { font-family: 'Orbitron', sans-serif; font-size: 1.4rem; font-weight: 900; line-height: 1; }
  .hhb-stat-lbl { font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; color: #3a3a5a; margin-top: 0.25rem; }

  .hhb-panel {
    background: ${neon.card}; border: 1px solid ${neon.cyan}22;
    clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
    overflow: hidden;
  }
  .hhb-panel-header {
    background: linear-gradient(90deg, ${neon.cyan}11 0%, transparent 100%);
    border-bottom: 1px solid ${neon.cyan}22;
    padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 0.75rem;
  }
  .hhb-panel-dot { width: 6px; height: 6px; border-radius: 50%; background: ${neon.cyan}; box-shadow: 0 0 8px ${neon.cyan}; }
  .hhb-panel-label { font-size: 0.65rem; letter-spacing: 0.25em; color: ${neon.cyan}88; text-transform: uppercase; }
  .hhb-count { font-size: 0.65rem; color: #3a3a5a; letter-spacing: 0.1em; margin-left: auto; }

  .hhb-table { width: 100%; border-collapse: collapse; }
  .hhb-table thead tr { border-bottom: 1px solid #1a1a3e; }
  .hhb-table th {
    font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700;
    letter-spacing: 0.2em; color: #3a3a6a; text-transform: uppercase;
    padding: 0.75rem 1.25rem; text-align: left;
  }
  .hhb-table td { padding: 0.85rem 1.25rem; font-size: 0.8rem; color: #8a8aaa; border-bottom: 1px solid #0f0f20; }
  .hhb-table tbody tr { transition: background 0.15s; }
  .hhb-table tbody tr:hover { background: ${neon.cyan}05; }
  .hhb-table tbody tr:hover td { color: #aaaacc; }

  .hhb-user { color: #c8c8e8 !important; font-weight: 500; }
  .hhb-slot { color: ${neon.cyan}77 !important; font-size: 0.75rem; }
  .hhb-game { color: ${neon.yellow}66 !important; font-size: 0.75rem; }
  .hhb-date { color: #4a4a6a !important; font-size: 0.72rem; }

  .hhb-badge {
    display: inline-flex; align-items: center; gap: 0.3rem;
    font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 0.2rem 0.55rem; border: 1px solid;
    clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%);
  }
  .hhb-badge::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
  .hhb-badge-redeemed { color: ${neon.cyan}; border-color: ${neon.cyan}55; background: ${neon.cyan}11; }
  .hhb-badge-pending { color: ${neon.yellow}; border-color: ${neon.yellow}55; background: ${neon.yellow}11; }

  .hhb-loading, .hhb-empty {
    text-align: center; padding: 3rem; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase;
  }
  .hhb-loading { color: ${neon.cyan}44; animation: blink 1s step-end infinite; }
  .hhb-empty { color: #2a2a4a; }
  @keyframes blink { 50% { opacity: 0.3; } }
`;

export default function HappyHourBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      const data = await adminApi.getHappyHourBookings();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const redeemed = bookings.filter((b) => b.is_redeemed).length;
  const pending = bookings.length - redeemed;

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="hhb-wrap">
        <h3 className="hhb-title">Happy Hour Bookings</h3>
        <p className="hhb-subtitle">// Reservation tracking system</p>

        {!loading && (
          <div className="hhb-stats">
            <div className="hhb-stat">
              <div className="hhb-stat-val" style={{ color: neon.cyan }}>{bookings.length}</div>
              <div className="hhb-stat-lbl">Total</div>
            </div>
            <div className="hhb-stat">
              <div className="hhb-stat-val" style={{ color: neon.cyan }}>{redeemed}</div>
              <div className="hhb-stat-lbl">Redeemed</div>
            </div>
            <div className="hhb-stat">
              <div className="hhb-stat-val" style={{ color: neon.yellow }}>{pending}</div>
              <div className="hhb-stat-lbl">Pending</div>
            </div>
          </div>
        )}

        <div className="hhb-panel">
          <div className="hhb-panel-header">
            <div className="hhb-panel-dot" />
            <span className="hhb-panel-label">Booking Log</span>
            {!loading && <span className="hhb-count">{bookings.length} records</span>}
          </div>

          {loading ? (
            <div className="hhb-loading">[ Loading bookings... ]</div>
          ) : bookings.length === 0 ? (
            <div className="hhb-empty">No bookings found</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="hhb-table">
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
                      <td className="hhb-user">{b.user_name}</td>
                      <td className="hhb-slot">{b.slot_name}</td>
                      <td className="hhb-game">{b.game_name}</td>
                      <td>
                        <span className={`hhb-badge ${b.is_redeemed ? "hhb-badge-redeemed" : "hhb-badge-pending"}`}>
                          {b.is_redeemed ? "Redeemed" : "Pending"}
                        </span>
                      </td>
                      <td className="hhb-date">{new Date(b.created_at).toLocaleString()}</td>
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