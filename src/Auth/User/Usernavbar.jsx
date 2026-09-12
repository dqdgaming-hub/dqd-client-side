import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "framer-motion";
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

const ROUTE_MAP = {
  home:            "/user/dashboard",
  games:           "/user/game-items",
  bookings:        "/user/new-bookings",
  combo:           "/user/combo",
  spinner:           "/user/spinner",
  events_bookings: "/user/events",
  streamings:      "/user/streamings",
  claim:           "/user/claim-points",
};

const NAV_ITEMS = [
  { id: "home",            label: "Home",     icon: HomeIcon    },
  { id: "games",           label: "Games",    icon: GameIcon    },
  { id: "bookings",        label: "Bookings", icon: BookingIcon },
  { id: "combo",           label: "Combo",    icon: ComboIcon,  badge: "HOT" },
  { id: "events_bookings", label: "Events",   icon: EventsIcon  },
  // { id: "spinner",         label: "Spinner",   icon: SpinnerIcon  },
  { id: "streamings",      label: "Stream",   icon: StreamIcon  },
  { id: "claim",           label: "Claim",    icon: ClaimIcon   },
];

/* ══════════════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════════════ */
function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22" fill="none"/>
    </svg>
  );
}
function GameIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 9h10a4 4 0 0 1 3.8 5.3l-1 3A2.5 2.5 0 0 1 17.4 19a2.5 2.5 0 0 1-1.8-.8L14 16H10l-1.6 2.2a2.5 2.5 0 0 1-1.8.8 2.5 2.5 0 0 1-2.4-1.7l-1-3A4 4 0 0 1 7 9z"/>
      <line x1="8" y1="13" x2="12" y2="13"/>
      <line x1="10" y1="11" x2="10" y2="15"/>
      <circle cx="16.5" cy="12.5" r="0.8" fill={active ? "none" : "currentColor"}/>
      <circle cx="18.5" cy="14.5" r="0.8" fill={active ? "none" : "currentColor"}/>
    </svg>
  );
}
function BookingIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"
        fill={active ? "rgba(123,47,255,0.2)" : "none"}/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <polyline points="9 16 11 18 15 14"/>
    </svg>
  );
}
function ComboIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.5 5H22l-6 4.5 2.5 6.5L12 14l-6.5 4L8 11.5 2 7h7.5z"/>
    </svg>
  );
}
function EventsIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
        fill={active ? "rgba(123,47,255,0.2)" : "none"}/>
    </svg>
  );
}
function SpinnerIcon({ active }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer wheel */}
      <circle
        cx="12"
        cy="12"
        r="8"
        fill={active ? "rgba(123,47,255,0.2)" : "none"}
      />

      {/* Center hub */}
      <circle cx="12" cy="12" r="1.8" />

      {/* Spokes */}
      <path d="M12 4v3" />
      <path d="M12 17v3" />
      <path d="M4 12h3" />
      <path d="M17 12h3" />

      <path d="M6.3 6.3l2.1 2.1" />
      <path d="M15.6 15.6l2.1 2.1" />
      <path d="M17.7 6.3l-2.1 2.1" />
      <path d="M8.4 15.6l-2.1 2.1" />
    </svg>
  );
}
function StreamIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"
        fill={active ? "currentColor" : "none"}/>
      <rect x="1" y="5" width="15" height="14" rx="2"
        fill={active ? "rgba(123,47,255,0.2)" : "none"}/>
    </svg>
  );
}
function ClaimIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"
        fill={active ? "rgba(123,47,255,0.2)" : "none"}/>
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  );
}
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
  const [imgError, setImgError] = useState(false);
  const displayName = user?.full_name || user?.email || "Player";
  const initial = displayName?.[0]?.toUpperCase() || "P";
  let imageUrl = user?.profile_image_url || user?.profile_image || "";
  if (imageUrl.includes("/users/users/")) imageUrl = imageUrl.replace("/users/users/", "/users/");
  if (imageUrl && !imageUrl.startsWith("http")) imageUrl = `${API_URL}${imageUrl}`;

  return !imgError && imageUrl ? (
    <img src={imageUrl} alt={displayName} onError={() => setImgError(true)}
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
export default function UserNavbar({ loyaltyPoints = 0, active: activeProp, onNavigate }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  // const active = Object.entries(ROUTE_MAP).find(([, p]) => location.pathname.startsWith(p))?.[0]
  // || activeProp
  // || "home";
  const active =
  Object.entries(ROUTE_MAP)
    .sort(([, a], [, b]) => b.length - a.length)          // longest path first
    .find(([, p]) => location.pathname.startsWith(p))?.[0]
  || activeProp
  || "home";

  const [user,          setUser]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [fetchErr,      setFetchErr]      = useState(false);
  const [dropOpen,      setDropOpen]      = useState(false);
  const [ripples,       setRipples]       = useState([]);
  const [brandExpanded, setBrandExpanded] = useState(true);
  const [brandVisible,  setBrandVisible]  = useState(true);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [isMobile,      setIsMobile]      = useState(false);
  const [showAura,      setShowAura]      = useState(false);
  const draggedToggle = useRef(false);
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

  /* ── mobile detection ───────────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => { setIsMobile(mq.matches); if (!mq.matches) setMobileOpen(false); };
    sync();
    mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);
    return () => mq.removeEventListener ? mq.removeEventListener("change", sync) : mq.removeListener(sync);
  }, []);

  /* ── brand expand then collapse after 3 s ──────── */
  useEffect(() => {
    const t = window.setTimeout(() => setBrandExpanded(false), 3000);
    return () => window.clearTimeout(t);
  }, []);

  /* ── aura hint (first visit) ────────────────────── */
  useEffect(() => {
    try { setShowAura(window.localStorage.getItem("dqd-nav-seen") !== "true"); }
    catch { setShowAura(true); }
  }, []);

  useEffect(() => {
    if (!showAura || !isMobile) return;
    const t = window.setTimeout(() => {
      setShowAura(false);
      try { window.localStorage.setItem("dqd-nav-seen", "true"); } catch {}
    }, 5000);
    return () => window.clearTimeout(t);
  }, [isMobile, showAura]);

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

  /* ── helpers ────────────────────────────────────── */
  const vibrate = (pattern = 12) => {
    if (typeof window === "undefined" || !window.navigator?.vibrate) return;
    window.navigator.vibrate(pattern);
  };

  const handleNav = (id, e) => {
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      setRipples((r) => [...r, { id: `${id}-${Date.now()}`, x: e.clientX - rect.left, y: e.clientY - rect.top, tab: id }]);
    }
    const path = ROUTE_MAP[id];
    if (path) navigate(path);
    onNavigate?.(id);
    setDropOpen(false);
    if (isMobile) { vibrate(8); setMobileOpen(false); }
  };

  const removeRipple = (id) => setRipples((r) => r.filter((rp) => rp.id !== id));

  const toggleMobile = () => {
    if (draggedToggle.current) { draggedToggle.current = false; return; }
    vibrate(mobileOpen ? 10 : [12, 32, 18]);
    setMobileOpen((v) => !v);
    setShowAura(false);
    try { window.localStorage.setItem("dqd-nav-seen", "true"); } catch {}
  };

  const handleEditProfile = () => { setDropOpen(false); navigate("/user/profile-settings"); };

  const displayName = user?.full_name || user?.email || "Player";
  const isAdmin     = user?.role === "admin";
  const pts         = user?.loyalty_points ?? loyaltyPoints;
  const tier        = getTier(pts);
  const xpFill      = Math.min((pts / 1000) * 100, 100);

  /* ── Motion variants ─────────────────────────────── */
  const tabbarVariants = {
    hidden:  { opacity: 0, y: 60, filter: "blur(10px)" },
    visible: {
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: reduceMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 200, damping: 26, staggerChildren: 0.04, delayChildren: 0.12 },
    },
  };
  const tabItemVariants = {
    hidden:  { opacity: 0, y: 20, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: springy({ stiffness: 320, damping: 22 }) },
  };
  const badgeVariants = {
    pulse: reduceMotion
      ? { scale: 1 }
      : { scale: [1, 1.16, 1], transition: { duration: 1.7, repeat: Infinity, ease: "easeInOut" } },
  };
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
    .wk-tab-btn:focus-visible .wk-tab-icon-wrap {
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

    /* ══ BOTTOM TAB BAR ═══════════════════════════════ */
    .wk-tabbar-wrap {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
      display: flex; justify-content: center; align-items: flex-end;
      padding: 0 0 max(10px,env(safe-area-inset-bottom));
      pointer-events: none;
    }
    .wk-tabbar {
      pointer-events: all;
      position: relative;
      display: flex; align-items: center; gap: 0;
      height: var(--tab-h);
      padding: 0 10px;
      width: min(620px, calc(100vw - 28px));
      background:
        linear-gradient(135deg, rgba(8,8,20,0.93), rgba(4,4,14,0.78)),
        radial-gradient(circle at 50% 0%, rgba(123,47,255,0.2), transparent 38%),
        radial-gradient(circle at 88% 100%, rgba(255,45,120,0.12), transparent 36%);
      border: 1px solid rgba(123,47,255,0.32);
      border-radius: 28px;
      backdrop-filter: blur(28px) saturate(1.65);
      box-shadow:
        0 -2px 0 rgba(123,47,255,0.28),
        0 20px 60px rgba(0,0,0,0.85),
        0 0 0 1px rgba(123,47,255,0.04),
        inset 0 1px 0 rgba(192,132,252,0.1);
      overflow: hidden;
    }

    /* sheen sweep */
    .wk-tabbar::before {
      content: '';
      position: absolute; inset: 0;
      border-radius: inherit;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
      transform: translateX(-100%);
      animation: wk-nav-sheen 6s ease-in-out infinite;
      pointer-events: none;
    }
    /* top edge glow line */
    .wk-tabbar::after {
      content: '';
      position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
      background: linear-gradient(90deg,transparent,rgba(123,47,255,0.75) 30%,rgba(212,160,23,0.65) 50%,rgba(168,85,247,0.75) 70%,transparent);
      animation: wk-glow-trace 4s ease-in-out infinite;
      pointer-events: none;
    }

    /* ambient underbow glow */
    .wk-tabbar-glow {
      position: absolute;
      bottom: -24px; left: 10%; right: 10%; height: 48px;
      background: linear-gradient(90deg, var(--wk-cyan), var(--wk-vibr), var(--wk-pink));
      opacity: .18; filter: blur(20px); pointer-events: none;
    }

    /* ── individual tab button ── */
    .wk-tab-btn {
      position: relative; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 4px; flex: 1; height: 100%;
      background: none; border: none; cursor: pointer; padding: 0;
      outline: none; -webkit-tap-highlight-color: transparent;
    }

    /* ripple */
    .wk-tab-ripple { position: absolute; inset: 0; overflow: hidden; border-radius: 16px; pointer-events: none; }
    .wk-tab-ripple-circle {
      position: absolute; width: 50px; height: 50px;
      background: rgba(123,47,255,0.38); border-radius: 50%; pointer-events: none;
    }

    /* icon container */
    .wk-tab-icon-wrap {
      position: relative; width: 48px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 15px; overflow: hidden;
      transition: background .2s;
    }
    .wk-tab-btn:hover .wk-tab-icon-wrap { background: rgba(123,47,255,0.1); }

    /* sliding active fill pill — from Navbar.jsx pattern */
    .wk-tab-active-pill {
      position: absolute; inset: 3px;
      border-radius: 13px; z-index: 0;
      background:
        linear-gradient(135deg, rgba(123,47,255,0.32), rgba(168,85,247,0.2)),
        rgba(255,255,255,0.04);
      border: 1px solid rgba(123,47,255,0.36);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.1),
        0 0 24px rgba(123,47,255,0.3);
    }

    /* gold dot above active icon */
    .wk-tab-dot {
      position: absolute; top: 3px; left: calc(50% - 2px);
      width: 4px; height: 4px; border-radius: 50%;
      background: var(--wk-gold);
      box-shadow: 0 0 6px var(--wk-gold), 0 0 12px rgba(212,160,23,0.5);
    }

    /* icon color & lift animation (from Navbar.jsx) */
    .wk-tab-icon {
      position: relative; z-index: 1;
      color: rgba(226,217,243,0.3);
      transition: color .2s, filter .2s;
      display: flex; align-items: center; justify-content: center;
    }
    .wk-tab-btn:hover .wk-tab-icon { color: rgba(226,217,243,0.7); }
    .wk-tab-btn.wk-active .wk-tab-icon {
      color: var(--wk-vibrG);
      filter: drop-shadow(0 0 7px rgba(192,132,252,0.75));
    }

    /* top highlight line on active icon wrap */
    .wk-tab-icon-wrap::before {
      content: '';
      position: absolute; inset: 8px 14px auto;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(192,132,252,0.6), transparent);
      opacity: 0;
      transition: opacity .22s ease;
    }
    .wk-tab-btn.wk-active .wk-tab-icon-wrap::before { opacity: 1; }

    .wk-tab-label {
      font-family: 'Share Tech Mono', monospace;
      font-size: .46rem; letter-spacing: .1em; text-transform: uppercase;
      color: rgba(226,217,243,0.24); transition: color .2s;
      line-height: 1;
    }
    .wk-tab-btn:hover .wk-tab-label { color: rgba(226,217,243,0.55); }
    .wk-tab-btn.wk-active .wk-tab-label { color: var(--wk-vibrG); }

    /* HOT badge */
    .wk-tab-badge {
      position: absolute; top: 2px; right: 4px;
      font-size: .38rem; font-weight: 700; letter-spacing: .06em;
      padding: .1rem .3rem; border-radius: 999px; text-transform: uppercase;
      background: rgba(212,160,23,0.18); color: var(--wk-goldL);
      border: 1px solid rgba(212,160,23,0.42); line-height: 1.3;
    }

    /* thin separator between tabs */
    .wk-tab-sep {
      width: 1px; height: 20px; flex-shrink: 0;
      background: linear-gradient(180deg,transparent,rgba(123,47,255,0.22),transparent);
    }

    /* ══ MOBILE FAB TOGGLE ════════════════════════════ */
    .wk-mob-toggle {
      position: fixed;
      left: 50%; bottom: max(14px, env(safe-area-inset-bottom));
      translate: -50% 0;
      z-index: 210;
      display: none;
      width: 60px; height: 60px;
      place-items: center;
      color: var(--wk-vibrG);
      border: 1px solid rgba(123,47,255,0.44);
      border-radius: 999px;
      background:
        linear-gradient(135deg, rgba(13,13,31,0.96), rgba(5,5,18,0.88)),
        radial-gradient(circle at 50% 15%, rgba(123,47,255,0.36), transparent 48%);
      box-shadow:
        0 18px 48px rgba(0,0,0,0.55),
        0 0 32px rgba(123,47,255,0.28),
        inset 0 1px 0 rgba(255,255,255,0.1);
      backdrop-filter: blur(20px) saturate(1.5);
      cursor: pointer; touch-action: none; user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .wk-mob-toggle.has-aura {
      box-shadow:
        0 18px 48px rgba(0,0,0,0.55),
        0 0 40px rgba(123,47,255,0.4),
        0 0 70px rgba(192,132,252,0.18),
        inset 0 1px 0 rgba(255,255,255,0.12);
    }
    .wk-mob-toggle.has-aura::before {
      content: '';
      position: absolute; inset: -16px;
      border-radius: inherit; pointer-events: none;
      background:
        radial-gradient(circle, rgba(123,47,255,0.3), transparent 62%),
        conic-gradient(from 90deg, transparent, rgba(192,132,252,0.7), rgba(255,45,120,0.5), transparent);
      filter: blur(6px);
      opacity: .86;
      animation: wk-aura-spin 3.2s linear infinite, wk-aura-pulse 1.7s ease-in-out infinite;
    }
    .wk-mob-logo {
      position: relative; z-index: 1;
      width: 44px; height: 44px; border-radius: 50%;
      object-fit: contain;
      filter: drop-shadow(0 0 14px rgba(123,47,255,0.5));
    }
    .wk-mob-toggle::after {
      content: '';
      position: absolute; inset: -7px;
      border-radius: inherit;
      border: 1px solid rgba(123,47,255,0.22);
      opacity: .7;
      transform: scale(.88);
      transition: opacity .24s ease, transform .24s ease;
    }
    .wk-mob-toggle:hover::after,
    .wk-mob-toggle:focus-visible::after { opacity: 1; transform: scale(1); }
    .wk-mob-toggle:focus-visible { outline: 2px solid var(--wk-vibrG); outline-offset: 5px; }

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
      .wk-mob-toggle { display: grid; }
      .wk-tab-label { display: none; }
      .wk-profile-meta { display: none; }
      .wk-tabbar-wrap {
        bottom: max(84px, calc(env(safe-area-inset-bottom) + 80px));
        padding: 0 12px;
      }
      .wk-tabbar {
        width: 100%; border-radius: 22px; padding: 0 6px;
      }
      .wk-tab-icon-wrap { width: 42px; height: 34px; border-radius: 13px; }
    }
    @media (max-width: 340px) {
      :root { --tab-h: 58px; }
      .wk-tab-btn { min-width: 0; }
      .wk-brand-sub { display: none; }
    }
    @media (min-width: 641px) and (max-width: 899px) {
      :root { --tab-h: 74px; }
    }
    @media (min-width: 900px) {
      :root { --tab-h: 78px; }
      .wk-topbar { padding-right: 32px; }
    }
    @media (min-width: 1200px) {
      .wk-tabbar { padding: 0 16px; }
    }
    @media (max-height: 480px) and (orientation: landscape) {
      :root { --tab-h: 54px; }
      .wk-tab-label { display: none; }
      .wk-tabbar-wrap { padding-bottom: 4px; }
    }
    @media (max-width: 380px) {
      .wk-dropdown { width: calc(100vw - 28px); right: -4px; }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .wk-brand-logo-wrap::before, .wk-brand-logo-wrap::after,
      .wk-tabbar::before, .wk-tabbar::after,
      .wk-drop-header::after, .wk-xp-tier-pill,
      .wk-skel-circle, .wk-skel-line,
      .wk-mob-toggle.has-aura::before { animation: none !important; }
      .wk-brand-copy,
      .wk-brand-island,
      .wk-tab-icon,
      .wk-tab-icon-wrap { transition: none !important; }
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
            onClick={() => handleNav("home")}
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

      {/* ── Mobile FAB toggle ─────────────────────── */}
      {isMobile && (
        <motion.button
          type="button"
          className={`wk-mob-toggle${showAura && !mobileOpen ? " has-aura" : ""}`}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="wk-tabbar"
          onClick={toggleMobile}
          drag
          dragSnapToOrigin
          dragElastic={0.28}
          dragMomentum={false}
          onDragStart={() => { draggedToggle.current = true; setShowAura(false); vibrate(8); }}
          onDragEnd={(_, info) => {
            const power = Math.hypot(info.velocity.x, info.velocity.y);
            vibrate(power > 650 ? [18, 28, 18] : 10);
            window.setTimeout(() => { draggedToggle.current = false; }, 180);
          }}
          initial={{ opacity: 0, y: 20, scale: 0.82 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ y: -3, scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          whileDrag={{ scale: 1.12, rotate: 8 }}
          transition={springy({ stiffness: 420, damping: 12 })}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={mobileOpen ? "open" : "closed"}
              src="/logo.png" alt=""
              className="wk-mob-logo"
              initial={{ opacity: 0, y: mobileOpen ? -8 : 8, scale: 0.72 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: mobileOpen ? -35 : 0 }}
              exit={{ opacity: 0, y: mobileOpen ? 8 : -8, scale: 0.72 }}
              transition={springy({ stiffness: 320, damping: 22 })}
            />
          </AnimatePresence>
        </motion.button>
      )}

      {/* ── Bottom Tab Bar ────────────────────────── */}
      <div className="wk-tabbar-wrap">
        <AnimatePresence initial={false}>
          {(!isMobile || mobileOpen) && (
            <motion.nav
              id="wk-tabbar"
              className="wk-tabbar"
              role="navigation"
              aria-label="Main navigation"
              variants={tabbarVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 24, scale: 0.9, filter: "blur(10px)",
                transition: { duration: reduceMotion ? 0 : 0.22 } }}
            >
              {/* ambient underbow glow */}
              <div className="wk-tabbar-glow" />

              {NAV_ITEMS.map((item, i) => {
                const isActive = active === item.id;
                return (
                  <React.Fragment key={item.id}>
                    {i > 0 && <div className="wk-tab-sep" aria-hidden="true" />}
                    <motion.button
                      className={`wk-tab-btn${isActive ? " wk-active" : ""}`}
                      onClick={(e) => handleNav(item.id, e)}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={item.label}
                      variants={tabItemVariants}
                    >
                      {/* ripple */}
                      <div className="wk-tab-ripple" aria-hidden="true">
                        <AnimatePresence>
                          {ripples.filter((r) => r.tab === item.id).map((r) => (
                            <motion.span
                              key={r.id}
                              className="wk-tab-ripple-circle"
                              style={{ left: r.x - 25, top: r.y - 25 }}
                              initial={{ scale: 0, opacity: 0.5 }}
                              animate={{ scale: 4, opacity: 0 }}
                              transition={{ duration: 0.55, ease: "easeOut" }}
                              onAnimationComplete={() => removeRipple(r.id)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* gold dot indicator */}
                      {isActive && (
                        <motion.div
                          className="wk-tab-dot"
                          layoutId="wk-active-dot"
                          transition={springy({ stiffness: 500, damping: 30 })}
                        />
                      )}

                      {/* icon wrap with sliding pill */}
                      <div className="wk-tab-icon-wrap">
                        {isActive && (
                          <motion.div
                            className="wk-tab-active-pill"
                            layoutId="wk-active-pill"
                            transition={springy({ stiffness: 340, damping: 30 })}
                          />
                        )}

                        {/* icon with lift animation from Navbar.jsx */}
                        <motion.span
                          className="wk-tab-icon"
                          animate={reduceMotion
                            ? undefined
                            : { y: isActive ? -4 : 0, scale: isActive ? 1.12 : 1 }
                          }
                          whileHover={reduceMotion ? undefined : { y: -3, scale: 1.08 }}
                          whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                          transition={springy({ stiffness: 340, damping: 20 })}
                        >
                          <item.icon active={isActive} />
                        </motion.span>

                        {item.badge && (
                          <motion.span
                            className="wk-tab-badge"
                            aria-label={`${item.badge} badge`}
                            variants={badgeVariants}
                            animate="pulse"
                          >
                            {item.badge}
                          </motion.span>
                        )}
                      </div>

                      {/* label with opacity animation */}
                      <motion.span
                        className="wk-tab-label"
                        animate={reduceMotion ? undefined : { opacity: isActive ? 1 : 0.52, y: isActive ? -1 : 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        {item.label}
                      </motion.span>
                    </motion.button>
                  </React.Fragment>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}