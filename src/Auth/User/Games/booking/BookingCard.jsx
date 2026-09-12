import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BookingStatusBadge from "./BookingStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

/* ─── helpers ──────────────────────────────────────────────────────────── */
const fmtDate = (s) => {
    if (!s) return "—";
    const d = new Date(s);
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtTime = (s) => {
    if (!s) return "—";
    const [h, m] = s.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${((hour % 12) || 12)}:${m} ${ampm}`;
};
const fmtAmount = (a) =>
    a !== undefined && a !== null
        ? `INR ${parseFloat(a).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
        : null;

/* ─── inline SVG icons ─────────────────────────────────────────────────── */
const Icon = ({ t, sz = 13, c = "currentColor" }) => {
    const s = { width: sz, height: sz };
    const p = { fill: "none", stroke: c, strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round" };
    const map = {
        cal:  <svg {...s} viewBox="0 0 24 24" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>,
        clk:  <svg {...s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>,
        usr:  <svg {...s} viewBox="0 0 24 24" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
        eye:  <svg {...s} viewBox="0 0 24 24" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
        x:    <svg {...s} viewBox="0 0 24 24" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
        hash: <svg {...s} viewBox="0 0 24 24" {...p}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
        coin: <svg {...s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9"/><path d="M9 9h3.5a2 2 0 0 1 0 4H9v4"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="17" x2="12" y2="19"/></svg>,
        qr:   <svg {...s} viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="5" y="5" width="3" height="3" fill={c} stroke="none"/><rect x="16" y="5" width="3" height="3" fill={c} stroke="none"/><rect x="5" y="16" width="3" height="3" fill={c} stroke="none"/><line x1="14" y1="14" x2="14" y2="14"/><line x1="17" y1="14" x2="21" y2="14"/><line x1="14" y1="17" x2="14" y2="21"/><line x1="17" y1="17" x2="21" y2="17"/><line x1="21" y1="14" x2="21" y2="17"/></svg>,
        chk:  <svg {...s} viewBox="0 0 24 24" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
    };
    return map[t] ?? null;
};

/* ─── clip paths ───────────────────────────────────────────────────────── */
const CLP_CARD = "polygon(0 0,calc(100% - 24px) 0,100% 24px,100% 100%,24px 100%,0 calc(100% - 24px))";
const CLP_BTN  = "polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))";
const CLP_IMG  = "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)";

/* ─── CyberButton ──────────────────────────────────────────────────────── */
function CyberBtn({ onClick, disabled, color, glow, icon, children, full }) {
    const [hov, setHov] = useState(false);
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            onHoverStart={() => setHov(true)}
            onHoverEnd={() => setHov(false)}
            whileTap={{ scale: 0.93 }}
            style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                fontFamily: "Orbitron, sans-serif",
                fontSize: "clamp(8px,1.4vw,10px)",
                fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                color: hov ? "#06060e" : color,
                background: hov ? color : `${color}16`,
                border: `1px solid ${color}`,
                borderRadius: 0,
                clipPath: CLP_BTN,
                padding: "8px 14px",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.42 : 1,
                boxShadow: hov ? `0 0 20px ${glow}` : "none",
                transition: "all 0.22s ease",
                whiteSpace: "nowrap",
                width: full ? "100%" : "auto",
                flexShrink: 0,
            }}
        >
            <span style={{ color: hov ? "#06060e" : color, display: "flex" }}>{icon}</span>
            {children}
        </motion.button>
    );
}

/* ─── MetaPill ─────────────────────────────────────────────────────────── */
function MetaPill({ icon, accent, children }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "clamp(9px,1.7vw,11px)",
            color: "rgba(200,240,255,0.62)",
            letterSpacing: "0.05em",
        }}>
            <span style={{ color: accent, display: "flex", flexShrink: 0 }}>
                <Icon t={icon} sz={12} c={accent} />
            </span>
            {children}
        </div>
    );
}

/* ─── CapabilityTag: can_check_in / is_qr_valid ─────────────────────────*/
function CapTag({ active, icon, label, color }) {
    return (
        <motion.span
            animate={active ? { opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "clamp(8px,1.4vw,10px)",
                letterSpacing: "0.12em",
                color: active ? color : "rgba(255,255,255,0.18)",
                border: `1px solid ${active ? color + "60" : "rgba(255,255,255,0.08)"}`,
                background: active ? `${color}10` : "transparent",
                borderRadius: 2,
                padding: "2px 8px 2px 6px",
            }}
        >
            <Icon t={icon} sz={10} c={active ? color : "rgba(255,255,255,0.18)"} />
            {label}
        </motion.span>
    );
}

