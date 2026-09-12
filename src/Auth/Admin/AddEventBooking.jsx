import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminapi";
import AdminLayout from "./AdminLayout";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');

  .eb-wrapper {
    font-family: 'Share Tech Mono', monospace;
    padding: 2rem;
    max-width: 760px;
    margin: 0 auto;
  }

  .eb-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .eb-header-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #00ffe7 0%, #ff2d78 100%);
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    flex-shrink: 0;
  }

  .eb-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #00ffe7;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    text-shadow: 0 0 16px rgba(0,255,231,0.5);
    margin: 0;
  }

  .eb-subtitle {
    font-size: 0.7rem;
    color: #ff2d78;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .eb-form-panel {
    background: rgba(0,255,231,0.03);
    border: 1px solid rgba(0,255,231,0.15);
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
    padding: 2rem;
    position: relative;
  }

  .eb-form-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #00ffe7, transparent 60%);
  }

  .eb-section-label {
    font-size: 0.62rem;
    letter-spacing: 0.25em;
    color: #00ffe7;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
    opacity: 0.7;
  }

  .eb-field {
    margin-bottom: 1.4rem;
  }

  .eb-label {
    display: block;
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    color: #ffe600;
    text-transform: uppercase;
    margin-bottom: 0.4rem;
  }

  .eb-input,
  .eb-select,
  .eb-textarea {
    width: 100%;
    background: rgba(0,0,0,0.5);
    border: 1px solid rgba(0,255,231,0.2);
    color: #e0ffe0;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.88rem;
    padding: 0.6rem 0.85rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
    box-sizing: border-box;
  }

  .eb-input:focus,
  .eb-select:focus,
  .eb-textarea:focus {
    border-color: #00ffe7;
    box-shadow: 0 0 12px rgba(0,255,231,0.2);
    background: rgba(0,255,231,0.05);
  }

  .eb-select {
    cursor: pointer;
    appearance: none;
    background-color: rgba(0,0,0,0.5);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2300ffe7' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.85rem center;
    padding-right: 2.5rem;
  }

  .eb-select option {
    background: #0a0a1a;
    color: #e0ffe0;
  }

  .eb-textarea {
    resize: vertical;
    min-height: 90px;
    clip-path: none;
    border-radius: 0;
  }

  .eb-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .eb-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,38,120,0.3), transparent);
    margin: 1.5rem 0;
  }

  .eb-submit {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #0a0a1a;
    background: linear-gradient(90deg, #00ffe7, #00c9b0);
    border: none;
    padding: 0.8rem 2.5rem;
    cursor: pointer;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: opacity 0.2s, transform 0.1s, box-shadow 0.2s;
    display: block;
    margin-top: 0.5rem;
  }

  .eb-submit:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 24px rgba(0,255,231,0.35);
  }

  .eb-submit:active {
    transform: translateY(0);
  }

  .eb-tag {
    display: inline-block;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    color: #ff2d78;
    border: 1px solid rgba(255,45,120,0.3);
    padding: 2px 8px;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 600px) {
    .eb-grid-2 { grid-template-columns: 1fr; }
    .eb-wrapper { padding: 1rem; }
    .eb-form-panel { padding: 1.25rem; }
  }
`;

export default function AddEventBooking() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    event: "", user: "", full_name: "", email: "",
    phone: "", amount_paid: "", notes: "",
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const eventData = await adminApi.getEvents();
    const userData = await adminApi.getUsers();
    setEvents(eventData || []);
    setUsers(userData || []);
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createEventBooking(form);
      navigate("/admin/event-bookings");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="eb-wrapper">

        <div className="eb-header">
          <div className="eb-header-icon">🎟</div>
          <div>
            <h2 className="eb-title">New Booking</h2>
            <div className="eb-subtitle">Event Registration System</div>
          </div>
        </div>

        <div className="eb-tag">// BOOKING_FORM_v2</div>

        <form onSubmit={submit}>
          <div className="eb-form-panel">

            {/* Event + User */}
            <div className="eb-section-label">▸ Assignment</div>
            <div className="eb-grid-2">
              <div className="eb-field">
                <label className="eb-label">Event</label>
                <select name="event" className="eb-select" value={form.event} onChange={change} required>
                  <option value="">— Select Event —</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>
              <div className="eb-field">
                <label className="eb-label">User Account</label>
                <select
                  name="user"
                  className="eb-select"
                  value={form.user}
                  onChange={(e) => {
                    const userId = e.target.value;
                    const selectedUser = users.find((u) => String(u.id) === userId);
                    setForm({
                      ...form,
                      user: userId,
                      full_name: selectedUser?.full_name || "",
                      email: selectedUser?.email || "",
                      phone: selectedUser?.phone || "",
                    });
                  }}
                >
                  <option value="">Guest Booking</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="eb-divider" />

            {/* Contact Info */}
            <div className="eb-section-label">▸ Contact Info</div>
            <div className="eb-field">
              <label className="eb-label">Full Name</label>
              <input className="eb-input" placeholder="e.g. Ahmed Al-Rashidi" name="full_name" value={form.full_name} onChange={change} />
            </div>
            <div className="eb-grid-2">
              <div className="eb-field">
                <label className="eb-label">Email</label>
                <input className="eb-input" placeholder="user@domain.com" name="email" type="email" value={form.email} onChange={change} />
              </div>
              <div className="eb-field">
                <label className="eb-label">Phone</label>
                <input className="eb-input" placeholder="+91 ···" name="phone" value={form.phone} onChange={change} />
              </div>
            </div>

            <div className="eb-divider" />

            {/* Payment + Notes */}
            <div className="eb-section-label">▸ Payment &amp; Notes</div>
            <div className="eb-field">
              <label className="eb-label">Amount Paid (INR)</label>
              <input className="eb-input" placeholder="0.00" name="amount_paid" type="number" value={form.amount_paid} onChange={change} />
            </div>
            <div className="eb-field">
              <label className="eb-label">Notes</label>
              <textarea className="eb-textarea" placeholder="Optional notes or special requests…" name="notes" value={form.notes} onChange={change} />
            </div>

            <button type="submit" className="eb-submit">
              ▶ Create Booking
            </button>

          </div>
        </form>

      </div>
    </AdminLayout>
  );
}