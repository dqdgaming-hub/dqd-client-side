import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getTerms } from "../api/client";

/* ------------------------------------------------------------------ */
/*  Content — DQD Gaming Hub Terms & Conditions                       */
/*  Structured so each clause renders as its own "console readout"     */
/*  with an icon, instead of one long wall of text.                    */
/*                                                                      */
/*  This is now only the FALLBACK — used if the API call fails or      */
/*  hasn't returned structured data yet. The source of truth lives in  */
/*  the database (TermsAndConditions.content, seeded via seed_terms).  */
/* ------------------------------------------------------------------ */

const ICONS = {
    conduct: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    payments: "M2 7h20v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7Z M2 10h20 M6 15h4",
    equipment: "M6 12h.01 M18 12h.01 M8 8l2 2h4l2-2 M4 15V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3h-1l-1-2H9l-1 2H7a3 3 0 0 1-3-3Z",
    food: "M4 3v7a3 3 0 0 0 3 3v8 M4 3v10 M8 3v7 M17 3c-2 2-2 6-2 6v12",
    illegal: "M12 2 2 20h20L12 2Z M12 9v5 M12 17h.01",
    responsibility: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M5 21v-1a5 5 0 0 1 5-5h1 M17 11l2 2 4-4",
    damage: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.1-3.1a5 5 0 0 1-6.6 6.6L4.7 22.4a2.1 2.1 0 0 1-3-3L12.1 9a5 5 0 0 1 6.6-6.6l-3.1 3.1Z",
    cctv: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    safety: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z M9 12l2 2 4-4",
    liability: "M12 3v18 M5 8l-3 6a3 3 0 0 0 6 0l-3-6Z M19 8l-3 6a3 3 0 0 0 6 0l-3-6Z M5 8h14 M9 3h6",
    refuse: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3",
    changes: "M3 12a9 9 0 0 1 15-6.7L21 8 M21 12a9 9 0 0 1-15 6.7L3 16 M21 3v5h-5 M3 21v-5h5",
    contact: "M4 4h16v16H4Z M22 6 12 13 2 6",
};

