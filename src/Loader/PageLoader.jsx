import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* ═══════════════════════════════════════════════
   REFERENCE DESIGN CONSTANTS (scaled at runtime)
   Base aspect ratio 2:3 — every game frame, on any
   screen, keeps this ratio via CSS `aspect-ratio`.
═══════════════════════════════════════════════ */
const BASE_W = 320;
const BASE_H = 480;

const SNAKE_COLS = 10;
const SNAKE_ROWS = 15; // 10 * 1.5 = 15 → exact 2:3 fit, square cells
const SNAKE_BASE_TICK = 170;
const SNAKE_MIN_TICK = 78;

const OBS_COLORS = ["#ff006e", "#00f5ff", "#f59e0b", "#39ff14"];

/* Grid Hack — reflex/combo tapping game constants */
const HACK_COLS = 4;
const HACK_ROWS = 6; // 4:6 = 2:3 → square cells, same trick as the snake grid
const HACK_BASE_DURATION = 1400; // ms the ring takes to drain at the start
const HACK_MIN_DURATION = 520; // fastest the ring will ever drain
const HACK_DIFFICULTY_RATE = 3.6; // ms shaved off per point of score

/* ═══════════════════════════════════════════════
   Hook: measure a container's rendered width and
   derive height from the fixed 2:3 aspect ratio.
   Everything downstream (lanes, cars, grid cells)
   is computed from this single live measurement.
═══════════════════════════════════════════════ */
function useFrameSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: BASE_W, height: BASE_H });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth || BASE_W;
      setSize({ width: w, height: w * (BASE_H / BASE_W) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
}

/* ═══════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════ */
const ALL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

  .pl-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: #05040A;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 0;
    font-family: 'Orbitron', monospace;
    overflow: hidden;
    padding: 16px;
  }
  .pl-topline {
    position:absolute; top:0;left:0;right:0; height:2px;
    background:linear-gradient(90deg,transparent,#7A2CFF,#D4AF37,transparent);
    z-index: 1;
  }
  .pl-orb1 {
    position:absolute; width:min(60vw,420px); height:min(60vw,420px);
    top:-10%; left:-8%; border-radius:50%;
    background:radial-gradient(circle,rgba(122,44,255,0.18) 0%,transparent 70%);
    filter:blur(80px); pointer-events:none;
  }
  .pl-orb2 {
    position:absolute; width:min(45vw,320px); height:min(45vw,320px);
    bottom:-5%; right:-5%; border-radius:50%;
    background:radial-gradient(circle,rgba(212,175,55,0.12) 0%,transparent 70%);
    filter:blur(80px); pointer-events:none;
  }
  .pl-corner { position:absolute; width:18px; height:18px; pointer-events:none; z-index:1; }
  .pl-lc-tl { top:14px;left:14px; border-top:2px solid rgba(212,175,55,.35); border-left:2px solid rgba(212,175,55,.35); }
  .pl-lc-tr { top:14px;right:14px; border-top:2px solid rgba(212,175,55,.35); border-right:2px solid rgba(212,175,55,.35); }
  .pl-lc-bl { bottom:14px;left:14px; border-bottom:2px solid rgba(212,175,55,.35); border-left:2px solid rgba(212,175,55,.35); }
  .pl-lc-br { bottom:14px;right:14px; border-bottom:2px solid rgba(212,175,55,.35); border-right:2px solid rgba(212,175,55,.35); }

  .pl-hex {
    width: 62px; height: 52px;
    clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
    display: grid; place-items: center;
    font-family: 'Orbitron', monospace;
    font-size: 18px; font-weight: 900; color: #D4AF37;
    animation: pl-pulse 2s ease-in-out infinite;
    position: relative; z-index: 1;
    margin: 0 auto;
    background: radial-gradient(circle, rgba(122,44,255,0.15), transparent 70%);
    overflow: hidden;
  }
  .ar-logo-img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  @keyframes pl-pulse {
    0%,100% { box-shadow: 0 0 0 rgba(212,175,55,0); border-color: #D4AF37; }
    50%      { box-shadow: 0 0 28px rgba(212,175,55,0.4); border-color: #F4D886; }
  }
  .pl-status {
    position:relative; z-index:1; margin-top: 10px;
    font-family:'Orbitron',monospace; font-size:clamp(8px,2.6vw,9px);
    letter-spacing:.28em; color:rgba(185,194,217,.55);
    text-transform:uppercase; text-align:center;
    animation: pl-blink 1.6s ease-in-out infinite;
  }
  .pl-status.is-offline { color: #ff006e; }
  @keyframes pl-blink { 0%,100%{opacity:.5} 50%{opacity:1} }
  .pl-sub {
    position:relative; z-index:1; margin-top: 4px;
    font-family:'Orbitron',monospace; font-size:clamp(7px,2.2vw,8px); letter-spacing:3px;
    color: rgba(185,194,217,0.35); text-transform: uppercase; text-align:center;
  }

  .pl-frame-wrap { display:flex; justify-content:center; margin-top: clamp(12px,3vw,20px); width:100%; z-index:1; position:relative; }

  .game-frame {
    position: relative;
    width: min(90vw, 340px);
    aspect-ratio: 2 / 3;
    background: #0a0918;
    border: 1px solid rgba(122,44,255,0.3);
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 0 40px rgba(122,44,255,0.12), inset 0 0 30px rgba(0,0,0,0.5);
  }

  .back-btn {
    position:absolute; top:8px; left:8px; z-index:50;
    width:26px; height:26px; display:grid; place-items:center;
    border:1px solid rgba(212,175,55,0.4);
    background: rgba(5,4,10,0.7);
    color:#D4AF37; font-size:13px; cursor:pointer;
    clip-path: polygon(30% 0,100% 0,100% 100%,0 100%,0 30%);
  }
  .back-btn:hover { background: rgba(122,44,255,0.2); }

  /* ── mode select ── */
  .mode-select {
    position:absolute; inset:0; z-index:5;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap: clamp(10px,2.6vw,14px);
    padding: clamp(14px,4vw,22px);
    background: linear-gradient(180deg, rgba(10,9,24,0.4), #0a0918 65%);
    overflow-y: auto;
  }
  .mode-eyebrow {
    font-size: clamp(7px,2vw,8px); letter-spacing: 3px; color: rgba(185,194,217,0.4);
    text-transform:uppercase; text-align:center; margin-bottom: 2px;
  }
  .mode-card {
    width: 100%; max-width: 240px;
    display:flex; align-items:center; gap: 12px;
    padding: clamp(10px,3vw,14px) clamp(12px,3.4vw,16px);
    border: 1px solid rgba(212,175,55,0.3);
    background: linear-gradient(135deg, rgba(122,44,255,0.14), rgba(10,9,24,0.4));
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
    cursor: pointer; text-align:left;
  }
  .mode-icon {
    font-size: clamp(20px,6vw,26px); flex-shrink:0;
    width: 40px; height:40px; display:grid; place-items:center;
    background: rgba(0,0,0,0.25); border: 1px solid rgba(0,245,255,0.25);
    border-radius: 50%;
  }
  .mode-text strong {
    display:block; font-size: clamp(10px,3vw,12px); letter-spacing: 1.5px;
    color: #F4D886; text-transform: uppercase;
  }
  .mode-text span {
    display:block; margin-top: 3px; font-family: monospace; letter-spacing: 0.3px;
    font-size: clamp(8px,2.4vw,9.5px); color: rgba(185,194,217,0.5); text-transform:none;
  }

  /* ── shared HUD ── */
  .race-hud {
    position:absolute; top:0; left:0; right:0;
    display:flex; justify-content:space-between; align-items:center;
    padding:8px 10px 8px 40px;
    background:linear-gradient(180deg,rgba(5,4,10,0.85),transparent);
    z-index:10; pointer-events:none;
  }
  .hud-val { font-family:'Orbitron',monospace; font-size:clamp(9px,3vw,11px); font-weight:700; color:#D4AF37; letter-spacing:1px; }
  .hud-label { font-family:'Orbitron',monospace; font-size:clamp(6px,2vw,7px); color:rgba(212,175,55,0.5); letter-spacing:2px; text-transform:uppercase; display:block; }
  .race-lives { display:flex; gap:5px; }
  .life-pip { width:9px; height:9px; border-radius:50%; background:#7A2CFF; box-shadow:0 0 8px rgba(122,44,255,0.8); }
  .life-pip.dead { background:rgba(255,255,255,0.1); box-shadow:none; }

  /* ── racing track visuals ── */
  .race-road-bg { position:absolute; inset:0; background: linear-gradient(180deg, #0d0c1e 0%, #0a0918 100%); }
  .race-lane-line {
    position:absolute; top:0; bottom:0; width:2px;
    background: repeating-linear-gradient(180deg, rgba(212,175,55,0.35) 0px, rgba(212,175,55,0.35) 18px, transparent 18px, transparent 38px);
    animation: lane-scroll 0.45s linear infinite;
  }
  @keyframes lane-scroll { from { background-position: 0 0; } to { background-position: 0 56px; } }
  .race-edge {
    position:absolute; top:0; bottom:0; width:6px;
    background: linear-gradient(180deg, rgba(122,44,255,0.6) 0px, rgba(122,44,255,0.6) 12px, transparent 12px, transparent 24px);
    background-size: 6px 24px;
    animation: lane-scroll 0.35s linear infinite;
  }
  .race-edge-l { left:0; } .race-edge-r { right:0; }

  .player-car, .obs-car { position:absolute; }
  .car-body {
    position:absolute; left:10%; right:10%; top:12%; bottom:12%;
    background: linear-gradient(160deg, #c084fc, #7c3aed);
    clip-path: polygon(18% 0%,82% 0%,100% 18%,100% 82%,82% 100%,18% 100%,0% 82%,0% 18%);
    box-shadow: 0 0 18px rgba(192,132,252,0.7);
  }
  .car-window {
    position:absolute; left:50%; top:34%; transform:translateX(-50%);
    width:42%; height:28%;
    background:linear-gradient(180deg,rgba(0,245,255,0.8),rgba(0,245,255,0.2));
    clip-path:polygon(20% 0%,80% 0%,100% 40%,80% 100%,20% 100%,0% 40%);
  }
  .car-wheel { position:absolute; width:21%; height:19%; background:#1a1a2e; border:1px solid rgba(192,132,252,0.5); border-radius:2px; }
  .wl-tl{top:16%;left:0;} .wl-tr{top:16%;right:0;} .wl-bl{bottom:16%;left:0;} .wl-br{bottom:16%;right:0;}
  .car-exhaust {
    position:absolute; bottom:-6%; left:50%; transform:translateX(-50%);
    width:16%; height:16%;
    background:linear-gradient(180deg,rgba(122,44,255,0.8),transparent);
    filter:blur(3px);
    animation:exhaust 0.15s ease-in-out infinite alternate;
  }
  @keyframes exhaust { from{opacity:0.6;} to{opacity:1;} }

  .obs-body {
    position:absolute; left:8%; right:8%; top:10%; bottom:10%;
    clip-path: polygon(18% 0%,82% 0%,100% 18%,100% 82%,82% 100%,18% 100%,0% 82%,0% 18%);
  }
  .obs-window { position:absolute; left:50%; top:26%; transform:translateX(-50%); width:38%; height:24%; background:rgba(0,0,0,0.5); clip-path:polygon(20% 0%,80% 0%,100% 40%,80% 100%,20% 100%,0% 40%); }
  .obs-wheel { position:absolute; width:18%; height:17%; background:#0a0918; border-radius:1px; }
  .ow-tl{top:13%;left:0;} .ow-tr{top:13%;right:0;} .ow-bl{bottom:13%;left:0;} .ow-br{bottom:13%;right:0;}

  .crash-flash { position:absolute; inset:0; background:rgba(255,0,110,0.22); pointer-events:none; z-index:20; }

  .speed-line { position:absolute; width:1px; background:linear-gradient(180deg,transparent,rgba(192,132,252,0.4),transparent); animation:spd-line 0.4s linear infinite; }
  @keyframes spd-line { from{transform:translateY(-100%);} to{transform:translateY(200%);} }

  /* ── snake board ── */
  .snake-board { position:absolute; inset:0; background: linear-gradient(180deg, #0d0c1e 0%, #0a0918 100%); }
  .snake-grid-line-v, .snake-grid-line-h { position:absolute; background: rgba(122,44,255,0.06); }
  .snake-cell {
    position:absolute; border-radius: 3px;
  }
  .snake-head { background: linear-gradient(160deg, #39ff14, #14a800); box-shadow: 0 0 10px rgba(57,255,20,0.7); }
  .snake-body { background: linear-gradient(160deg, #00f5ff, #0a7f8c); box-shadow: 0 0 6px rgba(0,245,255,0.4); }
  .snake-food { background: radial-gradient(circle, #ff006e, #a30047); box-shadow: 0 0 12px rgba(255,0,110,0.8); border-radius: 50%; }

  /* ── grid hack board ── */
  .hack-board { position:absolute; inset:0; background: linear-gradient(180deg, #0d0c1e 0%, #0a0918 100%); }
  .hack-cell {
    position:absolute; border-radius: 4px;
    background: rgba(122,44,255,0.05);
    border: 1px solid rgba(122,44,255,0.14);
    display:flex; align-items:center; justify-content:center;
    cursor: pointer;
    transition: background 0.1s ease;
  }
  .hack-cell:active { background: rgba(122,44,255,0.22); }
  .hack-combo-pop {
    position:absolute; z-index: 12; pointer-events:none;
    font-family:'Orbitron',monospace; font-weight:900; font-size: 11px;
    color:#39ff14; text-shadow: 0 0 8px rgba(57,255,20,0.8);
  }
  .hack-ring { width: 72%; height: 72%; transform: rotate(-90deg); }
  .hack-ring-bg { fill: rgba(0,245,255,0.06); stroke: rgba(0,245,255,0.22); stroke-width: 2.4; }
  .hack-ring-fg {
    fill: none; stroke: #00f5ff; stroke-width: 3.4; stroke-linecap: round;
    stroke-dasharray: 97.4; stroke-dashoffset: 0;
    filter: drop-shadow(0 0 6px rgba(0,245,255,0.85));
    animation-name: hack-drain; animation-timing-function: linear; animation-fill-mode: forwards;
  }
  .hack-ring-fg.is-hit { stroke: #39ff14; filter: drop-shadow(0 0 10px rgba(57,255,20,0.9)); animation: none; stroke-dashoffset: 0; }
  .hack-ring-fg.is-miss { stroke: #ff006e; filter: drop-shadow(0 0 10px rgba(255,0,110,0.9)); animation: none; stroke-dashoffset: 0; }
  @keyframes hack-drain { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 97.4; } }

  /* ── overlay states ── */
  .key-hints { display:flex; gap:8px; align-items:center; margin-top:10px; z-index: 1; position: relative; }
  .game-overlay {
    position:absolute; inset:0; z-index:30;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:10px;
    background:rgba(5,4,10,0.9); text-align:center; padding: 0 16px;
  }
  .overlay-title { font-family:'Orbitron',monospace; font-size:clamp(13px,4vw,15px); font-weight:900; letter-spacing:3px; text-transform:uppercase; }
  .overlay-sub { font-family:'Orbitron',monospace; font-size:clamp(7px,2.4vw,8px); letter-spacing:3px; color:rgba(185,194,217,0.45); text-transform:uppercase; }
  .overlay-score { font-family:'Orbitron',monospace; font-size:clamp(18px,6vw,22px); font-weight:900; color:#D4AF37; }
  .overlay-btn {
    margin-top:4px; padding:9px 22px;
    font-family:'Orbitron',monospace; font-size:clamp(9px,2.8vw,10px); font-weight:700;
    letter-spacing:2px; text-transform:uppercase;
    background:linear-gradient(135deg,#7A2CFF,#c084fc);
    border:none; color:#fff; cursor:pointer;
    clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
  }
  .overlay-link {
    background:none; border:none; cursor:pointer;
    font-family:'Orbitron',monospace; font-size:clamp(7px,2.2vw,8px);
    letter-spacing:2px; text-transform:uppercase; color:rgba(185,194,217,0.5);
    text-decoration: underline; padding: 2px;
  }

  @media (max-width: 380px) {
    .pl-hex { width:42px; height:42px; font-size:14px; }
    .pl-corner { display:none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pl-pulse, .pl-topline, .pl-status, .exhaust, .lane-scroll { animation-duration: 0.001ms !important; }
  }
`;

/* ═══════════════════════════════════════════════
   ICONS — inline SVG, currentColor-based, used in
   place of emoji throughout the mode select and
   overlay states.
═══════════════════════════════════════════════ */
function IconCar({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
      <rect x="2.5" y="13" width="19" height="5" rx="1.5" />
      <circle cx="7" cy="18.5" r="1.6" fill={color} stroke="none" />
      <circle cx="17" cy="18.5" r="1.6" fill={color} stroke="none" />
      <path d="M7 10.5h10" />
    </svg>
  );
}

function IconSnake({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6c0-1.1.9-2 2-2s2 .9 2 2-1 2-1 2h5c1.1 0 2 .9 2 2s-.9 2-2 2H8c-1.1 0-2 .9-2 2s.9 2 2 2h7c1.1 0 2 .9 2 2s-.9 2-2 2" />
      <circle cx="6" cy="6" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}

function IconTarget({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
      <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" strokeLinecap="round" />
    </svg>
  );
}

function IconImpact({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.2 5.6L20 9l-4.8 3.6L16.5 19 12 15.4 7.5 19l1.3-6.4L4 9l5.8-1.4z" />
    </svg>
  );
}

function IconAlert({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l10 17H2z" />
      <path d="M12 9v5" />
      <circle cx="12" cy="17" r="0.8" fill={color} stroke="none" />
    </svg>
  );
}

function IconSkull({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-4.4 0-7.5 3.1-7.5 7 0 2.6 1.4 4.4 2.7 5.6V19a1 1 0 0 0 1 1h1.6v-2h1v2h2.4v-2h1v2H16a1 1 0 0 0 1-1v-3.4c1.3-1.2 2.7-3 2.7-5.6 0-3.9-3.1-7-7.7-7z" />
      <circle cx="9" cy="11" r="1.3" fill={color} stroke="none" />
      <circle cx="15" cy="11" r="1.3" fill={color} stroke="none" />
      <path d="M11 14.5h2" />
    </svg>
  );
}

function IconLock({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="15.2" r="1.1" fill={color} stroke="none" />
      <path d="M12 16.3v1.6" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   CARS
═══════════════════════════════════════════════ */
function PlayerCar({ w, h }) {
  return (
    <div className="player-car" style={{ width: w, height: h }}>
      <div className="car-wheel wl-tl" />
      <div className="car-wheel wl-tr" />
      <div className="car-wheel wl-bl" />
      <div className="car-wheel wl-br" />
      <div className="car-body" />
      <div className="car-window" />
      <div className="car-exhaust" />
    </div>
  );
}

function ObstacleCar({ w, h, color }) {
  return (
    <div className="obs-car" style={{ width: w, height: h }}>
      <div className="obs-wheel ow-tl" />
      <div className="obs-wheel ow-tr" />
      <div className="obs-wheel ow-bl" />
      <div className="obs-wheel ow-br" />
      <div
        className="obs-body"
        style={{ background: `linear-gradient(160deg, ${color}cc, ${color}66)`, boxShadow: `0 0 14px ${color}99` }}
      />
      <div className="obs-window" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   RACING GAME — responsive to `size` (frame px)
═══════════════════════════════════════════════ */
function RacingGame({ size }) {
  const scale = size.width / BASE_W;

  const CAR_W = 38 * scale, CAR_H = 64 * scale;
  const OBS_W = 38 * scale, OBS_H = 60 * scale;
  const LANE_W = size.width / 3;
  const PLAYER_Y = size.height - CAR_H - 18 * scale;
  const LANES = [
    LANE_W * 0 + (LANE_W - CAR_W) / 2,
    LANE_W * 1 + (LANE_W - CAR_W) / 2,
    LANE_W * 2 + (LANE_W - CAR_W) / 2,
  ];
  const BASE_SPEED = 3.2 * scale;
  const SPEED_INC = 0.0008 * scale;
  const SPAWN_INT = 72;

  const [phase, setPhase] = useState("idle");
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [crashed, setCrashed] = useState(false);
  const [frameSpeed, setFrameSpeed] = useState(BASE_SPEED);

  const frameRef = useRef(null);
  const frameCount = useRef(0);
  const stateRef = useRef({});
  stateRef.current = { playerLane, obstacles, score, lives, phase, frameSpeed };

  const startGame = useCallback(() => {
    setPlayerLane(1);
    setObstacles([]);
    setScore(0);
    setLives(3);
    setCrashed(false);
    setFrameSpeed(BASE_SPEED);
    frameCount.current = 0;
    setPhase("playing");
  }, [BASE_SPEED]);

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") setPlayerLane((l) => Math.max(0, l - 1));
      if (e.key === "ArrowRight") setPlayerLane((l) => Math.min(2, l + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") {
      cancelAnimationFrame(frameRef.current);
      return;
    }

    const tick = () => {
      frameCount.current += 1;
      const fc = frameCount.current;
      const { playerLane, lives } = stateRef.current;
      const speed = BASE_SPEED + fc * SPEED_INC;

      setFrameSpeed(speed);
      setScore((s) => s + 1);

      setObstacles((prev) => {
        let next = prev.map((o) => ({ ...o, y: o.y + speed })).filter((o) => o.y < size.height + OBS_H);

        if (fc % SPAWN_INT === 0) {
          const usedLanes = next.filter((o) => o.y < 120 * scale).map((o) => o.lane);
          const free = [0, 1, 2].filter((l) => !usedLanes.includes(l));
          if (free.length) {
            const lane = free[Math.floor(Math.random() * free.length)];
            next = [...next, { id: fc, lane, y: -OBS_H, color: OBS_COLORS[Math.floor(Math.random() * OBS_COLORS.length)] }];
          }
        }

        const playerX = LANES[playerLane];
        const playerYTop = PLAYER_Y;
        const collide = (o) => {
          const ox = LANES[o.lane];
          const oy = o.y;
          return Math.abs(ox - playerX) < CAR_W * 0.8 && oy + OBS_H > playerYTop + 8 * scale && oy < playerYTop + CAR_H - 8 * scale;
        };
        const hit = next.some(collide);

        if (hit) {
          const surviving = next.filter((o) => !collide(o));
          const newLives = lives - 1;
          setLives(newLives);
          setCrashed(true);
          setTimeout(() => setCrashed(false), 300);

          if (newLives <= 0) {
            setPhase("gameover");
            setBestScore((b) => Math.max(b, stateRef.current.score));
            cancelAnimationFrame(frameRef.current);
          } else {
            setPhase("dead");
            cancelAnimationFrame(frameRef.current);
            setTimeout(() => {
              frameCount.current = fc;
              setPhase("playing");
            }, 900);
          }
          return surviving;
        }
        return next;
      });

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, size.width]);

  const speedKmh = Math.round(120 + (frameSpeed - BASE_SPEED) * (60 / Math.max(scale, 0.01)));

  const touchX = useRef(null);
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current === null || phase !== "playing") return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 28) {
      if (dx < 0) setPlayerLane((l) => Math.max(0, l - 1));
      else setPlayerLane((l) => Math.min(2, l + 1));
    }
    touchX.current = null;
  };

  return (
    <div style={{ position: "absolute", inset: 0 }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="race-road-bg" />

      {phase === "playing" &&
        [0.05, 0.25, 0.48, 0.72, 0.92].map((f, i) => (
          <div
            key={i}
            className="speed-line"
            style={{
              left: f * size.width,
              height: (60 + i * 20) * scale,
              animationDelay: `${i * 0.08}s`,
              animationDuration: `${0.28 + i * 0.04}s`,
              opacity: Math.min(1, (frameSpeed - BASE_SPEED) * 0.4),
            }}
          />
        ))}

      <div className="race-edge race-edge-l" />
      <div className="race-edge race-edge-r" />
      <div className="race-lane-line" style={{ left: LANE_W - 1 }} />
      <div className="race-lane-line" style={{ left: LANE_W * 2 - 1 }} />

      <div className="race-hud">
        <div>
          <span className="hud-label">Score</span>
          <span className="hud-val">{String(Math.floor(score / 10)).padStart(5, "0")}</span>
        </div>
        <div className="race-lives">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`life-pip${i >= lives ? " dead" : ""}`} />
          ))}
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="hud-label">Speed</span>
          <span className="hud-val">{speedKmh}</span>
        </div>
      </div>

      {obstacles.map((o) => (
        <div key={o.id} style={{ position: "absolute", left: LANES[o.lane], top: o.y }}>
          <ObstacleCar w={OBS_W} h={OBS_H} color={o.color} />
        </div>
      ))}

      <motion.div
        style={{ position: "absolute", top: PLAYER_Y }}
        animate={{ left: LANES[playerLane] }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
      >
        <motion.div animate={crashed ? { x: [0, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.3 }}>
          <PlayerCar w={CAR_W} h={CAR_H} />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {crashed && (
          <motion.div
            className="crash-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "idle" && (
          <motion.div className="game-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              <IconCar size={30} color="#c084fc" />
            </motion.div>
            <div className="overlay-title" style={{ color: "#c084fc" }}>Turbo Race</div>
            <div className="overlay-sub">Dodge traffic, survive the grid</div>
            <motion.button className="overlay-btn" onClick={startGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Start Racing
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "dead" && (
          <motion.div className="game-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <motion.div animate={{ scale: [1, 1.4, 1], rotate: [0, -15, 15, 0] }} transition={{ duration: 0.5 }}>
              <IconImpact size={28} color="#ff006e" />
            </motion.div>
            <div className="overlay-title" style={{ color: "#ff006e", fontSize: 13 }}>CRASHED!</div>
            <div className="overlay-sub">Resuming in 1s…</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "gameover" && (
          <motion.div
            className="game-overlay"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <motion.div animate={{ rotate: [0, -10, 10, -8, 8, 0] }} transition={{ duration: 0.6, delay: 0.1 }}>
              <IconAlert size={28} color="#ff006e" />
            </motion.div>
            <div className="overlay-title" style={{ color: "#ff006e" }}>Game Over</div>
            <div>
              <div className="hud-label" style={{ textAlign: "center", marginBottom: 4 }}>Score</div>
              <div className="overlay-score">{String(Math.floor(score / 10)).padStart(5, "0")}</div>
            </div>
            {bestScore > 0 && <div className="overlay-sub">Best: {String(Math.floor(bestScore / 10)).padStart(5, "0")}</div>}
            <motion.button className="overlay-btn" onClick={startGame} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SNAKE GAME — grid-based, responsive to `size`
═══════════════════════════════════════════════ */
function SnakeGame({ size }) {
  const cell = size.width / SNAKE_COLS;
  const gap = Math.max(1, cell * 0.08);

  const [phase, setPhase] = useState("idle");
  const [snake, setSnake] = useState([{ x: 5, y: 7 }, { x: 4, y: 7 }, { x: 3, y: 7 }]);
  const [food, setFood] = useState({ x: 8, y: 7 });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const dirRef = useRef({ x: 1, y: 0 });
  const nextDirRef = useRef({ x: 1, y: 0 });
  const tickTimer = useRef(null);

  const randomFood = useCallback((body) => {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * SNAKE_COLS), y: Math.floor(Math.random() * SNAKE_ROWS) };
    } while (body.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const startGame = useCallback(() => {
    const initial = [{ x: 5, y: 7 }, { x: 4, y: 7 }, { x: 3, y: 7 }];
    setSnake(initial);
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    setFood(randomFood(initial));
    setScore(0);
    setPhase("playing");
  }, [randomFood]);

  useEffect(() => {
    if (phase !== "playing") return;
    const map = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
    const onKey = (e) => {
      const nd = map[e.key];
      if (!nd) return;
      e.preventDefault();
      const cur = dirRef.current;
      if (nd.x === -cur.x && nd.y === -cur.y) return;
      nextDirRef.current = nd;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const touchStart = useRef(null);
  const onTouchStart = (e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    if (!touchStart.current || phase !== "playing") return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const cur = dirRef.current;
    let nd = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 18) nd = { x: dx > 0 ? 1 : -1, y: 0 };
    } else if (Math.abs(dy) > 18) {
      nd = { x: 0, y: dy > 0 ? 1 : -1 };
    }
    if (nd && !(nd.x === -cur.x && nd.y === -cur.y)) nextDirRef.current = nd;
    touchStart.current = null;
  };

  useEffect(() => {
    if (phase !== "playing") {
      clearTimeout(tickTimer.current);
      return;
    }
    const speed = Math.max(SNAKE_MIN_TICK, SNAKE_BASE_TICK - score * 3);
    tickTimer.current = setTimeout(() => {
      const direction = nextDirRef.current;
      dirRef.current = direction;
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
      const collided =
        head.x < 0 || head.x >= SNAKE_COLS || head.y < 0 || head.y >= SNAKE_ROWS ||
        snake.some((s) => s.x === head.x && s.y === head.y);

      if (collided) {
        setPhase("gameover");
        setBest((b) => Math.max(b, score));
        return;
      }

      const ateFood = head.x === food.x && head.y === food.y;
      const newSnake = [head, ...snake];
      if (!ateFood) newSnake.pop();
      setSnake(newSnake);
      if (ateFood) {
        setScore((s) => s + 1);
        setFood(randomFood(newSnake));
      }
    }, speed);
    return () => clearTimeout(tickTimer.current);
  }, [phase, snake, score, food, randomFood]);

  return (
    <div style={{ position: "absolute", inset: 0 }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="snake-board" />

      {Array.from({ length: SNAKE_COLS + 1 }).map((_, i) => (
        <div key={`v${i}`} className="snake-grid-line-v" style={{ left: i * cell, top: 0, bottom: 0, width: 1 }} />
      ))}
      {Array.from({ length: SNAKE_ROWS + 1 }).map((_, i) => (
        <div key={`h${i}`} className="snake-grid-line-h" style={{ top: i * cell, left: 0, right: 0, height: 1 }} />
      ))}

      <div className="race-hud">
        <div>
          <span className="hud-label">Score</span>
          <span className="hud-val">{String(score).padStart(3, "0")}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="hud-label">Best</span>
          <span className="hud-val">{String(Math.max(best, score)).padStart(3, "0")}</span>
        </div>
      </div>

      <motion.div
        className="snake-cell snake-food"
        style={{ width: cell - gap * 2, height: cell - gap * 2 }}
        animate={{ left: food.x * cell + gap, top: food.y * cell + gap, scale: [1, 1.15, 1] }}
        transition={{ left: { duration: 0.08 }, top: { duration: 0.08 }, scale: { duration: 0.9, repeat: Infinity, ease: "easeInOut" } }}
      />

      {snake.map((seg, i) => (
        <motion.div
          key={i}
          layout
          className={`snake-cell ${i === 0 ? "snake-head" : "snake-body"}`}
          style={{ width: cell - gap * 2, height: cell - gap * 2, opacity: 1 - (i / snake.length) * 0.35 }}
          animate={{ left: seg.x * cell + gap, top: seg.y * cell + gap }}
          transition={{ type: "tween", duration: 0.09, ease: "linear" }}
        />
      ))}

      <AnimatePresence>
        {phase === "idle" && (
          <motion.div className="game-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
              <IconSnake size={28} color="#39ff14" />
            </motion.div>
            <div className="overlay-title" style={{ color: "#39ff14" }}>Neon Snake</div>
            <div className="overlay-sub">Eat the orbs, don't bite yourself</div>
            <motion.button className="overlay-btn" onClick={startGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Start Slithering
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "gameover" && (
          <motion.div
            className="game-overlay"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <motion.div animate={{ rotate: [0, -10, 10, -8, 8, 0] }} transition={{ duration: 0.6, delay: 0.1 }}>
              <IconSkull size={28} color="#ff006e" />
            </motion.div>
            <div className="overlay-title" style={{ color: "#ff006e" }}>Game Over</div>
            <div>
              <div className="hud-label" style={{ textAlign: "center", marginBottom: 4 }}>Score</div>
              <div className="overlay-score">{String(score).padStart(3, "0")}</div>
            </div>
            {best > 0 && <div className="overlay-sub">Best: {String(Math.max(best, score)).padStart(3, "0")}</div>}
            <motion.button className="overlay-btn" onClick={startGame} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   GRID HACK — reflex/combo tapping game.
   A single "node" lights up on a hex grid with a
   shrinking SVG countdown ring. Tap it before the
   ring drains to bank points; every consecutive hit
   raises your multiplier (score = 10 × combo), and
   the ring gets faster as your score climbs — so
   it's a pure escalating skill/reflex chase, built
   to be replayed for a better run than last time.
═══════════════════════════════════════════════ */
function HackGame({ size }) {
  const cell = size.width / HACK_COLS; // square cells, same trick as SnakeGame
  const gap = Math.max(1, cell * 0.09);

  const [phase, setPhase] = useState("idle");
  const [target, setTarget] = useState(null); // { id, x, y, duration }
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [lives, setLives] = useState(3);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState(null); // 'hit' | 'miss'
  const [popup, setPopup] = useState(null); // { id, x, y, text, color }

  const idRef = useRef(0);
  const popupIdRef = useRef(0);
  const timerRef = useRef(null);
  const stateRef = useRef({});
  stateRef.current = { score, combo, lives, phase, target };

  const nextDuration = useCallback((currentScore) => {
    return Math.max(HACK_MIN_DURATION, HACK_BASE_DURATION - currentScore * HACK_DIFFICULTY_RATE);
  }, []);

  const spawnTarget = useCallback(
    (duration) => {
      idRef.current += 1;
      const id = idRef.current;
      const x = Math.floor(Math.random() * HACK_COLS);
      const y = Math.floor(Math.random() * HACK_ROWS);
      setTarget({ id, x, y, duration });
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => registerMiss(id), duration);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const registerMiss = useCallback(
    (id) => {
      if (stateRef.current.phase !== "playing") return;
      if (!stateRef.current.target || stateRef.current.target.id !== id) return;
      const newLives = stateRef.current.lives - 1;
      setLives(newLives);
      setCombo(1);
      setFlash("miss");
      setTimeout(() => setFlash(null), 220);

      if (newLives <= 0) {
        setPhase("gameover");
        setBest((b) => Math.max(b, stateRef.current.score));
        setTarget(null);
        clearTimeout(timerRef.current);
        return;
      }
      spawnTarget(nextDuration(stateRef.current.score));
    },
    [spawnTarget, nextDuration]
  );

  const handleCellTap = useCallback(
    (x, y) => {
      if (stateRef.current.phase !== "playing") return;
      const t = stateRef.current.target;
      if (!t) return;

      if (t.x !== x || t.y !== y) {
        clearTimeout(timerRef.current);
        registerMiss(t.id);
        return;
      }

      clearTimeout(timerRef.current);
      const gained = 10 * stateRef.current.combo;
      const newCombo = stateRef.current.combo + 1;
      const newScore = stateRef.current.score + gained;
      setScore(newScore);
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setFlash("hit");
      setTimeout(() => setFlash(null), 150);

      popupIdRef.current += 1;
      setPopup({ id: popupIdRef.current, x, y, text: `+${gained}`, color: "#39ff14" });
      setTimeout(() => setPopup((p) => (p && p.id === popupIdRef.current ? null : p)), 500);

      spawnTarget(nextDuration(newScore));
    },
    [registerMiss, spawnTarget, nextDuration]
  );

  const startGame = useCallback(() => {
    setScore(0);
    setCombo(1);
    setMaxCombo(1);
    setLives(3);
    setFlash(null);
    setPopup(null);
    setPhase("playing");
    spawnTarget(HACK_BASE_DURATION);
  }, [spawnTarget]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const cells = [];
  for (let y = 0; y < HACK_ROWS; y++) {
    for (let x = 0; x < HACK_COLS; x++) cells.push({ x, y });
  }

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="hack-board" />

      <div className="race-hud">
        <div>
          <span className="hud-label">Score</span>
          <span className="hud-val">{String(score).padStart(4, "0")}</span>
        </div>
        <div className="race-lives">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`life-pip${i >= lives ? " dead" : ""}`} />
          ))}
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="hud-label">Combo</span>
          <span className="hud-val">x{combo}</span>
        </div>
      </div>

      {cells.map(({ x, y }) => {
        const isTarget = target && target.x === x && target.y === y;
        return (
          <div
            key={`${x}-${y}`}
            className="hack-cell"
            style={{ left: x * cell + gap, top: y * cell + gap, width: cell - gap * 2, height: cell - gap * 2 }}
            onClick={() => handleCellTap(x, y)}
          >
            {isTarget && (
              <svg viewBox="0 0 36 36" className="hack-ring">
                <circle cx="18" cy="18" r="15.5" className="hack-ring-bg" />
                <circle
                  key={target.id}
                  cx="18"
                  cy="18"
                  r="15.5"
                  className={`hack-ring-fg${flash === "hit" ? " is-hit" : flash === "miss" ? " is-miss" : ""}`}
                  style={{ animationDuration: `${target.duration}ms` }}
                />
              </svg>
            )}
          </div>
        );
      })}

      <AnimatePresence>
        {popup && (
          <motion.div
            key={popup.id}
            className="hack-combo-pop"
            style={{ left: popup.x * cell + cell / 2, top: popup.y * cell + gap, color: popup.color }}
            initial={{ opacity: 0, y: 0, x: "-50%" }}
            animate={{ opacity: 1, y: -14 }}
            exit={{ opacity: 0, y: -26 }}
            transition={{ duration: 0.45 }}
          >
            {popup.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "idle" && (
          <motion.div className="game-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}>
              <IconTarget size={28} color="#00f5ff" />
            </motion.div>
            <div className="overlay-title" style={{ color: "#00f5ff" }}>Grid Hack</div>
            <div className="overlay-sub">Tap the glowing node before it fades</div>
            <motion.button className="overlay-btn" onClick={startGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Start Hacking
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "gameover" && (
          <motion.div
            className="game-overlay"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <motion.div animate={{ rotate: [0, -10, 10, -8, 8, 0] }} transition={{ duration: 0.6, delay: 0.1 }}>
              <IconLock size={28} color="#ff006e" />
            </motion.div>
            <div className="overlay-title" style={{ color: "#ff006e" }}>Connection Lost</div>
            <div>
              <div className="hud-label" style={{ textAlign: "center", marginBottom: 4 }}>Score</div>
              <div className="overlay-score">{String(score).padStart(4, "0")}</div>
            </div>
            <div className="overlay-sub">
              Max Combo x{maxCombo}
              {best > 0 ? ` · Best ${String(Math.max(best, score)).padStart(4, "0")}` : ""}
            </div>
            <motion.button className="overlay-btn" onClick={startGame} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE LOADER — mode select + playable games
═══════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   PAGE LOADER — mode select + playable games
   (Only the header block and export signature changed
   from the original — all game components above this
   point in your real file are UNCHANGED. Paste this
   section in place of your existing `export default
   function PageLoader...` block.)
═══════════════════════════════════════════════ */
export default function PageLoader({ isOffline = false, forceError = false, onRetry = null }) {
  const [frameRef, size] = useFrameSize();
  const [activeGame, setActiveGame] = useState(null); // null | 'race' | 'snake' | 'hack'
  const [logoError, setLogoError] = useState(false);
  const reduceMotion = useReducedMotion();

  const statusText = forceError
    ? "Something Went Wrong"
    : isOffline
    ? "Offline — Reconnecting"
    : "Loading…";

  return (
    <AnimatePresence>
      <motion.div
        key="page-loader"
        className="pl-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        role="status"
        aria-label="Loading"
      >
        <style>{ALL_CSS}</style>

        <div className="pl-topline" />
        <div className="pl-orb1" />
        <div className="pl-orb2" />
        <div className="pl-corner pl-lc-tl" />
        <div className="pl-corner pl-lc-tr" />
        <div className="pl-corner pl-lc-bl" />
        <div className="pl-corner pl-lc-br" />

        <div className="pl-frame-wrap">
          <motion.div
            className="game-frame"
            ref={frameRef}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 20 }}
          >
            {activeGame && !forceError && (
              <button className="back-btn" onClick={() => setActiveGame(null)} aria-label="Choose a different game">
                ←
              </button>
            )}

            <AnimatePresence mode="wait">
  <motion.div
    key={forceError ? "error" : activeGame || "menu"}
    style={{ position: "absolute", inset: 0 }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.18 }}
  >
    {!activeGame && (
      <>
        <motion.div
          style={{
            textAlign: "center",
            position: "relative",
            zIndex: 7,
            padding: "30px 12px",
          }}
          initial={{ y: reduceMotion ? 0 : -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 260,
            damping: 22,
          }}
        >
          <div className="pl-hex">
            {logoError ? (
              "D"
            ) : (
              <img
                src="/logo.png"
                alt="DQD Logo"
                className="ar-logo-img"
                onError={() => setLogoError(true)}
              />
            )}
          </div>

          <div className={`pl-status${isOffline || forceError ? " is-offline" : ""}`}>
            {statusText}
          </div>

          <div className="pl-sub">
            {forceError ? "We couldn't load this page" : "Pick a game while you wait"}
          </div>

          {forceError && onRetry && (
            <motion.button
              className="overlay-btn"
              style={{ marginTop: 14 }}
              onClick={onRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retry
            </motion.button>
          )}
        </motion.div>

        {!forceError && (
          <motion.div
            className="mode-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mode-eyebrow">Choose your game</div>

            <motion.div
              className="mode-card"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.03, borderColor: "rgba(192,132,252,0.7)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveGame("race")}
            >
              <div className="mode-icon" style={{ color: "#c084fc" }}>
                <IconCar size={20} />
              </div>
              <div className="mode-text">
                <strong>Turbo Race</strong>
                <span>Dodge traffic across 3 lanes</span>
              </div>
            </motion.div>

            <motion.div
              className="mode-card"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.18 }}
              whileHover={{ scale: 1.03, borderColor: "rgba(57,255,20,0.7)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveGame("snake")}
            >
              <div className="mode-icon" style={{ color: "#39ff14" }}>
                <IconSnake size={20} />
              </div>
              <div className="mode-text">
                <strong>Neon Snake</strong>
                <span>Classic grid, glowing orbs</span>
              </div>
            </motion.div>

            <motion.div
              className="mode-card"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.26 }}
              whileHover={{ scale: 1.03, borderColor: "rgba(0,245,255,0.7)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveGame("hack")}
            >
              <div className="mode-icon" style={{ color: "#00f5ff" }}>
                <IconTarget size={20} />
              </div>
              <div className="mode-text">
                <strong>Grid Hack</strong>
                <span>Chase combo multipliers, beat your best</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </>
    )}

    {activeGame === "race" && !forceError && <RacingGame size={size} />}
    {activeGame === "snake" && !forceError && <SnakeGame size={size} />}
    {activeGame === "hack" && !forceError && <HackGame size={size} />}
  </motion.div>
</AnimatePresence>
          </motion.div>
        </div>

        {!forceError && (
          <div className="key-hints">
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 8, color: "rgba(185,194,217,0.35)", letterSpacing: 2 }}>
              ARROW KEYS ON PC · SWIPE OR TAP ON MOBILE
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}



