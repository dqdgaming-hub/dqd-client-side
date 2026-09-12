import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { bookEvent } from "../../api/userapi";
import { theme, fonts } from "./theme";
import { CalendarIcon, ClockIcon, CoinIcon, SeatIcon, CloseIcon, CheckIcon, TicketIcon } from "./Icons";
import VibraniumButton from "./VibraniumButton";

export default function EventDetailsModal({ event, close }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Lock every plausible scroll container while the modal is open.
  // Portaling escapes transformed ancestors that break `position: fixed`,
  // but the app may ALSO have an inner scroll wrapper (e.g. a layout div
  // with height:100vh + overflow:auto) — lock that too if present.
  useEffect(() => {
    const scrollY = window.scrollY;
    const lockedEls = [document.documentElement, document.body];

    // common inner-scroll-wrapper patterns — lock any that exist
    const candidates = document.querySelectorAll(
      "#root, #app, [data-scroll-root], .app-shell, main"
    );
    candidates.forEach((el) => lockedEls.push(el));

    const prevStyles = lockedEls.map((el) => ({
      el,
      overflow: el.style.overflow,
      position: el.style.position,
      top: el.style.top,
      width: el.style.width,
    }));

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    candidates.forEach((el) => {
      el.style.overflow = "hidden";
    });

    return () => {
      prevStyles.forEach(({ el, overflow, position, top, width }) => {
        el.style.overflow = overflow;
        el.style.position = position;
        el.style.top = top;
        el.style.width = width;
      });
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleBooking = async () => {
    try {
      setLoading(true);
      await bookEvent(event.id);
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.detail || "Unable to book event.");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        className="dqd-evt-overlay"
      >
        <style>{responsiveCSS}</style>

        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className="dqd-evt-modal"
        >
          <button className="dqd-evt-close" onClick={close} aria-label="Close">
            <CloseIcon size={16} color={theme.text} />
          </button>

          <div className="dqd-evt-media">
            <img src={event.image} alt="" className="dqd-evt-image" />
            <div className="dqd-evt-image-overlay" />
            <div className="dqd-evt-stripe" />
          </div>

          <div className="dqd-evt-body">
            <div className="dqd-evt-scroll">
              <h1 className="dqd-evt-title">{event.title}</h1>
              <p className="dqd-evt-desc">{event.description}</p>

              <div className="dqd-evt-info-grid">
                <InfoCard icon={<CalendarIcon size={16} color={theme.teal} />} title="Date" value={event.event_date} />
                <InfoCard
                  icon={<ClockIcon size={16} color={theme.teal} />}
                  title="Time"
                  value={`${event.start_time} - ${event.end_time}`}
                />
                <InfoCard icon={<CoinIcon size={16} color={theme.gold} />} title="Price" value={`INR ${event.price}`} />
                <InfoCard icon={<SeatIcon size={16} color={theme.gold} />} title="Seats" value={event.available_slots} />
              </div>
            </div>

            <div className="dqd-evt-actions">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ width: "100%" }}
                  >
                    <div className="dqd-evt-success">
                      <CheckIcon size={20} color={theme.teal} />
                      Booking submitted successfully
                    </div>
                    <VibraniumButton
                      variant="primary"
                      icon={<TicketIcon size={15} color="#fff" />}
                      fullWidth
                      onClick={() => {
                        close();
                        navigate("/user/my-event-bookings");
                      }}
                    >
                      My Bookings
                    </VibraniumButton>
                  </motion.div>
                ) : confirming ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="dqd-evt-confirm"
                  >
                    <p className="dqd-evt-confirm-text">
                      Confirm your reservation for <strong>{event.title}</strong>?
                    </p>
                    <div className="dqd-evt-btn-row">
                      <VibraniumButton variant="ghost" fullWidth onClick={() => setConfirming(false)}>
                        Go Back
                      </VibraniumButton>
                      <VibraniumButton variant="primary" fullWidth disabled={loading} onClick={handleBooking}>
                        {loading ? "Booking…" : "Confirm Booking"}
                      </VibraniumButton>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="dqd-evt-btn-row"
                  >
                    <VibraniumButton
                      variant="primary"
                      icon={<TicketIcon size={15} color="#fff" />}
                      fullWidth
                      onClick={() => setConfirming(true)}
                    >
                      Book Event
                    </VibraniumButton>
                    <VibraniumButton variant="ghost" fullWidth onClick={() => navigate("/user/my-event-bookings")}>
                      My Bookings
                    </VibraniumButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Portal straight to <body> so no transformed/animated ancestor
  // (e.g. a parent motion.div with animate/whileHover) can hijack
  // this fixed-position overlay or trap it inside a scroll container.
  return createPortal(modalContent, document.body);
}

function InfoCard({ icon, title, value }) {
  return (
    <div className="dqd-evt-info-card">
      <div className="dqd-evt-info-icon">{icon}</div>
      <small className="dqd-evt-info-title">{title}</small>
      <strong className="dqd-evt-info-value">{value}</strong>
    </div>
  );
}

const responsiveCSS = `
.dqd-evt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2,1,6,0.94);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  padding: 20px;
}
.dqd-evt-modal {
  position: relative;
  width: 100%;
  max-width: 780px;
  max-height: calc(100dvh - 40px);
  overflow: hidden;
  background: linear-gradient(160deg, ${theme.panel}, ${theme.panelAlt});
  border: 1px solid ${theme.border};
  clip-path: polygon(0% 2%, 2% 0%, 98% 0%, 100% 2%, 100% 98%, 98% 100%, 2% 100%, 0% 98%);
  box-shadow: 0 30px 80px -20px rgba(0,0,0,0.85);
  display: flex;
  flex-direction: column;
}
.dqd-evt-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 38px;
  height: 38px;
  border: 1px solid ${theme.border};
  background: rgba(5,4,10,0.65);
  color: #fff;
  cursor: pointer;
  clip-path: polygon(0% 12%, 12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
}
.dqd-evt-media { position: relative; height: 220px; flex-shrink: 0; }
.dqd-evt-image { width: 100%; height: 100%; object-fit: cover; }
.dqd-evt-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, ${theme.panel}, transparent 60%);
}
.dqd-evt-stripe {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, ${theme.purple}, ${theme.teal}, ${theme.gold});
}
.dqd-evt-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}
.dqd-evt-scroll {
  padding: 6px 26px 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  color: ${theme.text};
}
.dqd-evt-title {
  font-family: ${fonts.display};
  font-weight: 700;
  font-size: clamp(21px, 4vw, 28px);
  margin: 0 0 12px;
}
.dqd-evt-desc {
  color: ${theme.textDim};
  line-height: 1.65;
  margin-bottom: 20px;
  font-size: 14px;
}
.dqd-evt-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}
.dqd-evt-info-card {
  background: rgba(122,44,255,0.05);
  border: 1px solid ${theme.border};
  padding: 14px 12px;
  text-align: center;
  clip-path: polygon(0% 12%, 12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.dqd-evt-info-icon {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(63,224,197,0.08);
  clip-path: polygon(0% 12%, 12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%);
}
.dqd-evt-info-title {
  font-family: ${fonts.mono};
  font-size: 9px;
  letter-spacing: 0.12em;
  color: ${theme.textFaint};
}
.dqd-evt-info-value { font-size: 14px; font-weight: 600; color: ${theme.text}; }

.dqd-evt-actions {
  flex-shrink: 0;
  padding: 16px 26px 22px;
  border-top: 1px solid ${theme.border};
  background: ${theme.panel};
}
.dqd-evt-btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
.dqd-evt-success {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: rgba(63,224,197,0.08);
  border: 1px solid ${theme.teal};
  padding: 14px;
  margin-bottom: 14px;
  clip-path: polygon(0% 12%, 12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%);
  font-weight: 700; font-size: 14px; color: ${theme.teal};
  text-align: center;
}
.dqd-evt-confirm {
  background: rgba(212,175,55,0.06);
  border: 1px solid ${theme.border};
  padding: 16px;
  clip-path: polygon(0% 8%, 8% 0%, 100% 0%, 100% 92%, 92% 100%, 0% 100%);
}
.dqd-evt-confirm-text { margin: 0 0 14px; color: ${theme.textDim}; font-size: 13.5px; line-height: 1.55; }

@media (min-width: 860px) {
  .dqd-evt-modal {
    max-width: 820px;
    flex-direction: column;
    height: auto;
    max-height: calc(100dvh - 40px);
  }
  .dqd-evt-media { height: 240px; width: 100%; flex-shrink: 0; }
  .dqd-evt-image-overlay { background: linear-gradient(to top, ${theme.panel}, transparent 60%); }
  .dqd-evt-stripe {
    width: 100%; height: 3px; top: 0; left: 0; right: 0;
    background: linear-gradient(90deg, ${theme.purple}, ${theme.teal}, ${theme.gold});
  }
  .dqd-evt-body { width: 100%; min-height: 0; }
  .dqd-evt-scroll { padding: 26px 36px 0; }
  .dqd-evt-title { margin-top: 0; }
  .dqd-evt-actions { padding: 18px 36px 26px; }
  .dqd-evt-info-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 480px) {
  .dqd-evt-media { height: 170px; }
  .dqd-evt-scroll { padding: 4px 18px 0; }
  .dqd-evt-actions { padding: 12px 18px 18px; }
  .dqd-evt-info-grid { gap: 10px; }
}
`;