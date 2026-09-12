import { useState, useRef } from "react";
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
  .adm-img-preview-wrap {
    position: relative;
    display: inline-block;
  }
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

export default function AddEvent() {
  const navigate = useNavigate();

  const [title, setTitle]                   = useState("");
  const [description, setDescription]       = useState("");
  const [eventDate, setEventDate]            = useState("");
  const [startTime, setStartTime]            = useState("");
  const [endTime, setEndTime]                = useState("");
  const [price, setPrice]                    = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [image, setImage]                    = useState(null);

  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!title.trim())        { setError("Event title is required."); return; }
    if (!description.trim())  { setError("Description is required."); return; }
    if (!eventDate)            { setError("Event date is required."); return; }
    if (!startTime)            { setError("Start time is required."); return; }
    if (!endTime)              { setError("End time is required."); return; }
    if (endTime <= startTime)  { setError("End time must be after start time."); return; }
    if (price === "" || Number(price) < 0) { setError("Enter a valid price."); return; }
    if (!maxParticipants || Number(maxParticipants) < 1) {
      setError("Max participants must be at least 1.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("event_date", eventDate);
      formData.append("start_time", startTime);
      formData.append("end_time", endTime);
      formData.append("price", Number(price));
      formData.append("max_participants", Number(maxParticipants));
      if (image) formData.append("image", image);

      await adminApi.createEvent(formData);
      navigate("/admin/events");
    } catch (err) {
      setError(err.message || "Failed to create event.");
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

          {/* ── Hero ── */}
          <section className="adm-hero">
            <div>
              <p className="adm-kicker">Events</p>
              <h1 className="adm-h1">Add <span>Event</span></h1>
              <p className="adm-hero-sub">
                Schedule an exclusive event for your players.
              </p>
            </div>
            <button
              className="adm-btn-ghost"
              type="button"
              onClick={() => navigate("/admin/events")}
            >
              ← Back to Events
            </button>
          </section>

          {error && <div className="adm-alert">⚠ {error}</div>}

          {/* ── Form panel ── */}
          <article className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-panel-title">Event Details</h2>
            </div>
            <div className="adm-panel-body">
              <form onSubmit={submit}>
                <div className="adm-field">
                  <label className="adm-label" htmlFor="event-title">Event Title</label>
                  <input
                    id="event-title"
                    className="adm-input"
                    placeholder="e.g. DQD Championship Night"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="adm-field">
                  <label className="adm-label" htmlFor="event-description">Description</label>
                  <textarea
                    id="event-description"
                    className="adm-input"
                    rows={4}
                    placeholder="What's happening at this event?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div className="adm-field" style={{ flex: "1 1 160px" }}>
                    <label className="adm-label" htmlFor="event-date">Event Date</label>
                    <input
                      id="event-date"
                      type="date"
                      className="adm-input"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-field" style={{ flex: "1 1 140px" }}>
                    <label className="adm-label" htmlFor="event-start">Start Time</label>
                    <input
                      id="event-start"
                      type="time"
                      className="adm-input"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-field" style={{ flex: "1 1 140px" }}>
                    <label className="adm-label" htmlFor="event-end">End Time</label>
                    <input
                      id="event-end"
                      type="time"
                      className="adm-input"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div className="adm-field" style={{ flex: "1 1 160px" }}>
                    <label className="adm-label" htmlFor="event-price">Price (INR)</label>
                    <input
                      id="event-price"
                      type="number"
                      min="0"
                      step="0.01"
                      className="adm-input"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-field" style={{ flex: "1 1 160px" }}>
                    <label className="adm-label" htmlFor="event-max">Max Participants</label>
                    <input
                      id="event-max"
                      type="number"
                      min="1"
                      step="1"
                      className="adm-input"
                      placeholder="e.g. 50"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <ImageDropField file={image} onChange={setImage} />

                <button className="adm-btn-primary" type="submit" disabled={submitting}>
                  <div className="adm-btn-primary-bg" />
                  <div className="adm-btn-primary-hover" />
                  <span className="adm-btn-primary-inner">
                    {submitting ? "Creating…" : "▶ Create Event"}
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