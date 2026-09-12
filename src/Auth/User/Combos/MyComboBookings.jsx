import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getComboBookings } from "../../api/userapi";
import ComboTicketModal from "./ComboTicketModal";
import PreviousComboBookings from "./PreviousComboBookings";
import UpcomingComboBookings from "./UpcomingComboBookings";
import UserLayout from "../../User/Userlayout";

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function MyComboBookings() {
  const [tab, setTab] = useState("upcoming");
  const [stats, setStats] = useState({ total: 0, upcoming: 0, previous: 0 });
  const [ticket, setTicket] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getComboBookings().then((items) => {
      const today = new Date().toISOString().slice(0, 10);

      setStats({
        total: items.length,
        upcoming: items.filter((b) => b.booking_date >= today && b.status !== "CANCELLED").length,
        previous: items.filter((b) => b.booking_date < today || b.status === "CANCELLED").length,
      });
    });
  }, [refreshKey]);

  return (
    <UserLayout>
      <main className="mcbPage">
        <style>{fontImport}</style>
        <style>{css}</style>

        <div className="mcbBgGrid" />
        <div className="mcbBgGlowA" />
        <div className="mcbBgGlowB" />

        <motion.div initial="hidden" animate="show" variants={stagger} className="mcbShell">
          <motion.div variants={fadeUp} className="mcbHeader">
            <motion.button
              type="button"
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(-1)}
              className="mcbBack"
            >
              <span aria-hidden="true">←</span>
              Back
            </motion.button>

            <div>
              <p className="mcbEyebrow">// combo_dashboard.sys</p>
              <h1 className="mcbH1">My Combo Bookings</h1>
              <p className="mcbMuted">Tickets, cancellations, and your booking history in one clean view.</p>
            </div>
          </motion.div>

          <motion.div variants={stagger} className="mcbStats">
            <Stat label="Total" value={stats.total} accent="ice" />
            <Stat label="Upcoming" value={stats.upcoming} accent="green" />
            <Stat label="Previous" value={stats.previous} accent="violet" />
          </motion.div>

          <motion.div variants={fadeUp} className="mcbTabs">
            {["upcoming", "previous"].map((item) => (
              <motion.button
                key={item}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setTab(item)}
                className={tab === item ? "mcbTab mcbTabActive" : "mcbTab"}
              >
                {item === "upcoming" ? "Upcoming" : "Previous"}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === "upcoming" ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === "upcoming" ? 16 : -16 }}
              transition={{ duration: 0.25, ease }}
            >
              {tab === "upcoming" ? (
                <UpcomingComboBookings refreshKey={refreshKey} onTicket={setTicket} />
              ) : (
                <PreviousComboBookings refreshKey={refreshKey} onTicket={setTicket} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <ComboTicketModal
          booking={ticket}
          onClose={() => {
            setTicket(null);
            setRefreshKey((x) => x + 1);
          }}
        />
      </main>
    </UserLayout>
  );
}

function Stat({ label, value, accent }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} className={`mcbStat mcbStat-${accent}`}>
      <span className="mcbStatGlow" />
      <span className="mcbStatLabel">{label}</span>
      <strong className="mcbStatValue">{value}</strong>
    </motion.div>
  );
}

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Share+Tech+Mono&display=swap');
`;

const css = `
.mcbPage {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #010302;
  padding: clamp(18px,4vw,48px);
}

.mcbBgGrid {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(0,255,159,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,159,.05) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(circle at 50% 0%, black, transparent 75%);
}

.mcbBgGlowA {
  position: absolute;
  top: -10%;
  left: 5%;
  width: 40vw;
  height: 40vw;
  max-width: 500px;
  max-height: 500px;
  background: radial-gradient(circle, rgba(0,255,159,.15), transparent 70%);
  filter: blur(10px);
  z-index: 0;
}

.mcbBgGlowB {
  position: absolute;
  top: 8%;
  right: -6%;
  width: 32vw;
  height: 32vw;
  max-width: 440px;
  max-height: 440px;
  background: radial-gradient(circle, rgba(0,229,255,.13), transparent 70%);
  filter: blur(10px);
  z-index: 0;
}

.mcbShell {
  position: relative;
  z-index: 1;
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 18px;
}

.mcbHeader {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 18px;
  color: #eafff5;
}

.mcbBack {
  border: 1px solid rgba(0,255,159,.3);
  background: rgba(6,20,16,.7);
  color: #b9f5dd;
  clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px);
  padding: 10px 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  cursor: pointer;
}

.mcbEyebrow {
  margin: 0 0 8px;
  color: #00e5ff;
  text-shadow: 0 0 10px rgba(0,229,255,.5);
  text-transform: uppercase;
  letter-spacing: 1.8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  font-weight: 700;
}

.mcbH1 {
  margin: 0;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: clamp(30px,6vw,54px);
  line-height: 1.02;
  text-shadow: 0 0 30px rgba(0,255,159,.3);
}

.mcbMuted {
  color: #8fb3a8;
  margin: 8px 0 0;
  line-height: 1.6;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13.5px;
}

.mcbStats {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(160px,1fr));
  gap: 12px;
}

.mcbStat {
  position: relative;
  overflow: hidden;
  background: linear-gradient(165deg, rgba(6,20,16,.92), rgba(2,8,6,.75));
  border: 1px solid rgba(0,255,159,.2);
  clip-path: polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px);
  padding: 18px;
  color: #eafff5;
  display: grid;
  gap: 8px;
  box-shadow: 0 18px 55px rgba(0,0,0,.3);
}

.mcbStatGlow {
  position: absolute;
  inset: auto -20% -45% auto;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  filter: blur(34px);
  opacity: .3;
}

.mcbStat-ice .mcbStatGlow { background: #00e5ff; }
.mcbStat-green .mcbStatGlow { background: #00ff9f; }
.mcbStat-violet .mcbStatGlow { background: #b967ff; }

.mcbStatLabel {
  color: #8fb3a8;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 12px;
}

.mcbStatValue {
  font-family: 'Orbitron', sans-serif;
  font-size: 34px;
  line-height: 1;
  color: #eafff5;
}

.mcbStat-green .mcbStatValue { color: #00ff9f; text-shadow: 0 0 20px rgba(0,255,159,.4); }
.mcbStat-ice .mcbStatValue { color: #00e5ff; text-shadow: 0 0 20px rgba(0,229,255,.4); }

.mcbTabs {
  display: flex;
  gap: 10px;
  background: rgba(6,20,16,.65);
  border: 1px solid rgba(0,255,159,.18);
  clip-path: polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px);
  padding: 6px;
  width: fit-content;
  max-width: 100%;
}

.mcbTab {
  border: 0;
  color: #a9c9bd;
  background: transparent;
  padding: 11px 16px;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  letter-spacing: .5px;
  cursor: pointer;
  clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
}

.mcbTabActive {
  background: linear-gradient(135deg,#00ff9f,#00e5ff);
  color: #01110b;
  box-shadow: 0 10px 25px rgba(0,255,159,.25);
}

@media (max-width: 640px) {
  .mcbHeader { grid-template-columns: 1fr; }
  .mcbTabs { width: 100%; }
  .mcbTabs .mcbTab { flex: 1; text-align: center; }
}
`;