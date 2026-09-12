import { motion } from "framer-motion";

const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const PURPLE = "#7A2CFF";
const SILVER = "#B9C2D9";
const PANEL  = "#0D0A18";
const BORDER = "rgba(122,44,255,0.22)";

const rows = [
  { label: "Date",    key: "booking_date",          icon: "◈" },
  { label: "Start",   key: "start_time",             icon: "▶" },
  { label: "End",     key: "end_time",               icon: "◼" },
  { label: "Hours",   key: "total_hours",            icon: "⏱" },
  { label: "Players", key: "total_people",           icon: "◆" },
  { label: "Loyalty", key: "awarded_loyalty_points", icon: "✦" },
];

function InfoRow({ icon, label, value, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        padding:         "10px 0",
        borderBottom:    `1px solid ${BORDER}`,
        gap:             8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize:   10,
          color:      `${PURPLE}cc`,
          width:      14,
          textAlign:  "center",
        }}>{icon}</span>
        <span style={{
          fontFamily:    "'Orbitron', monospace",
          fontSize:      9,
          fontWeight:    700,
          letterSpacing: "0.14em",
          color:         `${SILVER}77`,
          textTransform: "uppercase",
        }}>{label}</span>
      </div>
      <span style={{
        fontFamily:    "'Share Tech Mono', monospace",
        fontSize:      12,
        color:         GOLDHI,
        letterSpacing: "0.06em",
        textAlign:     "right",
      }}>{value ?? "—"}</span>
    </motion.div>
  );
}

export default function BookingInfo({ booking }) {
  return (
    <div style={{
      background: PANEL,
      border:     `1px solid ${BORDER}`,
      clipPath:   "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
      padding:    "20px 20px 16px",
      height:     "100%",
      boxSizing:  "border-box",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 3, height: 18, background: `linear-gradient(to bottom, ${PURPLE}, ${GOLD})` }}
        />
        <span style={{
          fontFamily:    "'Orbitron', monospace",
          fontSize:      10,
          fontWeight:    700,
          letterSpacing: "0.2em",
          color:         GOLD,
          textTransform: "uppercase",
        }}>Booking Info</span>
      </div>

      {/* Rows */}
      <div>
        {rows.map((r, i) => (
          <InfoRow key={r.key} icon={r.icon} label={r.label} value={booking?.[r.key]} index={i} />
        ))}
      </div>
    </div>
  );
}