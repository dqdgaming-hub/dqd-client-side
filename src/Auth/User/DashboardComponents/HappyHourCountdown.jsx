import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUpcomingHappyHour } from "../../api/userapi";

var K$1 = {
    void: "#05050a",
    panel: "#0b0b14",
    panelAlt: "#0f0f1a",
    cyan: "#00ffe1",
    pink: "#ff006e",
    yellow: "#f5ff00",
    line: "rgba(0,255,225,0.18)",
    lineSoft: "rgba(255,255,255,0.06)",
    textDim: "rgba(230,240,245,0.55)",
    danger: "#ff2d55",
  },
  En = "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)",
  Dn = "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
  On = (e) => (
    <svg viewBox="0 0 24 24" fill="none" {...e}>
      <path d="M13 2 3 14h7l-1 8 11-14h-8l1-6z" fill="currentColor" />
    </svg>
  ),
  XKn = (e) => (
    <svg viewBox="0 0 24 24" fill="none" {...e}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7v5l3.5 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  An = (e) => (
    <svg viewBox="0 0 24 24" fill="none" {...e}>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  XJn = (e) => (
    <svg viewBox="0 0 24 24" fill="none" {...e}>
      <rect x="3" y="9" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3 9h18M12 9v12M12 9c-1.7 0-4-1-4-3.2A2.3 2.3 0 0 1 10.3 3C12 3 12 6 12 9ZM12 9c1.7 0 4-1 4-3.2A2.3 2.3 0 0 0 13.7 3C12 3 12 6 12 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Mn = (e) => (
    <svg viewBox="0 0 24 24" fill="none" {...e}>
      <path d="M4 4h16v13l-4 4H4V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Nn = (e) => (
    <svg viewBox="0 0 24 24" fill="none" {...e}>
      <path
        d="M12 3c-4.4 0-8 3.6-8 8v9l2.5-2 2.5 2 2.5-2 2.5 2 2.5-2 2.5 2v-9c0-4.4-3.6-8-8-8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="11" r="1" fill="currentColor" />
      <circle cx="14.5" cy="11" r="1" fill="currentColor" />
    </svg>
  ),
  HappyHourCountdown = () => {
    let [e, t] = useState(null),
      [n, r] = useState(null),
      [i, a] = useState(true),
      o = async () => {
        try {
          a(true);
          let e = (await getUpcomingHappyHour())?.happy_hour;
          if (!e) {
            t(null), r(null);
            return;
          }
          let n = new Date(`${e.date}T${e.start_time}`),
            i = new Date(`${e.date}T${e.end_time}`);
          t({
            ...e,
            startDate: n,
            endDate: i,
          });
        } catch (e) {
          console.error("Failed to load Happy Hour:", e), t(null), r(null);
        } finally {
          a(false);
        }
      };
    useEffect(() => {
      o();
    }, []),
      useEffect(() => {
        if (!e) return;
        let t = () => {
          let t = new Date(),
            n = e.startDate,
            i = e.endDate;
          if (t >= n && t < i) {
            r({
              label: "ENDS IN",
              diff: i.getTime() - t.getTime(),
            });
            return;
          }
          if (t < n) {
            r({
              label: "STARTS IN",
              diff: n.getTime() - t.getTime(),
            });
            return;
          }
          r(null);
        };
        t();
        let n = setInterval(t, 1e3),
          i = e.endDate.getTime() - Date.now(),
          a = setTimeout(
            () => {
              o();
            },
            Math.max(i + 1e3, 1e3),
          );
        return () => {
          clearInterval(n), clearTimeout(a);
        };
      }, [e]);
    let s = (e) => {
      let t = Math.max(0, Math.floor(e / 1e3)),
        n = Math.floor(t / 86400),
        r = Math.floor((t % 86400) / 3600),
        i = Math.floor((t % 3600) / 60),
        a = t % 60,
        o = [];
      return (
        n > 0 &&
          o.push({
            value: n,
            unit: "D",
          }),
        o.push({
          value: r,
          unit: "H",
        }),
        o.push({
          value: i,
          unit: "M",
        }),
        o.push({
          value: a,
          unit: "S",
        }),
        o
      );
    };
    if (i)
      return (
        <div className="hhc-root">
          <div className="hhc-card hhc-loading">
            <motion.div
              className="hhc-loading-glyph"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.4,
                repeat: 1 / 0,
                ease: "linear",
              }}
            >
              <On className="hhc-icon" />
            </motion.div>
            <span>SCANNING FOR OFFERS...</span>
          </div>
          <XQ />
        </div>
      );
    if (!e)
      return (
        <div className="hhc-root">
          <motion.div
            className="hhc-card hhc-empty"
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{ duration: 0.4 }}
          >
            <Nn className="hhc-empty-icon" />
            <h3>HAPPY HOUR</h3>
            <p>No upcoming Happy Hour available right now.</p>
          </motion.div>
          <XQ />
        </div>
      );
    let c = new Date(),
      l = c >= e.startDate && c < e.endDate,
      u = n?.diff == null ? [] : s(n.diff);
    return (
      <div className="hhc-root">
        <motion.div
          className={`hhc-card ${l ? "is-live" : ""}`}
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.45,
            ease: "easeOut",
          }}
        >
          <div className="hhc-glow" aria-hidden="true" />
          <div className="hhc-scan" aria-hidden="true" />
          <div className="hhc-header">
            <span className="hhc-label">
              <On className="hhc-icon-sm" />
              HAPPY HOUR
            </span>
            <AnimatePresence>
              {l && (
                <motion.span
                  className="hhc-live"
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                >
                  <motion.i
                    className="hhc-live-dot"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{
                      duration: 1.2,
                      repeat: 1 / 0,
                    }}
                  />
                  LIVE
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="hhc-content">
            <motion.h2
              className="hhc-offer"
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.4,
                delay: 0.1,
                type: "spring",
                stiffness: 200,
              }}
            >
              {e.offer_percentage}
              <span className="hhc-offer-unit">% OFF</span>
            </motion.h2>
            {e.is_free && (
              <motion.div
                className="hhc-free-chip"
                initial={{
                  opacity: 0,
                  y: -6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{ delay: 0.2 }}
              >
                <XJn className="hhc-icon-xs" />
                FREE SLOT
              </motion.div>
            )}
            <div className="hhc-meta">
              <span className="hhc-meta-item">
                <An className="hhc-icon-xs" />
                {Fn(e.date)}
              </span>
              <span className="hhc-meta-item hhc-mono">
                <XKn className="hhc-icon-xs" />
                {In(e.start_time)}
                {" — "}
                {In(e.end_time)}
              </span>
            </div>
            <div className="hhc-countdown-block">
              <span className="hhc-countdown-tag">{n?.label || ""}</span>
              <div className="hhc-segments">
                {u.map((e, t) => (
                  <Fragment key={e.unit}>
                    <div className="hhc-segment">
                      <div className="hhc-digit-wrap">
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={e.value}
                            className="hhc-digit"
                            initial={{
                              y: -14,
                              opacity: 0,
                            }}
                            animate={{
                              y: 0,
                              opacity: 1,
                            }}
                            exit={{
                              y: 14,
                              opacity: 0,
                            }}
                            transition={{ duration: 0.25 }}
                          >
                            {String(e.value).padStart(2, "0")}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <span className="hhc-segment-unit">{e.unit}</span>
                    </div>
                    {t < u.length - 1 && <span className="hhc-segment-sep">:</span>}
                  </Fragment>
                ))}
              </div>
            </div>
            {e.notes && (
              <motion.p
                className="hhc-notes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Mn className="hhc-icon-xs" />
                {e.notes}
              </motion.p>
            )}
          </div>
        </motion.div>
        <XQ />
      </div>
    );
  },
  Fn = (e) =>
    new Date(`${e}T00:00:00`).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  In = (e) => {
    if (!e) return "";
    let [t, n] = e.split(":"),
      r = new Date();
    return (
      r.setHours(Number(t), Number(n), 0, 0),
      r.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  },
  XQ = () => (
    <style>{`
        .hhc-root {
            --cyan: ${K$1.cyan};
            --pink: ${K$1.pink};
            --yellow: ${K$1.yellow};
            --void: ${K$1.void};
            --panel: ${K$1.panel};
            --panel-alt: ${K$1.panelAlt};
            --line: ${K$1.line};
            --line-soft: ${K$1.lineSoft};
            --text-dim: ${K$1.textDim};
            --danger: ${K$1.danger};
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 12px;
            font-family: 'Share Tech Mono', monospace;
        }
        .hhc-root * { box-sizing: border-box; }

        .hhc-card {
            position: relative;
            width: 100%;
            max-width: 460px;
            padding: clamp(20px, 5vw, 30px);
            background: linear-gradient(160deg, var(--panel) 0%, var(--void) 100%);
            border: 1px solid var(--line);
            clip-path: ${En};
            overflow: hidden;
            isolation: isolate;
        }

        .hhc-glow {
            position: absolute;
            inset: -40%;
            background: radial-gradient(circle at 30% 20%, rgba(0,255,225,0.14), transparent 60%),
                        radial-gradient(circle at 80% 90%, rgba(255,0,110,0.12), transparent 55%);
            z-index: -1;
            pointer-events: none;
        }

        .hhc-scan {
            position: absolute;
            left: 0; right: 0; top: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--cyan), transparent);
            opacity: 0.7;
        }

        .hhc-card.is-live {
            border-color: var(--pink);
            box-shadow: 0 0 0 1px rgba(255,0,110,0.25), 0 0 40px rgba(255,0,110,0.18);
        }

        /* ---------- HEADER ---------- */
        .hhc-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 22px;
        }
        .hhc-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Orbitron', sans-serif;
            font-size: 12px;
            letter-spacing: 0.18em;
            color: var(--cyan);
            text-shadow: 0 0 10px rgba(0,255,225,0.4);
        }
        .hhc-live {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            font-family: 'Orbitron', sans-serif;
            font-size: 10px;
            letter-spacing: 0.1em;
            color: var(--pink);
            border: 1px solid var(--pink);
            background: rgba(255,0,110,0.1);
            clip-path: ${Dn};
        }
        .hhc-live-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: var(--pink);
            box-shadow: 0 0 8px var(--pink);
            display: inline-block;
        }

        /* ---------- CONTENT ---------- */
        .hhc-content { text-align: center; }

        .hhc-offer {
            margin: 0;
            font-family: 'Orbitron', sans-serif;
            font-weight: 800;
            font-size: clamp(40px, 12vw, 58px);
            line-height: 1;
            color: #f2fffc;
            display: flex;
            align-items: baseline;
            justify-content: center;
            gap: 8px;
            flex-wrap: wrap;
        }
        .hhc-offer-unit {
            font-size: clamp(14px, 3.4vw, 18px);
            color: var(--cyan);
            letter-spacing: 0.06em;
            text-shadow: 0 0 12px rgba(0,255,225,0.5);
        }

        .hhc-free-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 10px;
            padding: 6px 14px;
            font-size: 11px;
            font-family: 'Orbitron', sans-serif;
            letter-spacing: 0.08em;
            color: var(--void);
            background: var(--yellow);
            clip-path: ${Dn};
            box-shadow: 0 0 16px rgba(245,255,0,0.4);
        }

        .hhc-meta {
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: center;
        }
        .hhc-meta-item {
            display: flex;
            align-items: center;
            gap: 7px;
            font-size: 13px;
            color: var(--text-dim);
        }
        .hhc-mono { font-family: 'Share Tech Mono', monospace; letter-spacing: 0.02em; color: #dff7f2; }

        /* ---------- COUNTDOWN ---------- */
        .hhc-countdown-block {
            margin-top: 24px;
            padding: 16px 12px;
            background: var(--panel-alt);
            border: 1px solid var(--line-soft);
            clip-path: ${Dn};
        }
        .hhc-countdown-tag {
            display: block;
            font-family: 'Orbitron', sans-serif;
            font-size: 10px;
            letter-spacing: 0.16em;
            color: var(--pink);
            margin-bottom: 10px;
        }
        .hhc-segments {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            gap: 6px;
            flex-wrap: nowrap;
        }
        .hhc-segment {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 40px;
        }
        .hhc-digit-wrap {
            position: relative;
            height: clamp(28px, 8vw, 36px);
            overflow: hidden;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .hhc-digit {
            display: block;
            font-family: 'Orbitron', sans-serif;
            font-size: clamp(20px, 6vw, 28px);
            font-weight: 700;
            color: var(--cyan);
            text-shadow: 0 0 10px rgba(0,255,225,0.45);
        }
        .hhc-segment-unit {
            margin-top: 2px;
            font-size: 9px;
            letter-spacing: 0.1em;
            color: var(--text-dim);
        }
        .hhc-segment-sep {
            font-family: 'Orbitron', sans-serif;
            font-size: clamp(18px, 5vw, 24px);
            color: var(--line);
            padding-top: 2px;
        }

        .hhc-notes {
            display: flex;
            align-items: flex-start;
            gap: 7px;
            justify-content: center;
            margin: 18px 0 0;
            font-size: 12px;
            color: var(--text-dim);
            text-align: left;
            border-top: 1px dashed var(--line-soft);
            padding-top: 12px;
        }

        /* ---------- ICONS ---------- */
        .hhc-icon { width: 26px; height: 26px; color: var(--cyan); }
        .hhc-icon-sm { width: 15px; height: 15px; }
        .hhc-icon-xs { width: 13px; height: 13px; flex-shrink: 0; margin-top: 1px; color: var(--cyan); }

        /* ---------- LOADING ---------- */
        .hhc-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
            padding: 40px 24px;
            font-size: 11px;
            letter-spacing: 0.1em;
            color: var(--text-dim);
        }
        .hhc-loading-glyph {
            width: 40px; height: 40px;
            display: flex; align-items: center; justify-content: center;
        }

        /* ---------- EMPTY ---------- */
        .hhc-empty {
            text-align: center;
            padding: 40px 24px;
        }
        .hhc-empty-icon {
            width: 34px; height: 34px;
            color: var(--text-dim);
            margin-bottom: 12px;
        }
        .hhc-empty h3 {
            font-family: 'Orbitron', sans-serif;
            font-size: 15px;
            letter-spacing: 0.1em;
            color: #f2fffc;
            margin: 0 0 8px;
        }
        .hhc-empty p {
            margin: 0;
            font-size: 12.5px;
            color: var(--text-dim);
        }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 400px) {
            .hhc-segment { min-width: 34px; }
            .hhc-segments { gap: 4px; }
        }
    `}</style>
  );

export default HappyHourCountdown;
