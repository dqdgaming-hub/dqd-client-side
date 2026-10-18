// Sign in / create account page. Neon "arena" look shared with the user
// dashboard: a showcase panel on the left (stacks on top on phones) and a
// glass form card on the right.
export const authCss = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Share+Tech+Mono&family=Inter:wght@400;500;600;700&display=swap');

.au-page {
  --cyan: #00f5ff; --cyan-2: #00e5cc; --pink: #ff006e; --purple: #7b2fff; --yellow: #ffd60a;
  --text: #e0e0ff; --muted: #8b8bab; --line: rgba(0,245,255,.16);
  position: relative; min-height: 100vh; min-height: 100dvh; box-sizing: border-box; overflow: hidden;
  display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); align-items: stretch;
  background: #05050f; color: var(--text); font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
.au-page *, .au-page *::before, .au-page *::after { box-sizing: border-box; }

/* ── Ambient background ── */
.au-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 50% 45% at 12% 18%, rgba(0,245,255,.16), transparent 60%),
    radial-gradient(ellipse 45% 40% at 88% 85%, rgba(255,0,110,.12), transparent 60%),
    radial-gradient(ellipse 40% 35% at 55% 50%, rgba(123,47,255,.10), transparent 60%); }
.au-grid { position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: .5;
  background-image: linear-gradient(rgba(0,245,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,.06) 1px, transparent 1px);
  background-size: 44px 44px; mask-image: radial-gradient(ellipse at 30% 40%, #000 20%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at 30% 40%, #000 20%, transparent 75%); animation: auGrid 18s linear infinite; }
@keyframes auGrid { to { background-position: 44px 44px, 44px 44px; } }
.au-trace { position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 3;
  background: linear-gradient(90deg, transparent, var(--cyan), var(--pink), var(--purple), transparent); animation: auPulse 4s ease-in-out infinite; }
@keyframes auPulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }

/* ── Showcase ── */
.au-show { position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: center; gap: 28px;
  padding: 48px clamp(28px, 5vw, 72px); }
.au-brand { display: inline-flex; align-items: center; gap: 12px; color: #fff; text-decoration: none; width: fit-content; }
.au-brand img { width: 44px; height: 44px; border-radius: 12px; object-fit: contain; box-shadow: 0 0 0 1px rgba(0,245,255,.35), 0 0 22px rgba(0,245,255,.25); }
.au-brand b { display: block; font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 18px; letter-spacing: 2px; }
.au-brand small { display: block; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; color: var(--cyan); text-transform: uppercase; }
.au-hero-title { margin: 0; font-family: 'Orbitron', sans-serif; font-weight: 900; line-height: 1.08; letter-spacing: 1px;
  font-size: clamp(30px, 4.2vw, 52px); text-transform: uppercase; color: #fff; }
.au-hero-title span { display: block; background: linear-gradient(90deg, var(--cyan), #9b6bff 55%, var(--pink)); background-size: 200% 100%;
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: auHue 6s linear infinite; }
@keyframes auHue { to { background-position: -200% 0; } }
.au-hero-sub { margin: 14px 0 0; max-width: 460px; color: var(--muted); font-size: 15px; line-height: 1.65; }
.au-stage { position: relative; width: min(100%, 460px); aspect-ratio: 1.35; display: grid; place-items: center; }
.au-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(0,245,255,.22); }
.au-ring.r1 { inset: 6% 12%; animation: auSpin 22s linear infinite; border-style: dashed; }
.au-ring.r2 { inset: 16% 22%; border-color: rgba(255,0,110,.25); animation: auSpin 30s linear infinite reverse; }
.au-ring::after { content: ""; position: absolute; top: -4px; left: 50%; width: 8px; height: 8px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 12px var(--cyan); }
.au-ring.r2::after { background: var(--pink); box-shadow: 0 0 12px var(--pink); }
@keyframes auSpin { to { transform: rotate(360deg); } }
.au-stage img { position: relative; width: 78%; height: auto; filter: drop-shadow(0 24px 40px rgba(0,0,0,.6)) drop-shadow(0 0 30px rgba(0,120,255,.35));
  animation: auFloat 6s ease-in-out infinite; }
@keyframes auFloat { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-14px) rotate(2deg); } }
.au-glow { position: absolute; bottom: 6%; width: 55%; height: 14%; border-radius: 50%; background: radial-gradient(ellipse, rgba(0,245,255,.35), transparent 70%);
  filter: blur(8px); animation: auShadow 6s ease-in-out infinite; }
@keyframes auShadow { 0%,100% { transform: scaleX(1); opacity: .8; } 50% { transform: scaleX(.8); opacity: .5; } }
.au-perks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; max-width: 520px; margin: 0; padding: 0; list-style: none; }
.au-perks li { display: flex; gap: 10px; align-items: center; padding: 12px 14px; border-radius: 14px; font-size: 13px; color: #c9c9e4;
  background: rgba(13,13,26,.7); border: 1px solid var(--line); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  animation: auUp .6s cubic-bezier(.22,1,.36,1) both; transition: transform .25s, border-color .25s; }
