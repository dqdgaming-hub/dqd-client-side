import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import StatusBadge from "./StatusBadge";

const spring = { type: "spring", stiffness: 260, damping: 24 };
const ease = [0.22, 1, 0.36, 1];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.055 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.34, ease } },
};

export default function ComboTicketModal({ booking, onClose }) {
  const amount = booking?.total_amount ?? booking?.total_price ?? "0.00";
  const status = String(booking?.status || "").toUpperCase();
  const members = booking?.members || [];

  return (
    <AnimatePresence>
      {booking && (
        <motion.div
          className="ticketOverlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="ticketShell"
            initial={{ scale: 0.92, y: 28, rotateX: 7 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.94, y: 22, opacity: 0 }}
            transition={spring}
          >
            <style>{ticketCss}</style>

            <div className="ticketScan" />
            <motion.div
              className="ticketSweep"
              animate={{ top: ["-30%", "130%"] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
            />

            <button type="button" onClick={onClose} className="ticketClose">
              ×
            </button>

            <div className="ticketGlow" />

            <section
              className="ticketPoster"
              style={{
                backgroundImage: booking.combo_image
                  ? `linear-gradient(120deg, rgba(2,10,8,.2), rgba(2,10,8,.94)), url(${booking.combo_image})`
                  : "linear-gradient(135deg,#031b12,#043a2a,#012631)",
              }}
            >
              <motion.div variants={stagger} initial="hidden" animate="show" className="posterContent">
                <motion.div variants={fadeUp} className="posterTop">
                  <span className="ticketEyebrow">// premiere_combo_pass.dat</span>
                  <StatusBadge status={status} />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <h2 className="ticketTitle">{booking.combo_name}</h2>
                  <p className="ticketCode">ID :: {booking.booking_id}</p>
                </motion.div>

                <motion.div variants={fadeUp} className="posterStats">
                  <span>{booking.booking_date}</span>
                  <span>{booking.start_time} - {booking.end_time}</span>
                  <strong>₹{amount}</strong>
                </motion.div>
              </motion.div>
            </section>

            <div className="ticketCut">
              <span />
            </div>

            <section className="ticketBody">
              <motion.div variants={stagger} initial="hidden" animate="show" className="ticketDetails">
                <motion.div variants={fadeUp} className="infoGrid">
                  <Info label="Show date" value={booking.booking_date} />
                  <Info label="Start" value={booking.start_time} />
                  <Info label="End" value={booking.end_time} />
                  <Info label="Players" value={booking.member_count ?? members.length + 1} />
                  <Info label="Amount" value={`₹${amount}`} />
                  <Info label="Checked in" value={booking.checked_in ? "Yes" : "No"} />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <SectionTitle>Cast / Members</SectionTitle>
                  <div className="memberList">
                    <Member name="Primary User" phone="Ticket holder" />
                    {members.map((member) => (
                      <Member
                        key={member.id || `${member.name}-${member.phone}`}
                        name={member.name}
                        phone={member.phone}
                      />
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <SectionTitle>Pass Metadata</SectionTitle>
                  <div className="metaGrid">
                    <Meta label="Booking UUID" value={booking.id} />
                    <Meta label="QR Token" value={booking.qr_token} />
                    <Meta label="Created At" value={formatDateTime(booking.created_at)} />
                    <Meta
                      label="Checked In At"
                      value={booking.checked_in_at ? formatDateTime(booking.checked_in_at) : "Not checked in"}
                    />
                  </div>
                </motion.div>
              </motion.div>

              <motion.aside
                className="ticketStub"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18, duration: 0.38, ease }}
              >
                <div className="stubHeader">
                  <span>Scan gate</span>
                  <strong>{status}</strong>
                </div>

                <motion.div
                  className="qrFrame"
                  animate={{
                    boxShadow: [
                      "0 0 0 rgba(0,255,159,0)",
                      "0 0 34px rgba(0,255,159,.3)",
                      "0 0 0 rgba(0,255,159,0)",
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {booking.qr_code ? (
                    <img src={booking.qr_code} alt="Booking QR code" />
                  ) : (
                    <div className="qrFallback">
                      <strong>No QR</strong>
                      <small>Token available</small>
                    </div>
                  )}
                </motion.div>

                <div className="tokenBox">
                  <small>QR token</small>
                  <strong>{booking.qr_token || "Unavailable"}</strong>
                </div>

                <div className="stubMini">
                  <span>Seat</span>
                  <strong>General</strong>
                </div>

                <div className="stubMini">
                  <span>Admits</span>
                  <strong>{booking.member_count ?? members.length + 1}</strong>
                </div>
              </motion.aside>
            </section>

            <div className="ticketActions">
              <motion.button
                type="button"
                whileHover={{ y: -2, boxShadow: "0 0 20px rgba(0,229,255,.4)" }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="ghostAction"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Info({ label, value }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -3 }} className="infoCard">
      <small>{label}</small>
      <strong>{value || "—"}</strong>
    </motion.div>
  );
}

function Member({ name, phone }) {
  return (
    <div className="memberCard">
      <strong>{name}</strong>
      <span>{phone}</span>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="metaItem">
      <small>{label}</small>
      <span>{value || "—"}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h4 className="sectionTitle">{children}</h4>;
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

const ticketCss = `
.ticketOverlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  padding: 18px;
  background:
    radial-gradient(circle at 20% 10%, rgba(0,255,159,.1), transparent 26%),
    radial-gradient(circle at 80% 20%, rgba(0,229,255,.1), transparent 30%),
    rgba(1,4,3,.86);
  backdrop-filter: blur(14px);
}

.ticketShell {
  position: relative;
  width: min(1060px, 100%);
  max-height: 92vh;
  overflow: auto;
  color: #eafff5;
  border-radius: 6px;
  border: 1px solid rgba(0,255,159,.3);
  background: linear-gradient(165deg, rgba(6,20,16,.98), rgba(1,4,3,.98));
  box-shadow: 0 36px 120px rgba(0,0,0,.6);
  isolation: isolate;
}

.ticketScan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
  background: repeating-linear-gradient(to bottom, rgba(0,255,159,.03) 0px, rgba(0,255,159,.03) 1px, transparent 1px, transparent 3px);
  mix-blend-mode: overlay;
}

.ticketSweep {
  position: absolute;
  left: 0;
  right: 0;
  height: 120px;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(180deg, transparent, rgba(0,255,159,.08) 45%, rgba(0,229,255,.1) 55%, transparent);
}

.ticketGlow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, transparent, rgba(0,229,255,.2), transparent),
    radial-gradient(circle at 10% 0%, rgba(0,255,159,.18), transparent 32%);
  opacity: .75;
  z-index: -1;
}

.ticketClose {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 5;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(0,255,159,.35);
  background: rgba(1,4,3,.66);
  color: #eafff5;
  font-size: 25px;
  cursor: pointer;
}

.ticketPoster {
  min-height: 310px;
  background-size: cover;
  background-position: center;
  display: grid;
  align-items: stretch;
}

.posterContent {
  padding: clamp(22px, 4vw, 38px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 30px;
}

.posterTop,
.posterStats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ticketEyebrow {
  color: #00e5ff;
  text-shadow: 0 0 10px rgba(0,229,255,.5);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  font-weight: 700;
}

.ticketTitle {
  margin: 0;
  max-width: 760px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: clamp(32px, 6vw, 64px);
  line-height: .96;
  letter-spacing: 0;
  color: #fff;
  text-shadow: 0 0 30px rgba(0,255,159,.35), 0 18px 50px rgba(0,0,0,.55);
}

.ticketCode {
  margin: 14px 0 0;
  color: #b6f2ff;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  letter-spacing: 1.4px;
}

.posterStats {
  width: fit-content;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid rgba(0,255,159,.3);
  background: rgba(1,4,3,.6);
  backdrop-filter: blur(10px);
}

.posterStats span,
.posterStats strong {
  padding: 7px 12px;
  border-radius: 4px;
  background: rgba(0,255,159,.08);
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  color: #eafff5;
}

.posterStats strong { color: #00ff9f; }

.ticketCut {
  position: relative;
  height: 38px;
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, rgba(6,20,16,.98), rgba(10,30,24,.85), rgba(6,20,16,.98));
}

.ticketCut::before,
.ticketCut::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(1,4,3,.9);
  transform: translateY(-50%);
}

.ticketCut::before { left: -19px; }
.ticketCut::after { right: -19px; }

.ticketCut span {
  width: 100%;
  border-top: 2px dashed rgba(0,255,159,.32);
}

.ticketBody {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 22px;
  padding: clamp(18px, 4vw, 30px);
}

.ticketDetails { display: grid; gap: 18px; }

.infoGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.infoCard {
  min-width: 0;
  display: grid;
  gap: 7px;
  padding: 14px;
  border-radius: 4px;
  border: 1px solid rgba(0,255,159,.2);
  background: linear-gradient(165deg, rgba(0,255,159,.05), rgba(1,4,3,.5));
}

.infoCard small,
.metaItem small,
.tokenBox small {
  color: #6f9a8a;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.infoCard strong {
  overflow-wrap: anywhere;
  color: #eafff5;
  line-height: 1.35;
}

.sectionTitle {
  margin: 0 0 10px;
  color: #eafff5;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1.6px;
}

.memberList {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.memberCard {
  min-width: 0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px;
  border-radius: 4px;
  background: rgba(1,4,3,.5);
  border: 1px solid rgba(0,255,159,.16);
}

.memberCard strong { color: #eafff5; }

.memberCard span {
  color: #8fb3a8;
  font-weight: 700;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12.5px;
}

.metaGrid { display: grid; gap: 8px; }

.metaItem {
  display: grid;
  gap: 5px;
  padding: 11px 12px;
  border-radius: 4px;
  background: rgba(6,20,16,.5);
  border: 1px solid rgba(0,255,159,.12);
}

.metaItem span {
  color: #cdeee2;
  overflow-wrap: anywhere;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  line-height: 1.45;
}

.ticketStub {
  position: relative;
  display: grid;
  align-content: start;
  gap: 14px;
  padding-left: 22px;
  border-left: 2px dashed rgba(0,255,159,.28);
}

.stubHeader {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #00e5ff;
  text-shadow: 0 0 10px rgba(0,229,255,.4);
  text-transform: uppercase;
  letter-spacing: 1.3px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  font-weight: 700;
}

.qrFrame {
  width: min(210px, 100%);
  aspect-ratio: 1;
  margin: 0 auto;
  padding: 12px;
  border-radius: 6px;
  background:
    linear-gradient(#04140e,#04140e) padding-box,
    linear-gradient(135deg,#00ff9f,#00e5ff) border-box;
  border: 3px solid transparent;
}

.qrFrame img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.qrFallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  text-align: center;
  color: #b9f5dd;
}

.qrFallback small { display: block; color: #6f9a8a; }

.tokenBox {
  display: grid;
  gap: 6px;
  padding: 12px;
  border-radius: 4px;
  background: rgba(0,229,255,.06);
  border: 1px solid rgba(0,229,255,.24);
  overflow-wrap: anywhere;
}

.tokenBox strong {
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  line-height: 1.45;
  color: #b6f2ff;
}

.stubMini {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0,255,159,.18);
  font-weight: 900;
  color: #eafff5;
}

.stubMini span {
  color: #6f9a8a;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 400;
}

.ticketActions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 clamp(18px, 4vw, 30px) clamp(18px, 4vw, 30px);
}

.ghostAction {
  flex: 1 1 160px;
  min-height: 46px;
  border-radius: 4px;
  padding: 13px;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  letter-spacing: .8px;
  cursor: pointer;
  border: 1px solid rgba(0,229,255,.35);
  background: rgba(0,229,255,.05);
  color: #9fe9ff;
}

@media (max-width: 760px) {
  .ticketOverlay { align-items: end; padding: 10px; }
  .ticketShell { width: 100%; max-height: 94vh; }
  .ticketPoster { min-height: 430px; }
  .posterContent { min-height: 430px; padding: 22px; }
  .ticketTitle { font-size: clamp(38px, 13vw, 62px); }

  .posterStats {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
  }

  .posterStats span,
  .posterStats strong {
    width: 100%;
    box-sizing: border-box;
    text-align: center;
  }

  .ticketCut { height: 30px; }
  .ticketBody { grid-template-columns: 1fr; padding: 16px; }
  .infoGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .memberList { grid-template-columns: 1fr; }

  .ticketStub {
    border-left: 0;
    border-top: 2px dashed rgba(0,255,159,.28);
    padding-left: 0;
    padding-top: 18px;
  }

  .qrFrame { width: min(240px, 78vw); }

  .ticketActions {
    position: sticky;
    bottom: 0;
    background: linear-gradient(180deg, rgba(1,4,3,0), rgba(1,4,3,.95) 28%);
    padding-top: 22px;
  }
}

@media (max-width: 420px) {
  .infoGrid { grid-template-columns: 1fr; }
  .ticketClose { width: 36px; height: 36px; }
}

@media print {
  body * { visibility: hidden; }
  [role="dialog"], [role="dialog"] * { visibility: visible; }
  [role="dialog"] {
    position: fixed !important;
    inset: 0 !important;
    width: 100% !important;
    max-height: none !important;
    overflow: visible !important;
  }
  button { display: none !important; }
}
`;