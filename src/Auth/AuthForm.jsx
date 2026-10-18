import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight, CalendarCheck, Check, CircleAlert, Eye, EyeOff, Gamepad2, KeyRound, LoaderCircle, Lock, Mail, Phone,
  ShieldCheck, Star, Trophy, User, Zap,
} from "lucide-react";
import { authApi, getTerms } from "../api/client";
import TermsModal from "./TermsModal";
import { authCss } from "./authStyles";

/* ── helpers ─────────────────────────────────────────────── */

function loadGoogleSDK() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) return resolve(window.google.accounts);
    const existing = document.querySelector('script[src*="accounts.google.com/gsi"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google.accounts));
      existing.addEventListener("error", () => reject(new Error("Google sign-in could not be loaded.")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.google.accounts);
    s.onerror = () => reject(new Error("Google sign-in could not be loaded."));
    document.head.appendChild(s);
  });
}

function persistAuth(data) {
  if (data?.access) localStorage.setItem("access_token", data.access);
  if (data?.refresh) localStorage.setItem("refresh_token", data.refresh);
  if (data?.user?.role) localStorage.setItem("user_role", data.user.role);
  if (data?.device_id) localStorage.setItem("dqd_device_id", data.device_id);
}

function redirectFor(data, from) {
  const role = data?.user?.role;
  // Never send a non-admin back to an admin page they came from.
  if (from && from.startsWith("/") && !(from.startsWith("/admin") && role !== "admin")) return from;
  if (data?.redirect_to?.startsWith("/")) return data.redirect_to;
  return role === "admin" ? "/admin/dashboard" : "/user/dashboard";
}

function errorMessage(err, fallback) {
  const d = err?.response?.data;
  if (!err?.response) return "Can't reach the server. Check your connection and try again.";
  if (typeof d === "string") return fallback;
  if (d?.detail) return String(d.detail);
  if (d && typeof d === "object") {
    const first = Object.values(d)[0];
    if (Array.isArray(first)) return String(first[0]);
    if (first) return String(first);
  }
  return fallback;
}

const digits = (v) => v.replace(/[^\d+]/g, "");
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isPhone = (v) => /^\+?\d{8,15}$/.test(digits(v));

function validateLogin(f) {
  const e = {};
  const id = f.identifier.trim();
  if (!id) e.identifier = "Enter your mobile number or email.";
  else if (id.includes("@") ? !isEmail(id) : !isPhone(id)) e.identifier = "Enter a valid mobile number or email.";
  if (!f.password) e.password = "Enter your password.";
  return e;
}

function validateSignup(f) {
  const e = {};
  if (!f.first_name.trim()) e.first_name = "Please enter your name.";
  if (!f.phone.trim()) e.phone = "Enter your mobile number.";
  else if (!isPhone(f.phone)) e.phone = "Enter a valid mobile number.";
  if (f.email.trim() && !isEmail(f.email)) e.email = "Enter a valid email address or leave it empty.";
  if (f.password.length < 8) e.password = "Password must be at least 8 characters.";
  else if (/^\d+$/.test(f.password)) e.password = "Password can't be only numbers.";
  if (!f.accept) e.accept = "Please accept the Terms & Conditions.";
  return e;
}

/** 0–4 score with a label and colour for the strength meter. */
function passwordStrength(p) {
  if (!p) return { score: 0, label: "", color: "" };
  let score = 0;
  if (p.length >= 8) score += 1;
  if (p.length >= 12) score += 1;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score += 1;
  if (p.length < 8 || /^\d+$/.test(p)) score = Math.min(score, 1);
  const levels = [
    { label: "Too short", color: "#ff006e" },
    { label: "Weak", color: "#ff006e" },
    { label: "Okay", color: "#ffd60a" },
    { label: "Good", color: "#00f5ff" },
    { label: "Strong", color: "#39ff14" },
  ];
  return { score: Math.max(score, 1), ...levels[score] };
}

const PERKS = [
  { icon: CalendarCheck, text: "Book a slot in seconds" },
  { icon: Star, text: "Earn loyalty points every visit" },
  { icon: Zap, text: "Happy-hour deals on top games" },
  { icon: Trophy, text: "Tournaments & member events" },
];

/* ── small building blocks ───────────────────────────────── */

