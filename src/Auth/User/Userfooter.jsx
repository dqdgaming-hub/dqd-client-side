import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* ══════════════════════════════════════════════════════
   DESIGN TOKENS — unified with UserNavbar Vibranium system
   ══════════════════════════════════════════════════════ */
const T = {
  void:       "#030308",
  obsidian:   "#080812",
  panel:      "#0d0d1f",
  elevated:   "#111122",
  purple:     "#7b2fff",
  vibrLight:  "#a855f7",
  vibrGlow:   "#c084fc",
  vibrFaint:  "rgba(123,47,255,0.12)",
  fuchsia:    "#d400ff",
  gold:       "#d4a017",
  goldLight:  "#f0c040",
  goldFaint:  "rgba(212,160,23,0.10)",
  text:       "#e2d9f3",
  muted:      "rgba(226,217,243,0.38)",
  dim:        "rgba(226,217,243,0.15)",
  border:     "rgba(123,47,255,0.22)",
  borderGold: "rgba(212,160,23,0.28)",
};

/* ══════════════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════════════ */
const YoutubeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="5"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const GlobeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L3 7v6c0 5 4 9.3 9 10.3C17 22.3 21 18 21 13V7z"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

/* Vibranium hex crest — the logo frame */
function VibraniumCrest({ size = 48 }) {
  return (
    <div style={{ width: size, height: size, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="ft-crest-a" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc"/>
            <stop offset="100%" stopColor="#7b2fff"/>
          </linearGradient>
          <linearGradient id="ft-crest-b" x1="52" y1="0" x2="0" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d4a017"/>
            <stop offset="100%" stopColor="#f0c040"/>
          </linearGradient>
        </defs>
        <polygon points="26,2 50,14 50,38 26,50 2,38 2,14" stroke="url(#ft-crest-a)" strokeWidth="1.2" fill="rgba(123,47,255,0.08)"/>
        <polygon points="26,10 42,18 42,34 26,42 10,34 10,18" stroke="url(#ft-crest-b)" strokeWidth="0.8" fill="rgba(212,160,23,0.05)" opacity="0.6"/>
        {/* corner tick marks */}
        <line x1="2" y1="14" x2="8" y2="10" stroke="#d4a017" strokeWidth="1" strokeLinecap="round" opacity=".6"/>
        <line x1="50" y1="14" x2="44" y2="10" stroke="#d4a017" strokeWidth="1" strokeLinecap="round" opacity=".6"/>
        <line x1="2" y1="38" x2="8" y2="42" stroke="#d4a017" strokeWidth="1" strokeLinecap="round" opacity=".6"/>
        <line x1="50" y1="38" x2="44" y2="42" stroke="#d4a017" strokeWidth="1" strokeLinecap="round" opacity=".6"/>
      </svg>
      <img
        src="/logo.png"
        alt="DQD Gaming"
        style={{ width: size * 0.5, height: size * 0.5, objectFit: "contain", position: "relative", zIndex: 1, filter: "drop-shadow(0 0 8px rgba(192,132,252,0.7))" }}
      />
    </div>
  );
}

/* Vibranium slash divider — three angular slash lines */
function VibraniumSlash({ color = "rgba(123,47,255,0.5)", width = 44, height = 14 }) {
  const gap = width / 3.5;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      {[0, 1, 2].map((i) => (
        <line key={i} x1={i * gap + 2} y1={height - 1} x2={i * gap + gap - 3} y2={1}
          stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════ */
const SOCIAL = [
  { label: "YouTube",    Icon: YoutubeIcon,   url: "https://www.youtube.com/@DQDGamingHub" },
  { label: "Instagram",  Icon: InstagramIcon, url: "https://www.instagram.com/_dqd_gaming_hub/?hl=en" },
  { label: "Facebook",   Icon: FacebookIcon,  url: "https://www.facebook.com/p/DQD-Gaming-Hub-61575729481294/" },
  { label: "Website",    Icon: GlobeIcon,     url: "https://www.dqdgaming.com" },
  { label: "Email",      Icon: MailIcon,      url: "mailto:dqdgaminghub3003@gmail.com" },
];

// Dashboard section scroll targets — IDs match the id attributes added to UserDashboard
const QUICK_LINKS = [
  { label: "Welcome",    sectionId: "section-welcome"  },
  { label: "Events",     sectionId: "section-events"   },
  { label: "Bookings",   sectionId: "section-bookings" },
  { label: "Games",      sectionId: "section-games"    },
  { label: "Combos",     sectionId: "section-combos"   },
  { label: "Spinner",    sectionId: "section-spinner"  },
  { label: "Streamings", sectionId: "section-streams"  },
];

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

const ACCOUNT_LINKS = [
  { label: "Edit Profile",    href: "/user/profile-settings" },
  { label: "Loyalty Points",  href: "/user/claim-points" },
  { label: "Notifications",   href: "/user/notifications" },
  { label: "Privacy Policy",  href: "/privacy" },
  { label: "Contact Us",      href: "#contact" },
];

/* ══════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ══════════════════════════════════════════════════════ */
const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] } },
});

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const linkVariant = {
  hidden:  { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

/* ══════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════ */
export default function UserFooter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reduceMotion = useReducedMotion();
  const year = new Date().getFullYear();

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono:wght@400&display=swap');

    /* ── Root ── */
    .ft2-root {
      background: ${T.void};
      position: relative;
      overflow: hidden;
      font-family: 'Rajdhani', sans-serif;
      /* Critical: removes the extra space from navbar's body padding */
     
    }

    /* ── Hex grid background texture ── */
    .ft2-hexgrid {
      position: absolute; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        radial-gradient(circle at 18% 0%,  rgba(123,47,255,0.16) 0%, transparent 52%),
        radial-gradient(circle at 84% 90%, rgba(212,160,23,0.09)  0%, transparent 45%),
        radial-gradient(circle at 60% 40%, rgba(212,0,255,0.05)   0%, transparent 38%);
      background-size: 100% 100%;
    }
    .ft2-hexgrid::before {
      content: '';
      position: absolute; inset: 0;
      background-image: repeating-linear-gradient(
        60deg,
        rgba(123,47,255,0.04) 0px, rgba(123,47,255,0.04) 1px,
        transparent 1px, transparent 28px
      ), repeating-linear-gradient(
        -60deg,
        rgba(123,47,255,0.04) 0px, rgba(123,47,255,0.04) 1px,
        transparent 1px, transparent 28px
      );
    }

    /* ── Top shimmer line ── */
    .ft2-topline {
      position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 2;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(123,47,255,0.6) 20%,
        rgba(212,160,23,0.9) 38%,
        rgba(192,132,252,0.8) 55%,
        rgba(212,160,23,0.6) 72%,
        transparent 100%
      );
      background-size: 200% 100%;
      animation: ft2-shimmer 7s linear infinite;
    }
    @keyframes ft2-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .ft2-topline { animation: none; background-position: 0 0; }
    }

    /* ── Top band ── */
    .ft2-band {
      position: relative; z-index: 1;
      display: flex; align-items: center; gap: 14px;
      padding: 14px 32px;
      background: rgba(8,8,18,0.7);
      border-bottom: 1px solid ${T.border};
    }
    .ft2-band-text {
      font-family: 'Orbitron', monospace;
      font-size: clamp(0.52rem, 1vw, 0.6rem);
      font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase;
      color: rgba(212,160,23,0.6);
      white-space: nowrap;
    }
    .ft2-band-rule {
      flex: 1; height: 1px;
      background: linear-gradient(90deg, rgba(123,47,255,0.35), rgba(212,160,23,0.25), transparent);
    }

    /* ── Main grid ── */
    .ft2-main {
      position: relative; z-index: 1;
      max-width: 1000px; margin: 0 auto;
      padding: 44px 32px 36px;
      display: grid;
      grid-template-columns: 1.6fr 1px 1fr 1px 1fr;
      gap: 0 36px;
      align-items: start;
    }
    @media (max-width: 800px) {
      .ft2-main { grid-template-columns: 1fr; gap: 32px 0; padding: 32px 24px 28px; }
      .ft2-vdiv { display: none !important; }
      .ft2-brand { border-bottom: 1px solid ${T.border}; padding-bottom: 28px; }
    }
    @media (max-width: 480px) {
      .ft2-main { padding: 28px 18px 22px; }
      .ft2-band { padding: 12px 18px; }
    }

    /* ── Vertical divider ── */
    .ft2-vdiv {
      width: 1px; align-self: stretch;
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgba(123,47,255,0.4) 20%,
        rgba(212,160,23,0.3) 60%,
        transparent 100%
      );
    }

    /* ── Brand col ── */
    .ft2-brand { padding-right: 8px; }

    .ft2-logo-row {
      display: flex; align-items: center; gap: 14px; margin-bottom: 16px;
    }
    .ft2-wordmark { display: flex; flex-direction: column; gap: 3px; }
    .ft2-wordmark-main {
      font-family: 'Orbitron', monospace;
      font-size: clamp(1.1rem, 2.5vw, 1.4rem);
      font-weight: 900; letter-spacing: 0.2em; line-height: 1;
      background: linear-gradient(120deg, #e2d9f3 0%, #f0c040 42%, #c084fc 100%);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .ft2-wordmark-sub {
      font-family: 'Share Tech Mono', monospace;
      font-size: clamp(0.45rem, 0.9vw, 0.54rem);
      letter-spacing: 0.3em; text-transform: uppercase;
      color: rgba(212,160,23,0.5);
    }

    .ft2-tagline {
      font-family: 'Rajdhani', sans-serif;
      font-size: clamp(0.82rem, 1.5vw, 0.9rem);
      line-height: 1.75; color: ${T.muted};
      max-width: 230px; margin-bottom: 6px;
    }

    .ft2-sep {
      display: flex; align-items: center; gap: 10px;
      margin: 14px 0;
    }
    .ft2-sep-line {
      flex: 1; height: 1px;
      background: linear-gradient(90deg, rgba(212,160,23,0.25), transparent);
    }

    /* ── Social icons ── */
    .ft2-socials { display: flex; gap: 8px; flex-wrap: wrap; }
    .ft2-social-btn {
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(123,47,255,0.1);
      border: 1px solid rgba(123,47,255,0.2);
      color: rgba(212,160,23,0.6);
      text-decoration: none;
      clip-path: polygon(0 12%, 12% 0, 88% 0, 100% 12%, 100% 88%, 88% 100%, 12% 100%, 0 88%);
      transition: background 0.2s, color 0.2s, box-shadow 0.2s, border-color 0.2s;
      position: relative; cursor: pointer;
    }
    .ft2-social-btn:hover {
      background: rgba(212,160,23,0.15);
      color: #e2d9f3;
      border-color: rgba(212,160,23,0.45);
      box-shadow: 0 0 18px rgba(212,160,23,0.28), inset 0 0 8px rgba(212,160,23,0.06);
    }
    .ft2-social-btn:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px rgba(192,132,252,0.65);
    }

    /* ── Nav col ── */
    .ft2-nav-col { padding: 0 4px; }

    .ft2-col-head {
      display: flex; align-items: center; gap: 10px; margin-bottom: 18px;
    }
    .ft2-col-title {
      font-family: 'Orbitron', monospace;
      font-size: clamp(0.52rem, 1vw, 0.6rem);
      font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase;
      color: rgba(212,160,23,0.75);
      white-space: nowrap;
    }
    .ft2-col-rule {
      flex: 1; height: 1px;
      background: linear-gradient(90deg, rgba(123,47,255,0.4), transparent);
    }

    .ft2-links { display: flex; flex-direction: column; gap: 2px; }
    .ft2-link {
      display: flex; align-items: center; gap: 8px;
      font-family: 'Rajdhani', sans-serif;
      font-size: clamp(0.82rem, 1.4vw, 0.9rem);
      font-weight: 500;
      color: ${T.muted};
      background: none; border: none; text-align: left; padding: 6px 0;
      cursor: pointer; text-decoration: none;
      transition: color 0.18s, gap 0.18s, padding-left 0.18s;
      position: relative;
    }
    .ft2-link-arrow {
      color: rgba(123,47,255,0.35);
      flex-shrink: 0;
      transition: color 0.18s, transform 0.18s;
      display: flex; align-items: center;
    }
    .ft2-link:hover { color: #e2d9f3; padding-left: 6px; }
    .ft2-link:hover .ft2-link-arrow { color: ${T.vibrGlow}; transform: translateX(2px); }
    .ft2-link:focus-visible {
      outline: none;
      color: ${T.vibrGlow};
    }

    /* ── Bottom border ── */
    .ft2-border-wrap {
      position: relative; z-index: 1;
      max-width: 1000px; margin: 0 auto; padding: 0 32px;
    }
    .ft2-border-line {
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%, rgba(123,47,255,0.5) 25%,
        rgba(212,160,23,0.6) 50%, rgba(123,47,255,0.5) 75%, transparent 100%
      );
    }
    @media (max-width: 480px) { .ft2-border-wrap { padding: 0 18px; } }

    /* ── Bottom bar ── */
    .ft2-bottom {
      position: relative; z-index: 1;
      max-width: 1000px; margin: 0 auto;
      padding: 18px 32px 20px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 14px; flex-wrap: wrap;
    }
    @media (max-width: 480px) {
      .ft2-bottom { padding: 14px 18px 18px; flex-direction: column; align-items: flex-start; gap: 10px; }
    }

    .ft2-copy {
      font-family: 'Share Tech Mono', monospace;
      font-size: clamp(0.6rem, 1vw, 0.68rem);
      color: ${T.dim}; letter-spacing: 0.04em;
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }
    .ft2-copy-brand {
      background: linear-gradient(90deg, #f0c040, #c084fc);
      -webkit-background-clip: text; background-clip: text; color: transparent;
      font-weight: 600;
    }

    .ft2-status {
      display: flex; align-items: center; gap: 7px;
      font-family: 'Share Tech Mono', monospace;
      font-size: clamp(0.58rem, 1vw, 0.64rem);
      color: ${T.dim}; letter-spacing: 0.06em;
    }
    .ft2-status-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: ${T.purple};
      box-shadow: 0 0 8px ${T.purple}, 0 0 18px rgba(123,47,255,0.4);
      animation: ft2-pip 2.8s ease-in-out infinite;
      flex-shrink: 0;
    }
    @keyframes ft2-pip {
      0%,100% { opacity:1; box-shadow: 0 0 8px ${T.purple}, 0 0 18px rgba(123,47,255,0.4); }
      50%      { opacity:.4; box-shadow: 0 0 4px ${T.purple}; }
    }
    @media (prefers-reduced-motion: reduce) {
      .ft2-status-dot { animation: none; }
    }
  `;

  return (
    <footer className="ft2-root" ref={ref} aria-label="Site footer">
      <style>{css}</style>

      {/* Hex grid texture */}
      <div className="ft2-hexgrid" aria-hidden="true"/>

      {/* Top shimmer line */}
      <div className="ft2-topline" aria-hidden="true"/>

      {/* ── Top band ── */}
      <motion.div
        className="ft2-band"
        variants={fadeUp(0)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <span className="ft2-band-text">DQD</span>
        <div className="ft2-band-rule"/>
        <VibraniumSlash color="rgba(212,160,23,0.5)" width={40} height={13}/>
        <div className="ft2-band-rule" style={{ background: "linear-gradient(90deg, transparent, rgba(212,160,23,0.25), rgba(123,47,255,0.35))" }}/>
        <span className="ft2-band-text">Gaming Arena</span>
      </motion.div>

      {/* ── Main grid ── */}
      <div className="ft2-main">

        {/* Brand */}
        <motion.div
          className="ft2-brand"
          variants={fadeUp(0.05)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <div className="ft2-logo-row">
            <VibraniumCrest size={50}/>
            <div className="ft2-wordmark">
              <span className="ft2-wordmark-main">DQD</span>
              <span className="ft2-wordmark-sub">Gaming Hub</span>
            </div>
          </div>

          <p className="ft2-tagline">
            Kochi's premier gaming arena — book sessions, spin for rewards, and join exclusive member events.
          </p>

          <div className="ft2-sep">
            <VibraniumSlash color="rgba(123,47,255,0.4)" width={32} height={11}/>
            <div className="ft2-sep-line"/>
          </div>

          <motion.div
            className="ft2-socials"
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {SOCIAL.map((s) => (
              <motion.a
                key={s.label}
                className="ft2-social-btn"
                href={s.url}
                aria-label={s.label}
                title={s.label}
                target={s.url.startsWith("mailto:") ? undefined : "_blank"}
                rel={s.url.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                variants={linkVariant}
                whileHover={reduceMotion ? {} : { y: -3, scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <s.Icon/>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        {/* Divider 1 */}
        <div className="ft2-vdiv" aria-hidden="true"/>

        {/* Quick Links — scrolls to dashboard sections */}
        <motion.div
          className="ft2-nav-col"
          variants={fadeUp(0.12)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <div className="ft2-col-head">
            <span className="ft2-col-title">On This Page</span>
            <div className="ft2-col-rule"/>
          </div>
          <motion.nav
            className="ft2-links"
            aria-label="Page sections"
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {QUICK_LINKS.map((l) => (
              <motion.button
                key={l.label}
                className="ft2-link"
                type="button"
                onClick={() => scrollToSection(l.sectionId)}
                aria-label={`Scroll to ${l.label} section`}
                variants={linkVariant}
                whileTap={{ scale: 0.97 }}
              >
                <span className="ft2-link-arrow"><ChevronRightIcon/></span>
                {l.label}
              </motion.button>
            ))}
          </motion.nav>
        </motion.div>

        {/* Divider 2 */}
        <div className="ft2-vdiv" aria-hidden="true"/>

        {/* Account */}
        <motion.div
          className="ft2-nav-col"
          variants={fadeUp(0.18)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <div className="ft2-col-head">
            <span className="ft2-col-title">Account</span>
            <div className="ft2-col-rule"/>
          </div>
          <motion.nav
            className="ft2-links"
            aria-label="Account links"
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {ACCOUNT_LINKS.map((l) => (
              <motion.a
                key={l.label}
                className="ft2-link"
                href={l.href}
                variants={linkVariant}
              >
                <span className="ft2-link-arrow"><ChevronRightIcon/></span>
                {l.label}
              </motion.a>
            ))}
          </motion.nav>
        </motion.div>
      </div>

      {/* ── Divider line ── */}
      <motion.div
        className="ft2-border-wrap"
        variants={fadeUp(0.22)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <div className="ft2-border-line"/>
      </motion.div>

      {/* ── Bottom bar ── */}
      <motion.div
        className="ft2-bottom"
        variants={fadeUp(0.26)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <div className="ft2-copy">
          <VibraniumSlash color="rgba(212,160,23,0.35)" width={24} height={9}/>
          <span>© {year} <span className="ft2-copy-brand">DQD Gaming</span>. All rights reserved.</span>
        </div>

        <div className="ft2-status">
          <div className="ft2-status-dot" aria-hidden="true"/>
          <ZapIcon/>
          All systems operational
        </div>
      </motion.div>
    </footer>
  );
}