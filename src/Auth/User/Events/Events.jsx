import { Link } from "react-router-dom";
import UserLayout from "../UserLayout";
import useApi from "../../../hooks/useApi";
import { getUpcomingEvents } from "../../api/userapi";
import { apiError, asList, money, niceDate, niceTime, userCss } from "../common/userUi";

import { CalendarDays, Clock, Ticket } from "lucide-react";
function seatsTag(ev) {
  const left = Number(ev.available_slots);
  if (!Number.isFinite(left)) return null;
  if (left <= 0) return <span className="u-tag bad">Sold out</span>;
  if (left <= 5) return <span className="u-tag warn">Only {left} left</span>;
  return <span className="u-tag ok">{left} seats left</span>;
}

export default function Events() {
  const { data, error, loading, reload } = useApi(getUpcomingEvents, "events");
  const events = asList(data);

  return (
    <UserLayout>
      <style>{userCss}</style>
      <div className="u-page">
        <div className="u-head">
          <div>
            <h1>Events</h1>
            <p>Tournaments and special nights at DQD Gaming.</p>
          </div>
          <Link className="u-btn" to="/user/bookings">My bookings</Link>
        </div>

        {error && (
          <div className="u-error">
            {apiError(error, "Couldn't load events.")}
            <button className="u-btn sm" onClick={reload}>Try again</button>
          </div>
        )}

        {loading && !data ? (
          <div className="u-empty">Loading events…</div>
        ) : events.length === 0 ? (
          !error && <div className="u-empty">No upcoming events right now. Check back soon!</div>
        ) : (
          <div className="u-grid">
            {events.map((ev) => {
              const soldOut = Number(ev.available_slots) <= 0;
              return (
                <article className="u-item" key={ev.id}>
                  {ev.image ? (
                    <img className="u-item-img" src={ev.image} alt="" loading="lazy" />
                  ) : (
                    <div className="u-item-img" aria-hidden="true"><Ticket size={40} strokeWidth={1.5} /></div>
                  )}
                  <div className="u-item-body">
                    <h3>{ev.title}</h3>
                    <span className="u-small">
                      <span className="u-ico-row"><CalendarDays className="ico" size="1.05em" aria-hidden="true" /> {niceDate(ev.event_date)}</span>
                      <br />
                      <span className="u-ico-row"><Clock className="ico" size="1.05em" aria-hidden="true" /> {niceTime(ev.start_time)} – {niceTime(ev.end_time)}</span>
                    </span>
                    {ev.description && (
                      <span className="u-small" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {ev.description}
                      </span>
                    )}
                    <div className="u-row" style={{ justifyContent: "space-between" }}>
                      <span className="u-price" style={{ fontSize: 18 }}>{Number(ev.price) > 0 ? money(ev.price) : "Free"}</span>
                      {seatsTag(ev)}
                    </div>
                    <div className="u-item-foot">
                      {soldOut ? (
                        <button className="u-btn sm" disabled>Sold out</button>
                      ) : (
                        <Link className="u-btn sm primary" to={`/user/book/event/${ev.id}`}>Book seats</Link>
                      )}
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
