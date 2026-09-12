import { useEffect, useState } from "react";
import { adminApi } from "../api/adminapi";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');

  :root {
    --cp-void:    #05050f;
    --cp-cyan:    #00ffe1;
    --cp-pink:    #ff006e;
    --cp-yellow:  #f5ff00;
    --cp-text:    #e0f8ff;
  }

  /* ── Overlay ── */
  .adm-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(3, 3, 14, 0.85);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: adm-modal-fade 0.18s ease;
  }

  @keyframes adm-modal-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ── Panel ── */
  .adm-modal {
    position: relative;
    width: 100%;
    max-width: 640px;
    max-height: 88vh;
    overflow-y: auto;
    background: rgba(6, 6, 18, 0.97);
    border: 1px solid rgba(0,255,225,0.16);
    border-top: 2px solid var(--cp-cyan);
    border-radius: 12px;
    box-shadow:
      0 24px 60px rgba(0,0,0,0.8),
      0 0 40px rgba(0,255,225,0.08);
    padding: 32px;
    font-family: 'Share Tech Mono', monospace;
    animation: adm-modal-pop 0.22s cubic-bezier(0.22,1,0.36,1);
  }

  @keyframes adm-modal-pop {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to   { opacity: 1; transform: none; }
  }

  .adm-modal::before {
    content: '';
    position: absolute;
    top: -2px; right: 18px;
    width: 10px; height: 10px;
    border-top: 2px solid var(--cp-cyan);
    border-left: 2px solid var(--cp-cyan);
  }

  .adm-modal::-webkit-scrollbar { width: 6px; }
  .adm-modal::-webkit-scrollbar-thumb {
    background: rgba(0,255,225,0.2);
    border-radius: 4px;
  }

  .adm-modal-close {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,255,225,0.05);
    border: 1px solid rgba(0,255,225,0.2);
    border-radius: 6px;
    color: rgba(224,248,255,0.5);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, box-shadow 0.15s;
  }

  .adm-modal-close:hover {
    color: var(--cp-cyan);
    border-color: var(--cp-cyan);
    box-shadow: 0 0 10px rgba(0,255,225,0.25);
  }

  .adm-modal-close svg { width: 14px; height: 14px; }

  .adm-loading {
    color: rgba(0,255,225,0.6);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: 0.75rem;
    padding: 60px 0;
    text-align: center;
  }

  /* ── Header ── */
  .adm-modal-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 26px;
    padding-right: 30px;
  }

  .adm-modal-avatar-wrap {
    position: relative;
    width: 84px;
    height: 84px;
    flex-shrink: 0;
  }

  .adm-modal-avatar,
  .adm-modal-avatar-fallback {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    border: 1.5px solid rgba(0,255,225,0.35);
  }

  .adm-modal-avatar { object-fit: cover; }

  .adm-modal-avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,255,225,0.06);
    color: var(--cp-cyan);
    font-family: 'Orbitron', monospace;
    font-size: 1.6rem;
    font-weight: 800;
  }

  .adm-modal-heading h3 {
    margin: 0 0 9px;
    font-family: 'Orbitron', monospace;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--cp-text);
  }

  .adm-pill-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .adm-pill {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.56rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border: 1px solid;
  }

  .adm-pill.role {
    color: var(--cp-yellow);
    border-color: rgba(245,255,0,0.35);
    background: rgba(245,255,0,0.06);
  }

  .adm-pill.verified {
    color: var(--cp-cyan);
    border-color: rgba(0,255,225,0.4);
    background: rgba(0,255,225,0.06);
  }

  /* ── Badges (status) ── */
  .adm-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.56rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border: 1px solid;
  }

  .adm-badge::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 5px currentColor;
  }

  .adm-badge.ok {
    color: var(--cp-cyan);
    border-color: rgba(0,255,225,0.4);
    background: rgba(0,255,225,0.06);
  }

  .adm-badge.danger {
    color: var(--cp-pink);
    border-color: rgba(255,0,110,0.4);
    background: rgba(255,0,110,0.06);
  }

  .adm-badge.off {
    color: rgba(224,248,255,0.4);
    border-color: rgba(224,248,255,0.15);
    background: rgba(224,248,255,0.03);
  }

  /* ── Stats row ── */
  .adm-stat-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 26px;
  }

  .adm-stat {
    background: rgba(0,255,225,0.035);
    border: 1px solid rgba(0,255,225,0.12);
    border-radius: 8px;
    padding: 14px 8px;
    text-align: center;
  }

  .adm-stat-value {
    display: block;
    font-family: 'Orbitron', monospace;
    font-size: 1rem;
    font-weight: 700;
    color: var(--cp-cyan);
    text-shadow: 0 0 12px rgba(0,255,225,0.3);
    margin-bottom: 5px;
    white-space: nowrap;
  }

  .adm-stat-label {
    display: block;
    font-size: 0.52rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(224,248,255,0.4);
  }

  /* ── Field grid ── */
  .adm-field-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px 20px;
    padding-bottom: 24px;
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(0,255,225,0.08);
  }

  .adm-field label {
    display: block;
    font-size: 0.54rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: rgba(0,255,225,0.5);
    margin-bottom: 5px;
  }

  .adm-field span {
    display: inline-block;
    color: var(--cp-text);
    font-size: 0.78rem;
    letter-spacing: 0.02em;
    text-transform: capitalize;
  }

  .adm-field span.no-cap { text-transform: none; }

  /* ── Devices section ── */
  .adm-modal-section-label {
    display: block;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(0,255,225,0.55);
    margin-bottom: 12px;
  }

  .adm-empty {
    font-size: 0.66rem;
    color: rgba(224,248,255,0.3);
    text-align: center;
    padding: 22px;
    border: 1px dashed rgba(0,255,225,0.15);
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .adm-table-wrap {
    overflow-x: auto;
    border: 1px solid rgba(0,255,225,0.1);
    border-radius: 8px;
  }

  .adm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.66rem;
  }

  .adm-table thead th {
    text-align: left;
    padding: 11px 14px;
    color: rgba(0,255,225,0.6);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
    font-size: 0.58rem;
    border-bottom: 1px solid rgba(0,255,225,0.18);
    background: rgba(0,255,225,0.03);
    white-space: nowrap;
  }

  .adm-table tbody td {
    padding: 11px 14px;
    color: var(--cp-text);
    border-bottom: 1px solid rgba(0,255,225,0.06);
  }

  .adm-table tbody tr:last-child td { border-bottom: none; }
  .adm-table tbody tr:hover { background: rgba(0,255,225,0.035); }

  .adm-modal-id {
    margin-top: 20px;
    text-align: right;
    font-size: 0.52rem;
    color: rgba(224,248,255,0.18);
    letter-spacing: 0.04em;
  }

  @media (max-width: 480px) {
    .adm-modal { padding: 24px 18px; }
    .adm-modal-header { flex-direction: column; text-align: center; padding-right: 0; }
    .adm-pill-row { justify-content: center; }
    .adm-stat-row { gap: 8px; }
  }