.au-perks li:hover { transform: translateY(-3px); border-color: rgba(0,245,255,.4); }
.au-perks li:nth-child(1) { animation-delay: .35s; } .au-perks li:nth-child(2) { animation-delay: .45s; }
.au-perks li:nth-child(3) { animation-delay: .55s; } .au-perks li:nth-child(4) { animation-delay: .65s; }
.au-perks svg { flex: none; color: var(--cyan); }
.au-perks li:nth-child(2) svg { color: var(--yellow); } .au-perks li:nth-child(3) svg { color: var(--pink); } .au-perks li:nth-child(4) svg { color: #9b6bff; }

/* ── Form side ── */
.au-side { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
.au-card { position: relative; width: 100%; max-width: 440px; padding: 30px 28px 26px; border-radius: 22px;
  background: linear-gradient(160deg, rgba(20,20,40,.88), rgba(10,10,22,.92)); border: 1px solid rgba(0,245,255,.2);
  box-shadow: 0 30px 80px rgba(0,0,0,.55), 0 0 60px rgba(0,245,255,.06); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  animation: auCard .7s cubic-bezier(.22,1,.36,1) both; }
.au-card::before { content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; pointer-events: none;
  background: linear-gradient(140deg, rgba(0,245,255,.7), transparent 35%, transparent 65%, rgba(255,0,110,.6));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
@keyframes auCard { from { opacity: 0; transform: translateY(24px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes auUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.au-head h1 { margin: 0; font-family: 'Orbitron', sans-serif; font-size: 22px; letter-spacing: 1.5px; text-transform: uppercase; color: #fff; }
.au-head p { margin: 6px 0 20px; color: var(--muted); font-size: 14px; }

.au-tabs { position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 4px; margin-bottom: 20px;
  background: rgba(5,5,15,.8); border: 1px solid var(--line); border-radius: 14px; }
.au-tabs::before { content: ""; position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); border-radius: 10px;
  background: linear-gradient(135deg, var(--cyan), var(--cyan-2)); box-shadow: 0 4px 18px rgba(0,245,255,.35);
  transition: transform .4s cubic-bezier(.22,1,.36,1); }
.au-tabs.up::before { transform: translateX(100%); }
.au-tabs button { position: relative; z-index: 1; border: 0; background: transparent; color: #a9a9c8; padding: 11px 8px; border-radius: 10px;
  font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; transition: color .3s; }
.au-tabs button.on { color: #031a1d; }
.au-tabs button:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }

.au-alert { display: flex; gap: 10px; align-items: flex-start; background: rgba(255,0,110,.08); border: 1px solid rgba(255,0,110,.35);
  border-left-width: 3px; color: #ffb3cf; border-radius: 12px; padding: 11px 13px; font-size: 13.5px; margin-bottom: 16px; line-height: 1.45;
  animation: auShake .45s ease; }
.au-alert svg { flex: none; margin-top: 1px; }
@keyframes auShake { 0%,100% { transform: none; } 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
.au-alert-sub { margin-top: 4px; color: #e9c0c8; }
.au-alert a { color: #fff; }

.au-form { animation: auUp .45s cubic-bezier(.22,1,.36,1) both; }
.au-field { display: block; margin-bottom: 15px; }
.au-label { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 1.3px;
  text-transform: uppercase; color: #a9a9c8; margin-bottom: 7px; }
.au-label em { font-style: normal; color: #6b6b8a; letter-spacing: .5px; text-transform: none; font-family: 'Inter', sans-serif; }
.au-input { position: relative; display: flex; align-items: center; }
.au-input > svg { position: absolute; left: 14px; color: #6b6b8a; pointer-events: none; transition: color .2s; }
.au-input input { width: 100%; min-height: 50px; padding: 13px 14px 13px 44px; border-radius: 12px; outline: none;
  background: rgba(5,5,15,.85); color: #fff; font: inherit; font-size: 15px; border: 1px solid rgba(0,245,255,.18);
  transition: border-color .2s, box-shadow .2s, background .2s; }
.au-input input::placeholder { color: #565672; }
.au-input input:hover { border-color: rgba(0,245,255,.32); }
.au-input input:focus { border-color: var(--cyan); background: rgba(0,245,255,.04); box-shadow: 0 0 0 3px rgba(0,245,255,.14), 0 0 22px rgba(0,245,255,.12); }
.au-input:focus-within > svg { color: var(--cyan); }
.au-input.has-btn input { padding-right: 52px; }
.au-input.bad input { border-color: var(--pink); box-shadow: 0 0 0 3px rgba(255,0,110,.12); }
.au-input.bad > svg { color: var(--pink); }
.au-input.ok > svg { color: #39ff14; }
.au-eye { position: absolute; right: 6px; width: 40px; height: 40px; display: grid; place-items: center; border: 0; border-radius: 10px;
  background: transparent; color: #8b8bab; cursor: pointer; transition: color .2s, background .2s; }
.au-eye:hover { color: var(--cyan); background: rgba(0,245,255,.08); }
.au-eye:focus-visible { outline: 2px solid var(--cyan); }
.au-err { display: block; margin-top: 6px; color: #ff8fb8; font-size: 12.5px; animation: auUp .25s ease both; }
.au-hint { display: block; margin-top: 6px; color: #ffe066; font-size: 12.5px; }

.au-meter { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-top: 9px; }
.au-meter i { height: 4px; border-radius: 4px; background: rgba(255,255,255,.08); transition: background .3s, box-shadow .3s; }
.au-meter-text { display: flex; flex-wrap: wrap; gap: 2px 10px; justify-content: space-between; margin-top: 6px; font-size: 12px; color: var(--muted); }

.au-row-end { display: flex; justify-content: flex-end; margin: -4px 0 18px; }
.au-row-end a, .au-linkbtn { color: var(--cyan); font-size: 13px; font-weight: 600; text-decoration: none; }
.au-row-end a:hover { text-decoration: underline; }
.au-linkbtn { background: none; border: 0; padding: 0; cursor: pointer; font: inherit; font-size: 13px; text-decoration: underline; text-underline-offset: 3px; }
.au-check { display: flex; gap: 11px; align-items: flex-start; font-size: 13.5px; color: #c4c4dc; margin: 6px 0 18px; cursor: pointer; line-height: 1.45; }
.au-check input { position: absolute; opacity: 0; pointer-events: none; }
.au-box { flex: none; width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid rgba(0,245,255,.45); display: grid; place-items: center;
  color: #031a1d; background: transparent; transition: background .2s, border-color .2s, transform .15s; }
.au-box svg { opacity: 0; transform: scale(.4); transition: opacity .2s, transform .25s cubic-bezier(.22,1.4,.36,1); }
.au-check input:checked + .au-box { background: linear-gradient(135deg, var(--cyan), var(--cyan-2)); border-color: transparent; }
.au-check input:checked + .au-box svg { opacity: 1; transform: none; }
.au-check input:focus-visible + .au-box { outline: 2px solid var(--cyan); outline-offset: 2px; }
.au-check.bad .au-box { border-color: var(--pink); }

.au-submit { position: relative; overflow: hidden; width: 100%; min-height: 52px; border: 0; border-radius: 14px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  font-family: 'Orbitron', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; color: #031a1d;
  background: linear-gradient(135deg, var(--cyan) 0%, var(--cyan-2) 50%, #39b8ff 100%); box-shadow: 0 10px 30px rgba(0,245,255,.3);
  transition: transform .2s, box-shadow .25s, opacity .2s; }
.au-submit::after { content: ""; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.5) 50%, transparent 70%);
  background-size: 200% 100%; background-position: 200% 0; pointer-events: none; }
.au-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(0,245,255,.45); }
.au-submit:hover:not(:disabled)::after { animation: auShine .9s ease; }
@keyframes auShine { to { background-position: -200% 0; } }
.au-submit:active:not(:disabled) { transform: scale(.98); }
.au-submit:disabled { opacity: .6; cursor: not-allowed; }
.au-submit svg.spin { animation: auSpin .8s linear infinite; }
.au-submit .arrow { transition: transform .25s; }
.au-submit:hover:not(:disabled) .arrow { transform: translateX(4px); }

.au-or { display: flex; align-items: center; gap: 12px; margin: 20px 0 16px; color: #6b6b8a; font-size: 11px;
  font-family: 'Share Tech Mono', monospace; letter-spacing: 2px; text-transform: uppercase; }
.au-or::before, .au-or::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(0,245,255,.25), transparent); }
.au-google { display: flex; justify-content: center; min-height: 44px; max-width: 100%; overflow: hidden; }
.au-switch { margin: 18px 0 0; text-align: center; font-size: 13.5px; color: var(--muted); }
.au-switch button { background: none; border: 0; padding: 0; color: var(--cyan); font: inherit; font-weight: 700; cursor: pointer; }
.au-switch button:hover { text-decoration: underline; }
.au-safe { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 14px; font-size: 12px; color: #6b6b8a; }
.au-safe svg { color: #39ff14; }
.au-back { position: absolute; top: 18px; right: 22px; z-index: 2; color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 600;
  transition: color .2s; }
.au-back:hover { color: var(--cyan); }

/* ── Responsive ── */
@media (max-width: 960px) {
  .au-page { grid-template-columns: minmax(0, 1fr); }
  .au-show { padding: 28px 22px 0; gap: 16px; align-items: center; text-align: center; }
  .au-hero-sub { margin-left: auto; margin-right: auto; }
  .au-stage { width: min(70vw, 300px); }
  .au-perks { display: none; }
  .au-side { padding: 8px 16px 40px; align-items: flex-start; }
  .au-back { position: relative; top: auto; right: auto; justify-self: start; margin: 16px 0 0 18px; }
  .au-show { padding-top: 10px; }
}
@media (max-width: 560px) {
  .au-hero-title { font-size: 26px; }
  .au-hero-sub { display: none; }
  .au-stage { width: min(58vw, 220px); margin-top: -6px; }
  .au-card { padding: 24px 18px 22px; border-radius: 18px; }
}
/* ── PCs / large screens: exactly one screen tall, no page scroll.
   The controller stage takes all the height the text and perks leave over. ── */
@media (min-width: 961px) {
  .au-page { height: 100vh; height: 100dvh; min-height: 0; grid-template-columns: minmax(0, 1.3fr) minmax(480px, 1fr); }
  .au-show { min-height: 0; justify-content: flex-start; gap: clamp(10px, 2.2vh, 26px);
    padding: clamp(20px, 4.5vh, 52px) clamp(28px, 4.5vw, 72px) clamp(18px, 3.5vh, 40px); }
  .au-show > * { flex: none; }
  .au-perks { grid-template-columns: repeat(4, minmax(0, 1fr)); max-width: none; gap: 10px; }
  .au-perks li { padding: 10px; font-size: 12px; flex-direction: column; justify-content: center; text-align: center; gap: 6px; }
  .au-stage { flex: 1 1 0; min-height: 160px; width: 100%; max-width: 1000px; aspect-ratio: auto; align-self: center; container-type: size; }
  /* Fill the stage: 96% of its width, or 90% of its height (image is ~1.23:1), whichever is smaller. */
  .au-stage img { width: min(96cqw, 111cqh); height: auto; max-width: none; }
  .au-ring { left: 50%; top: 50%; right: auto; bottom: auto; translate: -50% -50%; aspect-ratio: 1.3; }
  .au-ring.r1, .au-ring.r2 { inset: auto; left: 50%; top: 50%; }
  .au-ring.r1 { height: 96%; }
  .au-ring.r2 { height: 72%; }
  .au-glow { bottom: 2%; width: 50%; }
  .au-side { min-height: 0; overflow-y: auto; padding: clamp(16px, 3vh, 40px) 24px; scrollbar-width: none; }
  .au-side::-webkit-scrollbar { display: none; }
  .au-card { margin: auto 0; }
}
/* Shorter desktop screens: drop extras and tighten the form so it still fits. */
@media (min-width: 961px) and (max-height: 900px) {
  .au-hero-sub { display: none; }
  .au-hero-title { font-size: clamp(28px, 3.4vw, 44px); }
  .au-card { padding: 22px 24px 18px; }
  .au-head p { margin-bottom: 14px; }
  .au-tabs { margin-bottom: 14px; }
  .au-field { margin-bottom: 11px; }
  .au-input input { min-height: 44px; padding-top: 10px; padding-bottom: 10px; }
  .au-check { margin: 2px 0 12px; }
  .au-or { margin: 12px 0 10px; }
  .au-switch { margin-top: 12px; }
  .au-safe { margin-top: 8px; }
}
@media (min-width: 961px) and (max-height: 720px) {
  .au-perks, .au-safe { display: none; }
  .au-head p { display: none; }
  .au-head h1 { font-size: 19px; margin-bottom: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .au-page *, .au-page *::before, .au-page *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    animation-delay: 0s !important; transition-duration: .01ms !important; }
}
`;
