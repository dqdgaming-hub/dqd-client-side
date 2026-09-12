import { useEffect, useRef, useState } from "react";
import { adminApi } from "../api/adminapi";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminCss } from "./adminTheme";

const TYPE_COLORS = {
  ps5:  { color: "rgba(0,255,225,0.10)",   border: "rgba(0,255,225,0.35)",  text: "#00ffe1" },
  pool: { color: "rgba(245,255,0,0.07)",   border: "rgba(245,255,0,0.30)",  text: "#f5ff00" },
  ott:  { color: "rgba(123,47,255,0.10)",  border: "rgba(123,47,255,0.35)", text: "#b57bff" },
};
const CATEGORY_TYPE_LABELS = { ps5: "PS5", pool: "Pool", ott: "OTT" };

function TypePill({ type }) {
  const s = TYPE_COLORS[type?.toLowerCase()] || TYPE_COLORS.ps5;
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 12px",
      fontSize: "0.58rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontFamily: "'Share Tech Mono', monospace",
      background: s.color,
      border: `1px solid ${s.border}`,
      color: s.text,
      clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
    }}>
      {CATEGORY_TYPE_LABELS[type?.toLowerCase()] || type || "—"}
    </span>
  );
}

function StatusDot({ on, activeColor = "#00ffe1" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{
        display: "inline-block",
        width: 6, height: 6,
        background: on ? activeColor : "rgba(255,255,255,0.15)",
        boxShadow: on ? `0 0 6px ${activeColor}` : "none",
        clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        transition: "background 0.2s, box-shadow 0.2s",
      }} />
      <span style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "0.58rem",
        letterSpacing: "0.06em",
        color: on ? activeColor : "rgba(224,248,255,0.25)",
      }}>
        {on ? "Yes" : "No"}
      </span>
    </span>
  );
}

function DateCell({ iso }) {
  if (!iso) return <span style={{ color: "rgba(224,248,255,0.2)" }}>—</span>;
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return (
    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.68rem" }}>
      <span style={{ color: "rgba(224,248,255,0.7)" }}>{date}</span>
      <span style={{ color: "rgba(224,248,255,0.3)", marginLeft: 4 }}>{time}</span>
    </span>
  );
}

const LOCAL_CSS = `
  /* ── Edit panel ── */
  .adm-edit-panel {
    background: rgba(0,255,225,0.025);
    border-top: 1px solid rgba(0,255,225,0.10);
    border-bottom: 1px solid rgba(0,255,225,0.10);
    border-left: 3px solid rgba(0,255,225,0.45);
    padding: 28px 28px 22px;
    animation: adm-slide-in 0.18s ease;
  }
  @keyframes adm-slide-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .adm-edit-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(0,255,225,0.55);
    margin-bottom: 20px;
  }
  .adm-edit-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 640px) {
    .adm-edit-grid { grid-template-columns: 1fr; }
  }
  .adm-edit-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid rgba(0,255,225,0.08);
  }

  /* ── Table ── */
  .adm-table td { vertical-align: middle; }
  .adm-row-editing td { background: rgba(0,255,225,0.02); }
  .adm-table-actions { display: flex; gap: 8px; align-items: center; }

  /* ── Count badge ── */
  .adm-count-badge {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    color: rgba(0,255,225,0.30);
    background: rgba(0,255,225,0.04);
    border: 1px solid rgba(0,255,225,0.12);
    padding: 3px 10px;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
  }

  /* ── Toggle (reused from AddCategory) ── */
  .adm-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    cursor: pointer;
  }
  .adm-toggle-label-group { display: flex; flex-direction: column; gap: 2px; }
  .adm-toggle-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(224,248,255,0.7);
  }
  .adm-toggle-hint {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.53rem;
    color: rgba(224,248,255,0.25);
    letter-spacing: 0.04em;
  }
  .adm-toggle {
    position: relative;
    width: 34px; height: 18px;
    flex-shrink: 0;
  }
  .adm-toggle input { opacity: 0; width: 0; height: 0; }
  .adm-toggle-slider {
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
  }
  .adm-toggle-slider::after {
    content: '';
    position: absolute;
    width: 10px; height: 10px;
    left: 3px; top: 3px;
    background: rgba(224,248,255,0.35);
    transition: transform 0.2s, background 0.2s;
    clip-path: polygon(0 0, calc(100% - 2px) 0, 100% 2px, 100% 100%, 2px 100%, 0 calc(100% - 2px));
  }
  .adm-toggle input:checked + .adm-toggle-slider {
    background: rgba(0,255,225,0.15);
    border-color: rgba(0,255,225,0.5);
  }
  .adm-toggle input:checked + .adm-toggle-slider::after {
    transform: translateX(15px);
    background: #00ffe1;
  }

  /* ── Image thumbnail ── */
  .adm-thumb {
    width: 36px; height: 36px;
    object-fit: cover;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
    border: 1px solid rgba(0,255,225,0.20);
    display: block;
  }
  .adm-thumb-placeholder {
    width: 36px; height: 36px;
    background: rgba(255,255,255,0.03);
    border: 1px dashed rgba(255,255,255,0.08);
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(224,248,255,0.15);
    font-size: 0.7rem;
  }

  /* ── Image upload in edit ── */
  .adm-image-drop {
    position: relative;
    border: 1px dashed rgba(0,255,225,0.20);
    background: rgba(0,255,225,0.02);
    padding: 16px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  }
  .adm-image-drop:hover { border-color: rgba(0,255,225,0.40); background: rgba(0,255,225,0.04); }
  .adm-image-drop-text {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.58rem;
    color: rgba(0,255,225,0.35);
    letter-spacing: 0.06em;
  }
  .adm-image-preview {
    position: relative;
    width: 100%;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    overflow: hidden;
  }
  .adm-image-preview img { width: 100%; height: 80px; object-fit: cover; display: block; }
  .adm-image-preview-remove {
    position: absolute; top: 4px; right: 4px;
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(255,80,80,0.5);
    color: rgba(255,100,100,0.9);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.52rem;
    letter-spacing: 0.06em;
    padding: 2px 7px;
    cursor: pointer;
  }

  /* ── Meta info strip ── */
  .adm-meta-strip {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    padding: 10px 14px;
    background: rgba(0,0,0,0.15);
    border: 1px solid rgba(255,255,255,0.04);
    margin-bottom: 16px;
  }
  .adm-meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .adm-meta-key {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.5rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(0,255,225,0.35);
  }
  .adm-meta-val {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.6rem;
    color: rgba(224,248,255,0.45);
    letter-spacing: 0.04em;
    word-break: break-all;
  }
`;

