import { useState, useEffect } from "react";

const T = {
  bg: "#0a0a0f",
  bgCard: "#0d0d1a",
  bgPanel: "#11111f",
  cyan: "#00f5ff",
  pink: "#ff006e",
  yellow: "#ffd60a",
  green: "#39ff14",
  red: "#ff3b3b",
  purple: "#7b2fff",
  text: "#e0e0ff",
  muted: "#6b6b8a",
  border: "rgba(0,245,255,0.15)",
};

const injectStyles = () => {
  if (document.getElementById("dqly-styles")) return;
  const s = document.createElement("style");
  s.id = "dqly-styles";
  s.textContent = `
    .dqly-section { width: 100%; height: 100%; }
    .dqly-heading {
      font-family: 'Orbitron', sans-serif;
      font-size: clamp(1rem, 2.2vw, 1.3rem);
      font-weight: 700; color: ${T.cyan};
      letter-spacing: 2px; text-transform: uppercase;
      margin-bottom: 22px; display: flex; align-items: center; gap: 12px;
    }
    .dqly-heading::before {
      content: ''; display: inline-block; width: 4px; height: 1.3em;
      background: linear-gradient(180deg, ${T.cyan}, ${T.purple}); border-radius: 2px; flex-shrink: 0;
    }
    .dqly-wrap {
      background: ${T.bgPanel}; border: 1px solid ${T.border};
      clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
      padding: 22px 24px; display: flex; flex-direction: column; gap: 18px; height: 91%;
    }
    .dqly-balance { display: flex; align-items: center; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid ${T.border}; }
    .dqly-balance-icon {
      width: 50px; height: 50px; border-radius: 50%; flex-shrink: 0;
      background: ${T.yellow}15; display: flex; align-items: center; justify-content: center;
    }
    .dqly-balance-num { font-family: 'Orbitron', sans-serif; font-size: 1.7rem; font-weight: 900; color: ${T.yellow}; line-height: 1; }
    .dqly-balance-label { font-family: 'Share Tech Mono', monospace; font-size: 0.62rem; letter-spacing: 2px; color: ${T.muted}; text-transform: uppercase; margin-top: 3px; }

    .dqly-list { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .dqly-list-title { font-family: 'Share Tech Mono', monospace; font-size: 0.62rem; letter-spacing: 2px; color: ${T.muted}; text-transform: uppercase; margin-bottom: 6px; }
    .dqly-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid ${T.border}; }
    .dqly-row:last-child { border-bottom: none; }
    .dqly-row-icon {
      width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .dqly-row-desc { font-size: 0.74rem; color: ${T.text}; line-height: 1.3; }
    .dqly-row-meta { font-family: 'Share Tech Mono', monospace; font-size: 0.62rem; color: ${T.muted}; margin-top: 2px; }
    .dqly-row-points { font-family: 'Orbitron', sans-serif; font-size: 0.82rem; font-weight: 700; flex-shrink: 0; margin-left: auto; }
    .dqly-empty { font-family: 'Share Tech Mono', monospace; font-size: 0.7rem; color: ${T.muted}; letter-spacing: 1px; text-align: center; padding: 12px 0; }

    .dqly-view-all {
      align-self: center; margin-top: 4px;
      padding: 8px 22px;
      background: transparent; border: 1px solid ${T.cyan}60; color: ${T.cyan};
      font-family: 'Orbitron', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
      cursor: pointer; transition: background 0.2s;
    }
    .dqly-view-all:hover { background: ${T.cyan}15; }
  `;
  document.head.appendChild(s);
};

const IconCoin = ({ size = 22, color = T.yellow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.5a2.5 2.5 0 012.5-1.5c1.5 0 2.5.8 2.5 2s-1 1.5-2.5 2-2.5.6-2.5 2 1 2 2.5 2a2.5 2.5 0 002.5-1.5" />
  </svg>
);
const IconGift = ({ size = 15, color = T.purple }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="9" width="18" height="11" rx="1" /><path d="M12 9v11M7.5 9a2.5 2.5 0 010-5C10 4 12 9 12 9s2-5 4.5-5a2.5 2.5 0 010 5" />
  </svg>
);
const IconShield = ({ size = 15, color = T.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
  </svg>
);
const IconStar = ({ size = 15, color = T.pink }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6L12 3z" />
  </svg>
);

const TYPE_META = {
  admin_grant: { icon: <IconShield />, label: "Admin Grant", bg: `${T.cyan}15` },
  combo_bonus: { icon: <IconGift />, label: "Combo Bonus", bg: `${T.purple}15` },
};

function metaForType(type) {
  if (TYPE_META[type]) return TYPE_META[type];
  const label = (type || "Activity").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return { icon: <IconStar />, label, bg: `${T.pink}15` };
}

function formatDateTime(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function LoyaltyOverview({ loyalty, onViewAll }) {
  useEffect(() => { injectStyles(); }, []);

  const points = loyalty?.current_points ?? 0;
  const transactions = loyalty?.transactions || [];

  return (
    <div className="dqly-section">
      <div className="dqly-heading"><IconCoin size={18} /> Loyalty Points</div>
      <div className="dqly-wrap">
        <div className="dqly-balance">
          <div className="dqly-balance-icon"><IconCoin /></div>
          <div>
            <div className="dqly-balance-num">{points}</div>
            <div className="dqly-balance-label">Current Balance</div>
          </div>
        </div>

        <div className="dqly-list">
          <div className="dqly-list-title">Recent Activity</div>
          {transactions.length ? (
            transactions.slice(0, 5).map(tx => {
              const meta = metaForType(tx.transaction_type);
              const positive = tx.points >= 0;
              return (
                <div className="dqly-row" key={tx.id}>
                  <div className="dqly-row-icon" style={{ background: meta.bg }}>{meta.icon}</div>
                  <div>
                    <div className="dqly-row-desc">{tx.description || meta.label}</div>
                    <div className="dqly-row-meta">
                      {meta.label} · {formatDateTime(tx.created_at)}
                      {tx.granted_by_name ? ` · by ${tx.granted_by_name}` : ""}
                    </div>
                  </div>
                  <div className="dqly-row-points" style={{ color: positive ? T.green : T.red }}>
                    {positive ? "+" : ""}{tx.points}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="dqly-empty">No loyalty activity yet.</div>
          )}
        </div>

        {transactions.length > 0 && (
          <button className="dqly-view-all" onClick={onViewAll}>View Full History</button>
        )}
      </div>
    </div>
  );
}
