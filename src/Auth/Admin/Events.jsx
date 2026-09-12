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
  .adm-events-list  { display: flex; flex-direction: column; }

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

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function ImageDropField({ existingUrl, file, onChange }) {
  const inputRef = useRef(null);
  const previewUrl = file ? URL.createObjectURL(file) : existingUrl;

  return (
    <div className="adm-field adm-form-full">
      <label className="adm-label">Event Image</label>
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
          <div className="adm-img-drop-label">+ Upload Event Image</div>
        </div>
      )}
    </div>
  );
}

function EditEventPanel({ event, onSave, onCancel }) {
  const [form, setForm] = useState({
    title:            event.title ?? "",
    description:      event.description ?? "",
    event_date:       event.event_date ?? "",
    start_time:       event.start_time ?? "",
    end_time:         event.end_time ?? "",
    price:            event.price ?? "",
    max_participants: event.max_participants ?? "",
  });
  // null = no change (keep existing), File = new upload, "" = explicitly removed
  const [imageFile, setImageFile] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const change = (e) => setForm((cur) => ({ ...cur, [e.target.name]: e.target.value }));

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
    if (!form.title.trim())       { setError("Event title is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.event_date)          { setError("Event date is required."); return; }
    if (!form.start_time)          { setError("Start time is required."); return; }
    if (!form.end_time)            { setError("End time is required."); return; }
    if (form.end_time <= form.start_time) { setError("End time must be after start time."); return; }
    if (form.price === "" || Number(form.price) < 0) { setError("Enter a valid price."); return; }
    if (!form.max_participants || Number(form.max_participants) < 1) {
      setError("Max participants must be at least 1."); return;
    }
    setError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("event_date", form.event_date);
      formData.append("start_time", form.start_time);
      formData.append("end_time", form.end_time);
      formData.append("price", Number(form.price));
      formData.append("max_participants", Number(form.max_participants));
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageRemoved) {
        formData.append("image", "");
      }
      await onSave(event.id, formData);
    } catch (err) {
      setError(err.message || "Update failed.");
      setSaving(false);
    }
  };

  return (
    <div className="adm-edit-panel">
      <div className="adm-edit-title">▸ Editing — {event.title}</div>
      {error && <div className="adm-alert" style={{ marginBottom: 14 }}>⚠ {error}</div>}
      <form onSubmit={submit}>
        <div className="adm-field">
          <label className="adm-label">Event Title</label>
          <input className="adm-input" name="title" value={form.title} onChange={change} maxLength={200} required />
        </div>

        <div className="adm-field">
          <label className="adm-label">Description</label>
          <textarea className="adm-input" name="description" rows={3} value={form.description} onChange={change} required />
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div className="adm-field" style={{ flex: "1 1 160px" }}>
            <label className="adm-label">Event Date</label>
            <input className="adm-input" type="date" name="event_date" value={form.event_date} onChange={change} required />
          </div>
          <div className="adm-field" style={{ flex: "1 1 140px" }}>
            <label className="adm-label">Start Time</label>
            <input className="adm-input" type="time" name="start_time" value={form.start_time} onChange={change} required />
          </div>
          <div className="adm-field" style={{ flex: "1 1 140px" }}>
            <label className="adm-label">End Time</label>
            <input className="adm-input" type="time" name="end_time" value={form.end_time} onChange={change} required />
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div className="adm-field" style={{ flex: "1 1 160px" }}>
            <label className="adm-label">Price (INR)</label>
            <input className="adm-input" type="number" name="price" min="0" step="0.01" value={form.price} onChange={change} required />
          </div>
          <div className="adm-field" style={{ flex: "1 1 160px" }}>
            <label className="adm-label">Max Participants</label>
            <input className="adm-input" type="number" name="max_participants" min="1" step="1" value={form.max_participants} onChange={change} required />
          </div>
        </div>

        <ImageDropField
          existingUrl={imageRemoved ? null : event.image}
          file={imageFile}
          onChange={handleImageChange}
        />

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

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loadData(); }, []);

  function loadData() {
    setLoading(true);
    return adminApi
      .getEvents()
      .then((data) => setEvents(data?.results || data || []))
      .catch((err) => setError(err.message || "Failed to load events."))
      .finally(() => setLoading(false));
  }

  const handleSave = async (id, data) => {
    await adminApi.updateEvent(id, data);
    setEditingId(null);
    loadData();
  };

  const remove = async (event) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    try {
      await adminApi.deleteEvent(event.id);
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
              <p className="adm-kicker">Events</p>
              <h1 className="adm-h1">Exclusive <span>Events</span></h1>
              <p className="adm-hero-sub">Manage special tournaments, nights, and community events.</p>
            </div>
            <Link className="adm-btn-ghost" to="/admin/events/add">+ Add Event</Link>
          </section>

          {error && <div className="adm-alert">⚠ {error}</div>}

          <article className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-panel-title">All Events</h2>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: "rgba(0,255,225,0.3)", letterSpacing: "0.08em" }}>
                {events.length} scheduled
              </span>
            </div>

            {loading ? (
              <div className="adm-empty">Loading events…</div>
            ) : events.length === 0 ? (
              <div className="adm-empty">No events scheduled</div>
            ) : (
              <div className="adm-events-list">
                {events.map((event) => (
                  <div key={event.id}>
                    <div className="adm-item-row">
                      <div className="adm-item-row-with-thumb" style={{ flex: 1, minWidth: 0 }}>
                        {event.image ? (
                          <img src={event.image} alt={event.title} className="adm-item-thumb" />
                        ) : (
                          <div className="adm-item-thumb-placeholder">N/A</div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div className="adm-item-name">{event.title}</div>
                          <div className="adm-item-meta" style={{ marginTop: 3 }}>
                            {formatDate(event.event_date)}
                            {event.start_time && ` · ${event.start_time}`}
                            {event.price != null && ` · INR ${event.price}`}
                            {event.max_participants != null && ` · ${event.max_participants} max`}
                          </div>
                        </div>
                      </div>
                      <div className="adm-item-actions">
                        <button
                          className="adm-btn-ghost"
                          onClick={() => setEditingId(editingId === event.id ? null : event.id)}
                        >
                          {editingId === event.id ? "Close" : "Edit"}
                        </button>
                        <button className="adm-btn-danger" onClick={() => remove(event)}>Delete</button>
                      </div>
                    </div>
                    {editingId === event.id && (
                      <EditEventPanel
                        event={event}
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