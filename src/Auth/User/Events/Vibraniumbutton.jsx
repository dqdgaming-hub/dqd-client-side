import { motion } from "framer-motion";
import { theme, fonts, chamfer } from "./theme";

/**
 * variant: "primary" | "ghost" | "danger" | "gold"
 */
export default function VibraniumButton({
  children,
  icon,
  onClick,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  style,
}) {
  const palettes = {
    primary: { base: theme.purple, glow: theme.purpleGlow, text: "#fff" },
    ghost: { base: theme.teal, glow: theme.tealGlow, text: theme.teal },
    danger: { base: theme.danger, glow: theme.dangerGlow, text: "#fff" },
    gold: { base: theme.gold, glow: theme.goldGlow, text: "#1a1408" },
  };
  const p = palettes[variant];
  const isGhost = variant === "ghost";

  return (
    <motion.button
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? {} : { y: -3 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      style={{
        position: "relative",
        overflow: "hidden",
        flex: fullWidth ? 1 : "initial",
        minWidth: fullWidth ? 160 : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        padding: "13px 22px",
        border: isGhost ? `1px solid ${p.base}` : "none",
        background: isGhost
          ? `${p.base}0F`
          : `linear-gradient(135deg, ${p.base}, ${shade(p.base)})`,
        color: p.text,
        fontFamily: fonts.body,
        fontWeight: 700,
        fontSize: 14.5,
        letterSpacing: "0.03em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        clipPath: chamfer.sm,
        boxShadow: disabled ? "none" : `0 8px 24px -8px ${p.glow}`,
        ...style,
      }}
    >
      {/* animated sweep highlight */}
      {!disabled && (
        <motion.span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "-40%",
            width: "35%",
            height: "100%",
            background: `linear-gradient(115deg, transparent, ${isGhost ? p.base : "#ffffff"}33, transparent)`,
            pointerEvents: "none",
          }}
          initial={{ left: "-40%" }}
          whileHover={{ left: "120%" }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
        />
      )}
      {icon}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </motion.button>
  );
}

function shade(hex) {
  // slight darken for gradient depth
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - 30);
  const g = Math.max(0, ((n >> 8) & 0xff) - 30);
  const b = Math.max(0, (n & 0xff) - 30);
  return `rgb(${r},${g},${b})`;
}