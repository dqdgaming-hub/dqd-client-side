import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminapi";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Users", to: "/admin/users" },
  { label: "Categories", to: "/admin/categories" },
  { label: "Games", to: "/admin/games" },
  { label: "Combo Packs", to: "/admin/combo-packs" },
  { label: "Events", to: "/admin/events" },
  
  { label: "Event Bookings",       to: "/admin/event-bookings" },


  { label: "Bookings",       to: "/admin/bookings" },
  


  { label: "Spinner & Rewards",    to: "/admin/happy-hour" },
  
  { label: "Loyalty Points", to: "/admin/loyalty" },
  { label: "Happy Hours", to: "/admin/happy-hour-slot-allocating" },
  { label: "Bookings & Revenue", to: "/admin/accounting" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

  :root {
    --cp-void:    #05050f;
    --cp-cyan:    #00ffe1;
    --cp-pink:    #ff006e;
    --cp-yellow:  #f5ff00;
    --cp-text:    #e0f8ff;
    --nav-h:      64px;
  }

  /* ─────────────────────────────────────────────────────
     NAVBAR SHELL
  ───────────────────────────────────────────────────── */
  .adm-navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    height: var(--nav-h);
    display: flex;
    align-items: center;
    padding: 0 28px;
    gap: 0;
    background: rgba(3, 3, 14, 0.97);
    backdrop-filter: blur(24px);
    flex-shrink: 0;
    font-family: 'Share Tech Mono', monospace;

    /* neon border bottom */
    border-bottom: 1px solid transparent;
    border-image: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0,255,225,0.35) 20%,
      rgba(0,255,225,0.55) 50%,
      rgba(255,0,110,0.25) 80%,
      transparent 100%
    ) 1;

    /* scanline texture */
    background-image: repeating-linear-gradient(
      0deg,
      rgba(0,255,225,0.012) 0px,
      rgba(0,255,225,0.012) 1px,
      transparent 1px,
      transparent 4px
    );
  }

  /* Ambient glow bar under the border */
  .adm-navbar::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: -1px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0,255,225,0.25) 30%,
      rgba(0,255,225,0.45) 50%,
      rgba(0,255,225,0.25) 70%,
      transparent
    );
    filter: blur(2px);
    pointer-events: none;
  }

  /* ─────────────────────────────────────────────────────
     BRAND
  ───────────────────────────────────────────────────── */
  .adm-brand {
    display: flex;
    align-items: center;
    gap: 11px;
    text-decoration: none;
    margin-right: 28px;
    flex-shrink: 0;
  }

  .adm-brand-logo-wrap {
    position: relative;
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
  }

  /* rotating corner bracket behind logo */
  .adm-brand-logo-wrap::before {
    content: '';
    position: absolute;
    inset: -3px;
    border: 1.5px solid transparent;
    border-top-color: rgba(0,255,225,0.7);
    border-right-color: rgba(0,255,225,0.7);
    border-radius: 3px;
    animation: adm-bracket-spin 6s linear infinite;
  }

  .adm-brand-logo-wrap::after {
    content: '';
    position: absolute;
    inset: -3px;
    border: 1.5px solid transparent;
    border-bottom-color: rgba(255,0,110,0.5);
    border-left-color: rgba(255,0,110,0.5);
    border-radius: 3px;
    animation: adm-bracket-spin 6s linear infinite reverse;
  }

  @keyframes adm-bracket-spin {
    to { transform: rotate(360deg); }
  }

  .adm-brand-logo {
    width: 24px;
    height: 24px;
    object-fit: contain;
    filter: drop-shadow(0 0 8px rgba(0,255,225,0.8));
    position: relative;
    z-index: 1;
  }

  .adm-brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1;
    gap: 3px;
  }

  .adm-brand-text strong {
    font-family: 'Orbitron', monospace;
    font-size: 0.78rem;
    font-weight: 900;
    letter-spacing: 0.22em;
    color: transparent;
    background: linear-gradient(90deg, var(--cp-cyan) 0%, rgba(0,255,225,0.7) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    text-transform: uppercase;
    text-shadow: none;
  }

  .adm-brand-text small {
    font-size: 0.44rem;
    color: rgba(255,0,110,0.55);
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  /* ─────────────────────────────────────────────────────
     DIVIDER
  ───────────────────────────────────────────────────── */
  .adm-nav-div {
    width: 1px;
    height: 28px;
    background: linear-gradient(
      180deg,
      transparent,
      rgba(0,255,225,0.3) 40%,
      rgba(0,255,225,0.3) 60%,
      transparent
    );
    margin-right: 20px;
    flex-shrink: 0;
  }

  /* ─────────────────────────────────────────────────────
     NAV LINKS
  ───────────────────────────────────────────────────── */
  .adm-navlinks {
    display: flex;
    align-items: center;
    gap: 0;
    flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .adm-navlinks::-webkit-scrollbar { display: none; }

  .adm-navlink {
    position: relative;
    display: flex;
    align-items: center;
    height: var(--nav-h);
    padding: 0 14px;
    font-size: 0.8rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(224,248,255,0.3);
    text-decoration: none;
    white-space: nowrap;
    transition: color 0.2s;
    flex-shrink: 0;
    gap: 6px;
  }

  /* glitch-prefix decoration */
  .adm-navlink::before {
    content: '>';
    color: rgba(0,255,225,0.2);
    font-size: 0.55rem;
    transition: color 0.2s, transform 0.2s;
  }

  /* bottom neon bar */
  .adm-navlink::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 14px;
    right: 14px;
    height: 2px;
    background: linear-gradient(90deg, var(--cp-cyan), rgba(0,255,225,0.4));
    box-shadow: 0 0 8px var(--cp-cyan), 0 0 16px rgba(0,255,225,0.4);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s cubic-bezier(0.22,1,0.36,1);
  }

  .adm-navlink:hover {
    color: rgba(224,248,255,0.75);
  }

  .adm-navlink:hover::before {
    color: rgba(0,255,225,0.6);
    transform: translateX(2px);
  }

  .adm-navlink.active {
    color: var(--cp-cyan);
  }

  .adm-navlink.active::before {
    color: var(--cp-cyan);
  }

  .adm-navlink.active::after {
    transform: scaleX(1);
  }

  /* ─────────────────────────────────────────────────────
     PING DOT — live indicator
  ───────────────────────────────────────────────────── */
  .adm-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--cp-cyan);
    box-shadow: 0 0 6px var(--cp-cyan);
    flex-shrink: 0;
    animation: adm-ping 2s ease-in-out infinite;
    margin-left: 8px;
  }

  @keyframes adm-ping {
    0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--cp-cyan); }
    50%       { opacity: 0.4; box-shadow: 0 0 2px var(--cp-cyan); }
  }

  /* ─────────────────────────────────────────────────────
     USER BOX
  ───────────────────────────────────────────────────── */
  .adm-userbox {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    margin-left: 16px;
    padding-left: 16px;
    border-left: 1px solid rgba(0,255,225,0.12);
    flex-shrink: 0;
    cursor: pointer;
    user-select: none;
  }

  .adm-userbox-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  /* avatar hex clip */
  .adm-avatar {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    background: rgba(0,255,225,0.07);
    border: 1.5px solid rgba(0,255,225,0.3);
    border-radius: 8px;
    color: var(--cp-cyan);
    font-family: 'Orbitron', monospace;
    font-size: 0.72rem;
    font-weight: 800;
    flex-shrink: 0;
    transition: border-color 0.2s, box-shadow 0.2s;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    overflow: hidden;
  }

  .adm-userbox:hover .adm-avatar,
  .adm-userbox.open .adm-avatar {
    border-color: rgba(0,255,225,0.7);
    box-shadow: 0 0 12px rgba(0,255,225,0.3);
  }

  .adm-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .adm-user-meta {
    display: grid;
    gap: 2px;
    min-width: 110px;
    max-width: 180px;
  }

  .adm-user-meta strong,
  .adm-user-meta small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .adm-user-meta strong {
    color: var(--cp-text);
    font-size: 0.64rem;
    letter-spacing: 0.08em;
  }

  .adm-user-meta small {
    font-size: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    /* role pill */
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: rgba(0,255,225,0.6);
  }

  .adm-user-meta small::before {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--cp-cyan);
    box-shadow: 0 0 4px var(--cp-cyan);
    flex-shrink: 0;
  }

  .adm-chevron {
    width: 12px;
    height: 12px;
    color: rgba(0,255,225,0.35);
    flex-shrink: 0;
    transition: transform 0.22s, color 0.2s;
  }

  .adm-userbox.open .adm-chevron {
    transform: rotate(180deg);
    color: var(--cp-cyan);
  }

  /* ─────────────────────────────────────────────────────
     DROPDOWN
  ───────────────────────────────────────────────────── */
  .adm-dropdown {
    position: absolute;
    top: calc(100% + 14px);
    right: 0;
    min-width: 200px;
    background: rgba(5, 5, 20, 0.98);
    border: 1px solid rgba(0,255,225,0.14);
    border-top: 2px solid rgba(0,255,225,0.5);
    box-shadow:
      0 0 0 1px rgba(0,255,225,0.04),
      0 16px 40px rgba(0,0,0,0.85),
      0 0 24px rgba(0,255,225,0.06);
    backdrop-filter: blur(24px);
    clip-path: inset(0 0 100% 0);
    opacity: 0;
    pointer-events: none;
    transition: clip-path 0.24s cubic-bezier(0.22,1,0.36,1), opacity 0.2s ease;
  }

  .adm-userbox.open .adm-dropdown {
    clip-path: inset(0 0 0% 0);
    opacity: 1;
    pointer-events: auto;
  }

  /* corner accent */
  .adm-dropdown::before {
    content: '';
    position: absolute;
    top: -1px; right: 14px;
    width: 8px; height: 8px;
    border-top: 2px solid rgba(0,255,225,0.5);
    border-left: 2px solid rgba(0,255,225,0.5);
  }

  .adm-dropdown-header {
    padding: 13px 15px 11px;
    border-bottom: 1px solid rgba(0,255,225,0.08);
    background: rgba(0,255,225,0.025);
  }

  .adm-dropdown-header strong {
    display: block;
    color: var(--cp-text);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .adm-dropdown-header small {
    display: block;
    color: rgba(0,255,225,0.45);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.48rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-top: 4px;
  }

  .adm-dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 11px 15px;
    background: none;
    border: none;
    color: rgba(224,248,255,0.45);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, padding-left 0.18s;
    position: relative;
  }

  /* left accent on hover */
  .adm-dropdown-item::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 2px;
    background: var(--cp-cyan);
    transform: scaleY(0);
    transition: transform 0.18s;
  }

  .adm-dropdown-item:hover {
    background: rgba(0,255,225,0.045);
    color: var(--cp-cyan);
    padding-left: 20px;
  }

  .adm-dropdown-item:hover::before {
    transform: scaleY(1);
  }

  .adm-dropdown-item svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    opacity: 0.65;
    transition: opacity 0.15s;
  }

  .adm-dropdown-item:hover svg { opacity: 1; }

  .adm-dropdown-item.danger {
    color: rgba(255,0,110,0.45);
    border-top: 1px solid rgba(255,0,110,0.07);
  }

  .adm-dropdown-item.danger::before {
    background: var(--cp-pink);
  }

  .adm-dropdown-item.danger:hover {
    background: rgba(255,0,110,0.04);
    color: var(--cp-pink);
  }

  /* ─────────────────────────────────────────────────────
     RESPONSIVE
  ───────────────────────────────────────────────────── */
  @media (max-width: 900px) {
    .adm-user-meta { display: none; }
  }

  @media (max-width: 768px) {
    .adm-navbar   { padding: 0 14px; }
    .adm-brand    { margin-right: 12px; }
    .adm-nav-div  { margin-right: 10px; }
    .adm-navlink  { padding: 0 9px; font-size: 0.56rem; }
    .adm-userbox  { margin-left: 8px; padding-left: 8px; }
  }
