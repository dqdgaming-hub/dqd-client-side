import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const spring = { type: "spring", stiffness: 260, damping: 24 };

export default function ComboDetailsModal({ combo, onClose, onBook }) {
  return (
    <AnimatePresence>
      {combo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="cdOverlay"
        >
          <style>{css}</style>

          <motion.div
            initial={{ scale: 0.94, y: 26 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={spring}
            className="cdModal"
          >
            <div className="cdScan" />

            <div
              className="cdHero"
              style={{
                backgroundImage: combo.image
                  ? `linear-gradient(180deg, rgba(2,10,8,.15), rgba(2,10,8,.94)), url(${combo.image})`
                  : "linear-gradient(135deg,#031b12,#043a2a,#012631)",
              }}
            >
              <button type="button" onClick={onClose} className="cdClose" aria-label="Close">
                ×
              </button>

              <div className="cdHeroContent">
                <span className="cdEyebrow">// combo_details.dat</span>
                <h2 className="cdTitle">{combo.name}</h2>
              </div>
            </div>

            <div className="cdBody">
              <p className="cdDesc">{combo.description}</p>

              <div className="cdGrid">
                <Info label="Combo price" value={`₹${combo.combo_price}`} accent="green" />
                <Info
                  label="Snack"
                  value={`${combo.snack_name || "Included"} ${combo.snack_price ? `₹${combo.snack_price}` : ""}`}
                  accent="ice"
                />
                <Info label="Loyalty bonus" value={combo.loyalty_bonus || 0} accent="green" />
                <Info label="Max players" value={combo.max_people} accent="ice" />
              </div>

              <h4 className="cdSectionTitle">Gaming loadout</h4>

              <div className="cdChips">
                {(combo.gaming_items || []).map((item) => (
                  <motion.span key={item.id} whileHover={{ y: -2 }} className="cdChip">
                    {item.name}
                  </motion.span>
                ))}
              </div>

              <div className="cdActions">
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="btnGhost"
                >
                  Close
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ y: -2, boxShadow: "0 0 26px rgba(0,255,159,.45)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onBook(combo)}
                  className="btnPrimary"
                >
                  Book combo
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Info({ label, value, accent }) {
  return (
    <motion.div whileHover={{ y: -3 }} className={`cdInfo cdInfo-${accent}`}>
      <small>{label}</small>
      <strong>{value}</strong>
    </motion.div>
  );
}

const css = `
.cdOverlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 18px;
  background:
    radial-gradient(circle at 20% 10%, rgba(0,255,159,.08), transparent 30%),
    radial-gradient(circle at 80% 20%, rgba(0,229,255,.08), transparent 32%),
    rgba(1,4,3,.86);
  backdrop-filter: blur(12px);
}

.cdModal {
  position: relative;
  width: min(800px, 100%);
  max-height: 92vh;
  overflow: hidden;
  background: linear-gradient(165deg, rgba(6,20,16,.98), rgba(2,8,6,.98));
  border: 1px solid rgba(0,255,159,.28);
  clip-path: polygon(22px 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 0 100%, 0 22px);
  color: #eafff5;
  box-shadow: 0 40px 120px rgba(0,0,0,.6);
}

.cdScan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  background: repeating-linear-gradient(to bottom, rgba(0,255,159,.03) 0px, rgba(0,255,159,.03) 1px, transparent 1px, transparent 3px);
  mix-blend-mode: overlay;
}

.cdHero {
  position: relative;
  min-height: 260px;
  display: flex;
  align-items: flex-end;
  padding: 24px;
  background-size: cover;
  background-position: center;
}

.cdClose {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(0,255,159,.4);
  background: rgba(2,10,8,.7);
  color: #eafff5;
  font-size: 22px;
  cursor: pointer;
  clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
}

.cdHeroContent { display: grid; gap: 8px; }

.cdEyebrow {
  color: #00e5ff;
  text-shadow: 0 0 10px rgba(0,229,255,.5);
  font-family: 'Share Tech Mono', monospace;
  font-size: 11.5px;
  letter-spacing: 1.6px;
  text-transform: uppercase;
}

.cdTitle {
  margin: 0;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: clamp(28px, 5vw, 42px);
  line-height: 1.05;
  color: #fff;
  text-shadow: 0 0 24px rgba(0,255,159,.3);
}

.cdBody {
  padding: clamp(18px, 4vw, 28px);
  max-height: calc(92vh - 260px);
  overflow: auto;
  border-top: 1px solid rgba(0,255,159,.16);
}

.cdDesc {
  color: #a9c9bd;
  line-height: 1.7;
  margin-top: 0;
  font-size: 14.5px;
}

.cdGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.cdInfo {
  border: 1px solid rgba(0,255,159,.2);
  background: rgba(0,255,159,.05);
  clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
  padding: 13px;
  display: grid;
  gap: 6px;
}

.cdInfo-ice { border-color: rgba(0,229,255,.24); background: rgba(0,229,255,.05); }

.cdInfo small {
  color: #6f9a8a;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cdInfo strong { color: #eafff5; font-size: 15px; }
.cdInfo-ice strong { color: #b6f2ff; }
.cdInfo-green strong { color: #b9f5dd; }

.cdSectionTitle {
  color: #eafff5;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12.5px;
  text-transform: uppercase;
  letter-spacing: 1.6px;
  margin: 22px 0 10px;
}

.cdChips { display: flex; flex-wrap: wrap; gap: 8px; }

.cdChip {
  background: rgba(0,229,255,.08);
  color: #b6f2ff;
  border: 1px solid rgba(0,229,255,.26);
  clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
  padding: 8px 12px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  font-weight: 700;
}

.cdActions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }

.btnGhost, .btnPrimary {
  flex: 1 1 150px;
  border: none;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  letter-spacing: .8px;
  font-size: 13.5px;
  padding: 13px 14px;
  clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px);
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
`;