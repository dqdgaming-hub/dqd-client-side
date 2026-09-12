import { useEffect, useState, useRef } from "react";
import { adminApi } from "../api/adminapi";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminCss } from "./adminTheme";

const IMG_CSS = `
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
`;

function ImageDropField({ file, onChange }) {
  const inputRef = useRef(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

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

export default function AddComboPack() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [form, setForm] = useState({
    name:          "",
    snack_name:    "",
    snack_price:   "",
    combo_price:   "",
    loyalty_bonus: "",
    gaming_items:  [],
  });
  const [image, setImage] = useState(null);
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminApi
      .getGames()
      .then((data) => setGames(data?.results || data || []))
      .catch(() => {});
  }, []);

  const change = (e) => setForm((cur) => ({ ...cur, [e.target.name]: e.target.value }));

  const toggleGame = (id) => {
    setForm((cur) => ({
      ...cur,
      gaming_items: cur.gaming_items.includes(id)
        ? cur.gaming_items.filter((g) => g !== id)
        : [...cur.gaming_items, id],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())       { setError("Pack name is required."); return; }
    if (!form.snack_name.trim()) { setError("Snack name is required."); return; }
    if (form.combo_price === "") { setError("Combo price is required."); return; }
    if (form.gaming_items.length === 0) { setError("Select at least one game."); return; }

    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("snack_name", form.snack_name.trim());
      if (form.snack_price !== "") formData.append("snack_price", Number(form.snack_price));
      formData.append("combo_price", Number(form.combo_price));
      if (form.loyalty_bonus !== "") formData.append("loyalty_bonus", Number(form.loyalty_bonus));
      form.gaming_items.forEach((id) => formData.append("gaming_items", id));
      if (image) formData.append("image", image);

      await adminApi.createComboPack(formData);
      navigate("/admin/combo-packs");
    } catch (err) {
      setError(err.message || "Failed to create combo pack.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{adminCss}</style>
      <style>{IMG_CSS}</style>
      <div className="adm-pg">
        <AdminLayout>

          <section className="adm-hero">
            <div>
              <p className="adm-kicker">Packages</p>
              <h1 className="adm-h1">Add Combo <span>Pack</span></h1>
              <p className="adm-hero-sub">Bundle games and services into a single bookable package.</p>
            </div>
            <button className="adm-btn-ghost" type="button" onClick={() => navigate("/admin/combo-packs")}>
              ← Back to Combo Packs
            </button>
          </section>

          {error && <div className="adm-alert">⚠ {error}</div>}

          <article className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-panel-title">Pack Details</h2>
            </div>
            <div className="adm-panel-body">
              <form onSubmit={submit}>
                <div className="adm-form-grid">

                  {/* Name — full width */}
                  <div className="adm-field adm-form-full">
                    <label className="adm-label" htmlFor="pack-name">Pack Name</label>
                    <input
                      id="pack-name"
                      className="adm-input"
                      name="name"
                      placeholder="e.g. Weekend Warrior Bundle"
                      value={form.name}
                      onChange={change}
                      maxLength={120}
                      required
                    />
                  </div>

                  {/* Snack name */}
                  <div className="adm-field">
                    <label className="adm-label" htmlFor="pack-snack-name">Snack Name</label>
                    <input
                      id="pack-snack-name"
                      className="adm-input"
                      name="snack_name"
                      placeholder="e.g. Nachos & Dip"
                      value={form.snack_name}
                      onChange={change}
                      maxLength={120}
                      required
                    />
                  </div>

                  {/* Snack price */}
                  <div className="adm-field">
                    <label className="adm-label" htmlFor="pack-snack-price">Snack Price (INR)</label>
                    <input
                      id="pack-snack-price"
                      className="adm-input"
                      type="number"
                      name="snack_price"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={form.snack_price}
                      onChange={change}
                    />
                  </div>

                  {/* Combo price */}
                  <div className="adm-field">
                    <label className="adm-label" htmlFor="pack-combo-price">Combo Price (INR)</label>
                    <input
                      id="pack-combo-price"
                      className="adm-input"
                      type="number"
                      name="combo_price"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={form.combo_price}
                      onChange={change}
                      required
                    />
                  </div>

                  {/* Loyalty bonus */}
                  <div className="adm-field">
                    <label className="adm-label" htmlFor="pack-loyalty">Loyalty Bonus (pts)</label>
                    <input
                      id="pack-loyalty"
                      className="adm-input"
                      type="number"
                      name="loyalty_bonus"
                      placeholder="0"
                      min="0"
                      step="1"
                      value={form.loyalty_bonus}
                      onChange={change}
                    />
                  </div>

                  {/* Gaming items — full width toggle chips */}
                  {games.length > 0 && (
                    <div className="adm-field adm-form-full">
                      <label className="adm-label">Included Games</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                        {games.map((g) => {
                          const selected = form.gaming_items.includes(g.id);
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

                  <ImageDropField file={image} onChange={setImage} />

                </div>

                <button className="adm-btn-primary" type="submit" disabled={submitting}>
                  <div className="adm-btn-primary-bg" />
                  <div className="adm-btn-primary-hover" />
                  <span className="adm-btn-primary-inner">
                    {submitting ? "Creating…" : "▶ Create Pack"}
                  </span>
                </button>
              </form>
            </div>
          </article>

        </AdminLayout>
      </div>
    </>
  );
}