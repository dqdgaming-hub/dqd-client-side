import { Link, useNavigate, useParams } from "react-router-dom";
import UserLayout from "../../UserLayout";
import useApi from "../../../../hooks/useApi";
import { getGameDetails } from "../../../api/userapi";
import { apiError, money, userCss } from "../../common/userUi";

import { Gamepad2 } from "lucide-react";
const css = `
.gd { display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; align-items: start; }
.gd-img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 14px; background: #0c0e17; display: flex; align-items: center; justify-content: center; font-size: 48px; }
.gd h1 { margin: 0 0 6px; font-size: 26px; color: #fff; }
@media (max-width: 760px) { .gd { grid-template-columns: 1fr; } .gd h1 { font-size: 22px; } }
`;

export default function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, error, loading, reload } = useApi(() => getGameDetails(id), id);
  const game = data?.data;

  return (
    <UserLayout>
      <style>{userCss + css}</style>
      <div className="u-page">
        <button className="u-back" onClick={() => navigate(-1)}>← Back</button>

        {error && (
          <div className="u-error">
            {error.response?.status === 404 ? "This game is no longer available." : apiError(error, "Couldn't load this game.")}
            {error.response?.status === 404 ? (
              <Link className="u-btn sm" to="/user/game-items">See all games</Link>
            ) : (
              <button className="u-btn sm" onClick={reload}>Try again</button>
            )}
          </div>
        )}

        {loading && !game && <div className="u-empty">Loading…</div>}

        {game && (
          <div className="gd">
            {game.image ? (
              <img className="gd-img" src={game.image} alt={game.name} />
            ) : (
              <div className="gd-img" aria-hidden="true"><Gamepad2 size={48} strokeWidth={1.5} /></div>
            )}
            <div className="u-card">
              <span className="u-small">{game.category?.name || "Game"}</span>
              <h1>{game.name}</h1>
              {game.maintenance_mode && <p><span className="u-tag bad">Under maintenance</span></p>}
              {game.description && <p className="u-muted" style={{ whiteSpace: "pre-line" }}>{game.description}</p>}
              <dl className="u-summary" style={{ margin: "16px 0" }}>
                <div><dt>Price</dt><dd className="u-price">{money(game.price_per_hour)} / hour</dd></div>
                <div><dt>Players</dt><dd>{game.min_capacity} – {game.max_capacity}</dd></div>
              </dl>
              {game.maintenance_mode ? (
                <button className="u-btn block" disabled>Not available right now</button>
              ) : (
                <Link className="u-btn primary block" to={`/user/games/${game.id}/book`}>Book this game</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
