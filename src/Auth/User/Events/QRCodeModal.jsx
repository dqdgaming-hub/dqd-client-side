import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { theme, fonts } from "./theme";
import { CloseIcon, QRIcon, TicketIcon, ShieldIcon, AlertIcon } from "./Icons";
import StatusBadge from "./StatusBadge";
import VibraniumField from "./VibraniumField";
import VibraniumButton from "./VibraniumButton";

export default function QRCodeModal({ booking, close }) {
  const [torn, setTorn] = useState(false);

  useEffect(() => {
    if (booking) {
      setTorn(false);
      const t = setTimeout(() => setTorn(true), 500);
      return () => clearTimeout(t);
    }
  }, [booking]);

  const hasQR = Boolean(booking?.qr_code);

  return (
    <AnimatePresence>
      {booking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="dqd-overlay"
        >
          <style>{responsiveCSS}</style>

          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 50, rotateX: -10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="dqd-ticket-wrap"
          >
            <button onClick={close} className="dqd-close" aria-label="Close ticket">
              <CloseIcon size={15} color={theme.textDim} />
            </button>

            <div className="dqd-ticket-body">
              {/* STUB — info half */}
              <div className="dqd-stub">
                <div className="dqd-field-layer">
                  <VibraniumField active intensity={0.5} density={14} colorMode="full" />
                </div>

                <div className="dqd-stub-content">
                  <div className="dqd-eyebrow">
                    <TicketIcon size={12} color={theme.gold} />
                    <span>DQD GAMING HUB · ADMIT ONE</span>
                  </div>

                  <h2 className="dqd-event-title">{booking.event_title}</h2>

                  <div className="dqd-status-row">
                    <StatusBadge status={booking.status} size="sm" />
                  </div>

                  <div className="dqd-meta-grid">
                    <Meta label="DATE" value={booking.event_date} />
                    <Meta label="TIME" value={`${booking.start_time}–${booking.end_time}`} />
                    <Meta label="BOOKING ID" value={booking.booking_id} mono />
                  </div>
                </div>
              </div>

              {/* PERFORATION / TEAR LINE */}
              <div className="dqd-perforation">
                <div className="dqd-notch dqd-notch-a" />
                <motion.div
                  className="dqd-dashline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: torn ? 1 : 0.3 }}
                />
                <div className="dqd-notch dqd-notch-b" />
              </div>

              {/* QR STUB — reveals after "tear" */}
              <motion.div
                className="dqd-qr-section"
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                animate={{
                  clipPath: torn ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
                }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                {hasQR ? (
                  <>
                    <div className="dqd-qr-frame">
                      <span className="dqd-qr-corner dqd-qr-corner-tl" />
                      <span className="dqd-qr-corner dqd-qr-corner-tr" />
                      <span className="dqd-qr-corner dqd-qr-corner-bl" />
                      <span className="dqd-qr-corner dqd-qr-corner-br" />
                      <img src={booking.qr_code} alt="Booking QR" className="dqd-qr-image" />
                    </div>

                    <div className="dqd-token-block">
                      <div className="dqd-token-label">
                        <ShieldIcon size={11} color={theme.textDim} />
                        SECURE ENTRY TOKEN
                      </div>
                      <div className="dqd-token-value">
                        {booking.qr_token || "Token unavailable"}
                      </div>
                    </div>

                    <div className="dqd-helper-text">
                      <QRIcon size={12} color={theme.textFaint} />
                      Present at venue entrance for scanning
                    </div>
                  </>
                ) : (
                  <div className="dqd-qr-frame dqd-qr-frame-locked">
                    <AlertIcon size={30} color={theme.gold} />
                    <div className="dqd-locked-title">QR Not Approved</div>
                    <div className="dqd-locked-sub">
                      Your booking is awaiting confirmation. The entry code unlocks
                      once it's approved.
                    </div>
                  </div>
                )}

                <VibraniumButton variant="ghost" onClick={close} fullWidth>
                  Close Ticket
                </VibraniumButton>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Meta({ label, value, mono }) {
  return (
    <div className="dqd-meta-item">
      <span className="dqd-meta-label">{label}</span>
      <span className="dqd-meta-value" style={{ fontFamily: mono ? fonts.mono : fonts.body }}>
        {value}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------
   Layout strategy:
   - Overlay uses a scrollable flex container so the ticket
     is never clipped by fixed nav/tab bars — it can scroll
     within the overlay itself on short viewports.
   - Mobile (<701px): stacked portrait, compact heights,
     capped to viewport with internal scroll.
   - Desktop (>=701px): landscape strip — stub | perforation | qr.
--------------------------------------------------------- */
const responsiveCSS = `
.dqd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2,1,6,0.86);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 16px;
  overflow-y: auto;
}
.dqd-ticket-wrap {
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: calc(100dvh - 32px);
  margin: auto;
  perspective: 1000px;
  overflow-y: auto;
  overflow-x: hidden;
}
.dqd-close {
  position: sticky;
  top: 0;
  float: right;
  margin: -6px -6px 0 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid ${theme.border};
  background: ${theme.panel};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
}
.dqd-ticket-body {
  display: flex;
  flex-direction: column;
  clear: both;
}
.dqd-stub {
  position: relative;
  overflow: hidden;
  background: linear-gradient(155deg, ${theme.panel}, ${theme.panelAlt});
  border: 1px solid ${theme.border};
  border-bottom: none;
  clip-path: polygon(0% 5%, 5% 0%, 95% 0%, 100% 5%, 100% 100%, 0% 100%);
  padding: 16px 20px 12px;
}
.dqd-field-layer {
  position: absolute;
  inset: 0;
  opacity: 0.5;
  pointer-events: none;
}
.dqd-stub-content { position: relative; z-index: 1; width: 100%; }
.dqd-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: ${fonts.mono};
  font-size: 9px;
  letter-spacing: 0.14em;
  color: ${theme.gold};
  margin-bottom: 8px;
}
.dqd-event-title {
  font-family: ${fonts.display};
  font-weight: 700;
  font-size: 17px;
  color: ${theme.text};
  margin: 0 0 10px;
  line-height: 1.2;
}
.dqd-status-row { margin-bottom: 10px; }
.dqd-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
}
.dqd-meta-item { display: flex; flex-direction: column; gap: 3px; }
.dqd-meta-label {
  font-family: ${fonts.mono};
  font-size: 8.5px;
  letter-spacing: 0.13em;
  color: ${theme.textFaint};
}
.dqd-meta-value { font-size: 12.5px; font-weight: 600; color: ${theme.text}; }

.dqd-perforation {
  position: relative;
  height: 0;
  background: ${theme.panel};
  border-left: 1px solid ${theme.border};
  border-right: 1px solid ${theme.border};
}
.dqd-dashline { width: 100%; border-top: 2px dashed ${theme.border}; }
.dqd-notch {
  position: absolute;
  top: -10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${theme.void};
  border: 1px solid ${theme.border};
}
.dqd-notch-a { left: -11px; }
.dqd-notch-b { right: -11px; }

.dqd-qr-section {
  position: relative;
  background: linear-gradient(155deg, ${theme.panelAlt}, ${theme.panel});
  border: 1px solid ${theme.border};
  border-top: none;
  clip-path: polygon(0% 0%, 100% 0%, 100% 95%, 95% 100%, 5% 100%, 0% 95%);
  padding: 14px 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.dqd-qr-frame {
  position: relative;
  width: 118px;
  height: 118px;
  padding: 8px;
  background: #fff;
  flex-shrink: 0;
}
.dqd-qr-frame-locked {
  background: ${theme.panelAlt};
  border: 1px dashed ${theme.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 6px;
  padding: 14px;
  width: 100%;
  height: auto;
  min-height: 118px;
}
.dqd-locked-title {
  font-family: ${fonts.display};
  font-weight: 700;
  font-size: 13px;
  color: ${theme.gold};
  letter-spacing: 0.04em;
}
.dqd-locked-sub {
  font-size: 11px;
  color: ${theme.textDim};
  line-height: 1.5;
  max-width: 240px;
}
.dqd-qr-image { width: 100%; height: 100%; object-fit: contain; }
.dqd-qr-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: ${theme.teal};
  border-style: solid;
  border-width: 0;
}
.dqd-qr-corner-tl { top: -1px; left: -1px; border-top-width: 3px; border-left-width: 3px; }
.dqd-qr-corner-tr { top: -1px; right: -1px; border-top-width: 3px; border-right-width: 3px; }
.dqd-qr-corner-bl { bottom: -1px; left: -1px; border-bottom-width: 3px; border-left-width: 3px; }
.dqd-qr-corner-br { bottom: -1px; right: -1px; border-bottom-width: 3px; border-right-width: 3px; }

.dqd-token-block {
  width: 100%;
  text-align: center;
  padding: 10px 12px;
  background: rgba(63,224,197,0.07);
  border: 1px solid ${theme.borderBright};
}
.dqd-token-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: ${fonts.mono};
  font-size: 9px;
  letter-spacing: 0.14em;
  color: ${theme.textDim};
  margin-bottom: 5px;
}
.dqd-token-value {
  font-family: ${fonts.mono};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: ${theme.teal};
  word-break: break-all;
  text-shadow: 0 0 10px ${theme.tealGlow};
}
.dqd-helper-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: ${theme.textFaint};
  text-align: center;
}

/* ---- LANDSCAPE: desktop / tablet ---- */
@media (min-width: 701px) {
  .dqd-ticket-wrap { max-width: 660px; max-height: calc(100dvh - 48px); }
  .dqd-ticket-body { flex-direction: row; align-items: stretch; }
  .dqd-stub {
    flex: 1.35;
    border-bottom: 1px solid ${theme.border};
    border-right: none;
    clip-path: polygon(0% 6%, 6% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 94%);
    padding: 22px 26px;
    display: flex;
    align-items: center;
  }
  .dqd-perforation {
    height: auto;
    width: 0;
    border-left: none;
    border-right: none;
    border-top: 1px solid ${theme.border};
    border-bottom: 1px solid ${theme.border};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dqd-dashline { width: 0; height: 100%; border-top: none; border-left: 2px dashed ${theme.border}; }
  .dqd-notch { top: auto; left: -10px !important; right: auto !important; }
  .dqd-notch-a { top: -11px; }
  .dqd-notch-b { top: auto; bottom: -11px; }
  .dqd-qr-section {
    flex: 1;
    border-top: 1px solid ${theme.border};
    border-left: none;
    clip-path: polygon(0% 0%, 100% 0%, 100% 94%, 100% 100%, 6% 100%, 0% 94%);
    padding: 20px 24px;
    justify-content: center;
    gap: 10px;
  }
  .dqd-qr-frame { width: 116px; height: 116px; }
}

@media (max-width: 480px) {
  .dqd-stub { padding: 14px 16px 10px; }
  .dqd-event-title { font-size: 16px; }
  .dqd-qr-section { padding: 12px 16px 16px; gap: 8px; }
  .dqd-qr-frame { width: 104px; height: 104px; }
}

/* very short viewports (nav+tabbar squeeze) — shrink further, rely on scroll */
@media (max-height: 640px) and (max-width: 700px) {
  .dqd-stub { padding: 10px 14px 8px; }
  .dqd-eyebrow { margin-bottom: 5px; }
  .dqd-event-title { font-size: 14.5px; margin-bottom: 6px; }
  .dqd-status-row { margin-bottom: 6px; }
  .dqd-qr-section { padding: 10px 14px 12px; gap: 6px; }
  .dqd-qr-frame { width: 88px; height: 88px; }
  .dqd-helper-text { display: none; }
  .dqd-token-block { padding: 8px 10px; }
  .dqd-token-value { font-size: 11px; }
}
`;