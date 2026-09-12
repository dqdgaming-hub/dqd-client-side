import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Radio } from "lucide-react";

export default function EventCard({ event }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Share+Tech+Mono&family=Inter:wght@400;500&display=swap');

        .ev-card {
          position: relative;
          background: #0d0d2b;
          clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          cursor: pointer;
        }

        .ev-img-wrap {
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .ev-img-wrap img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
          transition: transform 0.7s ease, filter 0.4s;
          filter: brightness(0.75) saturate(1.1);
        }

        .ev-card:hover .ev-img-wrap img {
          transform: scale(1.08);
          filter: brightness(0.9) saturate(1.4);
        }

        /* gradient bottom overlay */
        .ev-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, #0d0d2b 0%, rgba(13,13,43,0.4) 50%, transparent 100%);
          pointer-events: none;
        }

        /* live badge */
        .ev-live-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,0,110,0.9);
          color: #fff;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          padding: 5px 12px;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
          z-index: 2;
        }

        .ev-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fff;
          animation: livePulse 1.4s ease-in-out infinite;
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        .ev-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .ev-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 10px;
          line-height: 1.3;
        }

        .ev-desc {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ev-meta {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 20px;
        }

        .ev-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.5px;
        }

        .ev-meta-row svg { color: #ff006e; flex-shrink: 0; }

        .ev-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #0a0a1a;
          background: linear-gradient(135deg, #ff006e, #c026d3);
          border: none;
          cursor: pointer;
          padding: 13px 18px;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
          transition: box-shadow 0.3s;
          margin-top: auto;
          width: 100%;
        }

        .ev-cta:hover {
          box-shadow: 0 0 28px rgba(255,0,110,0.5);
        }

        /* border glow */
        .ev-border-glow {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255,0,110,0);
          clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));
          transition: border-color 0.3s, box-shadow 0.3s;
          pointer-events: none;
        }

        .ev-card:hover .ev-border-glow {
          border-color: rgba(255,0,110,0.4);
          box-shadow: 0 0 20px rgba(255,0,110,0.1) inset;
        }
      `}</style>

      <motion.div
        className="ev-card"
        whileHover={{ y: -10 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
      >
        <div className="ev-border-glow" />

        <div className="ev-img-wrap">
          <img src={event.image} alt={event.title} /> 
          <div className="ev-live-badge">
            <div className="ev-live-dot" />
            EVENT
          </div>
        </div>

        <div className="ev-body">
          <h5 className="ev-title">{event.title}</h5>
          <p className="ev-desc">{event.description}</p>

          <div className="ev-meta">
            <div className="ev-meta-row">
              <Calendar size={13} />
              {event.event_date}
            </div>
            <div className="ev-meta-row">
              <Clock size={13} />
              {event.start_time} — {event.end_time}
            </div>
          </div>

          <button className="ev-cta">
            <span>View Event</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </>
  );
}