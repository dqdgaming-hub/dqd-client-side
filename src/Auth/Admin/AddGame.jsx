import { useEffect, useState } from "react";
import { adminApi } from "../api/adminapi";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminCss } from "./adminTheme";

export default function AddGame() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category:         "",
    name:             "",
    description:      "",
    image:            null,
    price_per_hour:   "",
    min_capacity:     1,
    max_capacity:     1,
    maintenance_mode: false,
    is_active:        true,
  });
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminApi
      .getCategories()
      .then((data) => setCategories(data?.results || data || []))
      .catch((err) => setError(err.message));
  }, []);

  const change = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm((cur) => ({
      ...cur,
      [name]:
        type === "checkbox" ? checked
        : type === "file"   ? files[0] || null
        :                     value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (Number(form.min_capacity) > Number(form.max_capacity)) {
      setError("Minimum capacity cannot exceed maximum capacity.");
      return;
    }
    setError("");
    setSubmitting(true);

    const payload = new FormData();
    payload.append("category",         form.category);
    payload.append("name",             form.name.trim());
    payload.append("description",      form.description);
    payload.append("price_per_hour",   form.price_per_hour);
    payload.append("min_capacity",     form.min_capacity);
    payload.append("max_capacity",     form.max_capacity);
    payload.append("maintenance_mode", String(form.maintenance_mode));
    payload.append("is_active",        String(form.is_active));
    if (form.image) payload.append("image", form.image);

    try {
      await adminApi.createGame(payload);
      navigate("/admin/games");
    } catch (err) {
      setError(err.message || "Failed to create game.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{adminCss}</style>
      <div className="adm-pg">
        <AdminLayout>

          {/* ── Hero ── */}
          <section className="adm-hero">
            <div>
              <p className="adm-kicker">Game Management</p>
              <h1 className="adm-h1">Add <span>Game</span></h1>
              <p className="adm-hero-sub">
                Register a new game title, set pricing and capacity.
              </p>
            </div>
            <button
              className="adm-btn-ghost"
              type="button"
              onClick={() => navigate("/admin/games")}
            >
              ← Back to Games
            </button>
          </section>

          {error && <div className="adm-alert">⚠ {error}</div>}

          {/* ── Form panel ── */}
          <article className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-panel-title">Game Details</h2>
            </div>
            <div className="adm-panel-body">
              <form onSubmit={submit}>
                <div className="adm-form-grid">

                  {/* Category */}
                  <div className="adm-field">
                    <label className="adm-label" htmlFor="game-category">Category</label>
                    <select
                      id="game-category"
                      className="adm-select"
                      name="category"
                      value={form.category}
                      onChange={change}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Name */}
                  <div className="adm-field">
                    <label className="adm-label" htmlFor="game-name">Game Name</label>
                    <input
                      id="game-name"
                      className="adm-input"
                      name="name"
                      placeholder="e.g. FIFA 25"
                      value={form.name}
                      onChange={change}
                      maxLength={255}
                      required
                    />
                  </div>

                  {/* Description — full width */}
                  <div className="adm-field adm-form-full">
                    <label className="adm-label" htmlFor="game-desc">Description</label>
                    <textarea
                      id="game-desc"
                      className="adm-textarea"
                      name="description"
                      placeholder="Brief description of the game…"
                      value={form.description}
                      onChange={change}
                      rows={4}
                    />
                  </div>

                  {/* Image — full width */}
                  <div className="adm-field adm-form-full">
                    <label className="adm-label">Cover Image</label>
                    <div className="adm-file-wrap">
                      <div className="adm-file-btn">
                        ⬆ {form.image ? "Change image" : "Upload image"}
                      </div>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={change}
                      />
                    </div>
                    {form.image && (
                      <div className="adm-file-name">▸ {form.image.name}</div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="adm-field">
                    <label className="adm-label" htmlFor="game-price">Price per Hour (₹)</label>
                    <input
                      id="game-price"
                      className="adm-input"
                      name="price_per_hour"
                      type="number"
                      placeholder="0.00"
                      value={form.price_per_hour}
                      onChange={change}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Spacer for grid alignment */}
                  <div />

                  {/* Min capacity */}
                  <div className="adm-field">
                    <label className="adm-label" htmlFor="game-min-cap">Min Capacity</label>
                    <input
                      id="game-min-cap"
                      className="adm-input"
                      name="min_capacity"
                      type="number"
                      value={form.min_capacity}
                      onChange={change}
                      min="1"
                      required
                    />
                  </div>

                  {/* Max capacity */}
                  <div className="adm-field">
                    <label className="adm-label" htmlFor="game-max-cap">Max Capacity</label>
                    <input
                      id="game-max-cap"
                      className="adm-input"
                      name="max_capacity"
                      type="number"
                      value={form.max_capacity}
                      onChange={change}
                      min="1"
                      required
                    />
                  </div>

                  {/* Maintenance mode — full width */}
                  <div className="adm-field adm-form-full">
                    <label className="adm-check-row">
                      <input
                        type="checkbox"
                        name="maintenance_mode"
                        checked={form.maintenance_mode}
                        onChange={change}
                      />
                      <span className="adm-check-label">Enable Maintenance Mode</span>
                    </label>
                  </div>

                  {/* Availability — full width */}
                  <div className="adm-field adm-form-full">
                    <label className="adm-check-row">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={form.is_active}
                        onChange={change}
                      />
                      <span className="adm-check-label">Make it Available</span>
                    </label>
                  </div>

                </div>{/* /adm-form-grid */}

                <button className="adm-btn-primary" type="submit" disabled={submitting}>
                  <div className="adm-btn-primary-bg" />
                  <div className="adm-btn-primary-hover" />
                  <span className="adm-btn-primary-inner">
                    {submitting ? "Creating…" : "▶ Create Game"}
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