/* ─────────────────────────────────────────────────────────────── */
/*  Edit panel                                                      */
/* ─────────────────────────────────────────────────────────────── */
function EditCategoryPanel({ item, onSave, onCancel }) {
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name:          item.name          ?? "",
    category_type: item.category_type ?? "ps5",
    is_active:     item.is_active     ?? true,
    is_deleted:    item.is_deleted    ?? false,
  });
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(item.image || null);
  const [clearImg, setClearImg]       = useState(false);   // signal to backend
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");

  const applyImage = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setClearImg(false);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setClearImg(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Category name is required."); return; }
    setError("");
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("category_type", form.category_type);
      payload.append("is_active",  form.is_active);
      payload.append("is_deleted", form.is_deleted);
      if (imageFile)      payload.append("image", imageFile);
      else if (clearImg)  payload.append("image", "");   // clear existing
      await onSave(item.id, payload);
    } catch (err) {
      setError(err.message || "Update failed.");
      setSaving(false);
    }
  };

  const fmt = (iso) => iso
    ? new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="adm-edit-panel">
      <div className="adm-edit-title">▸ Editing — {item.name}</div>

      {/* Read-only meta strip */}
      <div className="adm-meta-strip">
        <div className="adm-meta-item">
          <span className="adm-meta-key">ID</span>
          <span className="adm-meta-val" style={{ fontSize: "0.52rem" }}>{item.id}</span>
        </div>
        <div className="adm-meta-item">
          <span className="adm-meta-key">Created</span>
          <span className="adm-meta-val">{fmt(item.created_at)}</span>
        </div>
        <div className="adm-meta-item">
          <span className="adm-meta-key">Last Updated</span>
          <span className="adm-meta-val">{fmt(item.updated_at)}</span>
        </div>
      </div>

      {error && <div className="adm-alert" style={{ marginBottom: 16 }}>⚠ {error}</div>}

      <form onSubmit={submit}>
        <div className="adm-edit-grid">

          {/* Name */}
          <div className="adm-field" style={{ marginBottom: 0 }}>
            <label className="adm-label">Category Name</label>
            <input
              className="adm-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={120}
              required
              autoFocus
            />
          </div>

          {/* Type */}
          <div className="adm-field" style={{ marginBottom: 0 }}>
            <label className="adm-label">Category Type</label>
            <select
              className="adm-select"
              value={form.category_type}
              onChange={(e) => setForm({ ...form, category_type: e.target.value })}
            >
              {Object.entries(CATEGORY_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* is_active toggle */}
          <label className="adm-toggle-row">
            <div className="adm-toggle-label-group">
              <span className="adm-toggle-title">Active</span>
              <span className="adm-toggle-hint">
                {form.is_active ? "Visible to users" : "Hidden"}
              </span>
            </div>
            <span className="adm-toggle">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <span className="adm-toggle-slider" />
            </span>
          </label>

          {/* is_deleted toggle */}
          <label className="adm-toggle-row">
            <div className="adm-toggle-label-group">
              <span className="adm-toggle-title" style={{ color: form.is_deleted ? "rgba(255,80,80,0.8)" : undefined }}>
                Maintanance
              </span>
              <span className="adm-toggle-hint">
                {form.is_deleted ? "Maintanance going on" : "Available"}
              </span>
            </div>
            <span className="adm-toggle">
              <input
                type="checkbox"
                checked={form.is_deleted}
                onChange={(e) => setForm({ ...form, is_deleted: e.target.checked })}
              />
              <span className="adm-toggle-slider" style={form.is_deleted ? {
                background: "rgba(255,80,80,0.15)",
                borderColor: "rgba(255,80,80,0.5)"
              } : {}} />
            </span>
          </label>

          {/* Image */}
          <div className="adm-field" style={{ marginBottom: 0, gridColumn: "1 / -1" }}>
            <label className="adm-label">
              Image <span style={{ color: "rgba(224,248,255,0.25)", fontWeight: 400 }}>(optional)</span>
            </label>
            {imagePreview ? (
              <div className="adm-image-preview">
                <img src={imagePreview} alt="Preview" />
                <button type="button" className="adm-image-preview-remove" onClick={removeImage}>
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div
                className="adm-image-drop"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => applyImage(e.target.files[0])}
                />
                <div className="adm-image-drop-text">⬆ Click to upload image</div>
              </div>
            )}
          </div>

        </div>

        <div className="adm-edit-actions">
          <button className="adm-btn-primary" type="submit" disabled={saving}>
            <div className="adm-btn-primary-bg" />
            <div className="adm-btn-primary-hover" />
            <span className="adm-btn-primary-inner">
              {saving ? "Saving…" : "▶ Save Changes"}
            </span>
          </button>
          <button className="adm-btn-ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Main list page                                                  */
