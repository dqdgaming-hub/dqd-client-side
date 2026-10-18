import { Link } from "react-router-dom";
import UserLayout from "../UserLayout";
import useApi from "../../../hooks/useApi";
import { getComboPacks } from "../../api/userapi";
import { apiError, asList, money, userCss } from "../common/userUi";

import { Gamepad2, Popcorn, Star, Users } from "lucide-react";
export default function ComboPacks() {
  const { data, error, loading, reload } = useApi(getComboPacks, "combos");
  const combos = asList(data);

  return (
    <UserLayout>
      <style>{userCss}</style>
      <div className="u-page">
        <div className="u-head">
          <div>
            <h1>Combo packs</h1>
            <p>Game time plus snacks, at one price.</p>
          </div>
          <Link className="u-btn" to="/user/bookings">My bookings</Link>
        </div>

        {error && (
          <div className="u-error">
            {apiError(error, "Couldn't load combo packs.")}
            <button className="u-btn sm" onClick={reload}>Try again</button>
          </div>
        )}

        {loading && !data ? (
          <div className="u-empty">Loading combo packs…</div>
        ) : combos.length === 0 ? (
          !error && <div className="u-empty">No combo packs available right now.</div>
        ) : (
          <div className="u-grid">
            {combos.map((c) => {
              const games = (c.gaming_items || []).map((g) => g.name).filter(Boolean);
              return (
                <article className="u-item" key={c.id}>
                  {c.image ? (
                    <img className="u-item-img" src={c.image} alt="" loading="lazy" />
                  ) : (
                    <div className="u-item-img" aria-hidden="true"><Popcorn size={40} strokeWidth={1.5} /></div>
                  )}
                  <div className="u-item-body">
                    <h3>{c.name}</h3>
                    {c.description && <span className="u-small">{c.description}</span>}
                    <span className="u-small">
                      {games.length > 0 && <span className="u-ico-row"><Gamepad2 className="ico" size="1.05em" aria-hidden="true" /> {games.join(", ")}</span>}
                      {c.snack_name && <span className="u-ico-row"><Popcorn className="ico" size="1.05em" aria-hidden="true" /> {c.snack_name}</span>}
                      <span className="u-ico-row"><Users className="ico" size="1.05em" aria-hidden="true" /> Up to {c.max_people || 1} {Number(c.max_people) === 1 ? "person" : "people"}
                      {Number(c.loyalty_bonus) > 0 && <> · <Star className="ico" size="1.05em" aria-hidden="true" /> +{c.loyalty_bonus} points</>}</span>
                    </span>
                    <span className="u-price" style={{ fontSize: 18 }}>{money(c.combo_price)}</span>
                    <div className="u-item-foot">
                      <Link className="u-btn sm primary" to={`/user/book/combo/${c.id}`}>Book this combo</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

    </UserLayout>
  );
}