`;

function getInitials(user) {
  const source = user?.full_name || user?.email || "A";
  return source.trim().charAt(0).toUpperCase();
}

function getDisplayName(user) {
  return user?.full_name?.trim() || user?.email || "Admin";
}

function getAvatar(user) {
  return user?.profile_image_url || user?.profile_image || null;
}

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [navbarUser, setNavbarUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userboxRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    adminApi
      .getNavbarProfile()
      .then((data) => { if (mounted) setNavbarUser(data.user); })
      .catch((error) => {
        if (error.status === 401 || error.status === 403) {
          adminApi.logout();
          navigate("/sign-in", { replace: true });
        }
      });
    return () => { mounted = false; };
  }, [navigate]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (userboxRef.current && !userboxRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await adminApi.logout();
    navigate("/sign-in", { replace: true });
  };

  const handleEditProfile = () => {
    setDropdownOpen(false);
    navigate("/edit-profile"); 
  };

  const avatarSrc = getAvatar(navbarUser);

  return (
    <>
      <style>{css}</style>
      <header className="adm-navbar">

        {/* ── Brand ── */}
        <Link to="/admin/dashboard" className="adm-brand">
          <div className="adm-brand-logo-wrap">
            <img src="/logo.png" alt="DQD" className="adm-brand-logo" />
          </div>
          <div className="adm-brand-text">
            <strong>DQD</strong>
            <small>Admin Panel</small>
          </div>
        </Link>

        <div className="adm-nav-div" />

        {/* ── Nav links ── */}
        <nav className="adm-navlinks" aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "adm-navlink active" : "adm-navlink"
              }
            >
              {item.label}
            </NavLink>
          ))}
          {/* Live indicator */}
          <span className="adm-live-dot" title="System online" />
        </nav>

        {/* ── User box ── */}
        <div
          ref={userboxRef}
          className={`adm-userbox${dropdownOpen ? " open" : ""}`}
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <div className="adm-avatar" aria-hidden="true">
            {avatarSrc
              ? <img src={avatarSrc} alt="" />
              : getInitials(navbarUser)
            }
          </div>

          <div className="adm-user-meta">
            <strong>{getDisplayName(navbarUser)}</strong>
            <small>{navbarUser?.role || "admin"}</small>
          </div>

          <svg className="adm-chevron" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
          </svg>

          {/* ── Dropdown ── */}
          <div className="adm-dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="adm-dropdown-header">
              <strong>{getDisplayName(navbarUser)}</strong>
              <small>{navbarUser?.email || "admin@dqd.com"}</small>
            </div>

            <button className="adm-dropdown-item" type="button" onClick={handleEditProfile}>
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M11.5 2.5a1.414 1.414 0 012 2L5 13H3v-2L11.5 2.5z"
                  stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              Edit Profile
            </button>

            <button className="adm-dropdown-item danger" type="button" onClick={handleLogout}>
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"
                  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </div>
        </div>

      </header>
    </>
  );
}