/* ─────────────────────────────────────────────────────────────── */
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [editingId, setEditingId]   = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await adminApi.getCategories();
      setCategories(data?.results || data || []);
    } catch (err) {
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (id, data) => {
    await adminApi.updateCategory(id, data);
    setEditingId(null);
    loadData();
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await adminApi.deleteCategory(item.id);
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  };

  const toggleEdit = (id) => setEditingId((prev) => (prev === id ? null : id));

  return (
    <>
      <style>{adminCss}</style>
      <style>{LOCAL_CSS}</style>

      <div className="adm-pg">
        <AdminLayout>

          {/* ── Hero ── */}
          <section className="adm-hero">
            <div>
              <p className="adm-kicker">Game Management</p>
              <h1 className="adm-h1">Game <span>Categories</span></h1>
              <p className="adm-hero-sub">Manage how your games are grouped and discovered.</p>
            </div>
            <Link className="adm-btn-ghost" to="/admin/categories/add">+ Add Category</Link>
          </section>

          {error && <div className="adm-alert">⚠ {error}</div>}

          {/* ── Table panel ── */}
          <article className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-panel-title">All Categories</h2>
              <span className="adm-count-badge">{categories.length} total</span>
            </div>

            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>Img</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Active</th>
                    <th>Maintanance</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>

                {loading ? (
                  <tbody>
                    <tr>
                      <td colSpan={8}>
                        <div className="adm-empty">Loading categories…</div>
                      </td>
                    </tr>
                  </tbody>
                ) : categories.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={8}>
                        <div className="adm-empty">No categories yet — add one above.</div>
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  categories.map((item) => (
                    <tbody key={item.id}>
                      <tr className={editingId === item.id ? "adm-row-editing" : ""}>

                        {/* Image thumbnail */}
                        <td>
                          {item.image
                            ? <img className="adm-thumb" src={item.image} alt={item.name} />
                            : <div className="adm-thumb-placeholder">✕</div>
                          }
                        </td>

                        {/* Name */}
                        <td style={{
                          color: "rgba(224,248,255,0.85)",
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: "0.82rem",
                        }}>
                          {item.name}
                        </td>

                        {/* Type */}
                        <td><TypePill type={item.category_type} /></td>

                        {/* is_active */}
                        <td><StatusDot on={item.is_active} activeColor="#00ffe1" /></td>

                        {/* is_deleted */}
                        <td><StatusDot on={item.is_deleted} activeColor="#ff5050" /></td>

                        {/* created_at */}
                        <td><DateCell iso={item.created_at} /></td>

                        {/* updated_at */}
                        <td><DateCell iso={item.updated_at} /></td>

                        {/* Actions */}
                        <td>
                          <div className="adm-table-actions" style={{ justifyContent: "flex-end" }}>
                            <button
                              className="adm-btn-ghost"
                              onClick={() => toggleEdit(item.id)}
                              style={{ minWidth: 60 }}
                            >
                              {editingId === item.id ? "Close" : "Edit"}
                            </button>
                            <button className="adm-btn-danger" onClick={() => remove(item)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Inline edit row */}
                      {editingId === item.id && (
                        <tr>
                          <td colSpan={8} style={{ padding: 0 }}>
                            <EditCategoryPanel
                              item={item}
                              onSave={handleSave}
                              onCancel={() => setEditingId(null)}
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  ))
                )}
              </table>
            </div>
          </article>

        </AdminLayout>
      </div>
    </>
  );
}