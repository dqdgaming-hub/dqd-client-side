import { motion } from "framer-motion";

const LoyaltyBadge = ({ points }) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="dqd-chip dqd-chip--loyalty"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L14.5 8.5L21.5 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.5 9.3L9.5 8.5L12 2Z"
          fill="#D4AF37"
          stroke="#D4AF37"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
      </svg>
      +{points} PTS
    </motion.span>
  );
};

export default LoyaltyBadge;