`;

function getInitials(user) {
  const source = user?.full_name || user?.email || "U";
  return source.trim().charAt(0).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UserDetail({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    setLoading(true);

    adminApi
      .getAdminUserDetails(userId)
      .then((data) => { if (mounted) setUser(data); })
      .catch((err) => console.error(err))
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [userId]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <style>{css}</style>

      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="adm-modal-close" type="button" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {loading || !user ? (
          <div className="adm-loading">Loading...</div>
        ) : (
          <>
            <div className="adm-modal-header">
              <div className="adm-modal-avatar-wrap">
                {user.profile_image ? (
                  <img src={user.profile_image} alt="" className="adm-modal-avatar" />
                ) : (
                  <div className="adm-modal-avatar-fallback">{getInitials(user)}</div>
                )}
              </div>

              <div className="adm-modal-heading">
                <h3>{user.full_name}</h3>
                <div className="adm-pill-row">
                  <span className="adm-pill role">{user.role || "user"}</span>
                  {user.is_verified && <span className="adm-pill verified">Verified</span>}
                  {user.is_active ? (
                    <span className="adm-badge ok">Active</span>
                  ) : (
                    <span className="adm-badge danger">Suspended</span>
                  )}
                </div>
              </div>
            </div>

            <div className="adm-stat-row">
              <div className="adm-stat">
                <span className="adm-stat-value">{user.loyalty_points ?? 0}</span>
                <span className="adm-stat-label">Loyalty Points</span>
              </div>
              <div className="adm-stat">
                <span className="adm-stat-value">{user.total_bookings ?? 0}</span>
                <span className="adm-stat-label">Total Bookings</span>
              </div>
              <div className="adm-stat">
                <span className="adm-stat-value">{formatDate(user.created_at)}</span>
                <span className="adm-stat-label">Member Since</span>
              </div>
            </div>

            <div className="adm-field-grid">
              <div className="adm-field">
                <label>Email</label>
                <span className="no-cap">{user.email}</span>
              </div>
              <div className="adm-field">
                <label>Phone</label>
                <span className="no-cap">{user.phone}</span>
              </div>
              <div className="adm-field">
                <label>Gender</label>
                <span>{user.gender || "—"}</span>
              </div>
            </div>

            <div>
              <span className="adm-modal-section-label">Devices</span>

              {user.devices && user.devices.length > 0 ? (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Device</th>
                        <th>Type</th>
                        <th>Browser</th>
                        <th>OS</th>
                        <th>IP</th>
                        <th>Online</th>
                        <th>Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.devices.map((device) => (
                        <tr key={device.id}>
                          <td>{device.device_name}</td>
                          <td>{device.device_type}</td>
                          <td>{device.browser}</td>
                          <td>{device.operating_system}</td>
                          <td>{device.ip_address}</td>
                          <td>
                            {device.is_online ? (
                              <span className="adm-badge ok">Online</span>
                            ) : (
                              <span className="adm-badge off">Offline</span>
                            )}
                          </td>
                          <td>{device.last_seen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="adm-empty">No devices linked yet</div>
              )}
            </div>

            <div className="adm-modal-id">ID: {user.id}</div>
          </>
        )}
      </div>
    </div>
  );
}