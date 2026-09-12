import { motion } from "framer-motion";
import PaymentStatusBadge from "./PaymentStatusBadge";

const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const PURPLE = "#7A2CFF";
const SILVER = "#B9C2D9";
const PANEL  = "#0D0A18";
const BORDER = "rgba(122,44,255,0.22)";

function AmountRow({ label, value, highlight = false, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.4 }}
      style={{
        display:         "flex",
        justifyContent:  "space-between",
        alignItems:      "center",
        padding:         highlight ? "12px 10px" : "9px 0",
        marginTop:       highlight ? 6 : 0,
        borderTop:       highlight ? `1px solid ${GOLD}44` : `1px solid ${BORDER}`,
        background:      highlight ? `${GOLD}09` : "transparent",
        clipPath:        highlight ? "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)" : "none",
      }}
    >
      <span style={{
        fontFamily:    "'Orbitron', monospace",
        fontSize:      highlight ? 10 : 9,
        fontWeight:    700,
        letterSpacing: "0.14em",
        color:         highlight ? `${GOLD}cc` : `${SILVER}66`,
        textTransform: "uppercase",
      }}>{label}</span>
      <span style={{
        fontFamily:    "'Share Tech Mono', monospace",
        fontSize:      highlight ? 14 : 12,
        color:         highlight ? GOLDHI : SILVER,
        letterSpacing: "0.06em",
        fontWeight:    highlight ? 700 : 400,
      }}>
        {highlight && <span style={{ fontSize: 9, color: `${GOLD}88`, marginRight: 3 }}>INR</span>}
        {!highlight && <span style={{ fontSize: 9, color: `${SILVER}55`, marginRight: 3 }}>INR</span>}
        {value}
      </span>
    </motion.div>
  );
}

export default function BookingPaymentCard({ booking }) {
  return (
    <div style={{
      background: PANEL,
      border:     `1px solid ${BORDER}`,
      clipPath:   "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
      padding:    "20px 20px 16px",
      height:     "100%",
      boxSizing:  "border-box",
      position:   "relative",
      overflow:   "hidden",
    }}>
      {/* Gold corner glow */}
      <div style={{
        position:      "absolute", top: 0, right: 0,
        width: 80, height: 80,
        background:    `radial-gradient(circle at top right, ${GOLD}18, transparent 70%)`,
        pointerEvents: "none",
      }}/>

      {/* Header */}
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          style={{ width: 3, height: 18, background: `linear-gradient(to bottom, ${GOLD}, ${PURPLE})` }}
        />
        <span style={{
          fontFamily:    "'Orbitron', monospace",
          fontSize:      10,
          fontWeight:    700,
          letterSpacing: "0.2em",
          color:         GOLD,
          textTransform: "uppercase",
        }}>Payment</span>
      </div>

      <PaymentStatusBadge status={booking?.payment_status} />

      <AmountRow label="Subtotal" value={booking?.subtotal}         index={0} />
      <AmountRow label="Discount" value={booking?.discount_amount}  index={1} />
      <AmountRow label="Paid"     value={booking?.price_paid}       index={2} />
      <AmountRow label="Total"    value={booking?.total_amount}     index={3} highlight />
    </div>
  );
}