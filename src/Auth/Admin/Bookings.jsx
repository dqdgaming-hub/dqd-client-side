import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminapi";
import AdminLayout from "./AdminLayout";
import { showWhatsApp } from "../../utils/whatsapp";
import { saCss, errorText, money, time12, dateNice } from "./simpleAdminUi";
import useApi from "../../hooks/useApi";

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function Bookings() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("pending");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const params = { status, type, date, search: query, page, page_size: PAGE_SIZE };
  const { data, error: loadError, loading, reload: load } = useApi(
    () => adminApi.getBookings(params),
    JSON.stringify(params),
  );
  const rows = Array.isArray(data) ? data : data?.results || [];
  const count = Array.isArray(data) ? data.length : data?.count || 0;
  const error = loadError ? errorText(loadError, "Could not load bookings.") : "";

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const approve = async (b) => {
    setBusyId(b.id);
    try {
      const result = await adminApi.approveBooking(b.id);
      showWhatsApp(result?.whatsapp_url, `Send confirmation to ${b.customer_name || "customer"}`);
      load();
    } catch (err) {
      alert(errorText(err, "Could not approve the booking."));
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (b) => {
    const reason = window.prompt(`Cancel booking ${b.booking_id}? Optional reason:`, "");
    if (reason === null) return;
    setBusyId(b.id);
    try {
      await adminApi.rejectBooking(b.id, reason);
      load();
    } catch (err) {
      alert(errorText(err, "Could not cancel the booking."));
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <AdminLayout>
      <style>{saCss}</style>
      <div className="sa">
        <div className="sa-head">
          <div>
            <h2 className="sa-title">Bookings</h2>
            <p className="sa-sub">Games and combo packs · {count} result{count === 1 ? "" : "s"}</p>
          </div>
          <div className="sa-actions">
            <Link className="sa-btn" to="/admin/bookings/verify">Scan QR</Link>
            <Link className="sa-btn primary" to="/admin/bookings/add">+ New booking</Link>
          </div>
        </div>

        <div className="sa-tabs" role="tablist">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key || "all"}
              role="tab"
              aria-selected={status === t.key}
              className={`sa-tab ${status === t.key ? "on" : ""}`}
              onClick={() => changeFilter(setStatus)(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="sa-toolbar">
          <input
            className="sa-input grow"
            type="search"
            placeholder="Search booking ID, name, mobile, game"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={100}
          />
          <select className="sa-select" value={type} onChange={(e) => changeFilter(setType)(e.target.value)}>
            <option value="">All types</option>
            <option value="game">Games</option>
            <option value="combo">Combo packs</option>
          </select>
          <input
            className="sa-input"
            type="date"
            value={date}
            onChange={(e) => changeFilter(setDate)(e.target.value)}
            style={{ colorScheme: "dark" }}
            aria-label="Booking date"
          />
          {date && <button className="sa-btn" onClick={() => changeFilter(setDate)("")}>Any date</button>}
        </div>

        {error && <div className="sa-error">{error} <button className="sa-btn" onClick={load}>Retry</button></div>}

        <div className="sa-panel">
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Booking</th>
                  <th>When</th>
                  <th className="sa-hide-sm">Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0 ? (
                  <tr><td colSpan={6} className="sa-loading">Loading bookings…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={6} className="sa-empty">No bookings found.</td></tr>
                ) : (
                  rows.map((b) => (
                    <tr key={b.id} onClick={() => navigate(`/admin/bookings/${b.id}`)} style={{ cursor: "pointer" }}>
                      <td>
                        <div className="sa-strong">{b.customer_name || "Guest"}</div>
                        <div className="sa-muted">{b.customer_phone || b.customer_email || "—"}</div>
                      </td>
                      <td>
                        <div>{b.combo_name || b.item_name || "—"}</div>
                        <div className="sa-muted">
                          {b.booking_id} · {b.booking_type === "combo" ? "Combo" : "Game"}
                          {b.is_happy_hour ? " · Happy hour" : ""}
                        </div>
                      </td>
                      <td>
                        <div>{dateNice(b.booking_date)}</div>
                        <div className="sa-muted">{time12(b.start_time)} – {time12(b.end_time)}</div>
                      </td>
                      <td className="sa-hide-sm">
                        <div>{money(b.total_amount)}</div>
                        <span className={`sa-badge ${b.payment_status}`}>{b.payment_status}</span>
                      </td>
                      <td>
                        <span className={`sa-badge ${b.status}`}>{b.status}</span>
                        {b.checked_in && <div className="sa-muted">Checked in</div>}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="sa-actions">
                          {b.status === "pending" && (
                            <button className="sa-btn ok" disabled={busyId === b.id} onClick={() => approve(b)}>
                              Approve
                            </button>
                          )}
                          {(b.status === "pending" || b.status === "confirmed") && (
                            <button className="sa-btn danger" disabled={busyId === b.id} onClick={() => cancel(b)}>
                              Cancel
                            </button>
                          )}
                          {b.whatsapp_url && (
                            <a className="sa-btn wa" href={b.whatsapp_url} target="_blank" rel="noopener noreferrer">
                              Resend on WhatsApp
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="sa-pager">
              <button className="sa-btn" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button className="sa-btn" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
