import React from "react";
import { motion } from "framer-motion";

const spring = { type: "spring", stiffness: 240, damping: 22 };

export default function ComboCard({ combo, onDetails, onBook }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      transition={spring}
      className="ccard"
    >
      <style>{css}</style>

      <motion.div
        className="ccardFrame"
        variants={{ hover: { boxShadow: "0 0 0 1px rgba(0,255,159,.55), 0 22px 60px rgba(0,255,159,.16)" } }}
      >
        <div className="ccardScan" />

        <div
          className="ccardImage"
          style={{
            backgroundImage: combo.image
              ? `linear-gradient(180deg, rgba(2,6,4,0) 30%, rgba(2,6,4,.94) 100%), url(${combo.image})`
              : "linear-gradient(135deg,#031b12,#043a2a,#012631)",
          }}
        >
          <span className="ccardEyebrow">// bundle_id.{String(combo.id ?? "000").padStart(3, "0")}</span>

          <motion.span
            className="ccardPrice"
            variants={{ hover: { y: -3, boxShadow: "0 0 22px rgba(0,229,255,.4)" } }}
          >
            <small>₹</small>
            {combo.combo_price}
          </motion.span>

          <div className="ccardImageBottom">
            <h3 className="ccardTitle">{combo.name}</h3>
          </div>
        </div>

        <div className="ccardBody">
          <p className="ccardDesc">{combo.description}</p>

          <div className="ccardMeta">
            <span className="metaTag">
              <IconUsers /> {combo.max_people} players
            </span>
            <span className="metaTag metaTagIce">
              <IconBolt /> snacks incl.
            </span>
          </div>

          <div className="ccardActions">
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onDetails(combo)}
              className="btnGhost"
            >
              Details
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ y: -2, boxShadow: "0 0 26px rgba(0,255,159,.45)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onBook(combo)}
              className="btnPrimary"
            >
              Book slot
              <IconArrow />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function IconUsers() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const css = `
.ccard { position: relative; }

.ccardFrame {
  position: relative;
  overflow: hidden;
  background: linear-gradient(165deg, rgba(6,20,16,.92), rgba(2,10,8,.92));
  border: 1px solid rgba(0,255,159,.18);
  clip-path: polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px);
  transition: box-shadow .3s ease;
}

.ccardScan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0,255,159,.035) 0px,
    rgba(0,255,159,.035) 1px,
    transparent 1px,
    transparent 3px
  );
  z-index: 3;
  mix-blend-mode: overlay;
}

.ccardImage {
  position: relative;
  min-height: 196px;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
}

.ccardEyebrow {
  align-self: flex-start;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 1.5px;
  color: #00e5ff;
  text-shadow: 0 0 10px rgba(0,229,255,.6);
  background: rgba(2,10,8,.55);
  border: 1px solid rgba(0,229,255,.28);
  padding: 4px 8px;
  clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
}

.ccardPrice {
  align-self: flex-end;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 20px;
  color: #00ff9f;
  background: rgba(2,10,8,.72);
  border: 1px solid rgba(0,255,159,.5);
  padding: 8px 12px;
  clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  backdrop-filter: blur(6px);
}

.ccardPrice small { font-size: 12px; opacity: .8; }

.ccardImageBottom { display: grid; }

.ccardTitle {
  margin: 0;
  color: #eafff5;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: clamp(19px, 2.6vw, 23px);
  letter-spacing: .3px;
  line-height: 1.2;
  text-shadow: 0 0 18px rgba(0,255,159,.25);
}

.ccardBody {
  padding: 18px;
  display: grid;
  gap: 14px;
  border-top: 1px solid rgba(0,255,159,.14);
}

.ccardDesc {
  margin: 0;
  color: #8fb3a8;
  font-size: 13.5px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ccardMeta { display: flex; flex-wrap: wrap; gap: 8px; }

.metaTag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(0,255,159,.24);
  background: rgba(0,255,159,.06);
  color: #b9f5dd;
  padding: 6px 10px;
  clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
  font-family: 'Share Tech Mono', monospace;
  font-size: 11.5px;
  letter-spacing: .4px;
}

.metaTagIce {
  border-color: rgba(0,229,255,.26);
  background: rgba(0,229,255,.06);
  color: #b6f2ff;
}

.ccardActions { display: flex; gap: 10px; flex-wrap: wrap; }

.btnGhost, .btnPrimary {
  flex: 1 1 120px;
  border: none;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  letter-spacing: .8px;
  font-size: 13px;
  padding: 12px 14px;
  clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: box-shadow .25s ease;
}

.btnGhost {
  background: rgba(0,229,255,.05);
  border: 1px solid rgba(0,229,255,.35);
  color: #9fe9ff;
}

.btnPrimary {
  background: linear-gradient(135deg, #00ff9f, #00e5ff);
  color: #01110b;
  font-weight: 900;
}

@media (max-width: 480px) {
  .ccardImage { min-height: 168px; padding: 13px; }
  .ccardBody { padding: 15px; }
}
`;