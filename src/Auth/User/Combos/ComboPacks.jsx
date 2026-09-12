import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getComboPackDetails, getComboPacks } from "../../api/userapi";
import BookComboModal from "./BookComboModal";
import ComboCard from "./ComboCard";
import ComboDetailsModal from "./ComboDetailsModal";
import UserLayout from "../../User/Userlayout";
import { useNavigate, useLocation } from "react-router-dom";

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function ComboPacks() {
  const [combos, setCombos] = useState([]);
  const [details, setDetails] = useState(null);
  const [bookingCombo, setBookingCombo] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    getComboPacks()
      .then((data) => mounted && setCombos(data))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const openDetails = async (combo) => {
    setDetails(await getComboPackDetails(combo.id));
  };

  const openBook = (combo) => {
    setDetails(null);
    setBookingCombo(combo);
  };

  const navItems = [
    { path: "/user/combo", label: "Combo Packs" },
    { path: "/user/combo-bookings", label: "All Bookings" },
  ];

  return (
    <UserLayout>
      <main className="cpPage">
        <style>{fontImport}</style>
        <style>{css}</style>

        <div className="cpBgGrid" />
        <div className="cpBgGlowA" />
        <div className="cpBgGlowB" />

        <motion.section initial="hidden" animate="show" variants={stagger} className="cpShell">
          <motion.div variants={fadeUp} className="cpHeader">
            {/* <motion.button
              type="button"
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(-1)}
              className="cpBack"
            >
              <span aria-hidden="true">←</span>
              Back
            </motion.button> */}
            <br />
            <br />

            <div>
              <p className="cpEyebrow">// arena_bundles.sys</p>
              <h1 className="cpH1">Combo Packs</h1>
              <p className="cpMuted">Premium gaming bundles with snacks, friends, and loyalty rewards.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="cpNav">
            {navItems.map((item) => (
              <motion.button
                key={item.path}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={location.pathname === item.path ? "cpNavBtn cpNavBtnActive" : "cpNavBtn"}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </motion.button>
            ))}
          </motion.div>

          {loading ? (
            <PageLoader text="Loading combo packs..." />
          ) : (
            <motion.div variants={stagger} className="cpGrid">
              {combos.map((combo) => (
                <ComboCard key={combo.id} combo={combo} onDetails={openDetails} onBook={openBook} />
              ))}
            </motion.div>
          )}
        </motion.section>

        <ComboDetailsModal combo={details} onClose={() => setDetails(null)} onBook={openBook} />
        <BookComboModal combo={bookingCombo} onClose={() => setBookingCombo(null)} />
      </main>
    </UserLayout>
  );
}

function PageLoader({ text }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cpLoader">
      <div className="cpLoaderBar" />
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -9, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14 }}
          className="cpLoaderDot"
        />
      ))}
      <span className="cpLoaderText">{text}</span>
    </motion.div>
  );
}

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Share+Tech+Mono&display=swap');
`;

const css = `
.cpPage {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #010302;
  padding: clamp(18px,4vw,48px);
}

.cpBgGrid {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(0,255,159,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,159,.05) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(circle at 50% 0%, black, transparent 75%);
}

.cpBgGlowA {
  position: absolute;
  top: -10%;
  left: 5%;
  width: 40vw;
  height: 40vw;
  max-width: 520px;
  max-height: 520px;
  background: radial-gradient(circle, rgba(0,255,159,.16), transparent 70%);
  filter: blur(10px);
  z-index: 0;
}

.cpBgGlowB {
  position: absolute;
  top: 5%;
  right: -5%;
  width: 34vw;
  height: 34vw;
  max-width: 460px;
  max-height: 460px;
  background: radial-gradient(circle, rgba(0,229,255,.14), transparent 70%);
  filter: blur(10px);
  z-index: 0;
}

.cpShell {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.cpHeader {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 18px;
  color: #eafff5;
}

.cpBack {
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

.cpEyebrow {
  margin: 0 0 8px;
  color: #00e5ff;
  text-shadow: 0 0 10px rgba(0,229,255,.5);
  text-transform: uppercase;
  letter-spacing: 1.8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  font-weight: 700;
}

.cpH1 {
  margin: 0;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: clamp(32px,6vw,56px);
  line-height: 1.02;
  letter-spacing: .5px;
  text-shadow: 0 0 30px rgba(0,255,159,.3);
}

.cpMuted {
  color: #8fb3a8;
  margin: 8px 0 0;
  line-height: 1.6;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13.5px;
}

.cpNav { display: flex; flex-wrap: wrap; gap: 12px; }

.cpNavBtn {
  padding: 12px 18px;
  border: 1px solid rgba(0,255,159,.28);
  background: rgba(6,20,16,.65);
  color: #b9f5dd;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  letter-spacing: .4px;
  clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px);
}

.cpNavBtnActive {
  border-color: rgba(0,255,159,.6);
  background: linear-gradient(135deg,#00ff9f,#00e5ff);
  color: #01110b;
  box-shadow: 0 18px 40px rgba(0,255,159,.24);
}

.cpGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(min(100%,270px),1fr));
  gap: 18px;
}

.cpLoader {
  position: relative;
  overflow: hidden;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #a9c9bd;
  background: rgba(6,20,16,.4);
  border: 1px solid rgba(0,255,159,.16);
  clip-path: polygon(22px 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 0 100%, 0 22px);
}

.cpLoaderBar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff9f, #00e5ff, transparent);
  animation: cpSweep 1.6s linear infinite;
}

@keyframes cpSweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.cpLoaderDot { width: 9px; height: 9px; border-radius: 50%; background: #00ff9f; display: inline-block; }
.cpLoaderText { margin-top: 6px; font-family: 'Share Tech Mono', monospace; font-weight: 700; }

@media (max-width: 640px) {
  .cpHeader { grid-template-columns: 1fr; }
}
`;