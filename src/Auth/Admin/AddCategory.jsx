import { useRef, useState } from "react";
import { adminApi } from "../api/adminapi";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminCss } from "./adminTheme";

const CATEGORY_TYPE_OPTIONS = [
  { value: "ps5",  label: "PS5",  desc: "PlayStation 5 gaming sessions",  color: "#00ffe1" },
  { value: "simulator", label: "Simulator", desc: "Simulated gaming experiences", color: "#ff9f1c" },
  { value: "vr",   label: "VR",   desc: "Virtual reality experiences",      color: "#ff6b6b" },
  { value: "pool", label: "Pool", desc: "Pool & tabletop game sessions",   color: "#f5ff00" },
  { value: "board_games", label: "Board Games", desc: "Board game sessions", color: "#2ec4b6" },
  { value: "card_games", label: "Card Games", desc: "Card game sessions", color: "#e71d36" },
  { value: "ott",  label: "OTT",  desc: "Streaming & media content",       color: "#b57bff" },
  { value: "multiplayer_games", label: "Multiplayer Games", desc: "Multiplayer gaming sessions", color: "#ffcc00" },
  { value: "other", label: "Other", desc: "Other types of gaming sessions", color: "#8d99ae" },
];

const LOCAL_CSS = `
  /* ── Type selector cards ── */
  .adm-type-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 6px;
  }
  @media (max-width: 600px) {
    .adm-type-cards { grid-template-columns: 1fr; }
  }
  .adm-type-card {
    position: relative;
    padding: 14px 16px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02);
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    outline: none;
    text-align: left;
    width: 100%;
  }
  .adm-type-card:hover {
    background: rgba(255,255,255,0.04);
  }
  .adm-type-card[aria-pressed="true"] {
    border-color: var(--tc);
    background: color-mix(in srgb, var(--tc) 6%, transparent);
  }
  .adm-type-card-label {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--tc);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .adm-type-card-label::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background: var(--tc);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    opacity: 0;
    transition: opacity 0.15s;
  }
  .adm-type-card[aria-pressed="true"] .adm-type-card-label::before {
    opacity: 1;
  }
  .adm-type-card-desc {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.58rem;
    color: rgba(224,248,255,0.35);
    line-height: 1.4;
    letter-spacing: 0.04em;
  }

  /* ── Form layout ── */
  .adm-add-form-grid {
    display: grid;
    gap: 24px;
  }
  .adm-form-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 24px;
    border-top: 1px solid rgba(0,255,225,0.08);
    margin-top: 8px;
  }
  .adm-char-count {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.56rem;
    color: rgba(0,255,225,0.25);
    letter-spacing: 0.08em;
    margin-top: 5px;
    text-align: right;
  }

  /* ── Image upload ── */
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
`;

export default function AddCategory() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm]             = useState({ name: "", category_type: "ps5" });
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  const applyImage = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Category name is required."); return; }
    setError("");
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("category_type", form.category_type);
      if (imageFile) payload.append("image", imageFile);

      await adminApi.createCategory(payload);
      navigate("/admin/categories");
    } catch (err) {
      setError(err.message || "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = CATEGORY_TYPE_OPTIONS.find((o) => o.value === form.category_type);

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
              <h1 className="adm-h1">Add <span>Category</span></h1>
              <p className="adm-hero-sub">
                Create a new category to organise your game offerings.
              </p>
            </div>
            <button
              className="adm-btn-ghost"
              type="button"
              onClick={() => navigate("/admin/categories")}
            >
              ← Back to Categories
            </button>
          </section>

          {error && <div className="adm-alert">⚠ {error}</div>}

          {/* ── Form panel ── */}
          <article className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-panel-title">Category Details</h2>
            </div>

            <div className="adm-panel-body">
              <form onSubmit={submit}>
                <div className="adm-add-form-grid">

                  {/* Name field */}
                  <div className="adm-field" style={{ marginBottom: 0 }}>
                    <label className="adm-label" htmlFor="cat-name">
                      Category Name
                    </label>
                    <input
                      id="cat-name"
                      className="adm-input"
                      placeholder="e.g. Multiplayer Arena"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      maxLength={120}
                      required
                      autoFocus
                    />
                    <div className="adm-char-count">
                      {form.name.length} / 120
                    </div>
                  </div>

                  {/* Type selector */}
                  <div className="adm-field" style={{ marginBottom: 0 }}>
                    <label className="adm-label">Category Type</label>
                    <div className="adm-type-cards" role="group" aria-label="Category type">
                      {CATEGORY_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className="adm-type-card"
                          aria-pressed={form.category_type === opt.value}
                          style={{ "--tc": opt.color }}
                          onClick={() => setForm({ ...form, category_type: opt.value })}
                        >
                          <div className="adm-type-card-label">{opt.label}</div>
                          <div className="adm-type-card-desc">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image field */}
                  <div className="adm-field" style={{ marginBottom: 0 }}>
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

                </div>

                {/* Footer actions */}
                <div className="adm-form-footer">
                  <button
                    className="adm-btn-primary"
                    type="submit"
                    disabled={submitting}
                  >
                    <div className="adm-btn-primary-bg" />
                    <div className="adm-btn-primary-hover" />
                    <span className="adm-btn-primary-inner">
                      {submitting ? "Creating…" : "▶ Create Category"}
                    </span>
                  </button>
                  <button
                    className="adm-btn-ghost"
                    type="button"
                    onClick={() => navigate("/admin/categories")}
                  >
                    Cancel
                  </button>
                  {selectedType && !submitting && (
                    <span style={{
                      marginLeft: "auto",
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: "0.58rem",
                      color: selectedType.color,
                      opacity: 0.6,
                      letterSpacing: "0.08em",
                    }}>
                      TYPE: {selectedType.label}
                    </span>
                  )}
                </div>
              </form>
            </div>
          </article>

        </AdminLayout>
      </div>
    </>
  );
}