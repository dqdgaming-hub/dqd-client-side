import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUpcomingHappyHour } from "../../api/userapi";

// ============================================================
// DESIGN TOKENS — matches DQD cyberpunk system
// ============================================================
const TOKENS = {
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
};

const CHAMFER = "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)";
const CHAMFER_SM = "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)";

// ============================================================
// ICONS (inline SVG, no emojis)
// ============================================================
const IconBolt = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M13 2 3 14h7l-1 8 11-14h-8l1-6z" fill="currentColor" />
    </svg>
);

const IconClock = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconCalendar = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const IconGift = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <rect x="3" y="9" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 9h18M12 9v12M12 9c-1.7 0-4-1-4-3.2A2.3 2.3 0 0 1 10.3 3C12 3 12 6 12 9ZM12 9c1.7 0 4-1 4-3.2A2.3 2.3 0 0 0 13.7 3C12 3 12 6 12 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
);

const IconNote = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M4 4h16v13l-4 4H4V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const IconGhost = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
            d="M12 3c-4.4 0-8 3.6-8 8v9l2.5-2 2.5 2 2.5-2 2.5 2 2.5-2 2.5 2v-9c0-4.4-3.6-8-8-8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <circle cx="9.5" cy="11" r="1" fill="currentColor" />
        <circle cx="14.5" cy="11" r="1" fill="currentColor" />
    </svg>
);

