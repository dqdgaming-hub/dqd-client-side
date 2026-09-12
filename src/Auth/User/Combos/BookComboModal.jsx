import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { bookComboPack } from "../../api/userapi";
import MemberForm from "./MemberForm";

const spring = { type: "spring", stiffness: 260, damping: 24 };

export default function BookComboModal({ combo, onClose, onBooked }) {
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maxExtraMembers = useMemo(() => {
    const maxPeople =
      Number(combo?.max_people ?? combo?.max_players ?? combo?.capacity ?? 1) || 1;
    return Math.max(maxPeople - 1, 0);
  }, [combo]);

  const formatTime = (value) => {
    if (!value) return value;
    return value.length === 5 ? `${value}:00` : value;
  };

  const getErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return "Booking failed. Please check the details.";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;

    return Object.entries(data)
      .map(([field, messages]) => {
        const text = Array.isArray(messages) ? messages.join(" ") : String(messages);
        return `${field}: ${text}`;
      })
      .join(" ");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!combo?.id || loading) return;

    const cleanMembers = members
      .map((member) => ({ name: member.name.trim(), phone: member.phone.trim() }))
      .filter((member) => member.name && member.phone);

    setLoading(true);
    setError("");

    try {
      const booking = await bookComboPack({
        combo_pack: combo.id,
        booking_date: bookingDate,
        start_time: formatTime(startTime),
        end_time: formatTime(endTime),
        members: cleanMembers,
      });

      onBooked?.(booking);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {combo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bcOverlay"
        >
          <style>{css}</style>

          <motion.form
            onSubmit={submit}
            initial={{ y: 26, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 24, scale: 0.95, opacity: 0 }}
            transition={spring}
            className="bcModal"
          >
            <div className="bcScan" />
            <div className="bcTopLine" />

            <p className="bcEyebrow">// reserve_slot.exe</p>
            <h2 className="bcTitle">Book {combo.name}</h2>

            <div className="bcGrid">
              <label className="bcLabel">
                Booking date
                <input
                  required
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="bcInput"
                />
              </label>

              <label className="bcLabel">
                Start time
                <input
                  required
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bcInput"
                />
              </label>

              <label className="bcLabel">
                End time
                <input
                  required
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bcInput"
                />
              </label>
            </div>

            <h4 className="bcH4">Extra members</h4>

            <MemberForm members={members} setMembers={setMembers} maxExtra={maxExtraMembers} />

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bcError"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="bcActions">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                disabled={loading}
                className="btnGhost"
              >
                Close
              </motion.button>

              <motion.button
                type="submit"
                whileHover={!loading ? { y: -2, boxShadow: "0 0 26px rgba(0,255,159,.45)" } : {}}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                className="btnPrimary"
              >
                {loading ? (
                  <span className="bcLoadingRow">
                    <motion.span
                      className="bcSpinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    Booking...
                  </span>
                ) : (
                  "Book combo"
                )}
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const css = `
.bcOverlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 18px;
  background:
    radial-gradient(circle at 20% 10%, rgba(0,255,159,.08), transparent 30%),
    radial-gradient(circle at 80% 20%, rgba(0,229,255,.08), transparent 32%),
    rgba(1,4,3,.86);
  backdrop-filter: blur(12px);
}

.bcModal {
  position: relative;
  width: min(720px, 100%);
  max-height: 92vh;
  overflow: auto;
  background: linear-gradient(165deg, rgba(6,20,16,.98), rgba(2,8,6,.98));
  border: 1px solid rgba(0,255,159,.28);
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
  padding: clamp(18px, 4vw, 28px);
  color: #eafff5;
  box-shadow: 0 40px 120px rgba(0,0,0,.6);
}

.bcScan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: repeating-linear-gradient(to bottom, rgba(0,255,159,.03) 0px, rgba(0,255,159,.03) 1px, transparent 1px, transparent 3px);
  mix-blend-mode: overlay;
}

.bcTopLine {
  position: absolute;
  inset: 0 24px auto;
  height: 3px;
  background: linear-gradient(90deg, #00ff9f, #00e5ff);
  box-shadow: 0 0 14px rgba(0,255,159,.5);
}

.bcEyebrow {
  position: relative;
  margin: 6px 0 8px;
  color: #00e5ff;
  text-shadow: 0 0 10px rgba(0,229,255,.5);
  font-family: 'Share Tech Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1.6px;
  font-size: 11.5px;
}

.bcTitle {
  position: relative;
  margin: 0 0 18px;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: clamp(22px, 4vw, 30px);
  text-shadow: 0 0 20px rgba(0,255,159,.25);
}

.bcGrid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr));
  gap: 12px;
}

.bcLabel {
  color: #a9c9bd;
  display: grid;
  gap: 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .8px;
  font-weight: 700;
}

.bcInput {
  width: 100%;
  box-sizing: border-box;
  background: rgba(2,10,8,.8);
  color: #eafff5;
  border: 1px solid rgba(0,255,159,.24);
  clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
  padding: 13px 14px;
  outline: none;
  font-family: 'Share Tech Mono', monospace;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.bcInput:focus {
  border-color: rgba(0,255,159,.7);
  box-shadow: 0 0 0 1px rgba(0,255,159,.35), 0 0 16px rgba(0,255,159,.2);
}

.bcH4 {
  position: relative;
  color: #eafff5;
  font-family: 'Share Tech Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-size: 13px;
  margin: 22px 0 10px;
}

.bcError {
  position: relative;
  color: #ffc2d1;
  background: rgba(255,56,100,.12);
  border: 1px solid rgba(255,56,100,.35);
  clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
  padding: 12px 14px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
}

.bcActions {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

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
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btnPrimary:disabled { opacity: .75; cursor: not-allowed; }

.bcLoadingRow { display: inline-flex; align-items: center; gap: 8px; }

.bcSpinner {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid rgba(1,17,11,.35);
  border-top-color: #01110b;
  display: inline-block;
}
`;