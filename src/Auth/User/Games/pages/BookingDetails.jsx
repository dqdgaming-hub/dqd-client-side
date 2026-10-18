import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, BadgeCheck, CalendarDays, CircleDollarSign, Clock, Crown, Gamepad2, Hash, Lock, NotebookPen, Play, QrCode,
  RotateCcw, Square, Star, Timer, UserCheck, Users,
} from "lucide-react";

import UserLayout from "../../UserLayout";
import { getBookingDetails } from "../../../api/userapi";
import { apiError, money, niceDate, niceTime, userCss } from "../../common/userUi";
import { resolveImage } from "../../../../components/home/homeStyles";

const css = `
.bd-hero { position: relative; overflow: hidden; padding: 0; }
.bd-hero::before { display: none; }
.bd-media { position: relative; height: clamp(160px, 28vw, 260px); background: radial-gradient(circle at 50% 40%, #1a1636, #0a0a14);
  display: grid; place-items: center; color: var(--u-cyan); }
.bd-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bd-media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, #0d0d1a 4%, rgba(13,13,26,.35) 45%, transparent 75%); }
.bd-hero-body { position: relative; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px; padding: 0 18px 18px; margin-top: -48px; z-index: 1; }
.bd-kicker { display: inline-block; margin-bottom: 6px; font: 700 11px/1 'Share Tech Mono', monospace; letter-spacing: 1.6px; text-transform: uppercase; color: var(--u-cyan); }
.bd-hero h1 { margin: 0 0 10px; font: 900 clamp(20px, 4vw, 30px)/1.15 'Orbitron', sans-serif; letter-spacing: .5px; color: #fff; overflow-wrap: anywhere; }
.bd-id { display: grid; gap: 4px; justify-items: end; text-align: right; }
.bd-id span { font: 700 10.5px/1 'Share Tech Mono', monospace; letter-spacing: 1.4px; text-transform: uppercase; color: var(--u-muted); }
.bd-id b { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 10px; font: 700 14px/1 'Share Tech Mono', monospace;
  letter-spacing: 1px; color: #fff; background: rgba(0,245,255,.08); border: 1px solid rgba(0,245,255,.3); overflow-wrap: anywhere; }
.bd-id b svg { color: var(--u-cyan); }
.bd-grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 18px; }
.bd-grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.u-card h2 { display: flex; align-items: center; gap: 8px; }
.u-card h2 svg { color: var(--u-cyan); flex: none; }
.bd-rows dt { display: inline-flex; align-items: center; gap: 8px; }
.bd-rows dt svg { color: var(--u-cyan); flex: none; }
.bd-members { display: grid; gap: 10px; }
.bd-member { display: flex; align-items: center; gap: 10px; min-width: 0; }
.bd-av { width: 36px; height: 36px; flex: none; display: grid; place-items: center; border-radius: 50%; font: 700 12px/1 'Orbitron', sans-serif;
  color: #05040a; background: linear-gradient(135deg, var(--u-cyan), #7b2fff); }
.bd-member.host .bd-av { background: linear-gradient(135deg, var(--u-yellow), #ff9f1c); }
.bd-member div { min-width: 0; flex: 1; }
.bd-member strong { display: block; color: #fff; font-size: 14.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bd-member small { color: var(--u-muted); font-size: 12.5px; }
.bd-qr { display: grid; justify-items: center; gap: 10px; text-align: center; }
.bd-qr img { width: 100%; max-width: 160px; height: auto; padding: 8px; border-radius: 12px; background: #fff; }
.bd-token { font: 700 11.5px/1.5 'Share Tech Mono', monospace; color: var(--u-muted); word-break: break-all; }
.bd-locked { display: grid; justify-items: center; gap: 10px; padding: 14px 0; text-align: center; color: var(--u-muted); font-size: 14px; line-height: 1.5; }
.bd-locked span { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 14px; color: var(--u-yellow);
  background: rgba(255,214,10,.08); border: 1px solid rgba(255,214,10,.28); }
.bd-notes { margin: 0; color: #c4c4dc; font-size: 14.5px; line-height: 1.65; white-space: pre-wrap; }
.bd-notes.empty { color: var(--u-muted); font-style: italic; }
.bd-skel { height: 200px; border-radius: 14px; background: linear-gradient(110deg, #0d0d1a 30%, #1a1838 50%, #0d0d1a 70%); background-size: 200% 100%;
  animation: uShine 1.4s linear infinite; }
.bd-skel.tall { height: 300px; }
@media (max-width: 860px) {
  .bd-grid { grid-template-columns: 1fr; }
  .bd-grid3 { grid-template-columns: 1fr 1fr; }
  .bd-grid3 > :last-child { grid-column: 1 / -1; }
}
@media (max-width: 560px) {
  .bd-grid3 { grid-template-columns: 1fr; }
  .bd-id { justify-items: start; text-align: left; }
}
`;

const BOOKING_TAG = { pending: "warn", confirmed: "ok", completed: "", cancelled: "bad" };
const PAY_TAG = { paid: "ok", pending: "warn", failed: "bad", refunded: "" };

const show = (v) => (v === null || v === undefined || v === "" ? "—" : v);
const initials = (name = "") => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

