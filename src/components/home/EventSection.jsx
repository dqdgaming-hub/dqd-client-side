import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, Ticket, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const cardVariants = {
  hidden: (index) => ({
    opacity: 0,
    y: 210,
    x: index % 2 === 0 ? -120 : 120,
    rotate: index % 2 === 0 ? -24 : 24,
    rotateX: 38,
    scale: 0.42,
    transformOrigin: "50% 100%",
  }),
  visible: (index) => ({
    opacity: 1,
    y: 0,
    x: 0,
    rotate: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      delay: 0.18 + index * 0.14,
      duration: 0.92,
      type: "spring",
      stiffness: 118,
      damping: 13,
    },
  }),
};

function formatDate(value) {
  if (!value) return "Date TBA";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "Time TBA";

  const [hours = "0", minutes = "0"] = value.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function FolderLaunch({ onOpen }) {
  return (
    <motion.button
      type="button"
      className="event-folder"
      onClick={onOpen}
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, rotateX: 8, rotateY: -8 }}
      whileTap={{ scale: 0.96 }}
      aria-label="Open upcoming events"
    >
      <span className="event-folder__back" />
      <span className="event-folder__tab" />
      <span className="event-folder__body">
        <span className="event-folder__shine" />
        <Sparkles size={28} />
        <strong>Open Event Vault</strong>
        <small>Tap to reveal passes</small>
      </span>
      <span className="event-folder__pulse" />
    </motion.button>
  );
}

