import { Link } from "react-router-dom";
import UserLayout from "../UserLayout";
import useApi from "../../../hooks/useApi";
import { getGameItemsForBooking, getUserLoyalty } from "../../api/userapi";
import { apiError, asList, userCss } from "../common/userUi";

import { Gamepad2 } from "lucide-react";
const POINTS_PER_HOUR = 100;

const css = `
.ly-meter { margin-bottom: 18px; }
.ly-meter-top { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
.ly-meter-top strong { font-family: 'Orbitron', sans-serif; font-size: 14px; letter-spacing: 1px; color: #fff; text-transform: uppercase; }
.ly-track { position: relative; height: 12px; border-radius: 999px; background: rgba(5,5,15,.9); border: 1px solid rgba(0,245,255,.18); overflow: hidden; }
.ly-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #00f5ff, #7b2fff, #ff006e); background-size: 200% 100%;
  box-shadow: 0 0 16px rgba(0,245,255,.45); transform-origin: left; animation: lyGrow 1.1s .3s cubic-bezier(.22,1,.36,1) both, lyFlow 3s linear infinite; }
@keyframes lyGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes lyFlow { from { background-position: 0 0; } to { background-position: -200% 0; } }
.ly-ticks { display: flex; justify-content: space-between; margin-top: 6px; font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #6b6b8a; }
.ly-pick { margin: 0 0 14px; font-family: 'Orbitron', sans-serif; font-size: 15px; letter-spacing: 1.2px; text-transform: uppercase; color: #fff; }
`;

// Points balance + pick a game. Booking itself uses the shared booking flow
// (/user/book/loyalty/:id): same date, time and players steps as every booking.
export default function LoyaltySlotRedeemer() {
  const loyaltyApi = useApi(getUserLoyalty, "loyalty");
  const itemsApi = useApi(getGameItemsForBooking, "items");
  const points = loyaltyApi.data?.loyalty_points ?? 0;
  const redeemable = loyaltyApi.data?.redeemable_hours ?? Math.floor(points / POINTS_PER_HOUR);
  const items = asList(itemsApi.data).filter((g) => !g.maintenance_mode);
  const notEnough = loyaltyApi.data && redeemable < 1;
  const toNext = POINTS_PER_HOUR - (points % POINTS_PER_HOUR);
  const progress = ((points % POINTS_PER_HOUR) / POINTS_PER_HOUR) * 100;

  return (
    <UserLayout>
      <style>{userCss + css}</style>
      <div className="u-page">
        <div className="u-head">
          <div>
            <h1>Use your points</h1>
            <p>{POINTS_PER_HOUR} points = 1 free hour of play.</p>
          </div>
          <Link className="u-btn" to="/user/bookings">My bookings</Link>
        </div>

        <div className="u-stats" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 16 }}>
          <div className="u-stat"><b>{loyaltyApi.data ? points.toLocaleString("en-IN") : "…"}</b><span>Your points</span></div>
          <div className="u-stat"><b>{loyaltyApi.data ? redeemable : "…"}</b><span>Free hours available</span></div>
        </div>

        {loyaltyApi.data && (
          <section className="u-card ly-meter" aria-label="Progress to your next free hour">
            <div className="ly-meter-top">
              <strong>Next free hour</strong>
              <span className="u-small">
                {toNext} more point{toNext === 1 ? "" : "s"} to unlock {redeemable > 0 ? "another" : "your first"} free hour
              </span>
            </div>
            <div className="ly-track" role="progressbar" aria-valuemin={0} aria-valuemax={POINTS_PER_HOUR} aria-valuenow={points % POINTS_PER_HOUR}>
              <div className="ly-fill" style={{ width: `${Math.max(progress, 2)}%` }} />
            </div>
            <div className="ly-ticks"><span>0</span><span>50</span><span>{POINTS_PER_HOUR}</span></div>
          </section>
        )}

        {(loyaltyApi.error || itemsApi.error) && (
          <div className="u-error">
            {apiError(loyaltyApi.error || itemsApi.error, "Couldn't load your points.")}{" "}
            <button className="u-btn sm" onClick={() => { loyaltyApi.reload(); itemsApi.reload(); }}>Try again</button>
          </div>
        )}

        {notEnough ? (
          <div className="u-empty">
            You need at least {POINTS_PER_HOUR} points for a free hour. You earn points with every confirmed booking.
            <div style={{ marginTop: 14 }}><Link className="u-btn primary" to="/user/game-items">Book a game</Link></div>
          </div>
        ) : itemsApi.loading && !itemsApi.data ? (
          <div className="u-empty">Loading games…</div>
        ) : items.length === 0 ? (
          !itemsApi.error && <div className="u-empty">No games available right now.</div>
        ) : (
          <>
            <h2 className="ly-pick">Pick a game</h2>
            <div className="u-grid">
              {items.map((g) => (
                <article className="u-item" key={g.id}>
                  {g.image ? <img className="u-item-img" src={g.image} alt="" loading="lazy" /> : <div className="u-item-img" aria-hidden="true"><Gamepad2 size={40} strokeWidth={1.5} /></div>}
                  <div className="u-item-body">
                    <h3>{g.name}</h3>
                    {g.category_name && <span className="u-small">{g.category_name}</span>}
                    <div className="u-item-foot">
                      <Link className="u-btn sm primary" to={`/user/book/loyalty/${g.id}`}>Use points</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
}
