import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, Gamepad2, IndianRupee, Pause, Play, Ticket, Users,
} from "lucide-react";
import { resolveImage } from "../../../components/home/homeStyles";
import { niceDate, niceTime } from "../common/userUi";

// Dashboard banner: upcoming exclusive events (bookable), the player's own
// upcoming event bookings, then featured games. One slide at a time, swipe on
// phones, arrows / dots / thumbnails everywhere. Titles and text are clamped so
// long names never push the buttons around.

const css = `
.bn { --acc: #00f5ff; --acc2: #7b2fff; position: relative; isolation: isolate; overflow: hidden; width: 100%;
  min-height: clamp(540px, 82svh, 760px); display: flex; flex-direction: column; background: #05040a; color: #fff;
  font-family: 'Rajdhani', 'Inter', sans-serif; user-select: none; touch-action: pan-y; }
.bn.event { --acc: #ff2d78; --acc2: #ffd60a; }
.bn.booked { --acc: #ffd60a; --acc2: #ff9f1c; }

.bn-bg { position: absolute; inset: 0; z-index: -2; background: radial-gradient(circle at 70% 35%, #1d1840, #05040a 70%); }
.bn-bg img { width: 100%; height: 100%; object-fit: cover; animation: bn-zoom 9s ease-out both; }
.bn-bg .ph { position: absolute; inset: 0; display: grid; place-items: start end; padding: 90px 6% 0 0; color: color-mix(in srgb, var(--acc) 55%, transparent);
  background: radial-gradient(circle at 80% 30%, color-mix(in srgb, var(--acc) 18%, transparent), transparent 55%); }
.bn-bg .ph svg { width: clamp(120px, 24vw, 300px); height: auto; opacity: .22; transform: rotate(-12deg); }
@media (min-width: 1024px) { .bn-bg .ph { place-items: center end; padding: 0 12% 0 0; } }
.bn-shade { position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(90deg, rgba(5,4,10,.94) 0%, rgba(5,4,10,.7) 45%, rgba(5,4,10,.15) 100%),
    linear-gradient(0deg, #05040a 0%, rgba(5,4,10,.2) 45%, rgba(5,4,10,.6) 100%); }
.bn-shade::after { content: ""; position: absolute; left: -10%; bottom: -30%; width: 60%; height: 70%; border-radius: 50%; filter: blur(60px);
  background: color-mix(in srgb, var(--acc) 22%, transparent); }
@keyframes bn-zoom { from { transform: scale(1.08); } to { transform: scale(1); } }
@keyframes bn-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

.bn-in { position: relative; flex: 1; width: 100%; max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; justify-content: flex-end;
  padding: 96px clamp(16px, 4vw, 40px) calc(96px + env(safe-area-inset-bottom)); }
.bn-copy { max-width: 620px; min-width: 0; }
.bn-copy > * { animation: bn-in .6s cubic-bezier(.22,1,.36,1) backwards; }
.bn-copy > :nth-child(2) { animation-delay: .06s; } .bn-copy > :nth-child(3) { animation-delay: .12s; }
.bn-copy > :nth-child(4) { animation-delay: .18s; } .bn-copy > :nth-child(5) { animation-delay: .24s; }
.bn-kicker { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 14px; padding: 7px 12px; border-radius: 999px;
  font: 700 11.5px/1 'Share Tech Mono', monospace; letter-spacing: .18em; text-transform: uppercase; color: #fff;
  background: color-mix(in srgb, var(--acc) 16%, rgba(5,4,10,.6)); border: 1px solid color-mix(in srgb, var(--acc) 50%, transparent);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); max-width: 100%; }
.bn-kicker svg { color: var(--acc); flex: none; }
.bn-kicker span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bn-title { margin: 0 0 14px; font: 900 clamp(28px, 5.4vw, 60px)/1.05 'Orbitron', sans-serif; text-transform: uppercase; letter-spacing: .01em;
  overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  text-shadow: 0 4px 30px rgba(0,0,0,.5); }
.bn-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.bn-meta span { display: inline-flex; align-items: center; gap: 6px; min-height: 32px; padding: 0 12px; border-radius: 10px; font-weight: 700; font-size: 15px;
  color: #e6e3f5; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); white-space: nowrap; }
.bn-meta svg { color: var(--acc); flex: none; }
.bn-desc { margin: 0 0 22px; max-width: 520px; color: #b7b1d6; font-size: 17px; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bn-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.bn-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px; padding: 0 22px; border-radius: 14px;
  text-decoration: none; white-space: nowrap; font: 800 12.5px/1 'Orbitron', sans-serif; letter-spacing: .1em; text-transform: uppercase;
  color: #05040a; background: linear-gradient(135deg, var(--acc), color-mix(in srgb, var(--acc) 55%, #fff));
  box-shadow: 0 10px 28px color-mix(in srgb, var(--acc) 35%, transparent); transition: transform .2s, box-shadow .25s; }
.bn-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 34px color-mix(in srgb, var(--acc) 50%, transparent); }
.bn-btn.ghost { color: #fff; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.18); box-shadow: none;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.bn-btn.ghost:hover { border-color: var(--acc); }
.bn-btn svg { flex: none; transition: transform .2s; } .bn-btn:hover svg { transform: translateX(3px); }

.bn-bar { display: flex; align-items: center; gap: 12px; margin-top: 28px; }
.bn-arrow { width: 44px; height: 44px; flex: none; display: grid; place-items: center; border-radius: 12px; cursor: pointer; color: #fff;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.16); transition: border-color .2s, background .2s;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.bn-arrow:hover { border-color: var(--acc); background: color-mix(in srgb, var(--acc) 14%, transparent); }
.bn-dots { display: flex; align-items: center; gap: 6px; min-width: 0; overflow: hidden; }
.bn-dot { position: relative; overflow: hidden; width: 8px; height: 8px; flex: none; padding: 0; border: 0; border-radius: 99px; cursor: pointer;
  background: rgba(255,255,255,.25); transition: width .35s cubic-bezier(.22,1,.36,1), background .3s; }
.bn-dot.on { width: 30px; background: rgba(255,255,255,.18); }
.bn-dot.on::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: var(--acc); transform-origin: left;
  animation: bn-fill var(--dur, 6s) linear both; }
.bn.paused .bn-dot.on::after { animation-play-state: paused; }
@keyframes bn-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.bn-count { margin-left: auto; font: 700 13px/1 'Share Tech Mono', monospace; letter-spacing: .12em; color: #a9a3c8; white-space: nowrap; }
.bn-count b { color: #fff; font-size: 18px; }

.bn-thumbs { position: absolute; right: clamp(16px, 4vw, 40px); bottom: calc(96px + env(safe-area-inset-bottom)); display: none; gap: 10px; max-width: 46%;
  overflow-x: auto; scrollbar-width: none; padding: 4px; }
.bn-thumbs::-webkit-scrollbar { display: none; }
.bn-thumb { --acc: #00f5ff; position: relative; flex: none; width: 128px; height: 84px; padding: 0; overflow: hidden; border-radius: 14px; cursor: pointer;
  border: 1px solid rgba(255,255,255,.14); background: radial-gradient(circle at 50% 40%, #1d1840, #0a0a18); color: #fff; text-align: left;
  opacity: .62; transition: opacity .25s, transform .25s, border-color .25s; }
.bn-thumb.event { --acc: #ff2d78; } .bn-thumb.booked { --acc: #ffd60a; }
.bn-thumb:hover { opacity: .9; transform: translateY(-3px); }
.bn-thumb.on { opacity: 1; border-color: var(--acc); box-shadow: 0 0 0 1px var(--acc), 0 10px 24px rgba(0,0,0,.45); }
.bn-thumb img { width: 100%; height: 100%; object-fit: cover; }
.bn-thumb > svg { position: absolute; top: 50%; left: 50%; translate: -50% -60%; color: var(--acc); opacity: .6; }
.bn-thumb span { position: absolute; left: 0; right: 0; bottom: 0; padding: 18px 8px 6px; font: 700 11px/1.2 'Rajdhani', sans-serif; letter-spacing: .04em;
  background: linear-gradient(0deg, rgba(5,4,10,.95), transparent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.bn-empty { display: grid; place-items: center; gap: 12px; min-height: 380px; padding: 96px 16px; text-align: center; color: #a9a3c8; }
.bn-empty svg { color: #00f5ff; }

@media (min-width: 1024px) {
  .bn-thumbs { display: flex; }
  .bn-in { justify-content: center; }
  .bn-copy, .bn-bar { max-width: min(620px, 50%); }
}
@media (max-width: 640px) {
  .bn-in { padding-top: 88px; }
  .bn-desc { font-size: 15.5px; }
  .bn-meta span { font-size: 14px; }
  .bn-actions .bn-btn { flex: 1 1 auto; }
  .bn-bar { margin-top: 22px; }
}
@media (max-width: 380px) { .bn-actions .bn-btn { flex-basis: 100%; } }
@media (prefers-reduced-motion: reduce) {
  .bn-bg img, .bn-copy > * { animation: none; }
  .bn-dot.on::after { animation: none; transform: none; }
}
`;

