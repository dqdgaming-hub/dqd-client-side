import { motion } from "framer-motion";

const BookingMembers = ({ members }) => {
  if (!members.length) return null;

  return (
    <section className="dqd-members">
      <h3>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 20C3 16.5 5.5 14.5 9 14.5C12.5 14.5 15 16.5 15 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="17" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M15.5 14.7C18.3 15.1 20 16.8 20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Members
      </h3>
      <ul>
        {members.map((member, index) => (
          <motion.li
            key={member.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span>{member.name}</span>
            {member.phone && <small>{member.phone}</small>}
          </motion.li>
        ))}
      </ul>
    </section>
  );
};

export default BookingMembers;