const TERMS_DATA = {
    title: "Terms & Conditions",
    org: "DQD Gaming Hub",
    version: "1.0",
    effective_date: "July 2, 2026",
    intro:
        "Welcome to DQD Gaming Hub. By entering our premises, booking a gaming station or pool table, or using our services, you agree to the following Terms & Conditions.",
    sections: [
        {
            num: "01",
            title: "General Conduct",
            icon: "conduct",
            bullets: [
                "All customers must behave respectfully towards staff, other customers, and gaming hub property.",
                "Any abusive language, harassment, threats, violence, or disruptive behavior is strictly prohibited.",
                "Management reserves the right to refuse service or ask any customer to leave the premises without a refund if these rules are violated.",
            ],
        },
        {
            num: "02",
            title: "Bookings & Payments",
            icon: "payments",
            bullets: [
                "All bookings are subject to availability.",
                "Payment must be completed before the session begins unless otherwise approved by management.",
                "Gaming and pool table sessions start at the scheduled booking time.",
                "Additional time will be charged according to the applicable rates and is subject to availability.",
            ],
        },
        {
            num: "03",
            title: "Gaming & Pool Equipment",
            icon: "equipment",
            paragraphs: [
                "Customers must use all gaming systems, consoles, PCs, accessories, pool tables, cues, and other equipment responsibly.",
            ],
            bulletsIntro: "The following are strictly prohibited:",
            bullets: [
                "Tampering with hardware or software.",
                "Installing unauthorized software or applications.",
                "Changing system settings.",
                "Misusing gaming or pool equipment.",
            ],
            outro: [
                "Any customer who intentionally or negligently damages equipment, furniture, accessories, or any other gaming hub property will be responsible for the full cost of repair or replacement.",
            ],
        },
        {
            num: "04",
            title: "Outside Food & Beverages",
            icon: "food",
            paragraphs: [
                "Outside food and beverages are not permitted inside DQD Gaming Hub unless specifically approved by management.",
                "Food and drinks purchased from the hub must be consumed responsibly. Any damage caused by spills or negligence may result in cleaning or repair charges.",
            ],
        },
        {
            num: "05",
            title: "Illegal Activities",
            icon: "illegal",
            severity: "high",
            paragraphs: [
                "DQD Gaming Hub maintains a zero-tolerance policy toward illegal activities.",
            ],
            bulletsIntro: "The following are strictly prohibited:",
            bullets: [
                "Gambling or betting for money where prohibited by law.",
                "Possession or use of illegal drugs or controlled substances.",
                "Smoking or vaping in prohibited areas.",
                "Carrying illegal weapons or dangerous items.",
                "Piracy, hacking, cheating software, unauthorized access to computer systems, or any cybercrime.",
                "Viewing, downloading, sharing, or distributing illegal, obscene, or prohibited content.",
                "Any activity that violates applicable local, state, or national laws.",
            ],
            outro: [
                "Customers engaging in illegal activities may be removed immediately from the premises, have their access permanently banned, and may be reported to the appropriate law enforcement authorities where required.",
                "DQD Gaming Hub accepts no responsibility or liability for any illegal acts committed by customers while using our facilities.",
            ],
        },
        {
            num: "06",
            title: "Customer Responsibility",
            icon: "responsibility",
            bulletsIntro: "Customers are responsible for:",
            bullets: [
                "Their own actions and conduct.",
                "The safety of their personal belongings.",
                "Logging out of all personal gaming accounts before leaving.",
            ],
            outro: [
                "DQD Gaming Hub is not liable for the loss, theft, or damage of personal belongings left unattended.",
            ],
        },
        {
            num: "07",
            title: "Damage to Property",
            icon: "damage",
            paragraphs: [
                "Any damage caused to gaming systems, pool tables, furniture, décor, accessories, electrical equipment, or any other gaming hub property due to misuse, negligence, or intentional acts shall be the sole responsibility of the customer responsible. Management reserves the right to recover the full repair or replacement cost.",
            ],
        },
        {
            num: "08",
            title: "CCTV Surveillance",
            icon: "cctv",
            paragraphs: [
                "CCTV surveillance operates throughout the premises for the safety and security of customers, staff, and property.",
            ],
        },
        {
            num: "09",
            title: "Health & Safety",
            icon: "safety",
            paragraphs: [
                "Customers must follow all safety instructions provided by staff and must not engage in any behavior that could endanger themselves or others.",
            ],
        },
        {
            num: "10",
            title: "Limitation of Liability",
            icon: "liability",
            bulletsIntro: "DQD Gaming Hub shall not be responsible for:",
            bullets: [
                "Loss or theft of personal belongings.",
                "Service interruptions due to power failures, internet outages, or technical issues beyond our control.",
                "Injuries or losses resulting from a customer's failure to follow safety instructions or these Terms & Conditions.",
                "Any illegal activities committed by customers on or off the premises.",
            ],
        },
        {
            num: "11",
            title: "Right to Refuse Service",
            icon: "refuse",
            bulletsIntro: "Management reserves the right to:",
            bullets: [
                "Refuse entry or service to any person.",
                "Cancel bookings when necessary.",
                "Remove customers who violate these Terms & Conditions without refund.",
                "Recover costs for any damages caused to gaming hub property.",
            ],
        },
        {
            num: "12",
            title: "Changes to These Terms",
            icon: "changes",
            paragraphs: [
                "DQD Gaming Hub reserves the right to update these Terms & Conditions at any time. Continued use of our services constitutes acceptance of any revised Terms.",
            ],
        },
        {
            num: "13",
            title: "Contact Us",
            icon: "contact",
            paragraphs: [
                "For any questions regarding these Terms & Conditions, please contact DQD Gaming Hub through the contact details available on our website.",
            ],
        },
    ],
};

/* ------------------------------------------------------------------ */
/*  API response normalization                                        */
/*                                                                      */
/*  The backend's TermsAndConditions model stores the scalar fields    */
/*  (title, version, effective_date, is_current) as real columns, but  */
/*  the structured body (org, intro, sections[]) is serialized as a    */
/*  JSON string inside `content`. getTerms() may resolve to:           */
/*    - a plain object that already has `sections` (already parsed     */
/*      server-side or by client.js), or                               */
/*    - a record shaped like { title, version, effective_date,         */
/*      content: "<json string>" } straight from the API.              */
/*  normalizeTerms() handles both shapes and returns null if neither   */
/*  yields usable structured data, so the caller can fall back safely. */
/* ------------------------------------------------------------------ */

