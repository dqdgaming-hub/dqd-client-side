import { UserPlus, X } from "lucide-react";

// Rows for the extra players on a booking (you are always player 1).
export default function MemberFields({ members, setMembers, errors = [], maxExtra, disabled }) {
  const update = (i, key, value) =>
    setMembers(members.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));
  const remove = (i) => setMembers(members.filter((_, idx) => idx !== i));
  const add = () => setMembers([...members, { name: "", phone: "" }]);
  const canAdd = maxExtra == null || members.length < maxExtra;

  return (
    <div>
      {members.map((m, i) => (
        <div className="u-member" key={i}>
          <div>
            <input
              className={`u-input${errors[i]?.name ? " bad" : ""}`}
              placeholder={`Player ${i + 2} name`}
              aria-label={`Player ${i + 2} name`}
              value={m.name}
              maxLength={100}
              disabled={disabled}
              onChange={(e) => update(i, "name", e.target.value)}
            />
            {errors[i]?.name && <span className="u-err-text">{errors[i].name}</span>}
          </div>
          <div>
            <input
              className={`u-input${errors[i]?.phone ? " bad" : ""}`}
              placeholder="Mobile (optional)"
              aria-label={`Player ${i + 2} mobile number`}
              type="tel"
              inputMode="tel"
              value={m.phone}
              maxLength={20}
              disabled={disabled}
              onChange={(e) => update(i, "phone", e.target.value)}
            />
            {errors[i]?.phone && <span className="u-err-text">{errors[i].phone}</span>}
          </div>
          <button type="button" className="u-btn danger sm" style={{ minHeight: 44 }} disabled={disabled} onClick={() => remove(i)} aria-label={`Remove player ${i + 2}`}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
      <button type="button" className="u-btn sm" onClick={add} disabled={disabled || !canAdd}>
        <UserPlus size={16} aria-hidden="true" /> Add player
      </button>
      {!canAdd && <span className="u-small" style={{ marginLeft: 8 }}>Maximum players reached.</span>}
    </div>
  );
}
