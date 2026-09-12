import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

const theme = {
  bg: "#0a0a0f",
  surface: "#0d0d1a",
  card: "#111122",
  border: "#1a1a2e",
  cyan: "#00f5ff",
  pink: "#ff006e",
  yellow: "#ffd60a",
  green: "#39ff14",
  purple: "#7b2fff",
  text: "#e0e0ff",
  muted: "#6b7280",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500&display=swap');

  .ledger-root {
    min-height: 100vh;
    color: ${theme.text};
    font-family: 'Inter', sans-serif;
    padding: 2rem 1.5rem;
  }
  .ledger-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .ledger-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, ${theme.green}, ${theme.cyan});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .ledger-title-sub {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    color: ${theme.muted};
    letter-spacing: 0.2em;
    margin-top: 0.2rem;
    text-transform: uppercase;
  }
  .ledger-controls {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
  }
  .cyber-input {
    background: ${theme.surface};
    color: ${theme.text};
    border: 1px solid ${theme.border};
    padding: 0.45rem 0.9rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.78rem;
    min-width: 180px;
    outline: none;
    transition: border-color 0.2s;
  }
  .cyber-input::placeholder { color: ${theme.muted}; }
  .cyber-input:focus { border-color: ${theme.cyan}66; }
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

  /* ── Summary strip ── */
  .summary-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.8rem;
  }
  .strip-card {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    padding: 1.1rem 1.2rem;
    clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
    position: relative;
  }
  .strip-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .strip-card.sc-green::before { background: ${theme.green}; }
  .strip-card.sc-pink::before  { background: ${theme.pink};  }
  .strip-card.sc-cyan::before  { background: ${theme.cyan};  }
  .strip-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 0.3rem;
  }
  .sc-green .strip-label { color: ${theme.green}; }
  .sc-pink  .strip-label { color: ${theme.pink};  }
  .sc-cyan  .strip-label { color: ${theme.cyan};  }
  .strip-value {
    font-family: 'Orbitron', monospace;
    font-size: 1.3rem;
    font-weight: 700;
    color: ${theme.text};
  }

  /* ── Table ── */
  .table-wrap {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    overflow-x: auto;
  }
  .ledger-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
  }
  .ledger-table thead tr {
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.cyan}33;
  }
  .ledger-table th {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${theme.cyan};
    padding: 0.85rem 0.9rem;
    white-space: nowrap;
    font-weight: 400;
    text-align: left;
  }
  .ledger-table td {
    padding: 0.75rem 0.9rem;
    color: ${theme.text};
    border-bottom: 1px solid ${theme.border};
    white-space: nowrap;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.75rem;
  }
  .ledger-table tbody tr:hover { background: ${theme.surface}; }
  .ledger-table tbody tr:last-child td { border-bottom: none; }
  .td-discount { color: ${theme.pink}; }
  .td-paid { color: ${theme.green}; }
  .td-empty {
    text-align: center;
    color: ${theme.muted};
    padding: 2rem !important;
    letter-spacing: 0.15em;
  }

  /* ── Badges ── */
  .badge {
    display: inline-block;
    padding: 0.22rem 0.7rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
  }
  .badge-paid      { background: ${theme.green}22; color: ${theme.green}; border: 1px solid ${theme.green}44; }
  .badge-pending   { background: ${theme.yellow}22; color: ${theme.yellow}; border: 1px solid ${theme.yellow}44; }
  .badge-completed { background: ${theme.cyan}22; color: ${theme.cyan}; border: 1px solid ${theme.cyan}44; }
  .badge-cancelled { background: ${theme.pink}22; color: ${theme.pink}; border: 1px solid ${theme.pink}44; }
  .badge-default   { background: ${theme.purple}22; color: ${theme.purple}; border: 1px solid ${theme.purple}44; }

  .section-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: ${theme.muted};
    border-left: 2px solid ${theme.green};
    padding-left: 0.6rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 640px) {
    .summary-strip { grid-template-columns: 1fr; }
    .ledger-header { flex-direction: column; }
  }
`;

const paymentBadge = (s) => {
  if (s === "paid") return "badge badge-paid";
  return "badge badge-pending";
};
const statusBadge = (s) => {
  if (s === "completed") return "badge badge-completed";
  if (s === "cancelled") return "badge badge-cancelled";
  return "badge badge-default";
};

// Normalizes whatever shape the API hands back into a plain array.
// Handles: a raw array, { data: [...] }, and paginated DRF { results: [...] }.
const extractBookingsList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.results)) return res.results;
  return [];
};

export default function AccountingBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [search, setSearch] = useState("");

  useEffect(() => { loadBookings(); }, [period]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAccountingBookings({ period });
      setBookings(extractBookingsList(res));
    } catch (err) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter((b) =>
    `${b.booking_id} ${b.customer} ${b.game}`.toLowerCase().includes(search.toLowerCase())
  );
  // "paid" isn't reliably populated by the backend (see note above), so revenue is
  // derived from total/subtotal/discount — the values that are consistently present.
  const totalRevenue = filtered.reduce((s, b) => {
    const total = b.total != null ? Number(b.total) : Number(b.subtotal || 0) - Number(b.discount || 0);
    return s + total;
  }, 0);
  const totalDiscount = filtered.reduce((s, b) => s + Number(b.discount || 0), 0);

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="ledger-root">

        <div className="ledger-header">
          <div>
            <div className="ledger-title">Booking Ledger</div>
            <div className="ledger-title-sub">Transaction Records · {period}</div>
          </div>
          <div className="ledger-controls">
            <input className="cyber-input" placeholder="Search ID / Customer / Game…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="cyber-select" value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
            <button className="cyber-btn" onClick={loadBookings}>⟳ REFRESH</button>
          </div>
        </div>

        <div className="section-label">Summary</div>
        <div className="summary-strip">
          <div className="strip-card sc-green">
            <div className="strip-label">Total Revenue</div>
            <div className="strip-value">INR {totalRevenue.toFixed(2)}</div>
          </div>
          <div className="strip-card sc-pink">
            <div className="strip-label">Total Discount</div>
            <div className="strip-value">INR {totalDiscount.toFixed(2)}</div>
          </div>
          <div className="strip-card sc-cyan">
            <div className="strip-label">Bookings</div>
            <div className="strip-value">{filtered.length}</div>
          </div>
        </div>

        <div className="section-label">Transactions</div>
        <div className="table-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Game</th>
                <th>Hrs</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="td-empty" colSpan="11">LOADING DATA…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td className="td-empty" colSpan="11">NO BOOKINGS FOUND</td></tr>
              )}
              {!loading && filtered.map(b => (
                <tr key={b.booking_id}>
                  <td style={{ color: theme.cyan }}>{b.booking_id}</td>
                  <td>{b.booking_date}</td>
                  <td>{b.customer}</td>
                  <td>{b.game}</td>
                  <td>{b.hours}</td>
                  <td>{b.subtotal}</td>
                  <td className="td-discount">{b.discount}</td>
                  <td>{b.total}</td>
                  <td className="td-paid">{b.paid}</td>
                  <td><span className={paymentBadge(b.payment_status)}>{b.payment_status}</span></td>
                  <td><span className={statusBadge(b.booking_status)}>{b.booking_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
}