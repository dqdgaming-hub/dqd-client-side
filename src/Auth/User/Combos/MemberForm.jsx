import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const spring = { type: "spring", stiffness: 280, damping: 24 };

export default function MemberForm({ members, setMembers, maxExtra }) {
  const update = (i, key, value) =>
    setMembers(members.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));

  const remove = (i) => setMembers(members.filter((_, idx) => idx !== i));

  return (
    <div className="mform">
      <style>{css}</style>

      <AnimatePresence initial={false}>
        {members.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.96 }}
            transition={spring}
            className="mrow"
          >
            <span className="mrowTag">P{index + 2}</span>

            <input
              required
              placeholder="Operative name"
              value={member.name}
              onChange={(e) => update(index, "name", e.target.value)}
              className="minput"
            />

            <input
              required
              placeholder="Comm / phone"
              value={member.phone}
              onChange={(e) => update(index, "phone", e.target.value)}
              className="minput"
            />

            <motion.button
              type="button"
              whileHover={{ boxShadow: "0 0 16px rgba(255,56,100,.5)" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => remove(index)}
              className="mremove"
              aria-label="Remove member"
            >
              ×
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>

      {members.length < maxExtra && (
        <motion.button
          type="button"
          whileHover={{ y: -2, boxShadow: "0 0 20px rgba(0,229,255,.35)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMembers([...members, { name: "", phone: "" }])}
          className="madd"
        >
          <span className="madPlus">+</span> recruit member
          <span className="madCount">{members.length}/{maxExtra}</span>
        </motion.button>
      )}
    </div>
  );
}

const css = `
.mform { display: grid; gap: 10px; }

.mrow {
  display: grid;
  grid-template-columns: 40px minmax(0,1fr) minmax(0,1fr) 42px;
  gap: 8px;
  align-items: center;
}

.mrowTag {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  color: #00e5ff;
  text-align: center;
  border: 1px solid rgba(0,229,255,.3);
  background: rgba(0,229,255,.06);
  padding: 10px 0;
  clip-path: polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px);
}

.minput {
  width: 100%;
  box-sizing: border-box;
  background: rgba(2,10,8,.75);
  color: #eafff5;
  border: 1px solid rgba(0,255,159,.22);
  clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
  padding: 12px 13px;
  outline: none;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13.5px;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.minput:focus {
  border-color: rgba(0,255,159,.7);
  box-shadow: 0 0 0 1px rgba(0,255,159,.35), 0 0 16px rgba(0,255,159,.2);
}

.minput::placeholder { color: #4d6b60; }

.mremove {
  border: 1px solid rgba(255,56,100,.4);
  background: rgba(255,56,100,.1);
  color: #ff6b8f;
  clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
  cursor: pointer;
  font-size: 19px;
  font-weight: 900;
  height: 100%;
  min-height: 40px;
}

.madd {
  border: 1px dashed rgba(0,229,255,.42);
  background: rgba(0,229,255,.05);
  color: #9fe9ff;
  clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
  padding: 12px 14px;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  letter-spacing: .5px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.madPlus { color: #00ff9f; font-size: 16px; }
.madCount { margin-left: auto; color: #5c8a7c; font-size: 11px; }

@media (max-width: 640px) {
  .mrow {
    grid-template-columns: 40px 1fr;
    grid-template-rows: auto auto;
  }
  .mrowTag { grid-row: 1 / 3; }
  .minput { grid-column: 2; }
  .mremove { grid-column: 2; justify-self: end; width: 42px; }
}
`;