function normalizeTerms(remote) {
    if (!remote || typeof remote !== "object") return null;

    // Shape 1: already structured (has sections directly).
    if (Array.isArray(remote.sections) && remote.sections.length) {
        return remote;
    }

    // Shape 2: raw API record — structured body lives in `content`,
    // as either a JSON string or (if the API already deserializes it)
    // a nested object.
    if (remote.content) {
        let parsed = remote.content;
        if (typeof parsed === "string") {
            try {
                parsed = JSON.parse(parsed);
            } catch (err) {
                console.error("Failed to parse terms content JSON:", err);
                return null;
            }
        }

        if (parsed && Array.isArray(parsed.sections) && parsed.sections.length) {
            // Prefer the top-level DB columns for these three fields —
            // they're the canonical source — but keep everything else
            // (org, intro, sections) from the parsed content.
            return {
                ...parsed,
                title: remote.title || parsed.title,
                version: remote.version || parsed.version,
                effective_date: remote.effective_date || parsed.effective_date,
            };
        }
    }

    return null;
}

/* ------------------------------------------------------------------ */
/*  Motion variants                                                    */
/* ------------------------------------------------------------------ */

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

const modalVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.94 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
        opacity: 0,
        y: 20,
        scale: 0.96,
        transition: { duration: 0.2, ease: "easeIn" },
    },
};

const lineVariants = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.15 } },
};

const sectionVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: "easeOut", delay: 0.06 + Math.min(i, 8) * 0.045 },
    }),
};

