import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  Flame,
  Gamepad2,
  Home,
  LayoutDashboard,
  LogIn,
  PackageCheck,
  Radio,
} from 'lucide-react'
import BottomDock from './BottomDock'

// Bottom dock: one row, five buttons on every screen size.
// "Deals" opens a small panel with Events and Combo packs.
// About Us and Enquiry live in the footer.
const DEALS = [
  { to: '/events', label: 'Events', hint: 'Tournaments & game nights', icon: CalendarDays, tone: 'pink' },
  { to: '/combo-packs', label: 'Combos', hint: 'Play time + snacks, one price', icon: PackageCheck, tone: 'gold' },
]

export default function Navbar() {
  const [brandExpanded, setBrandExpanded] = useState(true)
  const [brandVisible, setBrandVisible] = useState(true)

  const signedIn = typeof window !== 'undefined' && !!window.localStorage.getItem('access_token')
  const isAdmin = signedIn && window.localStorage.getItem('user_role') === 'admin'
  const account = signedIn
    ? { to: isAdmin ? '/admin/dashboard' : '/user/dashboard', label: 'My Hub', icon: LayoutDashboard, accent: true }
    : { to: '/sign-in', label: 'Sign In', icon: LogIn, accent: true }

  const tabs = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/games', label: 'Games', icon: Gamepad2 },
    { key: 'deals', label: 'Deals', icon: Flame },
    { to: '/streaming', label: 'Stream', icon: Radio },
    account,
  ]

  /* Brand pill: open on load, then tuck into the logo */
  useEffect(() => {
    const id = window.setTimeout(() => setBrandExpanded(false), 3000)
    return () => window.clearTimeout(id)
  }, [])

  /* Brand pill hides while scrolling down, comes back when scrolling up */
  useEffect(() => {
    let last = window.scrollY
    let ticking = false
    const update = () => {
      const y = window.scrollY
      if (y < 48 || y - last < -6) setBrandVisible(true)
      else if (y - last > 6) setBrandVisible(false)
      last = Math.max(y, 0)
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update)
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        .brand-island {
          position: relative; display: flex; align-items: center; gap: .64rem; width: 172px; height: 52px; max-width: calc(100vw - 24px);
          padding: .38rem .88rem .38rem .42rem; border: 1px solid rgba(0,245,255,.24); border-radius: 999px;
          background: linear-gradient(135deg, rgba(16,16,34,.9), rgba(7,7,18,.76)), radial-gradient(circle at 20% 20%, rgba(0,245,255,.22), transparent 38%);
          box-shadow: 0 14px 38px rgba(0,0,0,.34), 0 0 24px rgba(0,245,255,.1), inset 0 1px 0 rgba(255,255,255,.08);
          backdrop-filter: blur(18px) saturate(1.45); -webkit-backdrop-filter: blur(18px) saturate(1.45);
          overflow: hidden; text-decoration: none;
          transition: width .42s cubic-bezier(.22,1,.36,1), padding .42s cubic-bezier(.22,1,.36,1), box-shadow .28s, border-color .28s;
        }
.brand-wrap { position: fixed; top: max(14px, env(safe-area-inset-top)); left: clamp(12px, 3vw, 24px); z-index: 130; }
        .brand-island.is-collapsed { width: 52px; padding-right: .38rem; }
        .brand-island.is-expanded, .brand-island:hover, .brand-island:focus-visible {
          width: 172px; padding-right: .88rem; border-color: rgba(0,245,255,.36);
          box-shadow: 0 16px 44px rgba(0,0,0,.38), 0 0 30px rgba(0,245,255,.16), inset 0 1px 0 rgba(255,255,255,.1);
        }
        .brand-logo { flex: none; width: 40px; height: 40px; object-fit: contain; border-radius: 50%;
          background: rgba(255,255,255,.06); box-shadow: 0 0 24px rgba(0,245,255,.24); }
        .brand-copy { display: flex; flex-direction: column; line-height: 1; min-width: 0; max-width: 110px;
          transition: max-width .38s cubic-bezier(.22,1,.36,1), opacity .22s, transform .38s cubic-bezier(.22,1,.36,1); }
        .brand-island.is-collapsed:not(:hover):not(:focus-visible) .brand-copy { max-width: 0; opacity: 0; transform: translateX(-8px); }
        .brand-copy span { color: #f4f4ff; font-family: 'Orbitron', sans-serif; font-size: .78rem; font-weight: 900; letter-spacing: .06em; white-space: nowrap; }
        .brand-copy small { margin-top: .3rem; color: #00f5ff; font-size: .54rem; letter-spacing: .16em; text-transform: uppercase; white-space: nowrap; }

        @media (prefers-reduced-motion: reduce) {
          .brand-island, .brand-copy { transition: none; }
        }
      `}</style>

      <AnimatePresence initial={false}>
        {brandVisible && (
          <motion.div
            key="brand"
            className="brand-wrap"
            initial={{ opacity: 0, y: -18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.88, transition: { duration: 0.24 } }}
            transition={{ type: 'spring', stiffness: 210, damping: 22 }}
          >
            <Link
              to="/"
              className={`brand-island${brandExpanded ? ' is-expanded' : ' is-collapsed'}`}
              onPointerEnter={() => setBrandExpanded(true)}
              onPointerLeave={() => setBrandExpanded(false)}
              aria-label="DQD Gaming home"
            >
              <motion.img src="/logo.png" alt="" className="brand-logo" whileHover={{ rotate: -8, scale: 1.08 }} />
              <span className="brand-copy">
                <span>DQD Gaming</span>
                <small>Gaming Arena</small>
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomDock tabs={tabs} deals={DEALS} />
    </>
  )
}