/* ─── BookingCard ──────────────────────────────────────────────────────── */
export default function BookingCard({ booking, index = 0, onView, onCancel }) {
    const [hov, setHov] = useState(false);
    const [imgErr, setImgErr] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const isPending = booking.status === "pending";
    const amount    = fmtAmount(booking.total_amount);

    const handleCancel = async () => {
        setCancelling(true);
        try { await onCancel?.(); } finally { setCancelling(false); }
    };

    return (
        <>
            <style>{`
                .bcard { display: grid; grid-template-columns: clamp(100px,23%,168px) 1fr; grid-template-rows: auto auto; }
                .bcard-body { display: grid; grid-template-columns: 1fr auto; gap: 0; }
                @media(max-width:600px){
                    .bcard { grid-template-columns:1fr!important; }
                    .bcard-img-wrap { min-height:150px!important; clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)!important; }
                    .bcard-body { grid-template-columns:1fr!important; }
                    .bcard-actions { flex-direction:row!important; padding:0 16px 18px!important; border-top:1px solid rgba(0,255,255,0.08)!important; }
                }
                @media(max-width:400px){
                    .bcard-actions button { font-size:8px!important; padding:6px 10px!important; }
                }
            `}</style>

            <motion.article
                className="bcard"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14, scale: 0.97 }}
                transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                onHoverStart={() => setHov(true)}
                onHoverEnd={() => setHov(false)}
                style={{
                    position: "relative",
                    clipPath: CLP_CARD,
                    background: hov ? "rgba(0,255,255,0.045)" : "rgba(255,255,255,0.025)",
                    border: `1px solid ${hov ? "rgba(0,255,255,0.42)" : "rgba(0,255,255,0.11)"}`,
                    transition: "background 0.3s, border-color 0.28s",
                    marginBottom: "clamp(14px,2.5vw,22px)",
                    overflow: "hidden",
                }}
            >
                {/* top gradient bar */}
                <motion.div
                    animate={{ scaleX: hov ? 1 : 0, opacity: hov ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 2,
                        background: "linear-gradient(90deg,#00ffff,#bf00ff,#ff3366)",
                        transformOrigin: "left", zIndex: 6, pointerEvents: "none",
                    }}
                />

                {/* inset glow */}
                <AnimatePresence>
                    {hov && (
                        <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: "absolute", inset: 0, pointerEvents: "none",
                                boxShadow: "inset 0 0 55px rgba(0,255,255,0.06)", zIndex: 1 }} />
                    )}
                </AnimatePresence>

                {/* chamfer corner accents */}
                <div style={{ position:"absolute",top:0,right:0,width:24,height:24,
                    background:"linear-gradient(225deg,rgba(0,255,255,0.45),transparent 65%)",
                    pointerEvents:"none",zIndex:7 }} />
                <div style={{ position:"absolute",bottom:0,left:0,width:24,height:24,
                    background:"linear-gradient(45deg,rgba(191,0,255,0.3),transparent 65%)",
                    pointerEvents:"none",zIndex:7 }} />

                {/* ── IMAGE col (spans both rows) ── */}
                <div
                    className="bcard-img-wrap"
                    style={{
                        gridRow: "1 / 3",
                        position: "relative", overflow: "hidden",
                        clipPath: CLP_IMG,
                        minHeight: "clamp(130px,20vw,200px)",
                        background: "rgba(0,255,255,0.03)",
                        zIndex: 2, flexShrink: 0,
                    }}
                >
                    {booking.game_image && !imgErr ? (
                        <img
                            src={booking.game_image}
                            alt={booking.game_name ?? "Game"}
                            onError={() => setImgErr(true)}
                            style={{
                                width: "100%", height: "100%", objectFit: "cover", display: "block",
                                filter: "brightness(0.78) saturate(1.3)",
                                transform: hov ? "scale(1.08)" : "scale(1)",
                                transition: "transform 0.55s ease, filter 0.3s",
                            }}
                        />
                    ) : (
                        <div style={{ width:"100%",height:"100%",minHeight:"clamp(130px,20vw,200px)",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            flexDirection:"column",gap:8 }}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,255,0.15)" strokeWidth="1.2">
                                <rect x="2" y="3" width="20" height="14" rx="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                            <span style={{ fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                                color:"rgba(0,255,255,0.18)",letterSpacing:"0.14em" }}>NO IMAGE</span>
                        </div>
                    )}
                    {/* edge fade */}
                    <div style={{ position:"absolute",inset:0,
                        background:"linear-gradient(90deg,transparent 50%,rgba(8,8,18,0.82))",
                        pointerEvents:"none" }} />
                    {/* scanlines */}
                    <div style={{ position:"absolute",inset:0,
                        background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.1) 3px,rgba(0,0,0,0.1) 4px)",
                        pointerEvents:"none" }} />
                </div>

                {/* ── INFO + ACTIONS wrapper ── */}
                <div className="bcard-body" style={{ gridRow: "1 / 3", zIndex: 2, position: "relative" }}>

                    {/* INFO */}
                    <div style={{
                        padding: "clamp(14px,2.5vw,22px) clamp(12px,2vw,18px)",
                        display: "flex", flexDirection: "column", gap: 9, minWidth: 0,
                    }}>
                        {/* booking_id eyebrow */}
                        <span style={{
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: "clamp(8px,1.4vw,10px)",
                            color: "rgba(0,255,255,0.35)",
                            letterSpacing: "0.18em",
                            display: "flex", alignItems: "center", gap: 4,
                        }}>
                            <Icon t="hash" sz={9} c="rgba(0,255,255,0.3)" />
                            {booking.booking_id ?? String(booking.id).substring(0,8).toUpperCase()}
                        </span>

                        {/* game name */}
                        <h3 style={{
                            fontFamily: "Orbitron, sans-serif",
                            fontSize: "clamp(13px,2.6vw,17px)",
                            fontWeight: 800, margin: 0,
                            color: "#e0f7ff",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            lineHeight: 1.2,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                            {booking.game_name ?? "Unknown Session"}
                        </h3>

                        {/* divider */}
                        <div style={{ height:1, background:"linear-gradient(90deg,rgba(0,255,255,0.18),transparent)" }} />

                        {/* meta grid */}
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px 16px" }}>
                            <MetaPill icon="cal" accent="#00ffff">{fmtDate(booking.booking_date)}</MetaPill>
                            <MetaPill icon="usr" accent="#ff77aa">
                                {booking.total_people} {booking.total_people === 1 ? "Player" : "Players"}
                            </MetaPill>
                            <MetaPill icon="clk" accent="#bf00ff">
                                {fmtTime(booking.start_time)} – {fmtTime(booking.end_time)}
                            </MetaPill>
                            {amount && (
                                <MetaPill icon="coin" accent="#f0c040">{amount}</MetaPill>
                            )}
                        </div>

                        {/* status badges */}
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                            <BookingStatusBadge status={booking.status} />
                            <PaymentStatusBadge status={booking.payment_status} />
                        </div>

                        {/* capability tags */}
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            <CapTag active={booking.can_check_in}  icon="chk" label="CHECK-IN" color="#00ffff" />
                            <CapTag active={booking.is_qr_valid}   icon="qr"  label="QR VALID"  color="#bf00ff" />
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div
                        className="bcard-actions"
                        style={{
                            display: "flex", flexDirection: "column", gap: 10,
                            padding: "clamp(14px,2.5vw,22px) clamp(12px,2vw,16px) clamp(14px,2.5vw,22px) 0",
                            justifyContent: "center", alignItems: "stretch",
                            minWidth: "clamp(86px,13vw,116px)",
                            borderLeft: "1px solid rgba(0,255,255,0.07)",
                        }}
                    >
                        <CyberBtn
                            onClick={onView}
                            color="#00ffff" glow="rgba(0,255,255,0.4)"
                            icon={<Icon t="eye" sz={12} c="inherit" />}
                        >
                            DETAILS
                        </CyberBtn>

                        {isPending && (
                            <CyberBtn
                                onClick={handleCancel} disabled={cancelling}
                                color="#ff3366" glow="rgba(255,51,102,0.4)"
                                icon={<Icon t="x" sz={12} c="inherit" />}
                            >
                                {cancelling ? "···" : "CANCEL"}
                            </CyberBtn>
                        )}
                    </div>
                </div>
            </motion.article>
        </>
    );
}