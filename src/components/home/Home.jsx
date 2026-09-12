import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../Layout";
import { getHomePage } from "../api/homeapi";
import PageLoader from "../../Loader/PageLoader";

/* ═══════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════ */
const TRACK_W    = 320;
const TRACK_H    = 480;
const LANE_W     = TRACK_W / 3;
const CAR_W      = 38;
const CAR_H      = 64;
const PLAYER_Y   = TRACK_H - CAR_H - 18;
const OBS_W      = 38;
const OBS_H      = 60;
const BASE_SPEED = 3.2;
const SPEED_INC  = 0.0008;   // per frame
const SPAWN_INT  = 72;       // frames between obstacle spawns

const LANES = [
  LANE_W * 0 + (LANE_W - CAR_W) / 2,
  LANE_W * 1 + (LANE_W - CAR_W) / 2,
  LANE_W * 2 + (LANE_W - CAR_W) / 2,
];

/* ═══════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════ */
const ALL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

  /* ── loader ── */
  .hs-loader-root {
    width: 100vw; height: 100vh;
    background: #05040A;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 32px; position: fixed; inset: 0; z-index: 9999;
  }
  .hs-loader-orb {
    position: absolute; border-radius: 50%;
    pointer-events: none; filter: blur(80px);
  }
  .hs-loader-orb-1 {
    width: 420px; height: 420px; top: -10%; left: -8%;
    background: radial-gradient(circle, rgba(122,44,255,0.18) 0%, transparent 70%);
  }
  .hs-loader-orb-2 {
    width: 320px; height: 320px; bottom: -5%; right: -5%;
    background: radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%);
  }
  .hs-loader-hex {
    width: 64px; height: 64px;
    border: 2px solid #D4AF37;
    clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
    display: grid; place-items: center;
    font-family: 'Orbitron', monospace;
    font-size: 22px; font-weight: 900; color: #D4AF37;
    animation: hs-pulse 2s ease-in-out infinite;
    position: relative; z-index: 1;
  }
  @keyframes hs-pulse {
    0%,100% { box-shadow: 0 0 0 rgba(212,175,55,0); border-color: #D4AF37; }
    50%      { box-shadow: 0 0 28px rgba(212,175,55,0.4); border-color: #F4D886; }
  }
  .hs-loader-bar-wrap { position:relative; z-index:1; width: min(320px,70vw); }
  .hs-loader-bar-track {
    width: 100%; height: 3px;
    background: rgba(255,255,255,.1); border-radius: 2px; overflow: hidden;
  }
  .hs-loader-bar-fill {
    height: 3px; border-radius: 2px;
    background: linear-gradient(90deg,#7A2CFF,#D4AF37);
    animation: hs-bar 1.6s ease-in-out infinite;
  }
  @keyframes hs-bar {
    0%   { width:0%;  margin-left:0; }
    50%  { width:70%; margin-left:0; }
    100% { width:0%;  margin-left:100%; }
  }
  .hs-loader-status {
    position:relative; z-index:1;
    font-family:'Orbitron',monospace; font-size:9px;
    letter-spacing:.28em; color:rgba(185,194,217,.4);
    text-transform:uppercase;
    animation: hs-blink 1.6s ease-in-out infinite;
  }
  @keyframes hs-blink { 0%,100%{opacity:.4} 50%{opacity:1} }
  .hs-loader-corner {
    position:absolute; width:18px; height:18px; pointer-events:none; z-index:1;
  }
  .hs-lc-tl { top:20px;left:20px; border-top:2px solid rgba(212,175,55,.35); border-left:2px solid rgba(212,175,55,.35); }
  .hs-lc-tr { top:20px;right:20px; border-top:2px solid rgba(212,175,55,.35); border-right:2px solid rgba(212,175,55,.35); }
  .hs-lc-bl { bottom:20px;left:20px; border-bottom:2px solid rgba(212,175,55,.35); border-left:2px solid rgba(212,175,55,.35); }
  .hs-lc-br { bottom:20px;right:20px; border-bottom:2px solid rgba(212,175,55,.35); border-right:2px solid rgba(212,175,55,.35); }
  .hs-loader-topline {
    position:absolute; top:0;left:0;right:0; height:2px;
    background:linear-gradient(90deg,#7A2CFF88,#D4AF3799,#7A2CFF88); pointer-events:none;
  }
  .hs-loader-scanlines {
    position:absolute; inset:0; pointer-events:none;
    background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px);
  }

  /* ── error overlay ── */
  .err-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(5,4,10,0.96);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 0;
    font-family: 'Orbitron', monospace;
  }
  .err-topline {
    position:absolute; top:0;left:0;right:0; height:2px;
    background:linear-gradient(90deg,transparent,#ff006e,#7A2CFF,transparent);
  }
  .err-orb1 {
    position:absolute; width:340px; height:340px;
    top:-80px; left:-80px; border-radius:50%;
    background:radial-gradient(circle,rgba(255,0,110,0.07) 0%,transparent 70%);
    filter:blur(60px); pointer-events:none;
  }
  .err-orb2 {
    position:absolute; width:260px; height:260px;
    bottom:-60px; right:-40px; border-radius:50%;
    background:radial-gradient(circle,rgba(122,44,255,0.09) 0%,transparent 70%);
    filter:blur(50px); pointer-events:none;
  }
  .err-corner { position:absolute; width:16px; height:16px; pointer-events:none; }
  .err-tl{top:16px;left:16px; border-top:1px solid rgba(255,0,110,.4); border-left:1px solid rgba(255,0,110,.4);}
  .err-tr{top:16px;right:16px; border-top:1px solid rgba(255,0,110,.4); border-right:1px solid rgba(255,0,110,.4);}
  .err-bl{bottom:16px;left:16px; border-bottom:1px solid rgba(255,0,110,.4); border-left:1px solid rgba(255,0,110,.4);}
  .err-br{bottom:16px;right:16px; border-bottom:1px solid rgba(255,0,110,.4); border-right:1px solid rgba(255,0,110,.4);}

  /* ── track ── */
  .race-track {
    position: relative;
    width: ${TRACK_W}px; height: ${TRACK_H}px;
    background: #0a0918;
    border: 1px solid rgba(122,44,255,0.3);
    overflow: hidden;
    flex-shrink: 0;
  }
  .race-road-bg {
    position:absolute; inset:0;
    background: linear-gradient(180deg, #0d0c1e 0%, #0a0918 100%);
  }
  .race-lane-line {
    position:absolute; top:0; bottom:0; width:2px;
    background: repeating-linear-gradient(180deg, rgba(212,175,55,0.35) 0px, rgba(212,175,55,0.35) 18px, transparent 18px, transparent 38px);
    animation: lane-scroll 0.45s linear infinite;
  }
  @keyframes lane-scroll {
    from { background-position: 0 0; }
    to   { background-position: 0 56px; }
  }
  .race-edge {
    position:absolute; top:0; bottom:0; width:6px;
    background: linear-gradient(180deg,
      rgba(122,44,255,0.6) 0px, rgba(122,44,255,0.6) 12px,
      transparent 12px, transparent 24px
    );
    background-size: 6px 24px;
    animation: lane-scroll 0.35s linear infinite;
  }
  .race-edge-l { left:0; }
  .race-edge-r { right:0; }

  /* player car (pure CSS) */
  .player-car {
    position:absolute; width:${CAR_W}px; height:${CAR_H}px;
  }
  .car-body {
    position:absolute; left:4px; right:4px; top:8px; bottom:8px;
    background: linear-gradient(160deg, #c084fc, #7c3aed);
    clip-path: polygon(18% 0%,82% 0%,100% 18%,100% 82%,82% 100%,18% 100%,0% 82%,0% 18%);
    box-shadow: 0 0 18px rgba(192,132,252,0.7);
  }
  .car-window {
    position:absolute; left:50%; top:22px;
    transform:translateX(-50%);
    width:16px; height:18px;
    background:linear-gradient(180deg,rgba(0,245,255,0.8),rgba(0,245,255,0.2));
    clip-path:polygon(20% 0%,80% 0%,100% 40%,80% 100%,20% 100%,0% 40%);
  }
  .car-wheel {
    position:absolute; width:8px; height:12px;
    background:#1a1a2e; border:1px solid rgba(192,132,252,0.5); border-radius:2px;
  }
  .wl-tl{top:10px;left:0;} .wl-tr{top:10px;right:0;}
  .wl-bl{bottom:10px;left:0;} .wl-br{bottom:10px;right:0;}
  .car-exhaust {
    position:absolute; bottom:-4px; left:50%;
    transform:translateX(-50%);
    width:6px; height:10px;
    background:linear-gradient(180deg,rgba(122,44,255,0.8),transparent);
    filter:blur(3px);
    animation:exhaust 0.15s ease-in-out infinite alternate;
  }
  @keyframes exhaust {
    from{opacity:0.6;height:8px;}
    to{opacity:1;height:14px;}
  }

  /* obstacle car */
  .obs-car {
    position:absolute; width:${OBS_W}px; height:${OBS_H}px;
  }
  .obs-body {
    position:absolute; left:3px; right:3px; top:6px; bottom:6px;
    clip-path: polygon(18% 0%,82% 0%,100% 18%,100% 82%,82% 100%,18% 100%,0% 82%,0% 18%);
  }
  .obs-window {
    position:absolute; left:50%; top:16px;
    transform:translateX(-50%);
    width:14px; height:14px;
    background:rgba(0,0,0,0.5);
    clip-path:polygon(20% 0%,80% 0%,100% 40%,80% 100%,20% 100%,0% 40%);
  }
  .obs-wheel {
    position:absolute; width:7px; height:10px;
    background:#0a0918; border-radius:1px;
  }
  .ow-tl{top:8px;left:0;} .ow-tr{top:8px;right:0;}
  .ow-bl{bottom:8px;left:0;} .ow-br{bottom:8px;right:0;}

  /* HUD */
  .race-hud {
    position:absolute; top:0; left:0; right:0;
    display:flex; justify-content:space-between; align-items:center;
    padding:8px 12px;
    background:linear-gradient(180deg,rgba(5,4,10,0.85),transparent);
    z-index:10; pointer-events:none;
  }
  .hud-val {
    font-family:'Orbitron',monospace; font-size:11px; font-weight:700;
    color:#D4AF37; letter-spacing:1px;
  }
  .hud-label {
    font-family:'Orbitron',monospace; font-size:7px;
    color:rgba(212,175,55,0.5); letter-spacing:2px; text-transform:uppercase; display:block;
  }

  /* lives */
  .race-lives {
    display:flex; gap:5px;
  }
  .life-pip {
    width:10px; height:10px; border-radius:50%;
    background:#7A2CFF;
    box-shadow:0 0 8px rgba(122,44,255,0.8);
  }
  .life-pip.dead { background:rgba(255,255,255,0.1); box-shadow:none; }

  /* flash on crash */
  .crash-flash {
    position:absolute; inset:0;
    background:rgba(255,0,110,0.22);
    pointer-events:none; z-index:20;
  }

  /* speed lines */
  .speed-line {
    position:absolute; width:1px;
    background:linear-gradient(180deg,transparent,rgba(192,132,252,0.4),transparent);
    animation:spd-line 0.4s linear infinite;
  }
  @keyframes spd-line {
    from{transform:translateY(-100%);}
    to{transform:translateY(200%);}
  }

  /* key hints */
  .key-hints {
    display:flex; gap:8px; align-items:center; margin-top:10px;
  }
  .key-cap {
    display:inline-flex; align-items:center; justify-content:center;
    width:28px; height:28px;
    background:rgba(122,44,255,0.15);
    border:1px solid rgba(122,44,255,0.4);
    border-bottom:2px solid rgba(122,44,255,0.7);
    border-radius:4px;
    font-family:'Orbitron',monospace; font-size:10px; color:#c084fc;
  }
  .key-sep {
    font-family:'Orbitron',monospace; font-size:8px;
    color:rgba(185,194,217,0.3); letter-spacing:1px;
  }

  /* overlay states */
  .game-overlay {
    position:absolute; inset:0; z-index:30;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:12px;
    background:rgba(5,4,10,0.88);
  }
  .overlay-title {
    font-family:'Orbitron',monospace; font-size:15px; font-weight:900;
    letter-spacing:3px; text-transform:uppercase;
  }
  .overlay-sub {
    font-family:'Orbitron',monospace; font-size:8px;
    letter-spacing:3px; color:rgba(185,194,217,0.45);
    text-transform:uppercase;
  }
  .overlay-score {
    font-family:'Orbitron',monospace; font-size:22px; font-weight:900;
    color:#D4AF37;
  }
  .overlay-btn {
    margin-top:4px;
    padding:9px 22px;
    font-family:'Orbitron',monospace; font-size:10px; font-weight:700;
    letter-spacing:2px; text-transform:uppercase;
    background:linear-gradient(135deg,#7A2CFF,#c084fc);
    border:none; color:#fff; cursor:pointer;
    clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
    transition:filter 0.2s;
  }
  .overlay-btn:hover { filter:brightness(1.2); }
  .retry-link {
    margin-top:6px;
    font-family:'Orbitron',monospace; font-size:8px;
    letter-spacing:2px; color:rgba(212,175,55,0.6);
    text-decoration:underline; cursor:pointer;
    text-transform:uppercase; border:none; background:none;
  }
  .retry-link:hover { color:#D4AF37; }
`;

/* ═══════════════════════════════════════════════
   PLAYER CAR SVG-ish CSS
═══════════════════════════════════════════════ */
const OBS_COLORS = ["#ff006e", "#00f5ff", "#f59e0b", "#39ff14"];

function PlayerCar() {
  return (
    <div className="player-car">
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

function ObstacleCar({ color }) {
  return (
    <div className="obs-car">
      <div className="obs-wheel ow-tl" />
      <div className="obs-wheel ow-tr" />
      <div className="obs-wheel ow-bl" />
      <div className="obs-wheel ow-br" />
      <div className="obs-body" style={{
        background: `linear-gradient(160deg, ${color}cc, ${color}66)`,
        boxShadow: `0 0 14px ${color}99`,
      }} />
      <div className="obs-window" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   RACING GAME
═══════════════════════════════════════════════ */
function RacingGame({ onRetry }) {
  const [phase, setPhase]         = useState("idle");   // idle | playing | dead | gameover
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore]         = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [lives, setLives]         = useState(3);
  const [crashed, setCrashed]     = useState(false);
  const [frameSpeed, setFrameSpeed] = useState(BASE_SPEED);

  const frameRef     = useRef(null);
  const frameCount   = useRef(0);
  const stateRef     = useRef({});

  // keep a ref mirror so rAF always reads fresh state
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
  }, []);

  // keyboard
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  setPlayerLane(l => Math.max(0, l - 1));
      if (e.key === "ArrowRight") setPlayerLane(l => Math.min(2, l + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // game loop
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
      setScore(s => s + 1);

      // spawn obstacles
      setObstacles(prev => {
        let next = prev.map(o => ({ ...o, y: o.y + speed }))
                       .filter(o => o.y < TRACK_H + OBS_H);

        if (fc % SPAWN_INT === 0) {
          const usedLanes = next.filter(o => o.y < 120).map(o => o.lane);
          const free = [0, 1, 2].filter(l => !usedLanes.includes(l));
          if (free.length) {
            const lane = free[Math.floor(Math.random() * free.length)];
            next = [...next, {
              id: fc,
              lane,
              y: -OBS_H,
              color: OBS_COLORS[Math.floor(Math.random() * OBS_COLORS.length)],
            }];
          }
        }

        // collision check
        const playerX = LANES[playerLane];
        const playerYTop = PLAYER_Y;
        const hit = next.some(o => {
          const ox = LANES[o.lane];
          const oy = o.y;
          return (
            Math.abs(ox - playerX) < CAR_W * 0.8 &&
            oy + OBS_H > playerYTop + 8 &&
            oy < playerYTop + CAR_H - 8
          );
        });

        if (hit) {
          // remove the colliding obstacle
          const surviving = next.filter(o => {
            const ox = LANES[o.lane];
            const oy = o.y;
            return !(Math.abs(ox - playerX) < CAR_W * 0.8 &&
              oy + OBS_H > playerYTop + 8 &&
              oy < playerYTop + CAR_H - 8);
          });

          const newLives = lives - 1;
          setLives(newLives);
          setCrashed(true);
          setTimeout(() => setCrashed(false), 300);

          if (newLives <= 0) {
            setPhase("gameover");
            setBestScore(b => Math.max(b, stateRef.current.score));
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
  }, [phase]);

  const speedKmh = Math.round(120 + (frameSpeed - BASE_SPEED) * 60);

  // touch / swipe for mobile
  const touchX = useRef(null);
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current === null || phase !== "playing") return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 28) {
      if (dx < 0) setPlayerLane(l => Math.max(0, l - 1));
      else         setPlayerLane(l => Math.min(2, l + 1));
    }
    touchX.current = null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      {/* track */}
      <div
        className="race-track"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* road */}
        <div className="race-road-bg" />

        {/* speed lines */}
        {phase === "playing" && [15, 80, 155, 230, 295].map((x, i) => (
          <div key={i} className="speed-line"
            style={{ left: x, height: 60 + i * 20,
              animationDelay: `${i * 0.08}s`,
              animationDuration: `${0.28 + i * 0.04}s`,
              opacity: Math.min(1, (frameSpeed - BASE_SPEED) * 0.4),
            }}
          />
        ))}

        {/* edges */}
        <div className="race-edge race-edge-l" />
        <div className="race-edge race-edge-r" />

        {/* lane dashes */}
        <div className="race-lane-line" style={{ left: LANE_W - 1 }} />
        <div className="race-lane-line" style={{ left: LANE_W * 2 - 1 }} />

        {/* HUD */}
        <div className="race-hud">
          <div>
            <span className="hud-label">Score</span>
            <span className="hud-val">{String(Math.floor(score / 10)).padStart(5, "0")}</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="race-lives">
              {[0, 1, 2].map(i => (
                <div key={i} className={`life-pip${i >= lives ? " dead" : ""}`} />
              ))}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="hud-label">Speed</span>
            <span className="hud-val">{speedKmh}</span>
          </div>
        </div>

        {/* obstacles */}
        {obstacles.map(o => (
          <div key={o.id} style={{ position: "absolute", left: LANES[o.lane], top: o.y }}>
            <ObstacleCar color={o.color} />
          </div>
        ))}

        {/* player */}
        <motion.div
          style={{ position: "absolute", top: PLAYER_Y }}
          animate={{ left: LANES[playerLane] }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          <motion.div
            animate={crashed ? { x: [0, -6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            <PlayerCar />
          </motion.div>
        </motion.div>

        {/* crash flash */}
        <AnimatePresence>
          {crashed && (
            <motion.div className="crash-flash"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>

        {/* IDLE overlay */}
        <AnimatePresence>
          {phase === "idle" && (
            <motion.div className="game-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 28 }}
              >🏎️</motion.div>
              <div className="overlay-title" style={{ color: "#c084fc" }}>Connection Lost</div>
              <div className="overlay-sub">Race while we reconnect</div>
              <motion.button
                className="overlay-btn"
                onClick={startGame}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                Start Racing
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DEAD (temp) overlay */}
        <AnimatePresence>
          {phase === "dead" && (
            <motion.div className="game-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1], rotate: [0, -15, 15, 0] }}
                transition={{ duration: 0.5 }}
                style={{ fontSize: 26 }}
              >💥</motion.div>
              <div className="overlay-title" style={{ color: "#ff006e", fontSize: 13 }}>CRASHED!</div>
              <div className="overlay-sub">Resuming in 1s…</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GAME OVER overlay */}
        <AnimatePresence>
          {phase === "gameover" && (
            <motion.div className="game-overlay"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -8, 8, 0] }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{ fontSize: 28 }}
              >🚨</motion.div>
              <div className="overlay-title" style={{ color: "#ff006e" }}>Game Over</div>
              <div>
                <div className="hud-label" style={{ textAlign: "center", marginBottom: 4 }}>Score</div>
                <div className="overlay-score">{String(Math.floor(score / 10)).padStart(5, "0")}</div>
              </div>
              {bestScore > 0 && (
                <div className="overlay-sub">Best: {String(Math.floor(bestScore / 10)).padStart(5, "0")}</div>
              )}
              <motion.button
                className="overlay-btn"
                onClick={startGame}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              >
                Try Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* key hints */}
      <div className="key-hints">
        {/* <div className="key-cap">◀</div>
        <div className="key-sep">LANE</div>
        <div className="key-cap">▶</div>
        <div className="key-sep">·</div> */}
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:8, color:"rgba(185,194,217,0.35)", letterSpacing:2 }}>
          SWIPE ON MOBILE
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CYBER LOADER
═══════════════════════════════════════════════ */
function CyberLoader() {
  return (
    <div className="hs-loader-root" role="status" aria-label="Loading">
      <div className="hs-loader-topline" />
      <div className="hs-loader-scanlines" />
      <div className="hs-loader-orb hs-loader-orb-1" />
      <div className="hs-loader-orb hs-loader-orb-2" />
      <div className="hs-loader-corner hs-lc-tl" />
      <div className="hs-loader-corner hs-lc-tr" />
      <div className="hs-loader-corner hs-lc-bl" />
      <div className="hs-loader-corner hs-lc-br" />
      <div className="hs-loader-hex">D</div>
      <div className="hs-loader-bar-wrap">
        <div className="hs-loader-bar-track">
          <div className="hs-loader-bar-fill" />
        </div>
      </div>
      <div className="hs-loader-status">Initializing systems…</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ERROR SCREEN (game embed)
═══════════════════════════════════════════════ */
function ErrorScreen({ onRetry }) {
  return (
    <motion.div
      className="err-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <style>{ALL_CSS}</style>
      <div className="err-topline" />
      <div className="err-orb1" />
      <div className="err-orb2" />
      <div className="err-corner err-tl" />
      <div className="err-corner err-tr" />
      <div className="err-corner err-bl" />
      <div className="err-corner err-br" />

      {/* header */}
      <motion.div
        style={{ textAlign: "center", marginBottom: 16, position: "relative", zIndex: 1 }}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 22 }}
      >
        <motion.div
          style={{ fontSize: 11, fontFamily: "'Orbitron',monospace", letterSpacing: 4,
            color: "#ff006e", textTransform: "uppercase", marginBottom: 6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚠ Connection Failed
        </motion.div>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, letterSpacing: 3,
          color: "rgba(185,194,217,0.35)", textTransform: "uppercase" }}>
          Play while we reconnect
        </div>
      </motion.div>

      {/* game */}
      <motion.div
        style={{ position: "relative", zIndex: 1 }}
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 20 }}
      >
        <RacingGame onRetry={onRetry} />
      </motion.div>

      {/* retry link */}
      <motion.div
        style={{ position: "relative", zIndex: 1, marginTop: 14 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button className="retry-link" onClick={onRetry}>
          ↺ Retry Connection
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════ */
export default function Home() {
  const [status, setStatus]     = useState("loading"); // loading | error | success
  const [homeData, setHomeData] = useState({
    banners: [], events: [], combo_packs: [], categories: [], stats: {},
  });

  const loadHomePage = async () => {
    setStatus("loading");
    try {
      const res = await getHomePage();
      if (res.success) {
        setHomeData(res.data);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  useEffect(() => { loadHomePage(); }, []);

  return (
    <>
      <style>{ALL_CSS}</style>
      <AnimatePresence mode="wait">
        {status === "loading" && <PageLoader key="loader"  />}
        {status === "error"   && <PageLoader key="error" onRetry={loadHomePage} />}
        {status === "success" && (
          <motion.div key="content"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Layout homeData={homeData} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}