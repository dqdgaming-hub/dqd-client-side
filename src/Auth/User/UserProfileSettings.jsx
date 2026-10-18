import { useEffect, useState } from "react";
import UserLayout from "./UserLayout";
import useApi from "../../hooks/useApi";
import { adminApi } from "../api/adminapi";
import { apiError, isEmail, isPhone, todayISO, userCss } from "./common/userUi";

import { Star } from "lucide-react";
const css = `
.ps-photo { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
.ps-photo img, .ps-photo .ph { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; background: #0c0e17; border: 1px solid #2a3046;
  display: flex; align-items: center; justify-content: center; font-size: 28px; color: #00e5cc; font-weight: 700; }
.ps-photo input { display: none; }
.ps-pass { position: relative; }
.ps-pass .u-input { padding-right: 64px; }
.ps-pass button { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: 0; color: #00e5cc; font-size: 13px; cursor: pointer; padding: 6px; }
`;

const MAX_PHOTO_MB = 5;
const EMPTY_PW = { current_password: "", new_password: "", confirm_password: "" };

// Per-field messages from a DRF 400 (adminApi puts the body on err.body).
function fieldErrors(err) {
  const out = {};
  const body = err?.body;
  if (body && typeof body === "object" && !Array.isArray(body)) {
    for (const [k, v] of Object.entries(body)) {
      const msg = Array.isArray(v) ? v[0] : v;
      if (typeof msg === "string") out[k] = msg;
    }
  }
  return out;
}

function PasswordInput({ value, onChange, show, setShow, bad, autoComplete, label }) {
  return (
    <div className="ps-pass">
      <input
        className={`u-input${bad ? " bad" : ""}`}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-label={label}
        maxLength={128}
      />
      <button type="button" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
    </div>
  );
}

function ProfileForm({ initial, onSaved }) {
  const [form, setForm] = useState(() => ({
    first_name: initial.first_name ?? "",
    last_name: initial.last_name ?? "",
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    dob: initial.dob ?? "",
    gender: initial.gender ?? "",
  }));
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(initial.profile_image || null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => () => preview?.startsWith("blob:") && URL.revokeObjectURL(preview), [preview]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: "" }));
  };

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((x) => ({ ...x, profile_image: "Choose an image file (JPG, PNG or WebP)." }));
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setErrors((x) => ({ ...x, profile_image: `Photo must be smaller than ${MAX_PHOTO_MB} MB.` }));
      return;
    }
    setErrors((x) => ({ ...x, profile_image: "" }));
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (form.first_name.length > 150) e.first_name = "First name is too long";
    if (form.email.trim() && !isEmail(form.email)) e.email = "Enter a valid email, like name@example.com";
    if (form.phone.trim() && !isPhone(form.phone)) e.phone = "Enter a valid mobile number (8–15 digits)";
    if (!form.email.trim() && !form.phone.trim() && !initial.phone) e.email = "Keep at least a mobile number or an email on your account";
    if (form.dob && form.dob > todayISO()) e.dob = "Date of birth can't be in the future";
    setErrors(e);
    return Object.keys(e).filter((k) => e[k]).length === 0;
  };

  const save = async (ev) => {
    ev.preventDefault();
    setMessage(null);
    if (!validate()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      if (photo) fd.append("profile_image", photo);
      fd.append("first_name", form.first_name.trim());
      fd.append("last_name", form.last_name.trim());
      fd.append("email", form.email.trim());
      // Optional fields only when filled, so the API leaves them unchanged otherwise.
      if (form.phone.trim()) fd.append("phone", form.phone.trim());
      if (form.dob) fd.append("dob", form.dob);
      if (form.gender) fd.append("gender", form.gender);
      const res = await adminApi.updateProfile(fd);
      setPhoto(null);
      setMessage({ ok: true, text: res?.message || "Profile saved." });
      onSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage({ ok: false, text: apiError(err, "Couldn't save your profile.") });
    } finally {
      setSaving(false);
    }
  };

  const initials = `${form.first_name[0] || ""}${form.last_name[0] || ""}`.toUpperCase() || "P";

  const input = (key, label, props = {}) => (
    <label className="u-field">
      <span>{label}</span>
      <input className={`u-input${errors[key] ? " bad" : ""}`} value={form[key]} onChange={set(key)} {...props} />
      {errors[key] && <span className="u-err-text">{errors[key]}</span>}
    </label>
  );

  return (
    <form className="u-card" onSubmit={save} noValidate>
      <h2>Your details</h2>
      {message && <div className={message.ok ? "u-ok" : "u-error"} role="status">{message.text}</div>}

      <div className="ps-photo">
        {preview ? <img src={preview} alt="Your profile" /> : <div className="ph" aria-hidden="true">{initials}</div>}
        <div>
          <label className="u-btn sm">
            Change photo
            <input type="file" accept="image/*" onChange={pickPhoto} />
          </label>
          <div className="u-small" style={{ marginTop: 4 }}>JPG or PNG, up to {MAX_PHOTO_MB} MB.</div>
          {errors.profile_image && <span className="u-err-text">{errors.profile_image}</span>}
        </div>
      </div>

      <div className="u-form-grid">
        {input("first_name", "First name", { autoComplete: "given-name", maxLength: 150 })}
        {input("last_name", "Last name", { autoComplete: "family-name", maxLength: 150 })}
        {input("email", "Email", { type: "email", autoComplete: "email", maxLength: 254 })}
        {input("phone", "Mobile number", { type: "tel", autoComplete: "tel", maxLength: 20 })}
        {input("dob", <>Date of birth <em>(optional)</em></>, { type: "date", max: todayISO() })}
        <label className="u-field">
          <span>Gender <em>(optional)</em></span>
          <select className="u-input" value={form.gender} onChange={set("gender")}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          {errors.gender && <span className="u-err-text">{errors.gender}</span>}
        </label>
      </div>

      <button className="u-btn primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
    </form>
  );
}

