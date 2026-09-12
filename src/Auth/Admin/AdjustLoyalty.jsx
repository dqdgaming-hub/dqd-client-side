// AdjustLoyalty.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

const neon = { cyan: "#00f5ff", pink: "#ff2d78", yellow: "#ffe600", card: "#0d0d1a" };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  @keyframes al-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

  .al-wrap { font-family: 'Share Tech Mono', monospace; min-height: 100vh; padding: 2rem; display: flex; justify-content: center; }
  .al-inner { width: 100%; max-width: 640px; }

  .al-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap; }
  .al-title { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 1.5rem; color: ${neon.yellow}; text-shadow: 0 0 20px ${neon.yellow}55; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }
  .al-subtitle { font-size: 0.65rem; letter-spacing: 0.2em; color: #3a3a5a; margin-top: 0.25rem; text-transform: uppercase; }
  .al-btn-back { font-family: 'Orbitron', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.5rem 1.25rem; border: 1px solid #2a2a4a; color: #4a4a6a; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px)); cursor: pointer; background: transparent; transition: all 0.2s; }
  .al-btn-back:hover { color: ${neon.yellow}; border-color: ${neon.yellow}55; box-shadow: 0 0 10px ${neon.yellow}22; transform: translateY(-2px); }

  .al-user-card { background: ${neon.card}; border: 1px solid ${neon.yellow}22; clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px)); padding: 1.1rem 1.4rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
  .al-user-name { font-family: 'Orbitron', sans-serif; font-size: 1rem; color: #e8e8f8; letter-spacing: 0.04em; margin: 0 0 0.3rem; }
  .al-user-email { font-size: 0.75rem; color: #6a6a9a; }
  .al-user-points { text-align: right; }
  .al-user-points-label { font-size: 0.55rem; letter-spacing: 0.2em; color: #4a4a6a; text-transform: uppercase; margin-bottom: 0.3rem; }
  .al-user-points-value { font-family: 'Orbitron', sans-serif; font-size: 1.4rem; font-weight: 900; color: ${neon.yellow}; text-shadow: 0 0 14px ${neon.yellow}55; }

  .al-panel { background: ${neon.card}; border: 1px solid var(--al-accent, ${neon.yellow}22); clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px)); padding: 0 0 2rem; box-shadow: 0 0 40px var(--al-glow, ${neon.yellow}08); animation: al-rise 0.4s ease-out; transition: border-color 0.25s, box-shadow 0.25s; }
  .al-panel-header { background: linear-gradient(90deg, var(--al-glow, ${neon.yellow}11) 0%, transparent 100%); border-bottom: 1px solid var(--al-accent, ${neon.yellow}22); padding: 0.75rem 1.75rem; display: flex; align-items: center; gap: 0.75rem; justify-content: space-between; margin-bottom: 1.75rem; transition: border-color 0.25s; }
  .al-panel-header-left { display: flex; align-items: center; gap: 0.75rem; }
  .al-panel-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--al-accent-solid, ${neon.yellow}); box-shadow: 0 0 8px var(--al-accent-solid, ${neon.yellow}); transition: background 0.25s; }
  .al-panel-label { font-size: 0.65rem; letter-spacing: 0.25em; color: var(--al-accent-solid, ${neon.yellow}); opacity: 0.85; text-transform: uppercase; transition: color 0.25s; }
  .al-panel-tag { font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.15em; color: var(--al-accent-solid, ${neon.yellow}); border: 1px solid var(--al-accent, ${neon.yellow}44); padding: 0.2rem 0.5rem; clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px)); transition: all 0.25s; }

  .al-body { padding: 0 1.75rem; }
  .al-field { margin-bottom: 1.25rem; }
  .al-label { display: block; font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #5a5a8a; margin-bottom: 0.5rem; }

  .al-action-tabs { display: flex; gap: 0.6rem; flex-wrap: wrap; }
  .al-action-tab { flex: 1; min-width: 140px; font-family: 'Orbitron', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; border: 1px solid #1a1a3e; background: transparent; color: #3a3a6a; padding: 0.7rem 0.9rem; clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%); transition: all 0.15s; }
  .al-action-tab:hover { color: #8a8aaa; border-color: #2a2a5a; }
  .al-action-tab.al-tab-add.active { color: ${neon.cyan}; border-color: ${neon.cyan}88; background: ${neon.cyan}11; box-shadow: 0 0 10px ${neon.cyan}22 inset; }
  .al-action-tab.al-tab-deduct.active { color: ${neon.pink}; border-color: ${neon.pink}88; background: ${neon.pink}11; box-shadow: 0 0 10px ${neon.pink}22 inset; }

  .al-input, .al-textarea { width: 100%; background: #0a0a14; border: 1px solid #1a1a3e; color: #c8c8e8; font-family: 'Share Tech Mono', monospace; font-size: 0.85rem; padding: 0.65rem 0.9rem; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px)); outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; resize: vertical; }
  .al-input:focus, .al-textarea:focus { border-color: var(--al-accent-solid, ${neon.yellow}); box-shadow: 0 0 12px var(--al-glow, ${neon.yellow}22); color: #fff; }

  .al-banner { font-size: 0.7rem; letter-spacing: 0.05em; padding: 0.65rem 1rem; margin-bottom: 1.25rem; border-left: 3px solid; display: flex; align-items: center; gap: 0.5rem; }
  .al-banner.success { background: #0a1a14; border-color: #00ff8855; color: #6affc0; }
  .al-banner.error { background: #1a0a0e; border-color: ${neon.pink}; color: #ff8aa8; }

  .al-submit { width: 100%; font-family: 'Orbitron', sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; border: 1px solid; padding: 0.85rem 2rem; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); transition: box-shadow 0.2s, transform 0.15s; }
  .al-submit:hover:not(:disabled) { transform: translateY(-2px); }
  .al-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .al-submit.al-tab-add { color: ${neon.cyan}; border-color: ${neon.cyan}88; background: ${neon.cyan}11; }
  .al-submit.al-tab-add:hover:not(:disabled) { box-shadow: 0 0 20px ${neon.cyan}44; }
  .al-submit.al-tab-deduct { color: ${neon.pink}; border-color: ${neon.pink}88; background: ${neon.pink}11; }
  .al-submit.al-tab-deduct:hover:not(:disabled) { box-shadow: 0 0 20px ${neon.pink}44; }

  @media (max-width: 500px) {
    .al-wrap { padding: 1.25rem; }
    .al-user-card { flex-direction: column; align-items: flex-start; }
    .al-user-points { text-align: left; }
  }
`;

export default function AdjustLoyalty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);

  const [form, setForm] = useState({
    action: "add",
    points: "",
    reason: "",
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const users = await adminApi.getLoyaltyUsers();
      const selectedUser = users.find((u) => String(u.id) === String(id));
      setUser(selectedUser);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setAction = (action) => setForm((prev) => ({ ...prev, action }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      setLoading(true);
      await adminApi.adjustUserLoyalty(id, {
        action: form.action,
        points: Number(form.points),
        reason: form.reason,
      });
      setStatus({ type: "success", message: "Loyalty points updated successfully." });
      setTimeout(() => navigate(`/admin/loyalty/${id}`), 700);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err?.response?.data?.message || "Failed to update loyalty points.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAdd = form.action === "add";
  const accentVars = isAdd
    ? { "--al-accent": `${neon.cyan}33`, "--al-accent-solid": neon.cyan, "--al-glow": `${neon.cyan}11` }
    : { "--al-accent": `${neon.pink}33`, "--al-accent-solid": neon.pink, "--al-glow": `${neon.pink}11` };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="al-wrap">
        <div className="al-inner">

          <div className="al-header">
            <div>
              <h3 className="al-title">Adjust Loyalty Points</h3>
              <p className="al-subtitle">// Manual ledger entry</p>
            </div>
            <button className="al-btn-back" onClick={() => navigate(`/admin/loyalty/${id}`)}>
              ← Back
            </button>
          </div>

          {user && (
            <div className="al-user-card">
              <div>
                <h5 className="al-user-name">{user.full_name}</h5>
                <span className="al-user-email">{user.email}</span>
              </div>
              <div className="al-user-points">
                <div className="al-user-points-label">Current Points</div>
                <div className="al-user-points-value">{user.loyalty_points}</div>
              </div>
            </div>
          )}

          <div className="al-panel" style={accentVars}>
            <div className="al-panel-header">
              <div className="al-panel-header-left">
                <div className="al-panel-dot" />
                <span className="al-panel-label">Ledger Entry</span>
              </div>
              <span className="al-panel-tag">LP-01</span>
            </div>

            <form onSubmit={submit} className="al-body">
              {status && (
                <div className={`al-banner ${status.type}`}>
                  <span>{status.type === "success" ? "✓" : "!"}</span>
                  <span>{status.message}</span>
                </div>
              )}

              <div className="al-field">
                <label className="al-label">Action</label>
                <div className="al-action-tabs">
                  <button
                    type="button"
                    className={`al-action-tab al-tab-add ${isAdd ? "active" : ""}`}
                    onClick={() => setAction("add")}
                  >
                    + Add Points
                  </button>
                  <button
                    type="button"
                    className={`al-action-tab al-tab-deduct ${!isAdd ? "active" : ""}`}
                    onClick={() => setAction("deduct")}
                  >
                    − Deduct Points
                  </button>
                </div>
              </div>

              <div className="al-field">
                <label className="al-label">Points</label>
                <input
                  type="number" min="1" className="al-input"
                  name="points" value={form.points} onChange={handleChange} required
                />
              </div>

              <div className="al-field" style={{ marginBottom: 0 }}>
                <label className="al-label">Reason</label>
                <textarea
                  rows="4" className="al-textarea"
                  name="reason" value={form.reason} onChange={handleChange} required
                />
              </div>

              <div className="al-field" style={{ marginBottom: 0, marginTop: "1.5rem" }}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`al-submit ${isAdd ? "al-tab-add" : "al-tab-deduct"}`}
                >
                  {loading ? "Saving…" : isAdd ? "Grant Points →" : "Deduct Points →"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}