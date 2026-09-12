import { useState, useEffect, useRef, useCallback, Component } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:      "#03030d",
  card:    "#06061a",
  panel:   "#09091f",
  cyan:    "#00f0ff",
  pink:    "#ff2070",
  yellow:  "#ffe040",
  gold:    "#ffb800",
  purple:  "#8b30ff",
  violet:  "#b060ff",
  green:   "#00ffaa",
  red:     "#ff3b3b",
  text:    "#e8e8ff",
  muted:   "#4a4a7a",
  dim:     "#12122a",
  bdr:     "rgba(0,240,255,0.10)",
  pbdr:    "rgba(139,48,255,0.22)",
};

const SEG_COLORS = [
  "#00f0ff", "#8b30ff", "#ffe040", "#ff2070",
  "#00ffaa", "#b060ff", "#ffb800", "#ff6030",
  "#40c0ff", "#ff40a0", "#60ff80", "#c080ff",
];

const WHEEL_PX        = 340;
const SPIN_MS         = 5800;
const STYLE_ID        = "dqs4-sty";

// Vibranium rim — outer studded ring that frames the wheel
const RING_DIFF        = 64;                       // desktop: how much wider the rim is than the wheel
const RING_PX          = WHEEL_PX + RING_DIFF;       // 404
const MOBILE_WHEEL_PX  = 260;
const MOBILE_RING_PX   = MOBILE_WHEEL_PX + 40;       // 300 — thinner rim on small screens to save space

// Rim chase-lights
const BULB_COUNT      = 24;
const BULB_RADIUS_PCT = 46;   // % offset from rim centre — lands the bulbs mid-band
const CHASE_DUR       = 1.8;  // seconds for one full lap when spinning
const BULB_PALETTE    = [T.gold, T.gold, T.gold, T.cyan, T.gold, T.gold, T.pink];

const BULB_POSITIONS = Array.from({ length: BULB_COUNT }, (_, i) => {
  const angle = (360 / BULB_COUNT) * i - 90; // start at 12 o'clock
  const rad   = (angle * Math.PI) / 180;
  return {
    x: 50 + BULB_RADIUS_PCT * Math.cos(rad),
    y: 50 + BULB_RADIUS_PCT * Math.sin(rad),
    color: BULB_PALETTE[i % BULB_PALETTE.length],
    chaseDelay: -((i / BULB_COUNT) * CHASE_DUR),
    idleDelay: (i * 0.17) % 3.2,
    idleDur: 1.6 + (i % 5) * 0.3,
  };
});

const SPARKLE_POINTS = [
  { x: 16, y: 12 }, { x: 88, y: 18 }, { x: 84, y: 88 }, { x: 10, y: 80 },
];

