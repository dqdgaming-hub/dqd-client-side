import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

// Bottom dock shared by the public site and the signed-in user area:
// one row of five buttons on every screen size. A tab with `key: 'deals'`
// opens a small panel above the dock with the `deals` links.
//
//   tabs  – [{ to, label, icon, match? }] or { key: 'deals', label, icon }
//   deals – [{ to, label, hint, icon, tone: 'pink' | 'gold' | 'cyan' }]

const isActivePath = (pathname, to) => (to === '/' ? pathname === '/' : pathname.startsWith(to))

const MOBILE_QUERY = '(max-width: 640px)'
const SEEN_KEY = 'dqd-nav-seen'

export default function BottomDock({ tabs, deals = [], label = 'Main' }) {
  const location = useLocation()
  const [dealsOpen, setDealsOpen] = useState(false)
  // Phones: the bar folds into the logo button; bigger screens keep it open.
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches)
  const [open, setOpen] = useState(false)
  const [aura, setAura] = useState(() => {
    try {
      return window.localStorage.getItem(SEEN_KEY) !== 'true'
    } catch {
      return true
    }
  })
  const dockRef = useRef(null)
  const dragged = useRef(false)
  const dealsActive = deals.some((d) => isActivePath(location.pathname, d.to))
  const showBar = !isMobile || open

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const sync = () => setIsMobile(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /* First visit on a phone: the logo glows for a few seconds to say "tap me" */
  useEffect(() => {
    if (!aura || !isMobile) return undefined
    const id = window.setTimeout(() => {
      setAura(false)
      try {
        window.localStorage.setItem(SEEN_KEY, 'true')
      } catch {
        /* storage blocked: the hint simply shows again next time */
      }
    }, 5000)
    return () => window.clearTimeout(id)
  }, [aura, isMobile])

  /* Close the deals panel (and the folded bar on phones) on outside tap, Escape or scroll */
  useEffect(() => {
    if (!dealsOpen && !open) return undefined
    const close = () => {
      setDealsOpen(false)
      setOpen(false)
    }
    const onDown = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) close()
    }
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close)
    }
  }, [dealsOpen, open])

  const buzz = (pattern = 8) => window.navigator?.vibrate?.(pattern)

  const toggle = () => {
    if (dragged.current) {
      dragged.current = false
      return
    }
    buzz(open ? 10 : [12, 32, 18])
    setOpen((o) => !o)
    setDealsOpen(false)
    setAura(false)
    try {
      window.localStorage.setItem(SEEN_KEY, 'true')
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <style>{`
        /* ── Bottom dock ── */
        .dock-wrap { position: fixed; left: 50%; bottom: max(12px, env(safe-area-inset-bottom)); translate: -50% 0; z-index: 120;
          width: min(560px, calc(100vw - 20px)); }
        .dock { position: relative; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 4px; padding: 6px;
          border: 1px solid rgba(167,139,250,.28); border-radius: 26px; overflow: hidden;
          background: linear-gradient(135deg, rgba(15,15,30,.92), rgba(5,5,15,.82)),
            radial-gradient(circle at 50% 0%, rgba(0,245,255,.18), transparent 40%), radial-gradient(circle at 86% 100%, rgba(255,45,120,.14), transparent 40%);
          box-shadow: 0 20px 60px rgba(0,0,0,.5), 0 0 38px rgba(0,245,255,.12), inset 0 1px 0 rgba(255,255,255,.09);
          backdrop-filter: blur(22px) saturate(1.5); -webkit-backdrop-filter: blur(22px) saturate(1.5); }
        .dock::before { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent); transform: translateX(-110%);
          animation: dock-sheen 6s ease-in-out infinite; }
        @keyframes dock-sheen { 0%, 60% { transform: translateX(-110%); } 100% { transform: translateX(110%); } }
        .dock-item { position: relative; isolation: isolate; height: 56px; min-width: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px; border: 0; border-radius: 20px; background: transparent;
          color: #a8a8c6; text-decoration: none; cursor: pointer; font: inherit; -webkit-tap-highlight-color: transparent;
          transition: color .22s, background .22s; }
        .dock-item:hover { color: #e6fbff; background: rgba(255,255,255,.04); }
        .dock-item.active { color: #00f5ff; }
        .dock-item:focus-visible { outline: 2px solid #00f5ff; outline-offset: -2px; }
        .dock-pill { position: absolute; inset: 2px; z-index: -1; border-radius: 18px; border: 1px solid rgba(0,245,255,.3);
          background: linear-gradient(135deg, rgba(0,245,255,.22), rgba(167,139,250,.16)), rgba(255,255,255,.05);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 0 26px rgba(0,245,255,.18); }
        .dock-icon { display: grid; place-items: center; width: 26px; height: 26px; }
        .dock-icon svg { width: 21px; height: 21px; stroke-width: 2.2; }
        .dock-label { max-width: 100%; font-size: .62rem; font-weight: 800; letter-spacing: .05em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dock-item.deals { color: #ffb36b; }
        .dock-item.deals.active, .dock-item.deals.open { color: #ffd60a; }
        .dock-flame { position: absolute; top: 5px; right: calc(50% - 22px); width: 8px; height: 8px; border-radius: 50%;
          background: #ff2d78; box-shadow: 0 0 10px #ff2d78; animation: dock-ping 1.8s ease-out infinite; }
        @keyframes dock-ping { 0% { box-shadow: 0 0 0 0 rgba(255,45,120,.7); } 100% { box-shadow: 0 0 0 9px rgba(255,45,120,0); } }
        .dock-chev { position: absolute; top: 4px; left: 50%; translate: -50% 0; opacity: .7; transition: transform .3s; }
        .dock-item.open .dock-chev { transform: rotate(180deg); }
        .dock-item.account:not(.active) .dock-icon { color: #00f5ff; }

        /* ── Deals panel ── */
        .deals-panel { position: absolute; left: 0; right: 0; bottom: calc(100% + 10px); display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          padding: 10px; border-radius: 24px; border: 1px solid rgba(255,214,10,.28); transform-origin: 50% 100%;
          background: linear-gradient(160deg, rgba(22,18,40,.96), rgba(8,8,20,.96));
          box-shadow: 0 24px 60px rgba(0,0,0,.55), 0 0 40px rgba(255,140,0,.12);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .deals-panel::after { content: ""; position: absolute; bottom: -7px; left: 50%; width: 14px; height: 14px; translate: -50% 0; rotate: 45deg;
          background: rgba(8,8,20,.96); border-right: 1px solid rgba(255,214,10,.28); border-bottom: 1px solid rgba(255,214,10,.28); }
        .deal-card { --tone: #ff2d78; position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 6px; padding: 14px;
          border-radius: 18px; text-decoration: none; color: #fff; border: 1px solid color-mix(in srgb, var(--tone) 40%, transparent);
          background: radial-gradient(circle at 85% 15%, color-mix(in srgb, var(--tone) 30%, transparent), transparent 60%), rgba(255,255,255,.03);
          transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s; }
        .deal-card.gold { --tone: #ffd60a; }
        .deal-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,.4), 0 0 24px color-mix(in srgb, var(--tone) 30%, transparent); }
        .deal-card.active { box-shadow: inset 0 0 0 1px var(--tone); }
        .deal-ico { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 12px; color: var(--tone);
          background: color-mix(in srgb, var(--tone) 14%, transparent); }
        .deal-card b { font-family: 'Orbitron', sans-serif; font-size: .9rem; letter-spacing: .06em; }
        .deal-card small { color: #a8a8c6; font-size: .72rem; line-height: 1.35; padding-right: 16px; }
        .deal-go { position: absolute; right: 12px; bottom: 12px; color: var(--tone); font-size: 1rem; transition: transform .25s; }
        .deal-card:hover .deal-go { transform: translateX(3px); }

        @media (max-width: 380px) {
          .dock-item { height: 54px; }
          .dock-label { font-size: .58rem; }
          .deal-card { padding: 12px; }
        }
        .deal-card.cyan { --tone: #00f5ff; }

        /* Phones: logo button; the bar opens above it */
        .dock-fab { position: fixed; left: 50%; bottom: max(14px, env(safe-area-inset-bottom)); z-index: 140; width: 60px; height: 60px;
          margin-left: -30px; display: grid; place-items: center; padding: 0; border-radius: 50%; cursor: pointer;
          border: 1px solid rgba(0,245,255,.4); touch-action: none; user-select: none; -webkit-tap-highlight-color: transparent;
          background: linear-gradient(135deg, rgba(16,16,34,.95), rgba(6,6,18,.88)), radial-gradient(circle at 50% 15%, rgba(0,245,255,.3), transparent 45%);
          box-shadow: 0 18px 48px rgba(0,0,0,.5), 0 0 30px rgba(0,245,255,.25), inset 0 1px 0 rgba(255,255,255,.12);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .dock-fab img { position: relative; z-index: 1; width: 44px; height: 44px; object-fit: contain; border-radius: 50%;
          filter: drop-shadow(0 0 14px rgba(0,245,255,.4)); pointer-events: none; }
        .dock-fab::after { content: ""; position: absolute; inset: -7px; border-radius: inherit; border: 1px solid rgba(0,245,255,.22);
          animation: dock-breathe 2.6s ease-in-out infinite; }
        @keyframes dock-breathe { 0%, 100% { transform: scale(.9); opacity: .4; } 50% { transform: scale(1.05); opacity: 1; } }
        .dock-fab.is-open { border-color: rgba(255,45,120,.55); box-shadow: 0 18px 48px rgba(0,0,0,.5), 0 0 30px rgba(255,45,120,.3); }
        .dock-fab.has-aura::before { content: ""; position: absolute; inset: -16px; border-radius: inherit; pointer-events: none;
          background: radial-gradient(circle, rgba(0,245,255,.22), transparent 62%), conic-gradient(from 90deg, transparent, rgba(0,245,255,.64), rgba(255,45,120,.46), transparent);
          filter: blur(6px); animation: dock-aura 3.2s linear infinite; }
        @keyframes dock-aura { to { transform: rotate(360deg); } }
        .dock-fab:focus-visible { outline: 2px solid #00f5ff; outline-offset: 5px; }
        .dock-wrap.folded { bottom: calc(max(14px, env(safe-area-inset-bottom)) + 74px); transform-origin: 50% 100%; }
        .deals-panel.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .deals-panel.three .deal-card { padding: 12px 10px; }
        .deals-panel.three .deal-card small { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .dock::before, .dock-flame, .dock-fab::after, .dock-fab.has-aura::before { animation: none; }
        }
      `}</style>

      <div ref={dockRef}>
        {isMobile && (
          <motion.button
            type="button"
            className={`dock-fab${aura && !open ? ' has-aura' : ''}${open ? ' is-open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="dock-bar"
            onClick={toggle}
            drag
            dragSnapToOrigin
            dragElastic={0.28}
            dragMomentum={false}
            onDragStart={() => {
              dragged.current = true
              setAura(false)
              buzz(8)
            }}
            onDragEnd={() =>
              window.setTimeout(() => {
                dragged.current = false
              }, 180)
            }
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            whileDrag={{ scale: 1.12, rotate: 8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 14 }}
          >
            <motion.img
              src="/logo.png"
              alt=""
              animate={{ rotate: open ? -35 : 0, scale: open ? 0.9 : 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            />
          </motion.button>
        )}
        <AnimatePresence initial={false}>
          {showBar && (
            <motion.div
              key="dock"
              id="dock-bar"
              className={`dock-wrap${isMobile ? ' folded' : ''}`}
              initial={{ opacity: 0, y: 30, scale: isMobile ? 0.85 : 1, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 24, scale: 0.85, filter: 'blur(8px)', transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            >
              <AnimatePresence>
                {dealsOpen && (
                  <motion.div
                    className={`deals-panel${deals.length > 2 ? ' three' : ''}`}
                    id="deals-panel"
                    initial={{ opacity: 0, y: 16, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.94, transition: { duration: 0.16 } }}
                    transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                  >
                    {deals.map((d, i) => {
                      const Icon = d.icon
                      return (
                        <motion.div
                          key={d.to}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 + i * 0.06 }}
                        >
                          <Link
                            to={d.to}
                            className={`deal-card ${d.tone}${isActivePath(location.pathname, d.to) ? ' active' : ''}`}
                            onClick={() => {
                              setDealsOpen(false)
                              setOpen(false)
                            }}
                          >
                            <span className="deal-ico">
                              <Icon size={20} aria-hidden="true" />
                            </span>
                            <b>{d.label}</b>
                            {d.hint && <small>{d.hint}</small>}
                            <span className="deal-go" aria-hidden="true">
                              →
                            </span>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <nav className="dock" aria-label={label}>
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isDeals = tab.key === 'deals'
                  const active = isDeals ? dealsActive : (tab.match || [tab.to]).some((p) => isActivePath(location.pathname, p))
                  const inner = (
                    <>
                      {(isDeals ? dealsOpen || active : active) && (
                        <motion.span
                          className="dock-pill"
                          layoutId={`dock-pill-${label}`}
                          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                        />
                      )}
                      {isDeals && !dealsOpen && <span className="dock-flame" aria-hidden="true" />}
                      {isDeals && <ChevronUp size={11} className="dock-chev" aria-hidden="true" />}
                      <motion.span
                        className="dock-icon"
                        animate={{ y: active ? -2 : 0, scale: active ? 1.12 : 1 }}
                        whileTap={{ scale: 0.86 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 19 }}
                      >
                        <Icon aria-hidden="true" />
                      </motion.span>
                      <span className="dock-label">{tab.label}</span>
                    </>
                  )
                  if (isDeals) {
                    return (
                      <button
                        key="deals"
                        type="button"
                        className={`dock-item deals${active ? ' active' : ''}${dealsOpen ? ' open' : ''}`}
                        aria-expanded={dealsOpen}
                        aria-controls="deals-panel"
                        onClick={() => {
                          buzz(dealsOpen ? 8 : [10, 30, 14])
                          setDealsOpen((o) => !o)
                        }}
                      >
                        {inner}
                      </button>
                    )
                  }
                  return (
                    <Link
                      key={tab.to}
                      to={tab.to}
                      className={`dock-item${active ? ' active' : ''}${tab.accent ? ' account' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => {
                        buzz()
                        setDealsOpen(false)
                        setOpen(false)
                      }}
                    >
                      {inner}
                    </Link>
                  )
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
