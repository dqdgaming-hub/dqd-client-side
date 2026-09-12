import React from "react";
import { motion } from "framer-motion";

const STATUS_STYLES = {
  PENDING: { fg: "#ffcc00", bg: "rgba(255,204,0,.12)", border: "rgba(255,204,0,.4)", glow: "rgba(255,204,0,.35)" },
  CONFIRMED: { fg: "#00ff9f", bg: "rgba(0,255,159,.12)", border: "rgba(0,255,159,.45)", glow: "rgba(0,255,159,.4)" },
  COMPLETED: { fg: "#00e5ff", bg: "rgba(0,229,255,.12)", border: "rgba(0,229,255,.4)", glow: "rgba(0,229,255,.35)" },
  CANCELLED: { fg: "#ff3864", bg: "rgba(255,56,100,.12)", border: "rgba(255,56,100,.4)", glow: "rgba(255,56,100,.3)" },
};

const FALLBACK = { fg: "#8fb3a8", bg: "rgba(143,179,168,.1)", border: "rgba(143,179,168,.28)", glow: "rgba(143,179,168,.2)" };

export default function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || FALLBACK;
  const isLive = status === "CONFIRMED";

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: `1px solid ${s.border}`,
        color: s.fg,
        background: s.bg,
        padding: "6px 12px 6px 9px",
        clipPath: "polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "1.4px",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
      }}
    >
      <motion.span
        animate={
          isLive
            ? { opacity: [1, 0.3, 1], boxShadow: [`0 0 0px ${s.glow}`, `0 0 8px ${s.glow}`, `0 0 0px ${s.glow}`] }
            : { opacity: 1 }
        }
        transition={{ duration: 1.6, repeat: isLive ? Infinity : 0, ease: "easeInOut" }}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.fg,
          flexShrink: 0,
        }}
      />
      {status}
    </motion.span>
  );
}