// ─── CSS Injection ─────────────────────────────────────────────────────────────
function inject() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;}

    @keyframes dqs4-scan {
      0%   { top:-2px; opacity:0; }
      5%   { opacity:1; }
      95%  { opacity:.7; }
      100% { top:100%; opacity:0; }
    }
    @keyframes dqs4-pulse-ring {
      0%,100% { box-shadow:0 0 0 0 rgba(0,240,255,.4); }
      55%     { box-shadow:0 0 0 18px rgba(0,240,255,0); }
    }
    @keyframes dqs4-shimmer {
      0%  { background-position:200% 0; }
      100%{ background-position:-200% 0; }
    }
    @keyframes dqs4-hub-win {
      0%   { box-shadow:0 0 0 0 rgba(255,224,64,.7),0 0 30px rgba(255,224,64,.2); }
      50%  { box-shadow:0 0 0 28px rgba(255,224,64,0),0 0 60px rgba(255,224,64,.5); }
      100% { box-shadow:0 0 0 0 rgba(255,224,64,0),0 0 20px rgba(255,224,64,.15); }
    }
    @keyframes dqs4-blink { 0%,100%{opacity:1} 50%{opacity:.08} }
    @keyframes dqs4-float {
      0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)}
    }
    @keyframes dqs4-badge-pop {
      0%,100%{filter:brightness(1) saturate(1) drop-shadow(0 0 0 transparent)}
      50%{filter:brightness(2.5) saturate(2) drop-shadow(0 0 12px currentColor)}
    }
    @keyframes dqs4-wheel-glow {
      0%,100%{filter:drop-shadow(0 0 10px rgba(0,240,255,.4)) drop-shadow(0 0 30px rgba(139,48,255,.2))}
      50%{filter:drop-shadow(0 0 28px rgba(0,240,255,.8)) drop-shadow(0 0 50px rgba(139,48,255,.5))}
    }
    @keyframes dqs4-result-glow {
      0%,100%{box-shadow:0 0 20px rgba(255,224,64,.1),inset 0 0 20px rgba(255,224,64,.04)}
      50%{box-shadow:0 0 40px rgba(255,224,64,.25),inset 0 0 40px rgba(255,224,64,.08)}
    }
    @keyframes dqs4-orbit-1 { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
    @keyframes dqs4-orbit-2 { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(-360deg)} }
    @keyframes dqs4-stars {
      0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.8;transform:scale(1.2)}
    }
    @keyframes dqs4-lock-float {
      0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-4px) scale(1.03)}
    }
    @keyframes dqs4-ptr-bounce {
      0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-3px)}
    }
    @keyframes dqs4-name-scroll {
      0%{transform:translateY(0)} 100%{transform:translateY(-50%)}
    }
    @keyframes dqs4-confetti-fall {
      0%{transform:translateY(-10px) rotate(0deg);opacity:1}
      100%{transform:translateY(80px) rotate(720deg);opacity:0}
    }
    @keyframes dqs4-bulb-idle {
      0%,100% { opacity:.3; box-shadow:0 0 3px currentColor; }
      50%     { opacity:1;  box-shadow:0 0 9px currentColor,0 0 16px currentColor; }
    }
    @keyframes dqs4-bulb-chase {
      0%   { opacity:1;   box-shadow:0 0 11px currentColor,0 0 22px currentColor; }
      14%  { opacity:.18; box-shadow:0 0 3px currentColor; }
      100% { opacity:.18; box-shadow:0 0 3px currentColor; }
    }
    @keyframes dqs4-sparkle-twinkle {
      0%,100% { opacity:.2; transform:translate(-50%,-50%) scale(.6) rotate(0deg); }
      50%     { opacity:1;  transform:translate(-50%,-50%) scale(1.2) rotate(30deg); }
    }

    .dqs4-root {
      width:100%; max-width:560px; margin:0 auto;
      font-family:'Space Mono',monospace;
    }

    /* Heading */
    .dqs4-head {
      display:flex; align-items:center; gap:12px;
      font-family:'Orbitron',sans-serif;
      font-size:clamp(.72rem,2vw,.88rem); font-weight:900;
      color:${T.cyan}; letter-spacing:4px; text-transform:uppercase;
      margin-bottom:20px;
    }
    .dqs4-head-line { flex:1; height:1px; background:linear-gradient(90deg,${T.cyan}50,transparent); }
    .dqs4-head-badge {
      padding:3px 10px; font-size:.48rem; letter-spacing:2px;
      border:1px solid ${T.cyan}30; color:${T.cyan}60;
      background:${T.cyan}08;
    }

    /* Card */
    .dqs4-card {
      position:relative; overflow:hidden;
      background:linear-gradient(160deg,${T.card} 0%,${T.bg} 60%,#04041a 100%);
      border:1px solid ${T.pbdr};
      box-shadow:0 0 80px rgba(139,48,255,.08), 0 0 0 1px rgba(0,240,255,.04);
    }
    .dqs4-card::before {
      content:''; position:absolute; top:0; left:0; right:0; height:2px; z-index:3;
      background:linear-gradient(90deg,${T.purple},${T.cyan} 40%,${T.pink} 70%,${T.gold});
    }
    .dqs4-card::after {
      content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
      background:radial-gradient(ellipse at 50% -20%,rgba(139,48,255,.08) 0%,transparent 60%);
    }

    /* Star particles background */
    .dqs4-stars-bg {
      position:absolute; inset:0; pointer-events:none; z-index:1; overflow:hidden;
    }
    .dqs4-star {
      position:absolute; width:2px; height:2px; border-radius:50%;
      background:white; animation:dqs4-stars var(--dur,3s) ease-in-out infinite;
      animation-delay:var(--delay,0s);
    }

    /* Wheel area */
    .dqs4-wheel-wrap {
      position:relative; display:flex; flex-direction:column;
      align-items:center; padding:28px 24px 18px;
      z-index:2;
    }

    /* Stage — outer-most container, sized to fit the vibranium rim */
    .dqs4-stage {
      position:relative;
      width:${RING_PX}px; height:${RING_PX}px;
      flex-shrink:0; cursor:default;
    }
    @media(max-width:420px){
      .dqs4-stage{width:${MOBILE_RING_PX}px;height:${MOBILE_RING_PX}px;}
    }

    /* Disc — the wheel itself, centred inside the rim */
    .dqs4-disc {
      position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
      width:${WHEEL_PX}px; height:${WHEEL_PX}px;
    }
    @media(max-width:420px){
      .dqs4-disc{width:${MOBILE_WHEEL_PX}px;height:${MOBILE_WHEEL_PX}px;}
    }

    /* Vibranium rim — brushed metal band studded with chase lights */
    .dqs4-rim {
      position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
      width:${RING_PX}px; height:${RING_PX}px; border-radius:50%;
      background:
        repeating-conic-gradient(from 0deg,
          #cfcfef 0deg 3deg, #5d5d8a 3deg 9deg,
          #9d9dc8 9deg 12deg, #26263f 12deg 18deg);
      box-shadow:
        inset 0 0 0 4px rgba(0,0,0,.55),
        inset 0 0 26px rgba(0,0,0,.65),
        0 0 50px rgba(139,48,255,.3),
        0 0 0 1px rgba(0,240,255,.08);
    }
    @media(max-width:420px){
      .dqs4-rim{width:${MOBILE_RING_PX}px;height:${MOBILE_RING_PX}px;}
    }
    .dqs4-rim::before {
      content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
      width:${WHEEL_PX + 10}px; height:${WHEEL_PX + 10}px; border-radius:50%;
      background:${T.bg};
      box-shadow:inset 0 0 26px rgba(0,0,0,.85), 0 0 0 2px rgba(0,0,0,.5);
    }
    @media(max-width:420px){
      .dqs4-rim::before{width:${MOBILE_WHEEL_PX + 10}px;height:${MOBILE_WHEEL_PX + 10}px;}
    }

    .dqs4-bulb-layer { position:absolute; inset:0; z-index:2; }
    .dqs4-bulb {
      position:absolute; width:8px; height:8px; margin:-4px 0 0 -4px;
      border-radius:50%; background:currentColor;
    }
    .dqs4-bulb.idle  { animation:dqs4-bulb-idle var(--idur,2s) ease-in-out infinite; }
    .dqs4-bulb.chase { animation:dqs4-bulb-chase ${CHASE_DUR}s linear infinite; }

    .dqs4-sparkle-layer { position:absolute; inset:0; z-index:3; pointer-events:none; }
    .dqs4-rim-sparkle {
      position:absolute; transform:translate(-50%,-50%);
      animation:dqs4-sparkle-twinkle 2.6s ease-in-out infinite;
    }

    /* Glass dome sheen over the wheel face */
    .dqs4-glass-sheen {
      position:absolute; inset:0; border-radius:50%; pointer-events:none; z-index:6;
      background:
        radial-gradient(circle at 30% 22%, rgba(255,255,255,.4) 0%, rgba(255,255,255,.08) 16%, transparent 42%),
        linear-gradient(135deg, rgba(255,255,255,.05) 0%, transparent 55%);
      mix-blend-mode:soft-light;
    }

    /* Pointer */
    .dqs4-ptr {
      position:absolute; top:-30px; left:50%;
      transform:translateX(-50%);
      z-index:12; display:flex; flex-direction:column; align-items:center;
      animation:dqs4-ptr-bounce .9s ease-in-out infinite;
    }
    .dqs4-ptr-gem-wrap {
      display:flex;
      filter:drop-shadow(0 0 10px ${T.cyan}aa) drop-shadow(0 0 20px ${T.pink}66);
    }
    .dqs4-ptr-line {
      width:2px; height:14px;
      background:linear-gradient(${T.cyan}aa,transparent);
    }

    /* Hub — glowing gem orb at the centre */
    .dqs4-hub {
      position:absolute; top:50%; left:50%; z-index:11;
      transform:translate(-50%,-50%);
      width:72px; height:72px; border-radius:50%;
      background:radial-gradient(circle at 32% 26%, #ffffff 0%, ${T.cyan}cc 10%, #1a1a4a 44%, ${T.bg} 80%);
      border:2px solid ${T.cyan}55;
      box-shadow:
        0 0 0 6px ${T.bg}, 0 0 0 7px ${T.cyan}20,
        0 0 30px ${T.cyan}35,
        inset 0 -7px 16px rgba(0,0,0,.55),
        inset 0 5px 10px rgba(255,255,255,.14);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:2px; transition:all .5s ease; overflow:hidden;
    }
    .dqs4-hub::before {
      content:''; position:absolute; inset:-14px; border-radius:50%;
      border:1px solid ${T.purple}30; animation:dqs4-orbit-2 13s linear infinite;
    }
    .dqs4-hub::after {
      content:''; position:absolute; inset:-8px; border-radius:50%;
      border:1px dashed ${T.cyan}30; animation:dqs4-orbit-1 8s linear infinite;
    }
    .dqs4-hub.won {
      border-color:${T.yellow}aa;
      background:radial-gradient(circle at 32% 26%, #ffffff 0%, ${T.yellow}dd 12%, #3a2a00 46%, ${T.bg} 80%);
      box-shadow:
        0 0 0 6px ${T.bg}, 0 0 0 7px ${T.yellow}35,
        0 0 40px ${T.yellow}55,
        inset 0 -7px 16px rgba(0,0,0,.55),
        inset 0 5px 10px rgba(255,255,255,.2);
      animation:dqs4-hub-win 1s ease 2;
    }
    .dqs4-hub.won::before { border-color:${T.yellow}40; }
    .dqs4-hub.won::after  { border-color:${T.yellow}55; }
    .dqs4-hub-text {
      font-family:'Orbitron',sans-serif; font-weight:900;
      font-size:.38rem; color:#eafcff; letter-spacing:1.5px;
      text-align:center; line-height:1.4; transition:color .4s;
      text-shadow:0 1px 3px rgba(0,0,0,.7);
      position:relative; z-index:2;
    }
    .dqs4-hub.won .dqs4-hub-text { color:#3a2a00; }

    /* Glow aura */
    .dqs4-aura {
      position:absolute; inset:-10px; border-radius:50%; pointer-events:none;
      transition:all .5s ease;
      box-shadow:0 0 50px rgba(139,48,255,.12);
    }
    .dqs4-aura.spinning {
      animation:dqs4-wheel-glow 1.2s ease-in-out infinite;
    }
    .dqs4-aura.won {
      box-shadow:0 0 80px rgba(255,224,64,.3), 0 0 40px rgba(255,184,0,.2);
    }

    /* Spin button */
    .dqs4-btn-wrap { margin-top:20px; position:relative; }
    .dqs4-btn {
      position:relative; overflow:hidden;
      width:240px; padding:15px 0;
      border:none; outline:none; cursor:pointer;
      font-family:'Orbitron',sans-serif; font-weight:900;
      font-size:.65rem; letter-spacing:4px; text-transform:uppercase; color:#fff;
      background:linear-gradient(135deg,${T.purple} 0%,${T.pink} 50%,${T.gold} 100%);
      background-size:200% 100%;
      clip-path:polygon(14px 0%,100% 0%,calc(100% - 14px) 100%,0% 100%);
      box-shadow:0 8px 40px rgba(255,32,112,.3), 0 0 0 1px rgba(255,255,255,.06);
      display:flex; align-items:center; justify-content:center; gap:10px;
      transition:background-position .4s, opacity .2s, transform .1s;
    }
    .dqs4-btn:hover:not(:disabled){ background-position:100% 0; }
    .dqs4-btn::before {
      content:''; position:absolute; inset:0;
      background:linear-gradient(105deg,transparent 25%,rgba(255,255,255,.25) 50%,transparent 75%);
      transform:translateX(-150%); transition:transform .6s ease;
    }
    .dqs4-btn:hover:not(:disabled)::before{ transform:translateX(250%); }
    .dqs4-btn:disabled{ opacity:.3; cursor:not-allowed; }
    .dqs4-btn:focus-visible{ outline:2px solid ${T.cyan}; outline-offset:4px; }
    .dqs4-btn-glow {
      position:absolute; inset:-1px; z-index:-1;
      background:linear-gradient(135deg,${T.purple},${T.pink},${T.gold});
      clip-path:polygon(14px 0%,100% 0%,calc(100% - 14px) 100%,0% 100%);
      filter:blur(12px); opacity:0; transition:opacity .3s;
    }
    .dqs4-btn-wrap:hover .dqs4-btn-glow { opacity:.6; }

    /* Prize name scroll strip */
    .dqs4-prize-strip {
      width:100%; overflow:hidden;
      background:linear-gradient(90deg,transparent,${T.dim} 10%,${T.dim} 90%,transparent);
      border-top:1px solid ${T.pbdr}; border-bottom:1px solid ${T.pbdr};
      padding:8px 0; margin-top:16px; position:relative;
    }
    .dqs4-prize-strip::before,.dqs4-prize-strip::after {
      content:''; position:absolute; top:0; bottom:0; width:60px; z-index:2; pointer-events:none;
    }
    .dqs4-prize-strip::before{ left:0; background:linear-gradient(90deg,${T.card},transparent); }
    .dqs4-prize-strip::after{ right:0; background:linear-gradient(-90deg,${T.card},transparent); }
    .dqs4-prize-track {
      display:flex; gap:0; width:max-content;
      animation:marquee 22s linear infinite;
    }
    @keyframes marquee {
      0%{transform:translateX(0)} 100%{transform:translateX(-50%)}
    }
    .dqs4-prize-item {
      display:inline-flex; align-items:center; gap:7px;
      padding:0 22px; white-space:nowrap;
      font-size:.55rem; letter-spacing:1px; text-transform:uppercase;
      transition:color .2s;
    }
    .dqs4-prize-dot {
      width:6px; height:6px; border-radius:50%; flex-shrink:0;
    }

    /* Badges row */
    .dqs4-badges {
      display:flex; flex-wrap:wrap; justify-content:center;
      gap:5px; padding:10px 20px 0;
    }
    .dqs4-badge {
      display:inline-flex; align-items:center; gap:5px;
      padding:5px 12px; border:1px solid; font-size:.52rem;
      letter-spacing:.8px; text-transform:uppercase; cursor:default;
      transition:all .2s;
    }
    .dqs4-badge.won { animation:dqs4-badge-pop .8s ease 4; }

    /* Result panel */
    .dqs4-result {
      margin:14px 24px 0;
      padding:14px 20px;
      border:1px solid rgba(255,224,64,.25);
      background:linear-gradient(135deg,rgba(255,224,64,.07) 0%,rgba(255,184,0,.03) 100%);
      position:relative; overflow:hidden;
      animation:dqs4-result-glow 2s ease infinite;
      display:flex; align-items:center; gap:16px;
    }
    .dqs4-result-scan {
      position:absolute; left:0; right:0; height:1px; pointer-events:none;
      background:linear-gradient(90deg,transparent,rgba(255,224,64,.5),transparent);
      animation:dqs4-scan 2.2s linear 4;
    }
    .dqs4-result-icon {
      width:50px; height:50px; border-radius:50%; flex-shrink:0;
      background:radial-gradient(circle,rgba(255,224,64,.18),transparent 70%);
      border:1px solid rgba(255,224,64,.35);
      display:flex; align-items:center; justify-content:center;
      font-size:1.4rem;
    }
    .dqs4-result-label { font-size:.48rem; color:${T.muted}; letter-spacing:2.5px; text-transform:uppercase; }
    .dqs4-result-value {
      font-family:'Orbitron',sans-serif; font-size:1rem; font-weight:900;
      color:${T.yellow}; letter-spacing:.5px; margin-top:6px;
    }

    /* Divider */
    .dqs4-rule {
      height:1px; margin:16px 0 0;
      background:linear-gradient(90deg,transparent,${T.pbdr} 30%,${T.pbdr} 70%,transparent);
    }

    /* History */
    .dqs4-hist-hd {
      padding:12px 24px 10px;
      display:flex; align-items:center; gap:10px;
      font-size:.5rem; color:${T.muted}; letter-spacing:3px; text-transform:uppercase;
    }
    .dqs4-hist-line { flex:1; height:1px; background:${T.bdr}; }
    .dqs4-hist-rows { display:flex; flex-direction:column; }
    .dqs4-hist-row {
      display:flex; align-items:center; justify-content:space-between;
      padding:8px 24px; border-bottom:1px solid ${T.pbdr}20;
      transition:background .15s;
    }
    .dqs4-hist-row:hover { background:rgba(0,240,255,.025); }
    .dqs4-hist-date { font-size:.55rem; color:${T.muted}; display:flex; align-items:center; gap:6px; }
    .dqs4-hist-prize { font-size:.6rem; color:${T.cyan}; letter-spacing:.5px; }
    .dqs4-hist-empty {
      padding:24px; text-align:center;
      font-size:.58rem; color:${T.muted}; letter-spacing:2px;
    }

    /* Locked overlay */
    .dqs4-locked {
      position:absolute; inset:0; z-index:40;
      background:rgba(3,3,13,.94); backdrop-filter:blur(20px);
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      gap:18px; padding:40px 28px; text-align:center;
    }
    .dqs4-locked::before {
      content:''; position:absolute; top:0; left:0; right:0; height:2px;
      background:linear-gradient(90deg,${T.purple},${T.cyan} 40%,${T.pink} 70%,${T.gold});
    }
    .dqs4-locked-scan {
      position:absolute; left:0; right:0; height:1px; pointer-events:none;
      background:linear-gradient(90deg,transparent,${T.cyan}25,transparent);
      animation:dqs4-scan 6s linear infinite;
    }
    .dqs4-lock-orb {
      width:90px; height:90px; border-radius:50%;
      background:radial-gradient(circle,rgba(139,48,255,.22) 0%,transparent 70%);
      border:1px solid rgba(139,48,255,.3);
      box-shadow:0 0 50px rgba(139,48,255,.2);
      display:flex; align-items:center; justify-content:center;
      animation:dqs4-lock-float 3s ease-in-out infinite;
    }
    .dqs4-lock-title {
      font-family:'Orbitron',sans-serif; font-size:clamp(.78rem,3vw,1rem);
      font-weight:900; color:${T.text}; letter-spacing:4px; text-transform:uppercase;
    }
    .dqs4-lock-sub { font-size:.56rem; color:${T.muted}; letter-spacing:1.5px; }
    .dqs4-last-win {
      display:flex; align-items:center; gap:8px; padding:7px 20px;
      background:rgba(255,224,64,.06); border:1px solid rgba(255,224,64,.2);
      font-size:.58rem; color:${T.yellow}; letter-spacing:1px;
    }

    /* Countdown */
    .dqs4-cd { display:flex; align-items:flex-start; gap:0; }
    .dqs4-cd-unit { display:flex; flex-direction:column; align-items:center; min-width:56px; gap:5px; }
    .dqs4-cd-num {
      font-family:'Orbitron',sans-serif; font-size:clamp(1.8rem,6vw,2.6rem);
      font-weight:900; color:${T.cyan}; line-height:1;
      text-shadow:0 0 30px ${T.cyan}70, 0 0 60px ${T.cyan}30;
    }
    .dqs4-cd-label { font-size:.36rem; color:${T.muted}; letter-spacing:3px; text-transform:uppercase; }
    .dqs4-cd-sep {
      font-family:'Orbitron',sans-serif; font-size:2.2rem; font-weight:900;
      color:rgba(139,48,255,.45); padding:0 2px; line-height:1; margin-top:2px;
    }
    .dqs4-unlock-note {
      display:flex; align-items:center; gap:8px;
      font-size:.5rem; color:${T.cyan}40; letter-spacing:2px; text-transform:uppercase;
    }
    .dqs4-blink {
      width:6px; height:6px; border-radius:50%;
      background:${T.cyan}; box-shadow:0 0 6px ${T.cyan};
      animation:dqs4-blink 1.4s ease infinite;
    }

    /* Skeleton */
    .dqs4-skel {
      background:linear-gradient(90deg,${T.card} 25%,${T.panel} 50%,${T.card} 75%);
      background-size:200% 100%; animation:dqs4-shimmer 1.8s infinite;
      border:1px solid ${T.pbdr};
    }

    /* Confetti */
    .dqs4-confetti-piece {
      position:absolute; width:6px; height:6px; pointer-events:none; z-index:20;
      animation:dqs4-confetti-fall var(--dur,0.8s) ease-out forwards;
    }
  `;
  document.head.appendChild(s);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, "0"); }
function fmtDate(d) {
  if (!d) return "--";
  const dt = new Date(d);
  return isNaN(dt) ? String(d) : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}
function rewardName(r) {
  if (!r) return "—";
  if (r.reward_type === "points")      return `${r.reward_points} Points`;
  if (r.reward_type === "better_luck") return "Better Luck Next Time";
  return r.reward_name || "Reward";
}
function histName(h) {
  if (h?.reward?.reward_name) return rewardName(h.reward);
  return h?.reward_name || h?.prize || "Reward";
}
function sliceLabel(r) {
  if (!r) return "—";
  if (r.reward_type === "points")      return `${r.reward_points}`;
  if (r.reward_type === "better_luck") return "LUCK";
  return r.reward_name || "";
}
function msUntilMonday() {
  const now = new Date();
  const days = now.getDay() === 0 ? 1 : 8 - now.getDay();
  const next = new Date(now);
  next.setDate(now.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return Math.max(0, next - now);
}
function breakMs(ms) {
  const t = Math.floor(ms / 1000);
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}
function sliceFromRot(deg, n) {
  const norm = (360 - (deg % 360) + 360) % 360;
  return Math.floor(norm / (360 / n)) % n;
}

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(active) {
  const [ms, setMs] = useState(msUntilMonday);
  useEffect(() => {
    if (!active) return;
    setMs(msUntilMonday());
    const id = setInterval(() => setMs(msUntilMonday()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return breakMs(ms);
}

// ─── Canvas wheel draw (with multi-line labels) ───────────────────────────────
function drawWheel(canvas, rewards, highlightIdx = -1) {
  if (!canvas || !rewards?.length) return;
  const dpr  = window.devicePixelRatio || 1;
  const size = canvas.offsetWidth || WHEEL_PX;
  if (canvas.width !== size * dpr) {
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;
  }
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);

  const cx = size / 2, cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = size * 0.095;
  const n  = rewards.length;
  const sa = (2 * Math.PI) / n;

  ctx.clearRect(0, 0, size, size);

  rewards.forEach((r, i) => {
    const color  = SEG_COLORS[i % SEG_COLORS.length];
    const isHi   = highlightIdx === i;
    const startA = i * sa - Math.PI / 2;
    const endA   = startA + sa;
    const midA   = startA + sa / 2;

    // Segment fill with radial gradient
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, startA, endA);
    ctx.closePath();
    const g = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
    g.addColorStop(0,    "#07071c");
    g.addColorStop(0.55, i % 2 === 0 ? "#07071a" : "#09092a");
    g.addColorStop(0.88, `${color}18`);
    g.addColorStop(1,    isHi ? `${color}55` : `${color}28`);
    ctx.fillStyle = g;
    ctx.fill();

    // Outer neon arc
    ctx.beginPath();
    ctx.arc(cx, cy, outerR - 1.5, startA + 0.018, endA - 0.018);
    ctx.strokeStyle = color;
    ctx.lineWidth   = isHi ? 7 : 4;
    ctx.globalAlpha = isHi ? 1 : 0.85;
    ctx.stroke();

    // Second inner arc echo
    ctx.beginPath();
    ctx.arc(cx, cy, outerR - 11, startA + 0.035, endA - 0.035);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1;
    ctx.globalAlpha = 0.22;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Divider line
    ctx.beginPath();
    ctx.moveTo(cx + innerR * Math.cos(startA), cy + innerR * Math.sin(startA));
    ctx.lineTo(cx + outerR * Math.cos(startA), cy + outerR * Math.sin(startA));
    ctx.strokeStyle = "rgba(0,0,0,.8)";
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Label — landscape/radial orientation, full reward name, auto-fit
    const label   = rewardName(r);
    // Radial depth available for text
    const textR   = outerR - innerR - 10;
    // Chord width at the mid-radius (constrains line width)
    const midRad  = innerR + textR * 0.5;
    const chordW  = 2 * midRad * Math.sin(sa / 2) * 0.78;

    const labelCx = cx + midRad * Math.cos(midA);
    const labelCy = cy + midRad * Math.sin(midA);

    ctx.save();
    ctx.translate(labelCx, labelCy);
    // Radial (landscape): text runs outward from centre
    ctx.rotate(midA + Math.PI / 2);
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor  = color;
    ctx.shadowBlur   = isHi ? 18 : 8;
    ctx.fillStyle    = color;

    // Pick starting font size based on segment count
    let fs = Math.max(6, Math.floor(size / (n > 10 ? 42 : n > 6 ? 36 : 30)));
    ctx.font = `700 ${fs}px 'Orbitron', sans-serif`;

    // Word-wrap
    const words = label.split(" ");
    let lines = [], cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width <= chordW) { cur = test; }
      else { if (cur) lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    if (lines.length > 3) { lines = lines.slice(0, 3); lines[2] = lines[2].slice(0, 8) + "…"; }

    // Shrink font until all lines fit chord width
    while (fs > 5 && lines.some(ln => ctx.measureText(ln).width > chordW)) {
      fs -= 1;
      ctx.font = `700 ${fs}px 'Orbitron', sans-serif`;
    }

    const lineH  = fs * 1.32;
    const startY = -((lines.length - 1) * lineH) / 2;
    lines.forEach((ln, li) => {
      ctx.fillText(ln, 0, startY + li * lineH);
    });

    ctx.restore();
  });

  // Hub mask circle
  ctx.beginPath();
  ctx.arc(cx, cy, innerR + 2, 0, Math.PI * 2);
  ctx.fillStyle = "#03030d";
  ctx.fill();
  ctx.restore();
}

// ─── Confetti burst ───────────────────────────────────────────────────────────
function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    color: SEG_COLORS[i % SEG_COLORS.length],
    x: (Math.random() - 0.5) * 300,
    y: -20 - Math.random() * 40,
    rot: Math.random() * 360,
    size: 4 + Math.random() * 6,
    dur: 0.6 + Math.random() * 0.7,
    delay: Math.random() * 0.4,
    shape: Math.random() > 0.5 ? "circle" : "square",
  }));
  return (
    <div style={{ position:"absolute", top:"50%", left:"50%", pointerEvents:"none", zIndex:25 }} aria-hidden="true">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="dqs4-confetti-piece"
          style={{
            "--dur": `${p.dur}s`,
            left: p.x, top: p.y,
            width: p.size, height: p.size,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            background: p.color,
            boxShadow: `0 0 ${p.size}px ${p.color}`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Star particles bg ────────────────────────────────────────────────────────
function StarsBg() {
  const stars = Array.from({ length: 28 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    dur: 2 + Math.random() * 4,
    delay: Math.random() * 4,
    size: Math.random() > 0.8 ? 2 : 1,
  }));
  return (
    <div className="dqs4-stars-bg" aria-hidden="true">
      {stars.map((s, i) => (
        <div
          key={i} className="dqs4-star"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            "--dur": `${s.dur}s`, "--delay": `${s.delay}s`,
            width: s.size, height: s.size,
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Trophy:  () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.cyan} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9H4a2 2 0 010-4h2M18 9h2a2 2 0 000-4h-2"/><path d="M6 3h12v10a6 6 0 01-12 0V3z"/><path d="M9 21h6M12 17v4"/></svg>,
  TrophyYellow: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.yellow} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9H4a2 2 0 010-4h2M18 9h2a2 2 0 000-4h-2"/><path d="M6 3h12v10a6 6 0 01-12 0V3z"/><path d="M9 21h6M12 17v4"/></svg>,
  Star:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill={`${T.yellow}40`} stroke={T.yellow} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Lock:    () => <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={T.violet} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1" fill={T.violet} stroke="none"/></svg>,
  Dice:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1" fill="#fff" stroke="none"/><circle cx="15.5" cy="8.5" r="1" fill="#fff" stroke="none"/><circle cx="8.5" cy="15.5" r="1" fill="#fff" stroke="none"/><circle cx="15.5" cy="15.5" r="1" fill="#fff" stroke="none"/><circle cx="12" cy="12" r="1" fill="#fff" stroke="none"/></svg>,
  Spin:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 11-9-9"/><polyline points="21 3 21 9 15 9"/></svg>,
  Clock:   () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  History: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 8 14"/><path d="M2 12h4"/></svg>,
  Spark:   ({ color = T.yellow }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/></svg>,
  WinStar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill={`${T.yellow}55`} stroke={T.yellow} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  PointerGem: () => (
    <svg width="30" height="34" viewBox="0 0 30 34" aria-hidden="true">
      <defs>
        <linearGradient id="dqs4-gem-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={T.cyan} />
          <stop offset="55%"  stopColor={T.violet} />
          <stop offset="100%" stopColor={T.pink} />
        </linearGradient>
      </defs>
      <polygon points="15,2 27,11 21,32 9,32 3,11" fill="url(#dqs4-gem-grad)" stroke="#fff" strokeOpacity=".5" strokeWidth="0.6" />
      <polygon points="15,2 27,11 15,15 3,11" fill="#ffffff" fillOpacity=".22" />
      <polygon points="15,15 27,11 21,32" fill="#000000" fillOpacity=".18" />
      <polygon points="15,15 3,11 9,32" fill="#000000" fillOpacity=".08" />
      <line x1="15" y1="2" x2="15" y2="15" stroke="#ffffff" strokeOpacity=".4" strokeWidth="0.6" />
    </svg>
  ),
};

// ─── Vibranium rim chase-lights ────────────────────────────────────────────────
function RimBulbs({ spinning }) {
  return (
    <div className="dqs4-bulb-layer" aria-hidden="true">
      {BULB_POSITIONS.map((b, i) => (
        <span
          key={i}
          className={`dqs4-bulb${spinning ? " chase" : " idle"}`}
          style={{
            left: `${b.x}%`, top: `${b.y}%`,
            color: b.color,
            animationDelay: spinning ? `${b.chaseDelay}s` : `${b.idleDelay}s`,
            "--idur": `${b.idleDur}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Rim sparkle glints ─────────────────────────────────────────────────────────
function RimSparkles() {
  return (
    <div className="dqs4-sparkle-layer" aria-hidden="true">
      {SPARKLE_POINTS.map((p, i) => (
        <span
          key={i}
          className="dqs4-rim-sparkle"
          style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${i * 0.55}s` }}
        >
          <Ic.Spark color={i % 2 ? T.cyan : "#fff"} />
        </span>
      ))}
    </div>
  );
}

// ─── Error boundary ───────────────────────────────────────────────────────────
class Boundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(e) { return { err: e.message }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{ padding:32, textAlign:"center", border:`1px dashed ${T.pink}40`, color:T.pink, fontFamily:"'Space Mono',monospace", fontSize:".68rem", letterSpacing:"1.5px" }}>
        // RENDER ERROR: {this.state.err} //
      </div>
    );
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardSpinner({ spinner, onSpin, loading = false, error = null }) {
  useEffect(() => { inject(); }, []);

  const rm        = useReducedMotion();
  const canvasRef = useRef(null);
  const rotRef    = useRef(0);

  const [wheelRot,   setWheelRot]   = useState(0);
  const [spinning,   setSpinning]   = useState(false);
  const [result,     setResult]     = useState(null);
  const [confetti,   setConfetti]   = useState(false);
  const [wonIdx,     setWonIdx]     = useState(-1);
  const [spinDone,   setSpinDone]   = useState(false); // tracks if spin happened this session

  const canSpin  = !!spinner?.can_spin && !spinDone;
  const history  = spinner?.spin_history || [];
  const rewards  = spinner?.rewards?.length ? spinner.rewards : [];
  const lastWin  = history[0] ? histName(history[0]) : null;

  const { d, h, m, s } = useCountdown(!canSpin);

  // Draw/redraw wheel
  useEffect(() => {
    if (canvasRef.current && rewards.length) {
      drawWheel(canvasRef.current, rewards, wonIdx);
    }
  }, [rewards, wonIdx]);

  // Spin handler — refreshes page after completion to prevent re-spin
  const handleSpin = useCallback(async () => {
    if (spinning || !canSpin || !rewards.length) return;
    setSpinning(true);
    setResult(null);
    setConfetti(false);
    setWonIdx(-1);

    const apiPromise = onSpin ? onSpin().catch(() => null) : Promise.resolve(null);

    const fullSpins = 9 + Math.floor(Math.random() * 5);
    const sliceDeg  = 360 / rewards.length;
    const target    = Math.floor(Math.random() * rewards.length);
    const jitter    = (Math.random() - 0.5) * sliceDeg * 0.45;
    const addDeg    = fullSpins * 360 + target * sliceDeg + jitter;
    const newTotal  = rotRef.current + addDeg;
    rotRef.current  = newTotal;
    setWheelRot(newTotal);

    setTimeout(async () => {
      const srv = await apiPromise;
      const won = srv?.reward
        ? srv.reward
        : (rewards[sliceFromRot(newTotal, rewards.length)] ?? null);

      const idx = won ? rewards.findIndex(r => r.id === won.id) : sliceFromRot(newTotal, rewards.length);
      setResult(won);
      setWonIdx(idx);
      setSpinning(false);
      setSpinDone(true);   // lock from re-spinning this session
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1800);

      // 🔄 Refresh the page after a short delay so the server state is re-fetched
      // and can_spin correctly becomes false, preventing any second spin.
      setTimeout(() => {
        window.location.reload();
      }, 3500);
    }, SPIN_MS + 200);
  }, [spinning, canSpin, onSpin, rewards]);

  const glowClass = `dqs4-aura${spinning ? " spinning" : result ? " won" : ""}`;

  if (loading) {
    return (
      <div className="dqs4-root">
        <div className="dqs4-skel" style={{ height:580, borderRadius:0 }} />
      </div>
    );
  }

  // Doubled prize strip so marquee is seamless
  const stripItems = [...rewards, ...rewards];

  return (
    <Boundary>
      <div className="dqs4-root">

        {/* Heading */}
        <motion.div
          style={{ display:"flex", alignItems:"center", gap:12, fontFamily:"'Orbitron',sans-serif", fontSize:"clamp(.72rem,2vw,.88rem)", fontWeight:900, color:T.cyan, letterSpacing:"4px", textTransform:"uppercase", marginBottom:20 }}
          initial={rm ? {} : { opacity:0, x:-20 }}
          animate={{ opacity:1, x:0 }}
          transition={{ duration:.4 }}
        >
          <Ic.Trophy />
          Lucky Spin
          <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${T.cyan}50,transparent)` }} />
          <span style={{ padding:"3px 10px", fontSize:".48rem", letterSpacing:"2px", border:`1px solid ${T.cyan}30`, color:`${T.cyan}60`, background:`${T.cyan}08` }}>WEEKLY</span>
        </motion.div>

        {/* Card */}
        <motion.div
          className="dqs4-card"
          initial={rm ? {} : { opacity:0, y:24 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:.5, ease:[0.22,1,0.36,1], delay:.06 }}
        >
          <StarsBg />

          {/* ── LOCKED OVERLAY ── */}
          <AnimatePresence>
            {!canSpin && (
              <motion.div
                className="dqs4-locked"
                initial={rm ? {} : { opacity:0 }}
                animate={{ opacity:1 }}
                exit={rm ? {} : { opacity:0, transition:{ duration:.2 } }}
                transition={{ duration:.35 }}
                aria-label="Spin locked — countdown to reset"
              >
                <div className="dqs4-locked-scan" aria-hidden="true" />

                <div className="dqs4-lock-orb"><Ic.Lock /></div>

                <div className="dqs4-lock-title">Already Spun This Week</div>
                <div className="dqs4-lock-sub">Your spin resets every Monday at midnight</div>

                {lastWin && (
                  <motion.div
                    className="dqs4-last-win"
                    initial={rm ? {} : { opacity:0, scale:.9 }}
                    animate={{ opacity:1, scale:1 }}
                    transition={{ delay:.15 }}
                  >
                    <Ic.Spark /> Last win: {lastWin}
                  </motion.div>
                )}

                {/* Countdown */}
                <motion.div
                  className="dqs4-cd"
                  initial={rm ? {} : { opacity:0, y:14 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:.22 }}
                  role="timer" aria-label="Time until reset"
                >
                  {d > 0 && (
                    <>
                      <div className="dqs4-cd-unit">
                        <AnimatePresence mode="popLayout">
                          <motion.span key={d} className="dqs4-cd-num"
                            initial={rm ? {} : { y:-16, opacity:0 }}
                            animate={{ y:0, opacity:1 }}
                            exit={rm ? {} : { y:16, opacity:0 }}
                            transition={{ duration:.25 }}
                          >{pad(d)}</motion.span>
                        </AnimatePresence>
                        <span className="dqs4-cd-label">days</span>
                      </div>
                      <span className="dqs4-cd-sep">:</span>
                    </>
                  )}
                  {[{v:h,l:"hrs"},{v:m,l:"min"},{v:s,l:"sec"}].map(({v,l},i) => (
                    <span key={l} style={{ display:"contents" }}>
                      {i > 0 && <span className="dqs4-cd-sep">:</span>}
                      <div className="dqs4-cd-unit">
                        <AnimatePresence mode="popLayout">
                          <motion.span key={v} className="dqs4-cd-num"
                            initial={rm ? {} : { y:-12, opacity:0 }}
                            animate={{ y:0, opacity:1 }}
                            exit={rm ? {} : { y:12, opacity:0 }}
                            transition={{ duration:.22 }}
                          >{pad(v)}</motion.span>
                        </AnimatePresence>
                        <span className="dqs4-cd-label">{l}</span>
                      </div>
                    </span>
                  ))}
                </motion.div>

                <div className="dqs4-unlock-note">
                  <span className="dqs4-blink" aria-hidden="true" />
                  Unlocks next Monday
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── WHEEL AREA ── */}
          <div className="dqs4-wheel-wrap">

            {/* Stage */}
            <div className="dqs4-stage">

              {/* Vibranium rim — studded with chase lights + sparkle glints */}
              <div className="dqs4-rim" aria-hidden="true">
                <RimBulbs spinning={spinning} />
                <RimSparkles />
              </div>

              {/* Disc — wheel, pointer, hub */}
              <div className="dqs4-disc">

                {/* Glow aura */}
                <div className={glowClass} aria-hidden="true" />

                {/* Pointer */}
                <div className="dqs4-ptr" aria-hidden="true">
                  <span className="dqs4-ptr-gem-wrap"><Ic.PointerGem /></span>
                  <div className="dqs4-ptr-line" />
                </div>

                {/* Confetti */}
                <Confetti active={confetti} />

                {/* Spinning canvas wrapper */}
                <motion.div
                  style={{ width:"100%", height:"100%", borderRadius:"50%" }}
                  animate={{ rotate: wheelRot }}
                  transition={rm ? { duration:0 } : { duration: SPIN_MS / 1000, ease:[0.08,0,0.04,1] }}
                >
                  <canvas
                    ref={canvasRef}
                    aria-label="Reward wheel"
                    style={{ display:"block", borderRadius:"50%", width:"100%", height:"100%" }}
                  />
                </motion.div>

                {/* Glass dome sheen */}
                <div className="dqs4-glass-sheen" aria-hidden="true" />

                {/* Hub */}
                <div className={`dqs4-hub${result ? " won" : ""}`}>
                  {result
                    ? <Ic.WinStar />
                    : <span className="dqs4-hub-text">DQD<br />SPIN</span>
                  }
                </div>
              </div>
            </div>

            {/* Spin button */}
            <div className="dqs4-btn-wrap">
              <div className="dqs4-btn-glow" aria-hidden="true" />
              <motion.button
                className="dqs4-btn"
                onClick={handleSpin}
                disabled={spinning || !canSpin || !rewards.length}
                whileTap={{ scale:.97 }}
                aria-label={spinning ? "Spinning…" : "Spin the wheel"}
              >
                <AnimatePresence mode="wait">
                  {spinning ? (
                    <motion.span key="sp" style={{ display:"flex", alignItems:"center", gap:9 }}
                      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                      <motion.div animate={{ rotate:360 }} transition={{ duration:.7, repeat:Infinity, ease:"linear" }}>
                        <Ic.Spin />
                      </motion.div>
                      Spinning…
                    </motion.span>
                  ) : (
                    <motion.span key="idle" style={{ display:"flex", alignItems:"center", gap:9 }}
                      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                      <Ic.Dice /> Spin Now
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* ── PRIZE MARQUEE STRIP ── */}
          {rewards.length > 0 && (
            <div className="dqs4-prize-strip">
              <div className="dqs4-prize-track">
                {stripItems.map((r, i) => {
                  const color = SEG_COLORS[i % SEG_COLORS.length];
                  return (
                    <span key={i} className="dqs4-prize-item" style={{ color }}>
                      <span className="dqs4-prize-dot" style={{ background:color, boxShadow:`0 0 5px ${color}` }} />
                      {rewardName(r)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── BADGE GRID ── */}
          {rewards.length > 0 && (
            <div className="dqs4-badges">
              {rewards.map((r, i) => {
                const color = SEG_COLORS[i % SEG_COLORS.length];
                const isWon = wonIdx === i;
                return (
                  <motion.div
                    key={r.id ?? i}
                    className={`dqs4-badge${isWon ? " won" : ""}`}
                    style={{
                      borderColor:`${color}35`,
                      color,
                      background: isWon ? `${color}22` : `${color}09`,
                    }}
                    initial={rm ? {} : { opacity:0, scale:.7 }}
                    animate={{ opacity:1, scale:1 }}
                    transition={{ delay: i * 0.04, duration:.3 }}
                    title={rewardName(r)}
                  >
                    <span style={{ width:5, height:5, borderRadius:"50%", background:color, boxShadow:`0 0 5px ${color}`, flexShrink:0, display:"inline-block" }} />
                    {rewardName(r)}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ── RESULT REVEAL ── */}
          <AnimatePresence>
            {result && (
              <motion.div
                className="dqs4-result"
                initial={rm ? {} : { opacity:0, y:-18, scaleX:.85 }}
                animate={{ opacity:1, y:0, scaleX:1 }}
                exit={{ opacity:0, y:-10 }}
                transition={{ duration:.55, ease:[0.22,1,0.36,1] }}
              >
                <div className="dqs4-result-scan" aria-hidden="true" />
                <div className="dqs4-result-icon"><Ic.TrophyYellow /></div>
                <div>
                  <div className="dqs4-result-label">You Won</div>
                  <motion.div
                    className="dqs4-result-value"
                    initial={rm ? {} : { opacity:0, y:8 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay:.2, duration:.35 }}
                  >
                    {rewardName(result)}
                  </motion.div>
                  <div style={{ fontSize:".48rem", color:T.muted, marginTop:6, letterSpacing:"1.5px" }}>
                    Page refreshing to apply reward…
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="dqs4-rule" />

          {/* ── HISTORY ── */}
          <div className="dqs4-hist-hd">
            <Ic.History />
            Spin History
            <div className="dqs4-hist-line" />
          </div>

          <div className="dqs4-hist-rows">
            {history.length > 0 ? (
              history.slice(0, 5).map((h, i) => (
                <motion.div
                  key={h.id ?? i}
                  className="dqs4-hist-row"
                  initial={rm ? {} : { opacity:0, x:18 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay:.08 + i * .06, duration:.3 }}
                >
                  <span className="dqs4-hist-date">
                    <Ic.Clock />
                    {fmtDate(h.spun_at || h.created_at)}
                  </span>
                  <span className="dqs4-hist-prize">{histName(h)}</span>
                </motion.div>
              ))
            ) : (
              <motion.div className="dqs4-hist-empty"
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.2 }}>
                // No spin history yet //
              </motion.div>
            )}
          </div>

          <div style={{ height:14 }} />
        </motion.div>
      </div>
    </Boundary>
  );
}