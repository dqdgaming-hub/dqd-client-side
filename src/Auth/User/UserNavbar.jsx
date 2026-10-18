import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "framer-motion";
import { CalendarDays, CalendarCheck, Flame, Gamepad2, Home, PackageCheck, Radio, Star } from "lucide-react";
import BottomDock from "../../components/BottomDock";
import LogoutButton from "../LogoutButton";
import { getNavbarProfile } from "../api/userapi";
import { API_URL } from "../../api/axiosInstance";

/* ══════════════════════════════════════════════════════
   DESIGN TOKENS — Vibranium / Wakandan theme
   ══════════════════════════════════════════════════════ */
const T = {
  void:       "#030308",
  obsidian:   "#080812",
  darkSlate:  "#0d0d1f",
  panel:      "rgba(10,10,24,0.97)",
  vibranium:  "#7b2fff",
  vibrLight:  "#a855f7",
  vibrGlow:   "#c084fc",
  vibrFaint:  "rgba(123,47,255,0.15)",
  gold:       "#d4a017",
  goldLight:  "#f0c040",
  goldFaint:  "rgba(212,160,23,0.15)",
  silver:     "#94a3b8",
  text:       "#e2d9f3",
  muted:      "rgba(226,217,243,0.5)",
  dim:        "rgba(226,217,243,0.18)",
  border:     "rgba(123,47,255,0.25)",
  borderGold: "rgba(212,160,23,0.3)",
  cyan:       "#00f5ff",
  pink:       "#ff2d78",
};

// One row, five buttons. Events, combos and streaming sit behind "Deals".
const DOCK_TABS = [
  { to: "/user/dashboard", label: "Home", icon: Home },
  { to: "/user/game-items", label: "Games", icon: Gamepad2, match: ["/user/game-items", "/user/games", "/user/book/game"] },
  { to: "/user/bookings", label: "Bookings", icon: CalendarCheck },
  { key: "deals", label: "Deals", icon: Flame },
  { to: "/user/claim-points", label: "Points", icon: Star },
];
const DOCK_DEALS = [
  { to: "/user/events", label: "Events", hint: "Tournaments & game nights", icon: CalendarDays, tone: "pink" },
  { to: "/user/combo", label: "Combos", hint: "Play time + snacks", icon: PackageCheck, tone: "gold" },
  { to: "/user/streamings", label: "Stream", hint: "Watch & stream", icon: Radio, tone: "cyan" },
];

