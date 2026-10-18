import React from "react";
import UserNavbar from "./UserNavbar";
import UserFooter from "./UserFooter";
import PageLoader from "../../Loader/PageLoader";

/**
 * UserLayout — Arena shell
 *
 * Provides the ambient backdrop (glow orbs, grain grid, floating
 * diamond particles, pulsing top trace) shared across every page,
 * then renders the navbar / page content / footer on top of it.
 *
 * While `isLoading` is true, the PageLoader (full-screen overlay with
 * a playable racing game) is shown on top of the shell. The shell and
 * its children stay mounted underneath so the page is ready the moment
 * loading finishes and the overlay fades out.
 *
 * Props:
 *  user          : { full_name, email, … }
 *  loyaltyPoints : number
 *  activePage    : string
 *  onNavigate    : (pageId: string) => void
 *  isLoading     : boolean — show the PageLoader overlay
 *  children      : React.ReactNode
 */
export default function UserLayout({
  user,
  loyaltyPoints = 0,
  activePage = "home",
  onNavigate,
  isLoading = false,
  children,
}) {
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

  const showLoader = isLoading || isOffline;

  const css = `
    :root {
      --void:    #05050f;
      --purple:  #00ffe1;
      --purpleL: #68fff0;
      --purpleP: #e0f8ff;
      --fuchsia: #ff006e;
      --violet:  #7b2fff;
      --border:  rgba(0,255,225,0.18);
    }

    *, *::before, *::after { box-sizing: border-box; }

    /* ── Shell ──────────────────────────────────────────── */
    .ul-shell {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--void);
      position: relative;
      overflow-x: hidden;
      isolation: isolate;
    }

    /* ── Ambient glow orbs ──────────────────────────────── */
    .ul-bg-glow {
      position: fixed; inset: 0; pointer-events: none; z-index: -3;
      background:
        radial-gradient(ellipse 55% 42% at 10% 0%,   rgba(0,255,225,0.14), transparent 60%),
        radial-gradient(ellipse 45% 35% at 92% 8%,   rgba(255,0,110,0.08), transparent 55%),
        radial-gradient(ellipse 42% 30% at 50% 100%, rgba(123,47,255,0.10),  transparent 55%);
    }

    /* ── grain texture ────────────────────────────────── */
    .ul-grid {
      position: fixed; inset: 0; pointer-events: none; z-index: -2;
      background-image: radial-gradient(circle, rgba(0,255,225,0.05) 1px, transparent 1px);
      background-size: 32px 32px;
    }

    /* ── Pulsing top trace ──────────────────────────────── */
    .ul-trace {
      position: fixed; top: 0; left: 0; right: 0; height: 2px;
      z-index: 250; pointer-events: none;
      background: linear-gradient(90deg,
        transparent 0%, var(--purple) 20%, var(--fuchsia) 50%, var(--purpleL) 80%, transparent 100%);
      animation: ulTrace 4s ease-in-out infinite;
      filter: blur(0.4px);
    }
    @keyframes ulTrace { 0%,100% { opacity: .35; } 50% { opacity: 1; } }

    /* ── Floating Arena particles ──────────────────── */
    .ul-particles {
      position: fixed; inset: 0; pointer-events: none; z-index: -1; overflow: hidden;
    }
    .ul-particle {
      position: absolute;
      background: var(--pc, rgba(0,255,225,0.45));
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
      animation: ulFloat var(--dur, 9s) linear infinite;
      animation-delay: var(--del, 0s);
    }
    @keyframes ulFloat {
      0%   { opacity: 0;   transform: translateY(100vh) rotate(0deg); }
      10%  { opacity: .55; }
      90%  { opacity: .25; }
      100% { opacity: 0;   transform: translateY(-40px) rotate(180deg); }
    }

    /* ── Foreground ─────────────────────────────────────── */
    .ul-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 1;
    }
    .ul-content { flex: 1; }
  `;

  /* Generate floating diamond particles — purple / fuchsia / violet mix */
  const particles = React.useMemo(() => {
    const colors = [
      "rgba(0,255,225,0.5)",  // purple
      "rgba(255,0,110,0.4)", // fuchsia
      "rgba(104,255,240,0.45)", // purpleL
    ];
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${3 + Math.random() * 4}px`,
      color: colors[Math.floor(Math.random() * colors.length)],
      dur: `${8 + Math.random() * 12}s`,
      del: `-${Math.random() * 12}s`,
    }));
  }, []);

  return (
    <>
      <style>{css}</style>

      <div className="ul-bg-glow" aria-hidden="true" />
      <div className="ul-grid" aria-hidden="true" />
      <div className="ul-trace" aria-hidden="true" />
      <div className="ul-particles" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="ul-particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              "--pc": p.color,
              "--dur": p.dur,
              "--del": p.del,
            }}
          />
        ))}
      </div>

      <div className="ul-shell">
        <UserNavbar
          user={user}
          loyaltyPoints={user?.loyalty_points ?? 0}
          active={activePage}
          onNavigate={onNavigate}
        />
        <div className="ul-main">
          <main className="ul-content">{children}</main>
          <UserFooter />
        </div>
      </div>

      {/* Full-screen overlay — sits above everything (z-index: 9999)
          while content underneath stays mounted and ready.
          Shows on explicit isLoading OR when the browser detects
          the device has gone offline. */}
      {showLoader && <PageLoader isOffline={isOffline} />}
    </>
  );
}