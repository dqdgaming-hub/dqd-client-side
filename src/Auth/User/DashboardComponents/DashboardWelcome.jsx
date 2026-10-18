import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Coins, Hand, Mail, X } from "lucide-react";

// Floating profile button on the dashboard. It starts bottom-right above the
// dock and can be dragged anywhere (the spot is remembered). On arrival a
// greeting bubble slides out of it for a few seconds; tapping the button opens a
// small profile card whose loyalty tile links to the points page. The bubble and
// card open towards whichever side of the screen has room.

const css = `
.pw { position: fixed; z-index: 130; width: 60px; height: 60px; right: max(16px, env(safe-area-inset-right)); bottom: calc(100px + env(safe-area-inset-bottom));
  font-family: 'Rajdhani', 'Inter', sans-serif; }
.pw.placed { right: auto; bottom: auto; }

/* the button: avatar inside a slowly turning gradient ring */
.pw-fab { position: relative; flex: none; width: 100%; height: 100%; padding: 3px; border: 0; border-radius: 50%; cursor: grab; background: transparent;
  touch-action: none; -webkit-user-select: none; user-select: none;
  animation: pw-pop .6s .4s cubic-bezier(.34,1.56,.64,1) backwards; transition: transform .25s cubic-bezier(.34,1.56,.64,1); }
.pw-fab::before { content: ""; position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(from var(--pw-a, 0deg), #00f5ff, #7b2fff, #ff2d78, #ffd60a, #00f5ff); animation: pw-turn 6s linear infinite; }
.pw-fab::after { content: ""; position: absolute; inset: -6px; z-index: -1; border-radius: 50%; filter: blur(14px); opacity: .55;
  background: conic-gradient(from var(--pw-a, 0deg), #00f5ff, #7b2fff, #ff2d78, #00f5ff); animation: pw-turn 6s linear infinite; }
.pw-fab:hover { transform: translateY(-3px) scale(1.04); }
.pw-fab:active { transform: scale(.94); }
.pw-fab.open { transform: rotate(-8deg) scale(.96); }
.pw.dragging .pw-fab { cursor: grabbing; transform: scale(1.12); transition: none; }
.pw.dragging .pw-fab::after { opacity: .9; }
.pw-logo { width: 62%; height: 62%; object-fit: contain; pointer-events: none; filter: drop-shadow(0 0 6px rgba(0,245,255,.45)); }
.pw-face { position: relative; z-index: 1; width: 100%; height: 100%; display: grid; place-items: center; overflow: hidden; border-radius: 50%;
  border: 2px solid #05040a; background: linear-gradient(145deg, #1a1838, #0a0a18); color: #fff; font: 900 17px/1 'Orbitron', sans-serif; }
.pw-face img { width: 100%; height: 100%; object-fit: cover; }
.pw-x { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(5,4,10,.78); color: #fff; opacity: 0; transition: opacity .2s; }
.pw-fab.open .pw-x { opacity: 1; }
.pw-pts { position: absolute; z-index: 2; top: -4px; left: -8px; display: inline-flex; align-items: center; gap: 3px; padding: 3px 7px 3px 5px; border-radius: 999px;
  font: 800 11px/1 'Rajdhani', sans-serif; color: #241a00; background: linear-gradient(135deg, #ffd60a, #ff9f1c); box-shadow: 0 4px 12px rgba(255,170,0,.45);
  border: 2px solid #05040a; }
@property --pw-a { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@keyframes pw-turn { to { --pw-a: 360deg; } }
@keyframes pw-pop { from { opacity: 0; transform: scale(.4) rotate(-40deg); } to { opacity: 1; transform: none; } }

/* greeting bubble */
.pw-hi { position: absolute; top: 50%; translate: 0 -50%; right: calc(100% + 10px); width: max-content; display: flex; align-items: center; gap: 10px; max-width: var(--pw-room, 280px); padding: 10px 12px 10px 14px;
  border: 1px solid rgba(255,255,255,.12); border-radius: 18px 18px 6px 18px; cursor: pointer; text-align: left; color: #fff; overflow: hidden;
  background: linear-gradient(135deg, rgba(23,21,52,.94), rgba(10,10,24,.94)); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 16px 40px rgba(0,0,0,.5); transform-origin: right center; animation: pw-hi-in .55s .9s cubic-bezier(.22,1,.36,1) backwards; }
.pw-hi.out { animation: pw-hi-out .35s ease forwards; }
.pw-hi > svg { flex: none; color: #ffd60a; transform-origin: 70% 80%; animation: pw-wave 1.6s 1.4s ease-in-out 2; }
.pw-hi b { display: block; font: 800 16px/1.15 'Rajdhani', sans-serif; letter-spacing: .02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pw-hi small { display: block; margin-top: 2px; color: #a9a3c8; font-size: 13px; font-weight: 600; }
.pw-hi i { position: absolute; left: 0; bottom: 0; height: 2px; width: 100%; background: linear-gradient(90deg, #00f5ff, #ff2d78); transform-origin: left;
  animation: pw-timer 5s 1s linear both; }
@keyframes pw-hi-in { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: none; } }
@keyframes pw-hi-out { to { opacity: 0; transform: scale(.85); } }
@keyframes pw-wave { 0%, 100% { transform: rotate(0); } 20% { transform: rotate(18deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(14deg); } }
@keyframes pw-timer { from { transform: scaleX(1); } to { transform: scaleX(0); } }

/* profile card */
.pw.left .pw-hi { right: auto; left: calc(100% + 10px); border-radius: 18px 18px 18px 6px; transform-origin: left center; }
.pw-card { position: absolute; right: 0; bottom: calc(100% + 14px); width: min(310px, calc(100vw - 32px)); padding: 16px; border-radius: 22px; color: #fff;
  background: linear-gradient(160deg, #16153a, #0a0a18 70%); border: 1px solid rgba(255,255,255,.1);
  box-shadow: 0 24px 60px rgba(0,0,0,.6), 0 0 40px rgba(123,47,255,.15); transform-origin: calc(100% - 30px) 100%;
  animation: pw-card-in .4s cubic-bezier(.34,1.4,.64,1) backwards; }
.pw-card::before { content: ""; position: absolute; inset: 0 0 auto; height: 90px; border-radius: 22px 22px 0 0; pointer-events: none;
  background: radial-gradient(circle at 20% 0%, rgba(0,245,255,.22), transparent 60%), radial-gradient(circle at 90% 10%, rgba(255,45,120,.18), transparent 55%); }
.pw.left .pw-card { right: auto; left: 0; transform-origin: 30px 100%; }
.pw.below .pw-card { bottom: auto; top: calc(100% + 14px); transform-origin: calc(100% - 30px) 0; }
.pw.left.below .pw-card { transform-origin: 30px 0; }
@keyframes pw-card-in { from { opacity: 0; transform: translateY(10px) scale(.9); } to { opacity: 1; transform: none; } }
.pw-close { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; display: grid; place-items: center; border: 0; border-radius: 10px;
  cursor: pointer; color: #a9a3c8; background: rgba(255,255,255,.05); transition: color .2s, background .2s; }
.pw-close:hover { color: #fff; background: rgba(255,255,255,.1); }
.pw-who { position: relative; display: flex; align-items: center; gap: 12px; padding-right: 36px; margin-bottom: 14px; }
.pw-who .pw-face { width: 52px; height: 52px; flex: none; border: 2px solid rgba(0,245,255,.5); box-shadow: 0 0 18px rgba(0,245,255,.25); }
.pw-who div { min-width: 0; }
.pw-who small { display: block; font: 700 11px/1.2 'Share Tech Mono', monospace; letter-spacing: .18em; text-transform: uppercase; color: #00f5ff; }
.pw-who strong { display: block; margin-top: 3px; font: 900 16px/1.2 'Orbitron', sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pw-who span { display: flex; align-items: center; gap: 5px; margin-top: 4px; color: #9b95bb; font-size: 13.5px; white-space: nowrap; overflow: hidden; }
.pw-who span svg { flex: none; }
.pw-who span em { font-style: normal; overflow: hidden; text-overflow: ellipsis; }
.pw-loyal { position: relative; display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 16px; text-decoration: none; color: #fff; overflow: hidden;
  background: linear-gradient(135deg, rgba(255,214,10,.14), rgba(255,159,28,.06)); border: 1px solid rgba(255,214,10,.3);
  transition: transform .2s, border-color .2s, box-shadow .25s; }
.pw-loyal:hover { transform: translateY(-2px); border-color: rgba(255,214,10,.6); box-shadow: 0 10px 26px rgba(255,170,0,.18); }
.pw-coin { width: 44px; height: 44px; flex: none; display: grid; place-items: center; border-radius: 14px; color: #241a00;
  background: linear-gradient(135deg, #ffd60a, #ff9f1c); box-shadow: 0 6px 16px rgba(255,170,0,.35); }
.pw-loyal div { flex: 1; min-width: 0; }
.pw-loyal small { display: block; font: 700 11px/1.2 'Share Tech Mono', monospace; letter-spacing: .16em; text-transform: uppercase; color: #ffe066; }
.pw-loyal b { display: block; margin-top: 3px; font: 900 22px/1 'Orbitron', sans-serif; }
.pw-loyal em { display: inline-flex; align-items: center; gap: 2px; font-style: normal; font-weight: 700; font-size: 14px; color: #ffd60a; white-space: nowrap; }
.pw-loyal em svg { transition: transform .2s; } .pw-loyal:hover em svg { transform: translateX(3px); }

@media (max-width: 640px) {
  .pw:not(.placed) { right: 14px; }
  .pw { width: 54px; height: 54px; }
}
@media (prefers-reduced-motion: reduce) {
  .pw-fab, .pw-fab::before, .pw-fab::after, .pw-hi, .pw-hi > svg, .pw-hi i, .pw-card { animation: none; }
}
`;

