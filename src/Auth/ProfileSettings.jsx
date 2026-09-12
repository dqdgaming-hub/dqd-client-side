import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle,
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  Settings2,
  ShieldCheck,
  Star,
  User,
  UserCog,
  XCircle,
} from "lucide-react";
import AdminLayout from "../Auth/Admin/AdminLayout";
import { adminApi } from "./api/adminapi";

// ─── Injected styles ──────────────────────────────────────────────────────────
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');

  @keyframes glitch-clip {
    0%,100% { clip-path: inset(0 0 98% 0); transform: translate(0); }
    20%      { clip-path: inset(33% 0 40% 0); transform: translate(-3px, 1px); }
    40%      { clip-path: inset(65% 0 20% 0); transform: translate(3px, -1px); }
    60%      { clip-path: inset(10% 0 75% 0); transform: translate(-1px, 2px); }
    80%      { clip-path: inset(80% 0 5%  0); transform: translate(2px, -2px); }
  }
  @keyframes border-pulse {
    0%,100% { box-shadow: 0 0 0px #00f5ff33; }
    50%      { box-shadow: 0 0 20px #00f5ff55; }
  }
  @keyframes spin-ring {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes tab-line {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── Reset ── */
  .ps * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Root ── */
  .ps {
    min-height: 100vh;
    color: #dde6ff;
    font-family: 'Share Tech Mono', monospace;
    padding: 40px 20px 72px;
    position: relative;
    overflow-x: hidden;
  }

  /* Scanline overlay */
  .ps::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg, transparent, transparent 2px,
      rgba(0,245,255,0.015) 2px, rgba(0,245,255,0.015) 4px
    );
    pointer-events: none;
    z-index: 0;
  }

  .ps-inner {
    position: relative;
    z-index: 1;
    max-width: 880px;
    margin: 0 auto;
    width: 100%;
  }

  /* ── Page header ── */
  .ps-header { margin-bottom: 36px; animation: fadeUp .4s ease both; }
  .ps-eyebrow {
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    letter-spacing: 4px;
    color: #ff2d78;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ps-eyebrow-line {
    flex: 1;
    max-width: 48px;
    height: 1px;
    background: linear-gradient(90deg, #ff2d78, transparent);
  }
  .ps-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(20px, 5vw, 32px);
    font-weight: 900;
    color: #00f5ff;
    text-shadow: 0 0 28px #00f5ff66;
    position: relative;
    display: inline-block;
    line-height: 1.15;
  }
  .ps-title::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    color: #ff2d78;
    animation: glitch-clip 5s infinite steps(1);
    pointer-events: none;
  }
  .ps-subtitle {
    font-size: 11px;
    color: #3a4a68;
    margin-top: 8px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  /* ── Card ── */
  .ps-card {
    background: linear-gradient(145deg, #090c18 0%, #070a12 100%);
    border: 1px solid #16203a;
    clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
    padding: 28px 32px 32px;
    margin-bottom: 20px;
    animation: border-pulse 4s ease-in-out infinite, fadeUp .45s ease both;
  }

  /* ── Avatar row ── */
  .ps-avatar-row {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 28px;
    padding-bottom: 28px;
    border-bottom: 1px solid #16203a;
    flex-wrap: wrap;
  }
  .ps-avatar-wrap {
    position: relative;
    width: 88px;
    height: 88px;
    flex-shrink: 0;
    cursor: pointer;
  }
  .ps-avatar-ring {
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    border: 2px solid transparent;
    background: conic-gradient(#00f5ff 0%, #ff2d78 40%, #ffe600 70%, #00f5ff 100%) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    animation: spin-ring 5s linear infinite;
  }
  .ps-avatar-img {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #090c18;
    display: block;
  }
  .ps-avatar-placeholder {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0d1828, #192240);
    border: 3px solid #090c18;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Orbitron', sans-serif;
    font-size: 26px;
    font-weight: 700;
    color: #00f5ff;
  }
  .ps-avatar-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity .2s;
    color: #00f5ff;
  }
  .ps-avatar-wrap:hover .ps-avatar-overlay { opacity: 1; }

  .ps-avatar-meta { flex: 1; min-width: 160px; }
  .ps-avatar-name {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(15px, 3vw, 18px);
    font-weight: 700;
    color: #e8eeff;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ps-avatar-role {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    letter-spacing: 3px;
    color: #ff2d78;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .ps-loyalty {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 230, 0, 0.06);
    border: 1px solid rgba(255, 230, 0, 0.2);
    padding: 5px 14px;
    clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
  }
  .ps-loyalty-num {
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #ffe600;
  }
  .ps-loyalty-label {
    font-size: 10px;
    letter-spacing: 2px;
    color: #8a7a20;
    text-transform: uppercase;
  }

  /* ── Tabs ── */
  .ps-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 28px;
    border-bottom: 1px solid #16203a;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .ps-tabs::-webkit-scrollbar { display: none; }

  .ps-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #2e3e5a;
    padding: 10px 18px 12px;
    position: relative;
    transition: color .2s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .ps-tab:hover { color: #6678aa; }
  .ps-tab.active { color: #00f5ff; }
  .ps-tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #00f5ff, #ff2d78);
    transform-origin: left;
    animation: tab-line .25s ease both;
  }

  /* ── Section label ── */
  .ps-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 3px;
    color: #2e3e5a;
    text-transform: uppercase;
    margin-bottom: 18px;
    margin-top: 4px;
  }
  .ps-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, #16203a, transparent);
  }

  /* ── Form grid ── */
  .ps-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
  .ps-field { display: flex; flex-direction: column; gap: 7px; }
  .ps-field.full { grid-column: 1 / -1; }

  .ps-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #2e3e5a;
  }
  .ps-label-icon { color: #00f5ff66; flex-shrink: 0; }

  /* Input wrapper for icon + input */
  .ps-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .ps-input-icon {
    position: absolute;
    left: 12px;
    color: #1e2e48;
    pointer-events: none;
    flex-shrink: 0;
  }
  .ps-input-action {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    color: #2e3e5a;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color .15s;
  }
  .ps-input-action:hover { color: #00f5ff; }

  .ps-input, .ps-select {
    width: 100%;
    background: #06090f;
    border: 1px solid #16203a;
    color: #b0bedd;
    font-family: 'Share Tech Mono', monospace;
    font-size: 13px;
    padding: 10px 14px 10px 38px;
    outline: none;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    transition: border-color .2s, box-shadow .2s, color .2s;
  }
  .ps-input.no-icon { padding-left: 14px; }
  .ps-select { padding-right: 36px; appearance: none; cursor: pointer; }
  .ps-select-icon {
    position: absolute;
    right: 12px;
    pointer-events: none;
    color: #2e3e5a;
  }

  .ps-input:focus, .ps-select:focus {
    border-color: rgba(0, 245, 255, 0.35);
    box-shadow: 0 0 14px rgba(0, 245, 255, 0.1);
    color: #dde6ff;
  }
  .ps-input.error { border-color: rgba(255, 45, 120, 0.5); }
  .ps-input:disabled {
    opacity: .3;
    cursor: not-allowed;
  }
  .ps-input-hint {
    font-size: 10px;
    letter-spacing: .5px;
  }
  .ps-input-hint.error { color: #ff2d78; }
  .ps-input-hint.muted { color: #2e3e5a; }

  /* ── Strength meter ── */
  .ps-strength { display: flex; flex-direction: column; gap: 5px; }
  .ps-strength-bars { display: flex; gap: 4px; }
  .ps-strength-seg {
    flex: 1;
    height: 3px;
    background: #0d1424;
    border-radius: 2px;
    transition: background .3s;
  }
  .ps-strength-text { font-size: 9px; letter-spacing: 2px; }

  /* ── Buttons ── */
  .ps-btn-row {
    display: flex;
    gap: 12px;
    margin-top: 28px;
    flex-wrap: wrap;
  }
  .ps-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    padding: 12px 24px;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
    transition: opacity .15s, box-shadow .2s, transform .1s;
    position: relative;
    overflow: hidden;
  }
  .ps-btn:active:not(:disabled) { transform: scale(.97); }
  .ps-btn:disabled { opacity: .35; cursor: not-allowed; }
  .ps-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.15) 50%, transparent 70%);
    transform: translateX(-120%);
    transition: transform .45s;
  }
  .ps-btn:not(:disabled):hover::after { transform: translateX(120%); }

  .ps-btn-primary {
    background: linear-gradient(135deg, #00b8c4, #00f5ff);
    color: #020408;
  }
  .ps-btn-primary:not(:disabled):hover { box-shadow: 0 0 24px rgba(0, 245, 255, 0.5); }

  .ps-btn-danger {
    background: linear-gradient(135deg, #b01040, #ff2d78);
    color: #fff;
  }
  .ps-btn-danger:not(:disabled):hover { box-shadow: 0 0 24px rgba(255, 45, 120, 0.5); }

  .ps-btn-spin {
    animation: spin .7s linear infinite;
  }

  /* ── Loading ── */
  .ps-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 55vh;
    gap: 18px;
  }
  .ps-loading-spin { animation: spin .9s linear infinite; color: #00f5ff; }
  .ps-loading-text {
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    letter-spacing: 4px;
    color: #00f5ff55;
    text-transform: uppercase;
  }

  /* ── Toast ── */
  .ps-toast {
    position: fixed;
    bottom: 28px;
    right: 28px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 20px;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    z-index: 9999;
    animation: toast-in .3s ease both;
    pointer-events: none;
    max-width: calc(100vw - 56px);
  }
  .ps-toast.success {
    background: #001814;
    border: 1px solid rgba(0,245,255,.3);
    color: #00f5ff;
  }
  .ps-toast.error {
    background: #160008;
    border: 1px solid rgba(255,45,120,.3);
    color: #ff2d78;
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .ps { padding: 24px 14px 64px; }

    .ps-card {
      padding: 20px 18px 24px;
      clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    }

    .ps-avatar-row { gap: 16px; }
    .ps-avatar-wrap, .ps-avatar-img, .ps-avatar-placeholder { width: 72px; height: 72px; }
    .ps-avatar-placeholder { font-size: 20px; }
    .ps-avatar-ring { inset: -4px; }

    .ps-grid { grid-template-columns: 1fr; }
    .ps-field.full { grid-column: 1; }

    .ps-tab { padding: 8px 12px 10px; font-size: 9px; gap: 5px; }

    .ps-btn { padding: 11px 18px; font-size: 9px; }
    .ps-btn-row { flex-direction: column; }
    .ps-btn-row .ps-btn { width: 100%; justify-content: center; }

    .ps-toast { bottom: 16px; right: 16px; left: 16px; max-width: unset; }
  }

  @media (max-width: 400px) {
    .ps-title { font-size: 18px; }
    .ps-avatar-name { font-size: 14px; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "—", color: "#1e2e48" };
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "TOO SHORT", color: "#ff2d78" },
    { label: "WEAK",      color: "#ff2d78" },
    { label: "FAIR",      color: "#ffe600" },
    { label: "STRONG",    color: "#00f5ff" },
    { label: "MAX",       color: "#39ff14" },
  ];
  return { score: s, ...map[s] };
}

function initials(first = "", last = "") {
  const i = `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
  return i || "OP";
}

// ─── PasswordInput ────────────────────────────────────────────────────────────
function PasswordInput({ name, value, onChange, placeholder, className = "", style }) {
  const [show, setShow] = useState(false);
  return (
    <div className="ps-input-wrap">
      <Lock size={14} className="ps-input-icon" />
      <input
        className={`ps-input ${className}`}
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ paddingRight: 38, ...style }}
        autoComplete="new-password"
      />
      <button
        type="button"
        className="ps-input-action"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfileSettings() {
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast]         = useState(null);
  const toastTimer                = useRef(null);
  const fileInputRef              = useRef(null);

  const [profile, setProfile] = useState({
    profile_image: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    role: "",
    loyalty_points: 100000,
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [preview, setPreview] = useState(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3800);
  };

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadProfile();
    return () => clearTimeout(toastTimer.current);
  }, []);

  const loadProfile = async () => {
    try {
      // request() returns the body directly — no .data wrapper
      const d = await adminApi.getProfile();
      setProfile({
        profile_image:  d.profile_image  ?? "",
        first_name:     d.first_name     ?? "",
        last_name:      d.last_name      ?? "",
        email:          d.email          ?? "",
        phone:          d.phone          ?? "",   // API returns null when unset
        dob:            d.dob            ?? "",   // API returns null when unset
        gender:         d.gender         ?? "",
        role:           d.role           ?? "",
        // loyalty_points: d.loyalty_points ?? 100000,
        loyalty_points:  '1,00,00,0+',
      });
      setPreview(d.profile_image ?? null);
    } catch (err) {
      console.error(err);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfile((prev) => ({ ...prev, profile_image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);

      const form = new FormData();

      // Image: only send when user picked a new file.
      // Sending the existing URL string causes Django "not a file" error.
      if (profile.profile_image instanceof File) {
        form.append("profile_image", profile.profile_image);
      }

      // Required text fields — always include
      form.append("first_name", profile.first_name ?? "");
      form.append("last_name",  profile.last_name  ?? "");
      form.append("email",      profile.email      ?? "");

      // Optional fields — only include when non-empty so Django skips validation
      if (profile.phone)  form.append("phone",  profile.phone);
      if (profile.dob)    form.append("dob",    profile.dob);
      if (profile.gender) form.append("gender", profile.gender);

      const res = await adminApi.updateProfile(form);
      // res is the body directly — no .data wrapper
      showToast(res?.message || "Profile updated successfully");
      loadProfile();
    } catch (err) {
      console.error(err);
      // custom fetch wrapper puts parsed error body on err.body (not err.response.data)
      const detail = err.body?.detail
        || Object.values(err.body || {})[0]?.[0]
        || err.message
        || "Failed to update profile";
      showToast(detail, "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const changePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast("New passwords do not match", "error");
      return;
    }
    try {
      setSaving(true);
      await adminApi.changePassword(passwordForm);
      showToast("Password updated successfully");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      console.error(err);
      showToast(err.body?.detail || err.message || "Password change failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const strength   = passwordStrength(passwordForm.new_password);
  const fullName   = `${profile.first_name} ${profile.last_name}`.trim() || "OPERATOR";
  const pwMismatch = passwordForm.confirm_password &&
                     passwordForm.confirm_password !== passwordForm.new_password;
  const pwReady    = !saving &&
                     passwordForm.current_password &&
                     passwordForm.new_password &&
                     !pwMismatch;

  const TABS = [
    { id: "profile",  label: "Identity",    Icon: UserCog    },
    { id: "security", label: "Security",    Icon: ShieldCheck },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <style>{STYLE}</style>

      <div className="ps">
        <div className="ps-inner">

          {/* Page header */}
          <header className="ps-header">
            <p className="ps-eyebrow">
              <Settings2 size={11} />
              System Config
              <span className="ps-eyebrow-line" />
            </p>
            <h1 className="ps-title" data-text="PROFILE SETTINGS">
              PROFILE SETTINGS
            </h1>
            <p className="ps-subtitle">Manage your operator identity &amp; credentials</p>
          </header>

          {loading ? (
            <div className="ps-loading">
              <Loader2 size={44} className="ps-loading-spin" />
              <p className="ps-loading-text">Loading operator data…</p>
            </div>
          ) : (
            <div className="ps-card">

              {/* Avatar + meta */}
              <div className="ps-avatar-row">
                <div
                  className="ps-avatar-wrap"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  aria-label="Change avatar"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                >
                  <div className="ps-avatar-ring" />
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile avatar"
                      className="ps-avatar-img"
                      onError={() => setPreview(null)}
                    />
                  ) : (
                    <div className="ps-avatar-placeholder">
                      {initials(profile.first_name, profile.last_name)}
                    </div>
                  )}
                  <div className="ps-avatar-overlay">
                    <Camera size={20} />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImage}
                  />
                </div>

                <div className="ps-avatar-meta">
                  <div className="ps-avatar-name">{fullName}</div>
                  <div className="ps-avatar-role">
                    <User size={10} />
                    {profile.role || "OPERATOR"}
                  </div>
                  <div className="ps-loyalty">
                    <Star size={12} color="#ffe600" />
                    <span className="ps-loyalty-num">{profile.loyalty_points ?? 100000}</span>
                    <span className="ps-loyalty-label">Loyalty pts</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <nav className="ps-tabs" role="tablist">
                {TABS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={activeTab === id}
                    className={`ps-tab ${activeTab === id ? "active" : ""}`}
                    onClick={() => setActiveTab(id)}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </nav>

              {/* ── Identity tab ── */}
              {activeTab === "profile" && (
                <div key="profile" style={{ animation: "fadeUp .28s ease both" }}>
                  <div className="ps-section-label">
                    <UserCog size={11} />
                    Personal Information
                  </div>

                  <div className="ps-grid">
                    <div className="ps-field">
                      <label className="ps-label">
                        <User size={10} className="ps-label-icon" />
                        First Name
                      </label>
                      <div className="ps-input-wrap">
                        <User size={14} className="ps-input-icon" />
                        <input
                          className="ps-input"
                          name="first_name"
                          value={profile.first_name}
                          onChange={handleProfileChange}
                          placeholder="First name"
                        />
                      </div>
                    </div>

                    <div className="ps-field">
                      <label className="ps-label">
                        <User size={10} className="ps-label-icon" />
                        Last Name
                      </label>
                      <div className="ps-input-wrap">
                        <User size={14} className="ps-input-icon" />
                        <input
                          className="ps-input"
                          name="last_name"
                          value={profile.last_name}
                          onChange={handleProfileChange}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div className="ps-field full">
                      <label className="ps-label">
                        <Mail size={10} className="ps-label-icon" />
                        Email Address
                      </label>
                      <div className="ps-input-wrap">
                        <Mail size={14} className="ps-input-icon" />
                        <input
                          className="ps-input"
                          name="email"
                          type="email"
                          value={profile.email}
                          onChange={handleProfileChange}
                          placeholder="operator@dqd.sys"
                        />
                      </div>
                    </div>

                    <div className="ps-field">
                      <label className="ps-label">
                        <Phone size={10} className="ps-label-icon" />
                        Phone
                      </label>
                      <div className="ps-input-wrap">
                        <Phone size={14} className="ps-input-icon" />
                        <input
                          className="ps-input"
                          name="phone"
                          value={profile.phone}
                          onChange={handleProfileChange}
                          placeholder="+00 0000 0000"
                        />
                      </div>
                    </div>

                    <div className="ps-field">
                      <label className="ps-label">
                        <Settings2 size={10} className="ps-label-icon" />
                        Date of Birth
                      </label>
                      <div className="ps-input-wrap">
                        <Settings2 size={14} className="ps-input-icon" />
                        <input
                          className="ps-input"
                          name="dob"
                          type="date"
                          value={profile.dob}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>

                    <div className="ps-field">
                      <label className="ps-label">
                        <User size={10} className="ps-label-icon" />
                        Gender
                      </label>
                      <div className="ps-input-wrap">
                        <User size={14} className="ps-input-icon" />
                        <select
                          className="ps-select"
                          name="gender"
                          value={profile.gender}
                          onChange={handleProfileChange}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                        <ChevronDown size={13} className="ps-select-icon" />
                      </div>
                    </div>

                    <div className="ps-field">
                      <label className="ps-label">
                        <ShieldCheck size={10} className="ps-label-icon" />
                        Role
                      </label>
                      <div className="ps-input-wrap">
                        <ShieldCheck size={14} className="ps-input-icon" />
                        <input
                          className="ps-input"
                          name="role"
                          value={profile.role}
                          disabled
                        />
                      </div>
                      <span className="ps-input-hint muted">Assigned by system</span>
                    </div>
                  </div>

                  <div className="ps-btn-row">
                    <button
                      className="ps-btn ps-btn-primary"
                      onClick={saveProfile}
                      disabled={saving}
                    >
                      {saving
                        ? <><Loader2 size={13} className="ps-btn-spin" /> Saving…</>
                        : <><Save size={13} /> Save Changes</>
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* ── Security tab ── */}
              {activeTab === "security" && (
                <div key="security" style={{ animation: "fadeUp .28s ease both" }}>
                  <div className="ps-section-label">
                    <KeyRound size={11} />
                    Change Password
                  </div>

                  <div className="ps-grid">
                    <div className="ps-field full">
                      <label className="ps-label">
                        <Lock size={10} className="ps-label-icon" />
                        Current Password
                      </label>
                      <PasswordInput
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="ps-field">
                      <label className="ps-label">
                        <Lock size={10} className="ps-label-icon" />
                        New Password
                      </label>
                      <PasswordInput
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                      />
                      {passwordForm.new_password && (
                        <div className="ps-strength">
                          <div className="ps-strength-bars">
                            {[0, 1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="ps-strength-seg"
                                style={{
                                  background: i < strength.score ? strength.color : undefined,
                                }}
                              />
                            ))}
                          </div>
                          <span
                            className="ps-strength-text"
                            style={{ color: strength.color }}
                          >
                            {strength.label}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="ps-field">
                      <label className="ps-label">
                        <Lock size={10} className="ps-label-icon" />
                        Confirm New Password
                      </label>
                      <PasswordInput
                        name="confirm_password"
                        value={passwordForm.confirm_password}
                        onChange={handlePasswordChange}
                        placeholder="Repeat new password"
                        className={pwMismatch ? "error" : ""}
                      />
                      {pwMismatch && (
                        <span className="ps-input-hint error">Passwords do not match</span>
                      )}
                    </div>
                  </div>

                  <div className="ps-btn-row">
                    <button
                      className="ps-btn ps-btn-danger"
                      onClick={changePassword}
                      disabled={!pwReady}
                    >
                      {saving
                        ? <><Loader2 size={13} className="ps-btn-spin" /> Updating…</>
                        : <><KeyRound size={13} /> Update Password</>
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`ps-toast ${toast.type}`} role="status" aria-live="polite">
          {toast.type === "success"
            ? <CheckCircle size={15} />
            : <XCircle size={15} />
          }
          {toast.msg}
        </div>
      )}
    </AdminLayout>
  );
}