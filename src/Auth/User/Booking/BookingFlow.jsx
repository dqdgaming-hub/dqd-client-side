import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, CalendarCheck, CalendarDays, Check, Clock, Gamepad2, MessageSquare, Popcorn, ShieldCheck, Sparkles, Star, Ticket, Timer, Users, Wallet,
} from "lucide-react";
import UserLayout from "../UserLayout";
import useApi from "../../../hooks/useApi";
import { getBookingOptions, getBookingSlots, submitBooking } from "../../api/userapi";
import MemberFields from "../common/MemberFields";
import SlotPicker from "../common/SlotPicker";
import {
  apiError, cleanMembers, freeHoursFrom, hasErrors, memberErrors, money, niceDate, niceTime, todayISO, userCss,
} from "../common/userUi";

/*
 * One booking page for every kind of booking:
 *   /user/book/game/:id     · pay per hour
 *   /user/book/combo/:id    · fixed combo price
 *   /user/book/event/:id    · fixed date & time, price per seat
 *   /user/book/loyalty/:id  · pay with loyalty points
 * Same steps everywhere: when → who → review & confirm.
 */

const BACK = {
  game: ["/user/game-items", "Games"],
  combo: ["/user/combo", "Combo packs"],
  event: ["/user/events", "Events"],
  loyalty: ["/user/claim-points", "Use points"],
};

const KIND = {
  game: { icon: Gamepad2, label: "Game session", c1: "#00f5ff", c2: "#7b2fff" },
  combo: { icon: Popcorn, label: "Combo pack", c1: "#ffd60a", c2: "#ff7a3d" },
  event: { icon: Ticket, label: "Event pass", c1: "#ff2d78", c2: "#ffd60a" },
  loyalty: { icon: Star, label: "Free hour with points", c1: "#a66bff", c2: "#00f5ff" },
};

