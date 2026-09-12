import { useEffect, useState, useRef } from "react";
import { adminApi } from "../api/adminapi";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminCss } from "./adminTheme";

const EDIT_PANEL_CSS = `
  .adm-edit-panel {
    background: rgba(0,255,225,0.03);
    border: 1px solid rgba(0,255,225,0.15);
    border-left: 3px solid rgba(0,255,225,0.5);
    padding: 24px;
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
  .adm-edit-actions { display: flex; gap: 10px; margin-top: 18px; }
  .adm-combos-list  { display: flex; flex-direction: column; }

  .adm-img-drop {
    border: 1px dashed rgba(0,255,225,0.25);
    background: rgba(0,255,225,0.02);
    padding: 18px;
    text-align: center;
    cursor: pointer;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    transition: all 0.15s;
  }
  .adm-img-drop:hover {
    border-color: rgba(0,255,225,0.5);
    background: rgba(0,255,225,0.05);
  }
  .adm-img-drop-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    color: rgba(0,255,225,0.5);
    text-transform: uppercase;
  }
  .adm-img-preview-wrap { position: relative; display: inline-block; }
  .adm-img-preview {
    max-width: 100%;
    max-height: 180px;
    display: block;
    border: 1px solid rgba(0,255,225,0.2);
  }
  .adm-img-remove {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #1a0a14;
    border: 1px solid rgba(255,80,120,0.5);
    color: #ff5078;
    font-size: 0.7rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .adm-item-thumb {
    width: 52px;
    height: 52px;
    object-fit: cover;
    border: 1px solid rgba(0,255,225,0.15);
    flex-shrink: 0;
  }
  .adm-item-thumb-placeholder {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    border: 1px dashed rgba(0,255,225,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.55rem;
    color: rgba(0,255,225,0.25);
    font-family: 'Share Tech Mono', monospace;
  }
  .adm-item-row-with-thumb { display: flex; gap: 14px; align-items: center; }
`;

function ImageDropField({ existingUrl, file, onChange }) {
  const inputRef = useRef(null);
  const previewUrl = file ? URL.createObjectURL(file) : existingUrl;

  return (
    <div className="adm-field adm-form-full">
      <label className="adm-label">Pack Image</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {previewUrl ? (
        <div className="adm-img-preview-wrap">
          <img src={previewUrl} alt="Preview" className="adm-img-preview" />
          <button
            type="button"
            className="adm-img-remove"
            onClick={() => onChange(null)}
            title="Remove image"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="adm-img-drop" onClick={() => inputRef.current?.click()}>
          <div className="adm-img-drop-label">+ Upload Pack Image</div>
        </div>
      )}
    </div>
  );
}

