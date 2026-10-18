// Shared CSS and helpers for the public home page sections.
import { API_ORIGIN } from "../../api/config";

export const homeCss = `
.hm-sec { --cyan: #00f5ff; --pink: #ff2d78; --gold: #ffd60a; --purple: #7b2fff; --lilac: #c084fc;
  position: relative; overflow: hidden; padding: clamp(56px, 8vw, 104px) 0; color: #fff; font-family: 'Rajdhani', 'Inter', sans-serif; }
.hm-sec * { box-sizing: border-box; }
.hm-in { position: relative; z-index: 1; max-width: 1240px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 40px); }
.hm-glow { position: absolute; z-index: 0; width: 520px; height: 520px; border-radius: 50%; filter: blur(90px); opacity: .5; pointer-events: none; }

/* header */
.hm-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: clamp(22px, 3vw, 36px); flex-wrap: wrap; }
.hm-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 10px; font: 700 12px/1 'Share Tech Mono', monospace;
  letter-spacing: .28em; text-transform: uppercase; color: var(--acc, var(--cyan)); }
.hm-eyebrow i { width: 26px; height: 2px; border-radius: 2px; background: currentColor; box-shadow: 0 0 10px currentColor; }
.hm-title { margin: 0; font-family: 'Orbitron', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: .02em;
  font-size: clamp(28px, 5vw, 52px); line-height: 1; color: #fff; }
.hm-title em { font-style: normal; background: linear-gradient(90deg, var(--acc, var(--cyan)), var(--acc2, var(--purple))); background-size: 200% 100%;
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: hm-flow 6s linear infinite; }
@keyframes hm-flow { to { background-position: -200% 0; } }
@keyframes hm-float { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-10px) rotate(4deg); } }
.hm-sub { margin: 10px 0 0; max-width: 520px; color: #a9a3c8; font-size: 16px; line-height: 1.5; }
.hm-all { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 18px; border-radius: 14px; text-decoration: none;
  color: #fff; font: 700 14px/1 'Rajdhani', sans-serif; letter-spacing: .1em; text-transform: uppercase; white-space: nowrap;
  border: 1px solid color-mix(in srgb, var(--acc, #00f5ff) 45%, transparent); background: color-mix(in srgb, var(--acc, #00f5ff) 10%, transparent);
  transition: transform .2s, background .2s, box-shadow .25s; }
.hm-all:hover { transform: translateY(-2px); background: color-mix(in srgb, var(--acc, #00f5ff) 18%, transparent);
  box-shadow: 0 8px 26px color-mix(in srgb, var(--acc, #00f5ff) 30%, transparent); }
.hm-all svg { transition: transform .2s; } .hm-all:hover svg { transform: translateX(3px); }

/* card row: swipe on phones, grid on larger screens */
.hm-row { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(270px, 82%); gap: 14px; overflow-x: auto;
  scroll-snap-type: x mandatory; scroll-padding: 0 clamp(16px, 4vw, 40px); padding: 6px clamp(16px, 4vw, 40px) 18px;
  margin: 0 calc(-1 * clamp(16px, 4vw, 40px)); scrollbar-width: none; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; }
.hm-row::-webkit-scrollbar { display: none; }
.hm-row > * { scroll-snap-align: start; }
@media (min-width: 700px) { .hm-row { grid-auto-columns: minmax(280px, 46%); } }
@media (min-width: 1024px) {
  .hm-row { grid-auto-flow: row; grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr)); overflow: visible; margin: 0; padding: 6px 0 0; gap: 20px; }
}
/* full-page lists (/games, /events, /combo-packs): vertical grid on every screen */
.hm-row.stacked { grid-auto-flow: row; grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); overflow: visible;
  margin: 0; padding: 6px 0 0; gap: 18px; scroll-snap-type: none; }
.hm-swipe { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px; color: #6f6990;
  font: 700 11px/1 'Share Tech Mono', monospace; letter-spacing: .2em; text-transform: uppercase; }
.hm-swipe span { display: inline-block; animation: hm-nudge 1.6s ease-in-out infinite; }
@keyframes hm-nudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(6px); } }
@media (min-width: 1024px) { .hm-swipe { display: none; } }

/* generic card */
.hm-card { --acc: var(--cyan); position: relative; isolation: isolate; display: flex; flex-direction: column; overflow: hidden; border-radius: 22px;
  background: linear-gradient(165deg, #12112a, #0a0a18); border: 1px solid rgba(255,255,255,.08);
  box-shadow: 0 18px 40px rgba(0,0,0,.35); transition: transform .35s cubic-bezier(.22,1,.36,1), border-color .3s, box-shadow .35s; }
.hm-card::before { content: ""; position: absolute; inset: 0; z-index: 2; border-radius: inherit; padding: 1px; pointer-events: none; opacity: 0;
  background: linear-gradient(140deg, var(--acc), transparent 40%, transparent 60%, var(--acc2, var(--purple)));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; transition: opacity .3s; }
.hm-card:hover { transform: translateY(-6px); box-shadow: 0 26px 60px rgba(0,0,0,.5), 0 0 40px color-mix(in srgb, var(--acc) 22%, transparent); }
.hm-card:hover::before { opacity: 1; }
.hm-media { position: relative; overflow: hidden; aspect-ratio: 16 / 10; background: radial-gradient(circle at 50% 40%, #1d1840, #0a0a18); }
.hm-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .7s cubic-bezier(.22,1,.36,1), filter .4s; }
.hm-card:hover .hm-media img { transform: scale(1.07); filter: saturate(1.15); }
.hm-media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, #0a0a18 2%, rgba(10,10,24,.35) 40%, transparent 70%); }
.hm-ph { position: relative; width: 100%; height: 100%; display: grid; place-items: center; font-size: clamp(54px, 9vw, 84px); overflow: hidden;
  background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--acc, #00f5ff) 35%, transparent), transparent 55%),
    radial-gradient(circle at 75% 70%, rgba(123,47,255,.35), transparent 55%), #0d0b1f; }
.hm-ph::before { content: ""; position: absolute; inset: 0; opacity: .35;
  background-image: linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
  background-size: 26px 26px; }
.hm-ph { animation: hm-hue 8s ease-in-out infinite alternate; }
@keyframes hm-hue { to { filter: hue-rotate(40deg); } }
.hm-ph > * { animation: hm-float 4s ease-in-out infinite; }
.hm-badge { position: absolute; z-index: 1; top: 12px; left: 12px; display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 999px;
  font: 800 10.5px/1 'Orbitron', sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #fff;
  background: color-mix(in srgb, var(--acc) 80%, #000); box-shadow: 0 6px 18px color-mix(in srgb, var(--acc) 40%, transparent); }
.hm-badge.right { left: auto; right: 12px; background: rgba(5,5,15,.7); color: var(--gold); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: none;
  border: 1px solid rgba(255,214,10,.35); }
.hm-body { display: flex; flex-direction: column; gap: 10px; flex: 1; padding: 16px 18px 18px; }
.hm-name { margin: 0; font: 900 18px/1.2 'Orbitron', sans-serif; letter-spacing: .03em; color: #fff; }
.hm-meta { display: flex; flex-wrap: wrap; gap: 6px 14px; color: #b7b1d6; font-size: 15px; }
.hm-meta span { display: inline-flex; align-items: center; gap: 6px; }
.hm-meta svg { color: var(--acc); flex: none; }
.hm-text { margin: 0; color: #9b95bb; font-size: 15px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.hm-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 4px; }
.hm-price { font: 900 22px/1 'Orbitron', sans-serif; color: var(--acc); text-shadow: 0 0 18px color-mix(in srgb, var(--acc) 45%, transparent); }
.hm-price small { margin-left: 4px; font: 700 12px/1 'Rajdhani', sans-serif; color: #8f89b0; letter-spacing: .08em; text-shadow: none; }
.hm-btn { position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 46px; padding: 0 18px;
  border: 0; border-radius: 14px; cursor: pointer; text-decoration: none; font: 800 12.5px/1 'Orbitron', sans-serif; letter-spacing: .1em; text-transform: uppercase;
  color: #05040a; background: linear-gradient(135deg, var(--acc), color-mix(in srgb, var(--acc) 60%, #fff)); box-shadow: 0 8px 24px color-mix(in srgb, var(--acc) 35%, transparent);
  transition: transform .2s, box-shadow .25s; }
.hm-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px color-mix(in srgb, var(--acc) 50%, transparent); }
.hm-btn:active { transform: scale(.97); }
.hm-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }

.hm-chips { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; margin: 0 calc(-1 * clamp(16px, 4vw, 40px)) 18px;
  padding: 2px clamp(16px, 4vw, 40px); }
.hm-chips::-webkit-scrollbar { display: none; }
.hm-chip { flex: none; display: inline-flex; align-items: center; gap: 8px; min-height: 42px; padding: 0 16px; border-radius: 999px; cursor: pointer;
  font: 700 14px/1 'Rajdhani', sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #b9b3d6;
  border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.03); transition: all .2s; }
.hm-chip b { min-width: 20px; padding: 3px 6px; border-radius: 999px; font-size: 11px; background: rgba(255,255,255,.08); }
.hm-chip:hover { color: #fff; border-color: rgba(0,245,255,.5); }
.hm-chip.on { color: #031a1d; background: linear-gradient(135deg, var(--cyan), #00b3ff); border-color: transparent; box-shadow: 0 6px 20px rgba(0,245,255,.35); }
.hm-chip.on b { background: rgba(0,0,0,.15); }

.hm-card { container-type: inline-size; }
.hm-price, .hm-btn { white-space: nowrap; }
@container (max-width: 340px) {
  .hm-foot { flex-direction: column; align-items: stretch; gap: 12px; }
  .hm-foot .hm-btn { width: 100%; min-height: 50px; }
}
@media (prefers-reduced-motion: reduce) {
  .hm-title em, .hm-swipe span, .hm-ph, .hm-ph > * { animation: none; }
  .hm-card, .hm-media img { transition: none; }
}
`;

export function resolveImage(url) {
  if (!url) return "";
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url)) return url;
  return new URL(url, `${API_ORIGIN}/`).href;
}

export const money = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—";
};