function greetingFor(hour) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";

const POS_KEY = "dqd-profile-fab-pos";
const EDGE = 12;

// Keep the button fully on screen (and below the logo pill at the top).
function clampPos(x, y, size) {
  const maxX = window.innerWidth - size - EDGE;
  const maxY = window.innerHeight - size - EDGE;
  return { x: Math.max(EDGE, Math.min(maxX, x)), y: Math.max(76, Math.min(maxY, y)) };
}

// Saved as fractions of the screen so it lands in the same spot after a resize.
function loadPos() {
  try {
    const v = JSON.parse(localStorage.getItem(POS_KEY));
    if (v && Number.isFinite(v.fx) && Number.isFinite(v.fy)) return v;
  } catch {
    /* storage blocked */
  }
  return null;
}

const shortNum = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));

function Face({ src, name }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return (
    <span className="pw-face">
      {src && !broken ? <img src={src} alt="" onError={() => setBroken(true)} /> : initials(name)}
    </span>
  );
}

function DashboardWelcome({ user, stats }) {
  const [hi, setHi] = useState("in"); // in | out | gone
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null); // { x, y } in px; null = default corner
  const [dragging, setDragging] = useState(false);
  const [side, setSide] = useState({ left: false, below: false, cardX: null, room: 280 });
  const rootRef = useRef(null);
  const drag = useRef(null);
  const moved = useRef(false);

  // Which way the bubble and card should open, based on where the button sits.
  const measureSide = () => {
    const r = rootRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const left = r.left + r.width / 2 < vw / 2;
    // Card: line it up with the button's edge, then nudge it back on screen.
    const cardW = Math.min(310, vw - 32);
    const want = left ? 0 : r.width - cardW;
    const cardX = Math.max(EDGE - r.left, Math.min(vw - EDGE - cardW - r.left, want));
    // Bubble: as wide as the room on its side allows.
    const room = Math.min(280, (left ? vw - r.right : r.left) - 10 - EDGE);
    setSide({ left, below: r.top < 340, cardX, room });
  };

  // Restore a saved spot, and keep it on screen when the window resizes.
  useEffect(() => {
    const place = () => {
      const el = rootRef.current;
      if (!el) return;
      const saved = loadPos();
      if (saved) setPos(clampPos(saved.fx * window.innerWidth, saved.fy * window.innerHeight, el.offsetWidth));
      else measureSide();
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  // Re-measure once the button has settled in a new spot.
  useLayoutEffect(() => {
    if (!dragging) measureSide();
  }, [pos, dragging]);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    const r = rootRef.current.getBoundingClientRect();
    drag.current = { id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY };
    moved.current = false;
    // Keep receiving moves even when a fast drag jumps off the button.
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!moved.current) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
      moved.current = true;
      setDragging(true);
      setHi("gone");
      setOpen(false);
    }
    setPos(clampPos(e.clientX - d.dx, e.clientY - d.dy, rootRef.current.offsetWidth));
  };

  const onPointerUp = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!moved.current) return; // a plain tap: onClick handles it
    setDragging(false);
    const r = rootRef.current.getBoundingClientRect();
    try {
      localStorage.setItem(POS_KEY, JSON.stringify({ fx: r.left / window.innerWidth, fy: r.top / window.innerHeight }));
    } catch {
      /* storage blocked */
    }
  };

  const greeting = greetingFor(new Date().getHours());
  const firstName = user?.full_name?.split(" ")[0] || "Player";
  const points = Number(stats?.loyalty_points ?? user?.loyalty_points ?? 0) || 0;

  // The greeting bubble shows for ~6s after arriving, then slides away.
  useEffect(() => {
    if (hi !== "in") return undefined;
    const t = setTimeout(() => setHi("out"), 6000);
    return () => clearTimeout(t);
  }, [hi]);

  // Close the card on Escape or a tap outside.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onDown = (e) => rootRef.current && !rootRef.current.contains(e.target) && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const openCard = () => {
    setHi("gone");
    setOpen(true);
  };

  return (
    <div
      className={`pw${pos ? " placed" : ""}${dragging ? " dragging" : ""}${side.left ? " left" : ""}${side.below ? " below" : ""}`}
      ref={rootRef}
      style={{ ...(pos ? { left: pos.x, top: pos.y } : null), "--pw-room": `${side.room}px` }}
    >
      <style>{css}</style>

      {hi !== "gone" && !open && (
        <button
          type="button"
          className={`pw-hi${hi === "out" ? " out" : ""}`}
          onClick={openCard}
          onAnimationEnd={(e) => e.animationName === "pw-hi-out" && setHi("gone")}
          aria-live="polite"
        >
          <Hand size={22} aria-hidden="true" />
          <span style={{ minWidth: 0 }}>
            <b>{greeting}, {firstName}</b>
            <small>Tap to see your profile</small>
          </span>
          <i aria-hidden="true" />
        </button>
      )}

      {open && (
        <div className="pw-card" role="dialog" aria-label="Your profile"
          style={side.cardX != null ? { left: side.cardX, right: "auto" } : undefined}>
          <button type="button" className="pw-close" onClick={() => setOpen(false)} aria-label="Close">
            <X size={16} aria-hidden="true" />
          </button>
          <div className="pw-who">
            <Face src={user?.profile_image} name={user?.full_name} />
            <div>
              <small>{greeting}</small>
              <strong>{user?.full_name || "Player"}</strong>
              {user?.email && <span><Mail size={13} aria-hidden="true" /><em>{user.email}</em></span>}
            </div>
          </div>
          <Link className="pw-loyal" to="/user/claim-points" onClick={() => setOpen(false)}>
            <span className="pw-coin"><Coins size={22} aria-hidden="true" /></span>
            <div>
              <small>Loyalty points</small>
              <b>{points.toLocaleString("en-IN")}</b>
            </div>
            <em>Redeem <ChevronRight size={16} aria-hidden="true" /></em>
          </Link>
        </div>
      )}

      <button
        type="button"
        className={`pw-fab${open ? " open" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
          if (moved.current) { // end of a drag, not a tap
            moved.current = false;
            return;
          }
          if (open) setOpen(false);
          else openCard();
        }}
        aria-expanded={open}
        aria-label={open ? "Close profile" : `Open profile — ${points} loyalty points. Drag to move.`}
        title="Tap to open · drag to move"
      >
        <span className="pw-face"><img className="pw-logo" src="/logo.png" alt="" draggable={false} /></span>
        <span className="pw-x" aria-hidden="true" style={{ zIndex: 1, borderRadius: "50%", inset: 3 }}><X size={20} /></span>
        {points > 0 && !open && (
          <span className="pw-pts" aria-hidden="true"><Coins size={11} />{shortNum(points)}</span>
        )}
      </button>
    </div>
  );
}

export default DashboardWelcome;
