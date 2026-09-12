import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPreviousComboBookings } from "../../api/userapi";

const ease = [0.22, 1, 0.36, 1];

export default function PreviousComboBookings({ onTicket, refreshKey = 0 }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getPreviousComboBookings()
      .then((data) => mounted && setBookings(data))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  if (loading) return <PageLoader text="Retrieving archived passes..." />;

  if (!bookings.length) {
    return <EmptyState title="No previous bookings" text="Completed and cancelled combos will collect here." />;
  }

  return (
    <>
      <style>{responsiveCss}</style>
      <motion.div className="previousBookingGrid" initial="hidden" animate="show" variants={stagger}>
        {bookings.map((booking, index) => (
          <FlipBookingCard key={booking.booking_id} booking={booking} index={index} onTicket={onTicket} />
        ))}
      </motion.div>
    </>
  );
}

function FlipBookingCard({ booking, index, onTicket }) {
  const [flipped, setFlipped] = useState(false);
  const amount = booking.total_amount ?? booking.total_price ?? "0.00";
  const memberCount = booking.member_count ?? (booking.members?.length || 0) + 1;

  return (
    <motion.article
      className="flipScene"
      variants={cardIn}
      custom={index}
      whileHover={{ y: -8 }}
      onClick={() => setFlipped((value) => !value)}
    >
      <motion.div className="flipCard" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.7, ease }}>
        <div
          className="cardFace cardFront"
          style={{
            backgroundImage: booking.combo_image
              ? `linear-gradient(180deg,rgba(2,10,8,.1),rgba(2,10,8,.94)),url(${booking.combo_image})`
              : "linear-gradient(135deg,#031b12,#043a2a,#012631)",
          }}
        >
          <div className="frontScan" />
          <div className="frontTop">
            <span>Archive Pass</span>
            <small>{booking.status}</small>
          </div>

          <div>
            <h3>{booking.combo_name}</h3>
            <p>&gt; tap to decrypt</p>
          </div>
        </div>

        <div className="cardFace cardBack">
          <div className="backHeader">
            <div>
              <span>Booking ID</span>
              <h3>{booking.booking_id}</h3>
            </div>
            <strong>{booking.status}</strong>
          </div>

          <div className="detailGrid">
            <Detail label="Date" value={booking.booking_date} />
            <Detail label="Time" value={`${booking.start_time} - ${booking.end_time}`} />
            <Detail label="Amount" value={`₹${amount}`} />
            <Detail label="Players" value={memberCount} />
            <Detail label="Checked in" value={booking.checked_in ? "Yes" : "No"} />
            <Detail label="Created" value={formatDate(booking.created_at)} />
          </div>

          <div className="memberStrip">
            <span>Members</span>
            <strong>
              Primary User
              {(booking.members || []).length
                ? ` + ${(booking.members || []).map((m) => m.name).join(", ")}`
                : ""}
            </strong>
          </div>

          <div className="cardActions" onClick={(event) => event.stopPropagation()}>
            <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => onTicket?.(booking)}>
              View Ticket
            </motion.button>

            <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => setFlipped(false)}>
              Back
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detailItem">
      <small>{label}</small>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function PageLoader({ text }) {
  return (
    <>
      <style>{responsiveCss}</style>
      <motion.div className="creativeLoader" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <motion.div
          className="loaderPoster"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="loaderText">
          <strong>{text}</strong>
          <span>Preparing your booking history</span>
        </div>
        <div className="loaderDots">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -9, 0], opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14 }}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}

function EmptyState({ title, text }) {
  return (
    <>
      <style>{responsiveCss}</style>
      <motion.div className="emptyHistory" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div
          className="emptyMark"
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          ⬡
        </motion.div>
        <h3>{title}</h3>
        <p>{text}</p>
      </motion.div>
    </>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const cardIn = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, delay: index * 0.03, ease },
  }),
};

