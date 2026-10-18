import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Shared shell for the public info pages (/aboutus, /enquiries, /contact-us,
// /privacy-policy): the same hero header as the public list pages, plus the
// cards, buttons, chips and form fields from the home sections.

export const infoCss = `
.ip { --acc: #00f5ff; --acc2: #7b2fff; position: relative; overflow: hidden; color: var(--dqd-text, #e6e3f5);
  font-family: 'Rajdhani', 'Inter', sans-serif; padding-bottom: var(--dqd-dock-space, 96px); }
.ip *, .ip *::before, .ip *::after { box-sizing: border-box; }
.ip-hero { position: relative; isolation: isolate; max-width: 1240px; margin: 0 auto; padding: 96px clamp(16px, 4vw, 40px) 8px; }
.ip-hero::before { content: ""; position: absolute; z-index: -1; top: -160px; left: 50%; translate: -50% 0; width: min(900px, 120vw); height: 420px; border-radius: 50%;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--acc) 22%, transparent), transparent 65%); filter: blur(20px); pointer-events: none; }
.ip-back { display: flex; width: fit-content; align-items: center; gap: 6px; margin-bottom: 18px; color: #a9a3c8; text-decoration: none;
  font: 700 12px/1 'Share Tech Mono', monospace; letter-spacing: .16em; text-transform: uppercase; transition: color .2s; }
.ip-back:hover { color: var(--acc); }
.ip-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 12px; font: 700 12px/1 'Share Tech Mono', monospace;
  letter-spacing: .26em; text-transform: uppercase; color: var(--acc); }
.ip-eyebrow i { width: 26px; height: 2px; background: currentColor; box-shadow: 0 0 10px currentColor; }
.ip h1 { margin: 0; font: 900 clamp(32px, 6vw, 64px)/1.05 'Orbitron', sans-serif; text-transform: uppercase; letter-spacing: .02em; color: #fff; overflow-wrap: anywhere; }
.ip h1 em { font-style: normal; background: linear-gradient(90deg, var(--acc), var(--acc2)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.ip-sub { margin: 14px 0 0; max-width: 620px; color: #b7b1d6; font-size: 17px; line-height: 1.55; }
.ip-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.ip-chip { display: inline-flex; align-items: center; gap: 8px; min-height: 36px; padding: 0 14px; border-radius: 999px; font-weight: 700; font-size: 14px;
  color: #fff; background: color-mix(in srgb, var(--acc) 12%, transparent); border: 1px solid color-mix(in srgb, var(--acc) 40%, transparent); }
.ip-chip svg { color: var(--acc); flex: none; }
.ip-chip.alt { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.14); color: #c9c4e4; }
.ip-chip.alt svg { color: var(--acc2); }

/* body */
.ip-body { max-width: 1240px; margin: 0 auto; padding: 28px clamp(16px, 4vw, 40px) 40px; display: grid; gap: 18px; }
.ip-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); }
.ip-sec { margin-top: clamp(22px, 4vw, 40px); }
.ip-sec-head { margin-bottom: 18px; }
.ip-sec-head .ip-eyebrow { margin-bottom: 10px; }
.ip h2.ip-title { margin: 0; font: 900 clamp(22px, 3.6vw, 34px)/1.1 'Orbitron', sans-serif; text-transform: uppercase; letter-spacing: .02em; color: #fff; }
.ip h2.ip-title em { font-style: normal; background: linear-gradient(90deg, var(--acc), var(--acc2)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.ip-sec-head p { margin: 10px 0 0; max-width: 560px; color: #a9a3c8; font-size: 16px; line-height: 1.5; }

/* cards */
.ip-card { position: relative; isolation: isolate; min-width: 0; border-radius: 22px; padding: clamp(18px, 3vw, 26px);
  background: linear-gradient(165deg, #12112a, #0a0a18); border: 1px solid rgba(255,255,255,.08); box-shadow: 0 18px 40px rgba(0,0,0,.35);
  transition: border-color .3s, box-shadow .35s; }
.ip-card:hover { border-color: color-mix(in srgb, var(--acc) 30%, transparent); box-shadow: 0 22px 50px rgba(0,0,0,.45), 0 0 34px color-mix(in srgb, var(--acc) 12%, transparent); }
.ip-card.flush { padding: 0; overflow: hidden; }
.ip-card-label { display: flex; align-items: center; gap: 10px; margin: 0 0 16px; font: 900 15px/1.2 'Orbitron', sans-serif; letter-spacing: .06em;
  text-transform: uppercase; color: #fff; }
.ip-card-label svg { color: var(--acc); flex: none; }
.ip-p { margin: 0 0 12px; color: #c3bedd; font-size: 16.5px; line-height: 1.65; }
.ip-p:last-child { margin-bottom: 0; }
.ip-p.muted { color: #9b95bb; font-size: 15.5px; }
.ip-hr { height: 1px; margin: 16px 0; border: 0; background: rgba(255,255,255,.08); }

/* icon rows (address, phone, ...) */
.ip-rows { display: grid; gap: 14px; }
.ip-row { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
.ip-ico { width: 40px; height: 40px; flex: none; display: grid; place-items: center; border-radius: 12px; color: var(--acc);
  background: color-mix(in srgb, var(--acc) 12%, transparent); border: 1px solid color-mix(in srgb, var(--acc) 30%, transparent); }
.ip-row-body { min-width: 0; display: grid; gap: 3px; }
.ip-row-label { font: 700 11px/1.2 'Share Tech Mono', monospace; letter-spacing: .18em; text-transform: uppercase; color: #8f89b0; }
.ip-row-value { color: #fff; font-size: 16.5px; font-weight: 600; line-height: 1.45; overflow-wrap: anywhere; }
a.ip-row-value, .ip-link { color: #fff; text-decoration: none; transition: color .2s; }
a.ip-row-value:hover, .ip-link:hover { color: var(--acc); }

/* tags */
.ip-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.ip-tag { display: inline-flex; align-items: center; gap: 7px; min-height: 36px; padding: 0 14px; border-radius: 999px;
  font: 700 14px/1 'Rajdhani', sans-serif; letter-spacing: .06em; color: #d6d1ee; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.03); }
.ip-tag svg { color: var(--acc); flex: none; }

/* buttons */
.ip-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 0 20px;
  border: 0; border-radius: 14px; cursor: pointer; text-decoration: none; font: 800 12.5px/1 'Orbitron', sans-serif; letter-spacing: .1em; text-transform: uppercase;
  color: #05040a; background: linear-gradient(135deg, var(--acc), var(--acc2)); box-shadow: 0 8px 24px color-mix(in srgb, var(--acc) 30%, transparent);
  transition: transform .2s, box-shadow .25s, opacity .2s; }
.ip-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px color-mix(in srgb, var(--acc) 45%, transparent); }
.ip-btn:active { transform: scale(.97); }
.ip-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
.ip-btn.ghost { color: #fff; background: color-mix(in srgb, var(--acc) 10%, transparent); border: 1px solid color-mix(in srgb, var(--acc) 45%, transparent); box-shadow: none; }
.ip-btn.block { width: 100%; }

/* forms */
.ip-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ip-field { display: grid; gap: 8px; min-width: 0; }
.ip-field.full { grid-column: 1 / -1; }
.ip-field label { display: flex; align-items: center; gap: 7px; font: 700 11.5px/1.2 'Share Tech Mono', monospace; letter-spacing: .16em; text-transform: uppercase; color: #a9a3c8; }
.ip-field label svg { color: var(--acc); }
.ip-field label b { color: var(--dqd-pink, #ff2d78); }
.ip-input { width: 100%; min-height: 48px; padding: 12px 14px; border-radius: 12px; outline: none; color: #fff; font: 500 16px/1.4 'Inter', sans-serif;
  background: rgba(5,5,15,.85); border: 1px solid rgba(255,255,255,.12); color-scheme: dark; transition: border-color .2s, box-shadow .2s, background .2s; }
.ip-input::placeholder { color: #6f6990; }
.ip-input:hover { border-color: rgba(255,255,255,.22); }
.ip-input:focus { border-color: var(--acc); background: color-mix(in srgb, var(--acc) 4%, rgba(5,5,15,.85)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--acc) 18%, transparent); }
textarea.ip-input { min-height: 120px; resize: vertical; }
.ip-note { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px; font-size: 15px; line-height: 1.45; }
.ip-note svg { flex: none; }
.ip-note.ok { color: #b8ffad; background: rgba(57,255,20,.07); border: 1px solid rgba(57,255,20,.28); }
.ip-note.bad { color: #ffb3cf; background: rgba(255,45,120,.08); border: 1px solid rgba(255,45,120,.35); }

/* map */
.ip-map { display: block; width: 100%; height: clamp(260px, 45vw, 400px); border: 0; filter: grayscale(.25) brightness(.9); }
.ip-map-cap { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 16px; padding: 14px clamp(16px, 3vw, 22px);
  color: #a9a3c8; font-size: 15px; border-top: 1px solid rgba(255,255,255,.08); }
.ip-map-cap a { display: inline-flex; align-items: center; gap: 6px; color: var(--acc); text-decoration: none; font-weight: 700; }

@media (max-width: 640px) {
  .ip-hero { padding-top: 88px; }
  .ip-sub { font-size: 15.5px; }
  .ip-form { grid-template-columns: 1fr; }
  .ip-p { font-size: 15.5px; }
}
/* entrance: "backwards" fill leaves no transform behind afterwards */
@keyframes ip-rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
.ip-hero, .ip-rise { animation: ip-rise .55s cubic-bezier(.22,1,.36,1) backwards; }
@media (prefers-reduced-motion: reduce) { .ip-card, .ip-btn, .ip-input { transition: none; } .ip-hero, .ip-rise { animation: none; } }
`;

/** Hero header: back link, eyebrow, two-tone title, subtitle and chips. */
export function PageHero({ eyebrow, title, accent, sub, children }) {
  return (
    <header className="ip-hero">
      <Link to="/" className="ip-back"><ArrowLeft size={14} aria-hidden="true" /> Home</Link>
      <div className="ip-eyebrow"><i aria-hidden="true" />{eyebrow}</div>
      <h1>{title} {accent && <em>{accent}</em>}</h1>
      {sub && <p className="ip-sub">{sub}</p>}
      {children && <div className="ip-chips">{children}</div>}
    </header>
  );
}

/** Section heading inside a page body. */
export function SecHead({ eyebrow, title, accent, sub }) {
  return (
    <div className="ip-sec-head">
      {eyebrow && <div className="ip-eyebrow"><i aria-hidden="true" />{eyebrow}</div>}
      <h2 className="ip-title">{title} {accent && <em>{accent}</em>}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

/** Block that rises in on load, one after another by `index`. */
export function Rise({ as: Tag = "div", index = 0, className = "", style, children, ...rest }) {
  return (
    <Tag {...rest} className={`ip-rise ${className}`} style={{ animationDelay: `${0.08 + Math.min(index, 5) * 0.06}s`, ...style }}>
      {children}
    </Tag>
  );
}
