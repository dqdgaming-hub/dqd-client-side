import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const PURPLE = "#7A2CFF";
const SILVER = "#B9C2D9";
const PANEL  = "#0D0A18";
const BORDER = "rgba(122,44,255,0.22)";
const RED    = "#FF4D6D";

function TimeInput({ label, value, onChange, icon }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontFamily: "'Orbitron', monospace", fontSize: 8, fontWeight: 700,
        letterSpacing: "0.2em", color: `${SILVER}66`, textTransform: "uppercase",
        marginBottom: 6,
      }}>
        {icon} {label}
      </div>
      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: PANEL,
          border: `1px solid ${value ? GOLD + "66" : BORDER}`,
          color: value ? GOLDHI : `${SILVER}66`,
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "10px 12px",
          outline: "none",
          clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
          cursor: "pointer",
          colorScheme: "dark",
        }}
      />
    </div>
  );
}

function fmt(time) {
  if (!time) return "—";
  const [h, m] = time.split(":");
  const hour = Number(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

export default function SlotSelector({ selectedSlot, onSelect }) {
  const [startTime, setStartTime] = useState(selectedSlot?.start_time || "");
  const [endTime,   setEndTime]   = useState(selectedSlot?.end_time   || "");

  // Compute derived state
  let hours = 0;
  let error = "";

  if (startTime && endTime) {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);

    if (diff <= 0) {
      error = "End time must be after start time";
    } else {
      hours = diff / 60;
    }
  }

  const isValid = hours > 0;

  // Notify parent whenever valid slot is formed
  const handleChange = (start, end) => {
    if (!start || !end) { onSelect(null); return; }
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff > 0) {
      onSelect({ start_time: start, end_time: end, available: true });
    } else {
      onSelect(null);
    }
  };

  const handleStart = (val) => {
    setStartTime(val);
    handleChange(val, endTime);
  };

  const handleEnd = (val) => {
    setEndTime(val);
    handleChange(startTime, val);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 3, height: 16, background: `linear-gradient(to bottom, ${PURPLE}, ${GOLD}88)` }}
        />
        <span style={{
          fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase",
        }}>Select Time</span>
      </div>

      {/* Time pickers */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <TimeInput label="Start Time" value={startTime} onChange={handleStart} icon="▶" />
        <TimeInput label="End Time"   value={endTime}   onChange={handleEnd}   icon="◼" />
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
              color: RED, letterSpacing: "0.08em", marginBottom: 10,
            }}
          >
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duration pill */}
      <AnimatePresence>
        {isValid && (
          <motion.div
            key="duration"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25 }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px",
              background: `linear-gradient(135deg, ${PURPLE}22, ${GOLD}11)`,
              border: `1px solid ${GOLD}44`,
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
            }}
          >
            <span style={{
              fontFamily: "'Orbitron', monospace", fontSize: 8,
              color: `${GOLD}99`, letterSpacing: "0.18em", textTransform: "uppercase",
            }}>
              ⏱ Duration
            </span>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: 15,
              color: GOLDHI, fontWeight: 700, letterSpacing: "0.06em",
            }}>
              {hours % 1 === 0 ? `${hours}h` : `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`}
            </span>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
              color: `${PURPLE}cc`,
            }}>
              {fmt(startTime)} → {fmt(endTime)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}