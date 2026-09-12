import { motion, AnimatePresence } from "framer-motion";

const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const PURPLE = "#7A2CFF";
const SILVER = "#B9C2D9";
const PANEL  = "#0D0A18";
const BORDER = "rgba(122,44,255,0.22)";

function SummaryRow({ label, value, highlight = false, icon }) {
  return (
    <div style={{
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     "center",
      padding:        highlight ? "12px 12px" : "9px 0",
      marginTop:      highlight ? 8 : 0,
      borderTop:      highlight ? `1px solid ${GOLD}44` : `1px solid ${BORDER}`,
      background:     highlight ? `${GOLD}09` : "transparent",
      clipPath:       highlight ? "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {icon && (
          <span style={{ fontSize: 10, color: `${PURPLE}bb` }}>{icon}</span>
        )}
        <span style={{
          fontFamily:    "'Orbitron', monospace",
          fontSize:      highlight ? 10 : 9,
          fontWeight:    700,
          letterSpacing: "0.15em",
          color:         highlight ? `${GOLD}cc` : `${SILVER}66`,
          textTransform: "uppercase",
        }}>{label}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={String(value)}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.22 }}
          style={{
            fontFamily:    "'Share Tech Mono', monospace",
            fontSize:      highlight ? 16 : 12,
            color:         highlight ? GOLDHI : SILVER,
            letterSpacing: "0.06em",
            fontWeight:    highlight ? 700 : 400,
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function BookingSummary({ game, slot, members }) {
  let hours = 0;
  let startLabel = "—";
  let endLabel   = "—";

  if (slot) {
    const [sh, sm] = slot.start_time.split(":").map(Number);
    const [eh, em] = slot.end_time.split(":").map(Number);
    hours = (eh * 60 + em - (sh * 60 + sm)) / 60;

    const fmt = (h, m) => {
      const suffix = h >= 12 ? "PM" : "AM";
      return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
    };
    startLabel = fmt(sh, sm);
    endLabel   = fmt(eh, em);
  }

  const pricePerHour = Number(game?.price_per_hour || 0);
  const playerCount  = members.length + 1;
  const total        = hours * pricePerHour * playerCount;
  const hasSlot      = !!slot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: PANEL,
        border:     `1px solid ${hasSlot ? GOLD + "44" : BORDER}`,
        clipPath:   "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        padding:    "18px 20px 16px",
        marginBottom: 24,
        position:   "relative",
        overflow:   "hidden",
        transition: "border-color 0.3s",
      }}
    >
      {/* Ambient glow when slot selected */}
      <AnimatePresence>
        {hasSlot && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "absolute", top: 0, right: 0,
              width: 120, height: 120,
              background: `radial-gradient(circle at top right, ${GOLD}18, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          style={{ width: 3, height: 18, background: `linear-gradient(to bottom, ${GOLD}, ${PURPLE}88)` }}
        />
        <span style={{
          fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase",
        }}>Booking Summary</span>
      </div>

      {/* Rows */}
      <SummaryRow label="Game"    value={game?.name || "—"}                             icon="◈" />
      <SummaryRow label="Start"   value={startLabel}                                    icon="▶" />
      <SummaryRow label="End"     value={endLabel}                                      icon="◼" />
      <SummaryRow label="Hours"   value={hours > 0 ? `${hours}h` : "—"}                 icon="⏱" />
      <SummaryRow label="Players" value={members.length + 1}                            icon="◆" />
      <SummaryRow label="Loyalty Points" value={"+10"}                                    icon="◆" />
      <SummaryRow label="Rate"    value={`INR ${pricePerHour.toFixed(2)} / hr / player`}         icon="✦" />
      <SummaryRow
        label="Total"
        value={total > 0 ? `INR ${total.toFixed(2)}` : "—"}
        highlight
      />
    </motion.div>
  );
}