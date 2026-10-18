import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Users, Wrench, Zap } from "lucide-react";
import { SectionHead, SwipeHint } from "./homeTheme";
import { homeCss, money, resolveImage } from "./homeStyles";

// Games on the home page, grouped by category (categories come from the API
// with their games inside). Phones get a swipe row, wider screens a grid.

const css = `
.gm2 { background: radial-gradient(ellipse 55% 50% at 90% 0%, rgba(0,245,255,.12), transparent 60%),
  radial-gradient(ellipse 50% 50% at 0% 100%, rgba(123,47,255,.16), transparent 60%), #05040a; }
.gm2 .hm-card { --acc: var(--cyan); --acc2: var(--purple); }
.gm2-type { position: absolute; z-index: 1; bottom: 12px; left: 12px; padding: 5px 10px; border-radius: 8px; font: 700 11px/1 'Share Tech Mono', monospace;
  letter-spacing: .14em; text-transform: uppercase; color: #fff; background: rgba(5,5,15,.7); border: 1px solid rgba(255,255,255,.15);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.gm2-off { position: absolute; inset: 0; z-index: 1; display: grid; place-items: center; background: rgba(5,5,15,.65);
  font: 800 13px/1 'Orbitron', sans-serif; letter-spacing: .14em; color: var(--gold); text-transform: uppercase; }
.gm2-off span { display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 999px; border: 1px solid rgba(255,214,10,.4); background: rgba(0,0,0,.4); }
.gm2-empty { padding: 36px 16px; text-align: center; color: #8f89b0; border: 1px dashed rgba(255,255,255,.15); border-radius: 20px;
  font: 700 14px/1.5 'Share Tech Mono', monospace; letter-spacing: .08em; }
`;

// `page` mode (the /games page): vertical grid, no section header.
export default function CategorySection({ categories = [], page = false }) {
  const navigate = useNavigate();
  const [active, setActive] = useState("all");

  const withGames = useMemo(() => categories.filter((c) => (c.games || []).length > 0), [categories]);
  const games = useMemo(() => {
    const list = [];
    for (const c of withGames) {
      if (active !== "all" && c.id !== active) continue;
      for (const g of c.games) list.push({ ...g, category: c.name, type: c.category_type });
    }
    return list;
  }, [withGames, active]);

  if (!categories.length) return null;
  const total = withGames.reduce((n, c) => n + c.games.length, 0);

  return (
    <section className="hm-sec gm2" id="games" aria-label="Games">
      <style>{homeCss + css}</style>
      <div className="hm-glow" style={{ top: -220, right: -180, background: "rgba(0,245,255,.18)" }} aria-hidden="true" />
      <div className="hm-in" style={{ "--acc": "#00f5ff", "--acc2": "#7b2fff" }}>
        {!page && <SectionHead
          eyebrow="Pick your arena"
          title="Play"
          accent="Games"
          sub="Consoles, pool tables and big-screen movies. Book an hour or more."
          to="/games"
          toLabel="All games"
        />}

        {withGames.length > 1 && (
          <div className="hm-chips" role="group" aria-label="Filter games by category">
            <button type="button" className={`hm-chip${active === "all" ? " on" : ""}`} onClick={() => setActive("all")} aria-pressed={active === "all"}>
              All <b>{total}</b>
            </button>
            {withGames.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`hm-chip${active === c.id ? " on" : ""}`}
                onClick={() => setActive(c.id)}
                aria-pressed={active === c.id}
              >
                {c.name} <b>{c.games.length}</b>
              </button>
            ))}
          </div>
        )}

        {games.length === 0 ? (
          <div className="gm2-empty">New games are on the way. Check back soon!</div>
        ) : (
          <>
            <motion.div layout className={`hm-row${page ? " stacked" : ""}`} style={{ "--cols": 3 }}>
              <AnimatePresence mode="popLayout" initial={false}>
                {games.map((g, i) => (
                  <motion.article
                    layout
                    key={g.id}
                    className="hm-card"
                    initial={{ opacity: 0, y: 30, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: Math.min(i, 5) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="hm-media">
                      {g.image ? <img src={resolveImage(g.image)} alt="" loading="lazy" /> : <div className="hm-ph"><Gamepad2 size={64} strokeWidth={1.3} aria-hidden="true" /></div>}
                      <span className="hm-badge"><Gamepad2 size={12} aria-hidden="true" /> {g.category}</span>
                      {g.type && <span className="gm2-type">{g.type}</span>}
                      {g.maintenance_mode && (
                        <div className="gm2-off"><span><Wrench size={14} aria-hidden="true" /> Under maintenance</span></div>
                      )}
                    </div>
                    <div className="hm-body">
                      <h3 className="hm-name">{g.name}</h3>
                      <div className="hm-meta">
                        <span><Users size={15} /> Up to {g.max_capacity} players</span>
                        <span><Zap size={15} /> Instant booking</span>
                      </div>
                      <div className="hm-foot">
                        <span className="hm-price">{money(g.price_per_hour)}<small>/ hour</small></span>
                        <button type="button" className="hm-btn" onClick={() => navigate("/sign-in")} disabled={g.maintenance_mode}>
                          Login to Book
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
            {!page && <SwipeHint count={games.length} />}
          </>
        )}
      </div>
    </section>
  );
}
