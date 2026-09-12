import React, { useEffect, useRef, useState } from "react";
import { adminApi } from "../api/adminapi";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminCss } from "./adminTheme";

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

const MAINTENANCE_PILL = {
  background: "rgba(255,0,110,0.1)",
  border: "1px solid rgba(255,0,110,0.35)",
  color: "#ff006e",
  clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
  display: "inline-block",
  padding: "2px 10px",
  fontSize: "0.55rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontFamily: "'Share Tech Mono', monospace",
  flexShrink: 0,
};

const ACTIVE_PILL = {
  ...MAINTENANCE_PILL,
  background: "rgba(0,255,225,0.1)",
  border: "1px solid rgba(0,255,225,0.3)",
  color: "#00ffe1",
};

const EDIT_PANEL_CSS = `
  .adm-edit-panel {
    background: rgba(0,255,225,0.03);
    border: 1px solid rgba(0,255,225,0.15);
    border-left: 3px solid rgba(0,255,225,0.5);
    padding: 24px;
    margin-bottom: 2px;
    animation: adm-slide-in 0.18s ease;
  }
  @keyframes adm-slide-in {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .adm-edit-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(0,255,225,0.6);
    margin-bottom: 18px;
  }
  .adm-edit-actions {
    display: flex;
    gap: 10px;
    margin-top: 18px;
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

  /* ── Image upload (edit panel) ── */
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
  .adm-image-preview img { width: 100%; height: 100px; object-fit: cover; display: block; }
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
`;

