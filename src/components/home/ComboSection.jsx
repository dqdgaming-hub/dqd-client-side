import { useNavigate } from "react-router-dom";
import { Package, Popcorn, Star, Utensils } from "lucide-react";
import { Reveal, SectionHead, SwipeHint } from "./homeTheme";
import { homeCss, money, resolveImage } from "./homeStyles";

// Combo packs as "tickets": play time + a snack for one price, with bonus
// loyalty points.

const css = `
.cb2 { background: radial-gradient(ellipse 55% 50% at 0% 0%, rgba(255,214,10,.10), transparent 60%),
  radial-gradient(ellipse 50% 50% at 100% 100%, rgba(255,45,120,.12), transparent 60%), #07060f; }
.cb2 .hm-card { --acc: var(--gold); --acc2: var(--pink); }
.cb2-cut { position: relative; height: 0; border-top: 2px dashed rgba(255,214,10,.25); margin: 0 18px; }
.cb2-cut::before, .cb2-cut::after { content: ""; position: absolute; top: -12px; width: 22px; height: 22px; border-radius: 50%; background: #07060f; }
.cb2-cut::before { left: -30px; } .cb2-cut::after { right: -30px; }
.cb2-rows { display: grid; gap: 8px; }
.cb2-rows div { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 15px; color: #b7b1d6; }
.cb2-rows div span { display: inline-flex; align-items: center; gap: 8px; }
.cb2-rows b { color: #fff; font-weight: 700; }
.cb2-rows svg { color: var(--gold); }
.cb2-pts { color: var(--gold) !important; }
`;

// `page` mode (the /combo-packs page): vertical grid, no section header.
export default function ComboSection({ combos = [], page = false }) {
  const navigate = useNavigate();
  if (!combos.length) return null;

  return (
    <section className="hm-sec cb2" id="combos" aria-label="Combo packs">
      <style>{homeCss + css}</style>
      <div className="hm-glow" style={{ bottom: -240, left: -160, background: "rgba(255,214,10,.14)" }} aria-hidden="true" />
      <div className="hm-in" style={{ "--acc": "#ffd60a", "--acc2": "#ff2d78" }}>
        {!page && <SectionHead
          eyebrow="Best value"
          title="Combo"
          accent="Packs"
          sub="Game time and snacks together for one price, plus bonus loyalty points."
          to="/combo-packs"
          toLabel="All combos"
        />}
        <div className={`hm-row${page ? " stacked" : ""}`} style={{ "--cols": Math.min(3, Math.max(2, combos.length)) }}>
          {combos.map((c, i) => (
            <Reveal key={c.id} index={i} className="hm-card">
              <div className="hm-media">
                {c.image ? <img src={resolveImage(c.image)} alt="" loading="lazy" /> : <div className="hm-ph"><Popcorn size={64} strokeWidth={1.3} aria-hidden="true" /></div>}
                <span className="hm-badge"><Package size={12} aria-hidden="true" /> Combo</span>
                {Number(c.loyalty_bonus) > 0 && (
                  <span className="hm-badge right"><Star size={12} aria-hidden="true" /> +{c.loyalty_bonus} pts</span>
                )}
              </div>
              <div className="hm-body">
                <h3 className="hm-name">{c.name}</h3>
                <div className="cb2-rows">
                  <div><span><Utensils size={15} /> Snack</span><b>{c.snack_name || "—"}</b></div>
                  <div><span><Star size={15} /> Loyalty bonus</span><b className="cb2-pts">+{c.loyalty_bonus || 0} pts</b></div>
                </div>
              </div>
              <div className="cb2-cut" aria-hidden="true" />
              <div className="hm-body" style={{ flex: "none" }}>
                <div className="hm-foot">
                  <span className="hm-price">{money(c.combo_price)}</span>
                  <button type="button" className="hm-btn" onClick={() => navigate("/sign-in")}>
                    <Package size={15} aria-hidden="true" /> Book Now
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        {!page && <SwipeHint count={combos.length} />}
      </div>
    </section>
  );
}
