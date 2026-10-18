import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Flame, Ticket, Users } from "lucide-react";
import { Reveal, SectionHead, SwipeHint } from "./homeTheme";
import { homeCss, money, resolveImage } from "./homeStyles";

const css = `
.ev2 { background: radial-gradient(ellipse 60% 50% at 10% 0%, rgba(255,45,120,.16), transparent 60%),
  radial-gradient(ellipse 50% 50% at 95% 100%, rgba(123,47,255,.16), transparent 60%), #07060f; }
.ev2 .hm-card { --acc: var(--pink); --acc2: var(--gold); }

/* featured event */
.ev2-hero { --acc: var(--pink); position: relative; isolation: isolate; display: grid; grid-template-columns: 1.15fr 1fr; overflow: hidden;
  border-radius: 28px; margin-bottom: 22px; min-height: 380px;
  background: linear-gradient(135deg, #1a0d24, #0b0a18); border: 1px solid rgba(255,45,120,.3);
  box-shadow: 0 30px 80px rgba(0,0,0,.5), 0 0 60px rgba(255,45,120,.12); }
.ev2-hero::after { content: ""; position: absolute; inset: -1px; z-index: 3; border-radius: inherit; padding: 1.5px; pointer-events: none;
  background: conic-gradient(from var(--ang, 0deg), transparent 0 70%, var(--pink) 80%, var(--gold) 88%, transparent 96%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
  animation: ev2-orbit 5s linear infinite; }
@property --ang { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@keyframes ev2-orbit { to { --ang: 360deg; } }
.ev2-hero-media { position: relative; overflow: hidden; min-height: 260px; }
.ev2-hero-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: ev2-zoom 14s ease-in-out infinite alternate; }
@keyframes ev2-zoom { from { transform: scale(1); } to { transform: scale(1.1); } }
.ev2-hero-media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 40%, #110b1e 100%); }
.ev2-hero-body { position: relative; display: flex; flex-direction: column; gap: 14px; padding: clamp(22px, 3vw, 38px); }
.ev2-next { display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; padding: 7px 13px; border-radius: 999px;
  font: 800 11px/1 'Orbitron', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #fff;
  background: linear-gradient(135deg, var(--pink), #ff7a3d); box-shadow: 0 8px 24px rgba(255,45,120,.45); }
.ev2-next i { width: 7px; height: 7px; border-radius: 50%; background: #fff; animation: ev2-ping 1.4s ease-out infinite; }
@keyframes ev2-ping { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,.8); } 100% { box-shadow: 0 0 0 9px rgba(255,255,255,0); } }
.ev2-hero h3 { margin: 0; font: 900 clamp(24px, 3.2vw, 38px)/1.05 'Orbitron', sans-serif; text-transform: uppercase; letter-spacing: .02em; }
.ev2-hero p { margin: 0; color: #b7b1d6; font-size: 16px; line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

.ev2-count { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ev2-count div { padding: 10px 4px; border-radius: 14px; text-align: center; background: rgba(255,255,255,.04); border: 1px solid rgba(255,45,120,.25); }
.ev2-count b { display: block; font: 900 clamp(20px, 2.6vw, 28px)/1 'Orbitron', sans-serif; color: #fff; text-shadow: 0 0 18px rgba(255,45,120,.6); }
.ev2-count small { display: block; margin-top: 5px; font: 700 10px/1 'Share Tech Mono', monospace; letter-spacing: .18em; color: #a9a3c8; text-transform: uppercase; }
.ev2-live { padding: 12px; border-radius: 14px; text-align: center; font: 800 14px/1 'Orbitron', sans-serif; letter-spacing: .12em;
  color: #fff; background: linear-gradient(135deg, rgba(255,45,120,.3), rgba(255,122,61,.25)); border: 1px solid rgba(255,45,120,.5); }

/* date block on cards */
.ev2-date { position: absolute; z-index: 1; top: 12px; right: 12px; width: 54px; padding: 8px 0 7px; border-radius: 14px; text-align: center;
  background: rgba(5,5,15,.75); border: 1px solid rgba(255,45,120,.45); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.ev2-date b { display: block; font: 900 20px/1 'Orbitron', sans-serif; color: #fff; }
.ev2-date small { display: block; margin-top: 3px; font: 700 10px/1 'Share Tech Mono', monospace; letter-spacing: .14em; color: var(--pink); text-transform: uppercase; }

.ev2-seats { display: grid; gap: 6px; }
.ev2-seats span { display: flex; justify-content: space-between; font-size: 13px; color: #a9a3c8; }
.ev2-seats span b { color: #fff; }
.ev2-bar { height: 6px; border-radius: 6px; background: rgba(255,255,255,.08); overflow: hidden; }
.ev2-bar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--gold), var(--pink)); box-shadow: 0 0 10px rgba(255,45,120,.6); }

@media (max-width: 860px) {
  .ev2-hero { grid-template-columns: 1fr; }
  .ev2-hero-media { min-height: 220px; aspect-ratio: 16 / 9; }
  .ev2-hero-media::after { background: linear-gradient(0deg, #110b1e 0%, transparent 55%); }
}
@media (prefers-reduced-motion: reduce) {
  .ev2-hero::after, .ev2-hero-media img, .ev2-next i { animation: none; }
}
`;

const toDate = (ev) => new Date(`${String(ev.event_date).slice(0, 10)}T${ev.start_time || "00:00"}`);