function Skeleton() {
  return (
    <div className="u-stack" aria-label="Loading">
      <div className="bd-skel tall" />
      <div className="bd-grid"><div className="bd-skel" /><div className="bd-skel" /></div>
      <div className="bd-grid3"><div className="bd-skel" /><div className="bd-skel" /><div className="bd-skel" /></div>
    </div>
  );
}

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBooking = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getBookingDetails(id);
      setBooking(res.data);
    } catch (err) {
      setError(apiError(err, "Couldn't load this booking."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadBooking(); }, [loadBooking]);

  const b = booking || {};
  const members = b.members || [];
  const status = b.status || "pending";
  const payStatus = b.payment_status || "pending";
  const approved = !!b.approved_by_name;
  const img = resolveImage(b.game?.image);

  const info = [
    { icon: CalendarDays, label: "Date", value: b.booking_date ? niceDate(b.booking_date) : null },
    { icon: Play, label: "Start", value: b.start_time ? niceTime(b.start_time) : null },
    { icon: Square, label: "End", value: b.end_time ? niceTime(b.end_time) : null },
    { icon: Timer, label: "Hours", value: b.total_hours },
    { icon: Users, label: "Players", value: b.total_people },
    { icon: Star, label: "Loyalty", value: b.awarded_loyalty_points },
  ];

  return (
    <UserLayout>
      <style>{userCss + css}</style>
      <div className="u-page">
        <div>
          <button type="button" className="u-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} aria-hidden="true" /> Back
          </button>
        </div>

        {loading ? (
          <Skeleton />
        ) : error || !booking ? (
          <div className="u-error" role="alert">
            {error || "Couldn't load this booking."}
            <button type="button" className="u-btn sm" onClick={loadBooking}><RotateCcw size={14} aria-hidden="true" /> Try again</button>
          </div>
        ) : (
          <div className="u-stack">
            <section className="u-card bd-hero">
              <div className="bd-media">
                {img ? <img src={img} alt={b.game?.name || ""} /> : <Gamepad2 size={48} aria-hidden="true" />}
              </div>
              <div className="bd-hero-body">
                <div style={{ minWidth: 0 }}>
                  <span className="bd-kicker">Booking details</span>
                  <h1>{show(b.game?.name)}</h1>
                  <span className={`u-tag ${BOOKING_TAG[status] ?? "warn"}`}>{status.toUpperCase()}</span>
                </div>
                <div className="bd-id">
                  <span>Booking ID</span>
                  <b><Hash size={14} aria-hidden="true" />{show(b.booking_id)}</b>
                </div>
              </div>
            </section>

            <div className="bd-grid">
              <section className="u-card">
                <h2><CalendarDays size={16} aria-hidden="true" /> Booking info</h2>
                <dl className="u-summary bd-rows" style={{ margin: 0 }}>
                  {info.map(({ icon: Icon, label, value }) => (
                    <div key={label}>
                      <dt><Icon size={14} aria-hidden="true" /> {label}</dt>
                      <dd>{show(value)}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="u-card">
                <div className="u-card-head">
                  <h2><CircleDollarSign size={16} aria-hidden="true" /> Payment</h2>
                  <span className={`u-tag ${PAY_TAG[payStatus] ?? "warn"}`}>Payment {payStatus.toUpperCase()}</span>
                </div>
                <dl className="u-summary" style={{ margin: 0 }}>
                  <div><dt>Subtotal</dt><dd>{money(b.subtotal)}</dd></div>
                  <div><dt>Discount</dt><dd>{money(b.discount_amount)}</dd></div>
                  <div><dt>Paid</dt><dd>{money(b.price_paid)}</dd></div>
                  <div className="total"><dt>Total</dt><dd>{money(b.total_amount)}</dd></div>
                </dl>
              </section>
            </div>

            <div className="bd-grid3">
              <section className="u-card">
                <div className="u-card-head">
                  <h2><Users size={16} aria-hidden="true" /> Members</h2>
                  <span className="u-tag">{1 + members.length}</span>
                </div>
                <div className="bd-members">
                  <div className="bd-member host">
                    <span className="bd-av">{initials(b.customer_name)}</span>
                    <div><strong>{show(b.customer_name)}</strong></div>
                    <span className="u-tag warn"><Crown size={11} className="ico" aria-hidden="true" />Host</span>
                  </div>
                  {members.map((m) => (
                    <div className="bd-member" key={m.id}>
                      <span className="bd-av">{initials(m.name)}</span>
                      <div>
                        <strong>{m.name}</strong>
                        {m.phone && <small>{m.phone}</small>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="u-card">
                <h2><QrCode size={16} aria-hidden="true" /> QR check-in</h2>
                {b.is_qr_valid ? (
                  <div className="bd-qr">
                    <img src={b.qr_code} alt={`QR code for booking ${b.booking_id}`} />
                    <div>
                      <div className="u-small">Token</div>
                      <div className="bd-token">{b.qr_token}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bd-locked">
                    <span><Lock size={20} aria-hidden="true" /></span>
                    QR available after admin approval
                  </div>
                )}
              </section>

              <section className="u-card">
                <div className="u-card-head">
                  <h2><BadgeCheck size={16} aria-hidden="true" /> Approval</h2>
                  <span className={`u-tag ${approved ? "ok" : "warn"}`}>{approved ? "Approved" : "Awaiting"}</span>
                </div>
                <dl className="u-summary bd-rows" style={{ margin: 0 }}>
                  <div><dt><UserCheck size={14} aria-hidden="true" /> Approved by</dt><dd>{approved ? b.approved_by_name : "—"}</dd></div>
                  <div><dt><Clock size={14} aria-hidden="true" /> Approved at</dt><dd>{b.approved_at && b.approved_at !== "--" ? b.approved_at : "—"}</dd></div>
                </dl>
              </section>
            </div>

            <section className="u-card">
              <h2><NotebookPen size={16} aria-hidden="true" /> Notes</h2>
              {b.notes && b.notes.trim() ? (
                <p className="bd-notes">{b.notes}</p>
              ) : (
                <p className="bd-notes empty">No notes for this booking.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
