// Shared building blocks for the public home page sections (events, games,
// combos). Styles live in homeStyles.js.
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/** Section heading: eyebrow, two-tone title, optional subtitle and "see all" link. */
export function SectionHead({ eyebrow, title, accent, sub, to, toLabel }) {
  return (
    <div className="hm-head">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="hm-eyebrow"><i aria-hidden="true" />{eyebrow}</span>
        <h2 className="hm-title">
          {title} {accent && <em>{accent}</em>}
        </h2>
        {sub && <p className="hm-sub">{sub}</p>}
      </motion.div>
      {to && (
        <Link to={to} className="hm-all">
          {toLabel} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** Card wrapper that pops in as it scrolls into view. */
export function Reveal({ index = 0, className, style, children }) {
  return (
    <motion.article
      className={className}
      style={style}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay: Math.min(index, 5) * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.article>
  );
}

export function SwipeHint({ count }) {
  if (count < 2) return null;
  return (
    <div className="hm-swipe" aria-hidden="true">
      Swipe <span>→</span>
    </div>
  );
}
