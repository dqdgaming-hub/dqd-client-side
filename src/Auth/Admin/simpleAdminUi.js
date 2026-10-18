// Shared, plain styles for the simplified admin pages (users, bookings).
export const saCss = `
.sa { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #e6ebf2; }
.sa-head { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.sa-title { margin: 0; font-size: 22px; font-weight: 800; color: #fff; }
.sa-sub { margin: 4px 0 0; color: #8f9ab0; font-size: 13px; }
.sa-toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
.sa-input, .sa-select {
  background: #0c0e17; color: #fff; border: 1px solid #2a3046; border-radius: 8px;
  padding: 9px 12px; font-size: 14px; outline: none; min-width: 0;
}
.sa-input:focus, .sa-select:focus { border-color: #00e5cc; }
.sa-input.grow { flex: 1 1 220px; }
.sa-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.sa-tab {
  border: 1px solid #2a3046; background: #0c0e17; color: #aab4c6; border-radius: 999px;
  padding: 7px 14px; font-size: 13px; font-weight: 600; cursor: pointer;
}
.sa-tab.on { background: #00e5cc; border-color: #00e5cc; color: #04201c; }
.sa-btn {
  border: 1px solid #2a3046; background: #161a28; color: #e6ebf2; border-radius: 8px;
  padding: 8px 12px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;
  text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
}
.sa-btn:hover { border-color: #3b4463; }
.sa-btn:disabled { opacity: .5; cursor: not-allowed; }
.sa-btn.primary { background: #00e5cc; border-color: #00e5cc; color: #04201c; }
.sa-btn.ok { background: rgba(57, 217, 138, .12); border-color: rgba(57, 217, 138, .45); color: #7ef0b6; }
.sa-btn.danger { background: rgba(255, 77, 109, .1); border-color: rgba(255, 77, 109, .45); color: #ff9fb1; }
.sa-btn.wa { background: rgba(37, 211, 102, .12); border-color: rgba(37, 211, 102, .5); color: #6cf09f; }
.sa-panel { background: #10121c; border: 1px solid #22263a; border-radius: 12px; overflow: hidden; }
.sa-table-wrap { overflow-x: auto; }
.sa-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.sa-table th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: #8f9ab0; background: #0c0e17; padding: 10px 12px; white-space: nowrap; }
.sa-table td { padding: 12px; border-top: 1px solid #1d2132; vertical-align: middle; }
.sa-table tr:hover td { background: #131624; }
.sa-muted { color: #8f9ab0; font-size: 12px; }
.sa-strong { font-weight: 700; color: #fff; }
.sa-actions { display: flex; flex-wrap: wrap; gap: 6px; }
.sa-badge { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
.sa-badge.pending { background: rgba(255, 196, 0, .14); color: #ffd34d; }
.sa-badge.confirmed, .sa-badge.approved, .sa-badge.active, .sa-badge.paid { background: rgba(57, 217, 138, .14); color: #7ef0b6; }
.sa-badge.completed, .sa-badge.attended { background: rgba(80, 160, 255, .14); color: #8cc2ff; }
.sa-badge.cancelled, .sa-badge.rejected, .sa-badge.suspended, .sa-badge.failed { background: rgba(255, 77, 109, .14); color: #ff9fb1; }
.sa-badge.locked, .sa-badge.refunded { background: rgba(170, 120, 255, .16); color: #c7a8ff; }
.sa-empty, .sa-loading { padding: 40px 16px; text-align: center; color: #8f9ab0; }
.sa-error { background: rgba(255, 77, 109, .1); border: 1px solid rgba(255, 77, 109, .4); color: #ffb3c1; border-radius: 8px; padding: 10px 12px; font-size: 13px; margin-bottom: 12px; }
.sa-pager { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 12px; border-top: 1px solid #1d2132; font-size: 13px; color: #8f9ab0; }
.sa-modal-back { position: fixed; inset: 0; background: rgba(0,0,0,.65); z-index: 9000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.sa-modal { width: 100%; max-width: 440px; max-height: calc(100vh - 32px); overflow: auto; background: #10121c; border: 1px solid #2a3046; border-radius: 14px; padding: 20px; box-sizing: border-box; }
.sa-modal h3 { margin: 0 0 14px; font-size: 18px; color: #fff; }
.sa-field { display: block; margin-bottom: 12px; }
.sa-field > span { display: block; font-size: 13px; font-weight: 600; color: #b9c1d0; margin-bottom: 6px; }
.sa-field em { font-style: normal; font-weight: 400; color: #7d869a; }
.sa-field .sa-input { width: 100%; box-sizing: border-box; }
.sa-field-err { color: #ff9fb1; font-size: 12px; margin-top: 4px; }
.sa-inline { display: flex; gap: 6px; }
.sa-inline .sa-input { flex: 1; }
.sa-modal-foot { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
@media (max-width: 640px) {
  .sa-hide-sm { display: none; }
  .sa-table td, .sa-table th { padding: 10px 8px; }
}
`;

export function fieldErrors(err) {
  // adminApi errors carry the response body on err.body
  const body = err?.body;
  if (!body || typeof body !== "object") return {};
  const out = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === "detail") continue;
    out[key] = Array.isArray(value) ? value.join(" ") : String(value);
  }
  return out;
}

export function errorText(err, fallback = "Something went wrong. Please try again.") {
  if (err?.body?.detail) return String(err.body.detail);
  if (err?.message && !/^Request failed/.test(err.message)) return err.message;
  return fallback;
}

export const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export function time12(t) {
  if (!t) return "";
  const [h, m] = String(t).split(":").map(Number);
  if (Number.isNaN(h)) return String(t);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")} ${suffix}`;
}

export function dateNice(d) {
  if (!d) return "";
  const parsed = new Date(`${d}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return String(d);
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function generatePassword() {
  // 10 chars, mixed case + digits + symbol, without look-alike characters.
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789", "@#$%&*!"];
  const pick = (chars) => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return chars[buf[0] % chars.length];
  };
  const all = sets.join("");
  const chars = sets.map(pick);
  while (chars.length < 10) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
