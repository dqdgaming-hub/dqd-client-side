import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, TriangleAlert } from "lucide-react";
import { getHomePage } from "../components/api/homeapi";

// Shared shell for the public list pages (/games, /events, /combo-packs):
// the same header, loading, empty and error states, then the home-page
// section for that list in full-page mode.

const css = `
.pl { --acc: #00f5ff; --acc2: #7b2fff; position: relative; overflow: hidden; color: #fff; font-family: 'Rajdhani', 'Inter', sans-serif; }
.pl-hero { position: relative; isolation: isolate; max-width: 1240px; margin: 0 auto; padding: 96px clamp(16px, 4vw, 40px) 8px; }
.pl-hero::before { content: ""; position: absolute; z-index: -1; top: -160px; left: 50%; translate: -50% 0; width: min(900px, 120vw); height: 420px; border-radius: 50%;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--acc) 22%, transparent), transparent 65%); filter: blur(20px); pointer-events: none; }
.pl-back { display: flex; width: fit-content; align-items: center; gap: 6px; margin-bottom: 18px; color: #a9a3c8; text-decoration: none;
  font: 700 12px/1 'Share Tech Mono', monospace; letter-spacing: .16em; text-transform: uppercase; transition: color .2s; }
.pl-back:hover { color: var(--acc); }
.pl-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 12px; font: 700 12px/1 'Share Tech Mono', monospace;
  letter-spacing: .26em; text-transform: uppercase; color: var(--acc); }
.pl-eyebrow i { width: 26px; height: 2px; background: currentColor; box-shadow: 0 0 10px currentColor; }
.pl h1 { margin: 0; font: 900 clamp(32px, 6vw, 64px)/1 'Orbitron', sans-serif; text-transform: uppercase; letter-spacing: .02em; color: #fff; }
.pl h1 em { font-style: normal; background: linear-gradient(90deg, var(--acc), var(--acc2)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.pl-sub { margin: 14px 0 0; max-width: 560px; color: #b7b1d6; font-size: 17px; line-height: 1.55; }
.pl-count { display: inline-flex; align-items: center; gap: 8px; margin-top: 18px; padding: 8px 14px; border-radius: 999px; font-weight: 700; font-size: 14px;
  color: #fff; background: color-mix(in srgb, var(--acc) 12%, transparent); border: 1px solid color-mix(in srgb, var(--acc) 40%, transparent); }
.pl-count svg { color: var(--acc); }
.pl .hm-sec { padding-top: 22px; }
.pl-skel { max-width: 1240px; margin: 0 auto; padding: 24px clamp(16px, 4vw, 40px) 80px; display: grid; gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); }
.pl-skel div { height: 360px; border-radius: 22px; background: linear-gradient(110deg, #0f0e22 30%, #1a1838 50%, #0f0e22 70%); background-size: 200% 100%;
  animation: pl-shim 1.4s linear infinite; }
@keyframes pl-shim { to { background-position: -200% 0; } }
.pl-state { max-width: 560px; margin: 30px auto 90px; padding: 36px 22px; text-align: center; border-radius: 22px; color: #b7b1d6;
  background: #0d0c1d; border: 1px dashed rgba(255,255,255,.15); }
.pl-state svg { color: var(--acc); margin-bottom: 10px; }
.pl-state p { margin: 0 0 16px; font-size: 16px; }
.pl-btn { display: inline-flex; align-items: center; gap: 8px; min-height: 46px; padding: 0 20px; border: 0; border-radius: 14px; cursor: pointer; text-decoration: none;
  font: 800 12.5px/1 'Orbitron', sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #05040a; background: linear-gradient(135deg, var(--acc), var(--acc2)); }
@media (max-width: 640px) { .pl-hero { padding-top: 88px; } .pl-sub { font-size: 15px; } }
@media (prefers-reduced-motion: reduce) { .pl-skel div { animation: none; } }
`;

export default function PublicListPage({ eyebrow, title, accent, sub, colors, countIcon: CountIcon, countLabel, pick, emptyText, children }) {
  const [state, setState] = useState({ status: "loading", data: null });

  const load = useCallback(() => {
    getHomePage()
      .then((res) => setState(res?.success ? { status: "ok", data: res.data } : { status: "error", data: null }))
      .catch(() => setState({ status: "error", data: null }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setState({ status: "loading", data: null });
    load();
  };

  const items = state.data ? pick(state.data) : [];
  const count = typeof countLabel === "function" ? countLabel(state.data) : items.length;

  return (
    <div className="pl" style={{ "--acc": colors[0], "--acc2": colors[1] }}>
      <style>{css}</style>
      <motion.header
        className="pl-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/" className="pl-back"><ArrowLeft size={14} aria-hidden="true" /> Home</Link>
        <div className="pl-eyebrow"><i aria-hidden="true" />{eyebrow}</div>
        <h1>{title} <em>{accent}</em></h1>
        <p className="pl-sub">{sub}</p>
        {state.status === "ok" && count > 0 && (
          <span className="pl-count"><CountIcon size={16} aria-hidden="true" /> {count} available</span>
        )}
      </motion.header>

      {state.status === "loading" && (
        <div className="pl-skel" aria-label="Loading">
          <div /><div /><div />
        </div>
      )}
      {state.status === "error" && (
        <div className="pl-state" role="alert">
          <TriangleAlert size={30} aria-hidden="true" />
          <p>Couldn't load this page. Check your connection and try again.</p>
          <button type="button" className="pl-btn" onClick={retry}><RotateCcw size={15} aria-hidden="true" /> Try again</button>
        </div>
      )}
      {state.status === "ok" && (items.length > 0 ? children(state.data) : (
        <div className="pl-state">
          <CountIcon size={30} aria-hidden="true" />
          <p>{emptyText}</p>
          <Link to="/" className="pl-btn">Back to home</Link>
        </div>
      ))}
    </div>
  );
}
