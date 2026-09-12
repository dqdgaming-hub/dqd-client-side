import React from "react";
import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";

const spring = { type: "spring", stiffness: 260, damping: 24 };

export default function ComboBookingCard({ booking, onTicket, onCancel }) {
  const cancellable = !["CANCELLED", "COMPLETED"].includes(booking.status);
  const memberCount = booking.member_count ?? (booking.members?.length || 0) + 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={spring}
      className="cbCard"
    >
      <style>{css}</style>

      <div
        className="cbThumb"
        style={{
          backgroundImage: booking.combo_image
            ? `linear-gradient(180deg,rgba(2,10,8,0),rgba(2,10,8,.8)),url(${booking.combo_image})`
            : "linear-gradient(135deg,#031b12,#043a2a,#012631)",
        }}
      >
        <span className="cbThumbTag">P{String(booking.booking_id ?? "").slice(-4) || "----"}</span>
      </div>

      <div className="cbBody">
        <div className="cbTop">
          <div>
            <h3 className="cbTitle">{booking.combo_name}</h3>
            <p className="cbMuted">
              {booking.booking_date} · {booking.start_time} - {booking.end_time}
            </p>
          </div>

          <StatusBadge status={booking.status} />
        </div>

        <div className="cbMeta">
          <span className="cbPill">₹{booking.total_price}</span>
          <span className="cbPill cbPillIce">{memberCount} players</span>
          <span className={`cbPill ${booking.checked_in ? "cbPillGreen" : ""}`}>
            {booking.checked_in ? "Checked in" : "Not checked in"}
          </span>
        </div>

        <div className="cbActions">
          <motion.button
            type="button"
            whileHover={{ y: -2, boxShadow: "0 0 22px rgba(0,229,255,.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onTicket?.(booking)}
            className="cbPrimary"
          >
            View Ticket
          </motion.button>

          {cancellable && (
            <motion.button
              type="button"
              whileHover={{ y: -2, boxShadow: "0 0 22px rgba(255,56,100,.35)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onCancel?.(booking)}
              className="cbDanger"
            >
              Cancel
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

const css = `
.cbCard {
  display: grid;
  grid-template-columns: minmax(130px,180px) 1fr;
  overflow: hidden;
  background: linear-gradient(165deg, rgba(6,20,16,.9), rgba(2,8,6,.85));
  border: 1px solid rgba(0,255,159,.2);
  clip-path: polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px);
  box-shadow: 0 18px 55px rgba(0,0,0,.3);
}

.cbThumb {
  position: relative;
  min-height: 170px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-start;
  padding: 12px;
}

.cbThumbTag {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 1px;
  color: #00e5ff;
  background: rgba(2,10,8,.6);
  border: 1px solid rgba(0,229,255,.3);
  padding: 4px 8px;
  clip-path: polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px);
}

.cbBody { padding: 18px; display: grid; gap: 14px; }

.cbTop {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.cbTitle {
  margin: 0;
  color: #eafff5;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 19px;
  line-height: 1.2;
}

.cbMuted {
  color: #8fb3a8;
  margin: 7px 0 0;
  line-height: 1.5;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12.5px;
}

.cbMeta { display: flex; flex-wrap: wrap; gap: 10px; }

.cbPill {
  border: 1px solid rgba(0,255,159,.2);
  background: rgba(0,255,159,.06);
  clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
  padding: 7px 11px;
  color: #b9f5dd;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  font-size: 12.5px;
}

.cbPillIce { border-color: rgba(0,229,255,.24); background: rgba(0,229,255,.06); color: #b6f2ff; }
.cbPillGreen { border-color: rgba(0,255,159,.4); background: rgba(0,255,159,.12); color: #00ff9f; }

.cbActions { display: flex; flex-wrap: wrap; gap: 10px; }

.cbPrimary, .cbDanger {
  flex: 1 1 130px;
  border: none;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 700;
  letter-spacing: .6px;
  font-size: 12.5px;
  padding: 12px 14px;
  clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
}

.cbPrimary {
  background: linear-gradient(135deg, #00ff9f, #00e5ff);
  color: #01110b;
  font-weight: 900;
}

.cbDanger {
  background: rgba(255,56,100,.1);
  border: 1px solid rgba(255,56,100,.4);
  color: #ff6b8f;
}

@media (max-width: 700px) {
  .cbCard { grid-template-columns: 1fr; }
  .cbThumb { min-height: 120px; }
}
`;