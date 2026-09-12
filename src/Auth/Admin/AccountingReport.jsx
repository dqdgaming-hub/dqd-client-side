import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

const theme = {
  bg: "#0a0a0f", surface: "#0d0d1a", card: "#111122", border: "#1a1a2e",
  cyan: "#00f5ff", pink: "#ff006e", yellow: "#ffd60a", green: "#39ff14",
  purple: "#7b2fff", text: "#e0e0ff", muted: "#6b7280",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500&display=swap');

  .report-root {
    min-height: 100vh;
    color: ${theme.text};
    font-family: 'Inter', sans-serif;
    padding: 2rem 1.5rem;
  }
  .report-header {
    margin-bottom: 2rem;
  }
  .report-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, ${theme.pink}, ${theme.purple});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .report-title-sub {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    color: ${theme.muted};
    letter-spacing: 0.2em;
    margin-top: 0.2rem;
    text-transform: uppercase;
  }

  .section-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: ${theme.muted};
    border-left: 2px solid ${theme.pink};
    padding-left: 0.6rem;
    margin-bottom: 1rem;
  }

  /* ── Filter panel ── */
  .filter-panel {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    padding: 1.4rem;
    margin-bottom: 2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-end;
  }
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .filter-group label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: ${theme.muted};
  }
  .cyber-select {
    background: ${theme.surface};
    color: ${theme.cyan};
    border: 1px solid ${theme.cyan}44;
    padding: 0.45rem 0.9rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.8rem;
    cursor: pointer;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    outline: none;
    min-width: 150px;
  }
  .cyber-select option { background: ${theme.card}; }
  .cyber-input {
    background: ${theme.surface};
    color: ${theme.text};
    border: 1px solid ${theme.border};
    padding: 0.45rem 0.9rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.78rem;
    outline: none;
    transition: border-color 0.2s;
    min-width: 140px;
  }
  .cyber-input:focus { border-color: ${theme.cyan}66; }
  .cyber-btn {
    background: transparent;
    border: 1px solid ${theme.cyan};
    color: ${theme.cyan};
    padding: 0.45rem 1.2rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    cursor: pointer;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: background 0.2s;
    white-space: nowrap;
  }
  .cyber-btn:hover { background: ${theme.cyan}20; }
  .cyber-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Summary mini-cards ── */
  .summary-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .summary-mini {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    padding: 1rem 1.1rem;
    clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
    position: relative;
  }
  .summary-mini::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .sm-green::before  { background: ${theme.green};  }
  .sm-cyan::before   { background: ${theme.cyan};   }
  .sm-yellow::before { background: ${theme.yellow}; }
  .sm-pink::before   { background: ${theme.pink};   }
  .sm-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 0.35rem;
  }
  .sm-green  .sm-label { color: ${theme.green};  }
  .sm-cyan   .sm-label { color: ${theme.cyan};   }
  .sm-yellow .sm-label { color: ${theme.yellow}; }
  .sm-pink   .sm-label { color: ${theme.pink};   }
  .sm-value {
    font-family: 'Orbitron', monospace;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${theme.text};
  }

  /* ── Export tiles ── */
  .export-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  .export-tile {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    padding: 1.5rem 1.3rem;
    cursor: pointer;
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    transition: transform 0.2s, border-color 0.2s, background 0.2s;
  }
  .export-tile:hover { transform: translateY(-3px); background: ${theme.surface}; }
  .export-tile:disabled, .export-tile[data-disabled="true"] { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
  .export-tile.et-red    { border-color: ${theme.pink}33;   }
  .export-tile.et-green  { border-color: ${theme.green}33;  }
  .export-tile.et-blue   { border-color: ${theme.cyan}33;   }
  .export-tile.et-red:hover   { border-color: ${theme.pink};   }
  .export-tile.et-green:hover { border-color: ${theme.green};  }
  .export-tile.et-blue:hover  { border-color: ${theme.cyan};   }
  .export-tile-icon { font-size: 1.8rem; line-height: 1; }
  .export-tile-label {
    font-family: 'Orbitron', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .et-red   .export-tile-label { color: ${theme.pink};  }
  .et-green .export-tile-label { color: ${theme.green}; }
  .et-blue  .export-tile-label { color: ${theme.cyan};  }
  .export-tile-desc {
    font-size: 0.7rem;
    color: ${theme.muted};
    font-family: 'Share Tech Mono', monospace;
  }

  @media (max-width: 640px) {
    .filter-panel { flex-direction: column; align-items: stretch; }
    .export-grid { grid-template-columns: 1fr 1fr; }
  }
`;

export default function AccountingReport() {
  const [period, setPeriod]     = useState("monthly");
  const [startDate, setStart]   = useState("");
  const [endDate, setEnd]       = useState("");
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { if (period !== "custom") loadSummary(); }, [period]);

  const params = () =>
    period === "custom"
      ? { period, start_date: startDate, end_date: endDate }
      : { period };

  const loadSummary = async () => {
    try {
      const res = await adminApi.getAccountingDashboard(params());
      setSummary(res?.data?.summary || res?.summary || null);
    } catch (err) { console.error(err); }
  };

  const downloadBlob = (data, filename) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
  };

  const downloadPDF = async () => {
    try {
      setLoading(true);
      const blob =
    await adminApi.exportAccountingPDF(params());

downloadBlob(blob, "Accounting_Report.pdf");
    } catch (err) { alert("Unable to download PDF"); }
    finally { setLoading(false); }
  };

  const downloadExcel = async () => {
    try {
      setLoading(true);
      const blob =
    await adminApi.exportAccountingExcel(params());

downloadBlob(blob, "Accounting_Report.xlsx");
    } catch (err) { alert("Unable to download Excel"); }
    finally { setLoading(false); }
  };

  const syncGoogle = async () => {
    try {
        setLoading(true);

        const res = await adminApi.syncAccountingGoogleSheet();

        console.log("Response:", res);

        alert("Google Sheet updated successfully.");

    } catch (err) {
        console.log(err);
        console.log(err.response);

        alert(
            err.response?.data?.message ||
            err.message ||
            "Google Sheet sync failed."
        );
    } finally {
        setLoading(false);
    }
};

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="report-root">

        <div className="report-header">
          <div className="report-title">Accounting Reports</div>
          <div className="report-title-sub">Export & Analysis · DQD Gaming</div>
        </div>

        {/* Filter panel */}
        <div className="section-label">Parameters</div>
        <div className="filter-panel">
          <div className="filter-group">
            <label>Period</label>
            <select className="cyber-select" value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {period === "custom" && (
            <>
              <div className="filter-group">
                <label>Start Date</label>
                <input type="date" className="cyber-input" value={startDate} onChange={e => setStart(e.target.value)} />
              </div>
              <div className="filter-group">
                <label>End Date</label>
                <input type="date" className="cyber-input" value={endDate} onChange={e => setEnd(e.target.value)} />
              </div>
            </>
          )}
          <button className="cyber-btn" onClick={loadSummary}>LOAD</button>
        </div>

        {/* Summary */}
        {summary && (
          <>
            <div className="section-label">Overview</div>
            <div className="summary-row">
              <div className="summary-mini sm-green">
                <div className="sm-label">Net Revenue</div>
                <div className="sm-value">INR {Number(summary.net_revenue || 0).toLocaleString()}</div>
              </div>
              <div className="summary-mini sm-cyan">
                <div className="sm-label">Received</div>
                <div className="sm-value">INR {Number(summary.amount_received || 0).toLocaleString()}</div>
              </div>
              <div className="summary-mini sm-yellow">
                <div className="sm-label">Pending</div>
                <div className="sm-value">INR {Number(summary.pending_payment || 0).toLocaleString()}</div>
              </div>
              <div className="summary-mini sm-pink">
                <div className="sm-label">Discounts</div>
                <div className="sm-value">INR {Number(summary.discount || 0).toLocaleString()}</div>
              </div>
            </div>
          </>
        )}

        {/* Export tiles */}
        <div className="section-label">Export</div>
        <div className="export-grid">
          <div className="export-tile et-red" data-disabled={loading} onClick={downloadPDF}>
            <div className="export-tile-icon">📄</div>
            <div className="export-tile-label">Download PDF</div>
            <div className="export-tile-desc">Full accounting report as PDF</div>
          </div>
          <div className="export-tile et-green" data-disabled={loading} onClick={downloadExcel}>
            <div className="export-tile-icon">📊</div>
            <div className="export-tile-label">Download Excel</div>
            <div className="export-tile-desc">Spreadsheet with all transactions</div>
          </div>
          <div className="export-tile et-blue" data-disabled={loading} onClick={syncGoogle}>
            <div className="export-tile-icon">☁</div>
            <div className="export-tile-label">Sync Google Sheets</div>
            <div className="export-tile-desc">Push live data to Google Sheets</div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

