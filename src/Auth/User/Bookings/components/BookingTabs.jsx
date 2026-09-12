import { motion } from "framer-motion";

const BookingTabs = ({ activeTab, onChange, upcomingCount, historyCount }) => {
  const tabs = [
    {
      key: "upcoming",
      label: "Upcoming",
      count: upcomingCount,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7V12L15.5 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: "history",
      label: "History",
      count: historyCount,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 12C3 7 7 3 12 3C17 3 21 7 21 12C21 17 17 21 12 21C8.7 21 5.8 19.2 4.2 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 8V12L15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M3 8V13H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <motion.div
      className="dqd-tabs"
      role="tablist"
      aria-label="Booking sections"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          className={`dqd-tabs__btn ${activeTab === tab.key ? "is-active" : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {activeTab === tab.key && (
            <motion.span
              layoutId="dqd-tab-pill"
              className="dqd-tabs__pill"
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
            />
          )}
          <motion.span className="dqd-tabs__content" whileTap={{ scale: 0.95 }}>
            {tab.icon}
            {tab.label}
            <motion.em
              key={tab.count}
              initial={{ scale: 1.4, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              {tab.count}
            </motion.em>
          </motion.span>
        </button>
      ))}
    </motion.div>
  );
};

export default BookingTabs;