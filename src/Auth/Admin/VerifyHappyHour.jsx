import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

const neon = { cyan: "#00f5ff", pink: "#ff2d78", yellow: "#ffe600", green: "#00ff88",  card: "#0d0d1a" };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  .vh-wrap { font-family: 'Share Tech Mono', monospace; background: ${neon.bg}; min-height: 100vh; padding: 2rem; }
  .vh-title {
    font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 1.6rem;
    color: ${neon.green}; text-shadow: 0 0 20px ${neon.green}55;
    letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 0.25rem;
  }
  .vh-subtitle { font-size: 0.65rem; letter-spacing: 0.2em; color: #3a3a5a; margin-bottom: 2rem; text-transform: uppercase; }

  .vh-panel {
    background: ${neon.card}; border: 1px solid #1a1a3e;
    clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));
    max-width: 560px; padding: 0;
  }
  .vh-panel-header {
    background: linear-gradient(90deg, ${neon.green}11 0%, transparent 100%);
    border-bottom: 1px solid ${neon.green}22;
    padding: 0.75rem 1.75rem; display: flex; align-items: center; gap: 0.75rem;
    margin-bottom: 1.75rem;
  }
  .vh-panel-dot { width: 6px; height: 6px; border-radius: 50%; background: ${neon.green}; box-shadow: 0 0 8px ${neon.green}; }
  .vh-panel-label { font-size: 0.65rem; letter-spacing: 0.25em; color: ${neon.green}88; text-transform: uppercase; }

  .vh-body { padding: 0 1.75rem 2rem; }

  .vh-input-row { display: flex; gap: 0.75rem; align-items: flex-end; }
  .vh-field { flex: 1; }
  .vh-label {
    display: block; font-family: 'Orbitron', sans-serif; font-size: 0.6rem;
    font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
    color: ${neon.green}88; margin-bottom: 0.5rem;
  }
  .vh-input {
    width: 100%; background: #0a0a14; border: 1px solid #1a1a3e;
    color: #c8c8e8; font-family: 'Share Tech Mono', monospace; font-size: 0.85rem;
    padding: 0.65rem 0.9rem;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
  }
  .vh-input:focus { border-color: ${neon.green}88; box-shadow: 0 0 12px ${neon.green}22; color: #fff; }

  .vh-btn {
    font-family: 'Orbitron', sans-serif; font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; white-space: nowrap;
    background: ${neon.green}11; border: 1px solid ${neon.green}88; color: ${neon.green};
    padding: 0.65rem 1.25rem;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    transition: box-shadow 0.2s, transform 0.15s; flex-shrink: 0;
  }
  .vh-btn:hover { box-shadow: 0 0 16px ${neon.green}44; transform: translateY(-2px); }
  .vh-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .vh-result { margin-top: 1.5rem; }
  .vh-result-panel {
    border: 1px solid;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
    padding: 1.25rem 1.5rem;
  }
  .vh-result-valid { border-color: ${neon.green}55; background: ${neon.green}08; }
  .vh-result-invalid { border-color: ${neon.pink}55; background: ${neon.pink}08; }

  .vh-result-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
  .vh-result-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .vh-result-title {
    font-family: 'Orbitron', sans-serif; font-size: 0.75rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
  }

  .vh-result-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.78rem; }
  .vh-result-key { color: #4a4a6a; min-width: 80px; text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.1em; padding-top: 2px; }
  .vh-result-val { color: #c8c8e8; }

  .vh-err-msg { font-size: 0.8rem; color: ${neon.pink}; }
`;

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="2,2 17,2 20,5 20,20 5,20 2,17" fill={`${neon.green}11`} stroke={neon.green} strokeWidth="1.2" opacity="0.85" />
    <path
      d="M6 11.5L9.5 15L16 7.5"
      stroke={neon.green}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: `drop-shadow(0 0 4px ${neon.green})` }}
    />
  </svg>
);

const CrossIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="2,2 17,2 20,5 20,20 5,20 2,17" fill={`${neon.pink}11`} stroke={neon.pink} strokeWidth="1.2" opacity="0.85" />
    <path
      d="M7 7L15 15M15 7L7 15"
      stroke={neon.pink}
      strokeWidth="2"
      strokeLinecap="round"
      style={{ filter: `drop-shadow(0 0 4px ${neon.pink})` }}
    />
  </svg>
);

export default function VerifyHappyHour() {
  const [slotId, setSlotId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (!slotId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await adminApi.verifyHappyHour({ slot_id: slotId });
      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="vh-wrap">
        <h3 className="vh-title">Verify Happy Hour</h3>
        <p className="vh-subtitle">// Session validation terminal</p>

        <div className="vh-panel">
          <div className="vh-panel-header">
            <div className="vh-panel-dot" />
            <span className="vh-panel-label">Slot Verification</span>
          </div>
          <div className="vh-body">
            <div className="vh-input-row">
              <div className="vh-field">
                <label className="vh-label">Slot ID</label>
                <input
                  className="vh-input"
                  placeholder="Enter slot ID to verify"
                  value={slotId}
                  onChange={(e) => setSlotId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && verify()}
                />
              </div>
              <button className="vh-btn" onClick={verify} disabled={loading}>
                {loading ? "···" : "Verify →"}
              </button>
            </div>

            {result && (
              <div className="vh-result">
                {result.valid ? (
                  <div className="vh-result-panel vh-result-valid">
                    <div className="vh-result-header">
                      <span className="vh-result-icon"><CheckIcon /></span>
                      <span className="vh-result-title" style={{ color: neon.green }}>Valid Happy Hour Session</span>
                    </div>
                    <div className="vh-result-row">
                      <span className="vh-result-key">User</span>
                      <span className="vh-result-val">{result.user}</span>
                    </div>
                    <div className="vh-result-row">
                      <span className="vh-result-key">Slot</span>
                      <span className="vh-result-val">{result.slot}</span>
                    </div>
                  </div>
                ) : (
                  <div className="vh-result-panel vh-result-invalid">
                    <div className="vh-result-header">
                      <span className="vh-result-icon"><CrossIcon /></span>
                      <span className="vh-result-title" style={{ color: neon.pink }}>Verification Failed</span>
                    </div>
                    <p className="vh-err-msg">{result.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}