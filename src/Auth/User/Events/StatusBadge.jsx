import { motion } from "framer-motion";
import { theme, fonts, chamfer, statusTheme } from "./theme";

export default function StatusBadge({ status, size = "md" }) {
  const cfg = statusTheme[status] || statusTheme.pending;
  const isLive = status === "approved" || status === "pending";
  const small = size === "sm";

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: small ? "5px 12px 5px 10px" : "7px 16px 7px 12px",
        background: `linear-gradient(135deg, ${cfg.color}14, ${cfg.color}08)`,
        border: `1px solid ${cfg.color}55`,
        clipPath: chamfer.sm,
        fontFamily: fonts.mono,
        fontSize: small ? 10 : 11.5,
        letterSpacing: "0.12em",
        color: cfg.color,
        textShadow: `0 0 12px ${cfg.glow}`,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ position: "relative", width: 7, height: 7, flexShrink: 0 }}>
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: cfg.color,
            boxShadow: `0 0 8px ${cfg.glow}`,
          }}
        />
        {isLive && (
          <motion.span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: cfg.color,
            }}
            animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </span>
      {cfg.label}
    </div>
  );
}