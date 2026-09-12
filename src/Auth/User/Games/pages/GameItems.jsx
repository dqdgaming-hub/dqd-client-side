import { useEffect, useState, useRef, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import UserLayout from "../../Userlayout";
import { getGameCategories, getGames } from "../../../api/userapi";

const CategoryTabs = lazy(() => import("../booking/CategoryTabs"));
const GameCard     = lazy(() => import("../booking/GameCard"));

const VOID   = "#05040A";
const PANEL  = "#0D0A18";
const PURPLE = "#7A2CFF";
const PURPLE2= "#3D1A78";
const SILVER = "#B9C2D9";
const GOLD   = "#D4AF37";
const GOLDHI = "#F4D886";
const BORDER = "rgba(122,44,255,0.18)";

const AUTO_ROTATE_MS = 5200;

// ── Icons ─────────────────────────────────────────────────────────────────────
const BookingsIcon = ({ size=16, color=GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke={color} strokeWidth="1.7"/>
    <path d="M3.5 9.5h17" stroke={color} strokeWidth="1.7"/>
    <path d="M8 3v3.6M16 3v3.6" stroke={color} strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M8 13.2h3M8 16.4h6" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const HistoryIcon = ({ size=16, color=GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3.5 11a8.5 8.5 0 1 0 2.5-6" stroke={color} strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M3.2 4.5v4.6h4.6" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8v4.4l3 2" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = ({ size=18, color=GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth="1.8"/>
    <path d="M19.5 19.5 15.5 15.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = ({ size=14, color="#aaa" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 5l14 14M19 5 5 19" stroke={color} strokeWidth="2.4" strokeLinecap="round"/>
  </svg>
);

const MaskIcon = ({ size=64, color=`${PURPLE}88` }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2c-4.5 0-7.5 3-7.5 7 0 3.2 1.4 4.6 2 6.2.5 1.3 1.4 2.3 2 2.3.7 0 .9-1 1-2 .1.9.5 2 1.5 2s1.4-1.1 1.5-2c.1 1 .3 2 1 2 .6 0 1.5-1 2-2.3.6-1.6 2-3 2-6.2 0-4-3-7-7.5-7Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M8.5 10.5c0 .9-.5 1.6-1 1.6s-1-.7-1-1.6.5-1.6 1-1.6 1 .7 1 1.6ZM17.5 10.5c0 .9-.5 1.6-1 1.6s-1-.7-1-1.6.5-1.6 1-1.6 1 .7 1 1.6Z" fill={color}/>
    <path d="M9.5 15.2c.8.5 1.6.8 2.5.8s1.7-.3 2.5-.8" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const ChevronIcon = ({ dir="left", size=20, color=GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={dir==="left" ? "M14.5 5 8 12l6.5 7" : "M9.5 5 16 12l-6.5 7"} stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlayPauseIcon = ({ playing, size=14, color=GOLD }) => playing ? (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="6" y="5" width="4" height="14" rx="1" fill={color}/>
    <rect x="14" y="5" width="4" height="14" rx="1" fill={color}/>
  </svg>
) : (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M7 5.5v13l11-6.5-11-6.5z" fill={color}/>
  </svg>
);

// ── Ember ─────────────────────────────────────────────────────────────────────
function Ember({ style }) {
  return (
    <motion.div
      style={{ position:"absolute", borderRadius:"50%", pointerEvents:"none", ...style }}
      animate={{ y:[0,-34,0], opacity:[0.15,0.5,0.15] }}
      transition={{ duration:3.4+Math.random()*3, repeat:Infinity, ease:"easeInOut", delay:Math.random()*2 }}
    />
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  const shimmer = `linear-gradient(90deg, ${PANEL} 25%, #1c1132 50%, ${PANEL} 75%)`;
  return (
    <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:20, overflow:"hidden", width:"min(300px,80vw)", aspectRatio:"2/3" }}>
      <motion.div animate={{ backgroundPosition:["200% 0","-200% 0"] }} transition={{ duration:1.4, repeat:Infinity, ease:"linear" }}
        style={{ height:"100%", background:shimmer, backgroundSize:"400% 100%" }}/>
    </div>
  );
}

// ── Viewport ──────────────────────────────────────────────────────────────────
function useViewport() {
  const [width, setWidth] = useState(typeof window!=="undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setWidth(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  if (width <= 480) return { width, mode:"mobile" };
  if (width <= 768) return { width, mode:"tablet" };
  return { width, mode:"desktop" };
}

const GEOMETRY = {
  mobile:  { cardW:200, cardH:310, spread:1, offsetX:105, scaleStep:0.18, opStep:0.5 },
  tablet:  { cardW:250, cardH:390, spread:1, offsetX:155, scaleStep:0.15, opStep:0.45 },
  desktop: { cardW:310, cardH:460, spread:2, offsetX:230, scaleStep:0.13, opStep:0.38 },
};

// ── Carousel ──────────────────────────────────────────────────────────────────
function ArenaCarousel({ games, navigate }) {
  const { mode } = useViewport();
  const geo = GEOMETRY[mode];
  const [index, setIndex]   = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => { setIndex(0); }, [games]);

  const advance = useCallback((dir) => {
    setIndex(i => (i + dir + games.length) % games.length);
  }, [games.length]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (playing && games.length > 1)
      timerRef.current = setInterval(() => advance(1), AUTO_ROTATE_MS);
  }, [playing, advance, games.length]);

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, [resetTimer]);

  const pauseBriefly = () => {
    clearInterval(timerRef.current);
    if (playing) timerRef.current = setInterval(() => advance(1), AUTO_ROTATE_MS);
  };

  if (!games.length) return null;

  const seenIdx = new Set();
  const slots   = [];
  const order   = [0];
  for (let k=1; k<=geo.spread; k++) order.push(-k, k);
  for (const d of order) {
    const i = (index + d + games.length) % games.length;
    if (seenIdx.has(i)) continue;
    seenIdx.add(i);
    slots.push({ d, i, game: games[i] });
  }
  slots.sort((a,b) => a.d - b.d);

  return (
    <div style={cs.wrap}>
      <div style={{ ...cs.stage, height: geo.cardH + 20 }}>
        <AnimatePresence initial={false}>
          {slots.map(({ d, i, game }) => {
            const isCenter = d === 0;
            const absD = Math.abs(d);
            return (
              <motion.div
                key={game.id}
                style={{
                  position:"absolute", top:"50%", left:"50%",
                  width:geo.cardW, height:geo.cardH,
                  marginLeft:-geo.cardW/2, marginTop:-geo.cardH/2,
                  zIndex:10-absD, cursor:"pointer",
                }}
                initial={false}
                animate={{
                  x: d*geo.offsetX,
                  scale: 1 - absD*geo.scaleStep,
                  opacity: 1 - absD*geo.opStep,
                  filter: isCenter ? "blur(0px)" : `blur(${absD*1.5}px)`,
                }}
                transition={{ type:"spring", stiffness:220, damping:26 }}
                onClick={() => { if (!isCenter) { pauseBriefly(); setIndex(i); } }}
              >
                <Suspense fallback={null}>
                  <GameCard
                    game={game}
                    active={isCenter}
                    onClick={() => navigate(`/user/games/${game.id}`)}
                  />
                </Suspense>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div style={cs.controls}>
        <button style={cs.arrowBtn} onClick={() => { pauseBriefly(); advance(-1); }} aria-label="Previous">
          <ChevronIcon dir="left"/>
        </button>
        <button style={cs.playBtn} onClick={() => setPlaying(p => !p)} aria-label={playing?"Pause":"Play"}>
          <PlayPauseIcon playing={playing}/>
        </button>
        <div style={cs.dotsRow}>
          {games.map((g,i) => (
            <button key={g.id} onClick={() => { pauseBriefly(); setIndex(i); }}
              style={{ ...cs.dot, width:i===index?22:7, background:i===index?GOLD:`${PURPLE}66` }}
              aria-label={`Go to ${g.name}`}/>
          ))}
        </div>
        <button style={cs.arrowBtn} onClick={() => { pauseBriefly(); advance(1); }} aria-label="Next">
          <ChevronIcon dir="right"/>
        </button>
      </div>
    </div>
  );
}

// ── Animated title ────────────────────────────────────────────────────────────
const TITLE_EYEBROW = "DQD GAMING ARENA";
const TITLE_LINE1   = "ENTER THE";
const TITLE_LINE2   = "ARENA";

function AnimatedTitle() {
  return (
    <>
      <style>{`
        @keyframes gi-shimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes gi-glitch {
          0%,90%,100% { clip-path: none; transform: none; }
          91%  { clip-path: polygon(0 20%,100% 20%,100% 40%,0 40%); transform: translate(-3px,0); }
          92%  { clip-path: polygon(0 60%,100% 60%,100% 80%,0 80%); transform: translate(3px,0); }
          93%  { clip-path: none; transform: none; }
        }
        @keyframes gi-letterIn {
          0%   { opacity:0; transform: translateY(-28px) skewY(6deg); }
          100% { opacity:1; transform: translateY(0)    skewY(0deg); }
        }
        @keyframes gi-scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes gi-blink {
          0%,49%  { opacity:1; }
          50%,100%{ opacity:0; }
        }
        @keyframes gi-eyebrowIn {
          0%   { opacity:0; letter-spacing:0.5em; }
          100% { opacity:1; letter-spacing:0.22em; }
        }

        .gi-eyebrow {
          display:block; font-size:clamp(9px,1.8vw,12px); font-weight:700;
          color:${GOLD}; letter-spacing:0.22em; text-transform:uppercase;
          animation: gi-eyebrowIn 0.7s cubic-bezier(.22,1,.36,1) both;
          animation-delay:0.05s;
          margin-bottom:8px;
        }

        .gi-line1 {
          display:block; font-size:clamp(14px,3vw,22px); font-weight:400;
          color:${SILVER}bb; letter-spacing:0.2em; text-transform:uppercase;
          animation: gi-letterIn 0.5s cubic-bezier(.22,1,.36,1) both;
          animation-delay:0.2s;
          margin-bottom:4px;
        }

        .gi-line2-wrap {
          position:relative; display:inline-block; overflow:hidden;
        }
        /* scanline sweep over the big word */
        .gi-line2-wrap::after {
          content:''; position:absolute; left:0; right:0; height:30%;
          background:linear-gradient(180deg, transparent, rgba(122,44,255,0.18), transparent);
          animation: gi-scanline 3s linear infinite;
          pointer-events:none;
        }

        .gi-char {
          display:inline-block; position:relative;
          font-size:clamp(52px,11vw,96px); font-weight:900; line-height:0.9;
          letter-spacing:-0.02em; text-transform:uppercase;
          background: linear-gradient(105deg,
            ${GOLDHI} 0%, #fff 18%, ${GOLD} 34%,
            #c8aaff 50%, ${GOLD} 66%, #fff 82%, ${GOLDHI} 100%
          );
          background-size:400% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:
            gi-letterIn 0.5s cubic-bezier(.22,1,.36,1) both,
            gi-shimmer  5s linear infinite,
            gi-glitch   9s ease-in-out infinite;
        }

        /* cursor blink after last letter */
        .gi-cursor {
          display:inline-block;
          width:clamp(3px,0.6vw,5px);
          height:clamp(42px,8vw,76px);
          background:${GOLD};
          margin-left:6px; vertical-align:middle;
          animation: gi-blink 1.1s step-end infinite;
          border-radius:2px;
          position:relative; top:-2px;
        }

        .gi-sub {
          display:block; margin-top:14px;
          font-size:clamp(10px,1.5vw,13px); letter-spacing:0.16em;
          color:${SILVER}55; font-weight:400;
          animation: gi-eyebrowIn 0.6s ease both;
        }
      `}</style>

      <div style={{ textAlign:"center", lineHeight:1 }}>
        <span className="gi-eyebrow">{TITLE_EYEBROW}</span>
        <span className="gi-line1">{TITLE_LINE1}</span>

        <div>
          <span className="gi-line2-wrap">
            {TITLE_LINE2.split("").map((ch, i) => (
              <span
                key={i}
                className="gi-char"
                style={{ animationDelay:`${0.3 + i*0.06}s, ${i*0.15}s, ${i*1.3}s` }}
                aria-hidden="true"
              >{ch}</span>
            ))}
            <span className="gi-cursor" style={{ animationDelay:`${0.3 + TITLE_LINE2.length*0.06 + 0.1}s` }}/>
          </span>
        </div>

        <span className="gi-sub" style={{ animationDelay:`${0.3+TITLE_LINE2.length*0.06+0.2}s` }}>
          SELECT YOUR BATTLEGROUND · CLAIM YOUR SLOT
        </span>
      </div>
    </>
  );
}

// ── Animated search bar ───────────────────────────────────────────────────────
function SearchBar({ search, onSearch, onClose }) {
  const inputRef = useRef(null);

  useEffect(() => {
    // slight delay so the animation plays before focus
    const t = setTimeout(() => inputRef.current?.focus(), 160);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ scaleX:0.3, scaleY:0.6, opacity:0, borderRadius:40 }}
      animate={{ scaleX:1,   scaleY:1,   opacity:1, borderRadius:14 }}
      exit={{   scaleX:0.3, scaleY:0.5, opacity:0, borderRadius:40 }}
      transition={{ type:"spring", stiffness:300, damping:28 }}
      style={sb.wrap}
    >
      {/* animated left ring */}
      <motion.div
        initial={{ rotate:-90, opacity:0 }}
        animate={{ rotate:0,   opacity:1 }}
        exit={{   rotate:90,  opacity:0 }}
        transition={{ duration:0.25, delay:0.1 }}
        style={{ flexShrink:0 }}
      >
        <SearchIcon size={17} color={`${GOLD}cc`}/>
      </motion.div>

      <motion.input
        ref={inputRef}
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        exit={{   opacity:0 }}
        transition={{ duration:0.2, delay:0.12 }}
        style={sb.input}
        placeholder="Search the arena registry…"
        value={search}
        onChange={e => onSearch(e.target.value)}
        onKeyDown={e => { if (e.key==="Escape") onClose(); }}
      />

      <AnimatePresence>
        {search && (
          <motion.button
            key="clear"
            initial={{ scale:0, opacity:0 }}
            animate={{ scale:1, opacity:1 }}
            exit={{   scale:0, opacity:0 }}
            transition={{ type:"spring", stiffness:400, damping:22 }}
            onClick={() => onSearch("")}
            style={sb.clearBtn}
            aria-label="Clear"
          >
            <CloseIcon size={11}/>
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ rotate:90 }}
        whileTap={{ scale:0.88 }}
        transition={{ type:"spring", stiffness:300, damping:18 }}
        onClick={onClose}
        style={sb.closeBtn}
        aria-label="Close search"
      >
        <CloseIcon size={14} color={SILVER}/>
      </motion.button>
    </motion.div>
  );
}

const sb = {
  wrap: {
    display:"flex", alignItems:"center", gap:10,
    background:PANEL, border:`1px solid ${GOLD}66`,
    padding:"9px 14px", width:"100%", maxWidth:480,
    boxShadow:`0 0 0 1px ${GOLD}22, 0 12px 32px rgba(0,0,0,0.5), 0 0 28px ${PURPLE}33`,
    transformOrigin:"center",
  },
  input: {
    flex:1, background:"none", border:"none", outline:"none",
    color:"#EDE7FB", fontSize:14.5, fontFamily:"'Inter', sans-serif",
  },
  clearBtn: {
    background:"rgba(255,255,255,0.08)", border:"none",
    cursor:"pointer", borderRadius:6, padding:"5px 7px",
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  closeBtn: {
    background:"none", border:"none", cursor:"pointer",
    display:"flex", alignItems:"center", justifyContent:"center", padding:4,
  },
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GameItems() {
  const navigate = useNavigate();
  const { mode } = useViewport();

  const [loading, setLoading]                  = useState(true);
  const [categories, setCategories]             = useState([]);
  const [games, setGames]                       = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch]                     = useState("");
  const [searchOpen, setSearchOpen]              = useState(false);

  useEffect(() => { loadCategories(); loadGames(); }, []);

  const loadCategories = async () => {
    try { const r = await getGameCategories(); setCategories(r.results); } catch {}
  };
  const loadGames = async (category="", searchText="") => {
    setLoading(true);
    try {
      const params = {};
      if (category)   params.category = category;
      if (searchText) params.search   = searchText;
      const r = await getGames(params);
      setGames(r.results);
    } finally { setLoading(false); }
  };

  const onCategoryClick = id => { setSelectedCategory(id); loadGames(id, search); };
  const onSearch = val  => { setSearch(val); loadGames(selectedCategory, val); };
  const closeSearch = () => { setSearchOpen(false); };

  const isMobile = mode === "mobile";

  const navItems = [
    { label:"My Bookings",     icon:BookingsIcon, path:"/user/my-bookings" },
    { label:"Booking History", icon:HistoryIcon,  path:"/user/booking-history" },
  ];

  const embers = Array.from({ length:10 }, (_,i) => ({
    width:  3 + (i%5)*2.4,
    height: 3 + (i%5)*2.4,
    left:  `${8  + i*9}%`,
    top:   `${10 + (i*37)%80}%`,
    background: i%2===0 ? `${GOLD}66` : `${PURPLE}77`,
    boxShadow:  i%2===0 ? `0 0 9px ${GOLD}` : `0 0 9px ${PURPLE}`,
  }));

  return (
    <UserLayout>
      {/* ── Global responsive styles ── */}
      <style>{`
        .gi-page   { box-sizing:border-box; }
        .gi-nav-btn span { display:${isMobile?"none":"inline"}; }
        @media(max-width:480px){
          .gi-nav-btn { padding:9px 11px !important; }
          .gi-controls { gap:10px !important; margin-top:18px !important; }
        }
      `}</style>

      <div className="gi-page" style={s.page}>
        <div style={s.ambient}/>
        <div style={s.ambient2}/>
        <div style={s.vignette}/>
        {embers.map((p,i) => <Ember key={i} style={p}/>)}

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity:0, y:-24 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.55, ease:"easeOut" }}
          style={s.header}
        >
          <AnimatedTitle/>

          {/* Control row: nav buttons + search */}
          <div style={{ ...s.controlRow, flexDirection: isMobile?"column":"row" }}>
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <SearchBar
                  key="search"
                  search={search}
                  onSearch={onSearch}
                  onClose={closeSearch}
                />
              ) : (
                <motion.div
                  key="nav"
                  initial={{ opacity:0, y:6 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{   opacity:0, y:-6 }}
                  transition={{ duration:0.18 }}
                  style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", alignItems:"center" }}
                >
                  {navItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.path}
                        className="gi-nav-btn"
                        onClick={() => navigate(item.path)}
                        style={s.navBtn}
                        whileHover={{ scale:1.05, boxShadow:`0 0 18px ${PURPLE}77` }}
                        whileTap={{ scale:0.96 }}
                      >
                        <Icon size={15}/>
                        <span style={{ marginLeft:7 }}>{item.label}</span>
                      </motion.button>
                    );
                  })}

                  {/* Search trigger — morphs into a pill on hover */}
                  <motion.button
                    onClick={() => setSearchOpen(true)}
                    style={s.searchTriggerBtn}
                    whileHover={{ scale:1.12, boxShadow:`0 0 20px ${GOLD}88`, borderColor:`${GOLD}cc` }}
                    whileTap={{ scale:0.9 }}
                    aria-label="Open search"
                  >
                    <motion.span
                      animate={{ rotate: searchOpen ? 90 : 0 }}
                      transition={{ type:"spring", stiffness:300, damping:20 }}
                      style={{ display:"flex" }}
                    >
                      <SearchIcon size={16} color={GOLD}/>
                    </motion.span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Category tabs ── */}
        <Suspense fallback={null}>
          <CategoryTabs categories={categories} selected={selectedCategory} onSelect={onCategoryClick}/>
        </Suspense>

        {/* ── Carousel / states ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" style={s.skeletonStage}>
              <SkeletonCard/>
            </motion.div>
          ) : games.length===0 ? (
            <motion.div
              key="empty"
              initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              style={s.empty}
            >
              <motion.div animate={{ rotate:[0,-8,8,-8,0] }} transition={{ duration:0.6, delay:0.3 }}>
                <MaskIcon/>
              </motion.div>
              <p style={s.emptyTitle}>No arenas found</p>
              <p style={s.emptySub}>Try a different search or category</p>
              <motion.button
                whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                onClick={() => { onSearch(""); onCategoryClick(""); }}
                style={s.resetBtn}
              >Clear filters</motion.button>
            </motion.div>
          ) : (
            <motion.div key="carousel" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ width:"100%" }}>
              <ArenaCarousel games={games} navigate={navigate}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </UserLayout>
  );
}

// ── Page styles ───────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight:"100vh", background:VOID, position:"relative",
    overflow:"hidden", padding:"clamp(20px,4vw,40px) clamp(12px,4vw,24px) 72px",
    fontFamily:"'Inter','Segoe UI',sans-serif",
    display:"flex", flexDirection:"column", alignItems:"center",
  },
  ambient: {
    position:"absolute", top:"-12%", left:"-6%",
    width:"min(520px,80vw)", height:"min(520px,80vw)", borderRadius:"50%",
    background:`radial-gradient(circle, ${PURPLE}22 0%, transparent 70%)`,
    filter:"blur(70px)", pointerEvents:"none",
  },
  ambient2: {
    position:"absolute", bottom:"4%", right:"-6%",
    width:"min(420px,70vw)", height:"min(420px,70vw)", borderRadius:"50%",
    background:`radial-gradient(circle, ${GOLD}14 0%, transparent 70%)`,
    filter:"blur(70px)", pointerEvents:"none",
  },
  vignette: {
    position:"absolute", inset:0, pointerEvents:"none",
    background:`radial-gradient(ellipse at 50% 0%, transparent 55%, ${VOID}cc 100%)`,
  },
  header: {
    display:"flex", flexDirection:"column", alignItems:"center",
    textAlign:"center", gap:8,
    marginBottom:26, position:"relative", zIndex:2,
    width:"100%", maxWidth:720,
  },
  controlRow: {
    marginTop:18, display:"flex", justifyContent:"center",
    alignItems:"center", width:"100%", minHeight:44, gap:10,
  },
  navBtn: {
    display:"flex", alignItems:"center",
    padding:"10px 18px", borderRadius:10,
    background:"rgba(122,44,255,0.08)", border:`1px solid ${PURPLE}55`,
    color:SILVER, fontSize:13, fontWeight:600,
    cursor:"pointer", outline:"none", transition:"background 0.2s",
    fontFamily:"'Inter',sans-serif",
  },
  searchTriggerBtn: {
    width:40, height:40, borderRadius:10,
    background:"rgba(212,175,55,0.1)", border:`1px solid ${GOLD}55`,
    display:"flex", alignItems:"center", justifyContent:"center",
    cursor:"pointer", outline:"none",
    transition:"border-color 0.2s",
  },
  skeletonStage: {
    display:"flex", justifyContent:"center", padding:"40px 0",
    position:"relative", zIndex:1, width:"100%",
  },
  empty: {
    display:"flex", flexDirection:"column", alignItems:"center",
    justifyContent:"center", gap:12, minHeight:320,
    textAlign:"center", position:"relative", zIndex:1, width:"100%",
  },
  emptyTitle: { color:"#EDE7FB", fontSize:"clamp(18px,4vw,22px)", fontWeight:700, margin:0 },
  emptySub:   { color:`${SILVER}88`, fontSize:"clamp(12px,2.5vw,14px)", margin:0 },
  resetBtn: {
    marginTop:8, padding:"10px 24px", borderRadius:10,
    background:"transparent", border:`1px solid ${GOLD}`,
    color:GOLD, fontSize:13, fontWeight:600, cursor:"pointer",
    fontFamily:"'Inter',sans-serif",
  },
};

// ── Carousel styles ───────────────────────────────────────────────────────────
const cs = {
  wrap: {
    display:"flex", flexDirection:"column", alignItems:"center",
    width:"100%", position:"relative", zIndex:1,
  },
  stage: {
    position:"relative", width:"100%",
    display:"flex", alignItems:"center", justifyContent:"center",
    touchAction:"pan-y",
  },
  controls: {
    display:"flex", alignItems:"center", justifyContent:"center",
    gap:16, marginTop:24,
  },
  arrowBtn: {
    width:38, height:38, borderRadius:"50%",
    background:"rgba(122,44,255,0.12)", border:`1px solid ${PURPLE}55`,
    display:"flex", alignItems:"center", justifyContent:"center",
    cursor:"pointer", flexShrink:0,
  },
  playBtn: {
    width:34, height:34, borderRadius:"50%",
    background:"rgba(212,175,55,0.12)", border:`1px solid ${GOLD}55`,
    display:"flex", alignItems:"center", justifyContent:"center",
    cursor:"pointer", flexShrink:0,
  },
  dotsRow: {
    display:"flex", alignItems:"center", gap:6,
    flexWrap:"wrap", justifyContent:"center", maxWidth:200,
  },
  dot: {
    height:7, borderRadius:4, border:"none", cursor:"pointer",
    transition:"width 0.25s, background 0.25s",
  },
};