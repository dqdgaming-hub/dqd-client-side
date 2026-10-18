import { niceTime } from "./userUi";

// One-hour slot buttons. Booked or past slots are shown but disabled.
export default function SlotPicker({ slots, value, onPick, hours = 1, disabled }) {
  const startIdx = slots.findIndex((s) => s.start_time === value);
  if (slots.length === 0) return <p className="u-small">No time slots for this date.</p>;
  if (!slots.some((s) => s.available)) return <p className="u-small">Fully booked on this date. Please pick another day.</p>;

  return (
    <div className="u-slots" role="group" aria-label="Start time">
      {slots.map((s, i) => {
        const inRange = startIdx >= 0 && i >= startIdx && i < startIdx + hours;
        return (
          <button
            type="button"
            key={s.start_time}
            className={`u-chip${inRange ? " on" : ""}`}
            disabled={disabled || !s.available}
            aria-pressed={i === startIdx}
            title={s.available ? `${niceTime(s.start_time)} – ${niceTime(s.end_time)}` : "Not available"}
            onClick={() => onPick(s.start_time)}
          >
            {niceTime(s.start_time)}
          </button>
        );
      })}
    </div>
  );
}