const money = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : null;
};

function eventSlide(e) {
  return {
    key: `event-${e.id}`,
    kind: "event",
    label: "Exclusive event",
    title: e.title || "Upcoming event",
    image: e.image,
    text: e.description,
    date: e.event_date,
    start: e.start_time,
    price: money(e.price),
    priceUnit: "/ seat",
    seats: e.available_slots,
    cta: { to: `/user/book/event/${e.id}`, label: "Book a seat" },
    more: { to: "/user/events", label: "All events" },
  };
}

function bookedSlide(b) {
  return {
    key: `booked-${b.id}`,
    kind: "booked",
    label: `You're going · ${b.status || "booked"}`,
    title: b.event_title || "Your event",
    image: b.event_image,
    text: b.event_description,
    date: b.event_date,
    start: b.start_time,
    id: b.booking_id,
    cta: { to: "/user/bookings", label: "View booking" },
    more: { to: "/user/events", label: "More events" },
  };
}

function gameSlide(g) {
  return {
    key: `game-${g.id}`,
    kind: "game",
    label: g.category_name || "Featured game",
    title: g.name || "Featured game",
    image: g.image,
    text: g.description,
    price: money(g.price_per_hour),
    priceUnit: "/ hour",
    cta: { to: `/user/games/${g.id}/book`, label: "Book now" },
    more: { to: `/user/games/${g.id}`, label: "Details" },
  };
}