function EditComboPackPanel({ item, games, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:          item.name ?? "",
    snack_name:    item.snack_name ?? "",
    snack_price:   item.snack_price ?? "",
    combo_price:   item.combo_price ?? "",
    loyalty_bonus: item.loyalty_bonus ?? "",
    gaming_items:  (item.gaming_items ?? []).map(String),
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const change = (e) => setForm((cur) => ({ ...cur, [e.target.name]: e.target.value }));

  const toggleGame = (id) => {
    const sid = String(id);
    setForm((cur) => ({
      ...cur,
      gaming_items: cur.gaming_items.includes(sid)
        ? cur.gaming_items.filter((g) => g !== sid)
        : [...cur.gaming_items, sid],
    }));
  };

  const handleImageChange = (file) => {
    if (file) {
      setImageFile(file);
      setImageRemoved(false);
    } else {
      setImageFile(null);
      setImageRemoved(true);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())       { setError("Pack name is required."); return; }
    if (!form.snack_name.trim()) { setError("Snack name is required."); return; }
    if (form.combo_price === "") { setError("Combo price is required."); return; }
    if (form.gaming_items.length === 0) { setError("Select at least one game."); return; }
    setError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("snack_name", form.snack_name);
      if (form.snack_price !== "") formData.append("snack_price", Number(form.snack_price));
      if (form.combo_price !== "") formData.append("combo_price", Number(form.combo_price));
      if (form.loyalty_bonus !== "") formData.append("loyalty_bonus", Number(form.loyalty_bonus));
      form.gaming_items.forEach((id) => formData.append("gaming_items", id));
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageRemoved) {
        formData.append("image", "");
      }
      await onSave(item.id, formData);
    } catch (err) {
      setError(err.message || "Update failed.");
      setSaving(false);
    }
  };

  return (
    <div className="adm-edit-panel">
      <div className="adm-edit-title">▸ Editing — {item.name}</div>
      {error && <div className="adm-alert" style={{ marginBottom: 14 }}>⚠ {error}</div>}
      <form onSubmit={submit}>
        <div className="adm-form-grid">
          <div className="adm-field adm-form-full">
            <label className="adm-label">Pack Name</label>
            <input className="adm-input" name="name" value={form.name} onChange={change} maxLength={120} required />
          </div>

          <div className="adm-field">
            <label className="adm-label">Snack Name</label>
            <input className="adm-input" name="snack_name" value={form.snack_name} onChange={change} maxLength={120} />
          </div>

          <div className="adm-field">
            <label className="adm-label">Snack Price (INR)</label>
            <input className="adm-input" type="number" name="snack_price" min="0" step="0.01" value={form.snack_price} onChange={change} />
          </div>

          <div className="adm-field">
            <label className="adm-label">Combo Price (INR)</label>
            <input className="adm-input" type="number" name="combo_price" min="0" step="0.01" value={form.combo_price} onChange={change} />
          </div>

          <div className="adm-field">
            <label className="adm-label">Loyalty Bonus (pts)</label>
            <input className="adm-input" type="number" name="loyalty_bonus" min="0" step="1" value={form.loyalty_bonus} onChange={change} />
          </div>

          {games.length > 0 && (
            <div className="adm-field adm-form-full">
              <label className="adm-label">Included Games</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                {games.map((g) => {
                  const selected = form.gaming_items.includes(String(g.id));
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGame(g.id)}
                      style={{
                        padding: "4px 12px",
                        fontSize: "0.62rem",
                        letterSpacing: "0.07em",
                        fontFamily: "'Share Tech Mono', monospace",
                        background: selected ? "rgba(0,255,225,0.12)" : "transparent",
                        border: selected ? "1px solid rgba(0,255,225,0.5)" : "1px solid rgba(255,255,255,0.1)",
                        color: selected ? "#00ffe1" : "rgba(224,248,255,0.45)",
                        clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {selected ? "✓ " : ""}{g.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <ImageDropField
            existingUrl={imageRemoved ? null : item.image}
            file={imageFile}
            onChange={handleImageChange}
          />
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

export default function ComboPacks() {
  const [items, setItems] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [packsData, gamesData] = await Promise.all([
        adminApi.getComboPacks(),
        adminApi.getGames(),
      ]);
      setItems(packsData?.results || packsData || []);
      setGames(gamesData?.results || gamesData || []);
    } catch (err) {
      setError(err.message || "Failed to load combo packs.");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (id, data) => {
    await adminApi.updateComboPack(id, data);
    setEditingId(null);
    loadData();
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await adminApi.deleteComboPack(item.id);
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
              <p className="adm-kicker">Packages</p>
              <h1 className="adm-h1">Combo <span>Packs</span></h1>
              <p className="adm-hero-sub">Bundled game packages available for booking.</p>
            </div>
            <Link className="adm-btn-ghost" to="/admin/combo-packs/add">+ Add Combo Pack</Link>
          </section>

          {error && <div className="adm-alert">⚠ {error}</div>}

          <article className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-panel-title">All Combo Packs</h2>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: "rgba(0,255,225,0.3)", letterSpacing: "0.08em" }}>
                {items.length} total
              </span>
            </div>

            {loading ? (
              <div className="adm-empty">Loading combo packs…</div>
            ) : items.length === 0 ? (
              <div className="adm-empty">No combo packs yet</div>
            ) : (
              <div className="adm-combos-list">
                {items.map((item) => (
                  <div key={item.id}>
                    <div className="adm-item-row">
                      <div className="adm-item-row-with-thumb" style={{ flex: 1, minWidth: 0 }}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="adm-item-thumb" />
                        ) : (
                          <div className="adm-item-thumb-placeholder">N/A</div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div className="adm-item-name">{item.name}</div>
                          {(item.combo_price != null || item.snack_name) && (
                            <div className="adm-item-meta" style={{ marginTop: 3 }}>
                              {item.snack_name && `${item.snack_name}`}
                              {item.combo_price != null && ` · INR ${item.combo_price}`}
                              {item.loyalty_bonus != null && ` · +${item.loyalty_bonus} pts`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="adm-item-actions">
                        <button
                          className="adm-btn-ghost"
                          onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                        >
                          {editingId === item.id ? "Close" : "Edit"}
                        </button>
                        <button className="adm-btn-danger" onClick={() => remove(item)}>Delete</button>
                      </div>
                    </div>
                    {editingId === item.id && (
                      <EditComboPackPanel
                        item={item}
                        games={games}
                        onSave={handleSave}
                        onCancel={() => setEditingId(null)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </article>

        </AdminLayout>
      </div>
    </>
  );
}