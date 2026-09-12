import { motion } from "framer-motion";

const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const PURPLE = "#7A2CFF";
const SILVER = "#B9C2D9";
const PANEL  = "#0D0A18";
const BORDER = "rgba(122,44,255,0.22)";

function ApprovalRow({ icon, label, value, index }) {
  const isSet = value && value !== "--" && value !== "Pending";
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
      style={{
        display:      "flex",
        alignItems:   "flex-start",
        gap:          10,
        padding:      "10px 0",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      {/* Timeline dot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3 }}>
        <motion.div
          animate={isSet
            ? { boxShadow: [`0 0 6px ${GOLD}`, `0 0 14px ${GOLD}`, `0 0 6px ${GOLD}`] }
            : {}}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width:        8, height: 8, borderRadius: "50%",
            background:   isSet ? GOLD : `${SILVER}33`,
            border:       `1.5px solid ${isSet ? GOLD : SILVER + "44"}`,
            flexShrink:   0,
          }}
        />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily:    "'Orbitron', monospace",
          fontSize:      8, letterSpacing: "0.18em",
          color:         `${SILVER}55`, textTransform: "uppercase",
          marginBottom:  3,
        }}>{label}</div>
        <div style={{
          fontFamily:    "'Share Tech Mono', monospace",
          fontSize:      11, color: isSet ? GOLDHI : `${SILVER}44`,
          letterSpacing: "0.05em",
        }}>
          {isSet ? value : "—"}
        </div>
      </div>
    </motion.div>
  );
}

export default function BookingApprovalCard({ booking }) {
  const approved = !!(booking?.approved_by_name);

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
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ width: 3, height: 18, background: approved ? `linear-gradient(to bottom, ${GOLD}, #00FFB2)` : `linear-gradient(to bottom, ${PURPLE}66, ${SILVER}33)` }}
          />
          <span style={{
            fontFamily:    "'Orbitron', monospace",
            fontSize:      10, fontWeight: 700,
            letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase",
          }}>Approval</span>
        </div>

        <span style={{
          fontFamily:    "'Orbitron', monospace",
          fontSize:      7, fontWeight: 700, letterSpacing: "0.14em",
          color:         approved ? "#00FFB2" : `${GOLD}88`,
          background:    approved ? "#00FFB211" : `${GOLD}11`,
          border:        `1px solid ${approved ? "#00FFB244" : GOLD + "33"}`,
          padding:       "3px 9px",
          clipPath:      "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)",
          textTransform: "uppercase",
        }}>
          {approved ? "Approved" : "Awaiting"}
        </span>
      </div>

      <ApprovalRow icon="◈" label="Approved By" value={booking?.approved_by_name || "Pending"} index={0} />
      <ApprovalRow icon="◈" label="Approved At" value={booking?.approved_at || "--"}           index={1} />
    </div>
  );
}