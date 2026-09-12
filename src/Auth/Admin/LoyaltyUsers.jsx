// LoyaltyUsers.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

const neon = { cyan: "#00f5ff", pink: "#ff2d78", yellow: "#ffe600", card: "#0d0d1a" };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  .lu-wrap { font-family: 'Share Tech Mono', monospace; min-height: 100vh; padding: 2rem; }

  .lu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap; }
  .lu-title { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 1.6rem; color: ${neon.yellow}; text-shadow: 0 0 20px ${neon.yellow}55; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }
  .lu-subtitle { font-size: 0.65rem; letter-spacing: 0.2em; color: #3a3a5a; margin-top: 0.25rem; text-transform: uppercase; }
  .lu-btn { font-family: 'Orbitron', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.5rem 1.25rem; border: 1px solid; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px)); cursor: pointer; background: transparent; transition: box-shadow 0.2s, transform 0.15s; }
  .lu-btn:hover { transform: translateY(-2px); }
  .lu-btn-primary { color: ${neon.yellow}; border-color: ${neon.yellow}88; background: ${neon.yellow}11; }
  .lu-btn-primary:hover { box-shadow: 0 0 16px ${neon.yellow}44; }
  .lu-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  .lu-toolbar { display: flex; align-items: center; gap: 0.75rem; background: ${neon.card}; border: 1px solid #1a1a3e; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px)); padding: 0.7rem 1.1rem; margin-bottom: 1.25rem; }
  .lu-toolbar-icon { color: ${neon.yellow}88; font-size: 0.85rem; flex-shrink: 0; }
  .lu-search { flex: 1; min-width: 0; background: transparent; border: none; outline: none; color: #c8c8e8; font-family: 'Share Tech Mono', monospace; font-size: 0.85rem; }
  .lu-search::placeholder { color: #3a3a5a; }
  .lu-toolbar-count { font-size: 0.6rem; letter-spacing: 0.15em; color: #3a3a5a; text-transform: uppercase; flex-shrink: 0; white-space: nowrap; }

  .lu-error { font-size: 0.7rem; letter-spacing: 0.05em; padding: 0.65rem 1rem; margin-bottom: 1.25rem; border-left: 3px solid ${neon.pink}; background: #1a0a0e; color: #ff8aa8; }

  .lu-panel { background: ${neon.card}; border: 1px solid #1a1a3e; clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px)); overflow: hidden; }
  .lu-panel-header { background: linear-gradient(90deg, ${neon.yellow}11 0%, transparent 100%); border-bottom: 1px solid ${neon.yellow}22; padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
  .lu-panel-dot { width: 6px; height: 6px; border-radius: 50%; background: ${neon.yellow}; box-shadow: 0 0 8px ${neon.yellow}; }
  .lu-panel-label { font-size: 0.65rem; letter-spacing: 0.25em; color: ${neon.yellow}88; text-transform: uppercase; }
  .lu-count { font-size: 0.65rem; color: #3a3a5a; letter-spacing: 0.1em; margin-left: auto; }

  .lu-table { width: 100%; border-collapse: collapse; }
  .lu-table thead tr { border-bottom: 1px solid #1a1a3e; }
  .lu-table th { font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.2em; color: #3a3a6a; text-transform: uppercase; padding: 0.75rem 1.25rem; text-align: left; }
  .lu-table td { padding: 0.85rem 1.25rem; font-size: 0.8rem; color: #8a8aaa; border-bottom: 1px solid #0f0f20; vertical-align: middle; }
  .lu-table tbody tr { transition: background 0.15s; }
  .lu-table tbody tr:hover { background: ${neon.yellow}06; }
  .lu-table tbody tr:hover td { color: #aaaacc; }
  .lu-name { color: #c8c8e8 !important; font-weight: 500; }
  .lu-email { color: #6a6a9a !important; font-size: 0.75rem; }
  .lu-badge { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; padding: 0.25rem 0.6rem; border: 1px solid; clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%); }
  .lu-badge-points { color: ${neon.yellow}; border-color: ${neon.yellow}55; background: ${neon.yellow}11; }
  .lu-badge-redeemed { color: ${neon.pink}; border-color: ${neon.pink}55; background: ${neon.pink}11; }
  .lu-badge-active { color: ${neon.cyan}; border-color: ${neon.cyan}55; background: ${neon.cyan}11; }
  .lu-badge-inactive { color: ${neon.pink}; border-color: ${neon.pink}55; background: ${neon.pink}11; }
  .lu-badge-active::before, .lu-badge-inactive::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: currentColor; box-shadow: 0 0 4px currentColor; }
  .lu-loading, .lu-empty { text-align: center; padding: 3rem; color: #2a2a4a; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; }
  .lu-loading { color: ${neon.yellow}44; animation: lu-blink 1s step-end infinite; }
  @keyframes lu-blink { 50% { opacity: 0.3; } }

  .lu-row-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .lu-action-btn { font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.4rem 0.75rem; border: 1px solid; clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%); cursor: pointer; background: transparent; transition: box-shadow 0.2s, transform 0.15s; white-space: nowrap; }
  .lu-action-btn:hover { transform: translateY(-1px); }
  .lu-action-ghost { color: ${neon.cyan}99; border-color: ${neon.cyan}44; }
  .lu-action-ghost:hover { box-shadow: 0 0 10px ${neon.cyan}33; color: ${neon.cyan}; }
  .lu-action-fill { color: ${neon.yellow}; border-color: ${neon.yellow}88; background: ${neon.yellow}11; }
  .lu-action-fill:hover { box-shadow: 0 0 12px ${neon.yellow}44; }

  @media (max-width: 760px) {
    .lu-wrap { padding: 1.25rem; }
    .lu-table thead { display: none; }
    .lu-table, .lu-table tbody, .lu-table tr, .lu-table td { display: block; width: 100%; }
    .lu-table tr { border-bottom: 1px solid #1a1a3e; padding: 0.9rem 1.25rem 1.1rem; }
    .lu-table tbody tr:last-child { border-bottom: none; }
    .lu-table td { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.35rem 0; border-bottom: none; }
    .lu-table td::before { content: attr(data-label); font-family: 'Orbitron', sans-serif; font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase; color: #4a4a6a; flex-shrink: 0; }
    .lu-table td.lu-actions-cell { justify-content: flex-start; padding-top: 0.6rem; }
    .lu-table td.lu-actions-cell::before { display: none; }
  }
`;

export default function LoyaltyUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await adminApi.getLoyaltyUsers();
      setUsers(usersData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users. Try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.full_name + " " + u.email).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="lu-wrap">

        <div className="lu-header">
          <div>
            <h3 className="lu-title">Loyalty Users</h3>
            <p className="lu-subtitle">// Member points directory</p>
          </div>
          <button className="lu-btn lu-btn-primary" onClick={loadUsers} disabled={loading}>
            {loading ? "Syncing…" : "⟳ Refresh"}
          </button>
        </div>

        {error && <div className="lu-error">! {error}</div>}

        <div className="lu-toolbar">
          <span className="lu-toolbar-icon">⌕</span>
          <input
            className="lu-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {!loading && (
            <span className="lu-toolbar-count">
              {filteredUsers.length} / {users.length} shown
            </span>
          )}
        </div>

        <div className="lu-panel">
          <div className="lu-panel-header">
            <div className="lu-panel-dot" />
            <span className="lu-panel-label">User Registry</span>
            {!loading && <span className="lu-count">{filteredUsers.length} records</span>}
          </div>

          {loading ? (
            <div className="lu-loading">[ Loading member data… ]</div>
          ) : filteredUsers.length === 0 ? (
            <div className="lu-empty">No users found</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="lu-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Points</th>
                    <th>Redeemed</th>
                    <th>Transactions</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td data-label="User" className="lu-name">{user.full_name}</td>
                      <td data-label="Email" className="lu-email">{user.email}</td>
                      <td data-label="Phone">{user.phone || "—"}</td>
                      <td data-label="Points">
                        <span className="lu-badge lu-badge-points">{user.loyalty_points}</span>
                      </td>
                      <td data-label="Redeemed">
                        <span className="lu-badge lu-badge-redeemed">{user.redeemed_points}</span>
                      </td>
                      <td data-label="Transactions">{user.total_transactions}</td>
                      <td data-label="Status">
                        <span className={`lu-badge ${user.is_active ? "lu-badge-active" : "lu-badge-inactive"}`}>
                          {user.is_active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td data-label="Actions" className="lu-actions-cell">
                        <div className="lu-row-actions">
                          <button className="lu-action-btn lu-action-ghost" onClick={() => navigate(`/admin/loyalty/${user.id}`)}>
                            History
                          </button>
                          <button className="lu-action-btn lu-action-fill" onClick={() => navigate(`/admin/loyalty/${user.id}/adjust`)}>
                            Add / Deduct
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}