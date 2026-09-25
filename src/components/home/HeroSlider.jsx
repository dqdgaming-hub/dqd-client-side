import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * HeroSlider
 * ----------
 * Props:
 *   banners        – array from API: { id, title, subtitle, image, type, action_url }
 *   signInUrl      – where unauthenticated CTA clicks redirect to (default "/sign-in")
 *   redirectDelayMs – how long the "redirecting" overlay shows before navigating (default 900)
 *
 * Usage:
 *   <HeroSlider banners={apiData.data.banners} />
 *
 * Behavior notes:
 *   - Desktop (> MOBILE_BREAKPOINT) renders a cinematic card-stack hero, fully
 *     animated with Framer Motion (no GSAP / no DOM-id manipulation).
 *   - Mobile (<= MOBILE_BREAKPOINT) renders a separate layout: a floating,
 *     depth-stacked card hero with swipe-drag physics, driven by Framer
 *     Motion's drag gestures instead of manual touch math. The active card
 *     sits center-stage with the previous/next cards queued and peeking on
 *     either side, and an ambient drifting-particle field behind the deck.
 *   - Long titles are never clipped — both layouts use fluid, auto-sizing
 *     title containers instead of fixed pixel heights.
 *   - Every CTA / "Learn More" click is intercepted: it shows a short
 *     "sign-in required" overlay, then redirects to signInUrl.
 */