const css = `
.bf-wrap { --c1: #00f5ff; --c2: #7b2fff; }

/* hero banner */
.bf-hero { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: flex-end; gap: 18px; min-height: 210px;
  padding: 22px; margin-bottom: 18px; border-radius: 24px; border: 1px solid color-mix(in srgb, var(--c1) 35%, transparent);
  background: radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--c1) 35%, transparent), transparent 55%),
    radial-gradient(circle at 90% 90%, color-mix(in srgb, var(--c2) 30%, transparent), transparent 55%), #0d0c1d;
  box-shadow: 0 24px 60px rgba(0,0,0,.45), 0 0 40px color-mix(in srgb, var(--c1) 12%, transparent); }
.bf-hero-bg { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; filter: saturate(1.2); opacity: .55; transform: scale(1.05); }
.bf-hero::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(0deg, rgba(5,4,10,.95) 5%, rgba(5,4,10,.5) 55%, rgba(5,4,10,.2)); }
.bf-thumb { flex: none; width: 92px; height: 92px; border-radius: 20px; overflow: hidden; display: grid; place-items: center; color: #fff;
  background: linear-gradient(135deg, var(--c1), var(--c2)); box-shadow: 0 12px 30px color-mix(in srgb, var(--c1) 40%, transparent), 0 0 0 2px rgba(255,255,255,.12); }
.bf-thumb img { width: 100%; height: 100%; object-fit: cover; }
.bf-kind { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 8px; padding: 6px 11px; border-radius: 999px;
  font: 800 10.5px/1 'Orbitron', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #fff;
  background: rgba(5,5,15,.55); border: 1px solid color-mix(in srgb, var(--c1) 55%, transparent); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.bf-hero h1 { margin: 0 0 8px; font: 900 clamp(22px, 3.6vw, 34px)/1.08 'Orbitron', sans-serif; letter-spacing: .02em; text-transform: uppercase; color: #fff; }
.bf-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.bf-pill { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 12px; font-size: 14px; font-weight: 600; color: #e9e4ff;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); }
.bf-pill.price { color: #05040a; background: linear-gradient(135deg, var(--c1), var(--c2)); border: 0; font-weight: 800; }

/* step tracker */
.bf-track { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-bottom: 18px; }
.bf-track div { position: relative; display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 14px; font-size: 13px; font-weight: 700;
  color: #8f89b0; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); transition: all .3s; }
.bf-track i { flex: none; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; font: 800 11px/1 'Orbitron', sans-serif; font-style: normal;
  background: rgba(255,255,255,.08); color: #cfc9e6; transition: all .3s; }
.bf-track div.done { color: #fff; border-color: color-mix(in srgb, var(--c1) 45%, transparent); background: color-mix(in srgb, var(--c1) 8%, transparent); }
.bf-track div.done i { color: #05040a; background: linear-gradient(135deg, var(--c1), var(--c2)); box-shadow: 0 0 12px color-mix(in srgb, var(--c1) 50%, transparent); }

.bf { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(290px, 1fr); gap: 18px; align-items: start; }
.bf > *, .bf .u-stack > * { min-width: 0; }
.bf-step { display: flex; align-items: center; gap: 12px; margin: 0 0 16px !important; font-size: 15px !important; }
.bf-step .ic { flex: none; width: 38px; height: 38px; display: grid; place-items: center; border-radius: 12px; color: var(--c1);
  background: color-mix(in srgb, var(--c1) 12%, transparent); border: 1px solid color-mix(in srgb, var(--c1) 30%, transparent); }
.bf-step small { display: block; margin-top: 3px; font: 600 12px/1.2 'Inter', sans-serif; letter-spacing: 0; text-transform: none; color: #8f89b0; }
.bf-sub { display: flex; align-items: center; gap: 8px; margin: 18px 0 10px; font: 700 11px/1 'Share Tech Mono', monospace; letter-spacing: .18em; text-transform: uppercase; color: #a9a3c8; }

/* dates */
.bf-days { display: flex; gap: 10px; overflow-x: auto; padding: 4px 2px 10px; scroll-snap-type: x proximity; -webkit-overflow-scrolling: touch; }
.bf-day { position: relative; flex: none; width: 66px; padding: 10px 4px; border-radius: 16px; cursor: pointer; text-align: center; line-height: 1.15; scroll-snap-align: start;
  border: 1px solid rgba(255,255,255,.1); background: rgba(5,5,15,.7); color: #b9b3d6; transition: transform .2s, border-color .2s, box-shadow .2s, background .2s; }
.bf-day:hover { transform: translateY(-2px); border-color: var(--c1); }
.bf-day small { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #8f89b0; }
.bf-day strong { display: block; margin: 4px 0; font: 900 20px/1 'Orbitron', sans-serif; color: #fff; }
.bf-day.on { border-color: transparent; background: linear-gradient(160deg, var(--c1), var(--c2)); box-shadow: 0 10px 24px color-mix(in srgb, var(--c1) 40%, transparent); transform: translateY(-2px); }
.bf-day.on small, .bf-day.on strong { color: #05040a; }
.bf-day .tick { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; display: grid; place-items: center; border-radius: 50%;
  background: #fff; color: #05040a; box-shadow: 0 4px 10px rgba(0,0,0,.4); }
.bf-other { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
.bf-other .u-input { max-width: 220px; }

.bf-fixed { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.bf-fixed div { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 16px; background: rgba(5,5,15,.7); border: 1px solid rgba(255,255,255,.08); }
.bf-fixed svg { flex: none; color: var(--c1); }
.bf-fixed span { display: block; font-size: 11px; font-weight: 700; letter-spacing: .1em; color: #8f89b0; text-transform: uppercase; }
.bf-fixed strong { color: #fff; font-size: 15px; }
.bf-wrap .u-chip.on { background: linear-gradient(135deg, var(--c1), var(--c2)); color: #05040a; }
.bf-wrap .u-btn.primary { background: linear-gradient(135deg, var(--c1), var(--c2)); color: #05040a; }

/* summary ticket */
.bf-side { position: sticky; top: 92px; padding: 0 !important; overflow: hidden; }
.bf-ticket-head { padding: 18px 18px 14px; background: linear-gradient(135deg, color-mix(in srgb, var(--c1) 20%, transparent), color-mix(in srgb, var(--c2) 14%, transparent)); }
.bf-ticket-head h2 { margin: 0 !important; display: flex; align-items: center; gap: 8px; }
.bf-cut { position: relative; height: 0; margin: 0 18px; border-top: 2px dashed rgba(255,255,255,.14); }
.bf-cut::before, .bf-cut::after { content: ""; position: absolute; top: -11px; width: 20px; height: 20px; border-radius: 50%; background: #05040a; }
.bf-cut::before { left: -28px; } .bf-cut::after { right: -28px; }
.bf-ticket-body { padding: 16px 18px 18px; }
.bf-rows { display: grid; gap: 11px; margin: 0 0 14px; }
.bf-rows div { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 14px; }
.bf-rows dt { display: inline-flex; align-items: center; gap: 8px; color: #9b95bb; }
.bf-rows dt svg { color: var(--c1); }
.bf-rows dd { margin: 0; color: #fff; font-weight: 600; text-align: right; }
.bf-total { display: flex; align-items: baseline; justify-content: space-between; padding-top: 12px; margin-bottom: 12px; border-top: 1px solid rgba(255,255,255,.08); }
.bf-total span { color: #9b95bb; font-size: 13px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.bf-total b { font: 900 26px/1 'Orbitron', sans-serif; color: var(--c1); text-shadow: 0 0 20px color-mix(in srgb, var(--c1) 45%, transparent); }
.bf-note { display: flex; gap: 8px; align-items: flex-start; margin: 0 0 14px; color: #9b95bb; font-size: 13px; line-height: 1.45; }
.bf-note svg { flex: none; color: #39ff14; margin-top: 1px; }
.bf-confirm { min-height: 54px !important; font-size: 14px !important; }

/* phone: sticky total + confirm */
.bf-bar { display: none; }
@media (max-width: 860px) {
  .bf { grid-template-columns: minmax(0, 1fr); }
  .bf-side { position: static; }
  .bf-side .bf-confirm { display: none; }
  .bf-bar { position: fixed; z-index: 110; left: 12px; right: 12px; bottom: calc(env(safe-area-inset-bottom) + 84px); display: flex; align-items: center; gap: 12px;
    padding: 10px 10px 10px 16px; border-radius: 20px; background: rgba(13,12,29,.92); border: 1px solid color-mix(in srgb, var(--c1) 35%, transparent);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 16px 40px rgba(0,0,0,.55); }
  .bf-bar div { min-width: 0; flex: 1; }
  .bf-bar small { display: block; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #9b95bb; }
  .bf-bar b { font: 900 19px/1.1 'Orbitron', sans-serif; color: var(--c1); }
  .bf-bar .u-btn { flex: none; min-height: 50px; padding: 0 20px; }
  .bf-wrap .u-page { padding-bottom: 200px; }
  .bf-track { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
  .bf-track div { flex-direction: column; justify-content: center; gap: 5px; padding: 9px 4px; font-size: 11px; text-align: center; }
}
@media (max-width: 480px) {
  .bf-hero { min-height: 180px; padding: 16px; gap: 14px; border-radius: 20px; }
  .bf-thumb { width: 70px; height: 70px; border-radius: 16px; }
  .bf-day { width: 60px; }
}

/* success */
.bf-done { text-align: center; padding: 30px 22px !important; overflow: hidden; }
.bf-burst { position: relative; width: 104px; height: 104px; margin: 0 auto 18px; }
.bf-ring { position: absolute; inset: 0; border-radius: 50%; display: grid; place-items: center; color: #05040a;
  background: linear-gradient(135deg, var(--c1), var(--c2)); box-shadow: 0 0 0 10px color-mix(in srgb, var(--c1) 15%, transparent), 0 0 50px color-mix(in srgb, var(--c1) 50%, transparent); }
.bf-confetti { position: absolute; left: 50%; top: 50%; width: 8px; height: 14px; border-radius: 2px; }
.bf-done h1 { margin: 0 0 6px; font: 900 24px/1.2 'Orbitron', sans-serif; text-transform: uppercase; color: #fff; }
.bf-id { display: inline-flex; align-items: center; gap: 8px; margin: 14px 0 6px; padding: 10px 16px; border-radius: 14px; font: 800 15px/1 'Share Tech Mono', monospace;
  letter-spacing: .12em; color: #fff; background: rgba(255,255,255,.06); border: 1px dashed color-mix(in srgb, var(--c1) 55%, transparent); }
`;

