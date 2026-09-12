import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminapi";
import AdminLayout from "./AdminLayout";
import { bookingCss } from "./bookingTheme.jsx";

const INITIAL_FORM = {
  user: "",
  guest_name: "",
  guest_email: "",
  guest_phone: "",
  item: "",
  combo_pack: "",
  booking_date: "",
  start_time: "",
  end_time: "",
  total_hours: "",
  subtotal: "",
  discount_amount: 0,
  total_amount: "",
  price_paid: 0,
  status: "pending",
  payment_status: "pending",
  is_happy_hour: false,
  use_manual_loyalty_points: false,
  manual_loyalty_points: "",
  notes: "",
};

// ── helpers ─────────────────────────────────────────────────────────────────

function timeToMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHours(mins) {
  return parseFloat((mins / 60).toFixed(2));
}

/**
 * Every player (primary + extras) pays the same ratePerPax.
 * subtotal = ratePerPax × totalPax
 * total    = subtotal − discount  (min 0)
 */
function calcPricing({ item, combo_pack, total_hours, discount_amount, memberCount }) {
  const hours     = parseFloat(total_hours || 0);
  const discount  = parseFloat(discount_amount || 0);
  const totalPax  = 1 + (memberCount || 0); // primary + extras

  let ratePerPax = 0;

  if (combo_pack) {
    // combo price × hours per person
    ratePerPax    = parseFloat(combo_pack.combo_price || 0) * hours;
    const sub     = ratePerPax * totalPax;
    const total   = Math.max(0, sub - discount);
    return { subtotal: sub, total, ratePerPax };
  }

  if (item) {
    // hourly price × hours per person
    ratePerPax    = parseFloat(item.price_per_hour || 0) * hours;
    const sub     = ratePerPax * totalPax;
    const total   = Math.max(0, sub - discount);
    return { subtotal: sub, total, ratePerPax };
  }

  return { subtotal: 0, total: 0, ratePerPax: 0 };
}

