import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

const neon = { cyan: "#00f5ff", pink: "#ff2d78", yellow: "#ffe600", card: "#0d0d1a" };

const TYPE_CONFIG = {
  happy_hour: { label: "Happy Hour", color: neon.cyan },
  points:     { label: "Points",     color: neon.yellow },
  better_luck:{ label: "Better Luck",color: neon.pink },
};

const TYPE_TABS = [
  { value: "happy_hour",  label: "Happy Hour",  cls: "active-cyan"   },
  { value: "points",      label: "Points",      cls: "active-yellow" },
  { value: "better_luck", label: "Better Luck", cls: "active-pink"   },
];

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  /* ── List styles ── */
  .sr-wrap { font-family: 'Share Tech Mono', monospace; min-height: 100vh; padding: 2rem; }
  .sr-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap; }
  .sr-title { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 1.6rem; color: ${neon.pink}; text-shadow: 0 0 20px ${neon.pink}55; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 0.25rem; }
  .sr-subtitle { font-size: 0.65rem; letter-spacing: 0.2em; color: #3a3a5a; text-transform: uppercase; }
  .sr-actions { display: flex; gap: 0.75rem; align-items: center; margin-left: auto; }
  .sr-btn { font-family: 'Orbitron', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 0.5rem 1.25rem; border: 1px solid; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px)); transition: box-shadow 0.2s, transform 0.15s; display: inline-block; cursor: pointer; background: transparent; }
  .sr-btn:hover { transform: translateY(-2px); text-decoration: none; }
  .sr-btn-ghost { color: #4a4a6a; border-color: #2a2a4a; }
  .sr-btn-ghost:hover { color: ${neon.pink}; border-color: ${neon.pink}55; box-shadow: 0 0 10px ${neon.pink}22; }
  .sr-btn-add { color: ${neon.pink}; border-color: ${neon.pink}88; background: ${neon.pink}11; }
  .sr-btn-add:hover { box-shadow: 0 0 16px ${neon.pink}44; }
  .sr-panel { background: ${neon.card}; border: 1px solid ${neon.pink}22; clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px)); overflow: hidden; box-shadow: 0 0 40px ${neon.pink}08; }
  .sr-panel-header { background: linear-gradient(90deg, ${neon.pink}11 0%, transparent 100%); border-bottom: 1px solid ${neon.pink}22; padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
  .sr-panel-dot { width: 6px; height: 6px; border-radius: 50%; background: ${neon.pink}; box-shadow: 0 0 8px ${neon.pink}; }
  .sr-panel-label { font-size: 0.65rem; letter-spacing: 0.25em; color: ${neon.pink}88; text-transform: uppercase; }
  .sr-count { font-size: 0.65rem; color: #3a3a5a; letter-spacing: 0.1em; margin-left: auto; }
  .sr-table { width: 100%; border-collapse: collapse; }
  .sr-table thead tr { border-bottom: 1px solid #1a1a3e; }
  .sr-table th { font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.2em; color: #3a3a6a; text-transform: uppercase; padding: 0.75rem 1.25rem; text-align: left; }
  .sr-table td { padding: 0.85rem 1.25rem; font-size: 0.8rem; color: #8a8aaa; border-bottom: 1px solid #0f0f20; }
  .sr-table tbody tr { transition: background 0.15s; }
  .sr-table tbody tr:hover { background: ${neon.pink}05; }
  .sr-table tbody tr:hover td { color: #aaaacc; }
  .sr-name { color: #c8c8e8 !important; }
  .sr-type-badge { display: inline-block; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.2rem 0.55rem; border: 1px solid; clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%); }
  .sr-pts { color: ${neon.yellow}88 !important; }
  .sr-slot { color: ${neon.cyan}66 !important; font-size: 0.75rem; }
  .sr-prob { color: ${neon.pink}99 !important; }
  .sr-prob-bar { display: flex; align-items: center; gap: 0.5rem; }
  .sr-prob-track { flex: 1; max-width: 80px; height: 3px; background: #1a1a3e; border-radius: 2px; overflow: hidden; }
  .sr-prob-fill { height: 100%; background: ${neon.pink}; border-radius: 2px; }
  .sr-loading, .sr-empty { text-align: center; padding: 3rem; color: #2a2a4a; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; }
  .sr-loading { color: ${neon.pink}44; animation: blink 1s step-end infinite; }
  @keyframes blink { 50% { opacity: 0.3; } }

  /* ── Add-reward panel ── */
  @keyframes asr-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes asr-blink { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0; } 100% { opacity: 1; } }

  .asr-panel { background: ${neon.card}; border: 1px solid ${neon.pink}22; clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px)); padding: 0 0 2rem; max-width: 680px; box-shadow: 0 0 40px ${neon.pink}08; animation: asr-rise 0.45s ease-out; margin-bottom: 2rem; }
  .asr-panel-header { background: linear-gradient(90deg, ${neon.pink}11 0%, transparent 100%); border-bottom: 1px solid ${neon.pink}22; padding: 0.75rem 1.75rem; display: flex; align-items: center; gap: 0.75rem; justify-content: space-between; margin-bottom: 1.75rem; }
  .asr-panel-header-left { display: flex; align-items: center; gap: 0.75rem; }
  .asr-panel-dot { width: 6px; height: 6px; border-radius: 50%; background: ${neon.pink}; box-shadow: 0 0 8px ${neon.pink}; }
  .asr-panel-label { font-size: 0.65rem; letter-spacing: 0.25em; color: ${neon.pink}88; text-transform: uppercase; }
  .asr-panel-tag { font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.15em; color: ${neon.pink}; border: 1px solid ${neon.pink}44; padding: 0.2rem 0.5rem; clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px)); }
  .asr-body { padding: 0 1.75rem; }
  .asr-field { margin-bottom: 1.25rem; }
  .asr-label { display: block; font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${neon.pink}88; margin-bottom: 0.5rem; }
  .asr-input, .asr-select { width: 100%; background: #0a0a14; border: 1px solid #1a1a3e; color: #c8c8e8; font-family: 'Share Tech Mono', monospace; font-size: 0.85rem; padding: 0.65rem 0.9rem; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px)); outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
  .asr-input:focus, .asr-select:focus { border-color: ${neon.pink}88; box-shadow: 0 0 12px ${neon.pink}22; color: #fff; }
  .asr-input:disabled, .asr-select:disabled { opacity: 0.5; cursor: not-allowed; }
  .asr-select option { background: #0d0d1a; }
  .asr-type-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .asr-type-tab { font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; border: 1px solid #1a1a3e; background: transparent; color: #3a3a6a; padding: 0.55rem 0.9rem; flex: 1; min-width: 90px; clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%); transition: all 0.15s; }
  .asr-type-tab:hover { color: #8a8aaa; border-color: #2a2a5a; }
  .asr-type-tab.active-cyan { color: ${neon.cyan}; border-color: ${neon.cyan}88; background: ${neon.cyan}11; }
  .asr-type-tab.active-yellow { color: ${neon.yellow}; border-color: ${neon.yellow}88; background: ${neon.yellow}11; }
  .asr-type-tab.active-pink { color: ${neon.pink}; border-color: ${neon.pink}88; background: ${neon.pink}11; }
  .asr-conditional { background: #08080f; border: 1px solid #1a1a3e; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%); padding: 1rem 1.25rem; margin-bottom: 1.25rem; }
  .asr-cond-label { font-size: 0.6rem; letter-spacing: 0.15em; color: #2a2a4a; text-transform: uppercase; margin-bottom: 0.75rem; }
  .asr-cond-empty { font-size: 0.7rem; color: #4a4a6a; letter-spacing: 0.05em; margin: 0; }
  .asr-dial-row { display: flex; align-items: center; gap: 1rem; }
  .asr-dial-slider { flex: 1; height: 4px; border-radius: 2px; outline: none; cursor: pointer; -webkit-appearance: none; -moz-appearance: none; appearance: none; }
  .asr-dial-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 15px; height: 15px; border-radius: 50%; background: ${neon.pink}; box-shadow: 0 0 10px ${neon.pink}; border: 2px solid #0a0a14; cursor: pointer; }
  .asr-dial-slider::-moz-range-thumb { width: 15px; height: 15px; border-radius: 50%; border: 2px solid #0a0a14; background: ${neon.pink}; box-shadow: 0 0 10px ${neon.pink}; cursor: pointer; }
  .asr-dial-readout { flex-shrink: 0; display: flex; align-items: center; gap: 0.2rem; background: #0a0a14; border: 1px solid ${neon.pink}44; clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px)); padding: 0.35rem 0.6rem; }
  .asr-dial-num { width: 34px; background: transparent; border: none; outline: none; font-family: 'Orbitron', sans-serif; font-weight: 700; font-size: 0.85rem; color: ${neon.pink}; text-align: right; padding: 0; }
  .asr-dial-pct { font-family: 'Orbitron', sans-serif; font-size: 0.75rem; color: ${neon.pink}88; }
  .asr-dial-hint { font-size: 0.6rem; letter-spacing: 0.1em; color: #3a3a5a; margin-top: 0.5rem; text-transform: uppercase; }
  .asr-banner { font-size: 0.7rem; letter-spacing: 0.05em; padding: 0.65rem 1rem; margin-bottom: 1.25rem; border-left: 3px solid; display: flex; align-items: center; gap: 0.5rem; }
  .asr-banner.success { background: #0a1a14; border-color: #00ff8855; color: #6affc0; }
  .asr-banner.error { background: #1a0a0e; border-color: ${neon.pink}; color: #ff8aa8; }
  .asr-actions { display: flex; align-items: center; gap: 1.25rem; margin-top: 0.5rem; }
  .asr-submit { font-family: 'Orbitron', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; background: ${neon.pink}11; border: 1px solid ${neon.pink}88; color: ${neon.pink}; padding: 0.75rem 2rem; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); transition: box-shadow 0.2s, transform 0.15s; }
  .asr-submit:hover:not(:disabled) { box-shadow: 0 0 20px ${neon.pink}44; transform: translateY(-2px); }
  .asr-submit:active:not(:disabled) { transform: translateY(0); }
  .asr-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .asr-cancel { font-family: 'Share Tech Mono', monospace; font-size: 0.7rem; letter-spacing: 0.08em; color: #5a5a8a; text-decoration: none; cursor: pointer; background: none; border: none; transition: color 0.2s; }
  .asr-cancel:hover { color: #8a8aaa; }
  .asr-title-pink { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 1.4rem; color: ${neon.pink}; text-shadow: 0 0 20px ${neon.pink}55; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 0.25rem; }
  .asr-subtitle-dim { font-size: 0.65rem; letter-spacing: 0.2em; color: #3a3a5a; margin-bottom: 1.5rem; text-transform: uppercase; }
  .asr-cursor { color: ${neon.pink}88; animation: asr-blink 1.1s step-end infinite; }
`;

// ─── Inline Add-Reward Form ────────────────────────────────────────────────────
function AddRewardPanel({ onSuccess, onCancel }) {
  const [slots, setSlots]               = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [form, setForm]                 = useState({
    reward_name: "", reward_type: "happy_hour",
    reward_points: 0, template_slot: "", probability: 10,
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus]         = useState(null);

  useEffect(() => { loadSlots(); }, []);

  const loadSlots = async () => {
    setSlotsLoading(true);
    try {
      const data = await adminApi.getHappyHourSlots();
      setSlots(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setProbability = (raw) => {
    let n = Number(raw);
    if (Number.isNaN(n)) n = 0;
    n = Math.max(0, Math.min(100, n));
    setForm((prev) => ({ ...prev, probability: n }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      await adminApi.createSpinnerReward({
        ...form,
        reward_points: Number(form.reward_points) || 0,
        probability:   Number(form.probability),
      });
      setStatus({ type: "success", message: "Reward created successfully." });
      setTimeout(() => onSuccess(), 700);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.detail || err.message || "Failed to create reward.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h4 className="asr-title-pink">Add Spinner Reward</h4>
      <p className="asr-subtitle-dim">// configure new reward entry <span className="asr-cursor">_</span></p>

      <div className="asr-panel">
        <div className="asr-panel-header">
          <div className="asr-panel-header-left">
            <div className="asr-panel-dot" />
            <span className="asr-panel-label">Reward Configuration</span>
          </div>
          <span className="asr-panel-tag">SPN-01</span>
        </div>

        <form onSubmit={submit} className="asr-body">
          {status && (
            <div className={`asr-banner ${status.type}`}>
              <span>{status.type === "success" ? "✓" : "!"}</span>
              <span>{status.message}</span>
            </div>
          )}

          <div className="asr-field">
            <label className="asr-label">Reward Name</label>
            <input className="asr-input" name="reward_name" value={form.reward_name} onChange={change} required placeholder="e.g. Free Gaming Session" />
          </div>

          <div className="asr-field">
            <label className="asr-label">Reward Type</label>
            <div className="asr-type-tabs">
              {TYPE_TABS.map((t) => (
                <button key={t.value} type="button"
                  className={`asr-type-tab ${form.reward_type === t.value ? t.cls : ""}`}
                  onClick={() => setForm((p) => ({ ...p, reward_type: t.value }))}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {form.reward_type === "points" && (
            <div className="asr-conditional">
              <p className="asr-cond-label">Points configuration</p>
              <div className="asr-field" style={{ marginBottom: 0 }}>
                <label className="asr-label">Reward Points</label>
                <input type="number" className="asr-input" name="reward_points" value={form.reward_points} onChange={change} min="0" />
              </div>
            </div>
          )}

          {form.reward_type === "happy_hour" && (
            <div className="asr-conditional">
              <p className="asr-cond-label">Happy Hour slot binding</p>
              <div className="asr-field" style={{ marginBottom: 0 }}>
                <label className="asr-label">Happy Hour Slot</label>
                <select className="asr-select" name="template_slot" value={form.template_slot} onChange={change} disabled={slotsLoading}>
                  <option value="">{slotsLoading ? "Loading slots…" : "— Select Slot —"}</option>
                  {slots.map((slot) => <option key={slot.id} value={slot.id}>{slot.slot_name}</option>)}
                </select>
              </div>
            </div>
          )}

          {form.reward_type === "better_luck" && (
            <div className="asr-conditional">
              <p className="asr-cond-label">Better luck configuration</p>
              <p className="asr-cond-empty">// no additional configuration needed</p>
            </div>
          )}

          <div className="asr-field">
            <label className="asr-label">Probability</label>
            <div className="asr-dial-row">
              <input
                type="range" min="0" max="100" className="asr-dial-slider"
                value={form.probability}
                onChange={(e) => setProbability(e.target.value)}
                style={{
                  background: `linear-gradient(90deg, ${neon.pink} 0%, ${neon.pink} ${form.probability}%, #1a1a3e ${form.probability}%, #1a1a3e 100%)`,
                }}
              />
              <div className="asr-dial-readout">
                <input type="number" min="0" max="100" className="asr-dial-num" value={form.probability} onChange={(e) => setProbability(e.target.value)} />
                <span className="asr-dial-pct">%</span>
              </div>
            </div>
            <p className="asr-dial-hint">Chance this reward lands per spin</p>
          </div>

          <div className="asr-actions">
            <button type="submit" className="asr-submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Reward →"}
            </button>
            <button type="button" className="asr-cancel" onClick={onCancel}>
              ← Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SpinnerRewards() {
  const [rewards,      setRewards]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showAddForm,  setShowAddForm]  = useState(false);  // ← toggle

  useEffect(() => { loadRewards(); }, []);

  const loadRewards = async () => {
    try {
      const data = await adminApi.getSpinnerRewards();
      setRewards(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadRewards();        // refresh table after creation
  };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="sr-wrap">

        {/* Header — title hides while the add-reward panel is open */}
        <div className="sr-header">
          {!showAddForm && (
            <div>
              <h3 className="sr-title">Spinner Rewards</h3>
              <p className="sr-subtitle">// Reward pool configuration</p>
            </div>
          )}
          <div className="sr-actions">
            <Link to="/admin/happy-hour" className="sr-btn sr-btn-ghost">← Dashboard</Link>

            {/* Toggle button — no navigation */}
            <button
              className="sr-btn sr-btn-add"
              onClick={() => setShowAddForm((v) => !v)}
            >
              {showAddForm ? "✕ Close" : "+ Add Reward"}
            </button>
          </div>
        </div>

        {/* Either the Add panel, OR the Rewards table — never both */}
        {showAddForm ? (
          <AddRewardPanel
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <div className="sr-panel">
            <div className="sr-panel-header">
              <div className="sr-panel-dot" />
              <span className="sr-panel-label">Reward Registry</span>
              {!loading && <span className="sr-count">{rewards.length} rewards</span>}
            </div>

            {loading ? (
              <div className="sr-loading">[ Loading reward pool... ]</div>
            ) : rewards.length === 0 ? (
              <div className="sr-empty">No rewards configured</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="sr-table">
                  <thead>
                    <tr>
                      <th>Reward</th>
                      <th>Type</th>
                      <th>Points</th>
                      <th>Slot</th>
                      <th>Probability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map((reward) => {
                      const tc = TYPE_CONFIG[reward.reward_type] || { label: reward.reward_type, color: "#888" };
                      return (
                        <tr key={reward.id}>
                          <td className="sr-name">{reward.reward_name}</td>
                          <td>
                            <span className="sr-type-badge" style={{ color: tc.color, borderColor: tc.color + "55", background: tc.color + "11" }}>
                              {tc.label}
                            </span>
                          </td>
                          <td className="sr-pts">{reward.reward_points || "—"}</td>
                          <td className="sr-slot">{reward.template_slot_name || "—"}</td>
                          <td>
                            <div className="sr-prob-bar">
                              <span className="sr-prob">{reward.probability}%</span>
                              <div className="sr-prob-track">
                                <div className="sr-prob-fill" style={{ width: `${Math.min(reward.probability, 100)}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}