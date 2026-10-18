import { useState } from "react";
import { Link } from "react-router-dom";
import { cancelUserBooking, getUserBookingsWallet } from "../../../api/userapi";
import UserLayout from "../../UserLayout";
import useApi from "../../../../hooks/useApi";
import { userCss } from "../../common/userUi";
import {
  CalendarDays, CalendarPlus, Clock, Gamepad2, Hash, History, Popcorn, QrCode, Ticket, Users, Wallet, XCircle,
} from "lucide-react";

const css = `
.mb-new { display: flex; gap: 8px; flex-wrap: wrap; }
.mb-tabs { position: relative; display: inline-grid; grid-template-columns: 1fr 1fr; padding: 4px; margin-bottom: 18px;
  background: rgba(13,13,26,.9); border: 1px solid rgba(0,245,255,.18); border-radius: 12px; }
.mb-tabs::before { content: ""; position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); border-radius: 9px;
  background: linear-gradient(135deg, #00f5ff, #00e5cc); box-shadow: 0 4px 16px rgba(0,245,255,.3);
  transition: transform .35s cubic-bezier(.22,1,.36,1); }
.mb-tabs.past::before { transform: translateX(100%); }
.mb-tabs button { position: relative; z-index: 1; border: 0; background: transparent; color: #a9a9c8; padding: 10px 18px; border-radius: 9px;
  font: inherit; font-weight: 700; font-size: 13px; letter-spacing: .5px; cursor: pointer; transition: color .25s; white-space: nowrap; }
.mb-tabs button.on { color: #031a1d; }
.mb-list { display: grid; gap: 14px; }
.mb-card { --kind: #00f5ff; position: relative; display: grid; grid-template-columns: 76px 1fr auto; gap: 16px; align-items: center;
  background: linear-gradient(160deg, #11111f, #0d0d1a); border: 1px solid rgba(0,245,255,.14); border-left: 3px solid var(--kind);
  border-radius: 14px; padding: 14px 16px; animation: uPop .45s cubic-bezier(.22,1,.36,1) backwards;
  transition: transform .25s cubic-bezier(.22,1,.36,1), border-color .25s, box-shadow .25s; }
.mb-card:hover { transform: translateX(4px); border-color: rgba(0,245,255,.3); box-shadow: 0 12px 30px rgba(0,0,0,.4), -6px 0 22px -10px var(--kind); }
.mb-card.combo { --kind: #ffd60a; }
.mb-card.event { --kind: #ff006e; }
.mb-img { width: 76px; height: 76px; border-radius: 12px; object-fit: cover; background: radial-gradient(circle at 50% 40%, #1a1636, #0a0a14);
  display: flex; align-items: center; justify-content: center; font-size: 28px; }
.mb-kind { display: inline-block; font-family: 'Share Tech Mono', monospace; font-size: 10.5px; letter-spacing: 1.4px; text-transform: uppercase;
  color: var(--kind); margin-bottom: 3px; }
.mb-title { margin: 0 0 4px; font-family: 'Orbitron', sans-serif; font-size: 15px; letter-spacing: .5px; font-weight: 700; color: #fff; }
.mb-meta { font-size: 13px; color: #8b8bab; line-height: 1.65; }
.mb-meta b { color: #c4c4dc; font-weight: 600; }
.mb-hint { display: inline-flex; align-items: center; gap: 6px; margin-top: 4px; color: #c4c4dc; font-size: 12.5px; }
.mb-hint::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--kind); box-shadow: 0 0 8px var(--kind);
  animation: mbBlink 1.6s ease-in-out infinite; }
@keyframes mbBlink { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
.mb-side { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; }
.mb-actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.mb-badge { display: inline-block; padding: 4px 11px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .6px;
  text-transform: uppercase; border: 1px solid transparent; }
.mb-badge.pending { background: rgba(255,214,10,.08); color: #ffe066; border-color: rgba(255,214,10,.28); }
.mb-badge.confirmed, .mb-badge.approved { background: rgba(57,255,20,.08); color: #8dff7a; border-color: rgba(57,255,20,.25); }
.mb-badge.completed, .mb-badge.attended { background: rgba(80,160,255,.1); color: #8cc2ff; border-color: rgba(80,160,255,.3); }
.mb-badge.cancelled, .mb-badge.rejected { background: rgba(255,0,110,.08); color: #ff8fb8; border-color: rgba(255,0,110,.3); }
.u-modal.mb-modal { max-width: 400px; text-align: center; }
.mb-img.ph { display: grid; place-items: center; color: #05040a; background: linear-gradient(135deg, var(--kind), color-mix(in srgb, var(--kind) 40%, #7b2fff)); }
.mb-meta { display: flex; flex-wrap: wrap; gap: 4px 14px; }
.mb-meta span { display: inline-flex; align-items: center; gap: 6px; }
.mb-meta svg { color: var(--kind); flex: none; }
.mb-tabs button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
.mb-next { --kind: #00f5ff; position: relative; overflow: hidden; display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center;
  padding: 18px; margin-bottom: 18px; border-radius: 22px; border: 1px solid color-mix(in srgb, var(--kind) 40%, transparent);
  background: radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--kind) 22%, transparent), transparent 55%), linear-gradient(160deg, #13122a, #0b0a18);
  box-shadow: 0 20px 50px rgba(0,0,0,.4), 0 0 40px color-mix(in srgb, var(--kind) 10%, transparent); }
.mb-next.combo { --kind: #ffd60a; } .mb-next.event { --kind: #ff006e; }
.mb-next-ico { width: 56px; height: 56px; display: grid; place-items: center; border-radius: 16px; color: #05040a;
  background: linear-gradient(135deg, var(--kind), color-mix(in srgb, var(--kind) 45%, #7b2fff)); box-shadow: 0 0 24px color-mix(in srgb, var(--kind) 45%, transparent); }
.mb-next small { display: block; font: 700 11px/1 'Share Tech Mono', monospace; letter-spacing: .2em; text-transform: uppercase; color: var(--kind); margin-bottom: 6px; }
.mb-next strong { display: block; font: 900 17px/1.2 'Orbitron', sans-serif; color: #fff; margin-bottom: 4px; }
.mb-next span { color: #a9a3c8; font-size: 14px; }
.mb-when { text-align: center; padding: 10px 14px; border-radius: 14px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); }
.mb-when b { display: block; font: 900 22px/1 'Orbitron', sans-serif; color: #fff; }
.mb-when em { font-style: normal; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #9b95bb; }
@media (max-width: 640px) {
  .mb-next { grid-template-columns: auto 1fr; }
  .mb-when { grid-column: 1 / -1; display: flex; align-items: baseline; justify-content: center; gap: 8px; }
}
.mb-modal p { margin: 0 0 16px; color: #8b8bab; font-size: 14px; }
.mb-qr { display: inline-block; padding: 12px; border-radius: 16px; background: #fff;
  box-shadow: 0 0 0 1px rgba(0,245,255,.4), 0 0 40px rgba(0,245,255,.25); }
.mb-qr img { display: block; width: 220px; max-width: 100%; }
.mb-modal .u-modal-foot { justify-content: center; }
@media (max-width: 640px) {
  .mb-card { grid-template-columns: 60px 1fr; gap: 12px; }
  .mb-img { width: 60px; height: 60px; }
  .mb-side { grid-column: 1 / -1; flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: space-between;
    border-top: 1px dashed rgba(0,245,255,.12); padding-top: 10px; }
  .mb-card:hover { transform: none; }
  .mb-tabs { display: grid; width: 100%; }
  .mb-new { width: 100%; }
  .mb-new > * { flex: 1; padding-left: 8px; padding-right: 8px; white-space: nowrap; }
}
`;

