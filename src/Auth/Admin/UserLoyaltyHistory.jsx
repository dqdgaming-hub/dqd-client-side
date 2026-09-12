// UserLoyaltyHistory.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

const neon = { cyan: "#00f5ff", pink: "#ff2d78", yellow: "#ffe600", card: "#0d0d1a" };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  .ulh-wrap { font-family: 'Share Tech Mono', monospace; min-height: 100vh; padding: 2rem; }

  .ulh-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap; }
  .ulh-title { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 1.6rem; color: ${neon.yellow}; text-shadow: 0 0 20px ${neon.yellow}55; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }
  .ulh-subtitle { font-size: 0.65rem; letter-spacing: 0.2em; color: #3a3a5a; margin-top: 0.25rem; text-transform: uppercase; }
  .ulh-btn { font-family: 'Orbitron', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.5rem 1.25rem; border: 1px solid #2a2a4a; color: #4a4a6a; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px)); cursor: pointer; background: transparent; transition: all 0.2s; }
  .ulh-btn:hover { transform: translateY(-2px); color: ${neon.yellow}; border-color: ${neon.yellow}55; box-shadow: 0 0 10px ${neon.yellow}22; }

  .ulh-error { font-size: 0.7rem; letter-spacing: 0.05em; padding: 0.65rem 1rem; margin-bottom: 1.25rem; border-left: 3px solid ${neon.pink}; background: #1a0a0e; color: #ff8aa8; }

  .ulh-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.1rem; margin-bottom: 1.75rem; }
  @media (max-width: 700px) { .ulh-stats { grid-template-columns: 1fr; } }
  .ulh-stat { position: relative; background: ${neon.card}; border: 1px solid #1a1a3e; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px)); padding: 1.1rem 1.25rem; overflow: hidden; }
  .ulh-stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent); box-shadow: 0 0 8px var(--accent); }
  .ulh-stat-label { font-family: 'Orbitron', sans-serif; font-size: 0.6rem; letter-spacing: 0.2em; color: #4a4a6a; text-transform: uppercase; margin-bottom: 0.5rem; }
  .ulh-stat-value { font-family: 'Orbitron', sans-serif; font-size: 1.9rem; font-weight: 900; color: var(--accent); text-shadow: 0 0 16px var(--accent); }
  .ulh-stat-earned { --accent: ${neon.cyan}; }
  .ulh-stat-redeemed { --accent: ${neon.pink}; }
  .ulh-stat-count { --accent: ${neon.yellow}; }

  .ulh-panel { background: ${neon.card}; border: 1px solid #1a1a3e; clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px)); overflow: hidden; }
  .ulh-panel-header { background: linear-gradient(90deg, ${neon.yellow}11 0%, transparent 100%); border-bottom: 1px solid ${neon.yellow}22; padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
  .ulh-panel-dot { width: 6px; height: 6px; border-radius: 50%; background: ${neon.yellow}; box-shadow: 0 0 8px ${neon.yellow}; }
  .ulh-panel-label { font-size: 0.65rem; letter-spacing: 0.25em; color: ${neon.yellow}88; text-transform: uppercase; }
  .ulh-count { font-size: 0.65rem; color: #3a3a5a; letter-spacing: 0.1em; margin-left: auto; }

  .ulh-table { width: 100%; border-collapse: collapse; }
  .ulh-table thead tr { border-bottom: 1px solid #1a1a3e; }
  .ulh-table th { font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.2em; color: #3a3a6a; text-transform: uppercase; padding: 0.75rem 1.25rem; text-align: left; }
  .ulh-table td { padding: 0.85rem 1.25rem; font-size: 0.8rem; color: #8a8aaa; border-bottom: 1px solid #0f0f20; }
  .ulh-table tbody tr { transition: background 0.15s; }
  .ulh-table tbody tr:hover { background: ${neon.yellow}06; }
  .ulh-table tbody tr:hover td { color: #aaaacc; }
  .ulh-date { color: #6a6a9a !important; font-size: 0.75rem; }
  .ulh-type { color: #c8c8e8 !important; text-transform: capitalize; }
  .ulh-desc { color: #6a6a8a !important; font-size: 0.75rem; }
  .ulh-badge { display: inline-block; font-family: 'Orbitron', sans-serif; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border: 1px solid; clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%); }
  .ulh-badge-pos { color: ${neon.cyan}; border-color: ${neon.cyan}55; background: ${neon.cyan}11; }
  .ulh-badge-neg { color: ${neon.pink}; border-color: ${neon.pink}55; background: ${neon.pink}11; }
  .ulh-loading, .ulh-empty { text-align: center; padding: 3rem; color: #2a2a4a; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; }
  .ulh-loading { color: ${neon.yellow}44; animation: ulh-blink 1s step-end infinite; }
  @keyframes ulh-blink { 50% { opacity: 0.3; } }

  @media (max-width: 760px) {
    .ulh-wrap { padding: 1.25rem; }
    .ulh-table thead { display: none; }
    .ulh-table, .ulh-table tbody, .ulh-table tr, .ulh-table td { display: block; width: 100%; }
    .ulh-table tr { border-bottom: 1px solid #1a1a3e; padding: 0.9rem 1.25rem 1.1rem; }
    .ulh-table tbody tr:last-child { border-bottom: none; }
    .ulh-table td { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.35rem 0; border-bottom: none; text-align: right; }
    .ulh-table td::before { content: attr(data-label); font-family: 'Orbitron', sans-serif; font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase; color: #4a4a6a; flex-shrink: 0; text-align: left; }
  }
`;

export default function UserLoyaltyHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [id]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const historyData = await adminApi.getUserLoyaltyHistory(id);
      setHistory(historyData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  const totalEarned = history.filter((x) => x.points > 0).reduce((a, b) => a + b.points, 0);
  const totalRedeemed = history.filter((x) => x.points < 0).reduce((a, b) => a + Math.abs(b.points), 0);

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="ulh-wrap">

        <div className="ulh-header">
          <div>
            <h3 className="ulh-title">User Loyalty History</h3>
            <p className="ulh-subtitle">// Transaction ledger · member #{id}</p>
          </div>
          <button className="ulh-btn" onClick={() => navigate("/admin/loyalty")}>
            ← Back
          </button>
        </div>

        {error && <div className="ulh-error">! {error}</div>}

        <div className="ulh-stats">
          <div className="ulh-stat ulh-stat-earned">
            <div className="ulh-stat-label">Total Earned</div>
            <div className="ulh-stat-value">+{totalEarned}</div>
          </div>
          <div className="ulh-stat ulh-stat-redeemed">
            <div className="ulh-stat-label">Total Redeemed</div>
            <div className="ulh-stat-value">-{totalRedeemed}</div>
          </div>
          <div className="ulh-stat ulh-stat-count">
            <div className="ulh-stat-label">Transactions</div>
            <div className="ulh-stat-value">{history.length}</div>
          </div>
        </div>

        <div className="ulh-panel">
          <div className="ulh-panel-header">
            <div className="ulh-panel-dot" />
            <span className="ulh-panel-label">Transaction Log</span>
            {!loading && <span className="ulh-count">{history.length} entries</span>}
          </div>

          {loading ? (
            <div className="ulh-loading">[ Fetching transaction log… ]</div>
          ) : history.length === 0 ? (
            <div className="ulh-empty">No transactions found</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="ulh-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Points</th>
                    <th>Granted By</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Date" className="ulh-date">{new Date(item.created_at).toLocaleString()}</td>
                      <td data-label="Type" className="ulh-type">{item.transaction_type}</td>
                      <td data-label="Points">
                        <span className={`ulh-badge ${item.points > 0 ? "ulh-badge-pos" : "ulh-badge-neg"}`}>
                          {item.points > 0 ? `+${item.points}` : item.points}
                        </span>
                      </td>
                      <td data-label="Granted By">{item.granted_by_name || "—"}</td>
                      <td data-label="Description" className="ulh-desc">{item.description || "—"}</td>
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