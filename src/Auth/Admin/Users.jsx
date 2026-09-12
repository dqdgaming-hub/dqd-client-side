import { useEffect, useState } from "react";
import { adminApi } from "../api/adminapi";
import AdminLayout from "./AdminLayout";
import UserDetail from "./UserDetail";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');

  :root {
    --cp-void:    #05050f;
    --cp-cyan:    #00ffe1;
    --cp-pink:    #ff006e;
    --cp-yellow:  #f5ff00;
    --cp-text:    #e0f8ff;
  }

  .adm-page-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 28px;
  }

  .adm-page-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--cp-text);
    margin: 0;
    position: relative;
    padding-left: 16px;
  }

  .adm-page-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 70%;
    background: var(--cp-cyan);
    box-shadow: 0 0 8px var(--cp-cyan);
  }

  .adm-search {
    background: rgba(0,255,225,0.04);
    border: 1px solid rgba(0,255,225,0.25);
    border-radius: 6px;
    padding: 10px 14px;
    color: var(--cp-text);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    min-width: 240px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .adm-search::placeholder { color: rgba(224,248,255,0.3); }

  .adm-search:focus {
    border-color: var(--cp-cyan);
    box-shadow: 0 0 0 3px rgba(0,255,225,0.08);
  }

  .adm-panel {
    background: rgba(8,8,20,0.7);
    border: 1px solid rgba(0,255,225,0.12);
    border-radius: 10px;
    overflow: hidden;
    backdrop-filter: blur(12px);
  }

  .adm-loading {
    font-family: 'Share Tech Mono', monospace;
    color: rgba(0,255,225,0.6);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: 0.75rem;
    padding: 50px;
    text-align: center;
  }

  .adm-table-wrap { overflow-x: auto; }

  .adm-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
  }

  .adm-table thead th {
    text-align: left;
    padding: 14px 18px;
    color: rgba(0,255,225,0.6);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 600;
    font-size: 0.62rem;
    border-bottom: 1px solid rgba(0,255,225,0.18);
    background: rgba(0,255,225,0.03);
    white-space: nowrap;
  }

  .adm-table tbody td {
    padding: 14px 18px;
    color: var(--cp-text);
    border-bottom: 1px solid rgba(0,255,225,0.06);
    vertical-align: middle;
  }

  .adm-table tbody tr { transition: background 0.15s; }
  .adm-table tbody tr:last-child td { border-bottom: none; }
  .adm-table tbody tr:hover { background: rgba(0,255,225,0.035); }

  .adm-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border: 1px solid;
    white-space: nowrap;
  }

  .adm-badge::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 5px currentColor;
    flex-shrink: 0;
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

  .adm-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .adm-btn {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 7px 12px;
    border-radius: 5px;
    border: 1px solid;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }

  .adm-btn.cyan { color: var(--cp-cyan); border-color: rgba(0,255,225,0.4); }
  .adm-btn.cyan:hover { background: rgba(0,255,225,0.08); box-shadow: 0 0 10px rgba(0,255,225,0.2); }

  .adm-btn.yellow { color: var(--cp-yellow); border-color: rgba(245,255,0,0.35); }
  .adm-btn.yellow:hover { background: rgba(245,255,0,0.07); box-shadow: 0 0 10px rgba(245,255,0,0.15); }

  .adm-btn.pink { color: var(--cp-pink); border-color: rgba(255,0,110,0.4); }
  .adm-btn.pink:hover { background: rgba(255,0,110,0.08); box-shadow: 0 0 10px rgba(255,0,110,0.2); }

  @media (max-width: 640px) {
    .adm-search { width: 100%; min-width: 0; }
    .adm-page-head { flex-direction: column; align-items: flex-start; }
  }

    /* ── Image thumbnail (table/cards) ── */
  .adm-thumb {
    width: 40px; height: 40px;
    object-fit: cover;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
    border: 1px solid rgba(0,255,225,0.20);
    display: block;
    flex-shrink: 0;
  }
  .adm-thumb-placeholder {
    width: 40px; height: 40px;
    background: rgba(255,255,255,0.03);
    border: 1px dashed rgba(255,255,255,0.08);
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(224,248,255,0.15);
    font-size: 0.7rem;
    flex-shrink: 0;
  }
`;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getAdminUsers({
        search,
      });

      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleStatus = async (user) => {
    try {
      await adminApi.updateAdminUserStatus(
        user.id,
        !user.is_active
      );

      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) {
      return;
    }

    try {
      await adminApi.deleteAdminUser(userId);

      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout>
      <style>{css}</style>

      <div className="adm-page-head">
        <h2 className="adm-page-title">Users Management</h2>

        <input
          className="adm-search"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="adm-loading">Loading...</div>
      ) : (
        <div className="adm-panel">
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                <th style={{ width: 48 }}>Img</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Loyalty</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                    {user.profile_image
                              ? <img className="adm-thumb" src={user.profile_image} alt={user.full_name} />
                              : <div className="adm-thumb-placeholder">✕</div>
                            }
                    </td>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>

                    <td>
                      {user.is_active ? (
                        <span className="adm-badge ok">Active</span>
                      ) : (
                        <span className="adm-badge danger">Suspended</span>
                      )}
                    </td>

                    <td>{user.loyalty_points}</td>

                    <td>
                      <div className="adm-actions">
                        <button
                          className="adm-btn cyan"
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          View
                        </button>

                        <button
                          className="adm-btn yellow"
                          onClick={() => toggleStatus(user)}
                        >
                          {user.is_active ? "Suspend" : "Activate"}
                        </button>

                        <button
                          className="adm-btn pink"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUserId && (
        <UserDetail
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </AdminLayout>
  );
}