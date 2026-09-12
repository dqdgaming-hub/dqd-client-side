import { useState } from "react";
import { motion } from "framer-motion";
import BookingStatusBadge from "./BookingStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const PURPLE = "#7A2CFF";
const SILVER = "#B9C2D9";
const PANEL  = "#0D0A18";
const BORDER = "rgba(122,44,255,0.22)";

// ── Icons ──────────────────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CoinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v2m0 8v2M9 9.5A2.5 2.5 0 0 1 12 8c1.38 0 2.5.89 2.5 2s-1.12 2-2.5 2-2.5.89-2.5 2S10.62 16 12 16a2.5 2.5 0 0 0 2.5-1.5"/>
  </svg>
);
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const GameIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 9h10a4 4 0 0 1 3.8 5.3l-1 3A2.5 2.5 0 0 1 17.4 19a2.5 2.5 0 0 1-1.8-.8L14 16H10l-1.6 2.2a2.5 2.5 0 0 1-1.8.8 2.5 2.5 0 0 1-2.4-1.7l-1-3A4 4 0 0 1 7 9z"/>
    <line x1="8" y1="13" x2="12" y2="13"/>
    <line x1="10" y1="11" x2="10" y2="15"/>
    <circle cx="16.5" cy="12.5" r="0.8" fill="currentColor"/>
    <circle cx="18.5" cy="14.5" r="0.8" fill="currentColor"/>
  </svg>
);

function MetaChip({ icon, label, value, accent = SILVER }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:7,
      padding:"6px 10px",
      background:"rgba(122,44,255,0.06)",
      border:`1px solid ${BORDER}`,
      clipPath:"polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,0 100%)",
      minWidth:0,
    }}>
      <span style={{ color:`${accent}88`, flexShrink:0, display:"flex" }}>{icon}</span>
      <div style={{ minWidth:0 }}>
        <div style={{
          fontFamily:"'Orbitron',monospace", fontSize:7,
          letterSpacing:"0.16em", color:`${SILVER}44`,
          textTransform:"uppercase", marginBottom:2,
        }}>{label}</div>
        <div style={{
          fontFamily:"'Share Tech Mono',monospace", fontSize:11,
          color:accent, letterSpacing:"0.04em",
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
        }}>{value}</div>
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2,"0")} ${suffix}`;
}

export default function BookingHistoryCard({ booking, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -3, scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        background: hovered
          ? `linear-gradient(135deg,${PANEL},#110d22)`
          : PANEL,
        border: `1px solid ${hovered ? GOLD + "44" : BORDER}`,
        clipPath: "polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px))",
        cursor: "pointer",
        overflow: "hidden",
        transition: "background 0.25s, border-color 0.25s",
      }}
    >
      {/* Ambient corner glow on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position:"absolute", top:0, right:0,
          width:100, height:100, pointerEvents:"none",
          background:`radial-gradient(circle at top right,${GOLD}18,transparent 70%)`,
        }}
      />

      {/* Left accent bar */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0.5, scaleY: hovered ? 1 : 0.7 }}
        transition={{ duration: 0.25 }}
        style={{
          position:"absolute", left:0, top:0, bottom:0,
          width:3, transformOrigin:"center",
          background:`linear-gradient(to bottom,${GOLD}cc,${PURPLE}88)`,
        }}
      />

      {/* Sweep shimmer */}
      {hovered && (
        <motion.div
          initial={{ x:"-100%" }}
          animate={{ x:"220%" }}
          transition={{ duration:0.8, ease:"easeInOut" }}
          style={{
            position:"absolute", top:0, left:0,
            width:"35%", height:"100%", pointerEvents:"none",
            background:`linear-gradient(to right,transparent,rgba(255,255,255,0.04),transparent)`,
          }}
        />
      )}

      {/* ── Card content ── */}
      <div style={{ padding:"16px 18px 16px 20px" }}>

        {/* Header row */}
        <div style={{
          display:"flex", alignItems:"flex-start",
          justifyContent:"space-between", gap:12, marginBottom:14, flexWrap:"wrap",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, minWidth:0, flex:1 }}>
            <div style={{
              width:32, height:32, borderRadius:6, flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              background:`${PURPLE}22`, border:`1px solid ${PURPLE}44`,
              color:`${PURPLE}cc`,
            }}>
              <GameIcon />
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{
                fontFamily:"'Orbitron',monospace",
                fontSize:"clamp(11px,2.4vw,14px)", fontWeight:700,
                letterSpacing:"0.06em", color:GOLDHI,
                textTransform:"uppercase",
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                maxWidth:"clamp(140px,32vw,280px)",
              }}>{booking.game_name}</div>
              <div style={{
                fontFamily:"'Share Tech Mono',monospace", fontSize:9,
                color:`${SILVER}44`, letterSpacing:"0.14em",
                textTransform:"uppercase", marginTop:2,
              }}>◈ Booking #{booking.id}</div>
            </div>
          </div>

          {/* Status badges */}
          <div style={{ display:"flex", gap:6, flexShrink:0, flexWrap:"wrap" }}>
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.payment_status} />
          </div>
        </div>

        {/* Meta chips grid */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",
          gap:8, marginBottom:14,
        }}>
          <MetaChip
            icon={<CalendarIcon />}
            label="Date"
            value={formatDate(booking.booking_date)}
            accent={SILVER}
          />
          <MetaChip
            icon={<ClockIcon />}
            label="Time"
            value={`${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`}
            accent={SILVER}
          />
          <MetaChip
            icon={<CoinIcon />}
            label="Total"
            value={`INR ${Number(booking.total_amount).toFixed(2)}`}
            accent={GOLD}
          />
          <MetaChip
            icon={<StarIcon />}
            label="Points Earned"
            value={`+${booking.loyalty_points_earned} pts`}
            accent="#C084FC"
          />
        </div>

        {/* Footer */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"flex-end",
          borderTop:`1px solid ${BORDER}`, paddingTop:12,
        }}>
          <motion.div
            animate={{ x: hovered ? 3 : 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display:"inline-flex", alignItems:"center", gap:7,
              fontFamily:"'Orbitron',monospace", fontSize:8, fontWeight:700,
              letterSpacing:"0.2em", textTransform:"uppercase",
              color: hovered ? GOLDHI : `${GOLD}88`,
              transition:"color 0.2s",
            }}
          >
            View Details
            <ArrowIcon />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}