function EventFlipCard({ event, index, onBook }) {
  const [flipped, setFlipped] = useState(false);
  const title = event.title || event.name || "Untitled Event";
  const image = event.image || event.imageUrl || event.cover;
  const date = formatDate(event.event_date || event.date);
  const startsAt = formatTime(event.start_time || event.time);
  const endsAt = formatTime(event.end_time);
  const price = event.price ? `₹${Number(event.price).toLocaleString("en-IN")}` : "Login required";
  const slots = event.available_slots ?? event.slots;

  return (
    <motion.article
      className={`event-card ${flipped ? "is-flipped" : ""}`}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -12 }}
      onClick={() => setFlipped((value) => !value)}
    >
      <div className="event-card__inner">
        <div className="event-card__face event-card__front">
          <img
            src={image}
            alt={title}
            className="event-card__image"
          />
          <div className="event-card__scan" />
          <div className="event-card__content">
            <span className="event-card__eyebrow">{event.category || "Live Event"}</span>
            <h3>{title}</h3>
            <div className="event-card__meta">
              <span><CalendarDays size={14} /> {date}</span>
              <span><Clock size={14} /> {startsAt}{event.end_time ? ` - ${endsAt}` : ""}</span>
            </div>
          </div>
        </div>

        <div className="event-card__face event-card__back">
          <div className="event-card__back-scroll">
            <span className="event-card__eyebrow">Event Brief</span>
            <h3>{title}</h3>
            <p>{event.description || event.details || "Step inside for a high-energy experience built for the next wave of fans."}</p>
            <div className="event-card__details">
              <span><CalendarDays size={14} /> {date}</span>
              <span><Clock size={14} /> {startsAt}{event.end_time ? ` - ${endsAt}` : ""}</span>
              <span><Ticket size={14} /> {price}</span>
              {slots !== undefined && <span><Users size={14} /> {slots} slots left</span>}
            </div>
          </div>
          <motion.button
            type="button"
            className="event-book"
            onClick={(e) => {
              e.stopPropagation();
              onBook();
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Login to Book
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export default function EventSection({ events = [] }) {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const visibleEvents = useMemo(() => events.slice(0, 8), [events]);

  if (!events.length) return null;

  const goToSignIn = () => navigate("/sign-in");

  return (
    <>
      <style>{`
        .ev-section {
          background:
            linear-gradient(135deg, rgba(4, 7, 22, 0.96), rgba(16, 6, 35, 0.96)),
            radial-gradient(circle at 18% 18%, rgba(0, 229, 255, 0.2), transparent 34%),
            radial-gradient(circle at 82% 12%, rgba(255, 0, 110, 0.18), transparent 30%);
          padding: 86px 0 96px;
          position: relative;
          overflow: hidden;
          color: #fff;
        }

        .ev-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size: 54px 54px;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 84%);
          pointer-events: none;
        }

        .ev-inner {
          max-width: 1220px;
          margin: 0 auto;
          padding: 0 22px;
          position: relative;
          z-index: 1;
        }

        .ev-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 42px;
        }

        .ev-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(28px, 5vw, 58px);
          line-height: 0.98;
          margin: 0;
          text-transform: uppercase;
        }

        .ev-sub {
          color: #00e5ff;
          display: block;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          letter-spacing: 4px;
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .ev-hint {
          color: rgba(255,255,255,0.68);
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          letter-spacing: 2px;
          margin: 0;
          text-transform: uppercase;
        }

        .event-folder {
          appearance: none;
          background: transparent;
          border: 0;
          cursor: pointer;
          display: block;
          height: 360px;
          margin: 30px auto 0;
          perspective: 1000px;
          position: relative;
          width: min(560px, 86vw);
        }

        .event-folder::before,
        .event-folder::after {
          background: linear-gradient(135deg, rgba(0,229,255,0.9), rgba(255,0,110,0.9));
          border: 1px solid rgba(255,255,255,0.28);
          border-radius: 8px;
          content: "";
          height: 170px;
          left: 50%;
          opacity: 0.76;
          position: absolute;
          top: 104px;
          transform-origin: 50% 100%;
          width: 118px;
          z-index: 1;
        }

        .event-folder::before {
          animation: peekCardLeft 2s ease-in-out infinite;
          transform: translateX(-92px) rotate(-13deg);
        }

        .event-folder::after {
          animation: peekCardRight 2s ease-in-out infinite 0.22s;
          transform: translateX(-16px) rotate(10deg);
        }

        .event-folder__back,
        .event-folder__tab,
        .event-folder__body {
          position: absolute;
          filter: drop-shadow(0 28px 38px rgba(0,0,0,0.38));
        }

        .event-folder__back {
          background: linear-gradient(135deg, #120a40, #5227ff);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 18px;
          inset: 82px 28px 30px;
          transform: rotateX(16deg) skewX(-5deg);
        }

        .event-folder__tab {
          background: linear-gradient(135deg, #00e5ff, #5227ff);
          border-radius: 18px 24px 8px 8px;
          height: 82px;
          left: 56px;
          top: 40px;
          width: 210px;
        }

        .event-folder__body {
          align-items: center;
          background: linear-gradient(135deg, #5227ff 0%, #8b5cf6 48%, #ff006e 100%);
          border: 1px solid rgba(255,255,255,0.26);
          border-radius: 24px;
          bottom: 26px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          inset-inline: 0;
          justify-content: center;
          overflow: hidden;
          top: 108px;
          transform: rotateX(8deg);
          z-index: 2;
        }

        .event-folder__body strong {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(22px, 4vw, 38px);
          letter-spacing: 1px;
        }

        .event-folder__body small {
          color: rgba(255,255,255,0.76);
          font-family: 'Share Tech Mono', monospace;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .event-folder__shine {
          animation: folderSweep 2.4s infinite;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.34), transparent);
          height: 180%;
          position: absolute;
          top: -40%;
          transform: rotate(20deg);
          width: 80px;
        }

        .event-folder__pulse {
          animation: folderPulse 2s infinite;
          border: 1px solid rgba(0,229,255,0.35);
          border-radius: 28px;
          inset: 90px 14px 14px;
          position: absolute;
        }

        .ev-carousel {
          display: grid;
          gap: 22px;
          grid-auto-flow: column;
          grid-auto-columns: minmax(280px, 360px);
          overflow-x: auto;
          padding: 34px 4px 24px;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          perspective: 1200px;
        }

        .ev-carousel::-webkit-scrollbar { display: none; }

        .event-card {
          background: transparent;
          cursor: pointer;
          height: 480px;
          perspective: 1300px;
          scroll-snap-align: center;
        }

        .event-card__inner {
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.76s cubic-bezier(.2,.8,.2,1);
        }

        .event-card.is-flipped .event-card__inner {
          transform: rotateY(180deg);
        }

        .event-card__face {
          backface-visibility: hidden;
          background: rgba(8, 12, 28, 0.9);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 8px;
          box-shadow: 0 24px 70px rgba(0,0,0,0.44), inset 0 0 34px rgba(0,229,255,0.08);
          clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
          inset: 0;
          overflow: hidden;
          position: absolute;
        }

        .event-card__front::after,
        .event-card__back::after {
          background: linear-gradient(90deg, transparent, rgba(0,229,255,0.75), transparent);
          content: "";
          height: 2px;
          left: 18px;
          position: absolute;
          right: 18px;
          top: 18px;
        }

        .event-card__back {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 28px;
          transform: rotateY(180deg);
        }

        .event-card__back-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding-right: 6px;
          scrollbar-color: rgba(0,229,255,0.8) rgba(255,255,255,0.08);
          scrollbar-width: thin;
        }

        .event-card__back-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .event-card__back-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
        }

        .event-card__back-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(#00e5ff, #ff006e);
          border-radius: 999px;
        }

        .event-card__image {
          height: 100%;
          object-fit: cover;
          width: 100%;
        }

        .event-card__scan {
          animation: scanLine 3s linear infinite;
          background: linear-gradient(to bottom, transparent, rgba(0,229,255,0.22), transparent);
          height: 90px;
          left: 0;
          position: absolute;
          right: 0;
          top: -100px;
        }

        .event-card__content {
          background: linear-gradient(to top, rgba(2,4,12,0.96), rgba(2,4,12,0.72), transparent);
          bottom: 0;
          left: 0;
          padding: 110px 24px 24px;
          position: absolute;
          right: 0;
        }

        .event-card__eyebrow {
          color: #00e5ff;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .event-card h3 {
          font-family: 'Orbitron', sans-serif;
          font-size: 24px;
          line-height: 1.08;
          margin: 9px 0 14px;
        }

        .event-card p {
          color: rgba(255,255,255,0.75);
          line-height: 1.65;
          margin: 0;
        }

        .event-card__meta,
        .event-card__details {
          display: grid;
          gap: 10px;
        }

        .event-card__meta span,
        .event-card__details span {
          align-items: center;
          color: rgba(255,255,255,0.78);
          display: flex;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          gap: 8px;
        }

        .event-book {
          background: linear-gradient(90deg, #00e5ff, #ff006e);
          border: 0;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 3px;
          margin-top: 8px;
          padding: 14px 18px;
          text-transform: uppercase;
        }

        @keyframes folderSweep {
          0% { left: -120px; }
          55%, 100% { left: calc(100% + 120px); }
        }

        @keyframes folderPulse {
          0%, 100% { opacity: 0.24; transform: scale(1); }
          50% { opacity: 0.58; transform: scale(1.035); }
        }

        @keyframes scanLine {
          0% { top: -100px; }
          100% { top: 100%; }
        }

        @keyframes peekCardLeft {
          0%, 100% { transform: translateX(-92px) translateY(16px) rotate(-13deg); }
          50% { transform: translateX(-116px) translateY(-22px) rotate(-21deg); }
        }

        @keyframes peekCardRight {
          0%, 100% { transform: translateX(-16px) translateY(14px) rotate(10deg); }
          50% { transform: translateX(18px) translateY(-28px) rotate(18deg); }
        }

        @media (max-width: 760px) {
          .ev-section { padding: 60px 0 72px; }
          .ev-header { align-items: start; flex-direction: column; }
          .event-folder { height: 300px; }
          .event-folder__body strong { font-size: 24px; }
          .ev-carousel { grid-auto-columns: 82vw; }
          .event-card { height: 440px; }
        }
      `}</style>

      <section className="ev-section">
        <div className="ev-inner">
          <motion.div
            className="ev-header"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.62 }}
          >
            <div>
              <span className="ev-sub">Future Schedule</span>
              <h2 className="ev-title">Upcoming Events</h2>
            </div>
            <p className="ev-hint">{opened ? "Tap a card to flip details" : "Open the folder"}</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.div
                key="folder"
                exit={{ opacity: 0, scale: 0.8, y: -80, rotateX: 18 }}
                transition={{ duration: 0.45 }}
              >
                <FolderLaunch onOpen={() => setOpened(true)} />
              </motion.div>
            ) : (
              <motion.div
                key="events"
                className="ev-carousel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {visibleEvents.map((event, index) => (
                  <EventFlipCard
                    key={event.id || event.title || index}
                    event={event}
                    index={index}
                    onBook={goToSignIn}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
