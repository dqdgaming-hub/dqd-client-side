import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

const neon = { cyan: "#00f5ff", pink: "#ff2d78", yellow: "#ffe600",  card: "#0d0d1a" };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  .ss-wrap { font-family: 'Share Tech Mono', monospace; background: ${neon.bg}; min-height: 100vh; padding: 2rem; }
  .ss-title {
    font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 1.6rem;
    color: ${neon.pink}; text-shadow: 0 0 20px ${neon.pink}55;
    letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 0.25rem;
  }
  .ss-subtitle { font-size: 0.65rem; letter-spacing: 0.2em; color: #3a3a5a; margin-bottom: 2rem; text-transform: uppercase; }

  .ss-panel {
    background: ${neon.card}; border: 1px solid ${neon.pink}22;
    clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
    overflow: hidden; box-shadow: 0 0 40px ${neon.pink}06;
  }
  .ss-panel-header {
    background: linear-gradient(90deg, ${neon.pink}11 0%, transparent 100%);
    border-bottom: 1px solid ${neon.pink}22;
    padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 0.75rem;
  }
  .ss-panel-dot { width: 6px; height: 6px; border-radius: 50%; background: ${neon.pink}; box-shadow: 0 0 8px ${neon.pink}; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  .ss-panel-label { font-size: 0.65rem; letter-spacing: 0.25em; color: ${neon.pink}88; text-transform: uppercase; }
  .ss-count { font-size: 0.65rem; color: #3a3a5a; letter-spacing: 0.1em; margin-left: auto; }

  .ss-table { width: 100%; border-collapse: collapse; }
  .ss-table thead tr { border-bottom: 1px solid #1a1a3e; }
  .ss-table th {
    font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700;
    letter-spacing: 0.2em; color: #3a3a6a; text-transform: uppercase;
    padding: 0.75rem 1.25rem; text-align: left;
  }
  .ss-table td { padding: 0.85rem 1.25rem; font-size: 0.8rem; color: #8a8aaa; border-bottom: 1px solid #0f0f20; }
  .ss-table tbody tr { transition: background 0.15s; }
  .ss-table tbody tr:hover { background: ${neon.pink}05; }
  .ss-table tbody tr:hover td { color: #aaaacc; }

  .ss-user { color: #c8c8e8 !important; font-weight: 500; }
  .ss-reward { color: ${neon.pink}99 !important; }
  .ss-week { color: ${neon.yellow}77 !important; font-size: 0.72rem; }
  .ss-year { color: #4a4a6a !important; font-size: 0.72rem; }
  .ss-time { color: #3a3a6a !important; font-size: 0.7rem; }

  .ss-row-idx {
    font-size: 0.6rem; color: #2a2a3a; letter-spacing: 0.05em; padding-right: 0 !important;
  }

  .ss-loading, .ss-empty {
    text-align: center; padding: 3rem; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase;
  }
  .ss-loading { color: ${neon.pink}44; animation: blink 1s step-end infinite; }
  .ss-empty { color: #2a2a4a; }
  @keyframes blink { 50% { opacity: 0.3; } }
`;

export default function SpinnerSpins() {
  const [spins, setSpins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSpins(); }, []);

  const loadSpins = async () => {
    try {
      const data = await adminApi.getSpinnerSpins();
      setSpins(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load spins");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="ss-wrap">
        <h3 className="ss-title">Spinner Spins</h3>
        <p className="ss-subtitle">// Spin history · live log</p>

        <div className="ss-panel">
          <div className="ss-panel-header">
            <div className="ss-panel-dot" />
            <span className="ss-panel-label">Spin History</span>
            {!loading && <span className="ss-count">{spins.length} records</span>}
          </div>

          {loading ? (
            <div className="ss-loading">[ Fetching spin records... ]</div>
          ) : spins.length === 0 ? (
            <div className="ss-empty">No spin records found</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="ss-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Reward</th>
                    <th>Week</th>
                    <th>Year</th>
                    <th>Spun At</th>
                  </tr>
                </thead>
                <tbody>
                  {spins.map((spin, i) => (
                    <tr key={spin.id}>
                      <td className="ss-row-idx">{String(i + 1).padStart(3, "0")}</td>
                      <td className="ss-user">{spin.user}</td>
                      <td className="ss-reward">{spin.reward}</td>
                      <td className="ss-week">W{spin.week}</td>
                      <td className="ss-year">{spin.year}</td>
                      <td className="ss-time">{new Date(spin.spun_at).toLocaleString()}</td>
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