/* ══════════════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════════════ */
function ProfileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function RetryIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function DiamondIcon()  { return <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 9l10 13L22 9z"/></svg>; }
function ShieldIcon()   { return <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v6c0 5 4 9.3 9 10.3C17 22.3 21 18 21 13V7z"/></svg>; }
function CrownIcon()    { return <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M2 19h20l-2-10-5 5-3-8-3 8-5-5z"/></svg>; }
function ZapIcon()      { return <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
function EmberIcon()    { return <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.2 3-2.6 4.3-2.6 8.2a2.6 2.6 0 0 0 5.2 0c0-.9-.6-1.6-.6-2.5 1.7 1.1 2.6 3 2.6 5a5.6 5.6 0 0 1-11.2 0C4.8 8.2 9.4 6.2 12 2z"/></svg>; }
function MedalIcon()    {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 8.5L5 2H3l4 9" fill="none"/>
      <path d="M15.5 8.5L19 2h2l-4 9" fill="none"/>
      <circle cx="12" cy="14" r="6" fill="currentColor" stroke="none"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   TIER SYSTEM
   ══════════════════════════════════════════════════════ */
const TIERS = [
  { min: 1000, label: "Conquerer", color: T.gold,      glow: "rgba(212,160,23,0.5)",   Icon: MedalIcon   },
  { min: 700,  label: "Ace",       color: T.goldLight, glow: "rgba(240,192,64,0.55)",  Icon: CrownIcon   },
  { min: 500,  label: "Gold",      color: T.vibrGlow,  glow: "rgba(192,132,252,0.45)", Icon: DiamondIcon },
  { min: 100,  label: "Silver",    color: T.vibrLight, glow: "rgba(168,85,247,0.4)",   Icon: ZapIcon     },
  { min: 0,    label: "Bronze",    color: T.vibranium, glow: "rgba(123,47,255,0.35)",  Icon: EmberIcon   },
];
const getTier = (p) => TIERS.find((t) => p >= t.min) ?? TIERS[TIERS.length - 1];


/* ══════════════════════════════════════════════════════
   USER AVATAR
   ══════════════════════════════════════════════════════ */
function UserAvatar({ user, size = 32 }) {
  const [failedImageUrl, setFailedImageUrl] = useState("");
  const displayName = user?.full_name || user?.email || "Player";
  const initial = displayName?.[0]?.toUpperCase() || "P";

  // Same approach as UserProfileSettings: use the value as-is.
  // Only fix up a relative backend path; leave data:/http/blob URLs untouched.
  const rawValue = user?.profile_image_url || user?.profile_image || "";
  let imageUrl = "";
  if (typeof rawValue === "string" && rawValue) {
    if (rawValue.startsWith("data:") || rawValue.startsWith("http") || rawValue.startsWith("blob:")) {
      imageUrl = rawValue;
    } else {
      let fixed = rawValue;
      if (fixed.includes("/users/users/")) fixed = fixed.replace("/users/users/", "/users/");
      imageUrl = `${API_URL}${fixed}`;
    }
  }

  return imageUrl && failedImageUrl !== imageUrl ? (
    <img src={imageUrl} alt={displayName} onError={() => setFailedImageUrl(imageUrl)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block", flexShrink: 0 }}/>
  ) : (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Orbitron', monospace", fontSize: size * 0.38, fontWeight: 700,
      color: T.vibrGlow,
      background: "linear-gradient(135deg, rgba(123,47,255,0.3), rgba(212,160,23,0.15))",
    }}>{initial}</div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
export default function UserNavbar({ loyaltyPoints = 0 }) {
  const navigate  = useNavigate();
  const [user,          setUser]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [fetchErr,      setFetchErr]      = useState(false);
  const [dropOpen,      setDropOpen]      = useState(false);
  const [brandExpanded, setBrandExpanded] = useState(true);
  const [brandVisible,  setBrandVisible]  = useState(true);
  const dropRef       = useRef(null);
  const reduceMotion  = useReducedMotion();

  const springy = (overrides = {}) =>
    reduceMotion
      ? { duration: 0 }
      : { type: "spring", stiffness: 260, damping: 24, ...overrides };

  /* ── fetch profile ──────────────────────────────── */
  const fetchProfile = useCallback(async () => {
    setLoading(true); setFetchErr(false);
    try { const data = await getNavbarProfile(); setUser(data.user); }
    catch { setFetchErr(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /* ── brand expand then collapse after 3 s ──────── */
  useEffect(() => {
    const t = window.setTimeout(() => setBrandExpanded(false), 3000);
    return () => window.clearTimeout(t);
  }, []);

  /* ── scroll-aware brand visibility ─────────────── */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const cur = window.scrollY;
      const delta = cur - lastY;
      if (cur < 48) setBrandVisible(true);
      else if (delta > 6) setBrandVisible(false);
      else if (delta < -6) setBrandVisible(true);
      lastY = Math.max(cur, 0);
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { window.requestAnimationFrame(update); ticking = true; } };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── close dropdown on outside click / Escape ──── */
  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setDropOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const goHome = () => { setDropOpen(false); navigate("/user/dashboard"); };

  const handleEditProfile = () => { setDropOpen(false); navigate("/user/profile-settings"); };

  const displayName = user?.full_name || user?.email || "Player";
  const isAdmin     = user?.role === "admin";
  const pts         = user?.loyalty_points ?? loyaltyPoints;
  const tier        = getTier(pts);
  const xpFill      = Math.min((pts / 1000) * 100, 100);

  /* ── Motion variants ─────────────────────────────── */
  const dropdownVariants = {
    hidden:  { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: springy({ stiffness: 380, damping: 30 }) },
    exit:    { opacity: 0, y: -10, scale: 0.97, transition: { duration: reduceMotion ? 0 : 0.15 } },
  };

  /* ══════════════════════════════════════════════════
     CSS
     ══════════════════════════════════════════════════ */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

    :root {
      --wk-void:   ${T.void};
      --wk-vibr:   ${T.vibranium};
      --wk-vibrL:  ${T.vibrLight};
      --wk-vibrG:  ${T.vibrGlow};
      --wk-gold:   ${T.gold};
      --wk-goldL:  ${T.goldLight};
      --wk-cyan:   ${T.cyan};
      --wk-pink:   ${T.pink};
      --wk-text:   ${T.text};
      --wk-muted:  ${T.muted};
      --wk-border: ${T.border};
      --tab-h:     70px;
      --top-h:     54px;
    }

    @keyframes wk-pulse        { 0%,100%{opacity:.4} 50%{opacity:.85} }
    @keyframes wk-bracket-spin { to{transform:rotate(360deg)} }
    @keyframes wk-glow-trace   { 0%,100%{opacity:.3} 50%{opacity:1} }
    @keyframes wk-scan-h       { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
    @keyframes wk-float        { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
    @keyframes wk-nav-sheen    { 0%,55%{transform:translateX(-110%);opacity:0} 70%{opacity:1} 100%{transform:translateX(110%);opacity:0} }
    @keyframes wk-aura-spin    { to{transform:rotate(360deg)} }
    @keyframes wk-aura-pulse   { 0%,100%{opacity:.42;scale:.88} 50%{opacity:.95;scale:1.08} }

    /* ══ BRAND ISLAND (top-left) ══════════════════════ */
    .wk-brand-island {
      position: fixed;
      top: max(14px, env(safe-area-inset-top));
      left: clamp(12px, 3vw, 24px);
      z-index: 200;
      display: flex;
      align-items: center;
      gap: .64rem;
      width: 178px;
      height: 52px;
      max-width: calc(100vw - 24px);
      padding: .38rem .88rem .38rem .42rem;
      border: 1px solid rgba(123,47,255,0.35);
      border-radius: 999px;
      background:
        linear-gradient(135deg, rgba(13,13,31,0.94), rgba(5,5,18,0.82)),
        radial-gradient(circle at 22% 22%, rgba(123,47,255,0.28), transparent 44%);
      box-shadow:
        0 14px 38px rgba(0,0,0,0.5),
        0 0 28px rgba(123,47,255,0.18),
        inset 0 1px 0 rgba(255,255,255,0.07);
      backdrop-filter: blur(20px) saturate(1.5);
      overflow: hidden;
      cursor: pointer;
      appearance: none; -webkit-appearance: none; font-family: inherit; color: inherit;
      transition:
        width 0.42s cubic-bezier(0.22,1,0.36,1),
        padding 0.42s cubic-bezier(0.22,1,0.36,1),
        box-shadow 0.28s ease,
        border-color 0.28s ease;
    }
    .wk-brand-island.collapsed {
      width: 52px;
      padding-right: .42rem;
    }
    .wk-brand-island:hover,
    .wk-brand-island:focus-within,
    .wk-brand-island.expanded {
      width: 178px;
      padding-right: .88rem;
      border-color: rgba(192,132,252,0.55);
      box-shadow:
        0 16px 44px rgba(0,0,0,0.5),
        0 0 36px rgba(123,47,255,0.3),
        inset 0 1px 0 rgba(255,255,255,0.1);
    }
    .wk-brand-inner { display: inline-flex; align-items: center; gap: .64rem; width: max-content; }

    /* spinning bracket rings around logo */
    .wk-brand-logo-wrap {
      position: relative;
      width: 36px; height: 36px; flex-shrink: 0;
      display: grid; place-items: center;
    }
    .wk-brand-logo-wrap::before {
      content: '';
      position: absolute; inset: -3px;
      border: 1.5px solid transparent;
      border-top-color: rgba(192,132,252,0.9);
      border-right-color: rgba(192,132,252,0.9);
      border-radius: 50%;
      animation: wk-bracket-spin 6s linear infinite;
    }
    .wk-brand-logo-wrap::after {
      content: '';
      position: absolute; inset: -3px;
      border: 1.5px solid transparent;
      border-bottom-color: rgba(212,160,23,0.8);
      border-left-color: rgba(212,160,23,0.8);
      border-radius: 50%;
      animation: wk-bracket-spin 6s linear infinite reverse;
    }
    .wk-brand-logo-img {
      width: 28px; height: 28px;
      border-radius: 50%;
      object-fit: contain;
      position: relative; z-index: 1;
      filter: drop-shadow(0 0 8px rgba(123,47,255,0.9));
      box-shadow: 0 0 16px rgba(0,245,255,0.2);
    }

    .wk-brand-copy {
      display: flex; flex-direction: column; line-height: 1; gap: 2px;
      min-width: 0; max-width: 110px;
      opacity: 1; transform: translateX(0);
      transition:
        max-width 0.38s cubic-bezier(0.22,1,0.36,1),
        opacity 0.22s ease,
        transform 0.38s cubic-bezier(0.22,1,0.36,1);
    }
    .wk-brand-island.collapsed:not(:hover):not(:focus-within) .wk-brand-copy {
      max-width: 0; opacity: 0; transform: translateX(-8px); pointer-events: none;
    }
      
    .wk-brand-title {
      font-family: 'Orbitron', monospace;
      font-size: clamp(.64rem,1.6vw,.76rem);
      font-weight: 900;
      letter-spacing: .18em; text-transform: uppercase;
      background: linear-gradient(90deg, var(--wk-vibrG), var(--wk-goldL));
      -webkit-background-clip: text; background-clip: text; color: transparent;
      white-space: nowrap;
    }
    .wk-brand-sub {
      font-family: 'Share Tech Mono', monospace;
      font-size: .66rem;
      color: rgba(0,245,255,0.55);
      letter-spacing: .18em; text-transform: uppercase;
      white-space: nowrap;
    }

    /* ══ PROFILE CHIP (top-right) ═════════════════════ */
    .wk-topbar {
      position: fixed; top: max(14px, env(safe-area-inset-top));
      left: 0; right: 0; z-index: 200;
      display: flex; align-items: center; justify-content: flex-end;
      padding: 0 clamp(12px,3vw,24px);
      height: var(--top-h);
      pointer-events: none;
    }
    .wk-profile-chip { pointer-events: all; position: relative; }
    .wk-profile-btn {
      display: flex; align-items: center; gap: .5rem;
      padding: .28rem .7rem .28rem .28rem;
      border-radius: 999px; cursor: pointer;
      appearance: none; -webkit-appearance: none; font-family: inherit; color: inherit;
      background: rgba(5,5,18,0.88);
      border: 1px solid rgba(123,47,255,0.3);
      backdrop-filter: blur(20px);
      box-shadow: 0 2px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(123,47,255,0.06);
    }
    .wk-profile-btn.open {
      border-color: rgba(192,132,252,0.6);
      box-shadow: 0 2px 32px rgba(123,47,255,0.3), 0 0 0 1px rgba(123,47,255,0.12);
    }

    /* Focus rings */
    .wk-brand-island:focus-visible,
    .wk-profile-btn:focus-visible,
    .wk-drop-item:focus-visible,
    .wk-drop-retry:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px rgba(192,132,252,0.7);
    }

    /* Hex avatar ring */
    .wk-hex-ring {
      width: 34px; height: 34px; flex-shrink: 0;
      clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
      background: linear-gradient(135deg,rgba(123,47,255,0.65),rgba(212,160,23,0.35));
      padding: 2px;
      display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .wk-hex-inner {
      width: 100%; height: 100%; overflow: hidden;
      clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
      display: flex; align-items: center; justify-content: center;
      background: ${T.obsidian};
    }
    .wk-profile-meta { display: flex; flex-direction: column; gap: 1px; }
    .wk-profile-name {
      font-family: 'Share Tech Mono', monospace; font-size: .62rem;
      letter-spacing: .06em; color: var(--wk-text);
      max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .wk-profile-pts {
      font-family: 'Share Tech Mono', monospace; font-size: .52rem;
      display: flex; align-items: center; gap: .2rem;
    }

    /* Skeleton */
    .wk-skel-pill {
      display: flex; align-items: center; gap: .5rem;
      padding: .28rem .7rem .28rem .28rem;
      background: rgba(123,47,255,0.08);
      border: 1px solid rgba(123,47,255,0.18);
      border-radius: 999px; backdrop-filter: blur(20px);
    }
    .wk-skel-circle {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(123,47,255,0.2); animation: wk-pulse 1.5s infinite;
    }
    .wk-skel-lines { display: flex; flex-direction: column; gap: 4px; }
    .wk-skel-line {
      border-radius: 4px; background: rgba(123,47,255,0.18);
      animation: wk-pulse 1.5s infinite;
    }

    /* ══ DROPDOWN ═════════════════════════════════════ */
    .wk-dropdown {
      position: absolute; top: calc(100% + 12px); right: 0; width: 282px;
      background: rgba(5,5,18,0.99);
      border: 1px solid rgba(123,47,255,0.22);
      border-top: 2px solid rgba(123,47,255,0.6);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.9), 0 0 32px rgba(123,47,255,0.14);
      backdrop-filter: blur(24px); z-index: 300; overflow: hidden;
    }
    .wk-dropdown::after {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--wk-vibr), var(--wk-gold), var(--wk-vibrL));
    }
    .wk-drop-header {
      padding: .9rem 1rem .8rem;
      border-bottom: 1px solid rgba(123,47,255,0.12);
      background: linear-gradient(135deg,rgba(123,47,255,0.06),rgba(10,5,30,0.5),rgba(212,160,23,0.04));
      position: relative; overflow: hidden;
    }
    .wk-drop-header::before {
      content: '';
      position: absolute; top: 0; right: 0;
      width: 52px; height: 52px;
      background: linear-gradient(225deg,rgba(212,160,23,0.1),transparent 60%);
      border-bottom-left-radius: 24px;
    }
    .wk-drop-header::after {
      content: '';
      position: absolute; left: 0; top: 0; width: 100%; height: 2px;
      background: linear-gradient(90deg,transparent,rgba(192,132,252,0.5),transparent);
      animation: wk-scan-h 3.5s ease-in-out infinite;
    }
    .wk-drop-avatar-row { display: flex; align-items: flex-start; gap: .75rem; }
    .wk-drop-avatar-lg {
      width: 52px; height: 52px; flex-shrink: 0;
      clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
      border: 2px solid var(--wk-vibr); box-shadow: 0 0 18px rgba(123,47,255,0.5);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; background: ${T.obsidian};
    }
    .wk-drop-info { flex: 1; min-width: 0; }
    .wk-drop-name {
      font-family: 'Share Tech Mono', monospace; font-size: .68rem;
      letter-spacing: .08em; color: var(--wk-text); line-height: 1.3;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: min(150px,40vw);
    }
    .wk-drop-email {
      font-size: .52rem; color: var(--wk-muted); line-height: 1.4; margin-top: .04rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: min(150px,40vw);
      font-family: 'Share Tech Mono', monospace; letter-spacing: .04em;
    }
    .wk-drop-role-tag {
      display: inline-flex; align-items: center; gap: .2rem;
      font-family: 'Share Tech Mono', monospace;
      font-size: .46rem; letter-spacing: .12em; text-transform: uppercase;
      padding: .16rem .44rem; border-radius: 3px; margin-top: .3rem;
    }
    .wk-drop-role-tag.admin  { background:rgba(212,160,23,0.1);color:var(--wk-goldL);border:1px solid rgba(212,160,23,0.3); }
    .wk-drop-role-tag.member { background:rgba(123,47,255,0.12);color:var(--wk-vibrG);border:1px solid rgba(123,47,255,0.3); }
    .wk-xp-section {
      margin-top: .72rem; padding: .5rem .6rem; border-radius: 8px;
      background: rgba(0,0,0,0.35); border: 1px solid rgba(123,47,255,0.14);
    }
    .wk-xp-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: .32rem; }
    .wk-xp-tier-pill {
      display: inline-flex; align-items: center; gap: .25rem;
      padding: .12rem .42rem; border-radius: 999px;
      font-family: 'Orbitron', monospace; font-size: .44rem; font-weight: 700;
      letter-spacing: .14em; text-transform: uppercase;
      background: rgba(123,47,255,0.12); border: 1px solid rgba(123,47,255,0.3);
      animation: wk-float 3s ease-in-out infinite;
    }
    .wk-xp-pts-val {
      font-family: 'Share Tech Mono', monospace; font-size: .72rem;
      color: var(--wk-goldL); letter-spacing: .04em;
      display: flex; align-items: center; gap: .25rem;
    }
    .wk-xp-track {
      width: 100%; height: 5px; border-radius: 999px;
      background: rgba(123,47,255,0.1); border: 1px solid rgba(123,47,255,0.12); overflow: hidden;
    }
    .wk-xp-fill {
      height: 100%; border-radius: 999px;
      background: linear-gradient(90deg, var(--wk-vibr), var(--wk-vibrG), var(--wk-gold));
      box-shadow: 0 0 8px rgba(123,47,255,0.6);
    }
    .wk-xp-label {
      display: flex; justify-content: space-between; margin-top: .2rem;
      font-family: 'Share Tech Mono', monospace; font-size: .44rem;
      color: var(--wk-muted); letter-spacing: .08em;
    }
    .wk-drop-body { padding: .45rem; }
    .wk-drop-item {
      display: flex; align-items: center; gap: .6rem; width: 100%;
      padding: .58rem .72rem; border-radius: 6px; border: none;
      background: none; cursor: pointer; text-align: left; position: relative;
      font-family: 'Share Tech Mono', monospace; font-size: .58rem;
      letter-spacing: .12em; text-transform: uppercase; color: rgba(226,217,243,0.42);
      transition: background .15s, color .15s, padding-left .18s;
    }
    .wk-drop-item::before {
      content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
      width: 2px; background: var(--wk-vibr); transform: scaleY(0); transition: transform .18s;
    }
    .wk-drop-item:hover { background: rgba(123,47,255,0.07); color: var(--wk-vibrG); padding-left: 1.1rem; }
    .wk-drop-item:hover::before { transform: scaleY(1); }
    .wk-drop-item-icon {
      width: 26px; height: 26px; border-radius: 5px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(123,47,255,0.1); border: 1px solid rgba(123,47,255,0.22);
      opacity: .65; transition: opacity .15s;
    }
    .wk-drop-item:hover .wk-drop-item-icon { opacity: 1; }
    .wk-drop-divider { height: 1px; background: rgba(123,47,255,0.1); margin: .2rem .45rem; }
    .wk-drop-item.logout { color: rgba(248,113,113,0.45); padding: 0; }
    .wk-drop-item.logout::before { background: #f87171; }
    .wk-drop-item.logout .wk-drop-item-icon { background: rgba(248,113,113,0.07); border-color: rgba(248,113,113,0.18); }
    .wk-drop-item.logout:hover { background: rgba(248,113,113,0.05); color: #fca5a5; padding-left: 0; }
    .wk-drop-error { padding: .85rem 1rem; text-align: center; }
    .wk-drop-error-msg { font-family: 'Share Tech Mono', monospace; font-size: .62rem; color: var(--wk-muted); margin-bottom: .5rem; }
    .wk-drop-retry {
      display: inline-flex; align-items: center; gap: .4rem;
      padding: .34rem .75rem; border-radius: 6px; border: 1px solid rgba(123,47,255,0.35);
      background: rgba(123,47,255,0.09); cursor: pointer;
      font-family: 'Share Tech Mono', monospace; font-size: .62rem; letter-spacing: .08em;
      color: var(--wk-vibrG); transition: background .16s, border-color .16s;
    }
    .wk-drop-retry:hover { background: rgba(123,47,255,0.18); border-color: rgba(168,85,247,0.55); }

    /* ══ SAFE-AREA & BODY ═════════════════════════════ */
    @supports (padding: max(0px)) {
      .wk-topbar {
        top: max(14px, env(safe-area-inset-top));
        padding-right: max(clamp(12px,3vw,24px), env(safe-area-inset-right));
      }
    }
    body { padding-top: 0; }

    /* ══ RESPONSIVE ═══════════════════════════════════ */
    @media (max-width: 640px) {
      :root { --tab-h: 64px; }
      .wk-profile-meta { display: none; }
    }
    @media (max-width: 340px) {
      :root { --tab-h: 58px; }
      .wk-brand-sub { display: none; }
    }
    @media (min-width: 641px) and (max-width: 899px) {
      :root { --tab-h: 74px; }
    }
    @media (min-width: 900px) {
      :root { --tab-h: 78px; }
      .wk-topbar { padding-right: 32px; }
    }
    @media (max-height: 480px) and (orientation: landscape) {
      :root { --tab-h: 54px; }
    }
    @media (max-width: 380px) {
      .wk-dropdown { width: calc(100vw - 28px); right: -4px; }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .wk-brand-logo-wrap::before, .wk-brand-logo-wrap::after,
      .wk-drop-header::after, .wk-xp-tier-pill,
      .wk-skel-circle, .wk-skel-line { animation: none !important; }
      .wk-brand-copy,
      .wk-brand-island { transition: none !important; }
    }
  `;

  /* ══════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════ */
  return (
    <LayoutGroup id="wk-user-navbar">
      <style>{css}</style>

      {/* ── Brand Island (top-left, scroll-aware) ─── */}
      <AnimatePresence initial={false}>
        {brandVisible && (
          <motion.button
            type="button"
            className={`wk-brand-island${brandExpanded ? " expanded" : " collapsed"}`}
            onClick={goHome}
            onPointerEnter={() => setBrandExpanded(true)}
            onPointerLeave={() => setBrandExpanded(false)}
            initial={{ opacity: 0, y: -20, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -24, scale: 0.88, filter: "blur(12px)",
              transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] } }}
            transition={springy({ stiffness: 200, damping: 24 })}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="wk-brand-inner">
              <div className="wk-brand-logo-wrap">
                <motion.img
                  src="/logo.png" alt="DQD Gaming"
                  className="wk-brand-logo-img"
                  whileHover={{ rotate: -8, scale: 1.08 }}
                  transition={springy({ stiffness: 280, damping: 16 })}
                />
              </div>
              <div className="wk-brand-copy">
                <span className="wk-brand-title">DQD Gaming</span>
                <span className="wk-brand-sub">Gaming Arena</span>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Top-right: Profile chip ───────────────── */}
      <div className="wk-topbar">
        <div className="wk-profile-chip" ref={dropRef}>
          {loading ? (
            <motion.div className="wk-skel-pill" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="wk-skel-circle" />
              <div className="wk-skel-lines">
                <div className="wk-skel-line" style={{ width: 70, height: 8 }} />
                <div className="wk-skel-line" style={{ width: 44, height: 6, animationDelay: ".2s" }} />
              </div>
            </motion.div>
          ) : (
            <>
              <motion.button
                type="button"
                className={`wk-profile-btn${dropOpen ? " open" : ""}`}
                onClick={() => setDropOpen((v) => !v)}
                aria-haspopup="true" aria-expanded={dropOpen} aria-label="Profile menu"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={springy({ stiffness: 220, damping: 24, delay: reduceMotion ? 0 : 0.1 })}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <div className="wk-hex-ring">
                  <div className="wk-hex-inner">
                    <UserAvatar user={user} size={30} />
                  </div>
                </div>
                <div className="wk-profile-meta">
                  <span className="wk-profile-name">{displayName}</span>
                  <span className="wk-profile-pts" style={{ color: tier.color }}>
                    <tier.Icon />
                    <AnimatePresence>
                      <motion.span
                        key={pts}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={springy({ stiffness: 320, damping: 22 })}
                        style={{ display: "inline-flex", alignItems: "center", gap: ".2rem" }}
                      >
                        {pts.toLocaleString()} · {tier.label}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </div>
                <motion.span
                  style={{ color: T.muted, display: "flex", alignItems: "center", marginLeft: ".1rem" }}
                  animate={{ rotate: dropOpen ? 180 : 0 }}
                  transition={springy({ stiffness: 300, damping: 22 })}
                >
                  <ChevronIcon />
                </motion.span>
              </motion.button>

              {/* Dropdown */}
              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    className="wk-dropdown"
                    role="menu"
                    variants={dropdownVariants}
                    initial="hidden" animate="visible" exit="exit"
                  >
                    {fetchErr ? (
                      <div className="wk-drop-error">
                        <div className="wk-drop-error-msg">Profile unavailable</div>
                        <motion.button className="wk-drop-retry" onClick={fetchProfile}
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
                          <RetryIcon /> Retry
                        </motion.button>
                      </div>
                    ) : (
                      <>
                        <div className="wk-drop-header">
                          <div className="wk-drop-avatar-row">
                            <div className="wk-drop-avatar-lg"><UserAvatar user={user} size={48} /></div>
                            <div className="wk-drop-info">
                              <div className="wk-drop-name">{displayName}</div>
                              {user?.email && <div className="wk-drop-email">{user.email}</div>}
                              <div className={`wk-drop-role-tag ${isAdmin ? "admin" : "member"}`}>
                                {isAdmin ? <ShieldIcon /> : <CrownIcon />}
                                {isAdmin ? "Admin" : "Member"}
                              </div>
                            </div>
                          </div>
                          <div className="wk-xp-section">
                            <div className="wk-xp-top">
                              <div className="wk-xp-tier-pill" style={{ color: tier.color, boxShadow: `0 0 10px ${tier.glow}` }}>
                                <tier.Icon />{tier.label}
                              </div>
                              <div className="wk-xp-pts-val">
                                <tier.Icon />
                                <AnimatePresence>
                                  <motion.span
                                    key={pts}
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 4 }}
                                    transition={springy({ stiffness: 320, damping: 22 })}
                                  >
                                    {pts.toLocaleString()}
                                  </motion.span>
                                </AnimatePresence>
                                <span style={{ fontSize: ".44rem", color: T.muted, letterSpacing: ".06em" }}>PTS</span>
                              </div>
                            </div>
                            <div className="wk-xp-track">
                              <motion.div
                                className="wk-xp-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${xpFill}%` }}
                                transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: "easeOut" }}
                              />
                            </div>
                            <div className="wk-xp-label"><span>0</span><span>Conquerer: 1000</span></div>
                          </div>
                        </div>
                        <div className="wk-drop-body">
                          <motion.button className="wk-drop-item" role="menuitem"
                            onClick={handleEditProfile} whileTap={{ scale: 0.98 }}>
                            <span className="wk-drop-item-icon"><ProfileIcon /></span>
                            Edit Profile
                          </motion.button>
                          <div className="wk-drop-divider" />
                          <div className="wk-drop-item logout" role="menuitem">
                            <span className="wk-drop-item-icon" style={{ marginLeft: ".72rem" }}><LogoutIcon /></span>
                            <LogoutButton style={{
                              flex: 1, textAlign: "left", padding: ".58rem .72rem .58rem 0",
                              background: "none", border: "none", cursor: "pointer",
                              fontFamily: "'Share Tech Mono', monospace",
                              fontSize: ".58rem", letterSpacing: ".12em",
                              textTransform: "uppercase", color: "inherit",
                            }} />
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* ── Bottom dock: same 5-button bar as the public site ── */}
      <BottomDock tabs={DOCK_TABS} deals={DOCK_DEALS} label="Player" />
    </LayoutGroup>
  );
}