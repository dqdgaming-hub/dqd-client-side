/**
 * HeroSlider — home page banner: a swipeable card stack.
 *
 * Props
 *   banners  – array from API: { id, title, subtitle, image, type, action_url }
 *              type is "event" or "game". Events come first (if any), then games.
 *   signInUrl, redirectDelayMs – booking asks visitors to sign in.
 *
 * Swipe the top card left for the next one, right to go back (or use the
 * arrows / keyboard). Each card runs its own progress bar and flies off when
 * it fills; touching or hovering the stack pauses it.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Flame, Gamepad2, Hand, Sparkles, Trophy, Zap } from "lucide-react";
import { API_ORIGIN } from "../../api/config";

const EVENT_MS = 7000;
const GAME_MS = 5200;
const EASE = [0.22, 1, 0.36, 1];

const CSS = `
.hs3 { --cyan: #00f5ff; --pink: #ff2d78; --gold: #ffd60a; --purple: #7b2fff; --a1: var(--cyan); --a2: var(--purple);
  position: relative; isolation: isolate; overflow: hidden; min-height: 100svh; color: #fff; background: #05040a;
  font-family: 'Rajdhani', 'Inter', sans-serif; }
.hs3.ev { --a1: var(--pink); --a2: var(--gold); }
.hs3 * { box-sizing: border-box; }

/* backdrop: aurora in the active card's colours + soft grid + brand watermark */
.hs3-aurora { position: absolute; inset: -20%; z-index: -3; opacity: .5; pointer-events: none; }
.hs3-aurora i { position: absolute; width: 55vmax; height: 55vmax; border-radius: 50%; will-change: transform; }
.hs3-aurora i:nth-child(1) { left: 5%; top: 10%; background: radial-gradient(circle, var(--a1), transparent 70%); animation: hs3-a 16s ease-in-out infinite alternate; }
.hs3-aurora i:nth-child(2) { right: 0; bottom: 0; background: radial-gradient(circle, var(--a2), transparent 70%); animation: hs3-a 20s ease-in-out infinite alternate-reverse; }
.hs3-aurora i:nth-child(3) { left: 40%; top: 45%; width: 35vmax; height: 35vmax; background: radial-gradient(circle, var(--purple), transparent 70%); animation: hs3-a 24s ease-in-out infinite alternate; }
@keyframes hs3-a { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(8%, -6%) scale(1.15); } 100% { transform: translate(-6%, 8%) scale(.95); } }
.hs3-bgimg { position: absolute; inset: 0; z-index: -4; }
.hs3-bgimg img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(30px) brightness(.35) saturate(1.4); transform: scale(1.15) translateZ(0); will-change: opacity; }
.hs3-grid { position: absolute; inset: 0; z-index: -2; pointer-events: none; opacity: .4;
  background-image: radial-gradient(rgba(255,255,255,.12) 1px, transparent 1px); background-size: 26px 26px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, #000, transparent 80%); -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, #000, transparent 80%); }
.hs3-vignette { position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(ellipse 90% 80% at 50% 45%, transparent 40%, rgba(5,4,10,.85) 100%), linear-gradient(0deg, #05040a, transparent 25%); }
.hs3-mark { position: absolute; z-index: -1; left: 50%; top: 50%; translate: -50% -50%; white-space: nowrap; pointer-events: none;
  font: 900 clamp(90px, 20vw, 300px)/1 'Orbitron', sans-serif; letter-spacing: .02em; color: transparent; -webkit-text-stroke: 1.5px rgba(255,255,255,.05); }

/* layout */
.hs3-in { position: relative; min-height: 100svh; max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  align-items: center; gap: clamp(28px, 5vw, 80px); padding: 92px clamp(20px, 5vw, 56px) 100px; }

/* brand intro (desktop left, phone top) */
.hs3-kicker { display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; border-radius: 999px; margin-bottom: 18px;
  font: 700 12px/1 'Share Tech Mono', monospace; letter-spacing: .24em; text-transform: uppercase; color: #cfeeff;
  border: 1px solid rgba(255,255,255,.14); background: rgba(18,16,40,.72); }
.hs3-kicker i { width: 7px; height: 7px; border-radius: 50%; background: var(--a1); box-shadow: 0 0 10px var(--a1); animation: hs3-blink 1.6s ease-in-out infinite; }
@keyframes hs3-blink { 50% { opacity: .3; } }
.hs3-h1 { margin: 0; font: 900 clamp(38px, 6.2vw, 86px)/.98 'Orbitron', sans-serif; letter-spacing: .01em; text-transform: uppercase; color: #fff; }
.hs3-h1 span { display: block; }
.hs3-h1 .g { background: linear-gradient(90deg, var(--cyan), var(--purple) 50%, var(--pink)); background-size: 200% 100%;
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: hs3-flow 6s linear infinite; }
@keyframes hs3-flow { to { background-position: -200% 0; } }
.hs3-lead { margin: 18px 0 26px; max-width: 470px; color: #bfb9dc; font-size: clamp(15px, 1.4vw, 18px); line-height: 1.6; }
.hs3-quick { display: flex; flex-wrap: wrap; gap: 10px; }
.hs3-q { display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 18px; border-radius: 14px; text-decoration: none;
  font: 700 15px/1 'Rajdhani', sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #fff;
  border: 1px solid rgba(255,255,255,.16); background: rgba(18,16,40,.72);
  transition: transform .2s, border-color .2s, background .2s; }
.hs3-q:hover { transform: translateY(-2px); border-color: rgba(255,255,255,.4); background: rgba(255,255,255,.1); }
.hs3-q svg { color: var(--c); }
.hs3-stats { display: flex; gap: 26px; margin-top: 30px; }
.hs3-stats b { display: flex; align-items: center; height: 26px; font: 900 24px/1 'Orbitron', sans-serif; }
.hs3-stats small { color: #8f89b0; font: 700 11px/1.3 'Share Tech Mono', monospace; letter-spacing: .14em; text-transform: uppercase; }

/* stack */
.hs3-stage { position: relative; display: grid; justify-items: center; gap: 18px; }
/* as big as the screen height allows, leaving room for the controls and the dock */
.hs3-stack { position: relative; width: min(100%, 520px, calc((100svh - 262px) * .77)); min-width: 300px; aspect-ratio: 4 / 5.2; }
.hs3-card { position: absolute; inset: 0; border-radius: 30px; overflow: hidden; background: #120f26; touch-action: pan-y; user-select: none;
  box-shadow: 0 30px 70px rgba(0,0,0,.55); will-change: transform; }
.hs3-card.front { cursor: grab; box-shadow: 0 40px 90px rgba(0,0,0,.6), 0 0 60px color-mix(in srgb, var(--c1) 30%, transparent); }
.hs3-card.front:active { cursor: grabbing; }
.hs3-card img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.hs3-art { width: 100%; height: 100%; display: grid; place-items: center;
  background: radial-gradient(circle at 25% 20%, color-mix(in srgb, var(--c1) 65%, transparent), transparent 55%),
    radial-gradient(circle at 80% 85%, color-mix(in srgb, var(--c2) 55%, transparent), transparent 55%), #140f2b; }
.hs3-art svg { width: 40%; height: auto; margin-bottom: 30%; color: rgba(255,255,255,.85); stroke-width: 1.1; filter: drop-shadow(0 0 30px rgba(255,255,255,.35)); }
.hs3-shade { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(5,4,10,.97) 0%, rgba(5,4,10,.6) 38%, transparent 62%),
  linear-gradient(180deg, rgba(5,4,10,.55), transparent 22%); pointer-events: none; }
.hs3-edge { position: absolute; inset: 0; border-radius: inherit; padding: 1.5px; pointer-events: none;
  background: linear-gradient(150deg, var(--c1), transparent 35%, transparent 65%, var(--c2));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
.hs3-shine { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.hs3-shine::before { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 60%; will-change: transform;
  background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,.12) 50%, transparent 80%); animation: hs3-shine 5s ease-in-out infinite; }
@keyframes hs3-shine { 0%, 65% { transform: translateX(-110%); } 100% { transform: translateX(260%); } }

/* inside the front card */
.hs3-bars { position: absolute; top: 14px; left: 16px; right: 16px; display: flex; gap: 5px; z-index: 2; }
.hs3-bars span { position: relative; flex: 1; height: 3px; border-radius: 3px; background: rgba(255,255,255,.25); overflow: hidden; }
.hs3-bars span.done::after { content: ""; position: absolute; inset: 0; background: #fff; }
.hs3-bars i { position: absolute; inset: 0; transform-origin: left; background: #fff; }
.hs3-top { position: absolute; top: 30px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; z-index: 2; }
.hs3-tag { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 999px; font: 800 10.5px/1 'Orbitron', sans-serif;
  letter-spacing: .14em; text-transform: uppercase; color: #fff; }
.hs3-tag.ev { background: linear-gradient(135deg, var(--pink), #ff7a3d); box-shadow: 0 8px 22px rgba(255,45,120,.5); }
.hs3-tag.gm { background: rgba(5,5,15,.6); border: 1px solid rgba(0,245,255,.55); color: var(--cyan); background: rgba(5,5,15,.78); }
.hs3-num { font: 700 12px/1 'Share Tech Mono', monospace; letter-spacing: .14em; color: rgba(255,255,255,.75); padding: 6px 9px; border-radius: 8px; background: rgba(5,5,15,.45); }
.hs3-body { position: absolute; left: 0; right: 0; bottom: 0; padding: 22px; z-index: 2; text-align: left; }
.hs3-title { margin: 0 0 8px; font: 900 clamp(22px, 3vw, 32px)/1.05 'Orbitron', sans-serif; text-transform: uppercase; letter-spacing: .02em; color: #fff;
  text-shadow: 0 4px 24px rgba(0,0,0,.6); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.hs3-desc { margin: 0 0 16px; color: #d6d1ee; font-size: 15px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.hs3-row { display: flex; gap: 10px; align-items: center; }
.hs3-cta { position: relative; overflow: hidden; flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px; padding: 0 18px;
  border: 0; border-radius: 16px; cursor: pointer; text-decoration: none; font: 800 13px/1 'Orbitron', sans-serif; letter-spacing: .12em; text-transform: uppercase;
  color: #05040a; background: linear-gradient(135deg, var(--c1), var(--c2)); box-shadow: 0 12px 30px color-mix(in srgb, var(--c1) 45%, transparent); }
.hs3-card.is-ev .hs3-cta { color: #fff; }
.hs3-cta::after { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 50%; will-change: transform;
  background: linear-gradient(110deg, transparent 10%, rgba(255,255,255,.45) 50%, transparent 90%); animation: hs3-ctash 3s ease-in-out infinite; }
@keyframes hs3-ctash { 0%, 55% { transform: translateX(-110%); } 100% { transform: translateX(220%); } }
.hs3-more { flex: none; display: grid; place-items: center; width: 52px; height: 52px; border-radius: 16px; color: #fff; text-decoration: none;
  border: 1px solid rgba(255,255,255,.22); background: rgba(20,18,40,.7); }

/* swipe stamps */
.hs3-stamp { position: absolute; top: 42%; z-index: 3; padding: 8px 14px; border-radius: 12px; border: 3px solid currentColor; pointer-events: none;
  font: 900 20px/1 'Orbitron', sans-serif; letter-spacing: .1em; text-transform: uppercase; background: rgba(5,5,15,.35); }
.hs3-stamp.next { right: 18px; color: var(--cyan); rotate: 12deg; }
.hs3-stamp.back { left: 18px; color: var(--gold); rotate: -12deg; }

/* controls under the stack */
.hs3-ctrl { display: flex; align-items: center; gap: 14px; }
.hs3-btn { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 50%; cursor: pointer; color: #fff;
  border: 1px solid rgba(255,255,255,.2); background: rgba(10,10,22,.82);
  transition: transform .2s, border-color .2s, background .2s; }
.hs3-btn:hover { transform: scale(1.06); border-color: var(--a1); background: color-mix(in srgb, var(--a1) 15%, transparent); }
.hs3-hint { display: inline-flex; align-items: center; gap: 8px; color: #a9a3c8; font: 700 12px/1 'Share Tech Mono', monospace; letter-spacing: .2em; text-transform: uppercase; }
.hs3-hint svg { animation: hs3-swipe 2s ease-in-out infinite; }
@keyframes hs3-swipe { 0%, 100% { transform: translateX(6px) rotate(8deg); } 50% { transform: translateX(-8px) rotate(-10deg); } }

/* sign-in overlay */
.hs3-redirect { position: fixed; inset: 0; z-index: 9000; display: grid; place-items: center; padding: 20px;
  background: rgba(3,3,10,.78); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.hs3-redirect-box { width: min(360px, 100%); text-align: center; padding: 28px 22px; border-radius: 22px;
  background: linear-gradient(160deg, #15132b, #0a0a18); border: 1px solid rgba(0,245,255,.3); box-shadow: 0 30px 80px rgba(0,0,0,.6); }
.hs3-spin { width: 54px; height: 54px; margin: 0 auto 16px; border-radius: 50%; border: 3px solid rgba(0,245,255,.2); border-top-color: var(--cyan); animation: hs3-rot .8s linear infinite; }
@keyframes hs3-rot { to { transform: rotate(360deg); } }
.hs3-redirect-box strong { display: block; font: 800 18px/1.2 'Orbitron', sans-serif; letter-spacing: .06em; margin-bottom: 6px; }
.hs3-redirect-box p { margin: 0; color: #a9a3c8; font-size: 15px; }
.hs3-empty { display: grid; place-items: center; height: 60vh; color: #8f89b0; font: 700 14px 'Share Tech Mono', monospace; letter-spacing: .2em; }

/* tablet & phone: compact intro on top, stack fills the screen */
@media (max-width: 900px) {
  .hs3-in { grid-template-columns: minmax(0, 1fr); align-content: start; gap: 18px; padding: 92px 12px 104px; text-align: center; }
  .hs3-kicker { margin-bottom: 10px; }
  .hs3-h1 { font-size: clamp(26px, 7.4vw, 44px); }
  .hs3-h1 span { display: inline; }
  .hs3-lead, .hs3-quick, .hs3-stats { display: none; }
  .hs3-stack { width: min(100%, 480px, calc((100svh - 350px) * .77)); min-width: 260px; }
  .hs3-mark { top: 40%; }
}
@media (max-width: 480px) {
  .hs3-body { padding: 18px; }
  .hs3-desc { font-size: 14px; margin-bottom: 14px; }
  .hs3-btn { width: 44px; height: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  .hs3-aurora i, .hs3-kicker i, .hs3-h1 .g, .hs3-shine, .hs3-cta::after, .hs3-hint svg, .hs3-spin { animation: none; }
}
`;

function resolveImage(url) {
  if (!url) return "";
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url)) return url;
  return new URL(url, `${API_ORIGIN}/`).href;
}

/* Where the cards behind the front one sit */
const POSES = [
  { y: 0, scale: 1, rotate: 0, opacity: 1 },
  { y: -20, scale: 0.93, rotate: 0, opacity: 0.8 },
  { y: -38, scale: 0.86, rotate: 0, opacity: 0.5 },
];

const colors = (slide) => (slide.type === "event" ? { c1: "#ff2d78", c2: "#ffd60a" } : { c1: "#00f5ff", c2: "#7b2fff" });

function Card({ slide, depth, enter, total, index, paused, onSwipe, onSignIn, reduce, flyRef }) {
  const front = depth === 0;
  const ev = slide.type === "event";
  const { c1, c2 } = colors(slide);
  const x = useMotionValue(0);
  const dragRotate = useTransform(x, [-320, 320], [-16, 16]);
  const nextOpacity = useTransform(x, [-140, -30], [1, 0]);
  const backOpacity = useTransform(x, [30, 140], [0, 1]);
  const progress = useMotionValue(0);
  const flying = useRef(false);
  const duration = ev ? EVENT_MS : GAME_MS;

  const fly = useCallback(
    (dir) => {
      if (flying.current) return;
      if (dir > 0) {
        // next: throw this card off to the left
        flying.current = true;
        animate(x, -Math.max(window.innerWidth, 600), { duration: reduce ? 0 : 0.42, ease: EASE }).then(() => onSwipe(1));
      } else {
        // back: this card settles, the previous one slides in on top
        animate(x, 0, { duration: 0.25 });
        onSwipe(-1);
      }
    },
    [x, onSwipe, reduce],
  );

  // The arrow buttons and keys play the same throw / slide-in as a swipe.
  useEffect(() => {
    if (!front) return undefined;
    flyRef.current = fly;
    return () => {
      if (flyRef.current === fly) flyRef.current = null;
    };
  }, [front, fly, flyRef]);

  // With 3 or fewer slides a card that flew off comes back into the stack: reset it.
  useEffect(() => {
    if (front) return;
    flying.current = false;
    x.set(0);
    progress.set(0);
  }, [front, x, progress]);

  // progress bar + auto-advance for the front card
  useEffect(() => {
    if (!front || total < 2 || paused) return undefined;
    const left = (1 - progress.get()) * duration;
    const ctl = animate(progress, 1, { duration: left / 1000, ease: "linear", onComplete: () => fly(1) });
    return () => ctl.stop();
  }, [front, paused, duration, total, progress, fly]);

  const pose = POSES[Math.min(depth, 2)];
  return (
    <motion.div
      className={`hs3-card${front ? " front" : ""}${ev ? " is-ev" : ""}`}
      style={{ x, rotate: front ? dragRotate : pose.rotate, zIndex: 10 - depth, "--c1": c1, "--c2": c2 }}
      initial={reduce ? false : enter < 0 && front ? { x: -520, opacity: 0 } : { y: -70, scale: 0.72, opacity: 0 }}
      animate={front && enter < 0 ? { x: 0, y: pose.y, scale: pose.scale, opacity: pose.opacity } : { y: pose.y, scale: pose.scale, opacity: pose.opacity }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 210, damping: 24 }}
      drag={front && total > 1 ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x < -110 || info.velocity.x < -600) fly(1);
        else if (info.offset.x > 110 || info.velocity.x > 600) fly(-1);
      }}
      aria-hidden={!front}
    >
      {slide.image ? (
        <img src={resolveImage(slide.image)} alt="" draggable={false} />
      ) : (
        <div className="hs3-art">{ev ? <CalendarDays /> : <Gamepad2 />}</div>
      )}
      <div className="hs3-shade" />
      <div className="hs3-edge" />
      {front && (
        <>
          <div className="hs3-shine" />
          {total > 1 && (
            <div className="hs3-bars" aria-hidden="true">
              {Array.from({ length: total }, (_, i) => (
                <span key={i} className={i < index ? "done" : ""}>
                  {i === index && <motion.i style={{ scaleX: progress }} />}
                </span>
              ))}
            </div>
          )}
          <div className="hs3-top">
            <span className={`hs3-tag ${ev ? "ev" : "gm"}`}>
              {ev ? <Flame size={13} aria-hidden="true" /> : <Gamepad2 size={13} aria-hidden="true" />}
              {ev ? "Live event" : "Game"}
            </span>
            <span className="hs3-num">{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          </div>
          <motion.div className="hs3-stamp next" style={{ opacity: nextOpacity }} aria-hidden="true">Next</motion.div>
          <motion.div className="hs3-stamp back" style={{ opacity: backOpacity }} aria-hidden="true">Back</motion.div>
          <div className="hs3-body">
            <motion.h2 className="hs3-title" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45, ease: EASE }}>
              {slide.title}
            </motion.h2>
            {slide.subtitle && (
              <motion.p className="hs3-desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.45 }}>
                {slide.subtitle}
              </motion.p>
            )}
            <motion.div className="hs3-row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45 }}>
              <a href={slide.action_url || "#"} className="hs3-cta" onClick={onSignIn} onPointerDownCapture={(e) => e.stopPropagation()}>
                {ev ? "View Event" : "Book Now"} <ArrowRight size={17} aria-hidden="true" />
              </a>
              <Link
                to={ev ? "/events" : "/games"}
                className="hs3-more"
                aria-label={ev ? "All events" : "All games"}
                onPointerDownCapture={(e) => e.stopPropagation()}
              >
                {ev ? <CalendarDays size={20} /> : <Gamepad2 size={20} />}
              </Link>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function HeroSlider({ banners = [], signInUrl = "/sign-in", redirectDelayMs = 900 }) {
  const reduce = useReducedMotion();
  const slides = useMemo(
    () => [...banners.filter((b) => b.type === "event"), ...banners.filter((b) => b.type !== "event")],
    [banners],
  );
  const N = slides.length;
  const eventCount = slides.filter((b) => b.type === "event").length;
  const [index, setIndex] = useState(0);
  const [enter, setEnter] = useState(1);
  const [paused, setPaused] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const flyRef = useRef(null); // the front card's swipe animation

  const safe = N ? index % N : 0;
  const active = slides[safe];
  const isEvent = active?.type === "event";

  const onSwipe = useCallback(
    (dir) => {
      if (!N) return;
      setEnter(dir);
      setIndex((i) => (((i + dir) % N) + N) % N);
    },
    [N],
  );

  // Animated step, as if the card was swiped.
  const go = useCallback((dir) => (flyRef.current ? flyRef.current(dir) : onSwipe(dir)), [onSwipe]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, select")) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const signIn = (e) => {
    e.preventDefault();
    if (redirecting) return;
    setRedirecting(true);
    setTimeout(() => {
      window.location.href = signInUrl;
    }, redirectDelayMs);
  };

  if (!N) {
    return (
      <>
        <style>{CSS}</style>
        <div className="hs3-empty">NO BANNERS AVAILABLE</div>
      </>
    );
  }

  const stack = [];
  for (let k = Math.min(2, N - 1); k >= 0; k--) stack.push({ slide: slides[(safe + k) % N], depth: k });

  return (
    <>
      <style>{CSS}</style>
      <section className={`hs3${isEvent ? " ev" : ""}`} aria-roledescription="carousel" aria-label="Featured events and games">
        <div className="hs3-bgimg" aria-hidden="true">
          <AnimatePresence initial={false}>
            {active.image && (
              <motion.img key={active.id} src={resolveImage(active.image)} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} />
            )}
          </AnimatePresence>
        </div>
        <div className="hs3-aurora" aria-hidden="true"><i /><i /><i /></div>
        <div className="hs3-grid" aria-hidden="true" />
        <div className="hs3-vignette" aria-hidden="true" />
        <div className="hs3-mark" aria-hidden="true">DQD</div>

        <div className="hs3-in">
          <motion.div
            className="hs3-intro"
            initial={reduce ? false : { opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="hs3-kicker">
              <i aria-hidden="true" /> {isEvent ? "Live events this week" : "Kochi's gaming arena"}
            </span>
            <h1 className="hs3-h1">
              <span>Play.</span> <span>Compete.</span> <span className="g">Win.</span>
            </h1>
            <p className="hs3-lead">
              Book consoles, pool tables and private screens in seconds. Join tournaments, grab combo deals and earn points every time you play.
            </p>
            <div className="hs3-quick">
              {eventCount > 0 && (
                <Link to="/events" className="hs3-q" style={{ "--c": "#ff2d78" }}>
                  <Trophy size={18} aria-hidden="true" /> Events
                </Link>
              )}
              <Link to="/games" className="hs3-q" style={{ "--c": "#00f5ff" }}>
                <Gamepad2 size={18} aria-hidden="true" /> Games
              </Link>
              <Link to="/combo-packs" className="hs3-q" style={{ "--c": "#ffd60a" }}>
                <Zap size={18} aria-hidden="true" /> Combo deals
              </Link>
            </div>
            <div className="hs3-stats" aria-hidden="true">
              <div><b>{eventCount}</b><small>Upcoming<br />events</small></div>
              <div><b>{N - eventCount}</b><small>Featured<br />games</small></div>
              <div><b><Sparkles size={22} /></b><small>Loyalty<br />rewards</small></div>
            </div>
          </motion.div>

          <motion.div
            className="hs3-stage"
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          >
            <div
              className="hs3-stack"
              onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
              onPointerDown={(e) => e.pointerType !== "mouse" && setPaused(true)}
              onPointerUp={(e) => e.pointerType !== "mouse" && setPaused(false)}
              onPointerCancel={() => setPaused(false)}
            >
              <AnimatePresence initial={false}>
                {stack.map(({ slide, depth }) => (
                  <Card
                    key={slide.id}
                    slide={slide}
                    depth={depth}
                    enter={enter}
                    total={N}
                    index={safe}
                    paused={paused || redirecting}
                    onSwipe={onSwipe}
                    onSignIn={signIn}
                    reduce={reduce}
                    flyRef={flyRef}
                  />
                ))}
              </AnimatePresence>
            </div>
            {N > 1 && (
              <div className="hs3-ctrl">
                <button type="button" className="hs3-btn" onClick={() => go(-1)} aria-label="Previous">
                  <ChevronLeft size={22} />
                </button>
                <span className="hs3-hint"><Hand size={16} aria-hidden="true" /> Swipe</span>
                <button type="button" className="hs3-btn" onClick={() => go(1)} aria-label="Next">
                  <ChevronRight size={22} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {redirecting && (
          <motion.div className="hs3-redirect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="hs3-redirect-box" initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
              <div className="hs3-spin" aria-hidden="true" />
              <strong>Sign in to continue</strong>
              <p>Taking you to sign in…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
