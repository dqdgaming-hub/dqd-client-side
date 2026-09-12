import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  CircleHelp,
  Gamepad2,
  Home,
  Info,
  LogIn,
  PackageCheck,
  Radio,
} from 'lucide-react'

const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/games', label: 'Games', icon: Gamepad2 },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/combo-packs', label: 'Combos', icon: PackageCheck },
  { to: '/streaming', label: 'Stream', icon: Radio },
  { to: '/enquiries', label: 'Enquiry', icon: CircleHelp },
  { to: '/aboutus', label: 'About', icon: Info },
  { to: '/sign-in', label: 'Sign In', icon: LogIn },
]

export default function Navbar() {
  const location = useLocation()
  const draggedToggle = useRef(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [brandExpanded, setBrandExpanded] = useState(true)
  const [brandVisible, setBrandVisible] = useState(true)
  const [showMobileAura, setShowMobileAura] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)')
    const syncMobileState = () => {
      setIsMobile(mediaQuery.matches)
      if (!mediaQuery.matches) setMobileOpen(false)
    }

    syncMobileState()
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncMobileState)
    } else {
      mediaQuery.addListener(syncMobileState)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', syncMobileState)
      } else {
        mediaQuery.removeListener(syncMobileState)
      }
    }
  }, [])

  useEffect(() => {
    const collapseTimer = window.setTimeout(() => setBrandExpanded(false), 3000)

    return () => window.clearTimeout(collapseTimer)
  }, [])

  useEffect(() => {
    try {
      setShowMobileAura(window.localStorage.getItem('dqd-mobile-nav-seen') !== 'true')
    } catch {
      setShowMobileAura(true)
    }
  }, [])

  useEffect(() => {
    if (!showMobileAura || !isMobile) return undefined

    const auraTimer = window.setTimeout(() => {
      setShowMobileAura(false)

      try {
        window.localStorage.setItem('dqd-mobile-nav-seen', 'true')
      } catch {
        // Ignore storage failures; the animation can safely return next load.
      }
    }, 5000)

    return () => window.clearTimeout(auraTimer)
  }, [isMobile, showMobileAura])

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updateBrandVisibility = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollY
      const scrollingDown = scrollDelta > 6
      const scrollingUp = scrollDelta < -6
      const nearTop = currentScrollY < 48

      if (nearTop) {
        setBrandVisible(true)
      } else if (scrollingDown) {
        setBrandVisible(false)
      } else if (scrollingUp) {
        setBrandVisible(true)
      }

      lastScrollY = Math.max(currentScrollY, 0)
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateBrandVisibility)
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const vibrate = (pattern = 12) => {
    if (typeof window === 'undefined' || !window.navigator?.vibrate) return
    window.navigator.vibrate(pattern)
  }

  const toggleMobileNav = () => {
    if (draggedToggle.current) {
      draggedToggle.current = false
      return
    }

    vibrate(mobileOpen ? 10 : [12, 32, 18])
    setMobileOpen((open) => !open)
    setShowMobileAura(false)

    try {
      window.localStorage.setItem('dqd-mobile-nav-seen', 'true')
    } catch {
      // Ignore storage failures; the animation can safely return next load.
    }
  }

  return (
    <>
      <style>{`
        .brand-island {
          position: fixed;
          margin-top: 10px;
          top: max(14px, env(safe-area-inset-top));
          left: clamp(12px, 3vw, 24px);
          z-index: 130;
          display: flex;
          align-items: center;
          gap: 0.64rem;
          width: 172px;
          height: 52px;
          max-width: calc(100vw - 24px);
          padding: 0.38rem 0.88rem 0.38rem 0.42rem;
          border: 1px solid rgba(0, 245, 255, 0.24);
          border-radius: 999px;
          background:
            linear-gradient(135deg, rgba(16, 16, 34, 0.9), rgba(7, 7, 18, 0.76)),
            radial-gradient(circle at 20% 20%, rgba(0, 245, 255, 0.22), transparent 38%);
          box-shadow:
            0 14px 38px rgba(0, 0, 0, 0.34),
            0 0 24px rgba(0, 245, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(18px) saturate(1.45);
          overflow: hidden;
          cursor: default;
          transition:
            width 0.42s cubic-bezier(0.22, 1, 0.36, 1),
            padding 0.42s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.28s ease,
            border-color 0.28s ease;
        }

        .brand-island.is-collapsed {
          width: 52px;
          padding-right: 0.38rem;
        }

        .brand-island.is-expanded,
        .brand-island:hover,
        .brand-island:focus-within {
          width: 172px;
          padding-right: 0.88rem;
          border-color: rgba(0, 245, 255, 0.36);
          box-shadow:
            0 16px 44px rgba(0, 0, 0, 0.38),
            0 0 30px rgba(0, 245, 255, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .brand-static {
          display: inline-flex;
          align-items: center;
          gap: 0.64rem;
          width: max-content;
        }

        .brand-logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 24px rgba(0, 245, 255, 0.24);
        }

        .brand-copy {
          display: flex;
          flex-direction: column;
          line-height: 1;
          min-width: 0;
          max-width: 110px;
          opacity: 1;
          transform: translateX(0);
          transition:
            max-width 0.38s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.22s ease,
            transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .brand-island.is-collapsed:not(:hover):not(:focus-within) .brand-copy {
          max-width: 0;
          opacity: 0;
          transform: translateX(-8px);
          pointer-events: none;
        }

        .brand-copy span {
          color: #f4f4ff;
          font-size: 0.84rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .brand-copy small {
          margin-top: 0.28rem;
          color: #00f5ff;
          font-size: 0.54rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .future-tabbar {
          position: fixed;
          left: 50%;
          bottom: max(16px, env(safe-area-inset-bottom));
          translate: -50% 0;
          z-index: 120;
          width: min(820px, calc(100vw - 28px));
          min-height: 70px;
          display: grid;
          grid-template-columns: repeat(8, minmax(58px, 1fr));
          align-items: center;
          gap: 0.28rem;
          padding: 0.42rem;
          border: 1px solid rgba(167, 139, 250, 0.28);
          border-radius: 26px;
          background:
            linear-gradient(135deg, rgba(15, 15, 30, 0.9), rgba(5, 5, 15, 0.74)),
            radial-gradient(circle at 50% 0%, rgba(0, 245, 255, 0.18), transparent 34%),
            radial-gradient(circle at 86% 100%, rgba(255, 45, 120, 0.14), transparent 34%);
          box-shadow:
            0 20px 62px rgba(0, 0, 0, 0.44),
            0 0 38px rgba(0, 245, 255, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.09);
          backdrop-filter: blur(24px) saturate(1.55);
          overflow: hidden;
          transform-origin: center bottom;
        }

        .future-tabbar::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
          transform: translateX(-100%);
          animation: nav-sheen 5s ease-in-out infinite;
        }

        .tabbar-glow {
          position: absolute;
          inset: auto 10% -38px;
          height: 58px;
          background: linear-gradient(90deg, #00f5ff, #a78bfa, #ff2d78);
          opacity: 0.22;
          filter: blur(24px);
          pointer-events: none;
        }

        .tab-item {
          position: relative;
          isolation: isolate;
          height: 56px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.18rem;
          color: #a8a8c6;
          text-decoration: none;
          border-radius: 19px;
          overflow: hidden;
          transition: color 0.22s ease, transform 0.22s ease, background 0.22s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .tab-item::before {
          content: "";
          position: absolute;
          inset: 8px 14px auto;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.56), transparent);
          opacity: 0;
          transition: opacity 0.22s ease;
        }

        .tab-item:hover,
        .tab-item.active {
          color: #00f5ff;
        }

        .tab-item:hover {
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-2px);
        }

        .tab-item:hover::before,
        .tab-item.active::before {
          opacity: 1;
        }

        .tab-active-pill {
          position: absolute;
          inset: 4px;
          z-index: -1;
          border-radius: 17px;
          background:
            linear-gradient(135deg, rgba(0, 245, 255, 0.22), rgba(167, 139, 250, 0.16)),
            rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(0, 245, 255, 0.3);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 26px rgba(0, 245, 255, 0.18);
        }

        .tab-icon {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          color: currentColor;
          line-height: 1;
        }

        .tab-icon svg {
          width: 21px;
          height: 21px;
          stroke-width: 2.25;
        }

        .tab-label {
          max-width: 100%;
          color: currentColor;
          font-size: 0.58rem;
          font-weight: 850;
          letter-spacing: 0.04em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mobile-nav-toggle {
          position: fixed;
          left: 50%;
          bottom: max(14px, env(safe-area-inset-bottom));
          z-index: 140;
          display: none;
          width: 58px;
          height: 58px;
          place-items: center;
          translate: -50% 0;
          color: #00f5ff;
          border: 1px solid rgba(0, 245, 255, 0.36);
          border-radius: 999px;
          background:
            linear-gradient(135deg, rgba(16, 16, 34, 0.94), rgba(6, 6, 18, 0.84)),
            radial-gradient(circle at 50% 15%, rgba(0, 245, 255, 0.28), transparent 45%);
          box-shadow:
            0 18px 48px rgba(0, 0, 0, 0.44),
            0 0 30px rgba(0, 245, 255, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px) saturate(1.5);
          cursor: pointer;
          touch-action: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-nav-toggle:active {
          cursor: grabbing;
        }

        .mobile-nav-toggle.has-aura {
          box-shadow:
            0 18px 48px rgba(0, 0, 0, 0.44),
            0 0 36px rgba(0, 245, 255, 0.32),
            0 0 64px rgba(167, 139, 250, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .mobile-nav-toggle.has-aura::before {
          content: "";
          position: absolute;
          inset: -16px;
          border-radius: inherit;
          pointer-events: none;
          background:
            radial-gradient(circle, rgba(0, 245, 255, 0.22), transparent 62%),
            conic-gradient(from 90deg, transparent, rgba(0, 245, 255, 0.64), rgba(255, 45, 120, 0.46), transparent);
          filter: blur(6px);
          opacity: 0.86;
          animation: mobile-aura-spin 3.2s linear infinite, mobile-aura-pulse 1.7s ease-in-out infinite;
        }

        .mobile-nav-toggle-logo {
          position: relative;
          z-index: 1;
          width: 42px;
          height: 42px;
          object-fit: contain;
          border-radius: 50%;
          filter: drop-shadow(0 0 14px rgba(0, 245, 255, 0.35));
        }

        .mobile-nav-toggle::after {
          content: "";
          position: absolute;
          inset: -7px;
          border-radius: inherit;
          border: 1px solid rgba(0, 245, 255, 0.18);
          opacity: 0.72;
          transform: scale(0.88);
          transition: opacity 0.24s ease, transform 0.24s ease;
        }

        .mobile-nav-toggle:hover::after,
        .mobile-nav-toggle:focus-visible::after {
          opacity: 1;
          transform: scale(1);
        }

        .mobile-nav-toggle:focus-visible {
          outline: 2px solid #00f5ff;
          outline-offset: 5px;
        }

        @keyframes nav-sheen {
          0%, 55% { transform: translateX(-110%); opacity: 0; }
          70% { opacity: 1; }
          100% { transform: translateX(110%); opacity: 0; }
        }

        @keyframes mobile-aura-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes mobile-aura-pulse {
          0%, 100% { opacity: 0.42; scale: 0.88; }
          50% { opacity: 0.95; scale: 1.08; }
        }

        @media (max-width: 980px) {
          .future-tabbar {
            width: min(520px, calc(100vw - 28px));
            grid-template-columns: repeat(4, minmax(0, 1fr));
            min-height: 132px;
            border-radius: 24px;
          }
        }

        @media (max-width: 640px) {
          .brand-island {
            height: 48px;
            padding: 0.32rem 0.78rem 0.32rem 0.36rem;
            width: 158px;
          }

          .brand-island.is-collapsed {
            width: 48px;
            padding-right: 0.36rem;
          }

          .brand-island.is-expanded,
          .brand-island:hover,
          .brand-island:focus-within {
            width: 158px;
            padding-right: 0.78rem;
          }

          .brand-static {
            display: inline-flex;
            align-items: center;
            gap: 0.58rem;
          }

          .brand-logo {
            width: 36px;
            height: 36px;
          }

          .brand-copy span {
            font-size: 0.76rem;
          }

          .brand-copy small {
            font-size: 0.48rem;
          }

          .future-tabbar {
            left: 12px;
            right: 12px;
            bottom: max(82px, calc(env(safe-area-inset-bottom) + 78px));
            translate: 0 0;
            width: auto;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            min-height: 128px;
            border-radius: 22px;
            padding: 0.38rem;
            gap: 0.22rem;
          }

          .future-tabbar.is-closed {
            pointer-events: none;
          }

          .mobile-nav-toggle {
            display: grid;
          }

          .tab-item {
            height: 56px;
            border-radius: 18px;
          }

          .tab-active-pill {
            border-radius: 16px;
          }

          .tab-icon svg {
            width: 20px;
            height: 20px;
          }

          .tab-label {
            font-size: 0.55rem;
          }
        }

        @media (max-width: 380px) {
          .future-tabbar {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            max-height: calc(100vh - 118px);
            overflow-y: auto;
          }

          .tab-item {
            height: 52px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .future-tabbar::before {
            animation: none;
          }

          .tab-item,
          .brand-island,
          .brand-copy,
          .mobile-nav-toggle,
          .mobile-nav-toggle.has-aura,
          .mobile-nav-toggle.has-aura::before {
            transition: none;
            animation: none;
          }
        }
      `}</style>

      <AnimatePresence initial={false}>
        {brandVisible && (
          <motion.div
            className={`brand-island${brandExpanded ? ' is-expanded' : ' is-collapsed'}`}
            onPointerEnter={() => setBrandExpanded(true)}
            onPointerLeave={() => setBrandExpanded(false)}
            onPointerDown={() => setBrandExpanded(true)}
            initial={{ opacity: 0, y: -18, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{
              opacity: 0,
              y: -24,
              scale: 0.88,
              filter: 'blur(12px)',
              transition: { duration: 0.26, ease: [0.4, 0, 0.2, 1] },
            }}
            transition={{ type: 'spring', stiffness: 210, damping: 22 }}
          >
            <div className="brand-static">
              <motion.img
                src="/logo.png"
                alt="DQDGaming"
                className="brand-logo"
                whileHover={{ rotate: -8, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 260, damping: 15 }}
              />
              <div className="brand-copy">
                <span>DQD Gaming</span>
                <small>Gaming Arena</small>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMobile && (
        <motion.button
          type="button"
          className={`mobile-nav-toggle${showMobileAura && !mobileOpen ? ' has-aura' : ''}`}
          aria-label={mobileOpen ? 'Collapse navigation' : 'Expand navigation'}
          aria-expanded={mobileOpen}
          aria-controls="main-tabbar"
          onClick={toggleMobileNav}
          drag
          dragSnapToOrigin
          dragElastic={0.28}
          dragMomentum={false}
          onDragStart={() => {
            draggedToggle.current = true
            setShowMobileAura(false)
            vibrate(8)
          }}
          onDragEnd={(_, info) => {
            const throwPower = Math.hypot(info.velocity.x, info.velocity.y)
            vibrate(throwPower > 650 ? [18, 28, 18] : 10)
            window.setTimeout(() => {
              draggedToggle.current = false
            }, 180)
          }}
          initial={{ opacity: 0, y: 20, scale: 0.82 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ y: -3, scale: 1.05 }}
          whileTap={{ scale: 0.9, cursor: 'grabbing' }}
          whileDrag={{ scale: 1.12, rotate: 8 }}
          transition={{ type: 'spring', stiffness: 420, damping: 12, mass: 0.65 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={mobileOpen ? 'collapse' : 'expand'}
              src="/logo.png"
              alt=""
              className="mobile-nav-toggle-logo"
              initial={{ opacity: 0, y: mobileOpen ? -8 : 8, scale: 0.72 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotate: mobileOpen ? -35 : 0,
              }}
              exit={{ opacity: 0, y: mobileOpen ? 8 : -8, scale: 0.72 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            />
          </AnimatePresence>
        </motion.button>
      )}

      <AnimatePresence initial={false}>
        {(!isMobile || mobileOpen) && (
          <motion.nav
            id="main-tabbar"
            className={`future-tabbar${mobileOpen ? ' is-open' : ' is-closed'}`}
            initial={{ opacity: 0, y: 28, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 24, scale: 0.88, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          >
            <div className="tabbar-glow" />

            {tabs.map((tab, index) => {
              const Icon = tab.icon
              const active =
                tab.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(tab.to)

              return (
                <motion.div
                  key={tab.to}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.025, duration: 0.22 }}
                >
                  <Link
                    to={tab.to}
                    className={`tab-item${active ? ' active' : ''}`}
                    aria-label={tab.label}
                    onClick={() => {
                      if (isMobile) {
                        vibrate(8)
                        setMobileOpen(false)
                      }
                    }}
                  >
                    {active && (
                      <motion.span
                        className="tab-active-pill"
                        layoutId="tab-active-pill"
                        transition={{ type: 'spring', stiffness: 320, damping: 27 }}
                      />
                    )}

                    <motion.span
                      className="tab-icon"
                      animate={{
                        y: active ? -5 : 0,
                        scale: active ? 1.12 : 1,
                      }}
                      whileHover={{ y: -4, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 19 }}
                    >
                      <Icon aria-hidden="true" />
                    </motion.span>

                    <motion.span
                      className="tab-label"
                      animate={{
                        opacity: active ? 1 : 0.72,
                        y: active ? -1 : 0,
                      }}
                      transition={{ duration: 0.18 }}
                    >
                      {tab.label}
                    </motion.span>
                  </Link>
                </motion.div>
              )
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
