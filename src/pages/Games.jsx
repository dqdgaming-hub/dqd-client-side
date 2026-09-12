import { useState, useEffect, useMemo, useRef } from "react";
import { getHomePage } from "../components/api/homeapi";

const Icon = ({ children, className = "", style, size = 24 }) => (
  <svg
    className={className}
    style={style}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const GamepadIcon = (props) => (
  <Icon {...props}>
    <path d="M6 12h4" />
    <path d="M8 10v4" />
    <path d="M15 13h.01" />
    <path d="M18 11h.01" />
    <path d="M5.2 17.4a3 3 0 0 1-2.1-3.7l1-4A4 4 0 0 1 8 6.7h8a4 4 0 0 1 3.9 3l1 4a3 3 0 0 1-5.2 2.7l-1.4-1.7H9.7l-1.4 1.7a3 3 0 0 1-3.1 1z" />
  </Icon>
);

const PoolIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8" />
    <path d="M9.5 9.5h5" />
    <path d="M9.5 14.5h5" />
    <path d="M10 9.5c0 1.8 4 1.8 4 0" />
    <path d="M10 14.5c0-1.8 4-1.8 4 0" />
  </Icon>
);

const ZapIcon = (props) => (
  <Icon {...props}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
  </Icon>
);

const VrIcon = (props) => (
  <Icon {...props}>
    <path d="M4 10a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5a2 2 0 0 1-2 2h-3.2a2 2 0 0 1-1.8-1.1l-.4-.8a.7.7 0 0 0-1.2 0l-.4.8A2 2 0 0 1 9.2 17H6a2 2 0 0 1-2-2v-5z" />
    <path d="M8 12h2" />
    <path d="M14 12h2" />
  </Icon>
);

const SimulatorIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 4v5" />
    <path d="M12 15v5" />
    <path d="M4 12h5" />
    <path d="M15 12h5" />
  </Icon>
);

const MultiplayerIcon = (props) => (
  <Icon {...props}>
    <circle cx="7" cy="8" r="3" />
    <circle cx="17" cy="8" r="3" />
    <path d="M2 20a5 5 0 0 1 10 0" />
    <path d="M12 20a5 5 0 0 1 10 0" />
  </Icon>
);

