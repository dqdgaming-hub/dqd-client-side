import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const theme = {
  bg: "#0a0a0f", surface: "#0d0d1a", card: "#111122", border: "#1a1a2e",
  cyan: "#00f5ff", pink: "#ff006e", yellow: "#ffd60a", green: "#39ff14",
  purple: "#7b2fff", text: "#e0e0ff", muted: "#6b7280",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500&display=swap');

  .chart-root {
    min-height: 100vh;
    color: ${theme.text};
    font-family: 'Inter', sans-serif;
    padding: 2rem 1.5rem;
  }
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .chart-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, ${theme.cyan}, ${theme.green});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .chart-title-sub {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    color: ${theme.muted};
    letter-spacing: 0.2em;
    margin-top: 0.2rem;
    text-transform: uppercase;
  }
  .chart-controls { display: flex; gap: 0.6rem; }
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
    border-left: 2px solid ${theme.cyan};
    padding-left: 0.6rem;
    margin-bottom: 1rem;
  }

  /* ── Legend strip ── */
  .legend-strip {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.2rem;
    flex-wrap: wrap;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${theme.muted};
  }
  .legend-dot {
    width: 10px; height: 3px; border-radius: 2px;
  }

  /* ── Chart card ── */
  .chart-card {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    padding: 1.5rem 1.2rem 1rem;
  }
  .loading-state {
    height: 460px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    color: ${theme.cyan};
  }

  @media (max-width: 640px) {
    .chart-header { flex-direction: column; align-items: flex-start; }
  }
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: theme.surface,
      border: `1px solid ${theme.cyan}55`,
      padding: "0.8rem 1.1rem",
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: "0.75rem",
      color: theme.text,
    }}>
      <div style={{ color: theme.cyan, marginBottom: "0.5rem", letterSpacing: "0.12em" }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.stroke, marginBottom: "0.2rem" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
};

export default function RevenueChart() {
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => { loadChart(); }, [period]);

  const loadChart = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getRevenueChart({
    period,
    start_date: startDate,
    end_date: endDate,
});
      const formatted = (res.data || []).map(item => ({
    ...item,
    label: item.label
        ? new Date(item.label).toLocaleDateString()
        : "",
    revenue: Number(item.revenue || 0),
    discount: Number(item.discount || 0),
    bookings: Number(item.bookings || 0),
}));

setChartData(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="chart-root">

        <div className="chart-header">
          <div>
            <div className="chart-title">Revenue Analytics</div>
            <div className="chart-title-sub">Trends over time · DQD Gaming</div>
          </div>
          <div className="chart-controls">
            <select className="cyber-select" value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
            <button className="cyber-btn" onClick={loadChart}>⟳ REFRESH</button>
          </div>
        </div>

        <div className="section-label">Line Chart</div>

        <div className="legend-strip">
          <div className="legend-item"><div className="legend-dot" style={{ background: theme.cyan }} />Revenue</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: theme.purple }} />Bookings</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: theme.pink }} />Discount</div>
        </div>

        <div className="chart-card">
          {loading ? (
            <div className="loading-state">LOADING DATA…</div>
          ) : (
            <ResponsiveContainer width="100%" height={460}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="label" tick={{ fill: theme.muted, fontFamily: "'Share Tech Mono', monospace", fontSize: 11 }} axisLine={{ stroke: theme.border }} tickLine={false} />
                <YAxis tick={{ fill: theme.muted, fontFamily: "'Share Tech Mono', monospace", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ display: "none" }} />
                <Line type="monotone" dataKey="revenue" stroke={theme.cyan} strokeWidth={2.5} dot={{ fill: theme.cyan, r: 3, strokeWidth: 0 }} activeDot={{ r: 6, fill: theme.cyan }} name="Revenue" />
                <Line type="monotone" dataKey="bookings" stroke={theme.purple} strokeWidth={2.5} dot={{ fill: theme.purple, r: 3, strokeWidth: 0 }} activeDot={{ r: 6, fill: theme.purple }} name="Bookings" />
                <Line type="monotone" dataKey="discount" stroke={theme.pink} strokeWidth={2} dot={{ fill: theme.pink, r: 3, strokeWidth: 0 }} activeDot={{ r: 6, fill: theme.pink }} name="Discount" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}