function PasswordForm() {
  const [pw, setPw] = useState(EMPTY_PW);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => {
    setPw((p) => ({ ...p, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!pw.current_password) e.current_password = "Enter your current password";
    if (pw.new_password.length < 8) e.new_password = "Use at least 8 characters";
    else if (/^\d+$/.test(pw.new_password)) e.new_password = "Password can't be only numbers";
    else if (pw.new_password === pw.current_password) e.new_password = "New password must be different from the current one";
    if (pw.confirm_password !== pw.new_password) e.confirm_password = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (ev) => {
    ev.preventDefault();
    setMessage(null);
    if (!validate()) return;
    setSaving(true);
    try {
      await adminApi.changePassword(pw);
      setPw(EMPTY_PW);
      setMessage({ ok: true, text: "Password changed." });
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage({ ok: false, text: apiError(err, "Couldn't change your password.") });
    } finally {
      setSaving(false);
    }
  };

  const row = (key, label, autoComplete) => (
    <label className="u-field">
      <span>{label}</span>
      <PasswordInput value={pw[key]} onChange={set(key)} show={show} setShow={setShow} bad={!!errors[key]} autoComplete={autoComplete} label={label} />
      {errors[key] && <span className="u-err-text">{errors[key]}</span>}
    </label>
  );

  return (
    <form className="u-card" onSubmit={save} noValidate>
      <h2>Change password</h2>
      {message && <div className={message.ok ? "u-ok" : "u-error"} role="status">{message.text}</div>}
      {row("current_password", "Current password", "current-password")}
      {row("new_password", "New password", "new-password")}
      {row("confirm_password", "Confirm new password", "new-password")}
      <p className="u-small" style={{ marginTop: -4 }}>At least 8 characters, not only numbers.</p>
      <button className="u-btn primary" disabled={saving}>{saving ? "Saving…" : "Change password"}</button>
    </form>
  );
}

export default function UserProfileSettings() {
  const { data, error, loading, reload } = useApi(() => adminApi.getProfile(), "profile");

  return (
    <UserLayout>
      <style>{userCss + css}</style>
      <div className="u-page" style={{ maxWidth: 820 }}>
        <div className="u-head">
          <div>
            <h1>Profile settings</h1>
            <p>
              {data?.loyalty_points != null ? <><Star className="ico" size="1.05em" aria-hidden="true" /> {Number(data.loyalty_points).toLocaleString("en-IN")} loyalty points · </> : ""}
              Keep your details up to date.
            </p>
          </div>
        </div>

        {error && (
          <div className="u-error">
            {apiError(error, "Couldn't load your profile.")}
            <button className="u-btn sm" onClick={reload}>Try again</button>
          </div>
        )}
        {loading && !data && <div className="u-empty">Loading…</div>}

        {data && (
          <div className="u-stack">
            <ProfileForm key={data.id} initial={data} onSaved={reload} />
            <PasswordForm />
          </div>
        )}
      </div>
    </UserLayout>
  );
}