const Icon = ({ name, size = 18 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d={ICONS[name]} />
    </svg>
);

const TermsModal = ({ open, onClose }) => {
    const [terms, setTerms] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usingFallback, setUsingFallback] = useState(false);
    const [activeSection, setActiveSection] = useState(0);

    const bodyRef = useRef(null);
    const sectionRefs = useRef([]);
    const progressFillRef = useRef(null);
    const activeSectionRef = useRef(0);
    const rafRef = useRef(null);

    const data = useMemo(() => terms || TERMS_DATA, [terms]);

    useEffect(() => {
        if (!open) return;

        setLoading(true);
        setUsingFallback(false);
        setActiveSection(0);
        activeSectionRef.current = 0;

        let cancelled = false;

        const loadTerms = async () => {
            try {
                const remote = await getTerms();
                const normalized = normalizeTerms(remote);

                if (cancelled) return;

                // Only accept API data if it actually resolves to structured
                // sections — otherwise fall back to the embedded terms above
                // so the document never renders as an unstructured blob.
                if (normalized) {
                    setTerms(normalized);
                } else {
                    setUsingFallback(true);
                }
            } catch (err) {
                console.error("Failed to load terms:", err);
                if (!cancelled) setUsingFallback(true);
            } finally {
                if (!cancelled) {
                    // Small deliberate delay so the "decrypting" state reads as
                    // an intentional beat rather than a flash.
                    setTimeout(() => {
                        if (!cancelled) setLoading(false);
                    }, 450);
                }
            }
        };

        loadTerms();

        return () => {
            cancelled = true;
        };
    }, [open]);

    // Track scroll position to drive the level-select rail + progress bar.
    // The progress bar is written straight to the DOM (no state) so it stays
    // buttery at 60fps; React only re-renders when the active clause changes.
    useEffect(() => {
        if (loading) return;
        const el = bodyRef.current;
        if (!el) return;

        const measure = () => {
            rafRef.current = null;

            const { scrollTop, scrollHeight, clientHeight } = el;
            const max = scrollHeight - clientHeight;
            const progress = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
            if (progressFillRef.current) {
                progressFillRef.current.style.width = `${progress * 100}%`;
            }

            let current = 0;
            sectionRefs.current.forEach((node, i) => {
                if (node && node.offsetTop - el.offsetTop <= scrollTop + 80) {
                    current = i;
                }
            });
            if (current !== activeSectionRef.current) {
                activeSectionRef.current = current;
                setActiveSection(current);
            }
        };

        const handleScroll = () => {
            if (rafRef.current == null) {
                rafRef.current = requestAnimationFrame(measure);
            }
        };

        el.addEventListener("scroll", handleScroll, { passive: true });
        measure();
        return () => {
            el.removeEventListener("scroll", handleScroll);
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        };
    }, [loading, data]);

    const jumpTo = (i) => {
        const node = sectionRefs.current[i];
        const el = bodyRef.current;
        if (!node || !el) return;
        el.scrollTo({ top: node.offsetTop - el.offsetTop - 12, behavior: "smooth" });
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

                .tm-backdrop {
                    position: fixed;
                    inset: 0;
                    background: radial-gradient(circle at 50% 20%, rgba(0, 240, 255, 0.08), rgba(0,0,0,0.88) 60%);
                    backdrop-filter: blur(6px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    padding: 20px;
                    font-family: 'Rajdhani', sans-serif;
                }

                .tm-modal-wrap {
                    position: relative;
                    width: 920px;
                    max-width: 100%;
                }

                .tm-modal-glow {
                    position: absolute;
                    inset: -2px;
                    background: linear-gradient(135deg, #00f0ff, #ff00c8, #ffb800, #00f0ff);
                    background-size: 300% 300%;
                    clip-path: polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px);
                    filter: blur(10px);
                    opacity: 0.55;
                    animation: tm-hue 6s linear infinite;
                    pointer-events: none;
                }

                @keyframes tm-hue {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .terms-modal {
                    position: relative;
                    width: 100%;
                    background:
                        linear-gradient(160deg, rgba(10,12,20,0.97), rgba(6,7,12,0.98)),
                        repeating-linear-gradient(0deg, rgba(0,240,255,0.025) 0px, rgba(0,240,255,0.025) 1px, transparent 1px, transparent 3px);
                    border: 1px solid rgba(0, 240, 255, 0.35);
                    clip-path: polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px);
                    box-shadow: 0 0 40px rgba(0, 240, 255, 0.15), inset 0 0 60px rgba(0, 0, 0, 0.6);
                    overflow: hidden;
                }

                .tm-corner {
                    position: absolute;
                    width: 14px;
                    height: 14px;
                    border: 2px solid #00f0ff;
                    opacity: 0.9;
                    z-index: 2;
                }
                .tm-corner.tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
                .tm-corner.br { bottom: 8px; right: 8px; border-left: none; border-top: none; }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 22px 28px 18px;
                    position: relative;
                }

                .tm-title-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .tm-eyebrow {
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 11px;
                    letter-spacing: 3px;
                    color: #ff00c8;
                    text-transform: uppercase;
                    opacity: 0.85;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .tm-eyebrow .dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #ff00c8;
                    box-shadow: 0 0 8px #ff00c8;
                }

                .modal-header h2 {
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 700;
                    font-size: 22px;
                    letter-spacing: 1px;
                    color: #eafcff;
                    margin: 0;
                    text-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
                }

                .tm-close-btn {
                    position: relative;
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 0, 200, 0.08);
                    border: 1px solid rgba(255, 0, 200, 0.4);
                    clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
                    color: #ff8fe6;
                    cursor: pointer;
                    font-size: 16px;
                    transition: color 0.2s ease;
                }

                .tm-header-line {
                    height: 1px;
                    margin: 0 28px;
                    background: linear-gradient(90deg, transparent, #00f0ff, #ff00c8, transparent);
                    transform-origin: left center;
                }

                /* progress rail under the header line */
                .tm-progress-track {
                    height: 3px;
                    margin: 10px 28px 0;
                    background: rgba(255,255,255,0.06);
                    position: relative;
                    overflow: hidden;
                }
                .tm-progress-fill {
                    position: absolute;
                    inset: 0;
                    width: 0%;
                    background: linear-gradient(90deg, #00f0ff, #ff00c8);
                    box-shadow: 0 0 10px rgba(0,240,255,0.6);
                    transition: width 0.08s ease-out;
                    will-change: width;
                }

                /* subtle offline/fallback indicator */
                .tm-fallback-note {
                    margin: 8px 28px 0;
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 10px;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: #ffb800;
                    opacity: 0.75;
                }

                .tm-layout {
                    display: grid;
                    grid-template-columns: 200px 1fr;
                    gap: 0;
                }

                /* --- level-select rail --- */
                .tm-rail {
                    padding: 18px 10px 18px 28px;
                    max-height: 58vh;
                    overflow-y: auto;
                    overscroll-behavior: contain;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                    border-right: 1px solid rgba(0,240,255,0.15);
                    scrollbar-width: none;
                }
                .tm-rail::-webkit-scrollbar { display: none; }

                .tm-rail-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    background: transparent;
                    border: none;
                    border-left: 2px solid rgba(255,255,255,0.08);
                    padding: 8px 10px;
                    margin-bottom: 2px;
                    cursor: pointer;
                    text-align: left;
                    color: #7de8ff;
                    opacity: 0.55;
                    transition: opacity 0.2s ease, border-color 0.2s ease, background 0.2s ease;
                }
                .tm-rail-item:hover {
                    opacity: 0.9;
                    background: rgba(0,240,255,0.05);
                }
                .tm-rail-item.active {
                    opacity: 1;
                    border-left-color: #00f0ff;
                    background: rgba(0,240,255,0.08);
                }
                .tm-rail-item .num {
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 10px;
                    color: #ff00c8;
                    min-width: 16px;
                }
                .tm-rail-item .label {
                    font-family: 'Rajdhani', sans-serif;
                    font-weight: 600;
                    font-size: 12.5px;
                    letter-spacing: 0.3px;
                    line-height: 1.2;
                }
                .tm-rail-item.severity-high .num { color: #ffb800; }

                /* mobile pill nav, hidden on desktop */
                .tm-rail-mobile {
                    display: none;
                }

                .modal-body {
                    max-height: 58vh;
                    overflow-y: auto;
                    overscroll-behavior: contain;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                    padding: 20px 28px 8px;
                    scrollbar-width: thin;
                    scrollbar-color: #00f0ff33 transparent;
                }

                .modal-body::-webkit-scrollbar { width: 6px; }
                .modal-body::-webkit-scrollbar-thumb {
                    background: linear-gradient(#00f0ff, #ff00c8);
                    border-radius: 4px;
                }

                .tm-meta-row {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-bottom: 14px;
                }

                .tm-meta-chip {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    background: rgba(0, 240, 255, 0.06);
                    border: 1px solid rgba(0, 240, 255, 0.25);
                    clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
                }

                .tm-meta-label {
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 10px;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: #7de8ff;
                    opacity: 0.75;
                }

                .tm-meta-value {
                    font-family: 'Rajdhani', sans-serif;
                    font-weight: 600;
                    font-size: 14px;
                    color: #fff;
                }

                .tm-intro {
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 14.5px;
                    line-height: 1.65;
                    color: #a9cdd4;
                    margin: 0 0 20px;
                    padding-left: 12px;
                    border-left: 2px solid rgba(0,240,255,0.35);
                }

                .tm-section {
                    padding: 16px 16px 18px;
                    margin-bottom: 14px;
                    background: rgba(255,255,255,0.015);
                    border: 1px solid rgba(0,240,255,0.12);
                    border-left: 2px solid rgba(0,240,255,0.4);
                    clip-path: polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px);
                    scroll-margin-top: 12px;
                }
                .tm-section.severity-high {
                    border-left-color: #ffb800;
                    background: rgba(255,184,0,0.035);
                }

                .tm-section-head {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .tm-section-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    flex: 0 0 auto;
                    color: #00f0ff;
                    background: rgba(0,240,255,0.08);
                    border: 1px solid rgba(0,240,255,0.3);
                    clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
                }
                .tm-section.severity-high .tm-section-icon {
                    color: #ffb800;
                    background: rgba(255,184,0,0.1);
                    border-color: rgba(255,184,0,0.4);
                }

                .tm-section-num {
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 11px;
                    color: #ff00c8;
                    letter-spacing: 1px;
                }

                .tm-section-title {
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 700;
                    font-size: 15px;
                    letter-spacing: 0.5px;
                    color: #eafcff;
                    margin: 0;
                }

                .tm-section p {
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 14.5px;
                    line-height: 1.65;
                    color: #cfe9ee;
                    margin: 0 0 10px;
                }

                .tm-bullets-intro {
                    font-family: 'Rajdhani', sans-serif;
                    font-weight: 600;
                    font-size: 13.5px;
                    color: #7de8ff;
                    margin: 4px 0 8px;
                }

                .tm-section ul {
                    list-style: none;
                    margin: 0 0 10px;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }

                .tm-section li {
                    display: flex;
                    gap: 10px;
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 14px;
                    line-height: 1.5;
                    color: #cfe9ee;
                }

                .tm-section li::before {
                    content: '';
                    flex: 0 0 auto;
                    width: 6px;
                    height: 6px;
                    margin-top: 7px;
                    background: #00f0ff;
                    box-shadow: 0 0 6px rgba(0,240,255,0.8);
                    transform: rotate(45deg);
                }
                .tm-section.severity-high li::before {
                    background: #ffb800;
                    box-shadow: 0 0 6px rgba(255,184,0,0.8);
                }

                .modal-footer {
                    padding: 18px 28px 26px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    border-top: 1px solid rgba(0,240,255,0.12);
                }

                .tm-footer-note {
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 10.5px;
                    letter-spacing: 1px;
                    color: #5c7d84;
                    text-transform: uppercase;
                }

                .tm-close-cta {
                    position: relative;
                    padding: 11px 30px;
                    background: linear-gradient(135deg, rgba(0,240,255,0.15), rgba(255,0,200,0.15));
                    border: 1px solid #00f0ff;
                    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
                    color: #eafcff;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 600;
                    font-size: 13px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    cursor: pointer;
                    overflow: hidden;
                    flex: 0 0 auto;
                }

                .tm-loading-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    gap: 18px;
                }

                .tm-loading-text {
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 12px;
                    letter-spacing: 3px;
                    color: #00f0ff;
                    text-transform: uppercase;
                }

                .tm-spinner {
                    width: 46px;
                    height: 46px;
                    border-radius: 2px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .modal-body, .tm-rail { scroll-behavior: auto; }
                    .tm-modal-glow { animation: none; }
                    .tm-progress-fill { transition: none; }
                }

                @media (max-width: 720px) {
                    .tm-layout { grid-template-columns: 1fr; }
                    .tm-rail { display: none; }
                    .tm-rail-mobile {
                        display: flex;
                        gap: 6px;
                        overflow-x: auto;
                        padding: 12px 28px;
                        border-bottom: 1px solid rgba(0,240,255,0.15);
                        scrollbar-width: none;
                    }
                    .tm-rail-mobile::-webkit-scrollbar { display: none; }
                    .tm-rail-mobile button {
                        flex: 0 0 auto;
                        font-family: 'Share Tech Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 1px;
                        color: #7de8ff;
                        background: rgba(0,240,255,0.06);
                        border: 1px solid rgba(0,240,255,0.25);
                        padding: 6px 10px;
                        cursor: pointer;
                        opacity: 0.6;
                    }
                    .tm-rail-mobile button.active {
                        opacity: 1;
                        border-color: #00f0ff;
                        color: #eafcff;
                    }
                    .modal-footer { flex-direction: column; align-items: stretch; }
                    .tm-close-cta { width: 100%; }
                }
            `}</style>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="tm-backdrop"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    >
                        <motion.div
                            className="tm-modal-wrap"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="tm-modal-glow" />

                            <div className="terms-modal">
                                <div className="tm-corner tl" />
                                <div className="tm-corner br" />

                                <div className="modal-header">
                                    <div className="tm-title-wrap">
                                        <motion.span
                                            className="tm-eyebrow"
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1, duration: 0.3 }}
                                        >
                                            <span className="dot" />
                                            Legal // {data.org || "Document"}
                                        </motion.span>
                                        <h2>{loading ? "Loading Terms" : data.title}</h2>
                                    </div>

                                    <motion.button
                                        className="tm-close-btn"
                                        onClick={onClose}
                                        whileHover={{
                                            scale: 1.08,
                                            backgroundColor: "rgba(255,0,200,0.18)",
                                            boxShadow: "0 0 16px rgba(255,0,200,0.5)",
                                        }}
                                        whileTap={{ scale: 0.92 }}
                                        aria-label="Close"
                                    >
                                        ✕
                                    </motion.button>
                                </div>

                                <motion.div
                                    className="tm-header-line"
                                    variants={lineVariants}
                                    initial="hidden"
                                    animate="visible"
                                />

                                {!loading && (
                                    <div className="tm-progress-track">
                                        <div className="tm-progress-fill" ref={progressFillRef} />
                                    </div>
                                )}

                                {!loading && usingFallback && (
                                    <div className="tm-fallback-note">
                                        Showing locally cached terms — live copy unavailable
                                    </div>
                                )}

                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <motion.div
                                            key="loading"
                                            className="tm-loading-wrap"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
                                            exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
                                        >
                                            <svg className="tm-spinner" viewBox="0 0 46 46" fill="none">
                                                <motion.polygon
                                                    points="23,2 44,12 44,34 23,44 2,34 2,12"
                                                    stroke="#00f0ff"
                                                    strokeWidth="2"
                                                    fill="none"
                                                    animate={{
                                                        rotate: 360,
                                                        stroke: ["#00f0ff", "#ff00c8", "#00f0ff"],
                                                    }}
                                                    transition={{
                                                        rotate: { duration: 1.6, repeat: Infinity, ease: "linear" },
                                                        stroke: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                                                    }}
                                                    style={{ transformOrigin: "23px 23px" }}
                                                />
                                            </svg>
                                            <span className="tm-loading-text">Decrypting document…</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="content"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }}
                                        >
                                            {/* mobile pill nav */}
                                            <div className="tm-rail-mobile">
                                                {data.sections.map((s, i) => (
                                                    <button
                                                        key={s.num}
                                                        className={i === activeSection ? "active" : ""}
                                                        onClick={() => jumpTo(i)}
                                                    >
                                                        {s.num}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="tm-layout">
                                                <nav className="tm-rail">
                                                    {data.sections.map((s, i) => (
                                                        <button
                                                            key={s.num}
                                                            className={`tm-rail-item ${i === activeSection ? "active" : ""} ${
                                                                s.severity === "high" ? "severity-high" : ""
                                                            }`}
                                                            onClick={() => jumpTo(i)}
                                                        >
                                                            <span className="num">{s.num}</span>
                                                            <span className="label">{s.title}</span>
                                                        </button>
                                                    ))}
                                                </nav>

                                                <div className="modal-body" ref={bodyRef}>
                                                    <motion.div
                                                        className="tm-meta-row"
                                                        variants={sectionVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        custom={0}
                                                    >
                                                        <div className="tm-meta-chip">
                                                            <span className="tm-meta-label">Version</span>
                                                            <span className="tm-meta-value">{data.version}</span>
                                                        </div>
                                                        <div className="tm-meta-chip">
                                                            <span className="tm-meta-label">Effective</span>
                                                            <span className="tm-meta-value">{data.effective_date}</span>
                                                        </div>
                                                        <div className="tm-meta-chip">
                                                            <span className="tm-meta-label">Sections</span>
                                                            <span className="tm-meta-value">{data.sections.length}</span>
                                                        </div>
                                                    </motion.div>

                                                    {data.intro && (
                                                        <motion.p
                                                            className="tm-intro"
                                                            variants={sectionVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            custom={1}
                                                        >
                                                            {data.intro}
                                                        </motion.p>
                                                    )}

                                                    {data.sections.map((s, i) => (
                                                        <motion.section
                                                            key={s.num}
                                                            ref={(el) => (sectionRefs.current[i] = el)}
                                                            className={`tm-section ${s.severity === "high" ? "severity-high" : ""}`}
                                                            variants={sectionVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            custom={i + 2}
                                                        >
                                                            <div className="tm-section-head">
                                                                <span className="tm-section-icon">
                                                                    <Icon name={s.icon} />
                                                                </span>
                                                                <div>
                                                                    <div className="tm-section-num">CLAUSE {s.num}</div>
                                                                    <h3 className="tm-section-title">{s.title}</h3>
                                                                </div>
                                                            </div>

                                                            {s.paragraphs?.map((p, pi) => (
                                                                <p key={pi}>{p}</p>
                                                            ))}

                                                            {s.bullets && (
                                                                <>
                                                                    {s.bulletsIntro && (
                                                                        <p className="tm-bullets-intro">{s.bulletsIntro}</p>
                                                                    )}
                                                                    <ul>
                                                                        {s.bullets.map((b, bi) => (
                                                                            <li key={bi}>{b}</li>
                                                                        ))}
                                                                    </ul>
                                                                </>
                                                            )}

                                                            {s.outro?.map((p, oi) => (
                                                                <p key={`o-${oi}`}>{p}</p>
                                                            ))}
                                                        </motion.section>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="modal-footer">
                                    <span className="tm-footer-note">
                                        {loading ? "Standby…" : `Viewing clause ${data.sections[activeSection]?.num}`}
                                    </span>
                                    <motion.button
                                        className="tm-close-cta"
                                        onClick={onClose}
                                        whileHover={{
                                            scale: 1.04,
                                            boxShadow: "0 0 22px rgba(0,240,255,0.55)",
                                        }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        Close
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default TermsModal;