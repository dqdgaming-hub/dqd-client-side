import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import UserLayout from "../../Userlayout";
import { getGameDetails, getAvailableSlots, createBooking } from "../../../api/userapi";

import SlotSelector   from "../booking/SlotSelector";
import BookingMembers from "../booking/BookingMembers";
import BookingSummary from "../booking/BookingSummary";

// ── Design tokens ─────────────────────────────────────────────────────────────
const VOID   = "#05040A";
const PANEL  = "#0D0A18";
const PURPLE = "#7A2CFF";
const SILVER = "#B9C2D9";
const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const BORDER = "rgba(122,44,255,0.22)";

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  const isError = type === "error";
  const color   = isError ? "#FF4D6D" : "#00FFB2";

  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0,   scale: 1 }}
      exit={{   opacity: 0, y: -20,  scale: 0.95 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position:        "fixed",
        top:             24,
        left:            "50%",
        transform:       "translateX(-50%)",
        zIndex:          99999,
        width:           "min(420px, 90vw)",
        background:      PANEL,
        border:          `1px solid ${color}55`,
        clipPath:        "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
        padding:         "14px 18px",
        display:         "flex",
        alignItems:      "flex-start",
        gap:             12,
        boxShadow:       `0 0 40px ${color}33, 0 8px 32px rgba(0,0,0,0.6)`,
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 3,
          background: color, boxShadow: `0 0 8px ${color}`,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Orbitron', monospace", fontSize: 8, fontWeight: 700,
          letterSpacing: "0.2em", color, textTransform: "uppercase", marginBottom: 4,
        }}>{isError ? "⚠ Error" : "✓ Success"}</div>
        <div style={{
          fontFamily: "'Rajdhani', 'Inter', sans-serif",
          fontSize: 13, color: `${SILVER}cc`, lineHeight: 1.5,
        }}>{message}</div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: `${SILVER}55`, fontSize: 14, padding: 0, flexShrink: 0,
          lineHeight: 1,
        }}
      >✕</button>
    </motion.div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function HeroSkeleton() {
  const shimmer = `linear-gradient(90deg, ${PANEL} 25%, #1a1232 50%, ${PANEL} 75%)`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[280, 80, 120, 200, 160].map((h, i) => (
        <div key={i} style={{
          background: PANEL, border: `1px solid ${BORDER}`,
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
          overflow: "hidden", height: h,
        }}>
          <motion.div
            animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.1 }}
            style={{ height: "100%", background: shimmer, backgroundSize: "400% 100%" }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Section wrapper card ──────────────────────────────────────────────────────
function Section({ children, accentColor = PURPLE }) {
  return (
    <div style={{
      background: PANEL,
      border:     `1px solid ${BORDER}`,
      clipPath:   "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
      padding:    "20px 20px 18px",
      position:   "relative",
      overflow:   "hidden",
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(to bottom, ${accentColor}cc, ${accentColor}22)`,
      }}/>
      <div style={{ paddingLeft: 10 }}>{children}</div>
    </div>
  );
}

function SectionLabel({ text, accentColor = PURPLE }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: 3, height: 16, background: `linear-gradient(to bottom, ${accentColor}, ${GOLD}88)` }}
      />
      <span style={{
        fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase",
      }}>{text}</span>
    </div>
  );
}

// ── Floating particles ────────────────────────────────────────────────────────
function Particle({ style, dur, delay }) {
  return (
    <motion.div
      style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", ...style }}
      animate={{ y: [0, -26, 0], opacity: [style.opacity * 0.4, style.opacity, style.opacity * 0.4] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ── Back icon ─────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M14.5 5 8 12l6.5 7" stroke={GOLD} strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Stagger variants ──────────────────────────────────────────────────────────
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] } },
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CreateBooking() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [game,         setGame]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [date,         setDate]         = useState("");
  const [slots,        setSlots]        = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [members,      setMembers]      = useState([]);
  const [notes,        setNotes]        = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [toast,        setToast]        = useState(null);

  useEffect(() => { loadGame(); }, []);

  const loadGame = async () => {
    try {
      const res = await getGameDetails(id);
      setGame(res.data);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (value) => {
    setDate(value);
    setSelectedSlot(null);
    setSlots([]);
    if (!value) return;
    setSlotsLoading(true);
    try {
      const res = await getAvailableSlots(id, value);
      setSlots(res.results || []);
    } finally {
      setSlotsLoading(false);
    }
  };

  const addMember    = ()                      => setMembers([...members, { name: "", phone: "" }]);
  const removeMember = (i)                     => setMembers(members.filter((_, idx) => idx !== i));
  const updateMember = (i, key, val)           => {
    const d = [...members]; d[i][key] = val; setMembers(d);
  };

  const showToast = (message, type = "success") => setToast({ message, type });

  const submitBooking = async () => {
    if (!selectedSlot) { showToast("Please select a time slot first.", "error"); return; }
    if (!date)         { showToast("Please select a date.", "error"); return; }

    setSubmitting(true);
    try {
      const res = await createBooking({
        item:         game.id,
        booking_date: date,
        start_time:   selectedSlot.start_time,
        end_time:     selectedSlot.end_time,
        notes,
        members,
      });
      showToast(res.message || "Booking confirmed!", "success");
      setTimeout(() => navigate(`/user/bookings/${res.booking.id}`), 1200);
    } catch (err) {

    const message =
        err.response?.data?.message ||
        err.response?.data?.non_field_errors?.[0] ||
        "Unable to create booking.";

    showToast(message, "error");


    } finally {
      setSubmitting(false);
    }
  };

  const particles = [
    { w: 5, l: "7%",  t: "14%", c: GOLD,   o: 0.32, dur: 4.3, d: 0    },
    { w: 4, l: "88%", t: "22%", c: PURPLE, o: 0.44, dur: 3.7, d: 0.8  },
    { w: 6, l: "68%", t: "70%", c: GOLD,   o: 0.28, dur: 5.0, d: 1.3  },
    { w: 3, l: "22%", t: "82%", c: PURPLE, o: 0.48, dur: 3.8, d: 0.5  },
    { w: 4, l: "48%", t: "10%", c: GOLD,   o: 0.3,  dur: 4.7, d: 2.0  },
  ];

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap');
          *, *::before, *::after { box-sizing: border-box; }

          .cb-input {
            width: 100%;
            background: rgba(122,44,255,0.06);
            border: 1px solid ${BORDER};
            outline: none;
            padding: 11px 14px;
            font-family: 'Rajdhani', 'Inter', sans-serif;
            font-size: 13px; font-weight: 600;
            color: ${SILVER};
            letter-spacing: 0.03em;
            clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
            transition: border-color 0.2s, background 0.2s;
          }
          .cb-input:focus {
            border-color: ${GOLD}88;
            background: rgba(212,175,55,0.06);
          }
          .cb-input::placeholder { color: rgba(185,194,217,0.3); }
          .cb-input::-webkit-calendar-picker-indicator { filter: invert(0.5) sepia(1) hue-rotate(200deg); cursor: pointer; }

          .cb-textarea {
            width: 100%;
            background: rgba(122,44,255,0.06);
            border: 1px solid ${BORDER};
            outline: none;
            padding: 12px 14px;
            font-family: 'Rajdhani', 'Inter', sans-serif;
            font-size: 13px; font-weight: 600;
            color: ${SILVER};
            letter-spacing: 0.03em;
            resize: vertical;
            min-height: 90px;
            clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
            transition: border-color 0.2s, background 0.2s;
          }
          .cb-textarea:focus {
            border-color: ${GOLD}88;
            background: rgba(212,175,55,0.06);
          }
          .cb-textarea::placeholder { color: rgba(185,194,217,0.3); }

          .cb-back:hover {
            background: rgba(212,175,55,0.1) !important;
            border-color: ${GOLD}88 !important;
          }
          .cb-back:hover .cb-arrow { transform: translateX(-3px); }
          .cb-arrow { transition: transform 0.2s ease; display: inline-flex; }

          @media (max-width: 560px) {
            .cb-page { padding: 14px 12px 90px !important; }
          }
        `}</style>

        {/* ── Toast ── */}
        <AnimatePresence>
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </AnimatePresence>

        <div
          className="cb-page"
          style={{
            minHeight:     "100vh",
            background:    VOID,
            position:      "relative",
            overflow:      "hidden",
            padding:       "clamp(16px,3vw,32px) clamp(12px,4vw,28px) 80px",
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            fontFamily:    "'Inter','Segoe UI',sans-serif",
          }}
        >
          {/* ── Ambient orbs ── */}
          <div style={{
            position: "absolute", top: "-8%", left: "-5%",
            width: "min(500px,80vw)", height: "min(500px,80vw)", borderRadius: "50%",
            background: `radial-gradient(circle, ${PURPLE}16 0%, transparent 70%)`,
            filter: "blur(70px)", pointerEvents: "none",
          }}/>
          <div style={{
            position: "absolute", bottom: "5%", right: "-4%",
            width: "min(400px,66vw)", height: "min(400px,66vw)", borderRadius: "50%",
            background: `radial-gradient(circle, ${GOLD}0D 0%, transparent 70%)`,
            filter: "blur(70px)", pointerEvents: "none",
          }}/>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: `radial-gradient(circle, ${SILVER} 1px, transparent 1px)`,
            backgroundSize:  "28px 28px", opacity: 0.03,
          }}/>
          {particles.map((p, i) => (
            <Particle key={i} dur={p.dur} delay={p.d} style={{
              width: p.w, height: p.w, left: p.l, top: p.t,
              background: p.c, opacity: p.o, boxShadow: `0 0 8px ${p.c}`,
            }}/>
          ))}

          {/* ── Content column ── */}
          <div style={{ width: "100%", maxWidth: 720, position: "relative", zIndex: 2 }}>

            {/* ── Back button ── */}
            <motion.button
              className="cb-back"
              onClick={() => navigate(-1)}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                marginBottom: 22, padding: "8px 18px 8px 12px",
                background: "rgba(122,44,255,0.07)",
                border: `1px solid ${BORDER}`,
                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
                cursor: "pointer", outline: "none",
                fontFamily: "'Orbitron', monospace", fontSize: 9, fontWeight: 700,
                letterSpacing: "0.22em", color: `${GOLD}cc`, textTransform: "uppercase",
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              <span className="cb-arrow"><BackIcon/></span>
              Back
            </motion.button>

            {/* ── Page label ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.45 }}
              style={{ marginBottom: 20 }}
            >
              <div style={{
                fontFamily: "'Orbitron', monospace", fontSize: 8,
                letterSpacing: "0.28em", color: `${GOLD}66`,
                textTransform: "uppercase", marginBottom: 6,
              }}>◈ NEW RESERVATION</div>
              <h1 style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "clamp(20px, 4.5vw, 30px)", fontWeight: 900,
                color: GOLDHI, textTransform: "uppercase",
                letterSpacing: "0.06em", margin: 0, lineHeight: 1.1,
                textShadow: `0 0 28px ${GOLD}44`,
              }}>Create Booking</h1>
            </motion.div>

            {/* ── Main content ── */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <HeroSkeleton/>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >

                  {/* ── Game hero card ── */}
                  <motion.div variants={itemVariants}>
                    <div style={{
                      position: "relative", overflow: "hidden",
                      background: PANEL, border: `1px solid ${BORDER}`,
                      clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
                    }}>
                      {/* Image */}
                      <div style={{ position: "relative", height: "clamp(140px,24vw,220px)", overflow: "hidden" }}>
                        <motion.img
                          src={game.image} alt={game.name}
                          initial={{ scale: 1.07 }} animate={{ scale: 1 }}
                          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                        <div style={{
                          position: "absolute", inset: 0,
                          background: `linear-gradient(to bottom, transparent 30%, ${PANEL}EE 92%, ${PANEL} 100%)`,
                        }}/>
                        {/* Gold edge trace */}
                        <motion.div
                          animate={{ opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 2.8, repeat: Infinity }}
                          style={{
                            position: "absolute", top: 0, right: 0,
                            width: 2, height: "100%",
                            background: `linear-gradient(to bottom, transparent, ${GOLD}88, transparent)`,
                          }}
                        />
                      </div>

                      {/* Game info */}
                      <div style={{ padding: "16px 22px 20px" }}>
                        <div style={{
                          fontFamily: "'Orbitron', monospace", fontSize: 8,
                          letterSpacing: "0.26em", color: `${GOLD}66`,
                          textTransform: "uppercase", marginBottom: 6,
                        }}>◈ GAME SESSION</div>
                        <div style={{
                          display: "flex", alignItems: "flex-end",
                          justifyContent: "space-between", flexWrap: "wrap", gap: 10,
                        }}>
                          <h2 style={{
                            fontFamily: "'Orbitron', monospace",
                            fontSize: "clamp(16px, 3.5vw, 22px)", fontWeight: 900,
                            color: GOLDHI, textTransform: "uppercase",
                            letterSpacing: "0.06em", margin: 0,
                            textShadow: `0 0 20px ${GOLD}44`,
                          }}>{game.name}</h2>
                          <div style={{
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: 14, color: GOLD, letterSpacing: "0.06em",
                            background: `${GOLD}11`, border: `1px solid ${GOLD}33`,
                            padding: "6px 14px",
                            clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)",
                          }}>
                            <span style={{ fontSize: 9, color: `${GOLD}88`, marginRight: 3 }}>QAR</span>
                            {Number(game.price_per_hour).toFixed(2)}
                            <span style={{ fontSize: 9, color: `${GOLD}77`, marginLeft: 4 }}>/hr</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* ── Date picker ── */}
                  <motion.div variants={itemVariants}>
                    <Section accentColor={PURPLE}>
                      <SectionLabel text="Select Date" accentColor={PURPLE} />
                      <label style={{
                        display: "block", marginBottom: 6,
                        fontFamily: "'Orbitron', monospace", fontSize: 8,
                        letterSpacing: "0.18em", color: `${SILVER}55`, textTransform: "uppercase",
                      }}>Booking Date</label>
                      <input
                        type="date"
                        className="cb-input"
                        value={date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={e => loadSlots(e.target.value)}
                      />
                    </Section>
                  </motion.div>

                  {/* ── Slot selector ── */}
                  <AnimatePresence>
                    {date && (
                      <motion.div
                        variants={itemVariants}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Section accentColor={GOLD}>
                          {slotsLoading ? (
                            <div style={{
                              padding: "30px 0", textAlign: "center",
                              fontFamily: "'Orbitron', monospace", fontSize: 9,
                              letterSpacing: "0.2em", color: `${GOLD}77`, textTransform: "uppercase",
                            }}>
                              <motion.span
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                              >Loading Slots…</motion.span>
                            </div>
                          ) : slots.length > 0 ? (
                            <SlotSelector
                              slots={slots}
                              selectedSlot={selectedSlot}
                              onSelect={setSelectedSlot}
                            />
                          ) : (
                            <div style={{
                              padding: "24px 0", textAlign: "center",
                              fontFamily: "'Rajdhani', 'Inter', sans-serif",
                              fontSize: 13, color: `${SILVER}44`, letterSpacing: "0.04em",
                            }}>
                              No available slots for this date.
                            </div>
                          )}
                        </Section>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Members ── */}
                  <motion.div variants={itemVariants}>
                    <Section accentColor="#C026D3">
                      <BookingMembers
                        members={members}
                        addMember={addMember}
                        removeMember={removeMember}
                        updateMember={updateMember}
                      />
                    </Section>
                  </motion.div>

                  {/* ── Notes ── */}
                  <motion.div variants={itemVariants}>
                    <Section accentColor={SILVER}>
                      <SectionLabel text="Notes" accentColor={SILVER} />
                      <label style={{
                        display: "block", marginBottom: 6,
                        fontFamily: "'Orbitron', monospace", fontSize: 8,
                        letterSpacing: "0.18em", color: `${SILVER}55`, textTransform: "uppercase",
                      }}>Additional Notes (optional)</label>
                      <textarea
                        className="cb-textarea"
                        placeholder="Any special requests or notes for your session…"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                      />
                    </Section>
                  </motion.div>

                  {/* ── Summary ── */}
                  <motion.div variants={itemVariants}>
                    <BookingSummary game={game} slot={selectedSlot} members={members} />
                  </motion.div>

                  {/* ── Submit button ── */}
                  <motion.div variants={itemVariants}>
                    <motion.button
                      onClick={submitBooking}
                      disabled={submitting}
                      whileHover={!submitting ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!submitting ? { scale: 0.98 } : {}}
                      style={{
                        width:      "100%",
                        padding:    "16px",
                        background: submitting
                          ? `${GOLD}22`
                          : `linear-gradient(135deg, ${PURPLE}cc, ${GOLD}88)`,
                        border:     `1px solid ${submitting ? GOLD + "33" : GOLD + "77"}`,
                        clipPath:   "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                        cursor:     submitting ? "not-allowed" : "pointer",
                        outline:    "none",
                        fontFamily: "'Orbitron', monospace",
                        fontSize:   12, fontWeight: 900,
                        letterSpacing: "0.26em",
                        color:      submitting ? `${GOLD}66` : GOLDHI,
                        textTransform: "uppercase",
                        boxShadow:  submitting ? "none" : `0 0 30px ${PURPLE}44, 0 0 14px ${GOLD}22`,
                        transition: "background 0.3s, box-shadow 0.3s, border-color 0.3s",
                        position:   "relative",
                        overflow:   "hidden",
                      }}
                    >
                      {/* Sweep shimmer on hover */}
                      {!submitting && (
                        <motion.div
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                          style={{
                            position: "absolute", top: 0, left: 0,
                            width: "35%", height: "100%",
                            background: `linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)`,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      {submitting ? (
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >Processing…</motion.span>
                      ) : "◈ Confirm Booking"}
                    </motion.button>
                  </motion.div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </>
    </UserLayout>
  );
}