function EditGamePanel({ game, categories, onSave, onCancel }) {
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    category:         game.category         ?? "",
    name:             game.name             ?? "",
    description:      game.description      ?? "",
    price_per_hour:   game.price_per_hour   ?? "",
    min_capacity:     game.min_capacity     ?? 1,
    max_capacity:     game.max_capacity     ?? 1,
    maintenance_mode: game.maintenance_mode ?? false,
    is_active:        game.is_active        ?? true,
  });
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(game.image || null);
  const [clearImg, setClearImg]         = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((cur) => ({
      ...cur,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (Number(form.min_capacity) > Number(form.max_capacity)) {
      setError("Min capacity cannot exceed max capacity.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("category", form.category);
      payload.append("name", form.name.trim());
      payload.append("description", form.description ?? "");
      payload.append("price_per_hour", form.price_per_hour);
      payload.append("min_capacity", form.min_capacity);
      payload.append("max_capacity", form.max_capacity);
      payload.append("maintenance_mode", form.maintenance_mode);
      payload.append("is_active", form.is_active);
      if (imageFile)     payload.append("image", imageFile);
      else if (clearImg) payload.append("image", "");

      await onSave(game.id, payload);
    } catch (err) {
      setError(err.message || "Update failed.");
      setSaving(false);
    }
  };

  return (
    <div className="adm-edit-panel">
      <div className="adm-edit-title">▸ Editing — {game.name}</div>
      {error && <div className="adm-alert" style={{ marginBottom: 14 }}>⚠ {error}</div>}
      <form onSubmit={submit}>
        <div className="adm-form-grid">

          <div className="adm-field">
            <label className="adm-label">Category</label>
            <select className="adm-select" name="category" value={form.category} onChange={change} required>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="adm-field">
            <label className="adm-label">Game Name</label>
            <input className="adm-input" name="name" value={form.name} onChange={change} maxLength={255} required />
          </div>

          <div className="adm-field adm-form-full">
            <label className="adm-label">Description</label>
            <textarea className="adm-textarea" name="description" value={form.description} onChange={change} rows={3} />
          </div>

          <div className="adm-field">
            <label className="adm-label">Price per Hour (₹)</label>
            <input className="adm-input" name="price_per_hour" type="number" min="0" step="0.01" value={form.price_per_hour} onChange={change} required />
          </div>

          <div className="adm-field">
            <label className="adm-label">Min Capacity</label>
            <input className="adm-input" name="min_capacity" type="number" min="1" value={form.min_capacity} onChange={change} required />
          </div>

          <div className="adm-field">
            <label className="adm-label">Max Capacity</label>
            <input className="adm-input" name="max_capacity" type="number" min="1" value={form.max_capacity} onChange={change} required />
          </div>

          <div className="adm-field adm-form-full">
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
              <div className="adm-image-drop" onClick={() => fileRef.current?.click()}>
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

          <div className="adm-field adm-form-full">
            <label className="adm-check-row">
              <input type="checkbox" name="maintenance_mode" checked={form.maintenance_mode} onChange={change} />
              <span className="adm-check-label">Enable Maintenance Mode</span>
            </label>
          </div>

          <div className="adm-field adm-form-full">
            <label className="adm-check-row">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={change} />
              <span className="adm-check-label">Make it Available</span>
            </label>
          </div>

        </div>

        <div className="adm-edit-actions">
          <button className="adm-btn-primary" type="submit" disabled={saving}>
            <div className="adm-btn-primary-bg" />
            <div className="adm-btn-primary-hover" />
            <span className="adm-btn-primary-inner">{saving ? "Saving…" : "▶ Save Changes"}</span>
          </button>
          <button className="adm-btn-ghost" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
  
}

export default function Games() {
  const [games, setGames]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [editingId, setEditingId]   = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [gamesData, catsData] = await Promise.all([
        adminApi.getGames(),
        adminApi.getCategories(),
      ]);
      setGames(gamesData?.results || gamesData || []);
      setCategories(catsData?.results || catsData || []);
    } catch (err) {
      setError(err.message || "Failed to load games.");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (gameId, data) => {
    await adminApi.updateGame(gameId, data);
    setEditingId(null);
    loadData();
  };

  const remove = async (game) => {
    if (!window.confirm(`Delete "${game.name}"?`)) return;
    try {
      await adminApi.deleteGame(game.id);
      loadData();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  };

  return (
    <>
      <style>{adminCss}</style>
      <style>{EDIT_PANEL_CSS}</style>
      <div className="adm-pg">
        <AdminLayout>

          <section className="adm-hero">
            <div>
              <p className="adm-kicker">Game Management</p>
              <h1 className="adm-h1">All <span>Games</span></h1>
              <p className="adm-hero-sub">Configure game titles, pricing, and availability.</p>
            </div>
            <Link className="adm-btn-ghost" to="/admin/games/add">+ Add Game</Link>
          </section>

          {error && <div className="adm-alert">⚠ {error}</div>}

          <article className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-panel-title">Game Library</h2>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: "rgba(0,255,225,0.3)", letterSpacing: "0.08em" }}>
                {games.length} titles
              </span>
            </div>

            <style>{`
              @media (max-width: 700px) {
                .adm-games-table-wrap { display: none !important; }
                .adm-games-cards      { display: flex !important; }
              }
              .adm-games-cards { display: none; flex-direction: column; gap: 0; }
            `}</style>

            {/* ── Desktop table ── */}
            <div className="adm-table-wrap adm-games-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{ width: 48 }}>Img</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price / hr</th>
                    <th>Capacity</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7"><div className="adm-empty">Loading games…</div></td></tr>
                  ) : games.length === 0 ? (
                    <tr><td colSpan="7"><div className="adm-empty">No games registered</div></td></tr>
                  ) : (
                    games.map((game) => (
                      // React.Fragment lets us return two sibling <tr> elements
                      // per game while keeping the key. <tbody> nesting is invalid HTML.
                      <React.Fragment key={game.id}>
                        <tr>
                          <td>
                            {game.image
                              ? <img className="adm-thumb" src={game.image} alt={game.name} />
                              : <div className="adm-thumb-placeholder">✕</div>
                            }
                          </td>
                          <td style={{ color: "rgba(224,248,255,0.85)", fontFamily: "'Share Tech Mono', monospace" }}>
                            {game.name}
                          </td>
                          <td style={{ color: "rgba(0,255,225,0.45)", fontSize: "0.65rem", letterSpacing: "0.06em" }}>
                            {game.category_name || game.category || "—"}
                          </td>
                          <td style={{ color: "rgba(245,255,0,0.7)" }}>
                            {game.price_per_hour ? formatMoney(game.price_per_hour) : "—"}
                          </td>
                          <td style={{ color: "rgba(224,248,255,0.45)", fontSize: "0.65rem" }}>
                            {game.min_capacity ?? "—"}–{game.max_capacity ?? "—"}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <span style={game.maintenance_mode ? MAINTENANCE_PILL : ACTIVE_PILL}>
                                {game.maintenance_mode ? "Maintenance" : "Active"}
                              </span>
                              
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <span style={game.is_active ? ACTIVE_PILL : MAINTENANCE_PILL}>
                                {game.is_active ? "Available" : "Unavailable"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="adm-table-actions">
                              <button
                                className="adm-btn-ghost"
                                onClick={() => setEditingId(editingId === game.id ? null : game.id)}
                              >
                                {editingId === game.id ? "Close" : "Edit"}
                              </button>
                              <button className="adm-btn-danger" onClick={() => remove(game)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                        {editingId === game.id && (
                          <tr>
                            <td colSpan="7" style={{ padding: 0 }}>
                              <EditGamePanel
                                game={game}
                                categories={categories}
                                onSave={handleSave}
                                onCancel={() => setEditingId(null)}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="adm-games-cards">
              {loading ? (
                <div className="adm-empty">Loading games…</div>
              ) : games.length === 0 ? (
                <div className="adm-empty">No games registered</div>
              ) : (
                games.map((game) => (
                  <div key={game.id}>
                    <div className="adm-item-row" style={{ flexWrap: "wrap", gap: 10 }}>
                      {game.image
                        ? <img className="adm-thumb" src={game.image} alt={game.name} />
                        : <div className="adm-thumb-placeholder">✕</div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="adm-item-name">{game.name}</div>
                        <div className="adm-item-meta" style={{ marginTop: 4 }}>
                          {game.category_name || game.category || "—"}
                          {game.price_per_hour ? ` · ${formatMoney(game.price_per_hour)}/hr` : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={game.maintenance_mode ? MAINTENANCE_PILL : ACTIVE_PILL}>
                          {game.maintenance_mode ? "Maintenance" : "Active"}
                        </span>
                        <span style={game.is_active ? ACTIVE_PILL : MAINTENANCE_PILL}>
                          {game.is_active ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      <div className="adm-item-actions" style={{ width: "100%" }}>
                        <button
                          className="adm-btn-ghost"
                          onClick={() => setEditingId(editingId === game.id ? null : game.id)}
                        >
                          {editingId === game.id ? "Close" : "Edit"}
                        </button>
                        <button className="adm-btn-danger" onClick={() => remove(game)}>Delete</button>
                      </div>
                    </div>
                    {editingId === game.id && (
                      <EditGamePanel
                        game={game}
                        categories={categories}
                        onSave={handleSave}
                        onCancel={() => setEditingId(null)}
                      />
                    )}
                  </div>
                ))
              )}
            </div>

          </article>
        </AdminLayout>
      </div>
    </>
  );
}