import React from "react";
import Navbar from './Navbar'
import Footer from './Footer'
import PageLoader from '../Loader/PageLoader'
import HeroSlider from "./home/HeroSlider";
import EventSection from "./home/EventSection";
import ComboSection from "./home/ComboSection";
import CategorySection from "./home/CategorySection";
import StatsSection from "./home/StatsSection";
import AboutSection from "./home/AboutSection";
import MapAndEnquiry from './home/MapAndEnquiry'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: #05040A;
    color: #e2d9f3;
    font-family: 'Rajdhani', 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* ── Scrollbar ─────────────────────────────────── */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #05040A; }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #7A2CFF, #D4AF37);
    border-radius: 999px;
  }

  /* ── Layout shell ──────────────────────────────── */
  .dqd-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #05040A;
    position: relative;
    overflow-x: hidden;
  }

  /* fixed noise grain overlay */
  .dqd-layout::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.022;
    pointer-events: none;
    z-index: 0;
  }

  /* global dot-grid background */
  .dqd-layout::after {
    content: '';
    position: fixed; inset: 0;
    background-image: radial-gradient(circle, rgba(185,194,217,1) 1px, transparent 1px);
    background-size: 30px 30px;
    opacity: 0.028;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Main content area ─────────────────────────── */
  .dqd-main {
    flex: 1;
    position: relative;
    z-index: 1;
    background: transparent;
  }

  /* ── Section spacing ───────────────────────────── */
  .dqd-main > * {
    position: relative;
  }

  /* subtle top-border glow on each section */
  .dqd-main > * + * {
    border-top: 1px solid rgba(122, 44, 255, 0.1);
  }

  /* ── Ambient orbs (fixed, behind everything) ───── */
  .dqd-orb {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(90px);
  }
  .dqd-orb-1 {
    width: min(560px, 80vw); height: min(560px, 80vw);
    top: -12%; left: -8%;
    background: radial-gradient(circle, rgba(122,44,255,0.14) 0%, transparent 70%);
  }
  .dqd-orb-2 {
    width: min(440px, 70vw); height: min(440px, 70vw);
    top: 40%; right: -6%;
    background: radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%);
  }
  .dqd-orb-3 {
    width: min(380px, 65vw); height: min(380px, 65vw);
    bottom: 10%; left: 15%;
    background: radial-gradient(circle, rgba(0,245,255,0.05) 0%, transparent 70%);
  }

  /* ── Global section padding utility ───────────── */
  .dqd-section {
    padding: clamp(48px, 7vw, 96px) clamp(16px, 5vw, 80px);
  }

  /* ── Horizontal rule between sections ─────────── */
  .dqd-hr {
    border: none;
    height: 1px;
    margin: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(122,44,255,0.35) 25%,
      rgba(212,175,55,0.28) 50%,
      rgba(122,44,255,0.35) 75%,
      transparent
    );
  }

  /* ── Utility: clip-path chamfer ────────────────── */
  .clip-sm  { clip-path: polygon(0 0, calc(100% - 8px)  0, 100% 8px,  100% 100%, 8px  100%, 0 calc(100% - 8px));  }
  .clip-md  { clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px)); }
  .clip-lg  { clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px)); }

  /* ── Typography resets ─────────────────────────── */
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Orbitron', monospace;
    color: #F4D886;
    line-height: 1.1;
  }
  p { line-height: 1.6; }
  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; }
  img { display: block; max-width: 100%; }

  /* ── Selection highlight ───────────────────────── */
  ::selection {
    background: rgba(122,44,255,0.38);
    color: #F4D886;
  }

  /* ── Focus rings ───────────────────────────────── */
  :focus-visible {
    outline: 2px solid rgba(192,132,252,0.7);
    outline-offset: 3px;
  }

  /* ── Reduced motion ────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
    html { scroll-behavior: auto; }
  }

  /* ── Responsive base ───────────────────────────── */
  @media (max-width: 640px) {
    .dqd-section { padding: clamp(32px, 6vw, 56px) clamp(14px, 4vw, 24px); }
  }
`;

/**
 * Layout — Home shell
 *
 * While `homeData` hasn't arrived yet (or the browser is offline),
 * the PageLoader (full-screen overlay with playable mini-games) is
 * shown on top of the shell. The shell and its sections stay mounted
 * underneath so the page is ready the moment loading finishes and
 * the overlay fades out.
 */
export default function Layout({ homeData }) {
  /* ── Network status ─────────────────────────────────────
     If the browser goes offline (or was already offline on
     mount), treat that the same as isLoading and keep the
     PageLoader overlay up. Content underneath stays mounted
     so the page is ready the instant connectivity returns. */
  const [isOffline, setIsOffline] = React.useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  React.useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const isLoading = !homeData;
  const showLoader = isLoading || isOffline;

  // Content underneath renders against a safe fallback shape while
  // homeData is still loading, so it stays mounted (not unmounted/
  // remounted) once real data arrives — same as the overlay pattern.
  const data = homeData || {};

  return (
    <>
      <style>{CSS}</style>

      {/* ambient background orbs */}
      <div className="dqd-orb dqd-orb-1" aria-hidden="true" />
      <div className="dqd-orb dqd-orb-2" aria-hidden="true" />
      <div className="dqd-orb dqd-orb-3" aria-hidden="true" />

      <div className="dqd-layout">
        <Navbar />

        <main className="dqd-main">
          <HeroSlider banners={data.banners} />
          <hr className="dqd-hr" />
          <EventSection events={data.events} />
          <hr className="dqd-hr" />
          <ComboSection combos={data.combo_packs} />
          <hr className="dqd-hr" />
          <CategorySection categories={data.categories} />
          <hr className="dqd-hr" />
          <StatsSection stats={data.stats} />
          <hr className="dqd-hr" />
          <AboutSection stats={data.stats} />
          <hr className="dqd-hr" />
          <MapAndEnquiry />
        </main>

        <Footer />
      </div>

      {/* Full-screen overlay — sits above everything (z-index: 9999)
          while content underneath stays mounted and ready.
          Shows while homeData hasn't loaded yet OR when the browser
          detects the device has gone offline. */}
      {showLoader && <PageLoader isOffline={isOffline} />}
    </>
  );
}