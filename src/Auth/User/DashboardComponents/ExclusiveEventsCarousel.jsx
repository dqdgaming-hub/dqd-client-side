import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  gold:       "#C9A84C",
  goldLight:  "#E8CC80",
  goldDim:    "rgba(201,168,76,0.18)",
  goldBorder: "rgba(201,168,76,0.35)",
  white:      "#FFFFFF",
  offWhite:   "rgba(255,255,255,0.88)",
  muted:      "rgba(255,255,255,0.52)",
  faint:      "rgba(255,255,255,0.12)",
  bg:         "#080808",
  serif:      "'Cormorant Garamond', 'Georgia', serif",
  sans:       "'DM Sans', system-ui, sans-serif",
};

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const CalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const SaveIcon = ({ saved }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

// ─── Normalizer ───────────────────────────────────────────────────────────────
function normalizeEvent(ev, idx) {
  return {
    id:          ev.id ?? idx,
    title:       ev.title || ev.event_title || "Upcoming Event",
    date:        ev.date || ev.event_date || "",
    image:       ev.image || ev.event_image || ev.cover || "",
    description: ev.description || ev.summary || "",
    place:       ev.place || ev.location || ev.venue || "",
    tag:         ev.tag || ev.category || ev.type || "Event",
  };
}

// ─── Lazy Image ───────────────────────────────────────────────────────────────
function LazyImage({ src, alt, style }) {
  const [state, setState] = useState(src ? "loading" : "error");
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) { setState("error"); return; }
    setState("loading");
    const img = new Image();
    img.src = src;
    img.onload  = () => setState("loaded");
    img.onerror = () => setState("error");
    return () => { img.onload = null; img.onerror = null; };
  }, [src]);

  return (
    <div style={{ position: "absolute", inset: 0, ...style }}>
      {/* Placeholder shimmer */}
      {state === "loading" && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(110deg, #111 25%, #1a1a1a 50%, #111 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.6s infinite linear",
        }} />
      )}
      {/* Error fallback — abstract geometric pattern */}
      {state === "error" && (
        <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="400" height="300" fill="#0e0e0e"/>
          <line x1="0" y1="0" x2="400" y2="300" stroke={T.goldBorder} strokeWidth="0.5"/>
          <line x1="400" y1="0" x2="0" y2="300" stroke={T.goldBorder} strokeWidth="0.5"/>
          <circle cx="200" cy="150" r="80" fill="none" stroke={T.goldBorder} strokeWidth="0.5"/>
          <circle cx="200" cy="150" r="50" fill="none" stroke={T.goldBorder} strokeWidth="0.5"/>
          <circle cx="200" cy="150" r="20" fill="none" stroke={T.goldBorder} strokeWidth="0.5"/>
        </svg>
      )}
      {/* Loaded image */}
      {state === "loaded" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          role="img"
          aria-label={alt}
        />
      )}
    </div>
  );
}