function niceTime(t) {
  if (!t) return "";
  const [h, m] = String(t).split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
const niceDate = (d) =>
  d ? new Date(`${String(d).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "";

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, target - now);
  return {
    left,
    d: Math.floor(left / 86400000),
    h: Math.floor((left / 3600000) % 24),
    m: Math.floor((left / 60000) % 60),
    s: Math.floor((left / 1000) % 60),
  };
}

function Seats({ left }) {
  const n = Number(left);
  if (!Number.isFinite(n)) return null;
  // Visual only: a fuller bar as seats run out makes "book soon" obvious.
  const fill = n <= 0 ? 100 : Math.max(12, Math.min(95, 100 - n * 4));
  return (
    <div className="ev2-seats">
      <span>
        <span>{n <= 0 ? "Sold out" : n <= 5 ? "Almost full!" : "Seats left"}</span>
        <b>{Math.max(n, 0)}</b>
      </span>
      <div className="ev2-bar"><i style={{ width: `${fill}%` }} /></div>
    </div>
  );
}

function Featured({ ev, onBook }) {
  const start = toDate(ev).getTime();
  const { left, d, h, m, s } = useCountdown(start);
  return (
    <motion.div
      className="ev2-hero"
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ev2-hero-media">
        {ev.image ? <img src={resolveImage(ev.image)} alt="" /> : <div className="hm-ph"><Ticket size={64} strokeWidth={1.3} aria-hidden="true" /></div>}
      </div>
      <div className="ev2-hero-body">
        <span className="ev2-next"><i aria-hidden="true" /> Next event</span>
        <h3>{ev.title}</h3>
        <div className="hm-meta" style={{ "--acc": "#ff2d78" }}>
          <span><CalendarDays size={16} /> {niceDate(ev.event_date)}</span>
          <span><Clock size={16} /> {niceTime(ev.start_time)}{ev.end_time ? ` – ${niceTime(ev.end_time)}` : ""}</span>
          <span><Ticket size={16} /> {Number(ev.price) > 0 ? money(ev.price) : "Free entry"}</span>
        </div>
        {ev.description && <p>{ev.description}</p>}
        {left > 0 ? (
          <div className="ev2-count" aria-label="Time until the event starts">
            {[[d, "Days"], [h, "Hrs"], [m, "Min"], [s, "Sec"]].map(([v, l]) => (
              <div key={l}>
                <b>{String(v).padStart(2, "0")}</b>
                <small>{l}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="ev2-live">Happening now</div>
        )}
        <Seats left={ev.available_slots} />
        <button type="button" className="hm-btn" style={{ "--acc": "#ff2d78" }} onClick={onBook} disabled={Number(ev.available_slots) <= 0}>
          <Flame size={16} aria-hidden="true" /> Login to Book
        </button>
      </div>
    </motion.div>
  );
}

// `page` mode (the /events page): every event, a vertical grid, no section header.
export default function EventSection({ events = [], page = false }) {
  const navigate = useNavigate();
  if (!events.length) return null;

  const sorted = [...events].sort((a, b) => toDate(a) - toDate(b)).slice(0, page ? undefined : 8);
  const [first, ...rest] = sorted;
  const book = () => navigate("/sign-in");

  return (
    <section className="hm-sec ev2" id="events" aria-label="Upcoming events">
      <style>{homeCss + css}</style>
      <div className="hm-glow" style={{ top: -200, left: -160, background: "rgba(255,45,120,.25)" }} aria-hidden="true" />
      <div className="hm-in" style={{ "--acc": "#ff2d78", "--acc2": "#ffd60a" }}>
        {!page && <SectionHead
            eyebrow="Don't miss out"
            title="Upcoming"
            accent="Events"
            sub="Tournaments, watch parties and game nights. Seats are limited."
            to="/events"
            toLabel="All events"
          />}

        <Featured ev={first} onBook={book} />

        {rest.length > 0 && (
          <>
            <div className={`hm-row${page ? " stacked" : ""}`} style={{ "--cols": 3 }}>
              {rest.map((ev, i) => {
                const dt = new Date(`${String(ev.event_date).slice(0, 10)}T00:00:00`);
                return (
                  <Reveal key={ev.id} index={i} className="hm-card">
                    <div className="hm-media">
                      {ev.image ? <img src={resolveImage(ev.image)} alt="" loading="lazy" /> : <div className="hm-ph"><Ticket size={64} strokeWidth={1.3} aria-hidden="true" /></div>}
                      <span className="hm-badge"><Flame size={12} aria-hidden="true" /> Live event</span>
                      <span className="ev2-date" aria-hidden="true">
                        <b>{dt.getDate()}</b>
                        <small>{dt.toLocaleDateString("en-IN", { month: "short" })}</small>
                      </span>
                    </div>
                    <div className="hm-body">
                      <h3 className="hm-name">{ev.title}</h3>
                      <div className="hm-meta">
                        <span><CalendarDays size={15} /> {niceDate(ev.event_date)}</span>
                        <span><Clock size={15} /> {niceTime(ev.start_time)}{ev.end_time ? ` – ${niceTime(ev.end_time)}` : ""}</span>
                      </div>
                      {ev.description && <p className="hm-text">{ev.description}</p>}
                      <Seats left={ev.available_slots} />
                      <div className="hm-foot">
                        <span className="hm-price">{Number(ev.price) > 0 ? money(ev.price) : "Free"}</span>
                        <button type="button" className="hm-btn" onClick={book} disabled={Number(ev.available_slots) <= 0}>
                          <Users size={15} aria-hidden="true" /> Login to Book
                        </button>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            {!page && <SwipeHint count={rest.length} />}
          </>
        )}
      </div>
    </section>
  );
}
