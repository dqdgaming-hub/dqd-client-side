import { motion, AnimatePresence } from "framer-motion";

const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const PURPLE = "#7A2CFF";
const FUCHSIA= "#C026D3";
const SILVER = "#B9C2D9";
const PANEL  = "#0D0A18";
const BORDER = "rgba(122,44,255,0.22)";

const INPUT_STYLE = {
  width:         "100%",
  background:    "rgba(122,44,255,0.06)",
  border:        `1px solid ${BORDER}`,
  outline:       "none",
  padding:       "10px 12px",
  fontFamily:    "'Rajdhani', 'Inter', sans-serif",
  fontSize:      13,
  fontWeight:    600,
  color:         SILVER,
  letterSpacing: "0.03em",
  clipPath:      "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%)",
  transition:    "border-color 0.2s, background 0.2s",
  boxSizing:     "border-box",
};

function MemberCard({ member, index, onUpdate, onRemove }) {
  const colors = [PURPLE, FUCHSIA, "#38BDF8", "#00FFB2", "#F472B6"];
  const accent = colors[index % colors.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.25 } }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position:   "relative",
        background: `${accent}09`,
        border:     `1px solid ${accent}33`,
        clipPath:   "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
        padding:    "14px 14px 14px",
        marginBottom: 10,
        overflow:   "hidden",
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 3,
        background: `linear-gradient(to bottom, ${accent}cc, ${accent}22)`,
      }}/>

      {/* Member label + remove */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 10, paddingLeft: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Avatar circle */}
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: `${accent}22`, border: `1.5px solid ${accent}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Orbitron', monospace", fontSize: 8, fontWeight: 900,
            color: accent,
          }}>
            {String(index + 1).padStart(2, "0")}
          </div>
          <span style={{
            fontFamily: "'Orbitron', monospace", fontSize: 9, fontWeight: 700,
            letterSpacing: "0.2em", color: `${accent}cc`, textTransform: "uppercase",
          }}>Member {index + 1}</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
          onClick={() => onRemove(index)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "rgba(255,77,109,0.08)",
            border: "1px solid rgba(255,77,109,0.3)",
            padding: "4px 10px",
            clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)",
            cursor: "pointer", outline: "none",
            fontFamily: "'Orbitron', monospace", fontSize: 8,
            fontWeight: 700, letterSpacing: "0.14em",
            color: "#FF4D6D", textTransform: "uppercase",
            transition: "background 0.2s",
          }}
        >
          ✕ Remove
        </motion.button>
      </div>

      {/* Inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingLeft: 10 }}>
        <div>
          <label style={{
            display: "block", marginBottom: 5,
            fontFamily: "'Orbitron', monospace", fontSize: 8,
            letterSpacing: "0.18em", color: `${SILVER}55`, textTransform: "uppercase",
          }}>Name</label>
          <input
            placeholder="Full Name"
            value={member.name}
            onChange={e => onUpdate(index, "name", e.target.value)}
            style={INPUT_STYLE}
          />
        </div>
        <div>
          <label style={{
            display: "block", marginBottom: 5,
            fontFamily: "'Orbitron', monospace", fontSize: 8,
            letterSpacing: "0.18em", color: `${SILVER}55`, textTransform: "uppercase",
          }}>Phone</label>
          <input
            placeholder="+91 XXXX XXXX"
            value={member.phone}
            onChange={e => onUpdate(index, "phone", e.target.value)}
            style={INPUT_STYLE}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function BookingMembers({ members, addMember, removeMember, updateMember }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Section header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 14, flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.9, repeat: Infinity }}
            style={{ width: 3, height: 16, background: `linear-gradient(to bottom, ${FUCHSIA}, ${PURPLE}88)` }}
          />
          <span style={{
            fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase",
          }}>Members</span>
          {members.length > 0 && (
            <span style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
              color: `${FUCHSIA}cc`, background: `${FUCHSIA}22`,
              border: `1px solid ${FUCHSIA}44`, padding: "2px 8px", borderRadius: 2,
            }}>{members.length}</span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
          onClick={addMember}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "8px 16px",
            background: `${PURPLE}15`,
            border: `1px solid ${PURPLE}55`,
            clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
            cursor: "pointer", outline: "none",
            fontFamily: "'Orbitron', monospace", fontSize: 9,
            fontWeight: 700, letterSpacing: "0.16em",
            color: `${GOLD}cc`, textTransform: "uppercase",
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
          Add Member
        </motion.button>
      </div>

      {/* Member cards */}
      <AnimatePresence mode="popLayout">
        {members.map((member, i) => (
          <MemberCard
            key={i}
            member={member}
            index={i}
            onUpdate={updateMember}
            onRemove={removeMember}
          />
        ))}
      </AnimatePresence>

      {/* Empty state */}
      {members.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            padding: "18px 16px",
            background: "rgba(122,44,255,0.04)",
            border: `1px dashed ${BORDER}`,
            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
            fontFamily: "'Rajdhani', 'Inter', sans-serif",
            fontSize: 12, color: `${SILVER}44`,
            letterSpacing: "0.04em", textAlign: "center",
          }}
        >
          No additional members. You will be the primary player.
        </motion.div>
      )}
    </div>
  );
}