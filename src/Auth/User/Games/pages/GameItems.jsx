import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserLayout from "../../UserLayout";
import useApi from "../../../../hooks/useApi";
import { getGameCategories, getGames } from "../../../api/userapi";
import { apiError, asList, money, userCss } from "../../common/userUi";

import { Gamepad2 } from "lucide-react";
export default function GameItems() {
  const [category, setCategory] = useState("");
  const [typed, setTyped] = useState("");
  const [search, setSearch] = useState("");

  // Wait until the user stops typing before searching.
  useEffect(() => {
    const id = setTimeout(() => setSearch(typed.trim()), 300);
    return () => clearTimeout(id);
  }, [typed]);

  const { data: cats } = useApi(getGameCategories, "categories");
  const params = {};
  if (category) params.category = category;
  if (search) params.search = search;
  const { data, error, loading, reload } = useApi(() => getGames(params), JSON.stringify(params));

  const categories = asList(cats);
  const games = asList(data);

  return (
    <UserLayout>
      <style>{userCss}</style>
      <div className="u-page">
        <div className="u-head">
          <div>
            <h1>Book a game</h1>
            <p>Pick a game, choose a time, and you're set.</p>
          </div>
          <Link className="u-btn" to="/user/bookings">My bookings</Link>
        </div>

        <label className="u-field" style={{ maxWidth: 420 }}>
          <span>Search</span>
          <input
            className="u-input"
            type="search"
            placeholder="Game name…"
            value={typed}
            maxLength={60}
            onChange={(e) => setTyped(e.target.value)}
          />
        </label>

        {categories.length > 0 && (
          <div className="u-chips" style={{ marginBottom: 16 }} role="group" aria-label="Category">
            <button className={`u-chip${category === "" ? " on" : ""}`} aria-pressed={category === ""} onClick={() => setCategory("")}>
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`u-chip${category === c.id ? " on" : ""}`}
                aria-pressed={category === c.id}
                onClick={() => setCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="u-error">
            {apiError(error, "Couldn't load games.")}
            <button className="u-btn sm" onClick={reload}>Try again</button>
          </div>
        )}

        {loading && !data ? (
          <div className="u-empty">Loading games…</div>
        ) : games.length === 0 ? (
          !error && <div className="u-empty">{search ? `No games match “${search}”.` : "No games in this category yet."}</div>
        ) : (
          <div className="u-grid" style={{ opacity: loading ? 0.6 : 1 }}>
            {games.map((g) => (
              <article className="u-item" key={g.id}>
                {g.image ? (
                  <img className="u-item-img" src={g.image} alt="" loading="lazy" />
                ) : (
                  <div className="u-item-img" aria-hidden="true"><Gamepad2 size={40} strokeWidth={1.5} /></div>
                )}
                <div className="u-item-body">
                  <h3>{g.name}</h3>
                  <span className="u-small">
                    {g.category || "Game"} · {g.min_capacity}–{g.max_capacity} players
                  </span>
                  <span className="u-price">{money(g.price_per_hour)} / hour</span>
                  <div className="u-item-foot">
                    <Link className="u-btn sm" to={`/user/games/${g.id}`}>Details</Link>
                    {g.maintenance_mode ? (
                      <button className="u-btn sm" disabled>Unavailable</button>
                    ) : (
                      <Link className="u-btn sm primary" to={`/user/games/${g.id}/book`}>Book</Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