const responsiveCss = `
.previousBookingGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 310px), 1fr));
  gap: 18px;
  perspective: 1400px;
}

.flipScene { min-height: 360px; perspective: 1400px; cursor: pointer; }

.flipCard {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 360px;
  transform-style: preserve-3d;
}

.cardFace {
  position: absolute;
  inset: 0;
  overflow: hidden;
  backface-visibility: hidden;
  border: 1px solid rgba(0,255,159,.2);
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
  box-shadow: 0 24px 70px rgba(0,0,0,.4);
}

.cardFront {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 22px;
  background-size: cover;
  background-position: center;
}

.frontScan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(to bottom, rgba(0,255,159,.04) 0px, rgba(0,255,159,.04) 1px, transparent 1px, transparent 3px);
  mix-blend-mode: overlay;
}

.frontTop { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }

.frontTop span,
.frontTop small {
  padding: 8px 11px;
  border: 1px solid rgba(0,255,159,.3);
  background: rgba(2,10,8,.6);
  color: #b9f5dd;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  clip-path: polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px);
  backdrop-filter: blur(10px);
}

.cardFront h3 {
  margin: 0;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: clamp(26px, 5vw, 42px);
  line-height: .98;
  letter-spacing: 0;
  text-shadow: 0 0 24px rgba(0,255,159,.3), 0 14px 42px rgba(0,0,0,.62);
}

.cardFront p {
  margin: 10px 0 0;
  color: #00e5ff;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-size: 12px;
}

.cardBack {
  transform: rotateY(180deg);
  padding: 20px;
  display: grid;
  align-content: start;
  gap: 14px;
  background:
    radial-gradient(circle at 12% 10%, rgba(0,255,159,.16), transparent 30%),
    radial-gradient(circle at 88% 20%, rgba(0,229,255,.14), transparent 28%),
    linear-gradient(165deg, rgba(6,20,16,.98), rgba(1,4,3,.98));
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,255,159,.6) rgba(6,20,16,.7);
}

.cardBack::-webkit-scrollbar { width: 7px; }
.cardBack::-webkit-scrollbar-track { background: rgba(6,20,16,.7); }
.cardBack::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg,#00ff9f,#00e5ff);
  border-radius: 999px;
}

.backHeader { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }

.backHeader span {
  color: #00e5ff;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  font-weight: 700;
}

.backHeader h3 {
  margin: 6px 0 0;
  color: #eafff5;
  font-family: 'Orbitron', sans-serif;
  font-size: 19px;
  overflow-wrap: anywhere;
}

.backHeader strong {
  padding: 8px 10px;
  background: rgba(0,255,159,.12);
  border: 1px solid rgba(0,255,159,.35);
  color: #00ff9f;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  clip-path: polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px);
}

.detailGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }

.detailItem {
  min-width: 0;
  padding: 11px;
  border: 1px solid rgba(0,255,159,.16);
  background: rgba(2,10,8,.6);
  display: grid;
  gap: 5px;
  clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
}

.detailItem small {
  color: #6f9a8a;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.detailItem strong { color: #eafff5; font-size: 13px; overflow-wrap: anywhere; }

.memberStrip {
  padding: 12px;
  border: 1px solid rgba(0,229,255,.22);
  background: rgba(0,229,255,.06);
  display: grid;
  gap: 5px;
  clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
}

.memberStrip span {
  color: #00e5ff;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.memberStrip strong { color: #cdeee2; font-size: 13px; line-height: 1.5; }

.cardActions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  position: sticky;
  bottom: -1px;
  padding-top: 12px;
  background: linear-gradient(180deg, rgba(6,20,16,0), rgba(6,20,16,.96) 36%);
  z-index: 3;
}

.cardActions button {
  flex: 1 1 120px;
  border: none;
  min-height: 43px;
  padding: 11px 12px;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
}

.cardActions button:first-child { background: linear-gradient(135deg,#00ff9f,#00e5ff); color: #01110b; }
.cardActions button:last-child { background: rgba(6,20,16,.7); border: 1px solid rgba(0,255,159,.3); color: #b9f5dd; }

.creativeLoader {
  min-height: 220px;
  display: grid;
  place-items: center;
  gap: 12px;
  padding: 28px;
  text-align: center;
  border: 1px solid rgba(0,255,159,.16);
  background: rgba(6,20,16,.42);
  color: #eafff5;
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
}

.loaderPoster {
  width: min(240px, 70vw);
  height: 16px;
  border-radius: 999px;
  background: linear-gradient(90deg,#00ff9f,#00e5ff,#00ff9f);
  background-size: 260% 260%;
  box-shadow: 0 0 32px rgba(0,255,159,.3);
}

.loaderText { display: grid; gap: 5px; }
.loaderText strong { font-family: 'Orbitron', sans-serif; font-size: 17px; }
.loaderText span { color: #8fb3a8; font-family: 'Share Tech Mono', monospace; font-size: 12.5px; }

.loaderDots { display: flex; gap: 8px; }
.loaderDots span { width: 9px; height: 9px; border-radius: 50%; background: #00ff9f; }

.emptyHistory {
  text-align: center;
  padding: 46px 18px;
  border: 1px solid rgba(0,255,159,.16);
  background: radial-gradient(circle at 50% 0%, rgba(0,255,159,.14), transparent 32%), rgba(6,20,16,.48);
  color: #eafff5;
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
}

.emptyMark {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
  background: linear-gradient(135deg,#00ff9f,#00e5ff);
  color: #01110b;
  font-size: 24px;
  clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px);
  box-shadow: 0 16px 44px rgba(0,255,159,.28);
}

.emptyHistory h3 { margin: 0; font-family: 'Orbitron', sans-serif; font-size: 22px; }
.emptyHistory p { margin: 8px 0 0; color: #8fb3a8; font-family: 'Share Tech Mono', monospace; font-size: 13px; }

@media (min-width: 900px) {
  .previousBookingGrid { grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); }
  .flipScene, .flipCard { min-height: 390px; }
  .cardFront { padding: 26px; }
}

@media (max-width: 640px) {
  .previousBookingGrid { grid-template-columns: 1fr; gap: 16px; }
  .flipScene, .flipCard { min-height: 460px; }
  .cardFront { padding: 20px; min-height: 460px; }
  .frontTop { align-items: stretch; }
  .frontTop span, .frontTop small { font-size: 10px; }
  .cardFront h3 { font-size: clamp(36px, 13vw, 58px); }
  .cardBack { padding: 18px; min-height: 460px; }
  .backHeader { display: grid; }
  .detailGrid { grid-template-columns: 1fr; }
  .cardActions { bottom: -1px; }
}
`;