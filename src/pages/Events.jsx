import { useEffect, useMemo, useState } from "react";
import { getHomePage } from "../components/api/homeapi";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const formatTime = (time) =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(`2026-01-01T${time}`));

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        setLoading(true);
        setError("");
        const homeData = await getHomePage();
        const nextEvents = Array.isArray(homeData?.data?.events)
          ? homeData.data.events
          : Array.isArray(homeData?.events)
            ? homeData.events
            : [];

        if (isMounted) {
          setEvents(nextEvents);
        }
      } catch (err) {
        if (isMounted) {
          setError("Events are taking a snack break. Try again soon.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredEvent = useMemo(() => events[0], [events]);

  return (
    <section className="events-zone" aria-labelledby="events-heading">
      <style>{`
        .events-zone {
          position: relative;
          overflow: hidden;
          padding: clamp(3rem, 7vw, 6.5rem) clamp(1rem, 4vw, 4rem);
          color: #f8fbff;
          background:
            radial-gradient(circle at 12% 18%, rgba(255, 213, 79, 0.28), transparent 30%),
            radial-gradient(circle at 88% 10%, rgba(49, 214, 255, 0.24), transparent 32%),
            linear-gradient(135deg, #14151f 0%, #271d37 45%, #122630 100%);
          isolation: isolate;
        }

        .events-zone::before,
        .events-zone::after {
          content: "";
          position: absolute;
          inset: auto;
          z-index: -1;
          border-radius: 999px;
          filter: blur(2px);
          opacity: 0.85;
          animation: floaty 8s ease-in-out infinite;
        }

        .events-zone::before {
          width: 12rem;
          height: 12rem;
          right: -4rem;
          bottom: 12%;
          background: repeating-linear-gradient(45deg, #ffcf33 0 12px, #ff5b8f 12px 24px);
        }

        .events-zone::after {
          width: 9rem;
          height: 9rem;
          left: -3rem;
          top: 30%;
          background: repeating-linear-gradient(-45deg, #3ff0c9 0 10px, #6d7cff 10px 20px);
          animation-delay: -3s;
        }

        .events-shell {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .events-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          margin-bottom: 0.85rem;
          color: #ffdf6e;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .events-kicker::before {
          content: "";
          width: 0.8rem;
          height: 0.8rem;
          border-radius: 50%;
          background: #35f4ca;
          box-shadow: 0 0 0 0 rgba(53, 244, 202, 0.55);
          animation: ping 1.7s infinite;
        }

        .events-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 1.5rem;
          align-items: end;
          margin-bottom: clamp(1.5rem, 4vw, 3rem);
        }

        .events-title {
          margin: 0;
          max-width: 760px;
          font-size: clamp(2.35rem, 7vw, 5.7rem);
          line-height: 0.92;
          letter-spacing: 0;
        }

        .events-title span {
          color: #35f4ca;
          text-shadow: 0.12em 0.12em 0 #ff4f91;
        }

        .events-count {
          min-width: 8rem;
          padding: 1rem 1.1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1.25rem;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22);
          backdrop-filter: blur(14px);
          text-align: center;
        }

        .events-count strong {
          display: block;
          font-size: 2rem;
          color: #ffdf6e;
        }

        .events-count small {
          color: rgba(248, 251, 255, 0.72);
          font-weight: 700;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
          gap: clamp(1rem, 2vw, 1.4rem);
        }

        .event-card {
          position: relative;
          overflow: hidden;
          min-height: 420px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 1.35rem;
          background: #10131d;
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.32);
          transform: translateY(0) rotate(0);
          animation: cardPop 0.65s ease both;
          transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
        }

        .event-card:nth-child(2n) {
          animation-delay: 90ms;
        }

        .event-card:hover {
          transform: translateY(-10px) rotate(-1deg);
          border-color: rgba(53, 244, 202, 0.55);
          box-shadow: 0 28px 80px rgba(53, 244, 202, 0.18);
        }

        .event-card.is-featured {
          grid-column: span 2;
        }

        .event-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.02);
          transition: transform 420ms ease;
        }

        .event-card:hover .event-image {
          transform: scale(1.1) rotate(1deg);
        }

        .event-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(16, 19, 29, 0.1) 0%, rgba(16, 19, 29, 0.72) 48%, rgba(16, 19, 29, 0.96) 100%),
            linear-gradient(90deg, rgba(255, 79, 145, 0.2), rgba(53, 244, 202, 0.16));
        }

        .event-content {
          position: relative;
          z-index: 1;
          display: flex;
          min-height: 420px;
          flex-direction: column;
          justify-content: flex-end;
          gap: 1rem;
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .event-date-chip {
          align-self: flex-start;
          padding: 0.55rem 0.8rem;
          border-radius: 999px;
          background: #ffdf6e;
          color: #14151f;
          font-size: 0.78rem;
          font-weight: 900;
          box-shadow: 0 10px 24px rgba(255, 223, 110, 0.28);
          animation: wiggle 3.2s ease-in-out infinite;
        }

        .event-name {
          margin: 0;
          font-size: clamp(1.55rem, 4vw, 3.2rem);
          line-height: 0.98;
        }

        .event-description {
          display: -webkit-box;
          margin: 0;
          overflow: hidden;
          color: rgba(248, 251, 255, 0.78);
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          line-height: 1.55;
        }

        .event-meta {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.65rem;
        }

        .event-pill {
          min-width: 0;
          padding: 0.72rem 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0.9rem;
          background: rgba(255, 255, 255, 0.11);
          backdrop-filter: blur(12px);
        }

        .event-pill small,
        .event-pill strong {
          display: block;
          overflow-wrap: anywhere;
        }

        .event-pill small {
          margin-bottom: 0.25rem;
          color: rgba(248, 251, 255, 0.58);
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .event-pill strong {
          color: #ffffff;
          font-size: 0.9rem;
        }

        .event-button {
          display: inline-flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: 0;
          border-radius: 999px;
          padding: 0.95rem 1rem;
          color: #11131c;
          background: linear-gradient(135deg, #35f4ca, #ffdf6e);
          font-weight: 950;
          text-decoration: none;
          box-shadow: 0 16px 34px rgba(53, 244, 202, 0.2);
          transition: transform 180ms ease, filter 180ms ease;
        }

        .event-button:hover {
          transform: translateY(-2px) scale(1.01);
          filter: saturate(1.2);
        }

        .events-state {
          display: grid;
          min-height: 290px;
          place-items: center;
          border: 1px dashed rgba(255, 255, 255, 0.26);
          border-radius: 1.35rem;
          background: rgba(255, 255, 255, 0.08);
          text-align: center;
        }

        .events-loader {
          width: 4.5rem;
          height: 4.5rem;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #35f4ca, #ffdf6e, #ff4f91, #35f4ca);
          animation: spin 0.9s linear infinite;
          mask: radial-gradient(circle, transparent 45%, #000 47%);
        }

        @keyframes cardPop {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes ping {
          70%, 100% {
            box-shadow: 0 0 0 0.85rem rgba(53, 244, 202, 0);
          }
        }

        @keyframes wiggle {
          0%, 80%, 100% {
            transform: rotate(0deg);
          }
          85% {
            transform: rotate(4deg);
          }
          90% {
            transform: rotate(-4deg);
          }
        }

        @keyframes floaty {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -1rem, 0) rotate(9deg);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(1turn);
          }
        }

        @media (max-width: 820px) {
          .events-zone {
            padding: 2.4rem 0.85rem 3rem;
          }

          .events-header {
            grid-template-columns: 1fr;
          }

          .events-title {
            max-width: 10ch;
          }

          .events-count {
            justify-self: start;
            min-width: 7rem;
            padding: 0.8rem 1rem;
          }

          .event-card.is-featured {
            grid-column: span 1;
          }

          .events-grid {
            display: flex;
            gap: 0.95rem;
            overflow-x: auto;
            padding: 0.25rem 0.1rem 1rem;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
          }

          .events-grid::-webkit-scrollbar {
            display: none;
          }

          .event-card {
            flex: 0 0 min(88vw, 360px);
            min-height: 500px;
            scroll-snap-align: center;
          }

          .event-content {
            min-height: 500px;
          }

          .event-meta {
            grid-template-columns: 1fr;
          }

          .event-pill {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
          }

          .event-pill small {
            margin-bottom: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="events-shell">
        <div className="events-kicker">Live from the fun calendar</div>

        <div className="events-header">
          <h2 className="events-title" id="events-heading">
            Upcoming <span>Events</span>
          </h2>

          <div className="events-count" aria-label={`${events.length} events available`}>
            <strong>{events.length}</strong>
            <small>{events.length === 1 ? "event" : "events"} ready</small>
          </div>
        </div>

        {loading && (
          <div className="events-state" role="status" aria-label="Loading events">
            <div className="events-loader" />
          </div>
        )}

        {!loading && error && <div className="events-state">{error}</div>}

        {!loading && !error && events.length === 0 && (
          <div className="events-state">No events yet. The calendar is stretching.</div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="events-grid">
            {events.map((event) => (
              <article
                className={`event-card ${event.id === featuredEvent?.id ? "is-featured" : ""}`}
                key={event.id}
              >
                <img className="event-image" src={event.image} alt={event.title} loading="lazy" />
                <div className="event-overlay" />

                <div className="event-content">
                  <div className="event-date-chip">{formatDate(event.event_date)}</div>

                  <div>
                    <h3 className="event-name">{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                  </div>

                  <div className="event-meta" aria-label={`${event.title} details`}>
                    <div className="event-pill">
                      <small>Time</small>
                      <strong>
                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </strong>
                    </div>

                    <div className="event-pill">
                      <small>Price</small>
                      <strong>{formatPrice(event.price)}</strong>
                    </div>

                    <div className="event-pill">
                      <small>Slots</small>
                      <strong>{event.available_slots} left</strong>
                    </div>
                  </div>

                  <a className="event-button" href={`/sign-in`}>
                    Book this madness
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Events;
