import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminapi";
import AdminLayout from "./AdminLayout";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');

  .ebl-wrapper {
    font-family: 'Share Tech Mono', monospace;
    padding: 2rem;
  }

  .ebl-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .ebl-title-group {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .ebl-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #00ffe7, #ff2d78);
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .ebl-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.35rem;
    font-weight: 700;
    color: #00ffe7;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    text-shadow: 0 0 14px rgba(0,255,231,0.4);
    margin: 0;
  }

  .ebl-count {
    font-size: 0.65rem;
    color: rgba(0,255,231,0.5);
    letter-spacing: 0.2em;
    margin-top: 2px;
  }

  .ebl-topbar-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .ebl-add-btn {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #0a0a1a;
    background: linear-gradient(90deg, #00ffe7, #00c9b0);
    border: none;
    padding: 0.65rem 1.5rem;
    cursor: pointer;
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
    transition: box-shadow 0.2s, transform 0.1s;
  }

  .ebl-add-btn:hover {
    box-shadow: 0 0 20px rgba(0,255,231,0.4);
    transform: translateY(-1px);
  }

  .ebl-verify-btn {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #0a0a1a;
    background: linear-gradient(90deg, #ff2d78, #c4004e);
    border: none;
    padding: 0.65rem 1.5rem;
    cursor: pointer;
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
    transition: box-shadow 0.2s, transform 0.1s;
  }

  .ebl-verify-btn:hover {
    box-shadow: 0 0 20px rgba(255,45,120,0.45);
    transform: translateY(-1px);
  }

  .ebl-loading {
    color: rgba(0,255,231,0.5);
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    padding: 3rem 0;
    text-align: center;
    animation: pulse 1.4s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }

  .ebl-table-wrap {
    border: 1px solid rgba(0,255,231,0.12);
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
    overflow: hidden;
    background: rgba(0,255,231,0.02);
    overflow-x: auto;
  }

  .ebl-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
    min-width: 700px;
  }

  .ebl-table thead tr {
    background: rgba(0,255,231,0.06);
    border-bottom: 1px solid rgba(0,255,231,0.2);
  }

  .ebl-table th {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    color: #00ffe7;
    text-transform: uppercase;
    padding: 0.85rem 1rem;
    text-align: left;
    white-space: nowrap;
  }

  .ebl-table tbody tr {
    border-bottom: 1px solid rgba(0,255,231,0.06);
    transition: background 0.15s;
  }

  .ebl-table tbody tr:hover {
    background: rgba(0,255,231,0.04);
  }

  .ebl-table td {
    padding: 0.75rem 1rem;
    color: #b8f0e0;
    vertical-align: middle;
  }

  .ebl-booking-id {
    color: #ffe600;
    font-size: 0.78rem;
    letter-spacing: 0.05em;
  }

  .ebl-badge {
    display: inline-block;
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 3px 10px;
    clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
  }

  .ebl-badge-pending  { background: rgba(255,230,0,0.15); color: #ffe600; border: 1px solid rgba(255,230,0,0.3); }
  .ebl-badge-approved { background: rgba(0,255,231,0.12); color: #00ffe7; border: 1px solid rgba(0,255,231,0.3); }
  .ebl-badge-rejected { background: rgba(255,45,120,0.12); color: #ff2d78; border: 1px solid rgba(255,45,120,0.3); }
  .ebl-badge-default  { background: rgba(180,180,180,0.1); color: #aaa;    border: 1px solid rgba(180,180,180,0.2); }

  .ebl-actions {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .ebl-btn {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    border: none;
    padding: 0.35rem 0.85rem;
    cursor: pointer;
    clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
    transition: opacity 0.15s, transform 0.1s;
    white-space: nowrap;
  }

  .ebl-btn:hover { opacity: 0.82; transform: translateY(-1px); }

  .ebl-btn-view     { background: rgba(0,255,231,0.12); color: #00ffe7; border: 1px solid rgba(0,255,231,0.3); }
  .ebl-btn-approve  { background: rgba(0,255,231,0.18); color: #00ffe7; }
  .ebl-btn-reject   { background: rgba(255,45,120,0.18); color: #ff2d78; }

  .ebl-empty {
    text-align: center;
    padding: 4rem;
    color: rgba(0,255,231,0.3);
    font-size: 0.8rem;
    letter-spacing: 0.15em;
  }

  @media (max-width: 600px) {
    .ebl-wrapper { padding: 1rem; }
    .ebl-topbar-actions { width: 100%; }
    .ebl-topbar-actions button { flex: 1; }
  }
`;

const statusClass = (s) => {
  if (s === "pending")  return "ebl-badge ebl-badge-pending";
  if (s === "approved") return "ebl-badge ebl-badge-approved";
  if (s === "rejected") return "ebl-badge ebl-badge-rejected";
  return "ebl-badge ebl-badge-default";
};

export default function EventBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const data = await adminApi.getEventBookings();
      setBookings(data || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const approveBooking = async (id) => { await adminApi.approveEventBooking(id); loadBookings(); };
  const rejectBooking  = async (id) => { await adminApi.rejectEventBooking(id);  loadBookings(); };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="ebl-wrapper">

        <div className="ebl-topbar">
          <div className="ebl-title-group">
            <div className="ebl-icon">🎟</div>
            <div>
              <h2 className="ebl-title">Event Bookings</h2>
              <div className="ebl-count">
                {loading ? "LOADING…" : `${bookings.length} RECORDS`}
              </div>
            </div>
          </div>
          <div className="ebl-topbar-actions">
            <button className="ebl-verify-btn" onClick={() => navigate("/admin/event-bookings/verify-qr")}>
              ⬡ Verify Event Booking
            </button>
            <button className="ebl-add-btn" onClick={() => navigate("/admin/event-bookings/add")}>
              + Add Booking
            </button>
          </div>
        </div>

        {loading ? (
          <div className="ebl-loading">[ FETCHING BOOKING DATA… ]</div>
        ) : (
          <div className="ebl-table-wrap">
            <table className="ebl-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Name</th>
                  <th>Event</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan={8}><div className="ebl-empty">// NO BOOKINGS FOUND</div></td></tr>
                ) : bookings.map((b) => (
                  <tr key={b.id}>
                    <td><span className="ebl-booking-id">{b.booking_id}</span></td>
                    <td>{b.full_name}</td>
                    <td>{b.event_title}</td>
                    <td>{b.email}</td>
                    <td>{b.phone}</td>
                    <td>{b.amount_paid}</td>
                    <td><span className={statusClass(b.status)}>{b.status}</span></td>
                    <td>
                      <div className="ebl-actions">
                        <button className="ebl-btn ebl-btn-view" onClick={() => navigate(`/admin/event-bookings/${b.id}`)}>
                          View
                        </button>
                        {b.status === "pending" && <>
                          <button className="ebl-btn ebl-btn-approve" onClick={() => approveBooking(b.id)}>Approve</button>
                          <button className="ebl-btn ebl-btn-reject"  onClick={() => rejectBooking(b.id)}>Reject</button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}