const BoardGameIcon = (props) => (
  <Icon {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 12h16" />
    <path d="M12 4v16" />
    <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16" r="1" fill="currentColor" stroke="none" />
  </Icon>
);

const CardGameIcon = (props) => (
  <Icon {...props}>
    <rect x="7" y="3" width="10" height="14" rx="2" />
    <path d="M10 7h4" />
    <path d="M10 11h4" />
    <path d="M5 7v12a2 2 0 0 0 2 2h8" />
  </Icon>
);

const OtherIcon = (props) => (
  <Icon {...props}>
    <path d="M12 3l2.2 4.5 5 .7-3.6 3.5.8 5-4.4-2.3-4.4 2.3.8-5-3.6-3.5 5-.7L12 3z" />
  </Icon>
);

const UsersIcon = (props) => (
  <Icon {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

const AlertIcon = (props) => (
  <Icon {...props}>
    <path d="m21.7 18.3-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-2.7z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Icon>
);

const RocketIcon = (props) => (
  <Icon {...props}>
    <path d="M4.5 16.5c-1.2 1-1.5 3-1.5 3s2-.3 3-1.5" />
    <path d="M9 15 6 18" />
    <path d="M15 9 6 18l-1-4 5-5 4-1 1 1z" />
    <path d="M14 4h6v6" />
    <path d="M14 4c3 1 5 3 6 6" />
  </Icon>
);

const ChevronDownIcon = (props) => (
  <Icon {...props}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

const CATEGORY_TYPE_META = {
  ps5: {
    label: "PS5",
    Icon: GamepadIcon,
    accent: "#00f0ff",
    glow: "rgba(0,240,255,0.35)",
    bg: "linear-gradient(135deg, #0a0a1a 0%, #0d1a2e 100%)",
    stripe: "#00f0ff22",
  },
  pool: {
    label: "POOL",
    Icon: PoolIcon,
    accent: "#a855f7",
    glow: "rgba(168,85,247,0.35)",
    bg: "linear-gradient(135deg, #0a0a1a 0%, #1a0d2e 100%)",
    stripe: "#a855f722",
  },
  vr: {
    label: "VR",
    Icon: VrIcon,
    accent: "#22c55e",
    glow: "rgba(34,197,94,0.35)",
    bg: "linear-gradient(135deg, #06130d 0%, #102a1f 100%)",
    stripe: "#22c55e22",
  },
  simulator: {
    label: "SIMULATOR",
    Icon: SimulatorIcon,
    accent: "#f97316",
    glow: "rgba(249,115,22,0.35)",
    bg: "linear-gradient(135deg, #160d05 0%, #2b1608 100%)",
    stripe: "#f9731622",
  },
  multiplayer_games: {
    label: "MULTIPLAYER",
    Icon: MultiplayerIcon,
    accent: "#ec4899",
    glow: "rgba(236,72,153,0.35)",
    bg: "linear-gradient(135deg, #170816 0%, #2b0f25 100%)",
    stripe: "#ec489922",
  },
  board_games: {
    label: "BOARD GAMES",
    Icon: BoardGameIcon,
    accent: "#eab308",
    glow: "rgba(234,179,8,0.35)",
    bg: "linear-gradient(135deg, #151105 0%, #2a2208 100%)",
    stripe: "#eab30822",
  },
  card_games: {
    label: "CARD GAMES",
    Icon: CardGameIcon,
    accent: "#38bdf8",
    glow: "rgba(56,189,248,0.35)",
    bg: "linear-gradient(135deg, #06111a 0%, #0b2433 100%)",
    stripe: "#38bdf822",
  },
  other: {
    label: "OTHER",
    Icon: OtherIcon,
    accent: "#c084fc",
    glow: "rgba(192,132,252,0.35)",
    bg: "linear-gradient(135deg, #10091a 0%, #25103a 100%)",
    stripe: "#c084fc22",
  },
};

const DEFAULT_META = {
  label: "GAMING",
  Icon: ZapIcon,
  accent: "#00f0ff",
  glow: "rgba(0,240,255,0.35)",
  bg: "linear-gradient(135deg, #0a0a1a 0%, #0d1a2e 100%)",
  stripe: "#00f0ff22",
};

const ALLOWED_CATEGORY_TYPES = [
  "ps5",
  "pool",
  "vr",
  "simulator",
  "multiplayer_games",
  "board_games",
  "card_games",
  "other",
];

const shouldShowCategory = (category) => {
  const type = String(category?.category_type || "").toLowerCase();
  const name = String(category?.name || "").toLowerCase();
  return ALLOWED_CATEGORY_TYPES.includes(type) && name !== "movies";
};

const groupCategoriesByType = (categories) => {
  const grouped = new Map(
    ALLOWED_CATEGORY_TYPES.map((type) => [
      type,
      {
        id: type,
        category_type: type,
        subCategories: new Map([
          [
            `${type}-all`,
            {
              id: `${type}-all`,
              name: "All",
              games: [],
              isFallback: true,
            },
          ],
        ]),
      },
    ])
  );

  categories.forEach((category) => {
    const type = String(category.category_type || "gaming").toLowerCase();
    const categoryName = category.name || "More Games";
    const subKey = categoryName.toLowerCase();

    const typeGroup = grouped.get(type);
    typeGroup.subCategories.delete(`${type}-all`);

    if (!typeGroup.subCategories.has(subKey)) {
      typeGroup.subCategories.set(subKey, {
        id: category.id || `${type}-${subKey}`,
        name: categoryName,
        games: [],
      });
    }

    const subCategory = typeGroup.subCategories.get(subKey);
    const existingGameIds = new Set(subCategory.games.map((game) => game.id));
    const nextGames = Array.isArray(category.games) ? category.games : [];

    nextGames.forEach((game) => {
      if (!existingGameIds.has(game.id)) {
        subCategory.games.push(game);
        existingGameIds.add(game.id);
      }
    });
  });

  return Array.from(grouped.values())
    .sort(
      (first, second) =>
        ALLOWED_CATEGORY_TYPES.indexOf(first.category_type) -
        ALLOWED_CATEGORY_TYPES.indexOf(second.category_type)
    )
    .map((group) => ({
      ...group,
      subCategories: Array.from(group.subCategories.values()),
    }));
};

function GameBanner({ game, accent, glow }) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -18;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className="game-banner"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        transform: `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${hovered ? 1.04 : 1})`,
        transition: hovered ? "transform 0.1s ease" : "transform 0.4s ease",
        boxShadow: hovered ? `0 0 40px ${glow}, 0 0 80px ${glow}40` : `0 0 20px ${glow}40`,
        borderColor: accent,
      }}
    >
      <div className="game-banner-img-wrap">
        {game.image ? (
          <img src={game.image} alt={game.name} className="game-banner-img" />
        ) : (
          <div className="game-banner-placeholder" style={{ background: `linear-gradient(135deg, ${accent}22, ${accent}44)` }}>
            <GamepadIcon size={48} />
          </div>
        )}
        <div className="game-banner-overlay" style={{ background: "linear-gradient(to top, #050510ee 40%, transparent)" }} />
        {game.maintenance_mode && (
          <div className="maintenance-badge">
            <AlertIcon size={13} /> MAINTENANCE
          </div>
        )}
        {hovered && <div className="scan-line" style={{ borderColor: accent }} />}
      </div>

      <div className="game-banner-info">
        <div className="game-banner-capacity" style={{ color: accent }}>
          <UsersIcon className="capacity-icon" size={13} /> MAX {game.max_capacity}
        </div>
        <h3 className="game-banner-name">{game.name}</h3>
        <div className="game-banner-bottom">
          <span className="game-banner-price" style={{ color: accent }}>
            INR {game.price_per_hour}
            <span className="price-unit">/hr</span>
          </span>
          <button className="book-btn" style={{ background: accent, boxShadow: `0 0 20px ${glow}` }}>
            BOOK NOW
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryBanner({ categoryGroup, index }) {
  const meta = CATEGORY_TYPE_META[categoryGroup.category_type] || DEFAULT_META;
  const [expanded, setExpanded] = useState(index === 0);
  const [visible, setVisible] = useState(false);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(
    categoryGroup.subCategories[0]?.id || ""
  );
  const ref = useRef(null);
  const CategoryIcon = meta.Icon;
  const selectedSubCategory =
    categoryGroup.subCategories.find((subCategory) => subCategory.id === selectedSubCategoryId) ||
    categoryGroup.subCategories[0];
  const totalGames = categoryGroup.subCategories.reduce(
    (total, subCategory) => total + subCategory.games.length,
    0
  );

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setSelectedSubCategoryId(categoryGroup.subCategories[0]?.id || "");
  }, [categoryGroup]);

  return (
    <div
      ref={ref}
      className="category-banner"
      style={{
        background: meta.bg,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s`,
      }}
    >
      <div
        className="cat-stripe-bg"
        style={{ background: `repeating-linear-gradient(45deg, ${meta.stripe} 0px, ${meta.stripe} 2px, transparent 2px, transparent 28px)` }}
      />

      <button className="category-header" onClick={() => setExpanded((p) => !p)} aria-expanded={expanded}>
        <div className="category-header-left">
          <span className="cat-icon" style={{ color: meta.accent, filter: `drop-shadow(0 0 8px ${meta.accent})` }}>
            <CategoryIcon size={32} />
          </span>
          <div className="cat-title-group">
            <span className="cat-type-badge" style={{ background: `${meta.accent}22`, color: meta.accent, borderColor: meta.accent }}>
              {meta.label}
            </span>
            <h2 className="cat-name" style={{ color: "#fff", textShadow: `0 0 20px ${meta.glow}` }}>
              {meta.label} Zone
            </h2>
          </div>
        </div>
        <div className="cat-header-right">
          <span className="game-count-pill" style={{ background: `${meta.accent}22`, color: meta.accent }}>
            {totalGames} {totalGames === 1 ? "Game" : "Games"}
          </span>
          <ChevronDownIcon
            className="expand-arrow"
            size={18}
            style={{ color: meta.accent, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>
      </button>

      <div
        className="games-grid-wrap"
        style={{
          maxHeight: expanded ? "800px" : "0px",
          opacity: expanded ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease",
        }}
      >
        <div className="sub-category-row">
          {categoryGroup.subCategories.map((subCategory) => {
            const isActive = subCategory.id === selectedSubCategory?.id;

            return (
              <button
                className={`sub-category-tab ${isActive ? "is-active" : ""}`}
                key={subCategory.id}
                onClick={() => setSelectedSubCategoryId(subCategory.id)}
                style={{
                  borderColor: isActive ? meta.accent : `${meta.accent}33`,
                  color: isActive ? "#050510" : meta.accent,
                  background: isActive ? meta.accent : `${meta.accent}10`,
                  boxShadow: isActive ? `0 0 22px ${meta.glow}` : "none",
                }}
                type="button"
              >
                <span>{subCategory.name}</span>
                <small>{subCategory.games.length}</small>
              </button>
            );
          })}
        </div>

        {!selectedSubCategory || selectedSubCategory.games.length === 0 ? (
          <div className="empty-cat" style={{ color: meta.accent }}>
            <RocketIcon size={36} />
            <p>Games dropping soon...</p>
          </div>
        ) : (
          <div className="games-grid">
            {selectedSubCategory.games.map((game) => (
              <GameBanner key={game.id} game={game} accent={meta.accent} glow={meta.glow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Games() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getHomePage()
      .then((res) => {
        const apiCategories = res?.data?.categories || [];
        setCategories(apiCategories.filter(shouldShowCategory));
      })
      .catch(() => setError("Failed to load games."))
      .finally(() => setLoading(false));
  }, []);

  const categoryGroups = useMemo(
    () => groupCategoriesByType(categories),
    [categories]
  );

  if (loading) {
    return (
      <div className="games-loader">
        <div className="loader-ring" />
        <p className="loader-text">LOADING ARENA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="games-error">
        <AlertIcon size={18} /> {error}
      </div>
    );
  }

  return (
    <section className="games-section">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

        .games-section {
          background: #050510;
          min-height: 100vh;
          padding: 60px 0 80px;
          font-family: 'Share Tech Mono', monospace;
          overflow-x: hidden;
          position: relative;
        }

        .games-section::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .games-section-header {
          text-align: center;
          margin-bottom: 48px;
          position: relative;
          z-index: 1;
          padding: 0 20px;
        }
        .games-section-eyebrow {
          display: inline-block;
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          letter-spacing: 6px;
          color: #00f0ff;
          text-transform: uppercase;
          margin-bottom: 12px;
          opacity: 0.7;
        }
        .games-section-title {
          font-family: 'Orbitron', monospace;
          font-size: clamp(28px, 6vw, 56px);
          font-weight: 900;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 2px;
          line-height: 1.1;
          margin: 0;
        }
        .games-section-title span {
          color: #00f0ff;
          text-shadow: 0 0 30px rgba(0,240,255,0.8);
        }
        .games-title-underline {
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #00f0ff, transparent);
          margin: 16px auto 0;
          animation: pulse-line 2s ease-in-out infinite;
        }
        @keyframes pulse-line {
          0%, 100% { width: 80px; opacity: 0.6; }
          50% { width: 140px; opacity: 1; }
        }

        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 1;
        }

        .category-banner {
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          position: relative;
          backdrop-filter: blur(4px);
        }
        .cat-stripe-bg {
          position: absolute;
          inset: 0;
          opacity: 0.4;
          pointer-events: none;
        }

        .category-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 20px 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          position: relative;
          z-index: 1;
          gap: 12px;
        }
        .category-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }
        .cat-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cat-title-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          min-width: 0;
        }
        .cat-type-badge {
          font-family: 'Orbitron', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 4px;
          padding: 3px 10px;
          border-radius: 4px;
          border: 1px solid;
          text-transform: uppercase;
        }
        .cat-name {
          font-family: 'Orbitron', monospace;
          font-size: clamp(18px, 4vw, 28px);
          font-weight: 900;
          margin: 0;
          letter-spacing: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cat-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .game-count-pill {
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 20px;
          letter-spacing: 1px;
        }
        .expand-arrow {
          transition: transform 0.4s ease;
          display: inline-block;
          flex-shrink: 0;
        }

        .games-grid-wrap {
          position: relative;
          z-index: 1;
        }
        .sub-category-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 0 20px 18px;
          scrollbar-width: none;
        }
        .sub-category-row::-webkit-scrollbar {
          display: none;
        }
        .sub-category-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex: 0 0 auto;
          border: 1px solid;
          border-radius: 999px;
          padding: 9px 14px;
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.18s ease, filter 0.18s ease, box-shadow 0.18s ease;
        }
        .sub-category-tab:hover {
          transform: translateY(-2px);
          filter: brightness(1.15);
        }
        .sub-category-tab small {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(5,5,16,0.25);
          color: inherit;
          font-size: 10px;
        }
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
          padding: 0 20px 24px;
        }
        .empty-cat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px;
          font-family: 'Orbitron', monospace;
          font-size: 13px;
          letter-spacing: 2px;
          opacity: 0.6;
        }
        .empty-cat p { margin: 0; }

        .game-banner {
          border-radius: 12px;
          border: 1px solid;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          background: #080818;
          will-change: transform;
        }
        .game-banner-img-wrap {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
        }
        .game-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
          display: block;
        }
        .game-banner:hover .game-banner-img {
          transform: scale(1.08);
        }
        .game-banner-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: currentColor;
        }
        .game-banner-overlay {
          position: absolute;
          inset: 0;
        }
        .maintenance-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #ff2d6b;
          color: #fff;
          font-family: 'Orbitron', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          padding: 4px 10px;
          border-radius: 4px;
          animation: blink 1.2s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .scan-line {
          position: absolute;
          inset: 0;
          border: 2px solid;
          border-radius: 12px;
          pointer-events: none;
          animation: scan-pulse 0.8s ease-in-out infinite alternate;
        }
        @keyframes scan-pulse {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }
        .game-banner-info {
          padding: 14px 16px 16px;
          position: relative;
        }
        .game-banner-capacity {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 4px;
        }
        .capacity-icon { flex-shrink: 0; }
        .game-banner-name {
          font-family: 'Orbitron', monospace;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 12px;
          letter-spacing: 0.5px;
        }
        .game-banner-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .game-banner-price {
          font-family: 'Orbitron', monospace;
          font-size: 18px;
          font-weight: 900;
        }
        .price-unit {
          font-size: 11px;
          font-weight: 400;
          opacity: 0.7;
          margin-left: 2px;
        }
        .book-btn {
          font-family: 'Orbitron', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #050510;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: transform 0.15s ease, filter 0.15s ease;
          white-space: nowrap;
        }
        .book-btn:hover {
          transform: scale(1.06);
          filter: brightness(1.2);
        }
        .book-btn:active { transform: scale(0.96); }

        .games-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 20px;
          background: #050510;
        }
        .loader-ring {
          width: 56px;
          height: 56px;
          border: 3px solid #0d1a2e;
          border-top-color: #00f0ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loader-text {
          font-family: 'Orbitron', monospace;
          font-size: 12px;
          letter-spacing: 6px;
          color: #00f0ff;
          opacity: 0.7;
          animation: pulse-text 1.4s ease-in-out infinite;
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .games-error {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Orbitron', monospace;
          text-align: center;
          color: #ff2d6b;
          padding: 60px 20px;
          font-size: 14px;
          letter-spacing: 2px;
          background: #050510;
        }

        @media (max-width: 640px) {
          .games-section { padding: 40px 0 60px; }
          .category-header { padding: 16px; }
          .cat-icon svg { width: 26px; height: 26px; }
          .game-count-pill { display: none; }
          .games-grid {
            grid-template-columns: 1fr;
            padding: 0 12px 20px;
            gap: 14px;
          }
          .sub-category-row {
            padding: 0 12px 16px;
            scroll-snap-type: x mandatory;
          }
          .sub-category-tab {
            min-height: 42px;
            max-width: 78vw;
            scroll-snap-align: start;
          }
          .sub-category-tab span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .game-banner-name { font-size: 14px; }
          .game-banner-price { font-size: 16px; }
          .book-btn { font-size: 9px; padding: 7px 12px; }
          .categories-list { padding: 0 12px; gap: 14px; }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .games-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="games-section-header">
        <p className="games-section-eyebrow">// SELECT YOUR GAME</p>
        <h1 className="games-section-title">
          THE <span>ARENA</span>
        </h1>
        <div className="games-title-underline" />
      </div>

      <div className="categories-list">
        {categoryGroups.map((categoryGroup, i) => (
          <CategoryBanner key={categoryGroup.id} categoryGroup={categoryGroup} index={i} />
        ))}
      </div>
    </section>
  );
}