function Field({ label, hint, error, children }) {
  return (
    <label className="au-field">
      <span className="au-label">
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {children}
      {error && (
        <span className="au-err" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

function IconInput({ icon: Icon, error, valid, withButton, children }) {
  return (
    <div className={`au-input${withButton ? " has-btn" : ""}${error ? " bad" : valid ? " ok" : ""}`}>
      <Icon size={18} aria-hidden="true" />
      {children}
    </div>
  );
}

function PasswordInput({ show, onToggle, onCaps, ...props }) {
  const caps = (e) => onCaps(e.getModifierState?.("CapsLock") || false);
  return (
    <>
      <input {...props} type={show ? "text" : "password"} onKeyUp={caps} onKeyDown={caps} onBlur={() => onCaps(false)} />
      <button type="button" className="au-eye" onClick={onToggle} aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </>
  );
}

/* ── component ───────────────────────────────────────────── */

export default function AuthForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  // The URL hash decides the tab, so "/sign-in#signup" links always open the sign-up form.
  const mode = location.hash === "#signup" ? "signup" : "signin";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [lockedFor, setLockedFor] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsId, setTermsId] = useState(null);
  const [googleReady, setGoogleReady] = useState(false);

  const [login, setLogin] = useState({ identifier: "", password: "" });
  const [signup, setSignup] = useState({ first_name: "", phone: "", email: "", password: "", accept: false });

  const googleButtonRef = useRef(null);
  const googleBusy = useRef(false);

  /* Already signed in → go to dashboard */
  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      const role = localStorage.getItem("user_role");
      navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard", { replace: true });
    }
  }, [navigate]);

  /* Current terms version (sent with sign-up) */
  useEffect(() => {
    getTerms().then((t) => setTermsId(t?.id || null)).catch(() => setTermsId(null));
  }, []);

  /* Lockout countdown */
  useEffect(() => {
    if (lockedFor <= 0) return undefined;
    const id = setTimeout(() => setLockedFor((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [lockedFor]);

  const switchMode = (next) => {
    if (next === mode) return;
    navigate({ hash: next === "signup" ? "#signup" : "" }, { replace: true, state: location.state });
    setError("");
    setFieldErrors({});
    setShowPassword(false);
    setCapsOn(false);
  };

  const editLogin = (key) => (e) => {
    setLogin((p) => ({ ...p, [key]: e.target.value }));
    if (fieldErrors[key]) setFieldErrors((x) => ({ ...x, [key]: "" }));
  };
  const editSignup = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setSignup((p) => ({ ...p, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((x) => ({ ...x, [key]: "" }));
  };

  /* ── Google ── */
  const handleGoogle = useCallback(
    async (response) => {
      if (!response?.credential || googleBusy.current) return;
      googleBusy.current = true;
      setLoading(true);
      setError("");
      try {
        const data = await authApi.googleLogin(response.credential);
        persistAuth(data);
        navigate(redirectFor(data, from), { replace: true });
      } catch (err) {
        setError(errorMessage(err, "Google sign-in failed. Please try again."));
      } finally {
        setLoading(false);
        googleBusy.current = false;
      }
    },
    [navigate, from],
  );

  const handleGoogleRef = useRef(handleGoogle);
  useEffect(() => {
    handleGoogleRef.current = handleGoogle;
  }, [handleGoogle]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return undefined;
    let cancelled = false;
    loadGoogleSDK()
      .then((accounts) => {
        if (cancelled) return;
        accounts.id.initialize({
          client_id: clientId,
          callback: (r) => handleGoogleRef.current(r),
          ux_mode: "popup",
          auto_select: false,
          use_fedcm_for_button: true,
        });
        setGoogleReady(true);
      })
      .catch(() => {
        /* Google is optional — mobile/email login still works. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = googleButtonRef.current;
    if (!googleReady || !el || !window.google?.accounts) return undefined;
    el.innerHTML = "";
    window.google.accounts.id.renderButton(el, {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: mode === "signin" ? "signin_with" : "signup_with",
      width: Math.min(360, Math.max(220, Math.floor(el.getBoundingClientRect().width || 320))),
    });
    return () => {
      el.innerHTML = "";
    };
  }, [googleReady, mode]);

  /* ── Sign in ── */
  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");
    const problems = validateLogin(login);
    setFieldErrors(problems);
    if (Object.keys(problems).length) return;

    setLoading(true);
    try {
      const data = await authApi.login(login.identifier.trim(), login.password);
      persistAuth(data);
      navigate(redirectFor(data, from), { replace: true });
    } catch (err) {
      const d = err?.response?.data;
      if (err?.response?.status === 429 && d?.locked) {
        setLockedFor(Number(d.retry_after) || 900);
      }
      setError(errorMessage(err, "Sign in failed. Please try again."));
      setLogin((p) => ({ ...p, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  /* ── Sign up ── */
  const submitSignup = async (e) => {
    e.preventDefault();
    setError("");
    const problems = validateSignup(signup);
    setFieldErrors(problems);
    if (Object.keys(problems).length) return;

    setLoading(true);
    try {
      const data = await authApi.register({
        first_name: signup.first_name.trim(),
        phone: digits(signup.phone),
        email: signup.email.trim().toLowerCase() || null,
        password: signup.password,
        accept_terms: true,
        terms_id: termsId,
      });
      persistAuth(data);
      navigate(redirectFor(data), { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Could not create your account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const lockMinutes = Math.ceil(lockedFor / 60);
  const strength = passwordStrength(signup.password);
  const isSignup = mode === "signup";
  const capsHint = capsOn && <span className="au-hint">Caps Lock is on</span>;

  return (
    <>
      <style>{authCss}</style>
      <div className="au-page">
        <div className="au-bg" aria-hidden="true" />
        <div className="au-grid" aria-hidden="true" />
        <div className="au-trace" aria-hidden="true" />
        <Link to="/" className="au-back">← Back to home</Link>

        {/* ── Showcase ── */}
        <section className="au-show" aria-label="DQD Gaming">
          <Link to="/" className="au-brand">
            <img src="/logo.png" alt="" width="44" height="44" />
            <span>
              <b>DQD GAMING</b>
              <small>Gaming arena</small>
            </span>
          </Link>
          <div>
            <h2 className="au-hero-title">
              {isSignup ? "Join the" : "Welcome back,"}
              <span>{isSignup ? "Arena" : "Player"}</span>
            </h2>
            <p className="au-hero-sub">
              {isSignup
                ? "Create your free account to book games, grab combo deals and collect points every time you play."
                : "Sign in to see your bookings, use your loyalty points and catch today's happy-hour deals."}
            </p>
          </div>
          <div className="au-stage" aria-hidden="true">
            <span className="au-ring r1" />
            <span className="au-ring r2" />
            <span className="au-glow" />
            <img src="/images/img1.png" alt="" />
          </div>
          <ul className="au-perks">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={18} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Form ── */}
        <main className="au-side">
          <div className="au-card">
            <div className="au-head">
              <h1>{isSignup ? "Create account" : "Sign in"}</h1>
              <p>{isSignup ? "It takes less than a minute." : "Good to see you again."}</p>
            </div>

            <div className={`au-tabs${isSignup ? " up" : ""}`} role="tablist" aria-label="Sign in or create account">
              <button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? "on" : ""} onClick={() => switchMode("signin")}>
                Sign in
              </button>
              <button type="button" role="tab" aria-selected={isSignup} className={isSignup ? "on" : ""} onClick={() => switchMode("signup")}>
                Create account
              </button>
            </div>

            {error && (
              <div className="au-alert" role="alert" key={error}>
                <CircleAlert size={18} aria-hidden="true" />
                <div>
                  {error}
                  {lockedFor > 0 && (
                    <div className="au-alert-sub">
                      Try again in {lockMinutes} minute{lockMinutes !== 1 ? "s" : ""}, or{" "}
                      <Link to="/forgot-password">reset your password</Link>.
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isSignup ? (
              <form className="au-form" key="signin" onSubmit={submitLogin} noValidate>
                <Field label="Mobile number or email" error={fieldErrors.identifier}>
                  <IconInput icon={login.identifier.includes("@") ? Mail : Phone} error={fieldErrors.identifier}>
                    <input
                      name="identifier"
                      inputMode="email"
                      autoComplete="username"
                      placeholder="98765 43210 or you@email.com"
                      value={login.identifier}
                      onChange={editLogin("identifier")}
                      maxLength={254}
                      aria-invalid={!!fieldErrors.identifier}
                      autoFocus
                    />
                  </IconInput>
                </Field>

                <Field label="Password" error={fieldErrors.password}>
                  <IconInput icon={Lock} error={fieldErrors.password} withButton>
                    <PasswordInput
                      name="password"
                      autoComplete="current-password"
                      placeholder="Your password"
                      value={login.password}
                      onChange={editLogin("password")}
                      maxLength={128}
                      aria-invalid={!!fieldErrors.password}
                      show={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                      onCaps={setCapsOn}
                    />
                  </IconInput>
                  {capsHint}
                </Field>

                <div className="au-row-end">
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>

                <button className="au-submit" type="submit" disabled={loading || lockedFor > 0}>
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="spin" aria-hidden="true" /> Signing in…
                    </>
                  ) : lockedFor > 0 ? (
                    `Locked (${lockMinutes} min)`
                  ) : (
                    <>
                      Sign in <ArrowRight size={18} className="arrow" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form className="au-form" key="signup" onSubmit={submitSignup} noValidate>
                <Field label="Your name" error={fieldErrors.first_name}>
                  <IconInput icon={User} error={fieldErrors.first_name} valid={signup.first_name.trim().length > 1}>
                    <input
                      name="first_name"
                      autoComplete="name"
                      placeholder="What should we call you?"
                      value={signup.first_name}
                      onChange={editSignup("first_name")}
                      maxLength={100}
                      aria-invalid={!!fieldErrors.first_name}
                      autoFocus
                    />
                  </IconInput>
                </Field>

                <Field label="Mobile number" error={fieldErrors.phone}>
                  <IconInput icon={Phone} error={fieldErrors.phone} valid={isPhone(signup.phone)}>
                    <input
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="98765 43210"
                      value={signup.phone}
                      onChange={editSignup("phone")}
                      maxLength={20}
                      aria-invalid={!!fieldErrors.phone}
                    />
                  </IconInput>
                </Field>

                <Field label="Email" hint="optional · for password reset" error={fieldErrors.email}>
                  <IconInput icon={Mail} error={fieldErrors.email} valid={isEmail(signup.email)}>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@email.com"
                      value={signup.email}
                      onChange={editSignup("email")}
                      maxLength={254}
                      aria-invalid={!!fieldErrors.email}
                    />
                  </IconInput>
                </Field>

                <Field label="Password" error={fieldErrors.password}>
                  <IconInput icon={KeyRound} error={fieldErrors.password} withButton>
                    <PasswordInput
                      name="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={signup.password}
                      onChange={editSignup("password")}
                      maxLength={128}
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby="au-strength"
                      show={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                      onCaps={setCapsOn}
                    />
                  </IconInput>
                  {capsHint}
                  {signup.password && (
                    <>
                      <div className="au-meter" aria-hidden="true">
                        {[1, 2, 3, 4].map((n) => (
                          <i
                            key={n}
                            style={n <= strength.score ? { background: strength.color, boxShadow: `0 0 8px ${strength.color}` } : undefined}
                          />
                        ))}
                      </div>
                      <div className="au-meter-text" id="au-strength">
                        <span>
                          Strength: <b style={{ color: strength.color }}>{strength.label}</b>
                        </span>
                        <span>Mix cases, numbers & symbols</span>
                      </div>
                    </>
                  )}
                </Field>

                <label className={`au-check${fieldErrors.accept ? " bad" : ""}`}>
                  <input type="checkbox" checked={signup.accept} onChange={editSignup("accept")} />
                  <span className="au-box" aria-hidden="true">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span>
                    I agree to the{" "}
                    <button type="button" className="au-linkbtn" onClick={() => setShowTerms(true)}>
                      Terms &amp; Conditions
                    </button>
                    {fieldErrors.accept && (
                      <span className="au-err" role="alert">
                        {fieldErrors.accept}
                      </span>
                    )}
                  </span>
                </label>

                <button className="au-submit" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="spin" aria-hidden="true" /> Creating account…
                    </>
                  ) : (
                    <>
                      <Gamepad2 size={18} aria-hidden="true" /> Create account
                    </>
                  )}
                </button>
              </form>
            )}

            {googleReady && (
              <>
                <div className="au-or">
                  <span>or</span>
                </div>
                <div className="au-google" ref={googleButtonRef} />
              </>
            )}

            <p className="au-switch">
              {isSignup ? "Already have an account? " : "New to DQD Gaming? "}
              <button type="button" onClick={() => switchMode(isSignup ? "signin" : "signup")}>
                {isSignup ? "Sign in" : "Create a free account"}
              </button>
            </p>
            <p className="au-safe">
              <ShieldCheck size={14} aria-hidden="true" /> Your details are encrypted and never shared.
            </p>
          </div>
        </main>
      </div>

      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </>
  );
}
