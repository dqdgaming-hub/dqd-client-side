import { useState } from "react";
import { motion } from "framer-motion";

const VOID    = "#05040A";
const PANEL   = "#0D0A18";
const PURPLE  = "#7A2CFF";
const PURPLE2 = "#3D1A78";
const SILVER  = "#B9C2D9";
const GOLD    = "#D4AF37";
const GOLDHI  = "#F4D886";
const BORDER  = "rgba(122,44,255,0.25)";

function CalendarIcon({ size = 15, color = "#F3EEFF" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke={color} strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3v3.6M16 3v3.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon({ size = 15, color = "#F3EEFF" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.6" stroke={color} strokeWidth="1.7" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke={color} strokeWidth="1.7" />
    </svg>
  );
}

function FlipIcon({ size = 14, color = `${GOLD}cc` }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 4.5v3h-3M7 19.5v-3h3" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ size = 13, color = SILVER }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.2" stroke={color} strokeWidth="1.7" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 6.2a3.1 3.1 0 0 1 0 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.5 14.2c2.6.4 4.5 2.6 4.5 5.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon({ size = 13, color = GOLD }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon({ size = 15, color = "#1a1410" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M8 5.5v13l11-6.5-11-6.5z" fill={color} />
    </svg>
  );
}

const TYPE_LABEL = { ps5: "Console Pod", pool: "Pool Arena", ott: "Screening Den" };

function buildDescription(game) {
  if (game.description) return game.description;
  const label = TYPE_LABEL[game.category_type] || "Arena";
  return `A ${label.toLowerCase()} forged for warriors. Step into ${game.name} and claim your hour on vibranium ground.`;
}

// ── Expanding button ─────────────────────────────────────────────────────────
function ClaimButton({ disabled, onClick }) {
  const [hovered, setHovered] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!disabled) onClick?.();
  };

  return (
    <button
      className="gc-book-btn"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      aria-label={disabled ? "Sealed" : "Claim Slot"}
    >
      {/* Icon always visible */}
      {disabled ? <LockIcon size={15} color="#F3EEFF" /> : <CalendarIcon size={15} color="#F3EEFF" />}

      {/* Label animates in/out */}
      <motion.span
        className="gc-btn-label"
        initial={false}
        animate={{
          width: hovered ? "auto" : 0,
          opacity: hovered ? 1 : 0,
          marginLeft: hovered ? 4 : 0,
        }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: "hidden", whiteSpace: "nowrap", display: "inline-block" }}
      >
        {disabled ? "Sealed" : "Claim Slot"}
      </motion.span>
    </button>
  );
}

// ── GameCard ──────────────────────────────────────────────────────────────────
export default function GameCard({ game, onClick, active = true }) {
  const [flipped, setFlipped] = useState(false);
  const desc = buildDescription(game);

  const toggleFlip = (e) => {
    e?.stopPropagation();
    if (!active) return;
    setFlipped((f) => !f);
  };

  return (
    <>
      <style>{`
        .gc-scene {
          perspective: 1400px; width: 100%; height: 100%;
          cursor: ${active ? "pointer" : "default"};
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }
        .gc-inner {
          position: relative; width: 100%; height: 100%; transform-style: preserve-3d;
        }
        .gc-face {
          position: absolute; inset: 0; border-radius: 18px;
          backface-visibility: hidden; overflow: hidden;
        }

        /* ── FRONT ── */
        .gc-front {
          background: ${VOID};
          border: 1px solid ${BORDER};
          box-shadow: 0 16px 40px rgba(0,0,0,0.55);
        }
        .gc-img-wrap {
          position: relative; width: 100%; height: 100%; overflow: hidden;
        }
        .gc-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .gc-img-placeholder {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 40%, ${PURPLE2}55, ${VOID} 80%);
        }
        .gc-img-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(
            to bottom,
            transparent 35%,
            rgba(5,4,10,0.55) 58%,
            rgba(5,4,10,0.92) 100%
          );
        }
        .gc-sealed-badge {
          position: absolute; top: 12px; left: 12px; z-index: 3;
          background: rgba(212,175,55,0.92); color: #1a1410;
          font-size: 10px; font-weight: 700; padding: 3px 9px;
          border-radius: 20px; letter-spacing: 0.04em;
        }
        .gc-flip-hint {
          position: absolute; top: 10px; right: 10px; z-index: 3;
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(13,10,24,0.68); border: 1px solid rgba(212,175,55,0.4);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(6px); cursor: pointer;
        }

        /* Strip: name left, button right — both bottom-anchored inside image */
        .gc-strip {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 2;
          padding: 14px 14px 15px;
          display: flex; align-items: flex-end; justify-content: space-between; gap: 10px;
          pointer-events: none;
        }
        .gc-name {
          margin: 0; font-size: 1.05rem; font-weight: 800;
          color: #EDE7FB; line-height: 1.25; letter-spacing: -0.01em;
          overflow: hidden; text-overflow: ellipsis;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          text-shadow: 0 1px 8px rgba(0,0,0,0.8);
          flex: 1; min-width: 0;
        }

        /* Collapsed pill button — expands on hover */
        .gc-book-btn {
          pointer-events: all;
          display: flex; align-items: center; justify-content: center;
          /* collapsed: just icon + padding */
          padding: 9px 10px;
          border-radius: 50px;
          background: linear-gradient(135deg, ${PURPLE}, ${PURPLE2});
          border: 1px solid ${PURPLE}bb;
          color: #F3EEFF; font-size: 13px; font-weight: 700;
          outline: none; font-family: 'Inter', sans-serif;
          letter-spacing: 0.01em; cursor: pointer;
          flex-shrink: 0;
          transition:
            box-shadow 0.2s ease,
            padding 0.22s cubic-bezier(.4,0,.2,1),
            background 0.2s ease;
          white-space: nowrap;
        }
        .gc-book-btn:hover:not(:disabled) {
          padding: 9px 16px 9px 13px;
          box-shadow: 0 6px 24px rgba(122,44,255,0.55);
          background: linear-gradient(135deg, #8f3fff, ${PURPLE});
        }
        .gc-book-btn:active:not(:disabled) {
          transform: scale(0.95);
        }
        .gc-book-btn:disabled {
          opacity: 0.45; cursor: not-allowed;
          background: rgba(122,44,255,0.3);
        }

        .gc-bottom-edge {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px; z-index: 4;
          background: linear-gradient(90deg, ${PURPLE}, ${GOLD});
          opacity: 0.65;
        }

        /* ── BACK ── */
        .gc-back {
          background: linear-gradient(160deg, #0a0716 0%, ${VOID} 100%);
          border: 1px solid rgba(212,175,55,0.22);
          box-shadow: inset 0 0 60px rgba(122,44,255,0.10), 0 16px 40px rgba(0,0,0,0.6);
          transform: rotateY(180deg);
          display: flex; flex-direction: column; padding: 20px 20px 0;
        }
        .gc-back-mask {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.06;
          background-image: repeating-linear-gradient(45deg, ${GOLD} 0 1px, transparent 1px 26px);
        }
        .gc-back-close {
          position: absolute; top: 12px; right: 12px; z-index: 2;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(122,44,255,0.14); border: 1px solid ${PURPLE}55;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .gc-back-header {
          display: flex; flex-direction: column; gap: 6px;
          position: relative; z-index: 1; flex-shrink: 0;
        }
        .gc-back-type {
          font-size: 10.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: ${GOLD};
        }
        .gc-back-name {
          margin: 0; font-size: 1.25rem; font-weight: 800;
          color: #F3EEFF; letter-spacing: -0.01em;
        }
        .gc-back-divider {
          width: 36px; height: 3px; border-radius: 2px; margin: 10px 0 12px;
          background: linear-gradient(90deg, ${GOLD}, ${PURPLE});
          position: relative; z-index: 1; flex-shrink: 0;
        }
        .gc-back-scroll {
          flex: 1; overflow-y: auto; position: relative; z-index: 1;
          padding-right: 4px; min-height: 0;
        }
        .gc-back-scroll::-webkit-scrollbar { width: 3px; }
        .gc-back-scroll::-webkit-scrollbar-track { background: transparent; }
        .gc-back-scroll::-webkit-scrollbar-thumb { background: ${PURPLE}55; border-radius: 2px; }
        .gc-back-desc {
          margin: 0 0 14px; font-size: 13px; line-height: 1.72; color: ${SILVER}dd;
        }
        .gc-back-stats { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .gc-back-stat {
          display: flex; align-items: center; gap: 7px;
          font-size: 12.5px; color: #EDE7FB; font-weight: 600;
        }
        .gc-back-stat-label { color: ${SILVER}88; font-weight: 400; margin-left: 2px; }
        .gc-back-footer {
          flex-shrink: 0; padding: 14px 0 18px; position: relative; z-index: 1;
        }
        .gc-back-book-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 12px 18px; border-radius: 10px;
          background: linear-gradient(135deg, ${GOLDHI}, ${GOLD});
          border: none; color: #1a1410; font-size: 13.5px; font-weight: 800;
          outline: none; font-family: 'Inter', sans-serif;
          letter-spacing: 0.01em; cursor: pointer;
          box-shadow: 0 4px 18px rgba(212,175,55,0.22);
          transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
        }
        .gc-back-book-btn:hover:not(:disabled) {
          transform: scale(1.04);
          box-shadow: 0 6px 24px rgba(212,175,55,0.38);
        }
        .gc-back-book-btn:active:not(:disabled) { transform: scale(0.96); }
        .gc-back-book-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="gc-scene" onClick={toggleFlip}>
        <motion.div
          className="gc-inner"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.62, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {/* ── FRONT ── */}
          <div className="gc-face gc-front">
            <div className="gc-img-wrap">
              {game.image ? (
                <img src={game.image} alt={game.name} className="gc-img" />
              ) : (
                <div className="gc-img-placeholder" />
              )}

              <div className="gc-img-overlay" />

              {game.maintenance_mode && (
                <div className="gc-sealed-badge">SEALED</div>
              )}

              <div
                className="gc-flip-hint"
                onClick={(e) => { e.stopPropagation(); toggleFlip(e); }}
              >
                <FlipIcon size={13} />
              </div>

              {/* Name left + collapsed button right */}
              <div className="gc-strip">
                <h3 className="gc-name" title={game.name}>{game.name}</h3>
                <ClaimButton
                  disabled={!!game.maintenance_mode}
                  onClick={onClick}
                />
              </div>

              <div className="gc-bottom-edge" />
            </div>
          </div>

          {/* ── BACK ── */}
          <div className="gc-face gc-back">
            <div className="gc-back-mask" />

            <button
              className="gc-back-close"
              onClick={(e) => { e.stopPropagation(); toggleFlip(e); }}
              aria-label="Flip back"
            >
              <FlipIcon size={13} color={SILVER} />
            </button>

            <div className="gc-back-header">
              <span className="gc-back-type">{TYPE_LABEL[game.category_type] || "Arena"}</span>
              <h3 className="gc-back-name">{game.name}</h3>
            </div>

            <div className="gc-back-divider" />

            <div className="gc-back-scroll">
              <p className="gc-back-desc">{desc}</p>
              <div className="gc-back-stats">
                <div className="gc-back-stat">
                  <ClockIcon size={14} />
                  <span>INR {game.price_per_hour}</span>
                  <span className="gc-back-stat-label">/ hour</span>
                </div>
                <div className="gc-back-stat">
                  <UsersIcon size={14} color={GOLD} />
                  <span>{game.min_capacity}–{game.max_capacity}</span>
                  <span className="gc-back-stat-label">warriors</span>
                </div>
                {game.category && (
                  <div className="gc-back-stat">
                    <span style={{ color: GOLD, fontSize: 13 }}>◈</span>
                    <span>{game.category}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="gc-back-footer">
              <button
                className="gc-back-book-btn"
                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                disabled={!!game.maintenance_mode}
              >
                <PlayIcon size={15} color={game.maintenance_mode ? SILVER : "#1a1410"} />
                <span>{game.maintenance_mode ? "Sealed" : "Claim Slot"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}