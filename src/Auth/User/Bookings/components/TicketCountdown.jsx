import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const getTimeLeft = (startsAt) => {
  const diff = new Date(startsAt).getTime() - Date.now();
  if (diff <= 0) return { text: "Starting now", urgent: true };
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return { text: `${Math.floor(hours / 24)}d ${hours % 24}h left`, urgent: false };
  return { text: `${hours}h ${minutes}m left`, urgent: hours < 1 };
};

const TicketCountdown = ({ startsAt }) => {
  const [state, setState] = useState(getTimeLeft(startsAt));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState(getTimeLeft(startsAt));
    }, 60000);
    return () => window.clearInterval(interval);
  }, [startsAt]);

  return (
    <div className={`dqd-countdown ${state.urgent ? "dqd-countdown--urgent" : ""}`}>
      <motion.span
        className="dqd-countdown__dot"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7V12L15.5 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {state.text}
    </div>
  );
};

export default TicketCountdown;