const BASE_URL = "https://api.dqdgaming.com"; // change to your API base URL
const MOBILE_BREAKPOINT = 640;
const AUTOPLAY_MS = 5200;
const PARTICLE_COUNT = 26;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .hs-root {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background: #05040A;
    font-family: 'Rajdhani', sans-serif;
  }

  /* ── BACKDROP CARDS (the big cinematic image + stack) ── */
  .hs-bg-layer {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  .hs-bg-img {
    position: absolute;
    inset: 0;
    // background-size: cover;
    // background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
  }
  .hs-bg-img:after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(160deg, rgba(5,4,10,.94) 0%, rgba(5,4,10,.6) 48%, rgba(5,4,10,.25) 100%),
      linear-gradient(0deg, rgba(5,4,10,.5), transparent 30%);
  }

  .hs-stack-wrap {
    position: absolute;
    z-index: 30;
    right: clamp(20px, 4vw, 40px);
    bottom: clamp(24px, 6vh, 64px);
    display: flex;
    gap: clamp(14px, 2vw, 28px);
  }
  .hs-stack-card {
    width: clamp(120px, 12vw, 168px);
    height: clamp(160px, 17vw, 232px);
    border-radius: 10px;
    background-size: cover;
    background-position: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(212,175,55,.25);
    box-shadow: 0 14px 36px -10px rgba(0,0,0,.7);
  }
  .hs-stack-card:hover { border-color: rgba(212,175,55,.6); }
  .hs-stack-card-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(5,4,10,.1) 0%, rgba(5,4,10,.88) 100%);
  }
  .hs-stack-card-mini {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    padding: 10px 12px;
  }
  .hs-stack-card-bar {
    width: 22px; height: 3px;
    border-radius: 2px;
    margin-bottom: 5px;
  }
  .hs-stack-card-bar.event { background: #FF2D78; }
  .hs-stack-card-bar.game  { background: #7A2CFF; }
  .hs-stack-card-type {
    font-size: 9px;
    font-weight: 600;
    color: rgba(255,255,255,.65);
    letter-spacing: .12em;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .hs-stack-card-title {
    font-family: 'Orbitron', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #F4D886;
    line-height: 1.25;
    letter-spacing: .04em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── DETAILS PANEL ── */
  .hs-details {
    position: absolute;
    z-index: 22;
    top: 50%;
    transform: translateY(-50%);
    left: clamp(28px, 6vw, 72px);
    max-width: min(600px, 52vw);
    display: flex;
    flex-direction: column;
  }

  .hs-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    font-family: 'Orbitron', monospace;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .22em;
    text-transform: uppercase;
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%);
    margin-bottom: 16px;
    width: fit-content;
  }
  .hs-tag.event {
    border: 1px solid rgba(255,45,120,.5);
    background: rgba(255,45,120,.15);
    color: #FF2D78;
  }
  .hs-tag.game {
    border: 1px solid rgba(122,44,255,.5);
    background: rgba(122,44,255,.15);
    color: #C084FC;
  }
  .hs-tag-dot { width: 5px; height: 5px; border-radius: 50%; }
  .hs-tag.event .hs-tag-dot { background: #FF2D78; box-shadow: 0 0 6px #FF2D78; }
  .hs-tag.game  .hs-tag-dot { background: #C084FC; box-shadow: 0 0 6px #7A2CFF; }

  .hs-place-text {
    font-size: 13px;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: rgba(255,255,255,.6);
    padding-top: 14px;
    margin-bottom: 14px;
    position: relative;
    width: fit-content;
  }
  .hs-place-text:before {
    position: absolute;
    top: 0; left: 0;
    content: '';
    width: 28px; height: 3px;
    border-radius: 99px;
    background: #D4AF37;
  }

  /* NOTE: no fixed height / no overflow:hidden here anymore — this is the
     fix for long titles getting clipped. The box grows with its content,
     and font-size eases down responsively via clamp() + a length-aware
     style applied inline from JS for very long titles. */
  .hs-title-line {
    font-family: 'Orbitron', monospace;
    font-weight: 900;
    color: #F4D886;
    text-shadow: 0 0 40px rgba(212,175,55,.3);
    letter-spacing: .05em;
    line-height: 1.12;
    margin-bottom: 16px;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  .hs-desc {
    max-width: 480px;
    font-size: clamp(13px, 1.5vw, 15px);
    line-height: 1.65;
    color: rgba(185,194,217,.75);
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 24px;
  }

  .hs-cta-row {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  /* ── BUTTONS ── */
  .hs-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 26px;
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .2em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    color: #fff;
    clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));
    position: relative;
    overflow: hidden;
    text-decoration: none;
  }
  .hs-btn-primary.event {
    background: linear-gradient(135deg, #FF2D78, #cc0055);
    box-shadow: 0 0 22px rgba(255,45,120,.4);
  }
  .hs-btn-primary.game {
    background: linear-gradient(135deg, #7A2CFF, #3d00cc);
    box-shadow: 0 0 22px rgba(122,44,255,.4);
  }
  .hs-btn-sheen {
    position: absolute;
    top: 0; left: -60%;
    width: 40%; height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,.18), transparent);
    transform: skewX(-18deg);
    pointer-events: none;
  }
  .hs-btn-primary:hover .hs-btn-sheen { animation: hs-sheen .55s ease forwards; }
  @keyframes hs-sheen { to { left: 160%; } }

  .hs-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 12px 22px;
    font-family: 'Orbitron', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .2em;
    text-transform: uppercase;
    cursor: pointer;
    color: #D4AF37;
    background: transparent;
    border: 1px solid rgba(212,175,55,.4);
    clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));
    transition: border-color .2s, background .2s;
    text-decoration: none;
  }
  .hs-btn-ghost:hover {
    border-color: #D4AF37;
    background: rgba(212,175,55,.08);
  }

  .hs-btn-primary:focus-visible,
  .hs-btn-ghost:focus-visible,
  .hs-arrow:focus-visible {
    outline: 2px solid #D4AF37;
    outline-offset: 2px;
  }

  /* ── PAGINATION ── */
  #hs-pagination {
    position: absolute;
    z-index: 60;
    display: inline-flex;
    align-items: center;
    bottom: clamp(28px, 5vh, 48px);
    left: clamp(28px, 6vw, 72px);
  }
  .hs-arrow {
    width: 46px; height: 46px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,.2);
    display: grid;
    place-items: center;
    cursor: pointer;
    background: rgba(5,4,10,.6);
    backdrop-filter: blur(12px);
    transition: border-color .2s, background .2s, color .2s;
    color: rgba(255,255,255,.6);
  }
  .hs-arrow:hover {
    border-color: #D4AF37;
    background: rgba(212,175,55,.1);
    color: #D4AF37;
  }
  .hs-arrow svg { width: 20px; height: 20px; }
  .hs-arrow + .hs-arrow { margin-left: 12px; }
  .hs-progress-wrap {
    margin-left: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .hs-progress-track {
    width: clamp(100px, 18vw, 260px);
    height: 3px;
    background: rgba(255,255,255,.15);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }
  .hs-progress-fill {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, #7A2CFF, #D4AF37);
    border-radius: 2px;
  }
  .hs-counter {
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    letter-spacing: .1em;
    color: rgba(185,194,217,.4);
  }
  .hs-counter strong { color: #D4AF37; }

  /* ── DECORATIVE ── */
  .hs-corner {
    position: absolute;
    width: 20px; height: 20px;
    z-index: 4;
    pointer-events: none;
  }
  .hs-tl { top: 16px; left: 16px; border-top: 2px solid rgba(212,175,55,.5); border-left: 2px solid rgba(212,175,55,.5); }
  .hs-tr { top: 16px; right: 16px; border-top: 2px solid rgba(212,175,55,.5); border-right: 2px solid rgba(212,175,55,.5); }
  .hs-bl { bottom: 16px; left: 16px; border-bottom: 2px solid rgba(212,175,55,.5); border-left: 2px solid rgba(212,175,55,.5); }
  .hs-br { bottom: 16px; right: 16px; border-bottom: 2px solid rgba(212,175,55,.5); border-right: 2px solid rgba(212,175,55,.5); }

  .hs-topline {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #7A2CFF88, #D4AF3799, #7A2CFF88);
    z-index: 100;
    pointer-events: none;
  }
  .hs-scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.05) 2px, rgba(0,0,0,.05) 4px);
    pointer-events: none;
    z-index: 3;
  }

  /* ── EMPTY STATE ── */
  .hs-empty {
    width: 100vw; height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: #05040A;
    font-family: 'Orbitron', monospace;
    font-size: 14px;
    color: rgba(212,175,55,.6);
    letter-spacing: .2em;
  }

  /* ════════════════ SIGN-IN REDIRECT OVERLAY (shared by both layouts) ════════════════ */
  .hs-redirect-overlay {
    position: fixed;
    inset: 0;
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(5,4,10,.88);
    backdrop-filter: blur(10px);
  }
  .hs-redirect-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 36px 40px;
    text-align: center;
    border: 1px solid rgba(212,175,55,.35);
    background: rgba(10,8,18,.6);
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
    max-width: min(360px, 86vw);
  }
  .hs-redirect-ring {
    width: 44px; height: 44px;
    border-radius: 50%;
    border: 2.5px solid rgba(212,175,55,.2);
    border-top-color: #D4AF37;
  }
  .hs-redirect-tag {
    font-family: 'Orbitron', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .22em;
    color: #FF2D78;
  }
  .hs-redirect-title {
    font-family: 'Orbitron', monospace;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: .06em;
    color: #F4D886;
  }
  .hs-redirect-sub {
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    letter-spacing: .08em;
    color: rgba(185,194,217,.6);
  }
  .hs-dots span { animation: hs-dot-blink 1.2s infinite; }
  .hs-dots span:nth-child(2) { animation-delay: .2s; }
  .hs-dots span:nth-child(3) { animation-delay: .4s; }
  @keyframes hs-dot-blink { 0%, 80%, 100% { opacity: .2; } 40% { opacity: 1; } }

  /* ════════════════ MOBILE HERO — floating card layout ════════════════ */
  .hsm-root {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    position: relative;
    overflow: hidden;
    background: #05040A;
    font-family: 'Rajdhani', sans-serif;
  }
  .hsm-root:before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 18% 14%, rgba(122,44,255,.16), transparent 55%),
      radial-gradient(circle at 86% 78%, rgba(255,45,120,.12), transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  .hsm-scanlines {
    position: absolute; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.05) 2px, rgba(0,0,0,.05) 4px);
    pointer-events: none;
    z-index: 5;
  }

  /* ── ambient drifting particle field, sits behind the card deck ── */
  .hsm-particle-field {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
    pointer-events: none;
  }
  .hsm-particle {
    position: absolute;
    border-radius: 50%;
    will-change: transform, opacity;
  }
  .hsm-particle.cyan   { background: #7A2CFF; box-shadow: 0 0 8px 1px rgba(122,44,255,.8); }
  .hsm-particle.pink   { background: #FF2D78; box-shadow: 0 0 8px 1px rgba(255,45,120,.75); }
  .hsm-particle.gold   { background: #D4AF37; box-shadow: 0 0 7px 1px rgba(212,175,55,.7); }

  .hsm-topbar {
    position: absolute;
    top: 0; left: 0; right: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    padding-top: calc(16px + env(safe-area-inset-top, 0px));
  }
  .hsm-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Orbitron', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .15em;
    color: #D4AF37;
  }
  .hsm-logo-mark {
    width: 24px; height: 24px;
    display: grid; place-items: center;
    font-size: 8px;
    border: 1.5px solid #D4AF37;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
  .hsm-counter {
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    letter-spacing: .08em;
    color: rgba(185,194,217,.55);
    background: rgba(10,8,18,.5);
    border: 1px solid rgba(212,175,55,.25);
    padding: 5px 10px;
    border-radius: 99px;
    backdrop-filter: blur(8px);
  }
  .hsm-counter strong { color: #D4AF37; }

  /* the floating card stage */
  .hsm-stage {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 78px 0 132px;
  }

  /* queued neighbor cards peeking on either side of the active card */
  .hsm-queue-slot {
    position: absolute;
    width: min(86vw, 360px);
    height: min(60vh, 480px);
    will-change: transform, opacity;
    pointer-events: none;
  }
  .hsm-queue-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 22px;
    overflow: hidden;
    background-size: cover;
    background-position: center;
    border: 1px solid rgba(212,175,55,.18);
    box-shadow: 0 18px 46px -14px rgba(0,0,0,.7);
  }
  .hsm-queue-card-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(5,4,10,.35) 0%, rgba(5,4,10,.86) 100%);
  }

  .hsm-card-slot {
    position: absolute;
    width: min(86vw, 360px);
    height: min(60vh, 480px);
    will-change: transform;
    z-index: 2;
  }
  .hsm-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 22px;
    overflow: hidden;
    background-size: cover;
    background-position: center;
    border: 1px solid rgba(212,175,55,.3);
    box-shadow:
      0 24px 60px -16px rgba(0,0,0,.75),
      0 0 0 1px rgba(255,255,255,.04) inset;
  }
  .hsm-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(5,4,10,.15) 0%, rgba(5,4,10,.35) 45%, rgba(5,4,10,.97) 92%);
  }
  .hsm-card-sheen {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.08), transparent 40%);
    mix-blend-mode: overlay;
  }
  .hsm-card-edge-glow {
    position: absolute;
    inset: 0;
    border-radius: 22px;
    pointer-events: none;
    box-shadow: 0 0 0 1px rgba(212,175,55,0) inset;
  }
  .hsm-card-edge-glow.event { box-shadow: 0 0 28px -4px rgba(255,45,120,.55) inset, 0 0 22px rgba(255,45,120,.25); }
  .hsm-card-edge-glow.game  { box-shadow: 0 0 28px -4px rgba(122,44,255,.55) inset, 0 0 22px rgba(122,44,255,.25); }

  .hsm-card-content {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    z-index: 5;
    padding: 22px 22px calc(22px + env(safe-area-inset-bottom, 0px));
    display: flex;
    flex-direction: column;
  }

  .hsm-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-family: 'Orbitron', monospace;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .2em;
    text-transform: uppercase;
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%);
    margin-bottom: 10px;
    width: fit-content;
  }
  .hsm-tag.event { border: 1px solid rgba(255,45,120,.5); background: rgba(255,45,120,.15); color: #FF2D78; }
  .hsm-tag.game  { border: 1px solid rgba(122,44,255,.5); background: rgba(122,44,255,.15); color: #C084FC; }
  .hsm-tag-dot { width: 5px; height: 5px; border-radius: 50%; }
  .hsm-tag.event .hsm-tag-dot { background: #FF2D78; box-shadow: 0 0 6px #FF2D78; }
  .hsm-tag.game  .hsm-tag-dot { background: #C084FC; box-shadow: 0 0 6px #7A2CFF; }

  /* fix: no fixed height / no clamp-cut here — title box grows freely */
  .hsm-title {
    font-family: 'Orbitron', monospace;
    font-weight: 900;
    color: #F4D886;
    letter-spacing: .015em;
    line-height: 1.18;
    margin-bottom: 8px;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  .hsm-desc {
    font-size: 13px;
    line-height: 1.55;
    color: rgba(185,194,217,.72);
    font-weight: 600;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .hsm-cta-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .hsm-btn-primary {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 18px;
    font-family: 'Orbitron', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #fff;
    text-decoration: none;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  }
  .hsm-btn-primary.event { background: linear-gradient(135deg, #FF2D78, #cc0055); box-shadow: 0 0 18px rgba(255,45,120,.4); }
  .hsm-btn-primary.game  { background: linear-gradient(135deg, #7A2CFF, #3d00cc); box-shadow: 0 0 18px rgba(122,44,255,.4); }
  .hsm-btn-ghost {
    padding: 14px 16px;
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #D4AF37;
    border: 1px solid rgba(212,175,55,.4);
    text-decoration: none;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
    background: rgba(212,175,55,.06);
  }
  .hsm-btn-primary:focus-visible,
  .hsm-btn-ghost:focus-visible {
    outline: 2px solid #D4AF37;
    outline-offset: 2px;
  }

  /* dot rail under the card */
  .hsm-dockrail {
    position: absolute;
    z-index: 40;
    left: 0; right: 0;
    bottom: calc(28px + env(safe-area-inset-bottom, 0px));
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .hsm-dock-dot {
    background: transparent;
    border: none;
    padding: 6px 3px;
    cursor: pointer;
  }
  .hsm-dock-dot-bar {
    width: 6px; height: 6px;
    border-radius: 99px;
    background: rgba(255,255,255,.25);
  }
  .hsm-dock-dot.active .hsm-dock-dot-bar {
    width: 22px;
    background: #D4AF37;
    box-shadow: 0 0 8px rgba(212,175,55,.6);
  }
  .hsm-dock-dot:focus-visible .hsm-dock-dot-bar {
    box-shadow: 0 0 0 2px rgba(212,175,55,.6);
  }

  .hsm-swipe-hint {
    position: absolute;
    z-index: 40;
    bottom: calc(58px + env(safe-area-inset-bottom, 0px));
    left: 0; right: 0;
    display: flex;
    justify-content: center;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: rgba(212,175,55,.5);
    pointer-events: none;
  }

  /* small phones: tighten up further */
  @media (max-width: 380px) {
    .hsm-card-slot, .hsm-queue-slot { width: 90vw; height: 56vh; }
    .hsm-desc { display: none; }
    .hsm-card-content { padding: 18px 18px calc(18px + env(safe-area-inset-bottom, 0px)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .hs-dots span { animation: none !important; }
    .hsm-particle { animation: none !important; opacity: .35 !important; }
  }
`;

/** Resolve image URL — handles both absolute and relative paths */
function resolveImage(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

/**
 * Returns an inline font-size style for the title so very long titles
 * shrink gracefully instead of overflowing or getting clipped. This
 * replaces the old fixed-height + overflow:hidden box.
 */
function titleStyle(title, mode) {
  const len = (title || "").length;
  if (mode === "mobile") {
    if (len > 46) return { fontSize: "clamp(18px, 5.6vw, 24px)" };
    if (len > 28) return { fontSize: "clamp(20px, 6.2vw, 27px)" };
    return { fontSize: "clamp(22px, 7vw, 30px)" };
  }
  if (len > 70) return { fontSize: "clamp(22px, 3.2vw, 38px)" };
  if (len > 46) return { fontSize: "clamp(24px, 3.8vw, 46px)" };
  if (len > 28) return { fontSize: "clamp(26px, 4.1vw, 52px)" };
  return { fontSize: "clamp(28px, 4.5vw, 60px)" };
}

const easeOut = [0.22, 1, 0.36, 1];

/** Deterministic-ish pseudo-random particle field, generated once. */
function makeParticles(count) {
  const colors = ["cyan", "pink", "gold"];
  const out = [];
  for (let i = 0; i < count; i++) {
    const size = 2 + Math.random() * 3.2;
    out.push({
      id: i,
      color: colors[i % colors.length],
      size,
      startX: Math.random() * 100, // vw %
      startY: Math.random() * 100, // vh %
      driftX: (Math.random() - 0.5) * 60, // px drift range
      driftY: -(40 + Math.random() * 90), // always drifts upward
      duration: 9 + Math.random() * 10, // seconds
      delay: -(Math.random() * 18), // negative delay = staggered start mid-cycle
      baseOpacity: 0.25 + Math.random() * 0.45,
    });
  }
  return out;
}

/** Ambient drifting-particle field rendered behind the mobile card deck. */
function ParticleField({ particles, motionOk }) {
  if (!motionOk) {
    // Reduced-motion: render static, dim motes instead of animating them.
    return (
      <div className="hsm-particle-field" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className={`hsm-particle ${p.color}`}
            style={{
              left: `${p.startX}%`,
              top: `${p.startY}%`,
              width: p.size,
              height: p.size,
              opacity: p.baseOpacity * 0.5,
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="hsm-particle-field" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={`hsm-particle ${p.color}`}
          style={{
            left: `${p.startX}%`,
            top: `${p.startY}%`,
            width: p.size,
            height: p.size,
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, p.baseOpacity, p.baseOpacity, 0],
            x: [0, p.driftX * 0.5, p.driftX],
            y: [0, p.driftY * 0.6, p.driftY],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSlider({ banners = [], signInUrl = "/sign-in", redirectDelayMs = 900 }) {
  const prefersReducedMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false
  );
  const [redirecting, setRedirecting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [booted, setBooted] = useState(false);

  const autoplayRef = useRef(null);
  const N = banners.length;

  // particle field generated once per mount, reused across re-renders/slides
  const particles = useMemo(() => makeParticles(PARTICLE_COUNT), []);

  // watch the breakpoint
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = (e) => setIsMobile(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  // preload images, then "boot" the hero in
  useEffect(() => {
    if (!N) return;
    let cancelled = false;
    const imgs = banners.map(
      (b) =>
        new Promise((res) => {
          const img = new Image();
          img.onload = res;
          img.onerror = res;
          img.src = resolveImage(b.image);
        })
    );
    Promise.all(imgs).then(() => {
      if (!cancelled) setBooted(true);
    });
    return () => {
      cancelled = true;
    };
  }, [banners, N]);

  // shared autoplay loop, used by both layouts
  useEffect(() => {
    if (!N || redirecting) {
      clearInterval(autoplayRef.current);
      return;
    }
    autoplayRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((i) => (i + 1) % N);
    }, AUTOPLAY_MS);
    return () => clearInterval(autoplayRef.current);
  }, [N, redirecting, isMobile, activeIndex]);

  function resetAutoplay() {
    clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((i) => (i + 1) % N);
    }, AUTOPLAY_MS);
  }

  function goTo(i) {
    setDirection(i > activeIndex ? 1 : -1);
    setActiveIndex(i);
    resetAutoplay();
  }
  function goNext() {
    setDirection(1);
    setActiveIndex((i) => (i + 1) % N);
    resetAutoplay();
  }
  function goPrev() {
    setDirection(-1);
    setActiveIndex((i) => (i - 1 + N) % N);
    resetAutoplay();
  }

  function triggerSignInRedirect() {
    if (redirecting) return;
    clearInterval(autoplayRef.current);
    setRedirecting(true);
    setTimeout(() => {
      window.location.href = signInUrl;
    }, redirectDelayMs);
  }

  function handleCtaClick(e) {
    e.preventDefault();
    triggerSignInRedirect();
  }

  if (!N) {
    return (
      <>
        <style>{CSS}</style>
        <div className="hs-empty">NO BANNERS AVAILABLE</div>
      </>
    );
  }

  const active = banners[activeIndex];
  const prevIndex = (activeIndex - 1 + N) % N;
  const nextIndex = (activeIndex + 1) % N;
  const prevBanner = banners[prevIndex];
  const nextBanner = banners[nextIndex];

  // upcoming stack order for desktop thumbnails (next 3, wrapping)
  const upcoming = useMemo(() => {
    const out = [];
    for (let k = 1; k <= Math.min(3, N - 1); k++) {
      out.push((activeIndex + k) % N);
    }
    return out;
  }, [activeIndex, N]);

  const motionOk = !prefersReducedMotion;

  return (
    <>
      <style>{CSS}</style>

      {!isMobile && (
        <div className="hs-root">
          <div className="hs-topline" />
          <div className="hs-corner hs-tl" />
          <div className="hs-corner hs-tr" />
          <div className="hs-corner hs-bl" />
          <div className="hs-corner hs-br" />
          <div className="hs-scanlines" />

          {/* Background image crossfade */}
          <div className="hs-bg-layer">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={active.id}
                className="hs-bg-img"
                style={{ backgroundImage: `url(${resolveImage(active.image)})` }}
                initial={{ opacity: 0, scale: motionOk ? 1.06 : 1 }}
                animate={{ opacity: booted ? 1 : 0, scale: 1 }}
                exit={{ opacity: 0, scale: motionOk ? 1.04 : 1 }}
                transition={{ duration: motionOk ? 0.9 : 0, ease: easeOut }}
              />
            </AnimatePresence>
          </div>

          {/* Details panel */}
          <div className="hs-details">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: motionOk ? (direction > 0 ? 40 : -40) : 0, filter: "blur(0px)" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: motionOk ? (direction > 0 ? -30 : 30) : 0 }}
                transition={{ duration: motionOk ? 0.55 : 0, ease: easeOut }}
              >
                <motion.div
                  className={`hs-tag ${active.type}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: motionOk ? 0.08 : 0, duration: 0.4, ease: easeOut }}
                >
                  <span className="hs-tag-dot" />
                  <span>{active.type === "event" ? "Event" : "Game"}</span>
                </motion.div>

                <motion.div
                  className="hs-place-text"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: motionOk ? 0.14 : 0, duration: 0.45, ease: easeOut }}
                >
                  {active.title}
                </motion.div>

                <motion.div
                  className="hs-title-line"
                  style={titleStyle(active.title, "desktop")}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: motionOk ? 0.2 : 0, duration: 0.55, ease: easeOut }}
                >
                  {active.title}
                </motion.div>

                <motion.div
                  className="hs-desc"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: motionOk ? 0.3 : 0, duration: 0.45, ease: easeOut }}
                >
                  {active.subtitle}
                </motion.div>

                <motion.div
                  className="hs-cta-row"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: motionOk ? 0.36 : 0, duration: 0.45, ease: easeOut }}
                >
                  <a
                    className={`hs-btn-primary ${active.type}`}
                    href={active.action_url || "#"}
                    onClick={handleCtaClick}
                  >
                    <span className="hs-btn-sheen" />
                    <span>{active.type === "event" ? "View Event" : "Book Now"}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Upcoming stack thumbnails */}
          <div className="hs-stack-wrap">
            <AnimatePresence initial={false}>
              {upcoming.map((idx) => {
                const b = banners[idx];
                return (
                  <motion.div
                    key={b.id}
                    className="hs-stack-card"
                    style={{ backgroundImage: `url(${resolveImage(b.image)})` }}
                    layout
                    onClick={() => goTo(idx)}
                    initial={{ opacity: 0, y: 18, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={motionOk ? { y: -6, scale: 1.03 } : {}}
                    transition={{ duration: 0.4, ease: easeOut }}
                  >
                    <div className="hs-stack-card-shade" />
                    <div className="hs-stack-card-mini">
                      <div className={`hs-stack-card-bar ${b.type}`} />
                      <div className="hs-stack-card-type">{b.type}</div>
                      <div className="hs-stack-card-title">{b.title}</div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          <div id="hs-pagination">
            <button className="hs-arrow" onClick={goPrev} aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="hs-arrow" onClick={goNext} aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
            <div className="hs-progress-wrap">
              <div className="hs-progress-track">
                <motion.div
                  className="hs-progress-fill"
                  key={activeIndex}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ transformOrigin: "left", width: `${(100 / N) * (activeIndex + 1)}%` }}
                  transition={{ duration: 0.5, ease: easeOut }}
                />
              </div>
              <div className="hs-counter">
                <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
                {" / "}
                <span>{String(N).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <div className="hsm-root">
          <div className="hsm-scanlines" />

          <ParticleField particles={particles} motionOk={motionOk} />

          <div className="hsm-stage">
            {/* queued neighbor cards, peeking on either side — only rendered when there's more than one banner */}
            {N > 1 && (
              <div
                key={`prev-${prevBanner.id}`}
                className="hsm-queue-slot"
                style={{
                  transform: motionOk
                    ? "translateX(-62%) scale(0.82) rotate(-6deg)"
                    : "translateX(-62%) scale(0.82)",
                  opacity: 0.55,
                  zIndex: 1,
                }}
              >
                <div
                  className="hsm-queue-card"
                  style={{ backgroundImage: `url(${resolveImage(prevBanner.image)})` }}
                >
                  <div className="hsm-queue-card-shade" />
                </div>
              </div>
            )}
            {N > 1 && (
              <div
                key={`next-${nextBanner.id}`}
                className="hsm-queue-slot"
                style={{
                  transform: motionOk
                    ? "translateX(62%) scale(0.82) rotate(6deg)"
                    : "translateX(62%) scale(0.82)",
                  opacity: 0.55,
                  zIndex: 1,
                }}
              >
                <div
                  className="hsm-queue-card"
                  style={{ backgroundImage: `url(${resolveImage(nextBanner.image)})` }}
                >
                  <div className="hsm-queue-card-shade" />
                </div>
              </div>
            )}

            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={active.id}
                className="hsm-card-slot"
                custom={direction}
                drag="x"
                dragElastic={0.6}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, info) => {
                  const { offset, velocity } = info;
                  if (offset.x < -70 || velocity.x < -500) goNext();
                  else if (offset.x > 70 || velocity.x > 500) goPrev();
                }}
                initial={{
                  opacity: 0,
                  x: motionOk ? direction * 90 : 0,
                  rotate: motionOk ? direction * 6 : 0,
                  scale: 0.94,
                }}
                animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  x: motionOk ? direction * -90 : 0,
                  rotate: motionOk ? direction * -6 : 0,
                  scale: 0.94,
                }}
                whileDrag={{ scale: 1.02 }}
                transition={{ duration: motionOk ? 0.45 : 0, ease: easeOut }}
              >
                <div
                  className="hsm-card"
                  style={{ backgroundImage: `url(${resolveImage(active.image)})` }}
                >
                  <div className="hsm-card-overlay" />
                  <div className="hsm-card-sheen" />
                  <div className={`hsm-card-edge-glow ${active.type}`} />

                  <div className="hsm-card-content">
                    <motion.div
                      className={`hsm-tag ${active.type}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.35, ease: easeOut }}
                    >
                      <span className="hsm-tag-dot" />
                      {active.type === "event" ? "Event" : "Game"}
                    </motion.div>

                    <motion.div
                      className="hsm-title"
                      style={titleStyle(active.title, "mobile")}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.4, ease: easeOut }}
                    >
                      {active.title}
                    </motion.div>

                    <motion.div
                      className="hsm-desc"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4, ease: easeOut }}
                    >
                      {active.subtitle}
                    </motion.div>

                    <motion.div
                      className="hsm-cta-row"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.26, duration: 0.4, ease: easeOut }}
                    >
                      <a
                        className={`hsm-btn-primary ${active.type}`}
                        href={active.action_url || "#"}
                        onClick={handleCtaClick}
                      >
                        {active.type === "event" ? "View Event" : "Book Now"}
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                      </a>
                      
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="hsm-swipe-hint">‹ swipe ›</div>

          <div className="hsm-dockrail">
            {banners.map((b, i) => (
              <button
                key={b.id}
                className={`hsm-dock-dot ${i === activeIndex ? "active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              >
                <span className="hsm-dock-dot-bar" />
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {redirecting && (
          <motion.div
            className="hs-redirect-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="hs-redirect-box"
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: easeOut }}
            >
              <motion.div
                className="hs-redirect-ring"
                animate={motionOk ? { rotate: 360 } : {}}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              <div className="hs-redirect-tag">ACCESS LOCKED</div>
              <div className="hs-redirect-title">Sign-in required</div>
              <div className="hs-redirect-sub">
                Redirecting you to sign in
                <span className="hs-dots"><span>.</span><span>.</span><span>.</span></span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}