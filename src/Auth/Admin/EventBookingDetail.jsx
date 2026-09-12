import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminapi";
import AdminLayout from "./AdminLayout";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');

  .ebd-wrapper {
    font-family: 'Share Tech Mono', monospace;
    padding: 2rem;
    max-width: 820px;
    margin: 0 auto;
  }

  .ebd-loading, .ebd-notfound {
    color: rgba(0,255,231,0.5);
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    text-align: center;
    padding: 4rem;
  }

  .ebd-loading { animation: blink 1.2s ease-in-out infinite; }
  .ebd-notfound { color: rgba(255,45,120,0.6); }

  @keyframes blink {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  .ebd-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .ebd-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #00ffe7, #ff2d78);
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .ebd-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: #ffe600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    text-shadow: 0 0 16px rgba(255,230,0,0.4);
    margin: 0 0 4px;
  }

  .ebd-tag {
    font-size: 0.62rem;
    color: rgba(0,255,231,0.5);
    letter-spacing: 0.25em;
    text-transform: uppercase;
  }

  .ebd-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(0,255,231,0.7);
    background: transparent;
    border: 1px solid rgba(0,255,231,0.2);
    padding: 0.45rem 1rem;
    cursor: pointer;
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
    transition: color 0.2s, border-color 0.2s, background 0.2s;
    margin-bottom: 1.75rem;
  }

  .ebd-back-btn:hover {
    color: #00ffe7;
    border-color: rgba(0,255,231,0.5);
    background: rgba(0,255,231,0.05);
  }

  .ebd-back-btn:active {
    transform: translateY(1px);
  }

  .ebd-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .ebd-grid-wide {
    grid-template-columns: 1fr;
  }

  .ebd-card {
    background: rgba(0,255,231,0.03);
    border: 1px solid rgba(0,255,231,0.12);
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    padding: 1.25rem 1.5rem;
    position: relative;
  }

  .ebd-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #00ffe7 0%, transparent 70%);
  }

  .ebd-card-label {
    font-size: 0.6rem;
    letter-spacing: 0.22em;
    color: rgba(0,255,231,0.5);
    text-transform: uppercase;
    margin-bottom: 0.4rem;
  }

  .ebd-card-value {
    font-size: 0.92rem;
    color: #e0ffe0;
  }

  .ebd-card-value.highlight {
    color: #ffe600;
    font-size: 1rem;
  }

  .ebd-card-value.amount {
    color: #00ffe7;
    font-size: 1.1rem;
    font-family: 'Orbitron', sans-serif;
    font-weight: 600;
  }

  .ebd-status-badge {
    display: inline-block;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 4px 14px;
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
    margin-top: 2px;
  }

  .ebd-status-pending  { background: rgba(255,230,0,0.15);  color: #ffe600; border: 1px solid rgba(255,230,0,0.35); }
  .ebd-status-approved { background: rgba(0,255,231,0.12);  color: #00ffe7; border: 1px solid rgba(0,255,231,0.35); }
  .ebd-status-rejected { background: rgba(255,45,120,0.12); color: #ff2d78; border: 1px solid rgba(255,45,120,0.35); }
  .ebd-status-default  { background: rgba(180,180,180,0.1); color: #aaa;    border: 1px solid rgba(180,180,180,0.2); }

  .ebd-qr-panel {
    background: rgba(0,255,231,0.03);
    border: 1px solid rgba(0,255,231,0.12);
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    position: relative;
  }

  .ebd-qr-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #ff2d78, transparent 60%);
  }

  .ebd-qr-img {
    width: 200px;
    height: 200px;
    object-fit: contain;
    border: 2px solid rgba(0,255,231,0.25);
    padding: 6px;
    background: #fff;
    clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
  }

  .ebd-qr-info {
    flex: 1;
    min-width: 160px;
  }

  .ebd-qr-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.75rem;
    color: #ff2d78;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 0.5rem;
  }

  .ebd-qr-sent-yes { color: #00ffe7; }
  .ebd-qr-sent-no  { color: #ff2d78; }

  .ebd-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,255,231,0.15), transparent);
    margin: 1.25rem 0;
  }

  @media (max-width: 600px) {
    .ebd-grid { grid-template-columns: 1fr; }
    .ebd-wrapper { padding: 1rem; }
  }
`;

const statusClass = (s) => {
  if (s === "pending")  return "ebd-status-badge ebd-status-pending";
  if (s === "approved") return "ebd-status-badge ebd-status-approved";
  if (s === "rejected") return "ebd-status-badge ebd-status-rejected";
  return "ebd-status-badge ebd-status-default";
};

const checkedInClass = (v) =>
  v ? "ebd-status-badge ebd-status-approved" : "ebd-status-badge ebd-status-default";

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function EventBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(undefined);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const data = await adminApi.getEventBookings(id);
      const record = Array.isArray(data) ? data[0] ?? null : data;
      setBooking(record);
    } catch (err) {
      console.error("Failed to load booking detail:", err);
      setBooking(null);
    }
  };

  if (booking === undefined) {
    return (
      <AdminLayout>
        <style>{styles}</style>
        <div className="ebd-loading">[ RETRIEVING BOOKING DATA… ]</div>
      </AdminLayout>
    );
  }

  if (booking === null) {
    return (
      <AdminLayout>
        <style>{styles}</style>
        <div className="ebd-notfound">[ NO BOOKING FOUND FOR ID: {id} ]</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="ebd-wrapper">

        <button className="ebd-back-btn" onClick={() => navigate("/admin/event-bookings")}>
          ◀ Back to Bookings
        </button>

        <div className="ebd-header">
          <div className="ebd-icon">🎟</div>
          <div>
            <h2 className="ebd-title">{booking.booking_id}</h2>
            <div className="ebd-tag">// {booking.event_title || "BOOKING DETAIL"}</div>
          </div>
        </div>

        {/* Identity */}
        <div className="ebd-grid">
          <div className="ebd-card">
            <div className="ebd-card-label">Full Name</div>
            <div className="ebd-card-value highlight">{booking.full_name}</div>
          </div>
          <div className="ebd-card">
            <div className="ebd-card-label">Status</div>
            <span className={statusClass(booking.status)}>{booking.status}</span>
          </div>
        </div>

        <div className="ebd-grid">
          <div className="ebd-card">
            <div className="ebd-card-label">Email</div>
            <div className="ebd-card-value">{booking.email}</div>
          </div>
          <div className="ebd-card">
            <div className="ebd-card-label">Phone</div>
            <div className="ebd-card-value">{booking.phone}</div>
          </div>
        </div>

        <div className="ebd-divider" />

        {/* Event + Check-in */}
        <div className="ebd-grid">
          <div className="ebd-card">
            <div className="ebd-card-label">Event</div>
            <div className="ebd-card-value highlight">{booking.event_title || "—"}</div>
          </div>
          <div className="ebd-card">
            <div className="ebd-card-label">Checked In</div>
            <span className={checkedInClass(booking.checked_in)}>
              {booking.checked_in ? "▶ CHECKED IN" : "✗ NOT CHECKED IN"}
            </span>
          </div>
        </div>

        <div className="ebd-divider" />

        {/* Payment */}
        <div className="ebd-grid">
          <div className="ebd-card">
            <div className="ebd-card-label">Amount Paid</div>
            <div className="ebd-card-value amount">{booking.amount_paid} INR</div>
          </div>
          <div className="ebd-card">
            <div className="ebd-card-label">QR Code Sent</div>
            <div className={`ebd-card-value ${booking.qr_sent ? "ebd-qr-sent-yes" : "ebd-qr-sent-no"}`}>
              {booking.qr_sent ? "▶ YES — DISPATCHED" : "✗ NOT YET SENT"}
            </div>
          </div>
        </div>

        <div className="ebd-divider" />

        {/* Created */}
        <div className="ebd-grid ebd-grid-wide">
          <div className="ebd-card">
            <div className="ebd-card-label">Booking Created</div>
            <div className="ebd-card-value">{formatDate(booking.created_at)}</div>
          </div>
        </div>

        {/* QR Code (only renders if backend ever sends one) */}
        {booking.qr_code_url && (
          <>
            <div className="ebd-divider" />
            <div className="ebd-qr-panel">
              <img src={booking.qr_code_url} alt="QR Code" className="ebd-qr-img" />
              <div className="ebd-qr-info">
                <div className="ebd-qr-title">Entry QR Code</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(0,255,231,0.6)", lineHeight: 1.6 }}>
                  Present this QR at the event entrance for verification. Valid for one entry only.
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </AdminLayout>
  );
}