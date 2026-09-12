import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

const neon = { cyan: "#00f5ff", pink: "#ff2d78", yellow: "#ffe600",  card: "#0d0d1a" };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  @keyframes ahs-rise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes ahs-blink { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0; } 100% { opacity: 1; } }

  .ahs-wrap { font-family: 'Share Tech Mono', monospace; background: ${neon.bg}; min-height: 100vh; padding: 2rem; }

  .ahs-title {
    font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 1.6rem;
    color: ${neon.yellow}; text-shadow: 0 0 20px ${neon.yellow}55;
    letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 0.25rem;
  }
  .ahs-subtitle { font-size: 0.65rem; letter-spacing: 0.2em; color: #3a3a5a; margin-bottom: 2rem; text-transform: uppercase; }
  .ahs-cursor { color: ${neon.yellow}88; animation: ahs-blink 1.1s step-end infinite; }

  .ahs-panel {
    background: ${neon.card};
    border: 1px solid ${neon.yellow}22;
    clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));
    padding: 0 0 2rem;
    max-width: 680px;
    box-shadow: 0 0 40px ${neon.yellow}08;
    animation: ahs-rise 0.45s ease-out;
  }

  .ahs-panel-header {
    background: linear-gradient(90deg, ${neon.yellow}11 0%, transparent 100%);
    border-bottom: 1px solid ${neon.yellow}22;
    padding: 0.75rem 1.75rem;
    display: flex; align-items: center; gap: 0.75rem; justify-content: space-between;
    margin-bottom: 1.75rem;
  }
  .ahs-panel-header-left { display: flex; align-items: center; gap: 0.75rem; }
  .ahs-panel-dot { width: 6px; height: 6px; border-radius: 50%; background: ${neon.yellow}; box-shadow: 0 0 8px ${neon.yellow}; }
  .ahs-panel-label { font-size: 0.65rem; letter-spacing: 0.25em; color: ${neon.yellow}88; text-transform: uppercase; }
  .ahs-panel-tag {
    font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.15em;
    color: ${neon.yellow}; border: 1px solid ${neon.yellow}44; padding: 0.2rem 0.5rem;
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
  }

  .ahs-body { padding: 0 1.75rem; }

  .ahs-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: end; }
  @media (max-width: 500px) { .ahs-row { grid-template-columns: 1fr; } }

  .ahs-field { margin-bottom: 1.25rem; }

  .ahs-label {
    display: block; font-family: 'Orbitron', sans-serif; font-size: 0.6rem;
    font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
    color: ${neon.yellow}88; margin-bottom: 0.5rem;
  }

  .ahs-input, .ahs-select {
    width: 100%; background: #0a0a14; border: 1px solid #1a1a3e;
    color: #c8c8e8; font-family: 'Share Tech Mono', monospace; font-size: 0.85rem;
    padding: 0.65rem 0.9rem;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .ahs-input:focus, .ahs-select:focus {
    border-color: ${neon.yellow}88;
    box-shadow: 0 0 12px ${neon.yellow}22;
    color: #fff;
  }
  .ahs-select option { background: #0d0d1a; }
  .ahs-input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.5) sepia(1) hue-rotate(180deg); cursor: pointer; }

  .ahs-day-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .ahs-day-tab {
    font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; border: 1px solid #1a1a3e;
    background: transparent; color: #3a3a6a; padding: 0.55rem 0.9rem; flex: 1; min-width: 56px;
    clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%);
    transition: all 0.15s;
  }
  .ahs-day-tab:hover { color: #8a8aaa; border-color: #2a2a5a; }
  .ahs-day-tab.active { color: ${neon.yellow}; border-color: ${neon.yellow}88; background: ${neon.yellow}11; box-shadow: 0 0 10px ${neon.yellow}22 inset; }

  .ahs-dial-row { display: flex; align-items: center; gap: 1rem; }
  .ahs-dial-slider {
    flex: 1; height: 4px; border-radius: 2px; outline: none; cursor: pointer;
    -webkit-appearance: none; -moz-appearance: none; appearance: none;
  }
  .ahs-dial-slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 15px; height: 15px; border-radius: 50%;
    background: ${neon.yellow}; box-shadow: 0 0 10px ${neon.yellow}; border: 2px solid #0a0a14; cursor: pointer;
  }
  .ahs-dial-slider::-moz-range-thumb {
    width: 15px; height: 15px; border-radius: 50%; border: 2px solid #0a0a14;
    background: ${neon.yellow}; box-shadow: 0 0 10px ${neon.yellow}; cursor: pointer;
  }
  .ahs-dial-readout {
    flex-shrink: 0; display: flex; align-items: center; gap: 0.2rem;
    background: #0a0a14; border: 1px solid ${neon.yellow}44;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    padding: 0.35rem 0.6rem;
  }
  .ahs-dial-num {
    width: 34px; background: transparent; border: none; outline: none;
    font-family: 'Orbitron', sans-serif; font-weight: 700; font-size: 0.85rem;
    color: ${neon.yellow}; text-align: right; padding: 0;
  }
  .ahs-dial-pct { font-family: 'Orbitron', sans-serif; font-size: 0.75rem; color: ${neon.yellow}88; }
  .ahs-dial-hint { font-size: 0.6rem; letter-spacing: 0.1em; color: #3a3a5a; margin-top: 0.5rem; text-transform: uppercase; }

  .ahs-divider { border: none; border-top: 1px solid #1a1a3e; margin: 0.5rem 0 1.25rem; }

  .ahs-check-wrap { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; height: 100%; }
  .ahs-checkbox {
    appearance: none; width: 18px; height: 18px; flex-shrink: 0;
    background: #0a0a14; border: 1px solid #1a1a3e;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
    cursor: pointer; position: relative; transition: border-color 0.2s;
  }
  .ahs-checkbox:checked {
    background: ${neon.yellow}22; border-color: ${neon.yellow}88;
  }
  .ahs-checkbox:checked::after {
    content: '✓'; position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%); color: ${neon.yellow}; font-size: 11px;
  }
  .ahs-check-label { font-size: 0.75rem; color: #8a8aaa; letter-spacing: 0.08em; }

  .ahs-banner {
    font-size: 0.7rem; letter-spacing: 0.05em; padding: 0.65rem 1rem; margin-bottom: 1.25rem;
    border-left: 3px solid; display: flex; align-items: center; gap: 0.5rem;
  }
  .ahs-banner.success { background: #0a1a14; border-color: #00ff8855; color: #6affc0; }
  .ahs-banner.error { background: #1a0a0e; border-color: ${neon.pink}; color: #ff8aa8; }

  .ahs-actions { display: flex; align-items: center; gap: 1.25rem; margin-top: 0.5rem; }

  .ahs-submit {
    font-family: 'Orbitron', sans-serif; font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer;
    background: ${neon.yellow}11; border: 1px solid ${neon.yellow}88; color: ${neon.yellow};
    padding: 0.75rem 2rem;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
    transition: box-shadow 0.2s, transform 0.15s;
  }
  .ahs-submit:hover:not(:disabled) { box-shadow: 0 0 20px ${neon.yellow}44; transform: translateY(-2px); }
  .ahs-submit:active:not(:disabled) { transform: translateY(0); }
  .ahs-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .ahs-cancel {
    font-family: 'Share Tech Mono', monospace; font-size: 0.7rem; letter-spacing: 0.08em;
    color: #5a5a8a; text-decoration: none; cursor: pointer; background: none; border: none;
    transition: color 0.2s;
  }
  .ahs-cancel:hover { color: #8a8aaa; }
`;

const WEEKDAYS = [
  { value: "monday", short: "MON" },
  { value: "tuesday", short: "TUE" },
  { value: "wednesday", short: "WED" },
  { value: "thursday", short: "THU" },
  { value: "friday", short: "FRI" },
];

const weekdayMap = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4 };

export default function AddHappyHourSlot() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    slot_name: "", weekday: "monday", start_time: "", end_time: "",
    probability: 10, display_order: 1, is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
      const payload = {
        ...form,
        weekday: weekdayMap[form.weekday],
        probability: Number(form.probability),
        display_order: Number(form.display_order),
      };

      await adminApi.createHappyHourSlot(payload);

      setStatus({ type: "success", message: "Slot created successfully." });
      setTimeout(() => navigate("/admin/happy-hour-slots"), 700);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.response?.data?.detail || err.message || "Failed to create slot.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="ahs-wrap">
        <h3 className="ahs-title">Add Happy Hour Slot</h3>
        <p className="ahs-subtitle">// configure new time window <span className="ahs-cursor">_</span></p>

        <div className="ahs-panel">
          <div className="ahs-panel-header">
            <div className="ahs-panel-header-left">
              <div className="ahs-panel-dot" />
              <span className="ahs-panel-label">Slot Configuration</span>
            </div>
            <span className="ahs-panel-tag">HH-01</span>
          </div>

          <form onSubmit={submit} className="ahs-body">
            {status && (
              <div className={`ahs-banner ${status.type}`}>
                <span>{status.type === "success" ? "✓" : "!"}</span>
                <span>{status.message}</span>
              </div>
            )}

            <div className="ahs-field">
              <label className="ahs-label">Slot Name</label>
              <input className="ahs-input" name="slot_name" value={form.slot_name} onChange={change} required placeholder="e.g. Monday Evening Rush" />
            </div>

            <div className="ahs-field">
              <label className="ahs-label">Weekday</label>
              <div className="ahs-day-tabs">
                {WEEKDAYS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    className={`ahs-day-tab ${form.weekday === d.value ? "active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, weekday: d.value }))}
                  >
                    {d.short}
                  </button>
                ))}
              </div>
            </div>

            <div className="ahs-row">
              <div className="ahs-field">
                <label className="ahs-label">Start Time</label>
                <input type="time" className="ahs-input" name="start_time" value={form.start_time} onChange={change} required />
              </div>
              <div className="ahs-field">
                <label className="ahs-label">End Time</label>
                <input type="time" className="ahs-input" name="end_time" value={form.end_time} onChange={change} required />
              </div>
            </div>

            <div className="ahs-field">
              <label className="ahs-label">Selection Probability</label>
              <div className="ahs-dial-row">
                <input
                  type="range"
                  name="probability"
                  min="0"
                  max="100"
                  className="ahs-dial-slider"
                  value={form.probability}
                  onChange={(e) => setProbability(e.target.value)}
                  style={{
                    background: `linear-gradient(90deg, ${neon.yellow} 0%, ${neon.yellow} ${form.probability}%, #1a1a3e ${form.probability}%, #1a1a3e 100%)`,
                  }}
                />
                <div className="ahs-dial-readout">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="ahs-dial-num"
                    value={form.probability}
                    onChange={(e) => setProbability(e.target.value)}
                  />
                  <span className="ahs-dial-pct">%</span>
                </div>
              </div>
              <p className="ahs-dial-hint">Likelihood this slot is offered to a player</p>
            </div>

            <div className="ahs-row">
              <div className="ahs-field" style={{ marginBottom: 0 }}>
                <label className="ahs-label">Display Order</label>
                <input type="number" className="ahs-input" name="display_order" value={form.display_order} onChange={change} min="1" />
              </div>
              <div className="ahs-field" style={{ marginBottom: 0 }}>
                <label className="ahs-label">Status</label>
                <label className="ahs-check-wrap">
                  <input type="checkbox" className="ahs-checkbox" name="is_active" checked={form.is_active} onChange={change} />
                  <span className="ahs-check-label">Active — available for bookings</span>
                </label>
              </div>
            </div>

            <hr className="ahs-divider" />

            <div className="ahs-actions">
              <button type="submit" className="ahs-submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create Slot →"}
              </button>
              <button type="button" className="ahs-cancel" onClick={() => navigate("/admin/happy-hour-slots")}>
                ← Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}