const KIND_ICON = { event: Ticket, booked: CalendarDays, game: Gamepad2 };

function Thumb({ slide, on, onClick }) {
  const Icon = KIND_ICON[slide.kind];
  const img = resolveImage(slide.image);
  return (
    <button type="button" className={`bn-thumb ${slide.kind}${on ? " on" : ""}`} onClick={onClick}
      aria-label={`Show ${slide.title}`} aria-current={on ? "true" : undefined}>
      {img ? <img src={img} alt="" loading="lazy" /> : <Icon size={26} aria-hidden="true" />}
      <span>{slide.title}</span>
    </button>
  );
}

function ExclusiveEventsCarousel({ events, games, bookings, autoPlayMs = 6000 }) {
  const today = new Date().toISOString().slice(0, 10);
  const evs = (Array.isArray(events) ? events : []).map(eventSlide);
  const evIds = new Set((Array.isArray(events) ? events : []).map((e) => String(e.id)));
  const mine = (Array.isArray(bookings) ? bookings : [])
    .filter((b) => b && b.event_date >= today && !["cancelled", "rejected"].includes(b.status) && !evIds.has(String(b.event)))
    .sort((a, b) => String(a.event_date).localeCompare(String(b.event_date)))
    .slice(0, 3)
    .map(bookedSlide);
  const gms = (Array.isArray(games) ? games : []).filter((g) => g && !g.maintenance_mode && g.id != null).slice(0, 6).map(gameSlide);
  const slides = [...evs, ...mine, ...gms];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false); // pause button
  const [hover, setHover] = useState(false); // mouse over the banner
  const touchX = useRef(null);
  const n = slides.length;
  const cur = Math.min(index, Math.max(n - 1, 0));

  const go = useCallback((i) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused || hover) return undefined;
    const t = setTimeout(() => go(cur + 1), autoPlayMs);
    return () => clearTimeout(t);
  }, [cur, n, paused, hover, autoPlayMs, go]);

  if (!n) {
    return (
      <section className="bn bn-empty" aria-label="Featured">
        <style>{css}</style>
        <Gamepad2 size={40} aria-hidden="true" />
        <p>No featured events or games right now.</p>
        <Link className="bn-btn" to="/user/game-items">Browse games <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
    );
  }

  const s = slides[cur];
  const Icon = KIND_ICON[s.kind];
  const img = resolveImage(s.image);

  return (
    <section
      className={`bn ${s.kind}${paused || hover ? " paused" : ""}`}
      aria-roledescription="carousel"
      aria-label="Featured events and games"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = touchX.current - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 50) go(cur + (dx > 0 ? 1 : -1));
        touchX.current = null;
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(cur - 1);
        if (e.key === "ArrowRight") go(cur + 1);
      }}
    >
      <style>{css}</style>

      <div className="bn-bg" key={`bg-${s.key}`} aria-hidden="true">
        {img ? <img src={img} alt="" /> : <div className="ph"><Icon strokeWidth={1} /></div>}
      </div>
      <div className="bn-shade" aria-hidden="true" />

      <div className="bn-in">
        <div className="bn-copy" key={s.key} aria-live="polite">
          <span className="bn-kicker"><Icon size={14} aria-hidden="true" /><span>{s.label}</span></span>
          <h2 className="bn-title" title={s.title}>{s.title}</h2>
          <div className="bn-meta">
            {s.date && <span><CalendarDays size={15} aria-hidden="true" />{niceDate(s.date)}</span>}
            {s.start && <span><Clock size={15} aria-hidden="true" />{niceTime(s.start)}</span>}
            {s.price && <span><IndianRupee size={15} aria-hidden="true" />{s.price.slice(1)} {s.priceUnit}</span>}
            {s.seats != null && <span><Users size={15} aria-hidden="true" />{s.seats} seats left</span>}
            {s.id && <span><Ticket size={15} aria-hidden="true" />{s.id}</span>}
          </div>
          {s.text ? <p className="bn-desc">{s.text}</p> : <div />}
          <div className="bn-actions">
            <Link className="bn-btn" to={s.cta.to}>{s.cta.label} <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link className="bn-btn ghost" to={s.more.to}>{s.more.label}</Link>
          </div>
        </div>

        {n > 1 && (
          <div className="bn-bar">
            <button type="button" className="bn-arrow" onClick={() => go(cur - 1)} aria-label="Previous slide">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" className="bn-arrow" onClick={() => go(cur + 1)} aria-label="Next slide">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
            <div className="bn-dots" role="tablist" aria-label="Slides">
              {slides.map((sl, i) => (
                <button key={`${sl.key}-${i === cur ? cur : "x"}`} type="button" role="tab" aria-selected={i === cur}
                  aria-label={`Slide ${i + 1}: ${sl.title}`} className={`bn-dot${i === cur ? " on" : ""}`}
                  style={{ "--dur": `${autoPlayMs}ms` }} onClick={() => go(i)} />
              ))}
            </div>
            <button type="button" className="bn-arrow" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              style={{ marginLeft: 4 }}>
              {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            </button>
            <span className="bn-count"><b>{String(cur + 1).padStart(2, "0")}</b> / {String(n).padStart(2, "0")}</span>
          </div>
        )}
      </div>

      {n > 1 && (
        <div className="bn-thumbs">
          {slides.map((sl, i) => <Thumb key={sl.key} slide={sl} on={i === cur} onClick={() => go(i)} />)}
        </div>
      )}
    </section>
  );
}

export default ExclusiveEventsCarousel;
