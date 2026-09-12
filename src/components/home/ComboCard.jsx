import { motion } from "framer-motion";
import { Tag, Star } from "lucide-react";

/* ─────────────────────────────────────
   Vibranium theme tokens
───────────────────────────────────── */
export const T = {
  void:    "#05050f",
  purple:  "#7A2CFF",
  fuchsia: "#C026D3",
  gold:    "#D4AF37",
  cyan:    "#00f5ff",
  lilac:   "#c084fc",
  pink:    "#ff006e",
  amber:   "#f59e0b",
  border:  "rgba(122,44,255,0.25)",
};

export const ACCENT_CYCLE = [T.lilac, T.cyan, T.pink, T.amber, T.gold];

/*
  Mini card — lives inside the fan (desktop) or the snap-carousel (mobile).
  Uses layoutId="combo-card-{id}" + layoutId="combo-img-{id}" so that when
  it's clicked, framer-motion automatically morphs this exact DOM node's
  position/size/radius into the FocusedCard's front face — no separate
  "pop in" animation needed, it's a continuous shared-element transition.
  The mini card unmounts (AnimatePresence in parent) the instant the
  focused one mounts, and framer stitches the two together via layoutId.
*/
export default function ComboCard({ combo, index = 0, style, className = "", onOpen, dimmed = false, isOpen = false }) {
  const accent = ACCENT_CYCLE[index % ACCENT_CYCLE.length];

  return (
    <motion.div
      layoutId={`combo-card-${combo.id}`}
      className={`cc-mini ${className}`}
      style={{ "--acc": accent, ...style, visibility: isOpen ? "hidden" : "visible" }}
      animate={{
        opacity: dimmed ? 0.22 : 1,
        filter: dimmed ? "blur(3px) saturate(0.4)" : "blur(0px) saturate(1)",
      }}
      whileHover={
        dimmed
          ? {}
          : {
              scale: 1.07,
              y: -10,
              rotateX: 4,
              rotateY: -4,
              zIndex: 50,
              transition: { type: "spring", stiffness: 320, damping: 18 },
            }
      }
      whileTap={dimmed ? {} : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      onClick={() => !dimmed && onOpen?.(combo, index)}
    >
      {/* animated gradient border sweep */}
      <motion.div
        className="cc-mini-sweep"
        style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent 30%)` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      <div className="cc-mini-corner cc-mini-tl" style={{ borderColor: accent }} />
      <div className="cc-mini-corner cc-mini-br" style={{ borderColor: T.pink }} />

      <motion.img
        layoutId={`combo-img-${combo.id}`}
        src={combo.image}
        alt={combo.name}
        className="cc-mini-img"
        loading="lazy"
        draggable={false}
      />
      <div className="cc-mini-fade" />

      <motion.div
        className="cc-mini-badge"
        style={{ background: `${accent}cc` }}
        animate={{ boxShadow: [`0 0 0px ${accent}00`, `0 0 10px ${accent}88`, `0 0 0px ${accent}00`] }}
        transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.15 }}
      >
        <Tag size={9} />
        <span>COMBO</span>
      </motion.div>

      <div className="cc-mini-price" style={{ color: accent, textShadow: `0 0 16px ${accent}88` }}>
        ₹{parseFloat(combo.combo_price).toFixed(0)}
      </div>

      <div className="cc-mini-foot">
        <span className="cc-mini-name">{combo.name}</span>
        <span className="cc-mini-pts"><Star size={9} style={{ color: T.amber }} />+{combo.loyalty_bonus}</span>
      </div>

      <div className="cc-mini-ring" style={{ boxShadow: `inset 0 0 0 1px ${accent}40` }} />
    </motion.div>
  );
}