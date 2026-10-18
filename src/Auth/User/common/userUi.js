// Shared look + helpers for the user pages (games, combos, events, bookings
// flow, loyalty, profile). Same neon "arena" palette and fonts as the user
// dashboard, with light entrance / hover animations that switch off for
// people who prefer reduced motion.

export const userCss = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Share+Tech+Mono&family=Inter:wght@400;500;600;700&display=swap');

.u-page {
  --u-cyan: #00f5ff; --u-cyan-2: #00e5cc; --u-pink: #ff006e; --u-purple: #7b2fff; --u-yellow: #ffd60a;
  --u-card: #0d0d1a; --u-card-2: #11111f; --u-line: rgba(0,245,255,.14); --u-line-2: rgba(0,245,255,.32);
  --u-text: #e0e0ff; --u-muted: #8b8bab;
  width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 104px 0 140px; color: var(--u-text);
  font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-size: 15px;
}
.u-page *, .u-modal * { box-sizing: border-box; }

/* ── Entrance: page sections and grid cards rise in one after another.
   "backwards" fill: no transform is left behind afterwards, so fixed
   pop-ups and bars inside a page still position against the screen. ── */
@keyframes uRise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes uPop { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes uFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes uShine { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@keyframes uBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.u-page > * { animation: uRise .55s cubic-bezier(.22,1,.36,1) backwards; }
.u-page > *:nth-child(2) { animation-delay: .06s; } .u-page > *:nth-child(3) { animation-delay: .12s; }
.u-page > *:nth-child(4) { animation-delay: .18s; } .u-page > *:nth-child(5) { animation-delay: .24s; }
.u-page > *:nth-child(n+6) { animation-delay: .3s; }
.u-grid > * { animation: uPop .5s cubic-bezier(.22,1,.36,1) backwards; }
.u-grid > *:nth-child(1) { animation-delay: .05s; } .u-grid > *:nth-child(2) { animation-delay: .1s; }
.u-grid > *:nth-child(3) { animation-delay: .15s; } .u-grid > *:nth-child(4) { animation-delay: .2s; }
.u-grid > *:nth-child(5) { animation-delay: .25s; } .u-grid > *:nth-child(6) { animation-delay: .3s; }
.u-grid > *:nth-child(n+7) { animation-delay: .35s; }

/* ── Page heading ── */
.u-head { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; justify-content: space-between; margin-bottom: 22px; }
.u-head h1 { margin: 0; font-family: 'Orbitron', sans-serif; font-size: clamp(22px, 4vw, 30px); font-weight: 900; letter-spacing: 1.5px;
  text-transform: uppercase; color: #fff; position: relative; padding-bottom: 12px;
  background: linear-gradient(90deg, #fff 0%, var(--u-cyan) 60%, #9b6bff 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.u-head h1::after { content: ""; position: absolute; left: 0; bottom: 0; width: 64px; height: 3px; border-radius: 2px;
  background: linear-gradient(90deg, var(--u-cyan), var(--u-pink)); transform-origin: left; animation: uBar .7s .25s cubic-bezier(.22,1,.36,1) both; }
.u-head p { margin: 8px 0 0; color: var(--u-muted); font-size: 14px; }
.u-back { display: inline-flex; align-items: center; gap: 6px; color: var(--u-cyan); text-decoration: none; font-size: 13px; margin-bottom: 14px;
  background: none; border: 0; padding: 0; cursor: pointer; font-family: 'Share Tech Mono', monospace; letter-spacing: 1px; text-transform: uppercase;
  transition: gap .2s, opacity .2s; }
.u-back:hover { gap: 10px; opacity: .85; }
.u-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

/* ── Buttons ── */
.u-btn { position: relative; overflow: hidden; border: 1px solid rgba(0,245,255,.28); background: rgba(0,245,255,.05); color: var(--u-text);
  border-radius: 10px; padding: 10px 16px; font: inherit; font-size: 13px; font-weight: 700; letter-spacing: .6px; cursor: pointer; text-decoration: none;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 42px;
  transition: transform .18s ease, border-color .2s, background .2s, box-shadow .25s, color .2s; }
.u-btn:hover { border-color: var(--u-cyan); color: #fff; background: rgba(0,245,255,.1); box-shadow: 0 0 18px rgba(0,245,255,.18); }
.u-btn:active { transform: scale(.97); }
.u-btn:focus-visible, .u-chip:focus-visible, .u-back:focus-visible { outline: 2px solid var(--u-cyan); outline-offset: 2px; }
.u-btn.primary { background: linear-gradient(135deg, var(--u-cyan) 0%, var(--u-cyan-2) 55%, #39b8ff 100%); border-color: transparent; color: #031a1d;
  box-shadow: 0 6px 20px rgba(0,245,255,.22); }
.u-btn.primary::after { content: ""; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%);
  background-size: 200% 100%; background-position: 200% 0; pointer-events: none; }
.u-btn.primary:hover { color: #031a1d; box-shadow: 0 8px 28px rgba(0,245,255,.38); transform: translateY(-1px); }
.u-btn.primary:hover::after { animation: uShine .9s ease; }
.u-btn.danger { background: rgba(255,0,110,.08); border-color: rgba(255,0,110,.45); color: #ff8fb8; }
.u-btn.danger:hover { background: rgba(255,0,110,.16); box-shadow: 0 0 18px rgba(255,0,110,.2); color: #fff; }
.u-btn.sm { padding: 7px 12px; min-height: 36px; font-size: 12px; }
.u-btn.block { width: 100%; }
.u-btn:disabled, .u-btn:disabled:hover { opacity: .45; cursor: not-allowed; transform: none; box-shadow: none; }

/* ── Cards ── */
.u-card { position: relative; background: linear-gradient(160deg, var(--u-card-2), var(--u-card)); border: 1px solid var(--u-line);
  border-radius: 14px; padding: 18px; transition: border-color .25s, box-shadow .25s; }
.u-card::before { content: ""; position: absolute; top: -1px; left: 18px; width: 48px; height: 2px; border-radius: 2px;
  background: linear-gradient(90deg, var(--u-cyan), transparent); }
.u-card:hover { border-color: var(--u-line-2); box-shadow: 0 10px 30px rgba(0,0,0,.35); }
.u-card h2 { margin: 0 0 14px; font-family: 'Orbitron', sans-serif; font-size: 15px; letter-spacing: 1.2px; text-transform: uppercase; color: #fff; }
.u-card-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 14px; }
.u-card-head h2 { margin: 0; }
.u-link { color: var(--u-cyan); font-size: 13px; text-decoration: none; font-weight: 700; transition: opacity .2s; }
.u-link:hover { opacity: .8; }
.u-muted { color: var(--u-muted); font-size: 14px; line-height: 1.6; }
.u-small { font-size: 13px; color: var(--u-muted); line-height: 1.5; }
.u-stack { display: grid; gap: 18px; }
.u-two { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

/* ── Grid of items (games, combos, events) ── */
.u-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(250px, 100%), 1fr)); gap: 18px; }
.u-item { position: relative; background: linear-gradient(165deg, var(--u-card-2), var(--u-card)); border: 1px solid var(--u-line); border-radius: 16px;
  overflow: hidden; display: flex; flex-direction: column;
  transition: transform .3s cubic-bezier(.22,1,.36,1), border-color .3s, box-shadow .3s; }
.u-item:hover { transform: translateY(-5px); border-color: var(--u-line-2); box-shadow: 0 16px 40px rgba(0,0,0,.45), 0 0 28px rgba(0,245,255,.1); }
.u-item-img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; background: radial-gradient(circle at 50% 40%, #1a1636, #0a0a14);
  display: flex; align-items: center; justify-content: center; font-size: 38px; transition: transform .6s cubic-bezier(.22,1,.36,1), filter .4s; }
.u-item:hover .u-item-img { transform: scale(1.06); filter: saturate(1.15); }
.u-item-body { position: relative; z-index: 1; background: var(--u-card); padding: 16px; display: flex; flex-direction: column; gap: 7px; flex: 1; }
.u-item-body h3 { margin: 0; font-family: 'Orbitron', sans-serif; font-size: 15px; letter-spacing: .6px; color: #fff; }
.u-item-foot { display: flex; gap: 8px; margin-top: auto; padding-top: 10px; }
.u-item-foot > * { flex: 1; }
.u-price { color: var(--u-cyan); font-weight: 700; font-family: 'Share Tech Mono', monospace; letter-spacing: .5px; }

/* ── Tags & chips ── */
.u-tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .5px;
  background: rgba(255,255,255,.06); color: #c4c4dc; border: 1px solid rgba(255,255,255,.08); }
.u-tag.ok { background: rgba(57,255,20,.08); color: #8dff7a; border-color: rgba(57,255,20,.25); }
.u-tag.warn { background: rgba(255,214,10,.08); color: #ffe066; border-color: rgba(255,214,10,.28); }
.u-tag.bad { background: rgba(255,0,110,.08); color: #ff8fb8; border-color: rgba(255,0,110,.3); }
.u-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.u-chip { border: 1px solid rgba(0,245,255,.2); background: rgba(13,13,26,.8); color: #c4c4dc; border-radius: 999px; padding: 8px 15px;
  font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; min-height: 38px; transition: all .2s ease; }
.u-chip:hover:not(:disabled) { border-color: var(--u-cyan); color: #fff; transform: translateY(-1px); }
.u-chip.on, .u-chip.on:hover:not(:disabled) { background: linear-gradient(135deg, var(--u-cyan), var(--u-cyan-2)); border-color: transparent; color: #031a1d;
  box-shadow: 0 4px 16px rgba(0,245,255,.3); }
.u-chip:disabled { opacity: .3; cursor: not-allowed; text-decoration: line-through; }
.u-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
.u-slots .u-chip { border-radius: 10px; padding: 8px 6px; }

/* ── Forms ── */
.u-field { display: block; margin-bottom: 16px; }
.u-field > span { display: block; font-size: 11px; color: #a9a9c8; margin-bottom: 7px; font-weight: 600;
  font-family: 'Share Tech Mono', monospace; letter-spacing: 1.2px; text-transform: uppercase; }
.u-field em { font-style: normal; font-weight: 400; color: #6b6b8a; text-transform: none; letter-spacing: 0; }
.u-input { width: 100%; background: rgba(5,5,15,.85); color: #fff; border: 1px solid rgba(0,245,255,.18); border-radius: 10px;
  padding: 11px 13px; font: inherit; font-size: 15px; outline: none; min-height: 46px; color-scheme: dark;
  transition: border-color .2s, box-shadow .2s, background .2s; }
.u-input:hover { border-color: rgba(0,245,255,.32); }
.u-input:focus { border-color: var(--u-cyan); background: rgba(0,245,255,.04); box-shadow: 0 0 0 3px rgba(0,245,255,.14), 0 0 18px rgba(0,245,255,.12); }
.u-input.bad { border-color: var(--u-pink); box-shadow: 0 0 0 3px rgba(255,0,110,.12); }
textarea.u-input { min-height: 90px; resize: vertical; }
.u-err-text, .u-field > .u-err-text { display: block; color: #ff8fb8; font-size: 12.5px; font-weight: 400; margin: 6px 0 0;
  font-family: inherit; letter-spacing: 0; text-transform: none; animation: uFade .25s ease; }
.u-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }

/* ── Messages & states ── */
.u-error { background: rgba(255,0,110,.08); border: 1px solid rgba(255,0,110,.35); border-left-width: 3px; color: #ffb3cf; border-radius: 10px;
  padding: 12px 14px; margin-bottom: 16px; font-size: 14px; line-height: 1.45; display: flex; gap: 10px; align-items: center;
  justify-content: space-between; flex-wrap: wrap; animation: uRise .35s ease both; }
.u-ok { background: rgba(57,255,20,.07); border: 1px solid rgba(57,255,20,.3); border-left-width: 3px; color: #b8ffad; border-radius: 10px;
  padding: 12px 14px; margin-bottom: 16px; font-size: 14px; line-height: 1.45; animation: uRise .35s ease both; }
.u-empty { text-align: center; padding: 48px 18px; color: var(--u-muted); border: 1px dashed rgba(0,245,255,.22); border-radius: 16px;
  background: linear-gradient(110deg, rgba(13,13,26,.9) 30%, rgba(0,245,255,.05) 50%, rgba(13,13,26,.9) 70%); background-size: 200% 100%;
  animation: uRise .5s ease both, uShine 2.4s linear infinite; font-family: 'Share Tech Mono', monospace; letter-spacing: .5px; }

/* ── Stats, lists, summaries ── */
.u-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.u-stat { background: linear-gradient(160deg, var(--u-card-2), var(--u-card)); border: 1px solid var(--u-line); border-radius: 14px; padding: 16px;
  transition: transform .25s, border-color .25s; }
.u-stat:hover { transform: translateY(-3px); border-color: var(--u-line-2); }
.u-stat b { display: block; font-family: 'Orbitron', sans-serif; font-size: 24px; color: var(--u-cyan); }
.u-stat span { font-size: 12px; color: var(--u-muted); letter-spacing: .4px; }
.u-list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.u-list li { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; border-bottom: 1px solid rgba(0,245,255,.08); padding-bottom: 10px; }
.u-list li:last-child { border-bottom: 0; padding-bottom: 0; }
.u-summary { display: grid; gap: 9px; font-size: 14px; }
.u-summary div { display: flex; justify-content: space-between; gap: 12px; }
.u-summary dt { color: var(--u-muted); }
.u-summary dd { margin: 0; color: #fff; font-weight: 600; text-align: right; }
.u-summary .total { border-top: 1px dashed rgba(0,245,255,.2); padding-top: 10px; margin-top: 2px; }
.u-summary .total dd { color: var(--u-cyan); font-size: 20px; font-family: 'Orbitron', sans-serif; }
.u-member { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: start; margin-bottom: 8px; animation: uRise .3s ease both; }

/* ── Modal ── */
.u-modal-back { position: fixed; inset: 0; background: rgba(3,3,10,.78); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  z-index: 9000; display: flex; align-items: center; justify-content: center; padding: 16px; animation: uFade .2s ease both; }
.u-modal { width: 100%; max-width: 540px; max-height: calc(100vh - 32px); overflow-y: auto; background: linear-gradient(160deg, #13132a, #0b0b18);
  border: 1px solid rgba(0,245,255,.25); border-radius: 18px; padding: 22px; color: #e0e0ff;
  box-shadow: 0 30px 80px rgba(0,0,0,.6), 0 0 40px rgba(0,245,255,.08);
  font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-size: 15px; animation: uPop .3s cubic-bezier(.22,1,.36,1) both; }
.u-modal h3 { margin: 0 0 8px; color: #fff; font-family: 'Orbitron', sans-serif; font-size: 18px; letter-spacing: 1px; }
.u-modal-foot { display: flex; gap: 8px; justify-content: flex-end; margin-top: 18px; flex-wrap: wrap; }

/* ── Responsive ── */
@media (max-width: 860px) {
  .u-two { grid-template-columns: 1fr; }
  .u-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .u-page { padding-top: 88px; width: calc(100% - 28px); }
  .u-head > .u-btn { width: 100%; }
  .u-form-grid { grid-template-columns: 1fr; }
  .u-member { grid-template-columns: 1fr auto; }
  .u-member > :nth-child(2) { grid-column: 1; grid-row: 2; }
  .u-modal { padding: 18px; border-radius: 16px; }
  .u-modal-foot > * { flex: 1; }
  .u-card { padding: 16px; }
  .u-grid { gap: 14px; }
}
@media (hover: none) {
  .u-item:hover, .u-stat:hover { transform: none; }
  .u-item:hover .u-item-img { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .u-page *, .u-page *::before, .u-page *::after, .u-modal-back, .u-modal {
    animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;

/** "2026-10-18" for the user's local day (toISOString would give the UTC day). */
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function niceDate(d) {
  if (!d) return "";
  const parsed = new Date(`${String(d).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? d
    : parsed.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function niceTime(t) {
  if (!t) return "";
  const [h, m] = String(t).split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function money(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

/** API list responses come back as [...] or { results: [...] }. */
export function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

const FIELD_NAMES = {
  booking_date: "Date", start_time: "Start time", end_time: "End time", members: "Players",
  points_to_redeem: "Points", item: "Game", phone: "Mobile number", email: "Email", dob: "Date of birth",
  current_password: "Current password", new_password: "New password", confirm_password: "Confirm password",
  first_name: "First name", last_name: "Last name", profile_image: "Photo", combo_pack: "Combo pack",
};

// Pull the first readable message out of a DRF error body
// ("detail", "message", non_field_errors, {field: [msg]}, nested member lists).
function firstMessage(body, field) {
  if (!body) return "";
  if (typeof body === "string") {
    if (body.trim().startsWith("<")) return ""; // HTML error page
    return field && FIELD_NAMES[field] ? `${FIELD_NAMES[field]}: ${body}` : body;
  }
  if (Array.isArray(body)) {
    for (const v of body) {
      const m = firstMessage(v, field);
      if (m) return m;
    }
    return "";
  }
  if (typeof body === "object") {
    for (const key of ["detail", "message", "non_field_errors"]) {
      const m = firstMessage(body[key]);
      if (m) return m;
    }
    for (const [key, v] of Object.entries(body)) {
      if (key === "success") continue;
      const m = firstMessage(v, FIELD_NAMES[key] ? key : field);
      if (m) return m;
    }
  }
  return "";
}

/** Human message for a failed request (axios errors and adminApi fetch errors). */
export function apiError(err, fallback = "Something went wrong. Please try again.") {
  if (!err) return "";
  const body = err.response ? err.response.data : err.body;
  const status = err.response?.status ?? err.status;
  if (!status) return "Can't reach the server. Check your connection and try again.";
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 429) return "Too many tries. Please wait a minute and try again.";
  return firstMessage(body) || (status >= 500 ? "The server had a problem. Please try again shortly." : fallback);
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
export const isPhone = (v) => /^\+?\d{8,15}$/.test(String(v).replace(/[\s()-]/g, ""));

/** Validate extra-player rows: name required, phone optional but must look real. */
export function memberErrors(members) {
  return members.map((m) => {
    const e = {};
    if (!m.name.trim()) e.name = "Enter a name";
    else if (m.name.trim().length > 100) e.name = "Name is too long";
    if (m.phone.trim() && !isPhone(m.phone)) e.phone = "Enter a valid mobile number";
    return e;
  });
}

export const hasErrors = (list) => list.some((e) => Object.keys(e).length > 0);

export const cleanMembers = (members) =>
  members.map((m) => ({ name: m.name.trim(), phone: m.phone.replace(/[\s()-]/g, "") }));

/** Hours between two "HH:MM[:SS]" strings. */
export function hoursBetween(start, end) {
  const toMin = (t) => {
    const [h, m] = String(t).split(":").map(Number);
    return h * 60 + (m || 0);
  };
  return (toMin(end) - toMin(start)) / 60;
}

/** How many back-to-back free hours start at `start` (0 if none). */
export function freeHoursFrom(slots, start) {
  const i = slots.findIndex((s) => s.start_time === start);
  if (i < 0) return 0;
  let n = 0;
  while (i + n < slots.length && slots[i + n].available) n += 1;
  return n;
}
