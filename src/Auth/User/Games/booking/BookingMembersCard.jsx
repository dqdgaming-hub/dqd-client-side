import { motion } from "framer-motion";

const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const PURPLE = "#7A2CFF";
const FUCHSIA= "#C026D3";
const SILVER = "#B9C2D9";
const PANEL  = "#0D0A18";
const BORDER = "rgba(122,44,255,0.22)";

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function MemberChip({ name, phone, isPrimary = false, index }) {
  const colors = [GOLD, PURPLE, FUCHSIA, "#00FFB2", "#38BDF8"];
  const col = isPrimary ? GOLD : colors[(index % colors.length) + 1] || PURPLE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        10,
        padding:    "9px 0",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      {/* Avatar */}
      <div style={{
        width:       34, height: 34, borderRadius: "50%",
        background:  `${col}22`,
        border:      `1.5px solid ${col}55`,
        display:     "flex", alignItems: "center", justifyContent: "center",
        flexShrink:  0,
        fontFamily:  "'Orbitron', monospace",
        fontSize:    9, fontWeight: 900,
        color:       col,
        boxShadow:   `0 0 10px ${col}33`,
        textTransform: "uppercase",
      }}>
        {initials(name)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily:    "'Rajdhani', 'Inter', sans-serif",
          fontSize:      12, fontWeight: 700,
          color:         isPrimary ? GOLDHI : SILVER,
          letterSpacing: "0.04em",
          whiteSpace:    "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{name}</div>
        {phone && (
          <div style={{
            fontFamily:    "'Share Tech Mono', monospace",
            fontSize:      10, color: `${SILVER}66`,
            letterSpacing: "0.04em",
          }}>{phone}</div>
        )}
      </div>

      {isPrimary && (
        <span style={{
          fontFamily:    "'Orbitron', monospace",
          fontSize:      7, fontWeight: 700,
          letterSpacing: "0.16em",
          color:         `${GOLD}cc`,
          background:    `${GOLD}15`,
          border:        `1px solid ${GOLD}44`,
          padding:       "2px 7px",
          clipPath:      "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)",
          flexShrink:    0,
          textTransform: "uppercase",
        }}>Host</span>
      )}
    </motion.div>
  );
}

export default function BookingMembersCard({ booking }) {
  const members = booking?.members || [];

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
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ width: 3, height: 18, background: `linear-gradient(to bottom, ${FUCHSIA}, ${PURPLE})` }}
          />
          <span style={{
            fontFamily:    "'Orbitron', monospace",
            fontSize:      10, fontWeight: 700,
            letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase",
          }}>Members</span>
        </div>
        <span style={{
          fontFamily:    "'Share Tech Mono', monospace",
          fontSize:      10, color: `${PURPLE}cc`,
          background:    `${PURPLE}22`, border: `1px solid ${PURPLE}44`,
          padding:       "2px 8px", borderRadius: 2,
        }}>
          {1 + members.length}
        </span>
      </div>

      <MemberChip name={booking?.customer_name} isPrimary index={0} />
      {members.map((m, i) => (
        <MemberChip key={m.id} name={m.name} phone={m.phone} index={i + 1} />
      ))}
    </div>
  );
}