// ============================================================
// COMPONENT
// ============================================================
const HappyHourCountdown = () => {

    const [happyHour, setHappyHour] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [loading, setLoading] = useState(true);


    // ============================================================
    // LOAD UPCOMING HAPPY HOUR
    // ============================================================

    const loadNextHappyHour = async () => {

        try {

            setLoading(true);

            const data = await getUpcomingHappyHour();

            const slot = data?.happy_hour;


            if (!slot) {

                setHappyHour(null);
                setCountdown(null);

                return;
            }


            const startDate = new Date(
                `${slot.date}T${slot.start_time}`
            );

            const endDate = new Date(
                `${slot.date}T${slot.end_time}`
            );


            setHappyHour({
                ...slot,
                startDate,
                endDate,
            });

        } catch (error) {

            console.error(
                "Failed to load Happy Hour:",
                error
            );

            setHappyHour(null);
            setCountdown(null);

        } finally {

            setLoading(false);

        }
    };


    // ============================================================
    // INITIAL API CALL
    // ============================================================

    useEffect(() => {

        loadNextHappyHour();

    }, []);


    // ============================================================
    // COUNTDOWN
    // ============================================================

    useEffect(() => {

        if (!happyHour) {
            return;
        }


        const updateCountdown = () => {

            const now = new Date();

            const start = happyHour.startDate;
            const end = happyHour.endDate;


            // -----------------------------------------
            // HAPPY HOUR IS CURRENTLY RUNNING
            // -----------------------------------------

            if (now >= start && now < end) {

                setCountdown({
                    label: "ENDS IN",
                    diff: end.getTime() - now.getTime(),
                });

                return;
            }


            // -----------------------------------------
            // HAPPY HOUR HAS NOT STARTED
            // -----------------------------------------

            if (now < start) {

                setCountdown({
                    label: "STARTS IN",
                    diff: start.getTime() - now.getTime(),
                });

                return;
            }


            // -----------------------------------------
            // HAPPY HOUR HAS ENDED
            // -----------------------------------------

            setCountdown(null);

        };


        updateCountdown();


        // Update countdown every second
        const interval = setInterval(
            updateCountdown,
            1000
        );


        // When the current Happy Hour ends,
        // fetch the next one exactly once.
        const timeUntilEnd =
            happyHour.endDate.getTime() -
            Date.now();


        const refreshTimer = setTimeout(() => {

            loadNextHappyHour();

        }, Math.max(timeUntilEnd + 1000, 1000));


        return () => {

            clearInterval(interval);
            clearTimeout(refreshTimer);

        };

    }, [happyHour]);


    // ============================================================
    // FORMAT COUNTDOWN
    // ============================================================

    const getSegments = (milliseconds) => {

        const totalSeconds = Math.max(
            0,
            Math.floor(milliseconds / 1000)
        );


        const days = Math.floor(
            totalSeconds / 86400
        );

        const hours = Math.floor(
            (totalSeconds % 86400) / 3600
        );

        const minutes = Math.floor(
            (totalSeconds % 3600) / 60
        );

        const seconds =
            totalSeconds % 60;


        const segments = [];


        if (days > 0) {

            segments.push({
                value: days,
                unit: "D",
            });

        }


        segments.push({
            value: hours,
            unit: "H",
        });

        segments.push({
            value: minutes,
            unit: "M",
        });

        segments.push({
            value: seconds,
            unit: "S",
        });


        return segments;
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <div className="hhc-root">

                <div className="hhc-card hhc-loading">

                    <motion.div
                        className="hhc-loading-glyph"
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    >
                        <IconBolt className="hhc-icon" />
                    </motion.div>

                    <span>
                        SCANNING FOR OFFERS...
                    </span>

                </div>

                <Styles />

            </div>
        );
    }


    // ============================================================
    // NO HAPPY HOUR
    // ============================================================

    if (!happyHour) {

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
                    transition={{
                        duration: 0.4,
                    }}
                >

                    <IconGhost className="hhc-empty-icon" />

                    <h3>
                        HAPPY HOUR
                    </h3>

                    <p>
                        No upcoming Happy Hour available right now.
                    </p>

                </motion.div>

                <Styles />

            </div>
        );
    }


    // ============================================================
    // CURRENT STATE
    // ============================================================

    const now = new Date();

    const isRunning =
        now >= happyHour.startDate &&
        now < happyHour.endDate;


    const segments =
        countdown?.diff != null
            ? getSegments(countdown.diff)
            : [];


    // ============================================================
    // DISPLAY
    // ============================================================

    return (

        <div className="hhc-root">

            <motion.div
                className={`hhc-card ${
                    isRunning ? "is-live" : ""
                }`}
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

                {/* Ambient glow */}
                <div
                    className="hhc-glow"
                    aria-hidden="true"
                />

                <div
                    className="hhc-scan"
                    aria-hidden="true"
                />


                {/* ================= HEADER ================= */}

                <div className="hhc-header">

                    <span className="hhc-label">

                        <IconBolt
                            className="hhc-icon-sm"
                        />

                        HAPPY HOUR

                    </span>


                    <AnimatePresence>

                        {isRunning && (

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
                                    animate={{
                                        opacity: [
                                            1,
                                            0.3,
                                            1,
                                        ],
                                    }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                    }}
                                />

                                LIVE

                            </motion.span>

                        )}

                    </AnimatePresence>

                </div>


                {/* ================= CONTENT ================= */}

                <div className="hhc-content">


                    {/* OFFER */}

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

                        {happyHour.offer_percentage}

                        <span className="hhc-offer-unit">
                            % OFF
                        </span>

                    </motion.h2>


                    {/* FREE */}

                    {happyHour.is_free && (

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
                            transition={{
                                delay: 0.2,
                            }}
                        >

                            <IconGift
                                className="hhc-icon-xs"
                            />

                            FREE SLOT

                        </motion.div>

                    )}


                    {/* DATE + TIME */}

                    <div className="hhc-meta">

                        <span className="hhc-meta-item">

                            <IconCalendar
                                className="hhc-icon-xs"
                            />

                            {formatDate(
                                happyHour.date
                            )}

                        </span>


                        <span className="hhc-meta-item hhc-mono">

                            <IconClock
                                className="hhc-icon-xs"
                            />

                            {formatTimeDisplay(
                                happyHour.start_time
                            )}

                            {" — "}

                            {formatTimeDisplay(
                                happyHour.end_time
                            )}

                        </span>

                    </div>


                    {/* ================= COUNTDOWN ================= */}

                    <div className="hhc-countdown-block">

                        <span className="hhc-countdown-tag">

                            {countdown?.label || ""}

                        </span>


                        <div className="hhc-segments">

                            {segments.map(
                                (seg, index) => (

                                    <React.Fragment
                                        key={seg.unit}
                                    >

                                        <div className="hhc-segment">

                                            <div className="hhc-digit-wrap">

                                                <AnimatePresence
                                                    mode="popLayout"
                                                >

                                                    <motion.span
                                                        key={seg.value}
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
                                                        transition={{
                                                            duration: 0.25,
                                                        }}
                                                    >

                                                        {String(
                                                            seg.value
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}

                                                    </motion.span>

                                                </AnimatePresence>

                                            </div>


                                            <span className="hhc-segment-unit">
                                                {seg.unit}
                                            </span>

                                        </div>


                                        {index <
                                            segments.length - 1 && (

                                            <span className="hhc-segment-sep">
                                                :
                                            </span>

                                        )}

                                    </React.Fragment>

                                )
                            )}

                        </div>

                    </div>


                    {/* NOTES */}

                    {happyHour.notes && (

                        <motion.p
                            className="hhc-notes"
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            transition={{
                                delay: 0.3,
                            }}
                        >

                            <IconNote
                                className="hhc-icon-xs"
                            />

                            {happyHour.notes}

                        </motion.p>

                    )}

                </div>

            </motion.div>


            <Styles />

        </div>
    );
};

// --------------------------------------------------
// Date / time formatting
// --------------------------------------------------
const formatDate = (dateString) => {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
};

const formatTimeDisplay = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

// ============================================================
// STYLES
// ============================================================
const Styles = () => (
    <style>{`
        .hhc-root {
            --cyan: ${TOKENS.cyan};
            --pink: ${TOKENS.pink};
            --yellow: ${TOKENS.yellow};
            --void: ${TOKENS.void};
            --panel: ${TOKENS.panel};
            --panel-alt: ${TOKENS.panelAlt};
            --line: ${TOKENS.line};
            --line-soft: ${TOKENS.lineSoft};
            --text-dim: ${TOKENS.textDim};
            --danger: ${TOKENS.danger};
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
            clip-path: ${CHAMFER};
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
            clip-path: ${CHAMFER_SM};
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
            clip-path: ${CHAMFER_SM};
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
            clip-path: ${CHAMFER_SM};
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