import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import UserLayout from "../../Userlayout";
import { getBookings, cancelBooking } from "../../../api/userapi";
import BookingCard from "../booking/BookingCard";

/* ─── Scanlines ────────────────────────────────────────────────────────── */
const Scanlines = () => (
    <div aria-hidden="true" style={{
        position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
        background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,255,0.016) 2px,rgba(0,255,255,0.016) 4px)",
    }} />
);

/* ─── Skeleton ─────────────────────────────────────────────────────────── */
const Shimmer = ({ w = "70%", h = 12, mb = 10 }) => (
    <div style={{
        height:h, width:w, marginBottom:mb, borderRadius:2,
        background:"linear-gradient(90deg,rgba(0,255,255,0.06) 25%,rgba(0,255,255,0.16) 50%,rgba(0,255,255,0.06) 75%)",
        backgroundSize:"200% 100%", animation:"dqd-shimmer 1.6s infinite",
    }} />
);

const SkeletonCard = ({ i }) => (
    <motion.div
        initial={{ opacity:0, y:18 }}
        animate={{ opacity:1, y:0 }}
        transition={{ delay: i * 0.1 }}
        style={{
            clipPath:"polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,22px 100%,0 calc(100% - 22px))",
            background:"rgba(0,255,255,0.03)",
            border:"1px solid rgba(0,255,255,0.1)",
            display:"grid",
            gridTemplateColumns:"clamp(100px,23%,168px) 1fr",
            marginBottom:"clamp(14px,2.5vw,22px)",
            overflow:"hidden",
            minHeight:140,
        }}
    >
        <div style={{ background:"rgba(0,255,255,0.04)", borderRight:"1px solid rgba(0,255,255,0.06)" }} />
        <div style={{ padding:"clamp(14px,2.5vw,22px) clamp(12px,2vw,18px)" }}>
            <Shimmer w="40%" h={9} mb={14} />
            <Shimmer w="65%" h={18} mb={16} />
            <Shimmer w="80%" h={11} mb={8} />
            <Shimmer w="60%" h={11} mb={8} />
            <Shimmer w="50%" h={11} mb={0} />
        </div>
        <style>{`@keyframes dqd-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </motion.div>
);

/* ─── Empty state ──────────────────────────────────────────────────────── */
const EmptyState = () => (
    <motion.div
        initial={{ opacity:0, scale:0.94 }}
        animate={{ opacity:1, scale:1 }}
        transition={{ duration:0.5, ease:"easeOut" }}
        style={{
            display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding:"clamp(60px,12vw,100px) 24px",
            textAlign:"center",
        }}
    >
        <motion.div
            animate={{ opacity:[0.45,1,0.45] }}
            transition={{ duration:2.6, repeat:Infinity, ease:"easeInOut" }}
            style={{ marginBottom:28 }}
        >
            <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                <polygon points="44,6 79,24 79,64 44,82 9,64 9,24"
                    stroke="rgba(0,255,255,0.42)" strokeWidth="1.4" fill="rgba(0,255,255,0.05)" />
                <polygon points="44,20 67,32 67,56 44,68 21,56 21,32"
                    stroke="rgba(0,255,255,0.18)" strokeWidth="1" fill="none" />
                <line x1="36" y1="36" x2="52" y2="52" stroke="rgba(0,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="52" y1="36" x2="36" y2="52" stroke="rgba(0,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        </motion.div>

        <p style={{
            fontFamily:"Orbitron, sans-serif",
            fontSize:"clamp(14px,3vw,19px)",
            fontWeight:800,
            color:"rgba(0,255,255,0.8)",
            letterSpacing:"0.2em",
            textTransform:"uppercase",
            margin:"0 0 10px",
        }}>
            No Active Bookings
        </p>
        <p style={{
            fontFamily:"'Share Tech Mono', monospace",
            fontSize:"clamp(10px,1.8vw,13px)",
            color:"rgba(0,255,255,0.38)",
            letterSpacing:"0.08em",
            maxWidth:300,
            lineHeight:1.6,
        }}>
            Your session queue is empty.<br/>Book a slot to get in the game.
        </p>

        <motion.div
            initial={{ width:0 }}
            animate={{ width:140 }}
            transition={{ delay:0.5, duration:0.7, ease:"easeOut" }}
            style={{
                height:1,
                background:"linear-gradient(90deg,transparent,rgba(0,255,255,0.5),transparent)",
                marginTop:32,
            }}
        />
    </motion.div>
);

/* ─── Stats bar ────────────────────────────────────────────────────────── */
const StatsBar = ({ bookings }) => {
    const total   = bookings.length;
    const paid    = bookings.filter(b => b.payment_status === "paid").length;
    const checkin = bookings.filter(b => b.can_check_in).length;
    const qr      = bookings.filter(b => b.is_qr_valid).length;

    const items = [
        { label:"SESSIONS",   value:total,   color:"#00ffff" },
        { label:"PAID",       value:paid,    color:"#00ff88" },
        { label:"CHECK-IN",   value:checkin, color:"#bf00ff" },
        { label:"QR ACTIVE",  value:qr,      color:"#f0c040" },
    ];

    return (
        <motion.div
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:0.35, duration:0.45 }}
            style={{
                display:"grid",
                gridTemplateColumns:"repeat(4,1fr)",
                gap:1,
                marginBottom:"clamp(20px,4vw,36px)",
                background:"rgba(0,255,255,0.07)",
                clipPath:"polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))",
                overflow:"hidden",
            }}
        >
            {items.map(({ label, value, color }) => (
                <div key={label} style={{
                    background:"rgba(6,6,18,0.82)",
                    padding:"clamp(10px,2vw,16px) clamp(8px,1.5vw,14px)",
                    display:"flex", flexDirection:"column",
                    alignItems:"center", gap:4,
                    borderRight:"1px solid rgba(0,255,255,0.07)",
                }}>
                    <span style={{
                        fontFamily:"Orbitron, sans-serif",
                        fontSize:"clamp(16px,3.5vw,26px)",
                        fontWeight:900,
                        color,
                        lineHeight:1,
                        textShadow:`0 0 12px ${color}60`,
                    }}>
                        {value}
                    </span>
                    <span style={{
                        fontFamily:"'Share Tech Mono', monospace",
                        fontSize:"clamp(7px,1.2vw,9px)",
                        color:"rgba(0,255,255,0.4)",
                        letterSpacing:"0.18em",
                    }}>
                        {label}
                    </span>
                </div>
            ))}
        </motion.div>
    );
};

/* ─── MyBookings ───────────────────────────────────────────────────────── */
export default function MyBookings() {
    const navigate  = useNavigate();
    const [loading, setLoading]  = useState(true);
    const [bookings, setBookings] = useState([]);

    useEffect(() => { loadBookings(); }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const res = await getBookings();
            setBookings(res.results);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Cancel this booking?")) return;
        await cancelBooking(id);
        loadBookings();
    };

    return (
        <UserLayout>
            <Scanlines />

            <div style={{
                position:"relative", zIndex:1,
                maxWidth:920,
                margin:"0 auto",
                padding:"clamp(16px,4vw,40px) clamp(12px,3vw,24px)",
            }}>

                {/* ── Page header ── */}
                <motion.div
                    initial={{ opacity:0, y:-22 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.48 }}
                    style={{ marginBottom:"clamp(20px,4vw,36px)" }}
                >
                    <p style={{
                        fontFamily:"'Share Tech Mono', monospace",
                        fontSize:"clamp(9px,1.6vw,11px)",
                        letterSpacing:"0.32em",
                        color:"rgba(0,255,255,0.45)",
                        textTransform:"uppercase",
                        marginBottom:8,
                    }}>
                        ▸ DQD GAMING · SESSION REGISTRY
                    </p>

                    <div style={{ display:"flex", alignItems:"flex-end", gap:16, flexWrap:"wrap" }}>
                        <h2 style={{
                            fontFamily:"Orbitron, sans-serif",
                            fontSize:"clamp(22px,5.5vw,38px)",
                            fontWeight:900, margin:0,
                            background:"linear-gradient(90deg,#00ffff 0%,#bf00ff 55%,#ff3366 100%)",
                            WebkitBackgroundClip:"text",
                            WebkitTextFillColor:"transparent",
                            letterSpacing:"0.06em",
                            textTransform:"uppercase",
                            lineHeight:1.1,
                        }}>
                            My Bookings
                        </h2>

                        {!loading && bookings.length > 0 && (
                            <motion.span
                                initial={{ opacity:0, scale:0.65 }}
                                animate={{ opacity:1, scale:1 }}
                                transition={{ delay:0.28 }}
                                style={{
                                    fontFamily:"'Share Tech Mono', monospace",
                                    fontSize:"clamp(9px,1.5vw,11px)",
                                    color:"#00ffff",
                                    border:"1px solid rgba(0,255,255,0.38)",
                                    borderRadius:2,
                                    padding:"3px 11px",
                                    letterSpacing:"0.12em",
                                    background:"rgba(0,255,255,0.07)",
                                    marginBottom:5,
                                }}
                            >
                                {bookings.length} ACTIVE
                            </motion.span>
                        )}
                    </div>

                    {/* Accent underline */}
                    <motion.div
                        initial={{ scaleX:0 }}
                        animate={{ scaleX:1 }}
                        transition={{ delay:0.22, duration:0.65, ease:"easeOut" }}
                        style={{
                            marginTop:14, height:1,
                            background:"linear-gradient(90deg,#00ffff,#bf00ff,transparent)",
                            transformOrigin:"left",
                        }}
                    />
                </motion.div>

                {/* ── Stats bar (only when loaded and has data) ── */}
                {!loading && bookings.length > 0 && <StatsBar bookings={bookings} />}

                {/* ── Content ── */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="skel" exit={{ opacity:0 }}>
                            {[0,1,2].map(i => <SkeletonCard key={i} i={i} />)}
                        </motion.div>
                    ) : bookings.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                            <EmptyState />
                        </motion.div>
                    ) : (
                        <motion.div key="list" exit={{ opacity:0 }}>
                            {bookings.map((booking, idx) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    index={idx}
                                    onView={() => navigate(`/user/bookings/${booking.id}`)}
                                    onCancel={() => handleCancel(booking.id)}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </UserLayout>
    );
}