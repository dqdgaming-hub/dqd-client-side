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

  .pl-root {
    min-height: 100vh;
    color: ${theme.text};
    font-family: 'Inter', sans-serif;
    padding: 2rem 1.5rem;
  }
  .pl-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .pl-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, ${theme.yellow}, ${theme.pink});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .pl-title-sub {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    color: ${theme.muted};
    letter-spacing: 0.2em;
    margin-top: 0.2rem;
    text-transform: uppercase;
  }
  .pl-controls { display: flex; gap: 0.6rem; }
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
  }
  .cyber-select option { background: ${theme.card}; }
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
  }
  .cyber-btn:hover { background: ${theme.cyan}20; }

  .section-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: ${theme.muted};
    border-left: 2px solid ${theme.yellow};
    padding-left: 0.6rem;
    margin-bottom: 1.2rem;
  }

  /* ── Statement card ── */
  .statement-card {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    max-width: 640px;
    overflow: hidden;
  }
  .statement-header {
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.cyan}33;
    padding: 0.9rem 1.3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .statement-header-title {
    font-family: 'Orbitron', monospace;
    font-size: 0.8rem;
    font-weight: 700;
    color: ${theme.cyan};
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .statement-period {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    color: ${theme.muted};
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  /* ── Statement rows ── */
  .statement-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1.3rem;
    border-bottom: 1px solid ${theme.border};
    transition: background 0.15s;
  }
  .statement-row:hover { background: ${theme.surface}; }
  .statement-row:last-child { border-bottom: none; }
  .row-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${theme.muted};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .row-label .dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  }
  .row-value {
    font-family: 'Orbitron', monospace;
    font-size: 1rem;
    font-weight: 700;
  }
  .row-value.income  { color: ${theme.green}; }
  .row-value.expense { color: ${theme.pink}; }
  .row-value.neutral { color: ${theme.text}; }

  /* ── Highlighted rows ── */
  .statement-row.highlight-profit {
    background: ${theme.green}0d;
    border-top: 1px solid ${theme.green}33;
    border-bottom: 1px solid ${theme.green}33;
  }
  .statement-row.highlight-loss {
    background: ${theme.pink}0d;
    border-top: 1px solid ${theme.pink}33;
    border-bottom: 1px solid ${theme.pink}33;
  }
  .statement-row.highlight-net {
    background: ${theme.cyan}0a;
    border-top: 1px solid ${theme.cyan}33;
    border-bottom: 1px solid ${theme.cyan}33;
  }
  .row-value.profit  { color: ${theme.green}; font-size: 1.3rem; }
  .row-value.loss    { color: ${theme.pink};  font-size: 1.3rem; }

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    color: ${theme.cyan};
  }

  @media (max-width: 640px) {
    .pl-header { flex-direction: column; align-items: flex-start; }
    .statement-card { max-width: 100%; }
  }
`;

const fmt = (v) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ROWS = [
  { key: "gross_income", label: "Gross Income",  dot: "#39ff14", valueClass: "income",  prefix: "+ INR " },
  { key: "discount",     label: "Discounts",      dot: "#ff006e", valueClass: "expense", prefix: "- INR " },
  { key: "expenses",     label: "Expenses",       dot: "#ff006e", valueClass: "expense", prefix: "- INR " },
  { key: "net_revenue",  label: "Net Revenue",    dot: "#00f5ff", valueClass: "neutral", prefix: "INR ", highlight: "highlight-net" },
];

export default function ProfitLoss() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [report, setReport] = useState({ gross_income: 0, discount: 0, expenses: 0, net_revenue: 0, profit: 0, loss: 0 });

  useEffect(() => { loadReport(); }, [period]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getProfitLoss({ period });
      setReport(res.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="pl-root">

        <div className="pl-header">
          <div>
            <div className="pl-title">Profit & Loss</div>
            <div className="pl-title-sub">Financial Statement · DQD Gaming</div>
          </div>
          <div className="pl-controls">
            <select className="cyber-select" value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
            <button className="cyber-btn" onClick={loadReport}>⟳ REFRESH</button>
          </div>
        </div>

        <div className="section-label">Statement</div>

        {loading ? (
          <div className="loading-state">LOADING REPORT…</div>
        ) : (
          <div className="statement-card">
            <div className="statement-header">
              <div className="statement-header-title">⚖ P&L Statement</div>
              <div className="statement-period">{period} period</div>
            </div>

            {ROWS.map(({ key, label, dot, valueClass, prefix, highlight }) => (
              <div key={key} className={`statement-row ${highlight || ""}`}>
                <div className="row-label">
                  <span className="dot" style={{ background: dot }} />
                  {label}
                </div>
                <div className={`row-value ${valueClass}`}>{prefix}{fmt(report[key])}</div>
              </div>
            ))}

            {Number(report.profit) > 0 && (
              <div className="statement-row highlight-profit">
                <div className="row-label">
                  <span className="dot" style={{ background: theme.green }} />
                  Net Profit
                </div>
                <div className="row-value profit">▲ INR {fmt(report.profit)}</div>
              </div>
            )}

            {Number(report.loss) > 0 && (
              <div className="statement-row highlight-loss">
                <div className="row-label">
                  <span className="dot" style={{ background: theme.pink }} />
                  Net Loss
                </div>
                <div className="row-value loss">▼ INR {fmt(report.loss)}</div>
              </div>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}