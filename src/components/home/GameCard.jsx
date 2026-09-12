import { motion } from "framer-motion";
import { Users, Clock, Wrench, CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GameCard({ game, categoryName, categoryAccent = "#00f5ff" }) {
  const navigate = useNavigate();
  const isMaintenance = game.maintenance_mode;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Share+Tech+Mono&family=Inter:wght@400;500&display=swap');

        .gcard {
          position: relative;
          background: #0d0d2b;
          border: 1px solid rgba(0,245,255,0.12);
          clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
          overflow: hidden;
          cursor: pointer;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .gcard::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,245,255,0.03) 0%, transparent 60%);
          pointer-events: none;
          transition: opacity 0.4s;
          opacity: 0;
          z-index: 1;
        }
        .gcard:hover::before { opacity: 1; }

        .gcard-img-wrap {
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .gcard-img-wrap img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
          filter: brightness(0.85) saturate(1.1);
        }
        .gcard:hover .gcard-img-wrap img {
          transform: scale(1.08);
          filter: brightness(1) saturate(1.3);
        }

        .gcard-img-wrap::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 60%;
          background: linear-gradient(to top, #0d0d2b, transparent);
        }

        /* ── category name badge (top-left of image) ── */
        .gcard-cat-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 4px 10px;
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 3;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
          color: #fff;
          backdrop-filter: blur(6px);
        }

        .gcard-cat-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .gcard-maintenance-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 59, 59, 0.85);
          border: 1px solid rgba(255,80,80,0.5);
          color: #fff;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          padding: 4px 10px;
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 2;
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
        }

        .gcard-body {
          padding: 18px;
          display: flex;
          flex-direction: column;
          flex: 1;
          position: relative;
          z-index: 2;
        }

        /* thin accent line under image */
        .gcard-accent-line {
          height: 2px;
          flex-shrink: 0;
          transition: background 0.4s;
        }

        .gcard-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 10px;
          line-height: 1.3;
        }

        .gcard-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          margin-bottom: 6px;
        }
        .gcard-meta svg { color: rgba(0,245,255,0.5); flex-shrink: 0; }

        .gcard-price {
          font-family: 'Orbitron', sans-serif;
          font-size: 20px;
          font-weight: 900;
          color: #00f5ff;
          margin: 10px 0 16px;
          text-shadow: 0 0 20px rgba(0,245,255,0.4);
        }
        .gcard-price span {
          font-size: 12px;
          font-weight: 400;
          color: rgba(255,255,255,0.4);
          font-family: 'Share Tech Mono', monospace;
          margin-left: 4px;
        }

        .gcard-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          padding: 12px;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
          transition: box-shadow 0.3s, opacity 0.3s;
          position: relative;
          overflow: hidden;
          margin-top: auto;
        }
        .gcard-btn.book {
          background: linear-gradient(135deg, #00f5ff, #0066cc);
          color: #0a0a1a;
        }
        .gcard-btn.book:hover { box-shadow: 0 0 25px rgba(0,245,255,0.5); }
        .gcard-btn.disabled {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.25);
          cursor: not-allowed;
          pointer-events: none;
        }

        .gcard-glow {
          position: absolute;
          inset: 0;
          opacity: 0;
          border: 1px solid rgba(0,245,255,0.5);
          clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
          transition: opacity 0.3s;
          pointer-events: none;
          box-shadow: 0 0 20px rgba(0,245,255,0.15) inset;
        }
        .gcard:hover .gcard-glow { opacity: 1; }
      `}</style>

      <motion.div
        className="gcard"
        whileHover={{ y: -8, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={() => {
    if (!isMaintenance) {
      navigate("/sign-in");
    }
  }}
      >
        <div className="gcard-glow" />

        <div className="gcard-img-wrap">
          <img src={game.image} alt={game.name} />

          {/* Category name badge – top left */}
          {categoryName && (
            <div
              className="gcard-cat-badge"
              style={{
                background: `${categoryAccent}28`,
                border: `1px solid ${categoryAccent}55`,
              }}
            >
              <span
                className="gcard-cat-dot"
                style={{ background: categoryAccent, boxShadow: `0 0 6px ${categoryAccent}` }}
              />
              {categoryName}
            </div>
          )}

          {isMaintenance && (
            <div className="gcard-maintenance-badge">
              <Wrench size={10} /> MAINTENANCE
            </div>
          )}
        </div>

        {/* thin colored accent line under the image */}
        <div
          className="gcard-accent-line"
          style={{ background: `linear-gradient(90deg, ${categoryAccent}80, transparent)` }}
        />

        <div className="gcard-body">
          <h5 className="gcard-name">{game.name}</h5>

          <div className="gcard-meta">
            <Users size={12} />
            Max {game.max_capacity} players
          </div>

          <div className="gcard-meta">
            <Clock size={12} />
            Per hour session
          </div>

          <div className="gcard-price">
            INR {game.price_per_hour}
            <span>/ hr</span>
          </div>

          <button 
          className={`gcard-btn ${isMaintenance ? "disabled" : "book"}`}
          onClick={() => {
              if (!isMaintenance) {
                navigate("/sign-in");
              }
            }}
          >
            {isMaintenance ? (
    <>
      <Wrench size={12} />
      Unavailable
    </>
  ) : (
    <>
      <CalendarCheck size={12} />
      Book Now
    </>
  )}
</button>
        </div>
      </motion.div>
    </>
  );
}