export default function AddBooking() {
  const navigate = useNavigate();

  const [users,  setUsers]  = useState([]);
  const [items,  setItems]  = useState([]);
  const [combos, setCombos] = useState([]);

  const [form,    setForm]    = useState(INITIAL_FORM);
  const [members, setMembers] = useState([]);
  const [error,   setError]   = useState("");
  const [submitting, setSub]  = useState(false);

  useEffect(() => { loadDropdowns(); }, []);

  // ── auto-compute hours from start/end time ────────────────────────────────
  useEffect(() => {
    const start = timeToMinutes(form.start_time);
    const end   = timeToMinutes(form.end_time);
    if (start !== null && end !== null && end > start) {
      setForm((f) => ({ ...f, total_hours: minutesToHours(end - start) }));
    }
  }, [form.start_time, form.end_time]);

  // ── auto-compute pricing whenever any pricing-relevant field changes ──────
  useEffect(() => {
    const selectedItem  = items.find((i) => String(i.id) === String(form.item));
    const selectedCombo = combos.find((c) => String(c.id) === String(form.combo_pack));

    const { subtotal, total } = calcPricing({
      item:            selectedItem  || null,
      combo_pack:      selectedCombo || null,
      total_hours:     form.total_hours,
      discount_amount: form.discount_amount,
      memberCount:     members.length,          // ← drives the per-head multiplier
    });

    setForm((f) => ({
      ...f,
      subtotal:     subtotal > 0 ? subtotal.toFixed(2) : "",
      total_amount: total    > 0 ? total.toFixed(2)    : "",
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.item, form.combo_pack, form.total_hours, form.discount_amount, members.length, items, combos]);

  async function loadDropdowns() {
    try {
      const [usersData, itemsData, comboData] = await Promise.all([
        adminApi.getUsers().catch(() => []),
        adminApi.getGamingItems().catch(() => []),
        adminApi.getCombos().catch(() => []),
      ]);
      setUsers(usersData?.results  || usersData  || []);
      setItems(itemsData?.results  || itemsData  || []);
      setCombos(comboData?.results || comboData  || []);
    } catch (err) { console.error(err); }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const addMember    = () => setMembers((m) => [...m, { name: "", phone: "" }]);
  const removeMember = (i) => setMembers((m) => m.filter((_, idx) => idx !== i));
  const updateMember = (i, field, val) =>
    setMembers((m) => m.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!form.item && !form.combo_pack) {
      setError("Please select a Game Item or a Combo Pack.");
      return;
    }
    if (!form.booking_date) { setError("Booking date is required.");     return; }
    if (!form.start_time)   { setError("Start time is required.");       return; }
    if (!form.end_time)     { setError("End time is required.");         return; }
    if (timeToMinutes(form.end_time) <= timeToMinutes(form.start_time)) {
      setError("End time must be after start time."); return;
    }
    if (!form.user && !form.guest_name)  { setError("Customer name is required for guest bookings.");  return; }
    if (!form.user && !form.guest_email) { setError("Customer email is required for guest bookings."); return; }

    setSub(true);
    try {
      const payload = { ...form };
      if (!payload.combo_pack)            delete payload.combo_pack;
      if (!payload.item)                  delete payload.item;
      if (!payload.user)                  delete payload.user;
      if (!payload.manual_loyalty_points) delete payload.manual_loyalty_points;
      if (payload.user) {
        delete payload.guest_name;
        delete payload.guest_email;
        delete payload.guest_phone;
      }
      await adminApi.createBooking({ ...payload, members });
      navigate("/admin/bookings");
    } catch (err) {
      setError(err.message || "Failed to create booking.");
    } finally {
      setSub(false);
    }
  }

  // ── derived display values ────────────────────────────────────────────────
  const selectedItem  = items.find((i) => String(i.id) === String(form.item));
  const selectedCombo = combos.find((c) => String(c.id) === String(form.combo_pack));

  const { ratePerPax, subtotal, total } = calcPricing({
    item:            selectedItem  || null,
    combo_pack:      selectedCombo || null,
    total_hours:     form.total_hours,
    discount_amount: form.discount_amount,
    memberCount:     members.length,
  });

  const totalPax = 1 + members.length;
  const currency = (v) => `INR ${parseFloat(v || 0).toFixed(2)}`;

  const rateLabel = selectedCombo
    ? `${currency(selectedCombo.combo_price)} / hr (combo)`
    : selectedItem
      ? `${currency(selectedItem.price_per_hour)} / hr`
      : null;

  return (
    <>
      <style>{bookingCss}</style>
      <div className="bk-pg">
        <AdminLayout>

          <section className="bk-hero">
            <div>
              <p className="bk-kicker">Bookings · Create New</p>
              <h1 className="bk-h1">New <span>Booking</span></h1>
              <p className="bk-hero-sub">Create a walk-in or scheduled booking on behalf of a customer</p>
            </div>
            <button className="bk-btn-ghost" onClick={() => navigate("/admin/bookings")}>
              ← Back
            </button>
          </section>

          {error && <div className="bk-alert">⚠ {error}</div>}

          <form onSubmit={submit}>

            {/* ── Customer ── */}
            <div className="bk-panel">
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Customer</h2>
              </div>
              <div className="bk-panel-body">
                <div className="bk-form-grid">
                  <div className="bk-form-field bk-form-full">
                    <label className="bk-label">Registered Member</label>
                    <select className="bk-select" name="user" value={form.user} onChange={handleChange}>
                      <option value="">Walk-in / Guest Booking</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.full_name} — {u.email}</option>
                      ))}
                    </select>
                  </div>

                  {!form.user && (
                    <>
                      <div className="bk-form-field">
                        <label className="bk-label">Guest Name *</label>
                        <input className="bk-input" name="guest_name" placeholder="Full name"
                          value={form.guest_name} onChange={handleChange} required />
                      </div>
                      <div className="bk-form-field">
                        <label className="bk-label">Guest Email *</label>
                        <input className="bk-input" type="email" name="guest_email"
                          placeholder="email@example.com" value={form.guest_email} onChange={handleChange} required />
                      </div>
                      <div className="bk-form-field">
                        <label className="bk-label">Guest Phone</label>
                        <input className="bk-input" name="guest_phone" placeholder="+91 XXXXX XXXXX"
                          value={form.guest_phone} onChange={handleChange} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Item & Slot ── */}
            <div className="bk-panel">
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Booking Details</h2>
                {rateLabel && (
                  <span style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.58rem",
                                 color: "var(--bk-cyan)", letterSpacing: "0.06em" }}>
                    {rateLabel}
                  </span>
                )}
              </div>
              <div className="bk-panel-body">
                <div className="bk-form-grid">

                  <div className="bk-form-field">
                    <label className="bk-label">
                      Game Item
                      <span style={{ marginLeft: 6, fontSize: "0.52rem",
                                     color: "var(--bk-muted)", letterSpacing: "0.08em" }}>
                        (or select Combo below)
                      </span>
                    </label>
                    <select
                      className="bk-select"
                      name="item"
                      value={form.item}
                      onChange={handleChange}
                      style={!form.item && !form.combo_pack ? { borderColor: "rgba(255,230,0,0.4)" } : undefined}
                    >
                      <option value="">— None —</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} — INR {item.price_per_hour}/hr
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bk-form-field">
                    <label className="bk-label">
                      Combo Pack
                      <span style={{ marginLeft: 6, fontSize: "0.52rem",
                                     color: "var(--bk-muted)", letterSpacing: "0.08em" }}>
                        (or select Item above)
                      </span>
                    </label>
                    <select
                      className="bk-select"
                      name="combo_pack"
                      value={form.combo_pack}
                      onChange={handleChange}
                      style={!form.item && !form.combo_pack ? { borderColor: "rgba(255,230,0,0.4)" } : undefined}
                    >
                      <option value="">— None —</option>
                      {combos.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} — INR {c.combo_price}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bk-form-field">
                    <label className="bk-label">Booking Date *</label>
                    <input className="bk-input" type="date" name="booking_date"
                      value={form.booking_date} onChange={handleChange} required />
                  </div>

                  <div className="bk-form-field">
                    <label className="bk-label">Start Time *</label>
                    <input className="bk-input" type="time" name="start_time"
                      value={form.start_time} onChange={handleChange} required />
                  </div>

                  <div className="bk-form-field">
                    <label className="bk-label">End Time *</label>
                    <input className="bk-input" type="time" name="end_time"
                      value={form.end_time} onChange={handleChange} required />
                  </div>

                  <div className="bk-form-field">
                    <label className="bk-label">Duration (auto-calculated)</label>
                    <div style={{
                      padding: "10px 12px",
                      background: "rgba(0,255,225,0.04)",
                      border: "1px solid var(--bk-border)",
                      fontFamily: "var(--bk-font-mono)",
                      fontSize: "0.82rem",
                      color: form.total_hours ? "var(--bk-cyan)" : "var(--bk-muted)",
                      clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                    }}>
                      {form.total_hours ? `${form.total_hours} hr(s)` : "Select start & end time"}
                    </div>
                    <input type="hidden" name="total_hours" value={form.total_hours} />
                  </div>

                  <div className="bk-form-field bk-form-full" style={{ alignItems: "flex-start" }}>
                    <label className="bk-toggle-wrap">
                      <input className="bk-toggle-input" type="checkbox" name="is_happy_hour"
                        checked={form.is_happy_hour} onChange={handleChange} />
                      <span className="bk-toggle-label">⚡ Happy Hour Booking</span>
                    </label>
                  </div>

                </div>
              </div>
            </div>

            {/* ── Members ── */}
            <div className="bk-panel">
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Party Members</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {ratePerPax > 0 && (
                    <span style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.55rem",
                                   color: "var(--bk-yellow)", letterSpacing: "0.06em" }}>
                      {totalPax} player{totalPax !== 1 ? "s" : ""} · {currency(ratePerPax)}/person
                    </span>
                  )}
                  <button type="button" className="bk-btn-ghost"
                    style={{ padding: "6px 14px", fontSize: "0.58rem" }}
                    onClick={addMember}>
                    + Add Member
                  </button>
                </div>
              </div>
              <div className="bk-panel-body">

                {/* Primary customer row (read-only display) */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr auto",
                  gap: 8, marginBottom: 8, alignItems: "end",
                }}>
                  <div className="bk-form-field">
                    <label className="bk-label">Name</label>
                    <div style={{
                      padding: "10px 12px", background: "rgba(0,255,225,0.04)",
                      border: "1px solid var(--bk-border)", fontFamily: "var(--bk-font-mono)",
                      fontSize: "0.72rem", color: "var(--bk-cyan)",
                      clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                    }}>
                      {form.user
                        ? (users.find((u) => String(u.id) === String(form.user))?.full_name || "—")
                        : (form.guest_name || "Guest")}
                      <span style={{ marginLeft: 8, fontSize: "0.5rem", color: "var(--bk-muted)",
                                     letterSpacing: "0.1em" }}>PRIMARY</span>
                    </div>
                  </div>
                  <div className="bk-form-field">
                    <label className="bk-label">Charge</label>
                    <div style={{
                      padding: "10px 12px", background: "rgba(0,255,225,0.04)",
                      border: "1px solid var(--bk-border)", fontFamily: "var(--bk-font-mono)",
                      fontSize: "0.72rem", color: "var(--bk-muted)",
                      clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                    }}>
                      {ratePerPax > 0 ? currency(ratePerPax) : "—"}
                    </div>
                  </div>
                  <div style={{ width: 44 }} />
                </div>

                {/* Extra members */}
                {members.map((m, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr auto",
                    gap: 8, marginBottom: 8, alignItems: "end",
                  }}>
                    <div className="bk-form-field">
                      {i === 0 && <label className="bk-label">Extra Member Name</label>}
                      <input className="bk-input" placeholder={`Member ${i + 2} name`}
                        value={m.name} onChange={(e) => updateMember(i, "name", e.target.value)} />
                    </div>
                    <div className="bk-form-field">
                      {i === 0 && <label className="bk-label">Phone · Charge</label>}
                      <div style={{ display: "flex", gap: 6 }}>
                        <input className="bk-input" placeholder="Phone (optional)"
                          value={m.phone} onChange={(e) => updateMember(i, "phone", e.target.value)}
                          style={{ flex: 1 }} />
                        <div style={{
                          padding: "10px 10px", background: "rgba(255,230,0,0.06)",
                          border: "1px solid rgba(255,230,0,0.2)",
                          fontFamily: "var(--bk-font-mono)", fontSize: "0.65rem",
                          color: "var(--bk-yellow)", whiteSpace: "nowrap",
                          clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                        }}>
                          {ratePerPax > 0 ? currency(ratePerPax) : "—"}
                        </div>
                      </div>
                    </div>
                    <button type="button" className="bk-btn-danger"
                      style={{ padding: "9px 14px", marginBottom: i === 0 ? 0 : undefined }}
                      onClick={() => removeMember(i)}>✕</button>
                  </div>
                ))}

                {members.length === 0 && (
                  <p style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.62rem",
                              color: "var(--bk-muted)", margin: "8px 0 0" }}>
                    Only primary customer. Click "+ Add Member" to add extra players.
                  </p>
                )}
              </div>
            </div>

            {/* ── Payment ── */}
            <div className="bk-panel">
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Payment</h2>
                {subtotal > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                    <span style={{ fontFamily: "var(--bk-font-display)", fontSize: "1rem",
                                   color: "var(--bk-cyan)" }}>
                      Total: {currency(total)}
                    </span>
                    <span style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.52rem",
                                   color: "var(--bk-muted)" }}>
                      {totalPax} × {currency(ratePerPax)}
                      ` × ${form.total_hours}h`
                      {parseFloat(form.discount_amount) > 0 && ` − ${currency(form.discount_amount)} discount`}
                    </span>
                  </div>
                )}
              </div>
              <div className="bk-panel-body">
                <div className="bk-form-grid">

                  <div className="bk-form-field">
                    <label className="bk-label">Subtotal (auto)</label>
                    <input className="bk-input" type="number" name="subtotal"
                      value={form.subtotal} onChange={handleChange}
                      placeholder="0.00" min="0" step="0.01" />
                  </div>

                  <div className="bk-form-field">
                    <label className="bk-label">Discount Amount</label>
                    <input className="bk-input" type="number" name="discount_amount"
                      value={form.discount_amount} onChange={handleChange}
                      placeholder="0.00" min="0" step="0.01" />
                  </div>

                  <div className="bk-form-field">
                    <label className="bk-label">Total Amount</label>
                    <input className="bk-input" type="number" name="total_amount"
                      value={form.total_amount} onChange={handleChange}
                      placeholder="0.00" min="0" step="0.01" />
                  </div>

                  <div className="bk-form-field">
                    <label className="bk-label">Amount Paid</label>
                    <input className="bk-input" type="number" name="price_paid"
                      value={form.price_paid} onChange={handleChange}
                      placeholder="0.00" min="0" step="0.01" />
                  </div>

                  <div className="bk-form-field">
                    <label className="bk-label">Booking Status</label>
                    <select className="bk-select" name="status" value={form.status} onChange={handleChange}>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="bk-form-field">
                    <label className="bk-label">Payment Status</label>
                    <select className="bk-select" name="payment_status" value={form.payment_status} onChange={handleChange}>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                </div>

                {/* Pricing breakdown */}
                {subtotal > 0 && (
                  <div style={{
                    marginTop: 16, padding: "12px 16px",
                    background: "rgba(0,255,225,0.03)",
                    border: "1px solid rgba(0,255,225,0.1)",
                    borderLeft: "3px solid rgba(0,255,225,0.3)",
                    fontFamily: "var(--bk-font-mono)", fontSize: "0.62rem",
                    color: "var(--bk-muted)", lineHeight: 1.9,
                  }}>
                    <div style={{ color: "var(--bk-cyan)", letterSpacing: "0.1em",
                                  fontSize: "0.52rem", marginBottom: 6 }}>PRICING BREAKDOWN</div>

                    {/* Primary */}
                    <div>
                      Primary customer:&nbsp;
                      <span style={{ color: "var(--bk-text)" }}>{currency(ratePerPax)}</span>
                      {form.total_hours && (
                        <span style={{ color: "var(--bk-muted)" }}> ({form.total_hours}h)</span>
                      )}
                    </div>

                    {/* Extra members — each pays the same ratePerPax */}
                    {members.map((m, i) => (
                      <div key={i}>
                        Member {i + 2}{m.name ? ` (${m.name})` : ""}:&nbsp;
                        <span style={{ color: "var(--bk-yellow)" }}>{currency(ratePerPax)}</span>
                      </div>
                    ))}

                    {/* Subtotal line when there are extras */}
                    {members.length > 0 && (
                      <div style={{ color: "var(--bk-muted)", marginTop: 2 }}>
                        Subtotal ({totalPax} × {currency(ratePerPax)}):&nbsp;
                        <span style={{ color: "var(--bk-text)" }}>{currency(subtotal)}</span>
                      </div>
                    )}

                    {parseFloat(form.discount_amount) > 0 && (
                      <div>
                        Discount:&nbsp;
                        <span style={{ color: "#00ff64" }}>−{currency(form.discount_amount)}</span>
                      </div>
                    )}

                    <div style={{ borderTop: "1px solid rgba(0,255,225,0.1)",
                                  marginTop: 6, paddingTop: 6, color: "var(--bk-cyan)", fontWeight: 600 }}>
                      Total: {currency(total)}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* ── Loyalty ── */}
            <div className="bk-panel">
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Loyalty Points</h2>
              </div>
              <div className="bk-panel-body">
                <div className="bk-form-grid">
                  <div className="bk-form-field bk-form-full" style={{ alignItems: "flex-start" }}>
                    <label className="bk-toggle-wrap">
                      <input className="bk-toggle-input" type="checkbox"
                        name="use_manual_loyalty_points"
                        checked={form.use_manual_loyalty_points} onChange={handleChange} />
                      <span className="bk-toggle-label">Override loyalty points manually</span>
                    </label>
                  </div>
                  {form.use_manual_loyalty_points && (
                    <div className="bk-form-field">
                      <label className="bk-label">Manual Points to Award</label>
                      <input className="bk-input" type="number" name="manual_loyalty_points"
                        value={form.manual_loyalty_points} onChange={handleChange}
                        placeholder="0" min="0" step="1" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Notes ── */}
            <div className="bk-panel">
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Notes</h2>
              </div>
              <div className="bk-panel-body">
                <textarea className="bk-textarea bk-form-full" name="notes"
                  placeholder="Internal notes for this booking…"
                  value={form.notes} onChange={handleChange} style={{ width: "100%" }} />
              </div>
            </div>

            {/* ── Submit ── */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" className="bk-btn-ghost" onClick={() => navigate("/admin/bookings")}>
                Cancel
              </button>
              <button type="submit" className="bk-btn-success" disabled={submitting}>
                {submitting ? "Creating…" : "▶ Create Booking"}
              </button>
            </div>

          </form>

        </AdminLayout>
      </div>
    </>
  );
}