import { useEffect, useState } from "react";
import { adminApi } from "../api/adminapi";
import AdminLayout from "./AdminLayout";
import UserDetail from "./UserDetail";
import { showWhatsApp } from "../../utils/whatsapp";
import { saCss, errorText, fieldErrors, generatePassword } from "./simpleAdminUi";
import useApi from "../../hooks/useApi";

const PAGE_SIZE = 20;
const EMPTY_FORM = { first_name: "", last_name: "", phone: "", email: "", password: "" };

function validate(form, isNew) {
  const errors = {};
  if (!form.first_name.trim()) errors.first_name = "Name is required.";
  const phone = form.phone.replace(/[^\d+]/g, "");
  if (!/^\+?\d{8,15}$/.test(phone)) errors.phone = "Enter a valid mobile number.";
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email or leave it empty.";
  }
  if (isNew && !form.password) errors.password = "Set a password for the user.";
  if (form.password && form.password.length < 8) errors.password = "Use at least 8 characters.";
  if (form.password && /^\d+$/.test(form.password)) errors.password = "Password can't be only numbers.";
  return errors;
}

function UserFormModal({ user, onClose, onSaved }) {
  const isNew = !user;
  const [form, setForm] = useState(
    isNew
      ? EMPTY_FORM
      : {
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          phone: user.phone || "",
          email: user.email || "",
          password: "",
        },
  );
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(isNew);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form, isNew);
    setErrors(found);
    setError("");
    if (Object.keys(found).length) return;

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.replace(/[^\d+]/g, ""),
      email: form.email.trim().toLowerCase() || null,
    };
    if (form.password) payload.password = form.password;

    setSaving(true);
    try {
      const data = isNew
        ? await adminApi.createAdminUser(payload)
        : await adminApi.updateAdminUser(user.id, payload);
      if (data?.whatsapp_url) {
        showWhatsApp(
          data.whatsapp_url,
          isNew ? `Send login details to ${payload.first_name}` : `Send new password to ${payload.first_name}`,
        );
      }
      onSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorText(err, "Could not save the user."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sa-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="sa-modal sa" onSubmit={submit} noValidate>
        <h3>{isNew ? "Add user" : `Edit ${user.full_name || "user"}`}</h3>
        {error && <div className="sa-error">{error}</div>}

        <label className="sa-field">
          <span>Name</span>
          <input className="sa-input" value={form.first_name} onChange={set("first_name")} maxLength={100} autoFocus />
          {errors.first_name && <div className="sa-field-err">{errors.first_name}</div>}
        </label>

        {!isNew && (
          <label className="sa-field">
            <span>Last name <em>(optional)</em></span>
            <input className="sa-input" value={form.last_name} onChange={set("last_name")} maxLength={100} />
          </label>
        )}

        <label className="sa-field">
          <span>Mobile number <em>(WhatsApp)</em></span>
          <input
            className="sa-input"
            type="tel"
            inputMode="tel"
            placeholder="98765 43210"
            value={form.phone}
            onChange={set("phone")}
            maxLength={20}
          />
          {errors.phone && <div className="sa-field-err">{errors.phone}</div>}
        </label>

        <label className="sa-field">
          <span>Email <em>(optional)</em></span>
          <input className="sa-input" type="email" value={form.email} onChange={set("email")} maxLength={254} />
          {errors.email && <div className="sa-field-err">{errors.email}</div>}
        </label>

        <label className="sa-field">
          <span>{isNew ? "Password" : "New password"} {!isNew && <em>(leave empty to keep the current one)</em>}</span>
          <div className="sa-inline">
            <input
              className="sa-input"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              maxLength={128}
            />
            <button type="button" className="sa-btn" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="sa-btn"
              onClick={() => {
                setForm((p) => ({ ...p, password: generatePassword() }));
                setShowPassword(true);
              }}
            >
              Generate
            </button>
          </div>
          {errors.password && <div className="sa-field-err">{errors.password}</div>}
          <div className="sa-muted" style={{ marginTop: 6 }}>
            After saving you can send the login details to the user on WhatsApp.
          </div>
        </label>

        <div className="sa-modal-foot">
          <button type="button" className="sa-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="sa-btn primary" disabled={saving}>
            {saving ? "Saving…" : isNew ? "Add user" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | user
  const [viewingId, setViewingId] = useState(null);

  // Debounce typing → server-side search
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const params = { search: query, page, page_size: PAGE_SIZE };
  const { data, error: loadError, loading, reload: load } = useApi(
    () => adminApi.getAdminUsers(params),
    JSON.stringify(params),
  );
  const rows = Array.isArray(data) ? data : data?.results || [];
  const count = Array.isArray(data) ? data.length : data?.count || 0;
  const error = loadError ? errorText(loadError, "Could not load users.") : "";

  const toggleStatus = async (user) => {
    const action = user.is_active ? "suspend" : "activate";
    if (!window.confirm(`Do you want to ${action} ${user.full_name || "this user"}?`)) return;
    setBusyId(user.id);
    try {
      await adminApi.updateAdminUserStatus(user.id, !user.is_active);
      load();
    } catch (err) {
      alert(errorText(err));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (user) => {
    if (!window.confirm(`Delete ${user.full_name || "this user"}? Their booking history is kept.`)) return;
    setBusyId(user.id);
    try {
      await adminApi.deleteAdminUser(user.id);
      load();
    } catch (err) {
      alert(errorText(err));
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
            <h2 className="sa-title">Users</h2>
            <p className="sa-sub">{count} customer{count === 1 ? "" : "s"}</p>
          </div>
          <button className="sa-btn primary" onClick={() => setEditing("new")}>+ Add user</button>
        </div>

        <div className="sa-toolbar">
          <input
            className="sa-input grow"
            type="search"
            placeholder="Search name, mobile or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={100}
          />
        </div>

        {error && <div className="sa-error">{error}</div>}

        <div className="sa-panel">
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th className="sa-hide-sm">Email</th>
                  <th className="sa-hide-sm">Points</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0 ? (
                  <tr><td colSpan={6} className="sa-loading">Loading users…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={6} className="sa-empty">{query ? "No users match your search." : "No users yet. Add the first one."}</td></tr>
                ) : (
                  rows.map((u) => (
                    <tr key={u.id}>
                      <td className="sa-strong">{u.full_name || "—"}</td>
                      <td>{u.phone || "—"}</td>
                      <td className="sa-hide-sm">{u.email || <span className="sa-muted">—</span>}</td>
                      <td className="sa-hide-sm">{u.loyalty_points ?? 0}</td>
                      <td>
                        {u.is_locked ? (
                          <span className="sa-badge locked">Locked</span>
                        ) : (
                          <span className={`sa-badge ${u.is_active ? "active" : "suspended"}`}>
                            {u.is_active ? "Active" : "Suspended"}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="sa-actions">
                          <button className="sa-btn" onClick={() => setViewingId(u.id)}>View</button>
                          <button className="sa-btn" onClick={() => setEditing(u)}>Edit</button>
                          <button
                            className={`sa-btn ${u.is_active ? "" : "ok"}`}
                            disabled={busyId === u.id}
                            onClick={() => toggleStatus(u)}
                          >
                            {u.is_active ? "Suspend" : "Activate"}
                          </button>
                          <button className="sa-btn danger" disabled={busyId === u.id} onClick={() => remove(u)}>
                            Delete
                          </button>
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

      {editing && (
        <UserFormModal
          user={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {viewingId && <UserDetail userId={viewingId} onClose={() => setViewingId(null)} />}
    </AdminLayout>
  );
}
