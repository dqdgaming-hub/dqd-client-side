import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminapi";
import AdminLayout from "./AdminLayout";
import { bookingCss, StatusBadge } from "./bookingTheme.jsx";

// ── extra-member charge = price_per_hour × total_hours ──────────────────────
function calcMemberCharge(booking) {
  const rate  = parseFloat(booking.item?.price_per_hour || 0);
  const hours = parseFloat(booking.total_hours || 0);
  return rate * hours;
}

function calcTotalsWithMembers(booking) {
  const extraCount  = (booking.members || []).length;           // primary already in subtotal
  const memberCharge = calcMemberCharge(booking) * extraCount;
  const base         = parseFloat(booking.subtotal || 0);
  const discount     = parseFloat(booking.discount_amount || 0);
  const subtotal     = base + memberCharge;
  const total        = subtotal - discount;
  return { subtotal, total, memberCharge, extraCount };
}

export default function BookingDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [booking,  setBooking]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(false);
  const [payStatus, setPayStatus] = useState("");
  const [savingPay, setSavingPay] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await adminApi.getBooking(id);
      setBooking(data);
      setPayStatus(data.payment_status || "pending");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!confirm("Approve this booking? A QR code will be emailed to the customer.")) return;
    setActing(true);
    try {
      await adminApi.approveBooking(booking.id);
      loadData();
    } catch (err) { alert(err.message); }
    finally { setActing(false); }
  }

  async function handleReject() {
    if (!confirm("Reject this booking? This cannot be undone.")) return;
    setActing(true);
    try {
      await adminApi.rejectBooking(booking.id);
      loadData();
    } catch (err) { alert(err.message); }
    finally { setActing(false); }
  }

  async function handlePaymentStatusSave() {
    if (payStatus === booking.payment_status) return;
    setSavingPay(true);
    try {
      await adminApi.updateBookingStatus(booking.id, { payment_status: payStatus });
      loadData();
    } catch (err) { alert(err.message); }
    finally { setSavingPay(false); }
  }

  const currency = (v) => v != null ? `INR ${parseFloat(v).toFixed(2)}` : "—";
  const fmt      = (v) => v ?? "—";

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{bookingCss}</style>
      <div className="bk-pg">
        <AdminLayout>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                        height: 300, color: "var(--bk-muted)",
                        fontFamily: "var(--bk-font-mono)", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
            LOADING BOOKING…
          </div>
        </AdminLayout>
      </div>
    </>
  );

  if (!booking) return (
    <>
      <style>{bookingCss}</style>
      <div className="bk-pg">
        <AdminLayout>
          <div className="bk-alert">⚠ Booking not found or failed to load.</div>
        </AdminLayout>
      </div>
    </>
  );

  const { subtotal, total, memberCharge, extraCount } = calcTotalsWithMembers(booking);
  const pricePerHour = parseFloat(booking.item?.price_per_hour || 0);
  const hours        = parseFloat(booking.total_hours || 0);

  // Primary customer counts as member #1
  const allMembers = [
    { id: "primary", name: booking.customer_name, phone: booking.customer_phone, is_admin_added: false, isPrimary: true },
    ...(booking.members || []).map(m => ({ ...m, isPrimary: false })),
  ];

  return (
    <>
      <style>{bookingCss}</style>
      <div className="bk-pg">
        <AdminLayout>

          {/* ── Hero ── */}
          <section className="bk-hero">
            <div>
              <p className="bk-kicker">Bookings · Detail View</p>
              <h1 className="bk-h1"><span>{booking.booking_id}</span></h1>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
                <StatusBadge status={booking.status} />
                <StatusBadge status={booking.payment_status} />
                {booking.is_happy_hour && (
                  <span style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.6rem",
                                 color: "var(--bk-yellow)", letterSpacing: "0.1em" }}>⚡ HAPPY HOUR</span>
                )}
                {booking.checked_in && (
                  <span className="bk-checkin-badge done">✓ Checked In</span>
                )}
              </div>
            </div>
            <div className="bk-hero-actions">
              <button className="bk-btn-ghost" onClick={() => navigate("/admin/bookings")}>
                ← Bookings
              </button>
              {booking.status === "pending" && (
                <>
                  <button className="bk-btn-success" onClick={handleApprove} disabled={acting}>
                    {acting ? "Processing…" : "✓ Approve"}
                  </button>
                  <button className="bk-btn-danger" onClick={handleReject} disabled={acting}>
                    {acting ? "Processing…" : "✕ Reject"}
                  </button>
                </>
              )}
            </div>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* ── Customer Panel ── */}
            <div className="bk-panel">
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Customer</h2>
                {booking.created_by_admin && (
                  <span style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.52rem",
                                 color: "var(--bk-muted)", letterSpacing: "0.1em" }}>ADMIN CREATED</span>
                )}
              </div>
              <div className="bk-panel-body">
                <div className="bk-detail-grid">
                  <div className="bk-field">
                    <span className="bk-field-label">Name</span>
                    <span className="bk-field-val">{fmt(booking.customer_name)}</span>
                  </div>
                  <div className="bk-field">
                    <span className="bk-field-label">Email</span>
                    <span className="bk-field-val" style={{ fontSize: "0.72rem" }}>{fmt(booking.customer_email)}</span>
                  </div>
                  <div className="bk-field">
                    <span className="bk-field-label">Phone</span>
                    <span className="bk-field-val mono">{fmt(booking.customer_phone)}</span>
                  </div>
                  {booking.user && (
                    <div className="bk-field">
                      <span className="bk-field-label">Member Account</span>
                      <span className="bk-field-val" style={{ color: "var(--bk-cyan)", fontSize: "0.7rem" }}>✓ Registered User</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Slot Details ── */}
            <div className="bk-panel">
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Slot Details</h2>
              </div>
              <div className="bk-panel-body">
                <div className="bk-detail-grid">
                  <div className="bk-field">
                    <span className="bk-field-label">Date</span>
                    <span className="bk-field-val mono">{fmt(booking.booking_date)}</span>
                  </div>
                  <div className="bk-field">
                    <span className="bk-field-label">Time Slot</span>
                    <span className="bk-field-val mono">
                      {booking.start_time && booking.end_time
                        ? `${booking.start_time} – ${booking.end_time}` : "—"}
                    </span>
                  </div>
                  <div className="bk-field">
                    <span className="bk-field-label">Duration</span>
                    <span className="bk-field-val">{booking.total_hours ? `${booking.total_hours}h` : "—"}</span>
                  </div>
                  <div className="bk-field">
                    <span className="bk-field-label">Happy Hour</span>
                    <span className="bk-field-val" style={{ color: booking.is_happy_hour ? "var(--bk-yellow)" : "var(--bk-muted)" }}>
                      {booking.is_happy_hour ? "⚡ Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Item Details ── */}
            <div className="bk-panel">
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Item Details</h2>
              </div>
              <div className="bk-panel-body">
                <div className="bk-detail-grid">
                  <div className="bk-field">
                    <span className="bk-field-label">Game Item</span>
                    <span className="bk-field-val">{booking.item?.name || "—"}</span>
                  </div>
                  <div className="bk-field">
                    <span className="bk-field-label">Price / Hour</span>
                    <span className="bk-field-val mono">{currency(booking.item?.price_per_hour)}</span>
                  </div>
                  {booking.combo_pack && (
                    <div className="bk-field">
                      <span className="bk-field-label">Combo Pack</span>
                      <span className="bk-field-val" style={{ color: "var(--bk-yellow)" }}>
                        {booking.combo_pack?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Payment Panel ── */}
            <div className="bk-panel">
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Payment</h2>
                <StatusBadge status={booking.payment_status} />
              </div>
              <div className="bk-panel-body">
                <div className="bk-detail-grid">
                  <div className="bk-field">
                    <span className="bk-field-label">Base Subtotal</span>
                    <span className="bk-field-val mono">{currency(booking.subtotal)}</span>
                  </div>
                  {extraCount > 0 && (
                    <div className="bk-field">
                      <span className="bk-field-label">Extra Members ({extraCount} × {currency(pricePerHour)}/hr × {hours}h)</span>
                      <span className="bk-field-val mono" style={{ color: "var(--bk-yellow)" }}>
                        +{currency(memberCharge)}
                      </span>
                    </div>
                  )}
                  <div className="bk-field">
                    <span className="bk-field-label">Subtotal (incl. members)</span>
                    <span className="bk-field-val mono">{currency(subtotal)}</span>
                  </div>
                  <div className="bk-field">
                    <span className="bk-field-label">Discount</span>
                    <span className="bk-field-val mono" style={{ color: booking.discount_amount > 0 ? "#00ff64" : undefined }}>
                      {booking.discount_amount > 0 ? `-${currency(booking.discount_amount)}` : "—"}
                    </span>
                  </div>
                  <div className="bk-field" style={{ gridColumn: "1 / -1" }}>
                    <span className="bk-field-label">Total Amount</span>
                    <span className="bk-field-val highlight">{currency(total)}</span>
                  </div>
                  <div className="bk-field">
                    <span className="bk-field-label">Amount Paid</span>
                    <span className="bk-field-val mono">{currency(booking.price_paid)}</span>
                  </div>
                </div>

                {/* ── Payment Status Dropdown ── */}
                <hr className="bk-divider" style={{ margin: "16px 0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div className="bk-form-field" style={{ flex: 1, minWidth: 140 }}>
                    <label className="bk-label">Change Payment Status</label>
                    <select
                      className="bk-select"
                      value={payStatus}
                      onChange={(e) => setPayStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <button
                    className="bk-btn-primary bk-btn-sm"
                    style={{ marginTop: 18, whiteSpace: "nowrap" }}
                    onClick={handlePaymentStatusSave}
                    disabled={savingPay || payStatus === booking.payment_status}
                  >
                    {savingPay ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ── Members table (primary + extras) ── */}
          <div className="bk-panel" style={{ marginTop: 0 }}>
            <div className="bk-panel-head">
              <h2 className="bk-panel-title">Party Roster</h2>
              <span style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.55rem", color: "var(--bk-muted)" }}>
                {allMembers.length} player{allMembers.length !== 1 ? "s" : ""}
                {extraCount > 0 && (
                  <span style={{ color: "var(--bk-yellow)", marginLeft: 8 }}>
                    · +{currency(memberCharge)} member charge
                  </span>
                )}
              </span>
            </div>
            <div className="bk-panel-body" style={{ padding: 0 }}>
              <table className="bk-members-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Charge</th>
                  </tr>
                </thead>
                <tbody>
                  {allMembers.map((m, i) => (
                    <tr key={m.id || i}>
                      <td style={{ color: "var(--bk-muted)", fontSize: "0.65rem" }}>{i + 1}</td>
                      <td>{m.name}</td>
                      <td style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.68rem" }}>{m.phone || "—"}</td>
                      <td>
                        {m.isPrimary
                          ? <span style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.52rem",
                                          color: "var(--bk-cyan)", background: "rgba(0,255,225,0.08)",
                                          border: "1px solid rgba(0,255,225,0.2)", padding: "2px 6px" }}>Primary</span>
                          : m.is_admin_added
                            ? <span style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.52rem",
                                            color: "var(--bk-pink)", background: "rgba(255,79,163,0.08)",
                                            border: "1px solid rgba(255,79,163,0.2)", padding: "2px 6px" }}>Admin</span>
                            : <span style={{ color: "var(--bk-muted)", fontSize: "0.65rem" }}>Customer</span>
                        }
                      </td>
                      <td style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.68rem",
                                   color: m.isPrimary ? "var(--bk-muted)" : "var(--bk-yellow)" }}>
                        {m.isPrimary ? "included" : `+${currency(calcMemberCharge(booking))}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Loyalty & Notes ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 0 }}>
            <div className="bk-panel">
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Loyalty Points</h2>
              </div>
              <div className="bk-panel-body">
                <div className="bk-detail-grid">
                  <div className="bk-field">
                    <span className="bk-field-label">Awarded Points</span>
                    <span className="bk-pts" style={{ fontSize: "1.4rem" }}>
                      ⭐ {booking.awarded_loyalty_points ?? 0}
                    </span>
                  </div>
                  {booking.use_manual_loyalty_points && (
                    <div className="bk-field">
                      <span className="bk-field-label">Manual Override</span>
                      <span className="bk-field-val" style={{ color: "var(--bk-cyan)", fontSize: "0.7rem" }}>
                        Admin-assigned: {booking.manual_loyalty_points}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="bk-panel">
                <div className="bk-panel-head">
                  <h2 className="bk-panel-title">Notes</h2>
                </div>
                <div className="bk-panel-body">
                  <p style={{ color: "var(--bk-muted)", fontSize: "0.78rem", margin: 0, lineHeight: 1.6 }}>
                    {booking.notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── QR Code ── */}
          {booking.qr_code && (
            <div className="bk-panel" style={{ marginTop: 0 }}>
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Entry QR Code</h2>
                <span className={`bk-checkin-badge ${booking.checked_in ? "done" : "waiting"}`}>
                  {booking.checked_in
                    ? `✓ Checked in ${booking.checked_in_at ? `· ${booking.checked_in_at}` : ""}`
                    : "⏳ Awaiting check-in"}
                </span>
              </div>
              <div className="bk-panel-body">
                <div className="bk-qr-wrap">
                  <img src={booking.qr_code} alt="Booking QR" className="bk-qr-img" width={220} />
                  <p className="bk-qr-token">Token: {booking.qr_token}</p>
                  {booking.qr_sent && (
                    <span style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.58rem",
                                   color: "#00ff64", letterSpacing: "0.1em" }}>
                      ✓ QR emailed to customer
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

        </AdminLayout>
      </div>
    </>
  );
}