// ─── Slide ────────────────────────────────────────────────────────────────────
function Slide({ ev, isActive, isSaved, onSave, reducedMotion }) {
  const dur = reducedMotion ? 0.15 : 0.7;
  const easeOut = [0.22, 1, 0.36, 1];

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={ev.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: dur, ease: "easeOut" } }}
          exit={{ opacity: 0, transition: { duration: reducedMotion ? 0.1 : 0.45, ease: "easeIn" } }}
          style={{ position: "absolute", inset: 0, zIndex: 2 }}
        >
          {/* BG image — zoom only if motion allowed */}
          <motion.div
            initial={reducedMotion ? false : { scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "linear" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <LazyImage src={ev.image} alt={ev.title} />
          </motion.div>

          {/* Layered gradient — bottom-heavy + left vignette */}
          <div style={{
            position: "absolute", inset: 0,
            background: `
              linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.05) 100%),
              linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 38%, rgba(0,0,0,0.55) 100%)
            `,
          }} />

          {/* Fine gold diagonal line — decorative signature */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} aria-hidden="true">
            <line x1="0" y1="100%" x2="40%" y2="0" stroke={T.goldBorder} strokeWidth="0.6"/>
          </svg>

          {/* Content */}
          <div style={{
            position: "relative", zIndex: 3,
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(20px,5vw,72px)",
            paddingTop: "clamp(70px,10vh,110px)",
            paddingBottom: "clamp(130px,22vh,210px)",
            maxWidth: "min(640px, 90vw)",
          }}>

            {/* Category pill */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0, transition: { duration: dur, ease: easeOut, delay: 0.05 } }}
              style={{ marginBottom: "18px" }}
            >
              <span style={{
                display: "inline-block",
                padding: "4px 14px",
                border: `1px solid ${T.goldBorder}`,
                background: T.goldDim,
                color: T.goldLight,
                fontFamily: T.sans,
                fontSize: "0.67rem",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                borderRadius: "2px",
              }}>
                {ev.tag}
              </span>
            </motion.div>

            {/* Title — full, wrapping */}
            <div style={{ overflow: "hidden", marginBottom: "20px" }}>
              <motion.h2
                initial={reducedMotion ? { opacity: 0 } : { y: "105%", opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { duration: dur + 0.1, ease: easeOut, delay: 0.1 } }}
                style={{
                  margin: 0,
                  fontFamily: T.serif,
                  fontSize: "clamp(2.8rem, 8vw, 6.5rem)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  lineHeight: 0.95,
                  color: T.white,
                  letterSpacing: "-0.01em",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                {ev.title}
              </motion.h2>
            </div>

            {/* Meta row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: dur, ease: easeOut, delay: 0.2 } }}
              style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "18px" }}
            >
              {ev.place && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: T.muted, fontFamily: T.sans, fontSize: "0.75rem", fontWeight: 400, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  <PinIcon />{ev.place}
                </span>
              )}
              {ev.date && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: T.muted, fontFamily: T.sans, fontSize: "0.75rem", fontWeight: 400, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  <CalIcon />{ev.date}
                </span>
              )}
            </motion.div>

            {/* Hairline divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1, transition: { duration: reducedMotion ? 0.1 : 0.55, ease: easeOut, delay: 0.26 } }}
              style={{ height: "1px", background: T.goldBorder, originX: 0, marginBottom: "20px", maxWidth: "180px" }}
            />

            {/* Description */}
            {ev.description && (
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0, transition: { duration: dur, ease: easeOut, delay: 0.32 } }}
                style={{
                  margin: "0 0 28px",
                  fontFamily: T.sans,
                  fontSize: "clamp(0.85rem, 1.2vw, 0.96rem)",
                  fontWeight: 300,
                  lineHeight: 1.8,
                  color: T.muted,
                  maxWidth: "430px",
                }}
              >
                {ev.description}
              </motion.p>
            )}

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0, transition: { duration: dur, ease: easeOut, delay: 0.38 } }}
              style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}
            >
              <motion.button
                whileHover={reducedMotion ? {} : { scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 26px",
                  border: `1px solid ${T.gold}`,
                  background: "transparent",
                  color: T.gold,
                  fontFamily: T.sans,
                  fontSize: "0.73rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderRadius: "2px",
                  transition: "background 0.22s, color 0.22s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = "#000"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.gold; }}
              >
                <LinkIcon />
                Reserve a Spot
              </motion.button>

              <motion.button
                onClick={onSave}
                whileHover={reducedMotion ? {} : { scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                aria-label={isSaved ? "Remove from saved" : "Save event"}
                style={{
                  width: "42px", height: "42px",
                  borderRadius: "2px",
                  border: `1px solid ${isSaved ? T.gold : "rgba(255,255,255,0.22)"}`,
                  background: isSaved ? T.goldDim : "transparent",
                  color: isSaved ? T.gold : T.muted,
                  display: "grid", placeItems: "center",
                  cursor: "pointer",
                  transition: "all 0.22s ease",
                }}
              >
                <SaveIcon saved={isSaved} />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
function Thumb({ ev, isActive, onClick, idx, reducedMotion }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.06, duration: 0.4 } }}
      whileHover={reducedMotion ? {} : { y: -5, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      aria-label={`Go to: ${ev.title}`}
      aria-current={isActive ? "true" : undefined}
      style={{
        position: "relative",
        border: "none",
        padding: 0,
        borderRadius: "2px",
        overflow: "hidden",
        cursor: "pointer",
        width: "clamp(78px,9vw,118px)",
        height: "clamp(104px,13vw,158px)",
        flexShrink: 0,
        outline: isActive ? `1px solid ${T.gold}` : "1px solid rgba(255,255,255,0.1)",
        outlineOffset: isActive ? "2px" : "0px",
        transition: "outline 0.25s ease, outline-offset 0.25s ease",
      }}
    >
      <LazyImage src={ev.image} alt="" />
      <div style={{
        position: "absolute", inset: 0,
        background: isActive
          ? "linear-gradient(0deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 60%)"
          : "linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 60%)",
        transition: "background 0.3s",
      }} />
      {isActive && (
        <motion.div
          layoutId="thumb-indicator"
          style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: "2px",
            background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`,
          }}
        />
      )}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "8px",
        zIndex: 2,
      }}>
        <p style={{
          margin: 0,
          fontFamily: T.sans,
          fontSize: "clamp(0.67rem, 1.1vw, 0.8rem)",
          fontWeight: 400,
          color: isActive ? T.offWhite : T.muted,
          lineHeight: 1.25,
          textAlign: "left",
          transition: "color 0.25s",
          // full title, wrap naturally
          wordBreak: "break-word",
          whiteSpace: "normal",
        }}>
          {ev.title}
        </p>
        {ev.date && (
          <p style={{
            margin: "4px 0 0",
            fontFamily: T.sans,
            fontSize: "0.62rem",
            color: "rgba(255,255,255,0.38)",
            lineHeight: 1,
          }}>
            {ev.date}
          </p>
        )}
      </div>
    </motion.button>
  );
}

// ─── Ticker (scrolling marquee of event titles) ───────────────────────────────
function Ticker({ events, reducedMotion }) {
  const titles = events.map(e => e.title).join("  ·  ");
  const doubled = `${titles}  ·  ${titles}`;
  if (reducedMotion) return null;
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: "28px",
      borderTop: `1px solid ${T.faint}`,
      overflow: "hidden",
      zIndex: 20,
      display: "flex",
      alignItems: "center",
    }}>
      <motion.div
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          fontFamily: T.sans,
          fontSize: "0.62rem",
          fontWeight: 300,
          color: "rgba(255,255,255,0.22)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          gap: "0px",
        }}
      >
        {doubled}
      </motion.div>
    </div>
  );
}

// ─── Empty / Error States ─────────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div style={{
      display: "grid", placeItems: "center",
      minHeight: "70vh",
      background: T.bg,
      color: T.muted,
      fontFamily: T.sans,
      fontSize: "0.9rem",
      letterSpacing: "0.06em",
      gap: "12px",
      flexDirection: "column",
    }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="32" height="32" rx="2" stroke={T.goldBorder} strokeWidth="1"/>
        <line x1="8" y1="8" x2="40" y2="40" stroke={T.goldBorder} strokeWidth="0.8"/>
      </svg>
      <span>{message || "No events to display."}</span>
    </div>
  );
}

// ─── Progress dots ────────────────────────────────────────────────────────────
function Dots({ count, active, onSelect }) {
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }} role="tablist" aria-label="Event navigation">
      {Array.from({ length: count }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => onSelect(i)}
          role="tab"
          aria-selected={i === active}
          aria-label={`Event ${i + 1}`}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: i === active ? "22px" : "6px",
            height: "6px",
            borderRadius: "99px",
            background: i === active ? T.gold : "rgba(255,255,255,0.25)",
            border: "none",
            padding: 0,
            cursor: "pointer",
            transition: "width 0.35s ease, background 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExclusiveEventsCarousel({ events, autoPlayMs = 6000 }) {
  const reducedMotion = useReducedMotion();
  const timerRef = useRef(null);

  // Validation + normalization
  const rawList = Array.isArray(events) ? events : [];
  const list = rawList.map(normalizeEvent).filter(Boolean);

  const [active, setActive]     = useState(0);
  const [saved, setSaved]       = useState({});
  const [paused, setPaused]     = useState(false);
  const [thumbsVisible, setThumbsVisible] = useState(true);

  const safeActive = Math.min(active, Math.max(list.length - 1, 0));
  const go = useCallback((idx) => setActive(((idx % list.length) + list.length) % list.length), [list.length]);

  // Auto-play
  useEffect(() => {
    if (list.length < 2 || paused) return;
    timerRef.current = setInterval(() => go(safeActive + 1), autoPlayMs);
    return () => clearInterval(timerRef.current);
  }, [list.length, paused, safeActive, autoPlayMs, go]);

  const resetAndGo = (idx) => {
    clearInterval(timerRef.current);
    go(idx);
  };

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft")  resetAndGo(safeActive - 1);
      if (e.key === "ArrowRight") resetAndGo(safeActive + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [safeActive]);

  // Swipe
  const touchStart = useRef(null);
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { resetAndGo(safeActive + (diff > 0 ? 1 : -1)); }
    touchStart.current = null;
  };

  if (!list.length) return <EmptyState message="No events scheduled — check back soon." />;

  return (
    <>
      <style>{`
        @import url('${FONT_LINK}');
        *,*::before,*::after{box-sizing:border-box;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      <section
        aria-label="Exclusive events carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100svh",
          background: T.bg,
          overflow: "hidden",
          isolation: "isolate",
          userSelect: "none",
        }}
      >
        {/* ── Slides ── */}
        {list.map((ev, i) => (
          <Slide
            key={ev.id}
            ev={ev}
            isActive={i === safeActive}
            isSaved={!!saved[ev.id]}
            onSave={() => setSaved(s => ({ ...s, [ev.id]: !s[ev.id] }))}
            reducedMotion={reducedMotion}
          />
        ))}

        {/* ── Corner index ── */}
        <div style={{
          position: "absolute",
          top: "clamp(18px,3vw,36px)",
          right: "clamp(18px,3vw,36px)",
          zIndex: 10,
          textAlign: "right",
        }}>
          <motion.span
            key={safeActive}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "block",
              fontFamily: T.sans,
              fontSize: "clamp(1.6rem,4vw,2.6rem)",
              fontWeight: 300,
              color: T.gold,
              lineHeight: 1,
            }}
          >
            {String(safeActive + 1).padStart(2, "0")}
          </motion.span>
          <span style={{
            display: "block",
            fontFamily: T.sans,
            fontSize: "0.68rem",
            color: T.muted,
            letterSpacing: "0.12em",
            marginTop: "2px",
          }}>
            / {String(list.length).padStart(2, "0")}
          </span>
        </div>

        {/* ── Bottom control area ── */}
        {list.length > 1 && (
          <div style={{
            position: "absolute",
            bottom: "28px",
            left: 0,
            right: 0,
            zIndex: 10,
            padding: "0 clamp(18px,4vw,60px)",
          }}>
            {/* Thumbnail strip */}
            {thumbsVisible && (
              <div style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginBottom: "20px",
                overflowX: "auto",
                overflowY: "visible",
                scrollbarWidth: "none",
                paddingBottom: "4px",
                paddingRight: "2px",
              }}>
                {list.map((ev, i) => (
                  <Thumb
                    key={ev.id}
                    ev={ev}
                    isActive={i === safeActive}
                    onClick={() => resetAndGo(i)}
                    idx={i}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            )}

            {/* Controls row */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Prev / Next */}
              {[
                { dir: -1, label: "Previous event", Icon: ChevronLeft },
                { dir:  1, label: "Next event",     Icon: ChevronRight },
              ].map(({ dir, label, Icon }) => (
                <motion.button
                  key={label}
                  onClick={() => resetAndGo(safeActive + dir)}
                  aria-label={label}
                  whileHover={reducedMotion ? {} : { scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  style={{
                    width: "40px", height: "40px",
                    borderRadius: "2px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.04)",
                    color: T.muted,
                    display: "grid", placeItems: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    backdropFilter: "blur(4px)",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.goldBorder; e.currentTarget.style.color = T.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = T.muted; }}
                >
                  <Icon />
                </motion.button>
              ))}

              {/* Dots */}
              <Dots count={list.length} active={safeActive} onSelect={resetAndGo} />

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Toggle thumbnails */}
              <button
                onClick={() => setThumbsVisible(v => !v)}
                aria-label={thumbsVisible ? "Hide thumbnails" : "Show thumbnails"}
                style={{
                  background: "transparent",
                  border: "none",
                  color: thumbsVisible ? T.gold : T.muted,
                  fontFamily: T.sans,
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  padding: "6px 0",
                  transition: "color 0.2s",
                }}
              >
                {thumbsVisible ? "Hide" : "Gallery"}
              </button>
            </div>
          </div>
        )}

        {/* ── Scrolling ticker at very bottom ── */}
        {!reducedMotion && <Ticker events={list} reducedMotion={reducedMotion} />}

        {/* ── Top vignette ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "90px",
          background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)",
          zIndex: 5,
          pointerEvents: "none",
        }} />
      </section>
    </>
  );
}