import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { adminApi } from "../api/adminapi";
import AdminLayout from "./AdminLayout";
import { bookingCss, StatusBadge, TypeChip, HappyHourCell, SkeletonRows, EmptyState } from "./bookingTheme.jsx";

const PAGE_SIZE = 15;

// ── tab definitions ──────────────────────────────────────
const TABS = [
  { key: "all",   label: "All Bookings",   color: "cyan"   },
  { key: "game",  label: "Game Items",     color: "cyan"   },
  { key: "combo", label: "Combo Packs",    color: "yellow" },
];

function deriveStats(bookings) {
  return {
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    revenue:   bookings
      .filter((b) => b.payment_status === "paid")
      .reduce((s, b) => s + parseFloat(b.price_paid || 0), 0),
  };
}

export default function Bookings() {
  const navigate = useNavigate();
  const location = useLocation();

  // derive initial tab from URL hash if present
  const initTab = location.hash === "#combo" ? "combo" : location.hash === "#game" ? "game" : "all";

  const [tab,       setTab]       = useState(initTab);
  const [allData,   setAllData]   = useState([]);
  const [gameData,  setGameData]  = useState([]);
  const [comboData, setComboData] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [statusFilter, setStatus] = useState("");
  const [payFilter,    setPay]    = useState("");
  const [page,      setPage]      = useState(1);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [all, game, combo] = await Promise.all([
  adminApi.getgameBookings().catch(() => []),   // /auth/admin/game-bookings/
  adminApi.getGameBookings().catch(() => []),   // /auth/admin/bookings/game-items/
  adminApi.getComboBookings().catch(() => []),  // /auth/admin/bookings/combo-packs/
]);
      setAllData(all  || []);
      setGameData(game  || []);
      setComboData(combo || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id, e) {
    e.stopPropagation();
    try {
      await adminApi.approveBooking(id);
      loadAll();
    } catch (err) { alert(err.message); }
  }

  async function handleReject(id, e) {
    e.stopPropagation();
    if (!confirm("Reject this booking?")) return;
    try {
      await adminApi.rejectBooking(id);
      loadAll();
    } catch (err) { alert(err.message); }
  }

  const rawBookings = tab === "game" ? gameData : tab === "combo" ? comboData : allData;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rawBookings.filter((b) => {
      const matchSearch = !q ||
        (b.booking_id  || "").toLowerCase().includes(q) ||
        (b.customer_name || "").toLowerCase().includes(q) ||
        (b.item_name   || "").toLowerCase().includes(q) ||
        (b.combo_name  || "").toLowerCase().includes(q);
      const matchStatus = !statusFilter || b.status === statusFilter;
      const matchPay    = !payFilter    || b.payment_status === payFilter;
      return matchSearch && matchStatus && matchPay;
    });
  }, [rawBookings, search, statusFilter, payFilter]);

  const stats     = useMemo(() => deriveStats(allData), [allData]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged     = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function switchTab(key) {
    setTab(key);
    setPage(1);
    setSearch("");
    setStatus("");
    setPay("");
  }

  const currency = (v) => v != null ? `INR ${parseFloat(v).toFixed(2)}` : "—";

  const colCount = tab === "combo" ? 9 : 10;

  return (
    <>
      <style>{bookingCss}</style>
      <div className="bk-pg">
        <AdminLayout>

          {/* ── Hero ── */}
          <section className="bk-hero">
            <div>
              <p className="bk-kicker">DQD Gaming · Operations</p>
              <h1 className="bk-h1">Booking <span>Management</span></h1>
              <p className="bk-hero-sub">Manage all game-item, combo-pack, and walk-in bookings</p>
            </div>
            <div className="bk-hero-actions">
              <button
                className="bk-btn-ghost"
                onClick={() => navigate("/admin/bookings/verify")}
              >
                ⬡ Scan QR
              </button>
              <button
                className="bk-btn-primary"
                onClick={() => navigate("/admin/bookings/add")}
              >
                + New Booking
              </button>
            </div>
          </section>

          {/* ── Stats ── */}
          <div className="bk-stats">
            <div className="bk-stat cyan">
              <div className="bk-stat-val">{loading ? "—" : stats.total}</div>
              <div className="bk-stat-label">Total Bookings</div>
            </div>
            <div className="bk-stat yellow">
              <div className="bk-stat-val">{loading ? "—" : stats.pending}</div>
              <div className="bk-stat-label">Awaiting Approval</div>
            </div>
            <div className="bk-stat" style={{ "--color": "var(--bk-cyan)" }}>
              <div className="bk-stat-val" style={{ color: "#00ff64" }}>{loading ? "—" : stats.confirmed}</div>
              <div className="bk-stat-label">Confirmed</div>
            </div>
            <div className="bk-stat pink">
              <div className="bk-stat-val">
                {loading ? "—" : `INR ${stats.revenue.toFixed(0)}`}
              </div>
              <div className="bk-stat-label">Revenue (Paid)</div>
            </div>
          </div>

          {/* ── Segment tabs ── */}
          <div className="bk-seg">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`bk-seg-btn ${t.color} ${tab === t.key ? "active" : ""}`}
                onClick={() => switchTab(t.key)}
              >
                {t.label}
                <span className="bk-seg-count">
                  {t.key === "all"   ? allData.length
                  : t.key === "game"  ? gameData.length
                  : comboData.length}
                </span>
              </button>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className="bk-toolbar">
            <div className="bk-search-wrap">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" /></svg>
              <input
                className="bk-search"
                placeholder="Search ID, customer, item…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="bk-filter-select"
              value={statusFilter}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="bk-filter-select"
              value={payFilter}
              onChange={(e) => { setPay(e.target.value); setPage(1); }}
            >
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* ── Table ── */}
          <div className="bk-table-wrap">
            <table className="bk-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  {tab === "all" && <th>Type</th>}
                  <th>{tab === "combo" ? "Combo Pack" : "Game Item"}</th>
                  <th>Date</th>
                  {tab !== "combo" && <th>Time Slot</th>}
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Happy Hr</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows count={6} cols={colCount} />
                ) : paged.length === 0 ? (
                  <EmptyState
                    icon="📋"
                    msg={search ? "No bookings match your search" : "No bookings yet"}
                  />
                ) : paged.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => navigate(`/admin/bookings/${b.id}`)}
                  >
                    <td><span className="bk-id">{b.booking_id}</span></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.customer_name}</div>
                      {b.customer_email && (
                        <div style={{ fontSize: "0.65rem", color: "var(--bk-muted)" }}>{b.customer_email}</div>
                      )}
                    </td>
                    {tab === "all" && (
                      <td><TypeChip type={b.booking_type} /></td>
                    )}
                    <td>{b.combo_name || b.item_name || "—"}</td>
                    <td style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.68rem" }}>
                      {b.booking_date || "—"}
                    </td>
                    {tab !== "combo" && (
                      <td style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.65rem", color: "var(--bk-muted)" }}>
                        {b.start_time && b.end_time ? `${b.start_time} – ${b.end_time}` : "—"}
                      </td>
                    )}
                    <td><StatusBadge status={b.status} /></td>
                    <td><StatusBadge status={b.payment_status} /></td>
                    <td><HappyHourCell val={b.is_happy_hour} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="bk-row-actions">
                        <button
                          className="bk-btn-primary bk-btn-sm"
                          onClick={() => navigate(`/admin/bookings/${b.id}`)}
                        >
                          View
                        </button>
                        {b.status === "pending" && (
                          <>
                            <button
                              className="bk-btn-success bk-btn-sm"
                              onClick={(e) => handleApprove(b.id, e)}
                            >
                              ✓
                            </button>
                            <button
                              className="bk-btn-danger bk-btn-sm"
                              onClick={(e) => handleReject(b.id, e)}
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {!loading && filtered.length > PAGE_SIZE && (
              <div className="bk-pagination">
                <span>
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
                  {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="bk-page-btns">
                  <button
                    className="bk-page-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >‹</button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span key={`gap-${p}`} style={{ color: "var(--bk-muted)", padding: "0 4px", fontSize: "0.6rem", alignSelf: "center" }}>…</span>
                        )}
                        <button
                          key={p}
                          className={`bk-page-btn ${page === p ? "active" : ""}`}
                          onClick={() => setPage(p)}
                        >{p}</button>
                      </>
                    ))}
                  <button
                    className="bk-page-btn"
                    disabled={page === pageCount}
                    onClick={() => setPage((p) => p + 1)}
                  >›</button>
                </div>
              </div>
            )}
          </div>

        </AdminLayout>
      </div>
    </>
  );
}