function nextDays(count) {
  const out = [];
  const base = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    out.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      dow: i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
    });
  }
  return out;
}

function addHours(hhmm, hours) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + (m || 0) + hours * 60;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// Fresh form state for every booking target (React Router reuses the
// component when only the URL params change).
export default function BookingFlowPage({ kind }) {
  const params = useParams();
  const resolvedKind = kind || params.kind;
  return <BookingFlow key={`${resolvedKind}-${params.id}`} kind={resolvedKind} id={params.id} />;
}

function BookingFlow({ kind, id }) {

  const optionsApi = useApi(() => getBookingOptions(kind, id), `${kind}|${id}`);
  const opt = optionsApi.data;
  const fixed = opt?.fixed_schedule;

  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [hours, setHours] = useState(1);
  const [members, setMembers] = useState([]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [memberErrs, setMemberErrs] = useState([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const days = useMemo(() => nextDays(14), []);
  const needsTime = opt && !fixed;
  const slotsApi = useApi(
    () => (needsTime && date ? getBookingSlots(kind, id, date) : null),
    `${kind}|${id}|${date}|${needsTime ? 1 : 0}`,
  );
  const slots = needsTime && date ? slotsApi.data?.slots || [] : [];

  const maxPeople = opt?.max_people ?? 1;
  const minPeople = opt?.min_people ?? 1;
  const maxExtra = Math.max(maxPeople - 1, 0);
  const people = members.length + 1;
  const freeHours = start ? freeHoursFrom(slots, start) : 0;
  const hourLimit = Math.max(Math.min(opt?.max_hours ?? 1, freeHours || 1), 1);

  const price = Number(opt?.price || 0);
  const total =
    opt?.pricing === "per_hour" ? price * hours
      : opt?.pricing === "per_person" ? price * people
        : opt?.pricing === "fixed" ? price
          : 0;
  const pointsCost = opt?.pricing === "points" ? hours * (opt.points_per_hour || 100) : 0;

  const shownDate = fixed ? fixed.date : date;
  const shownStart = fixed ? fixed.start_time : start;
  const shownEnd = fixed ? fixed.end_time : start ? addHours(start, hours) : "";

  const pickDate = (value) => {
    setDate(value);
    setStart("");
    setHours(1);
    setErrors((e) => ({ ...e, date: "", start_time: "" }));
  };

  const validate = () => {
    const e = {};
    if (needsTime) {
      if (!date) e.date = "Choose a date";
      else if (date < todayISO()) e.date = "This date has passed.";
      if (date && !start) e.start_time = "Choose a start time";
      else if (start && hours > freeHours) e.start_time = "Some of those hours are taken. Pick fewer hours.";
    }
    if (fixed?.is_over) e.date = "This event has finished.";
    if (people < minPeople) e.members = `Add at least ${minPeople - people} more player${minPeople - people > 1 ? "s" : ""}.`;
    if (people > maxPeople) e.members = `Maximum ${maxPeople} ${kind === "event" ? "seats" : "players"}.`;
    if (opt?.pricing === "points" && pointsCost > (opt.points_balance || 0)) e.hours = "Not enough points for that many hours.";
    const me = memberErrors(members);
    setErrors(e);
    setMemberErrs(me);
    return Object.keys(e).length === 0 && !hasErrors(me);
  };

  const submit = async (ev) => {
    ev?.preventDefault();
    if (submitting) return;
    setFormError("");
    if (!validate()) {
      setFormError("Please check the highlighted details.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitBooking({
        kind,
        id,
        ...(needsTime ? { date, start_time: start, hours } : {}),
        members: cleanMembers(members),
        notes: notes.trim(),
      });
      setDone(res.booking);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const body = err?.response?.data || {};
      const fieldErrs = {};
      for (const key of ["date", "start_time", "hours", "members"]) {
        if (body[key]) fieldErrs[key] = Array.isArray(body[key]) ? String(body[key][0]) : String(body[key]);
      }
      setErrors((e) => ({ ...e, ...fieldErrs }));
      setFormError(apiError(err, "Couldn't complete the booking. Please try again."));
      if (needsTime) slotsApi.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const [backTo, backLabel] = BACK[kind] || BACK.game;

  /* ── loading / error / success states ── */
  if (!opt) {
    return (
      <UserLayout>
        <style>{userCss + css}</style>
        <div className="u-page">
          <Link className="u-back" to={backTo}><ArrowLeft size={15} aria-hidden="true" /> {backLabel}</Link>
          {optionsApi.error ? (
            <div className="u-error">
              {optionsApi.error.response?.status === 404
                ? "This is no longer available for booking."
                : apiError(optionsApi.error, "Couldn't load booking details.")}{" "}
              <button className="u-btn sm" onClick={optionsApi.reload}>Try again</button>
            </div>
          ) : (
            <div className="u-empty">Loading…</div>
          )}
        </div>
      </UserLayout>
    );
  }

  const look = KIND[kind] || KIND.game;
  const KindIcon = look.icon;
  const tone = { "--c1": look.c1, "--c2": look.c2 };

  if (done) {
    return (
      <UserLayout>
        <style>{userCss + css}</style>
        <div className="bf-wrap" style={tone}>
          <div className="u-page" style={{ maxWidth: 620 }}>
            <section className="u-card bf-done">
              <div className="bf-burst" aria-hidden="true">
                {Array.from({ length: 14 }, (_, i) => (
                  <motion.span
                    key={i}
                    className="bf-confetti"
                    style={{ background: [look.c1, look.c2, "#ffffff", "#39ff14"][i % 4] }}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    animate={{ x: Math.cos((i / 14) * Math.PI * 2) * 90, y: Math.sin((i / 14) * Math.PI * 2) * 90, opacity: 0, rotate: 260 }}
                    transition={{ duration: 1.1, delay: 0.25, ease: "easeOut" }}
                  />
                ))}
                <motion.div className="bf-ring" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 14 }}>
                  <Check size={52} strokeWidth={3} />
                </motion.div>
              </div>
              <h1>Booking received</h1>
              <p className="u-muted" style={{ margin: 0 }}>We'll confirm it shortly and send the details on WhatsApp.</p>
              <div className="bf-id"><Ticket size={16} aria-hidden="true" /> {done.booking_id}</div>
              <dl className="bf-rows" style={{ textAlign: "left", margin: "18px 0" }}>
                <div><dt><KindIcon size={15} aria-hidden="true" /> {kind === "event" ? "Event" : "Booking"}</dt><dd>{done.title}</dd></div>
                <div><dt><CalendarDays size={15} aria-hidden="true" /> Date</dt><dd>{niceDate(done.date)}</dd></div>
                <div><dt><Clock size={15} aria-hidden="true" /> Time</dt><dd>{niceTime(done.start_time)} – {niceTime(done.end_time)}</dd></div>
                <div><dt><Users size={15} aria-hidden="true" /> {kind === "event" ? "Seats" : "Players"}</dt><dd>{done.people}</dd></div>
              </dl>
              <div className="bf-total">
                <span>{kind === "loyalty" ? "Points used" : "Total"}</span>
                <b>{kind === "loyalty" ? done.points_used : money(done.total_amount)}</b>
              </div>
              <div className="u-row" style={{ justifyContent: "center" }}>
                <Link className="u-btn primary" to="/user/bookings"><CalendarCheck size={16} aria-hidden="true" /> My bookings</Link>
                <Link className="u-btn" to={backTo}>Book something else</Link>
              </div>
            </section>
          </div>
        </div>
      </UserLayout>
    );
  }

  const priceLabel =
    opt.pricing === "per_hour" ? `${money(opt.price)} / hour`
      : opt.pricing === "per_person" ? (price > 0 ? `${money(opt.price)} / seat` : "Free entry")
        : opt.pricing === "fixed" ? money(opt.price)
          : `${opt.points_per_hour} points / hour · you have ${opt.points_balance}`;

  const unavailable =
    (fixed && (fixed.is_over || maxPeople <= 0)) || (opt.pricing === "points" && (opt.max_hours || 0) < 1);

  const confirmLabel = submitting ? "Booking…" : kind === "loyalty" ? `Use ${pointsCost} points` : "Confirm booking";
  const totalText = kind === "loyalty" ? `${pointsCost} pts` : shownStart ? money(total) : "—";

  // Steps tick off in order: date & time, then players, then (optional) notes.
  const whenDone = fixed ? true : Boolean(date && start);
  const whoDone = whenDone && people >= minPeople;
  const steps = [
    { label: "When", done: whenDone },
    { label: "Who", done: whoDone },
    { label: "Notes", done: whoDone && Boolean(notes.trim()) },
    { label: "Confirm", done: false },
  ];

  return (
    <UserLayout>
      <style>{userCss + css}</style>
      <div className="bf-wrap" style={tone}>
      <div className="u-page">
        <Link className="u-back" to={backTo}><ArrowLeft size={15} aria-hidden="true" /> {backLabel}</Link>

        <motion.header className="bf-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {opt.image && <img className="bf-hero-bg" src={opt.image} alt="" />}
          <div className="bf-thumb">{opt.image ? <img src={opt.image} alt="" /> : <KindIcon size={38} aria-hidden="true" />}</div>
          <div style={{ minWidth: 0 }}>
            <span className="bf-kind"><KindIcon size={13} aria-hidden="true" /> {look.label}</span>
            <h1>{opt.title}</h1>
            <div className="bf-meta">
              <span className="bf-pill price">{kind === "loyalty" ? <Star size={14} aria-hidden="true" /> : <Wallet size={14} aria-hidden="true" />} {priceLabel}</span>
              {opt.subtitle && <span className="bf-pill">{opt.subtitle}</span>}
            </div>
          </div>
        </motion.header>

        {unavailable ? (
          <div className="u-empty">
            {fixed?.is_over ? "This event has finished."
              : fixed ? "This event is full."
                : `You need at least ${opt.points_per_hour} points for a free hour.`}
            <div style={{ marginTop: 14 }}><Link className="u-btn primary" to={backTo}>Back to {backLabel}</Link></div>
          </div>
        ) : (
          <>
          <div className="bf-track" aria-hidden="true">
            {steps.map((st, i) => (
              <div key={st.label} className={st.done ? "done" : ""}>
                <i>{st.done ? <Check size={13} strokeWidth={3} /> : i + 1}</i>
                {st.label}
              </div>
            ))}
          </div>
          <form id="bf-form" className="bf" onSubmit={submit} noValidate>
            <div className="u-stack">
              {/* Step 1 — when */}
              <section className="u-card">
                <h2 className="bf-step">
                  <span className="ic"><CalendarDays size={19} aria-hidden="true" /></span>
                  <span>{fixed ? "Date & time" : "Pick a date & time"}<small>{fixed ? "Set by the organiser" : "Choose a day, then a start time"}</small></span>
                </h2>
                {fixed ? (
                  <div className="bf-fixed">
                    <div><CalendarDays size={20} aria-hidden="true" /><span><span>Date</span><strong>{niceDate(fixed.date)}</strong></span></div>
                    <div><Clock size={20} aria-hidden="true" /><span><span>Time</span><strong>{niceTime(fixed.start_time)} – {niceTime(fixed.end_time)}</strong></span></div>
                    {opt.seats_left != null && <div><Users size={20} aria-hidden="true" /><span><span>Seats left</span><strong>{opt.seats_left}</strong></span></div>}
                  </div>
                ) : (
                  <>
                    <div className="bf-days" role="group" aria-label="Date">
                      {days.map((d) => (
                        <button
                          type="button"
                          key={d.iso}
                          className={`bf-day${date === d.iso ? " on" : ""}`}
                          aria-pressed={date === d.iso}
                          aria-label={niceDate(d.iso)}
                          onClick={() => pickDate(d.iso)}
                        >
                          {date === d.iso && <span className="tick" aria-hidden="true"><Check size={12} strokeWidth={3} /></span>}
                          <small>{d.dow}</small>
                          <strong>{d.day}</strong>
                          <small>{d.month}</small>
                        </button>
                      ))}
                    </div>
                    <div className="bf-other">
                      <span className="u-small">Or pick another date</span>
                      <input className={`u-input${errors.date ? " bad" : ""}`} type="date" min={todayISO()} value={date} aria-label="Another date"
                        onChange={(e) => pickDate(e.target.value)} />
                    </div>
                    {errors.date && <span className="u-err-text">{errors.date}</span>}

                    {date && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="bf-sub"><Clock size={14} aria-hidden="true" /> Start time</div>
                        {slotsApi.error ? (
                          <div className="u-error">
                            {apiError(slotsApi.error, "Couldn't load times.")}{" "}
                            <button type="button" className="u-btn sm" onClick={slotsApi.reload}>Try again</button>
                          </div>
                        ) : slotsApi.loading && !slotsApi.data ? (
                          <p className="u-small">Loading times…</p>
                        ) : (
                          <SlotPicker slots={slots} value={start}
                            onPick={(v) => { setStart(v); setHours(1); setErrors((e) => ({ ...e, start_time: "" })); }}
                            hours={hours} disabled={slotsApi.loading || submitting} />
                        )}
                        {errors.start_time && <span className="u-err-text">{errors.start_time}</span>}
                      </motion.div>
                    )}

                    {start && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="bf-sub"><Timer size={14} aria-hidden="true" /> How long?</div>
                        <div className="u-chips" role="group" aria-label="Hours">
                          {Array.from({ length: hourLimit }, (_, i) => i + 1).map((h) => (
                            <button type="button" key={h} className={`u-chip${hours === h ? " on" : ""}`}
                              aria-pressed={hours === h} onClick={() => setHours(h)}>
                              {h} hr{h > 1 ? "s" : ""}
                            </button>
                          ))}
                        </div>
                        {errors.hours && <span className="u-err-text">{errors.hours}</span>}
                      </motion.div>
                    )}
                  </>
                )}
              </section>

              {/* Step 2 — who */}
              <section className="u-card">
                <h2 className="bf-step">
                  <span className="ic"><Users size={19} aria-hidden="true" /></span>
                  <span>{kind === "event" ? "Who's coming?" : "Who's playing?"}
                    <small>You're included.{minPeople > 1 ? ` Add at least ${minPeople - 1} more.` : ""}{maxExtra > 0 ? ` Up to ${maxPeople} in total.` : " This booking is for you only."}</small>
                  </span>
                </h2>
                {maxExtra > 0 && (
                  <MemberFields members={members} setMembers={setMembers} errors={memberErrs} maxExtra={maxExtra} disabled={submitting} />
                )}
                {errors.members && <span className="u-err-text">{errors.members}</span>}
              </section>

              {/* Step 3 — notes */}
              <section className="u-card">
                <h2 className="bf-step">
                  <span className="ic"><MessageSquare size={19} aria-hidden="true" /></span>
                  <span>Anything else?<small>Optional — requests or notes for the team</small></span>
                </h2>
                <textarea className="u-input" aria-label="Notes" value={notes} maxLength={500}
                  onChange={(e) => setNotes(e.target.value)} placeholder="e.g. birthday party, need an extra controller" />
              </section>
            </div>

            <aside className="u-card bf-side">
              <div className="bf-ticket-head"><h2><Sparkles size={17} aria-hidden="true" /> Your booking</h2></div>
              <div className="bf-cut" aria-hidden="true" />
              <div className="bf-ticket-body">
                <dl className="bf-rows">
                  <div><dt><CalendarDays size={15} aria-hidden="true" /> Date</dt><dd>{shownDate ? niceDate(shownDate) : "—"}</dd></div>
                  <div><dt><Clock size={15} aria-hidden="true" /> Time</dt><dd>{shownStart ? `${niceTime(shownStart)} – ${niceTime(shownEnd)}` : "—"}</dd></div>
                  {!fixed && <div><dt><Timer size={15} aria-hidden="true" /> Duration</dt><dd>{start ? `${hours} hr${hours > 1 ? "s" : ""}` : "—"}</dd></div>}
                  <div><dt><Users size={15} aria-hidden="true" /> {kind === "event" ? "Seats" : "Players"}</dt><dd>{people}</dd></div>
                  {opt.snack && <div><dt><Popcorn size={15} aria-hidden="true" /> Includes</dt><dd>{opt.snack}</dd></div>}
                  {opt.loyalty_bonus > 0 && <div><dt><Star size={15} aria-hidden="true" /> Bonus</dt><dd>+{opt.loyalty_bonus} pts</dd></div>}
                </dl>
                <div className="bf-total"><span>{kind === "loyalty" ? "Points" : "Total"}</span><b>{totalText}</b></div>
                <p className="bf-note"><ShieldCheck size={16} aria-hidden="true" /> Pay at the counter. You'll get a WhatsApp message when it's confirmed.</p>
                {formError && <div className="u-error" role="alert">{formError}</div>}
                <button className="u-btn primary block bf-confirm" disabled={submitting}>{confirmLabel}</button>
              </div>
            </aside>

          </form>
          </>
        )}
      </div>
      {/* Phone: sticky total + confirm. Outside the animated page so position: fixed is relative to the screen. */}
      {!unavailable && (
        <div className="bf-bar">
          <div>
            <small>{kind === "loyalty" ? "Points" : "Total"}</small>
            <b>{totalText}</b>
          </div>
          <button type="submit" form="bf-form" className="u-btn primary" disabled={submitting}>{confirmLabel}</button>
        </div>
      )}
      </div>
    </UserLayout>
  );
}