const KIND_LABEL = { booking: "Game", combo: "Combo pack", event: "Event" };
const KIND_ICON = { booking: Gamepad2, combo: Popcorn, event: Ticket };

function niceDate(d) {
  if (!d) return "";
  const parsed = new Date(`${d}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? d
    : parsed.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function niceTime(t) {
  if (!t) return "";
  const [h, m] = String(t).split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function untilText(b) {
  const at = new Date(`${b.booking_date}T${b.start_time || "00:00"}`).getTime();
  const mins = Math.round((at - Date.now()) / 60000);
  if (!Number.isFinite(mins)) return null;
  if (mins <= 0) return { n: "Now", u: "happening" };
  if (mins < 60) return { n: mins, u: "min to go" };
  if (mins < 1440) return { n: Math.round(mins / 60), u: "hrs to go" };
  return { n: Math.round(mins / 1440), u: "days to go" };
}

function statusHint(b) {
  if (b.status === "pending") return "Waiting for confirmation";
  if ((b.status === "confirmed" || b.status === "approved") && !b.checked_in) return "Show the QR code at the counter";
  if (b.checked_in) return "Checked in";
  return "";
}

function apiError(err, fallback) {
  const d = err?.response?.data;
  if (!err?.response) return "Can't reach the server. Check your connection.";
  return d?.detail || d?.message || fallback;
}

export default function Bookings() {
  const [tab, setTab] = useState("upcoming");
  const [qrFor, setQrFor] = useState(null);
  const [cancelFor, setCancelFor] = useState(null);
  const [reason, setReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const { data: wallet, error: loadError, loading, reload: load } = useApi(getUserBookingsWallet, "wallet");
  const data = { upcoming: wallet?.upcoming || [], history: wallet?.history || [] };
  const error = loadError ? apiError(loadError, "Could not load your bookings.") : "";

  const confirmCancel = async () => {
    if (!cancelFor) return;
    setCancelling(true);
    try {
      await cancelUserBooking(cancelFor.booking_id, reason.trim());
      setCancelFor(null);
      setReason("");
      load();
    } catch (err) {
      alert(apiError(err, "Could not cancel this booking."));
    } finally {
      setCancelling(false);
    }
  };

  const list = tab === "upcoming" ? data.upcoming : data.history;

  return (
    <UserLayout>
      <style>{userCss + css}</style>
      <div className="u-page">
        <div className="u-head">
          <div>
            <h1>My bookings</h1>
            <p>Games, combo packs and events in one place.</p>
          </div>
          <div className="mb-new">
            <Link className="u-btn primary" to="/user/game-items"><CalendarPlus size={16} aria-hidden="true" /> Book a game</Link>
            <Link className="u-btn" to="/user/combo">Combos</Link>
            <Link className="u-btn" to="/user/events">Events</Link>
          </div>
        </div>

        <div className={`mb-tabs${tab === "history" ? " past" : ""}`} role="tablist">
          <button role="tab" aria-selected={tab === "upcoming"} className={tab === "upcoming" ? "on" : ""} onClick={() => setTab("upcoming")}>
            <CalendarDays size={15} aria-hidden="true" /> Upcoming ({data.upcoming.length})
          </button>
          <button role="tab" aria-selected={tab === "history"} className={tab === "history" ? "on" : ""} onClick={() => setTab("history")}>
            <History size={15} aria-hidden="true" /> Past ({data.history.length})
          </button>
        </div>

        {error && (
          <div className="u-error">
            {error} <button className="u-btn sm" onClick={load}>Try again</button>
          </div>
        )}

        {loading && !wallet ? (
          <div className="u-empty">Loading your bookings…</div>
        ) : list.length === 0 ? (
          <div className="u-empty">
            {tab === "upcoming" ? "You have no upcoming bookings." : "No past bookings yet."}
            {tab === "upcoming" && (
              <div style={{ marginTop: 14 }}>
                <Link className="u-btn primary" to="/user/game-items"><CalendarPlus size={16} aria-hidden="true" /> Book a game</Link>
              </div>
            )}
          </div>
        ) : (
          <>
          {tab === "upcoming" && list[0] && (() => {
            const nb = list[0];
            const nk = nb.booking_kind || "booking";
            const NIcon = KIND_ICON[nk] || Gamepad2;
            const until = untilText(nb);
            return (
              <div className={`mb-next ${nk}`}>
                <span className="mb-next-ico"><NIcon size={26} aria-hidden="true" /></span>
                <div style={{ minWidth: 0 }}>
                  <small>Next up</small>
                  <strong>{nb.title}</strong>
                  <span>{niceDate(nb.booking_date)} · {niceTime(nb.start_time)}</span>
                </div>
                {until && <div className="mb-when"><b>{until.n}</b><em>{until.u}</em></div>}
              </div>
            );
          })()}
          <div className="mb-list">
            {list.map((b, i) => {
              const kind = b.booking_kind || "booking";
              const hint = statusHint(b);
              return (
                <div className={`mb-card ${kind}`} key={`${tab}-${kind}-${b.id}`} style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
                  {b.image ? (
                    <img className="mb-img" src={b.image} alt="" loading="lazy" />
                  ) : (
                    <div className="mb-img ph" aria-hidden="true">{(() => { const KIcon = KIND_ICON[kind] || Gamepad2; return <KIcon size={28} />; })()}</div>
                  )}
                  <div>
                    <span className="mb-kind">{KIND_LABEL[kind] || "Booking"}</span>
                    <p className="mb-title">{b.title}</p>
                    <div className="mb-meta">
                      <span><CalendarDays size={14} aria-hidden="true" /><b>{niceDate(b.booking_date)}</b></span>
                      <span><Clock size={14} aria-hidden="true" />{niceTime(b.start_time)} – {niceTime(b.end_time)}</span>
                      <span><Hash size={14} aria-hidden="true" />{b.booking_id}</span>
                      {b.total_people > 1 && <span><Users size={14} aria-hidden="true" />{b.total_people} people</span>}
                      {Number(b.total_amount) > 0 && <span><Wallet size={14} aria-hidden="true" />₹{Number(b.total_amount).toLocaleString("en-IN")}</span>}
                    </div>
                    {hint && <span className="mb-hint">{hint}</span>}
                  </div>
                  <div className="mb-side">
                    <span className={`mb-badge ${b.status}`}>{b.status}</span>
                    <div className="mb-actions">
                      {b.qr_code_url && !b.checked_in && tab === "upcoming" && (
                        <button className="u-btn sm" onClick={() => setQrFor(b)}><QrCode size={15} aria-hidden="true" /> Show QR</button>
                      )}
                      {b.can_cancel && tab === "upcoming" && (
                        <button className="u-btn sm danger" onClick={() => setCancelFor(b)}><XCircle size={15} aria-hidden="true" /> Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>

      {qrFor && (
        <div className="u-modal-back" onMouseDown={(e) => e.target === e.currentTarget && setQrFor(null)}>
          <div className="u-modal mb-modal" role="dialog" aria-label="Booking QR code">
            <h3>{qrFor.title}</h3>
            <p>{niceDate(qrFor.booking_date)} · {niceTime(qrFor.start_time)} · ID {qrFor.booking_id}</p>
            <span className="mb-qr"><img src={qrFor.qr_code_url} alt={`QR code for booking ${qrFor.booking_id}`} /></span>
            <div className="u-modal-foot">
              <button className="u-btn" onClick={() => setQrFor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {cancelFor && (
        <div className="u-modal-back" onMouseDown={(e) => e.target === e.currentTarget && !cancelling && setCancelFor(null)}>
          <div className="u-modal mb-modal" role="dialog" aria-label="Cancel booking">
            <h3>Cancel this booking?</h3>
            <p>{cancelFor.title} · {niceDate(cancelFor.booking_date)} · {niceTime(cancelFor.start_time)}</p>
            <textarea
              className="u-input"
              placeholder="Reason (optional)"
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="u-modal-foot">
              <button className="u-btn" disabled={cancelling} onClick={() => setCancelFor(null)}>Keep booking</button>
              <button className="u-btn danger" disabled={cancelling} onClick={confirmCancel}>
                {cancelling ? "Cancelling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
