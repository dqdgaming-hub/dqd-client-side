import { Fragment, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi, getTerms   } from "../api/client";
import TermsModal from "./TermsModal";

/* ── SDK loaders ── */
function loadGoogleSDK() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) return resolve(window.google.accounts);
    const existing = document.querySelector('script[src*="accounts.google.com/gsi"]');
    if (existing) { existing.addEventListener("load", () => resolve(window.google.accounts)); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.defer = true;
    s.onload = () => resolve(window.google.accounts);
    s.onerror = () => reject(new Error("Google sign-in could not be loaded."));
    document.head.appendChild(s);
  });
}

function getRoleRedirect(user) {
  if (!user) return "/user/dashboard";
  return user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
}

function persistAuth(data) {
  if (data?.access) localStorage.setItem("access_token", data.access);
  if (data?.refresh) localStorage.setItem("refresh_token", data.refresh);
  if (data?.user?.role) localStorage.setItem("user_role", data.user.role);
}

function getAuthRedirect(data, fallbackPath) {
  if (fallbackPath && fallbackPath.startsWith("/")) return fallbackPath;
  if (data?.redirect_to?.startsWith("/")) return data.redirect_to;
  return getRoleRedirect(data?.user);
}

/* ── Icons ── */
const I = {
  home: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  user:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18C1.41 1.96 2.18.94 3.5.9h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l.82-.82a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 15.5z"/></svg>,
  lock:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  calendar: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  gender:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="5"/><path d="M12 14v7"/><path d="M9 18h6"/></svg>,
  alert:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  check:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  rocket:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
  login:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  gamepad:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/><circle cx="6" cy="12" r="1"/><circle cx="18" cy="12" r="1"/></svg>,
  shield:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  bolt:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  gift:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  pool:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/><circle cx="12" cy="8" r="2"/><line x1="8" y1="16" x2="12" y2="10"/><line x1="16" y1="16" x2="12" y2="10"/><line x1="8" y1="16" x2="16" y2="16"/></svg>,
  ticket:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><line x1="9" y1="4" x2="9" y2="20"/></svg>,
  google: (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
};

/* ── Glitch text component ── */
function GlitchText({ children, className }) {
  return (
    <span className={`cp-glitch ${className || ""}`} data-text={children}>
      {children}
    </span>
  );
}

/* ── Hex circuit node ── */
function CircuitNode({ size = 20, color = "#00ffe1" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <polygon points="12,2 22,7 22,17 12,22 2,17 2,7"
        stroke={color} strokeWidth="1" fill={`${color}18`} />
      <circle cx="12" cy="12" r="2.5" fill={color} opacity="0.7" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────── */
export default function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const googleAccountsRef = useRef(null);
  const googleCallbackRef = useRef(null);
  const googleButtonRef = useRef(null);
  const doSwitchRef = useRef(null);
  const termsIdRef = useRef(null);

  const [googleReady, setGoogleReady] = useState(false);

  const [signupForm, setSignupForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    gender: "", dob: "", password: "", password2: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupStep, setSignupStep] = useState(0);


  const [showTerms, setShowTerms] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [termsId, setTermsId] = useState(null);

  useEffect(() => {
    termsIdRef.current = termsId;
  }, [termsId]);

  /* ── Ticker items for mobile ── */
  const tickerItems = [
    "PS5 SESSIONS", "POOL TABLES", "OTT SCREENS",
    "100+ MEMBERS", "24/7 ACCESS", "FREE SIGN UP",
    "LOYALTY PTS",  "COMBO PACKS", "VIP EVENTS",
  ];


useEffect(() => {

    const loadTerms = async () => {

        try{

            const data = await getTerms();

            setTermsId(data.id);

        }catch(err){

            console.error(err);

        }

    };

    loadTerms();

}, []);


  /* ── Redirect if already logged in ── */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role  = localStorage.getItem("user_role");
    if (token) navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard", { replace: true });
  }, [navigate]);

  /* ── Google credential handler ── */
  const handleGoogleCredential = useCallback(async (response) => {
    if (!response?.credential) {
      setError("Google sign-in was cancelled.");
      return;
    }

    if (googleCallbackRef.current) return;
    googleCallbackRef.current = true;

    try {
      setLoading(true);
      setError("");

      const data = await authApi.googleLogin(response.credential, {
        accept_terms: true,
        terms_id: termsIdRef.current,
      });

      persistAuth(data);

      if (data.is_new) {
        setSuccess("Account created! Welcome aboard!");
      }

      navigate(
        getAuthRedirect(
          data,
          location.state?.from?.pathname
        ),
        { replace: true }
      );
    } catch (err) {
      const detail = err.response?.data?.detail || "";

      if (detail.toLowerCase().includes("exist")) {
        doSwitchRef.current?.(false);
        setError(
          "An account with this Google address already exists. Please sign in."
        );
      } else {
        setError(detail || "Google sign-in failed.");
      }
    } finally {
      setLoading(false);
      googleCallbackRef.current = false;
    }
  }, [navigate, location.state?.from?.pathname]);

  const handleGoogleCredentialRef = useRef(handleGoogleCredential);

  useEffect(() => {
    handleGoogleCredentialRef.current = handleGoogleCredential;
  }, [handleGoogleCredential]);

  /* ── Google Identity Services ──
     Use Google's actual Sign in with Google button.
     No One Tap prompt, no hidden iframe click, and no login_uri. */
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Google client ID is not configured.");
      return;
    }

    let cancelled = false;

    loadGoogleSDK()
      .then((accounts) => {
        if (cancelled) return;

        googleAccountsRef.current = accounts;

        accounts.id.initialize({
          client_id: clientId,
          callback: (response) =>
            handleGoogleCredentialRef.current(response),
          context: "use",
          ux_mode: "popup",
          cancel_on_tap_outside: false,
          auto_select: false,
          use_fedcm_for_button: true,
        });

        setGoogleReady(true);
      })
      .catch((err) => {
        console.error("Google SDK initialization failed:", err);

        if (!cancelled) {
          setError("Google sign-in could not be loaded.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Render Google's real Sign-In button ── */
  useEffect(() => {
    const accounts = googleAccountsRef.current;
    const container = googleButtonRef.current;

    if (!googleReady || !accounts?.id || !container) {
      return;
    }

    container.innerHTML = "";

    const availableWidth = Math.floor(container.getBoundingClientRect().width || 340);
    const buttonWidth = Math.min(340, Math.max(220, availableWidth));

    accounts.id.renderButton(container, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      text: isSignIn ? "signin_with" : "signup_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: buttonWidth,
    });

    return () => {
      container.innerHTML = "";
    };
  }, [googleReady, isSignIn]);

  /* ── Panel animation state ── */
  const [infoPanelAnim, setInfoPanelAnim] = useState("");
  const [formPanelAnim, setFormPanelAnim] = useState("");
  const [infoVisible,   setInfoVisible]   = useState("signin");
  const [formVisible,   setFormVisible]   = useState("signin");
  const [infoFadeAnim,  setInfoFadeAnim]  = useState("");
  const [formFadeAnim,  setFormFadeAnim]  = useState("");

  const doSwitch = useCallback((toSignup) => {
    if (animating) return;
    setAnimating(true);
    setError(""); setSuccess("");

    setInfoFadeAnim("fade-out");
    setFormFadeAnim("fade-out");

    setTimeout(() => {
      setInfoVisible(toSignup ? "signup" : "signin");
      setFormVisible(toSignup ? "signup" : "signin");
      setIsSignIn(!toSignup);
      setInfoPanelAnim(toSignup ? "anim-to-left" : "anim-to-right");
      setFormPanelAnim(toSignup ? "anim-from-right" : "anim-from-left");
      setInfoFadeAnim("fade-in");
      setFormFadeAnim("fade-in");

      setTimeout(() => {
        setInfoPanelAnim("");
        setFormPanelAnim("");
        setInfoFadeAnim("");
        setFormFadeAnim("");
        setAnimating(false);
      }, 580);
    }, 200);
  }, [animating]);

  doSwitchRef.current = doSwitch;

  const handleSignupChange = (e) => setSignupForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleLoginChange  = (e) => setLoginForm((p)  => ({ ...p, [e.target.name]: e.target.value }));

  const handleSignup = async (e) => {

    e?.preventDefault();

    setError("");

    if (signupForm.password !== signupForm.password2) {
        setError("Passwords do not match.");
        return;
    }

    if (!acceptedTerms) {
        setError("Please accept the Terms & Conditions.");
        return;
    }

    if (!termsId) {
        setError("Unable to load Terms & Conditions.");
        return;
    }

    try {

        setLoading(true);

        const payload = {
            ...signupForm,
            accept_terms: acceptedTerms,
            terms_id: termsId,
        };

        const data = await authApi.register(payload);

        persistAuth(data);

        navigate(getAuthRedirect(data), {
            replace: true,
        });

    } catch (err) {

        const d = err.response?.data;

        if (d && typeof d === "object" && !d.detail) {

            const first = Object.values(d)[0];

            setError(
                Array.isArray(first)
                    ? first[0]
                    : String(first)
            );

        } else {

            setError(
                d?.detail ||
                "Registration failed."
            );

        }

    } finally {

        setLoading(false);

    }

  };

  const handleLogin = async (e) => {
    e?.preventDefault(); setError("");
    try {
      setLoading(true);
      const data = await authApi.login(loginForm.email, loginForm.password);
      persistAuth(data);
      navigate(getAuthRedirect(data, location.state?.from?.pathname), { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail || "";
      if (detail.toLowerCase().includes("not found") || detail.toLowerCase().includes("no account")) {
        doSwitch(false); setError("No account found with that email. Please sign up first.");
      } else { setError(detail || "Invalid email or password."); }
    } finally { setLoading(false); }
  };


const handleForgotPassword = () => {
  navigate("/forgot-password");
};

  const signupSteps = [
    { key: "name", label: "Identity", title: "What should we call you?", hint: "Start with your player name.", icon: I.user },
    { key: "contact", label: "Contact", title: "Where can we reach you?", hint: "We will use this for account updates.", icon: I.mail },
    { key: "profile", label: "Profile", title: "Tell us a little more.", hint: "This helps personalize your arena profile.", icon: I.gender },
    { key: "security", label: "Security", title: "Lock in your account.", hint: "Choose a password and confirm it.", icon: I.lock },
  ];

  const mobileStepVariants = {
    enter: (direction) => ({ x: direction >= 0 ? 42 : -42, opacity: 0, scale: 0.98 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction) => ({ x: direction >= 0 ? -42 : 42, opacity: 0, scale: 0.98 }),
  };

  const clampStep = (step, max) => Math.max(0, Math.min(max, step));
  const goSignupStep = (step) => setSignupStep((current) => clampStep(typeof step === "function" ? step(current) : step, signupSteps.length - 1));
  /* ── Stable particle set: generate once, not on every keystroke ── */
  const particles = useMemo(() => {
    const count = typeof window !== "undefined" && window.innerWidth <= 820 ? 10 : 18;

    return Array.from({ length: count }, (_, i) => {
      const isCyan = Math.random() > 0.4;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${3 + Math.random() * 3}px`,
        color: isCyan ? "rgba(0,255,225,0.42)" : "rgba(255,0,110,0.38)",
        duration: `${9 + Math.random() * 8}s`,
        delay: `-${Math.random() * 10}s`,
      };
    });
  }, []);

  /* ── CSS ── */
  const css = useMemo(() => `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

    /* ── Cyberpunk tokens ── */
    :root {
      --cp-void:    #05050f;
      --cp-panel:   #0a0a1a;
      --cp-cyan:    #00ffe1;
      --cp-pink:    #ff006e;
      --cp-yellow:  #f5ff00;
      --cp-purple:  #7b2fff;
      --cp-cyan-dim:  rgba(0,255,225,0.18);
      --cp-pink-dim:  rgba(255,0,110,0.18);
      --cp-yellow-dim: rgba(245,255,0,0.12);
      --cp-text:    #e0f8ff;
      --cp-muted:   rgba(224,248,255,0.28);
    }

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    /* ── Root ── */
    html, body, #root {
      min-height: 100%;
    }

    html, body, #root {
      width: 100%;
      min-height: 100%;
    }

    body {
      margin: 0;
      overflow-x: clip;
      overflow-y: auto;
      overscroll-behavior-x: none;
      -webkit-overflow-scrolling: touch;
    }

    .ar {
      font-family: 'Share Tech Mono', monospace;
      min-height: 100vh;
      width: 100%;
      display: flex; align-items: center; justify-content: center;
      background: var(--cp-void);
      padding: 2rem 1rem;
      overflow: visible;
      position: relative;
    }

    /* ── Background ── */
    .ar-bg {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background:
        radial-gradient(ellipse 70% 50% at 20% 20%, rgba(0,255,225,0.07) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 80%, rgba(255,0,110,0.09) 0%, transparent 55%),
        radial-gradient(ellipse 40% 30% at 60% 10%, rgba(245,255,0,0.04) 0%, transparent 50%);
    }
    .ar-scanlines {
      position: fixed; inset: 0; pointer-events: none; z-index: 1;
      background: repeating-linear-gradient(
        0deg, transparent, transparent 2px,
        rgba(0,255,225,0.018) 2px, rgba(0,255,225,0.018) 4px
      );
      animation: scanRoll 12s linear infinite;
    }
    @keyframes scanRoll {
      0%   { background-position: 0 0; }
      100% { background-position: 0 400px; }
    }
    .ar-grid {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        linear-gradient(rgba(0,255,225,0.028) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,225,0.028) 1px, transparent 1px);
      background-size: 48px 48px;
    }

    /* Floating particles */
    .ar-particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
    .ar-particle {
      position: absolute;
      background: var(--pc, rgba(0,255,225,0.6));
      animation: ptFloat var(--dur, 6s) linear infinite;
      animation-delay: var(--del, 0s);
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }
    @keyframes ptFloat {
      0%   { opacity: 0;   transform: translateY(100vh) rotate(0deg); }
      10%  { opacity: .6; }
      90%  { opacity: .4; }
      100% { opacity: 0;   transform: translateY(-20px) rotate(180deg); }
    }

    /* ── Back link ── */
    .ar-back {
      position: fixed; top: 22px; left: 24px; z-index: 20;
      display: flex; align-items: center; gap: 7px;
      font-size: 11px; color: var(--cp-muted); text-decoration: none;
      font-family: 'Share Tech Mono', monospace; letter-spacing: .08em;
      transition: color .25s, gap .25s;
    }
    .ar-back:hover { color: var(--cp-cyan); gap: 9px; }
    .ar-back-icon {
      display: flex; align-items: center; justify-content: center;
      width: 26px; height: 26px;
      background: rgba(0,255,225,0.06);
      border: 1px solid rgba(0,255,225,0.25);
      clip-path: polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% 100%, 0% 100%, 0% 6px);
      transition: background .25s, border-color .25s;
      flex-shrink: 0;
    }
    .ar-back:hover .ar-back-icon {
      background: rgba(0,255,225,0.14);
      border-color: var(--cp-cyan);
      box-shadow: 0 0 10px rgba(0,255,225,0.3);
    }

    /* ── Scene card ── */
    .ar-scene {
      position: relative; z-index: 2;
      width: 100%; max-width: 1000px; display: flex;
      overflow: hidden;
      border: 1px solid rgba(0,255,225,0.2);
      box-shadow:
        0 0 0 1px rgba(255,0,110,0.08),
        0 0 60px rgba(0,255,225,0.06) inset,
        0 48px 130px rgba(0,0,0,0.96),
        0 0 100px rgba(0,255,225,0.04);
      background: rgba(5,5,18,0.95);
      backdrop-filter: blur(20px);
      min-height: 600px;
      clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
    }

    .ar-scene::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg,
        transparent 0%, var(--cp-cyan) 20%, var(--cp-yellow) 50%, var(--cp-pink) 80%, transparent 100%);
      z-index: 10; animation: cpTrace 3s ease-in-out infinite;
      filter: blur(0.5px);
    }
    .ar-scene::after {
      content: '';
      position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg,
        transparent 0%, var(--cp-pink) 30%, var(--cp-cyan) 70%, transparent 100%);
      z-index: 10; animation: cpTrace 3s ease-in-out infinite reverse;
    }
    @keyframes cpTrace {
      0%,100% { opacity: .4; }
      50%      { opacity: 1; }
    }

    /* ── Info panel ── */
    .ar-info-panel {
      width: 320px; flex-shrink: 0; position: relative; overflow: hidden;
      background: linear-gradient(160deg, #080820 0%, #05051a 50%, #060615 100%);
      padding: 48px 28px 44px;
      display: flex; align-items: center; justify-content: center;
      order: 2;
      will-change: transform, opacity;
    }
    .ar-form-panel {
      flex: 1; padding: 48px 42px;
      display: flex; align-items: center; justify-content: center;
      border-right: 1px solid rgba(0,255,225,0.1);
      position: relative; order: 1;
      will-change: transform, opacity;
    }

    .ar-scene.signup-mode .ar-info-panel {
      order: 0;
      border-right: 1px solid rgba(0,255,225,0.1);
    }
    .ar-scene.signup-mode .ar-form-panel {
      border-right: none;
      border-left: 1px solid rgba(0,255,225,0.1);
    }

    /* ── Panel slide animations ── */
    .ar-info-panel.anim-to-left  { animation: infoPanelToLeft  0.56s cubic-bezier(0.16,1,0.3,1) both; }
    .ar-info-panel.anim-to-right { animation: infoPanelToRight 0.56s cubic-bezier(0.16,1,0.3,1) both; }
    .ar-form-panel.anim-from-right { animation: formFromRight 0.56s cubic-bezier(0.16,1,0.3,1) both; }
    .ar-form-panel.anim-from-left  { animation: formFromLeft  0.56s cubic-bezier(0.16,1,0.3,1) both; }

    @keyframes infoPanelToLeft  { from { transform: translateX(340px); opacity: .1; } to { transform: translateX(0); opacity: 1; } }
    @keyframes infoPanelToRight { from { transform: translateX(-340px); opacity: .1; } to { transform: translateX(0); opacity: 1; } }
    @keyframes formFromRight    { from { transform: translateX(60px); opacity: 0; }   to { transform: translateX(0); opacity: 1; } }
    @keyframes formFromLeft     { from { transform: translateX(-60px); opacity: 0; }  to { transform: translateX(0); opacity: 1; } }

    /* ── Content fade ── */
    .ar-form-content.fade-out { animation: contentFadeOut 0.2s ease both; }
    .ar-form-content.fade-in  { animation: contentFadeIn  0.26s ease 0.2s both; }
    .ar-info-content.fade-out { animation: contentFadeOut 0.2s ease both; }
    .ar-info-content.fade-in  { animation: contentFadeIn  0.26s ease 0.2s both; }
    @keyframes contentFadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-8px); } }
    @keyframes contentFadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* CRT on form panel */
    .ar-form-panel::before {
      content: ''; position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(0,255,225,0.012) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,225,0.012) 1px, transparent 1px);
      background-size: 40px 40px; pointer-events: none;
    }
    .ar-form-panel::after {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background: repeating-linear-gradient(
        0deg, transparent, transparent 3px,
        rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px
      );
      animation: crtFlicker 0.15s steps(1) infinite;
    }
    @keyframes crtFlicker {
      0%   { opacity: 1; }
      92%  { opacity: 1; }
      93%  { opacity: .85; }
      94%  { opacity: 1; }
      96%  { opacity: .9; }
      100% { opacity: 1; }
    }

    .ar-form {
      position: relative; z-index: 1;
      width: 100%; max-width: 340px;
      display: flex; flex-direction: column; align-items: center;
    }

    /* ── Form header ── */
    .ar-eyebrow {
      font-size: .58rem; font-weight: 400; letter-spacing: .28em; text-transform: uppercase;
      color: var(--cp-cyan); margin-bottom: 5px; align-self: flex-start;
      font-family: 'Share Tech Mono', monospace;
      display: flex; align-items: center; gap: 8px;
    }
    .ar-eyebrow::before { content: '//'; color: rgba(0,255,225,0.4); }
    .ar-title {
      font-family: 'Orbitron', monospace;
      font-size: 1.65rem; font-weight: 900; color: var(--cp-text); line-height: 1.08;
      margin-bottom: 4px; align-self: flex-start; letter-spacing: .06em;
      text-transform: uppercase;
    }
    .ar-title .cp-accent-cyan {
      color: var(--cp-cyan);
      text-shadow: 0 0 20px rgba(0,255,225,0.7), 0 0 40px rgba(0,255,225,0.3);
    }
    .ar-title .cp-accent-pink {
      color: var(--cp-pink);
      text-shadow: 0 0 20px rgba(255,0,110,0.7), 0 0 40px rgba(255,0,110,0.3);
    }
    .ar-sub {
      font-size: .7rem; color: var(--cp-muted); margin-bottom: 18px; align-self: flex-start;
      font-family: 'Share Tech Mono', monospace; letter-spacing: .04em;
    }
    .ar-sub::before { content: '> '; color: rgba(0,255,225,0.35); }

    /* ── Glitch effect ── */
    .cp-glitch { position: relative; display: inline-block; }
    .cp-glitch::before, .cp-glitch::after {
      content: attr(data-text);
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    }
    .cp-glitch::before {
      color: var(--cp-cyan); clip-path: inset(0 0 60% 0);
      animation: glitch1 4s steps(1) infinite;
    }
    .cp-glitch::after {
      color: var(--cp-pink); clip-path: inset(60% 0 0 0);
      animation: glitch2 4s steps(1) infinite;
    }
    @keyframes glitch1 {
      0%,85%,100% { transform: none; opacity: 0; }
      86%          { transform: translateX(-3px); opacity: 1; }
      88%          { transform: translateX(2px);  opacity: 1; }
      90%          { transform: none; opacity: 0; }
    }
    @keyframes glitch2 {
      0%,87%,100% { transform: none; opacity: 0; }
      88%          { transform: translateX(3px);  opacity: 1; }
      90%          { transform: translateX(-2px); opacity: 1; }
      92%          { transform: none; opacity: 0; }
    }

    /* ── Alerts ── */
    .ar-alert {
      width: 100%; padding: 9px 12px;
      font-size: .72rem; margin-bottom: 12px;
      display: flex; align-items: flex-start; gap: 8px; line-height: 1.55;
      animation: alertIn .24s cubic-bezier(0.16,1,0.3,1);
      font-family: 'Share Tech Mono', monospace;
      clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
    }
    .ar-alert.error  {
      background: rgba(255,0,110,0.07);
      border: 1px solid rgba(255,0,110,0.3);
      color: #ff6ea3;
      box-shadow: 0 0 18px rgba(255,0,110,0.08) inset;
    }
    .ar-alert.success{
      background: rgba(0,255,225,0.07);
      border: 1px solid rgba(0,255,225,0.3);
      color: #a0fff2;
      box-shadow: 0 0 18px rgba(0,255,225,0.08) inset;
    }
    @keyframes alertIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }

    /* ── Google button ── */
    .ar-google-socials {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 12px;
      min-height: 40px;
    }

    .ar-google-button {
      width: 100%;
      min-height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .ar-google-button > div {
      max-width: 100%;
    }

    .ar-google-button iframe {
      max-width: 100% !important;
    }

    /* ── Social buttons ── */
    .ar-socials { display: flex; gap: 8px; margin-bottom: 12px; width: 100%; }
    .ar-social-btn {
      flex: 1; height: 40px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center; gap: 7px;
      color: rgba(255,255,255,0.5); font-size: .73rem;
      cursor: pointer; font-family: 'Share Tech Mono', monospace; letter-spacing: .04em;
      transition: all .22s; position: relative; overflow: hidden;
      clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);
    }
    .ar-social-btn:hover {
      background: rgba(0,255,225,0.06);
      border-color: rgba(0,255,225,0.3);
      color: var(--cp-cyan);
      box-shadow: 0 0 16px rgba(0,255,225,0.12);
    }
    .ar-social-btn:active { transform: scale(.98); }
    .ar-social-btn:disabled { opacity: .35; cursor: not-allowed; }
    .ar-social-btn-inner { display: flex; align-items: center; gap: 7px; }

    /* ── Divider ── */
    .ar-divider {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 12px; width: 100%;
      font-size: .6rem; letter-spacing: .15em; color: rgba(0,255,225,0.22);
      text-transform: uppercase; font-family: 'Share Tech Mono', monospace;
    }
    .ar-divider::before { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(0,255,225,0.18)); }
    .ar-divider::after  { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(0,255,225,0.18), transparent); }

    /* ── Fields ── */
    .ar-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
    .ar-field { position: relative; margin-bottom: 7px; width: 100%; }
    .ar-field-ico {
      position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
      color: rgba(0,255,225,0.28); pointer-events: none;
      display: flex; align-items: center;
      transition: color .2s;
    }
    .ar-field input, .ar-field select {
      width: 100%; height: 40px;
      background: rgba(0,255,225,0.03);
      border: 1px solid rgba(0,255,225,0.12);
      padding: 0 11px 0 36px;
      color: var(--cp-text); font-size: .75rem;
      font-family: 'Share Tech Mono', monospace; outline: none;
      transition: all .2s;
      appearance: none; -webkit-appearance: none;
      letter-spacing: .04em;
      clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);
    }
    .ar-field select option { background: #080820; color: var(--cp-text); }
    .ar-field input::placeholder { color: rgba(224,248,255,0.14); }
    .ar-field input:focus, .ar-field select:focus {
      background: rgba(0,255,225,0.06);
      border-color: rgba(0,255,225,0.45);
      box-shadow: 0 0 0 2px rgba(0,255,225,0.08), 0 0 16px rgba(0,255,225,0.1);
      color: #ffffff;
    }
    .ar-field input:focus ~ .ar-field-ico,
    .ar-field select:focus ~ .ar-field-ico { color: var(--cp-cyan); }
    .ar-field.has-caret::after {
      content: '▼'; position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
      font-size: 8px; color: rgba(0,255,225,0.3); pointer-events: none;
    }

    /* ── Terms checkbox ── */
    .ar-checkbox{
      display:flex;
      align-items:flex-start;
      gap:10px;
      margin:15px 0;
      width:100%;
      color:#fff;
      font-size:.75rem;
      font-family: 'Share Tech Mono', monospace;
      line-height: 1.5;
    }

    .ar-checkbox input{
      margin-top:3px;
      accent-color: var(--cp-cyan);
      cursor: pointer;
      flex-shrink: 0;
    }

    .ar-checkbox label { cursor: pointer; }

    .ar-link-btn{
      background:none;
      border:none;
      color:#00ffe1;
      cursor:pointer;
      padding:0;
      font:inherit;
      text-decoration:underline;
    }

    .ar-link-btn:hover{
      color:#ffffff;
    }

    /* ── Forgot ── */
    .ar-forgot {
      align-self: flex-end; font-size: .68rem; color: rgba(0,255,225,0.35);
      cursor: pointer; margin-bottom: 12px; text-decoration: none;
      font-family: 'Share Tech Mono', monospace; letter-spacing: .04em;
      transition: color .2s, text-shadow .2s;
    }
    .ar-forgot:hover {
      color: var(--cp-cyan);
      text-shadow: 0 0 12px rgba(0,255,225,0.5);
    }

    /* ── Submit button ── */
    .ar-submit {
      width: 100%; height: 44px; border: none;
      background: transparent;
      position: relative; overflow: hidden; margin-top: 4px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-family: 'Orbitron', monospace;
      font-size: .72rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
      color: #000;
      transition: transform .3s cubic-bezier(0.16,1,0.3,1), box-shadow .3s;
      will-change: transform;
      clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    }
    .ar-submit-bg {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, var(--cp-cyan) 0%, #00c8b0 50%, var(--cp-yellow) 100%);
      transition: opacity .3s;
    }
    .ar-submit-bg-hover {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, var(--cp-yellow) 0%, var(--cp-cyan) 60%, #00ffd0 100%);
      opacity: 0; transition: opacity .3s;
    }
    .ar-submit:hover:not(:disabled) .ar-submit-bg-hover { opacity: 1; }
    .ar-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 40px rgba(0,255,225,0.4), 0 0 0 1px rgba(0,255,225,0.3);
    }
    .ar-submit:active:not(:disabled) { transform: scale(.99); }
    .ar-submit:disabled { opacity: .4; cursor: not-allowed; }
    .ar-submit-inner { position: relative; z-index: 1; display: flex; align-items: center; gap: 8px; color: #000; font-weight: 700; }
    .ar-spinner {
      width: 13px; height: 13px; border-radius: 50%;
      border: 2px solid rgba(0,0,0,.22); border-top-color: #000;
      animation: sp .5s linear infinite; flex-shrink: 0;
    }
    @keyframes sp { to { transform: rotate(360deg); } }

    /* ── Note ── */
    .ar-note {
      font-size: .67rem; color: var(--cp-muted);
      text-align: center; margin-top: 12px; line-height: 1.9;
      font-family: 'Share Tech Mono', monospace;
    }
    .ar-note a, .ar-note button {
      color: rgba(0,255,225,0.55); cursor: pointer; text-decoration: none;
      background: none; border: none; font: inherit; font-family: 'Share Tech Mono', monospace;
      transition: color .2s, text-shadow .2s; padding: 0;
    }
    .ar-note a:hover, .ar-note button:hover {
      color: var(--cp-cyan);
      text-shadow: 0 0 10px rgba(0,255,225,0.5);
    }

    /* ════════════════════════════════
       INFO PANEL
    ════════════════════════════════ */
    .ar-orb { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; }
    .ar-orb-1 { width: 280px; height: 280px; background: rgba(0,255,225,0.12); top: -100px; right: -60px; }
    .ar-orb-2 { width: 200px; height: 200px; background: rgba(255,0,110,0.1);  bottom: -60px; left: -40px; }
    .ar-orb-3 { width: 140px; height: 140px; background: rgba(245,255,0,0.06); top: 45%; left: 25%; }

    .ar-hex-panel {
      position: absolute; inset: 0; pointer-events: none;
      background-image:
        linear-gradient(rgba(0,255,225,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,225,0.04) 1px, transparent 1px);
      background-size: 28px 28px;
    }

    .ar-corner { position: absolute; width: 36px; height: 36px; pointer-events: none; }
    .ar-corner-tl { top: 14px; left: 14px;
      border-top: 2px solid var(--cp-cyan); border-left: 2px solid var(--cp-cyan);
      box-shadow: -2px -2px 8px rgba(0,255,225,0.3), inset 1px 1px 4px rgba(0,255,225,0.1); }
    .ar-corner-br { bottom: 14px; right: 14px;
      border-bottom: 2px solid var(--cp-pink); border-right: 2px solid var(--cp-pink);
      box-shadow: 2px 2px 8px rgba(255,0,110,0.3), inset -1px -1px 4px rgba(255,0,110,0.1); }
    .ar-corner-tr { top: 14px; right: 14px;
      border-top: 1px solid rgba(245,255,0,0.3); border-right: 1px solid rgba(245,255,0,0.3); }
    .ar-corner-bl { bottom: 14px; left: 14px;
      border-bottom: 1px solid rgba(0,255,225,0.2); border-left: 1px solid rgba(0,255,225,0.2); }

    .ar-shard { position: absolute; pointer-events: none; animation: nodeFloat var(--dur,7s) ease-in-out infinite; animation-delay: var(--del,0s); }
    @keyframes nodeFloat {
      0%,100% { transform: translateY(0) rotate(0deg); opacity: .3; }
      50%      { transform: translateY(-18px) rotate(30deg); opacity: .9; }
    }
    .ar-shard-1 { top: 58px;   right: 22px;  --dur: 7s; --del: -2s; }
    .ar-shard-2 { bottom: 70px; right: 16px; --dur: 5s; --del: 0s;  }
    .ar-shard-3 { top: 155px;  left: 16px;  --dur: 9s; --del: -4s; }
    .ar-shard-4 { bottom: 30px; left: 40px; --dur: 6s; --del: -1s; }

    .ar-info { position: relative; z-index: 2; width: 100%; text-align: center; }

    .ar-logo-wrap {
      display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
    }
    .ar-logo-img {
      width: 68px; height: 68px; object-fit: contain;
      filter: drop-shadow(0 0 16px rgba(0,255,225,0.6)) drop-shadow(0 0 32px rgba(0,255,225,0.2));
      animation: logoPulse 3s ease-in-out infinite;
    }
    @keyframes logoPulse {
      0%,100% { filter: drop-shadow(0 0 12px rgba(0,255,225,0.5)); transform: scale(1); }
      50%      { filter: drop-shadow(0 0 28px rgba(0,255,225,0.9)) drop-shadow(0 0 50px rgba(255,0,110,0.3)); transform: scale(1.04); }
    }

    .ar-brand-name {
      font-family: 'Orbitron', monospace; font-weight: 700;
      font-size: .6rem; letter-spacing: .22em; text-transform: uppercase;
      color: rgba(0,255,225,0.4); margin-bottom: 14px;
    }

    .ar-rule {
      width: 48px; height: 2px; margin: 0 auto 16px;
      background: linear-gradient(90deg, transparent, var(--cp-cyan), var(--cp-pink), transparent);
      box-shadow: 0 0 8px rgba(0,255,225,0.4);
    }

    .ar-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(0,255,225,0.06);
      border: 1px solid rgba(0,255,225,0.2);
      padding: 4px 12px;
      font-size: .56rem; letter-spacing: .18em; text-transform: uppercase;
      color: rgba(0,255,225,0.6); margin-bottom: 10px;
      font-family: 'Share Tech Mono', monospace;
      clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    }
    .ar-badge-dot {
      width: 5px; height: 5px;
      background: var(--cp-cyan);
      box-shadow: 0 0 8px var(--cp-cyan);
      animation: dotPulse 1.5s ease-in-out infinite;
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }
    @keyframes dotPulse { 0%,100% { opacity: .4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.4); } }

    .ar-info-title {
      font-family: 'Orbitron', monospace;
      font-size: 1.3rem; font-weight: 900; line-height: 1.2; margin-bottom: 8px;
      text-transform: uppercase; letter-spacing: .06em; color: var(--cp-text);
    }
    .ar-info-title .hl-cyan { color: var(--cp-cyan); text-shadow: 0 0 18px rgba(0,255,225,0.65); }
    .ar-info-title .hl-pink { color: var(--cp-pink); text-shadow: 0 0 18px rgba(255,0,110,0.65); }
    .ar-info-desc {
      font-size: .69rem; color: var(--cp-muted); line-height: 1.9;
      margin-bottom: 18px; max-width: 210px; margin-left: auto; margin-right: auto;
      font-family: 'Share Tech Mono', monospace;
    }

    .ar-stats {
      display: flex; gap: 0; margin-bottom: 16px;
      background: rgba(0,255,225,0.04);
      border: 1px solid rgba(0,255,225,0.1);
      overflow: hidden;
      clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    }
    .ar-stat {
      flex: 1; padding: 10px 6px; text-align: center;
      border-right: 1px solid rgba(0,255,225,0.08);
    }
    .ar-stat:last-child { border-right: none; }
    .ar-stat-val {
      font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700;
      color: var(--cp-cyan);
      text-shadow: 0 0 12px rgba(0,255,225,0.6);
      line-height: 1;
    }
    .ar-stat-label { font-size: .52rem; color: var(--cp-muted); letter-spacing: .08em; margin-top: 3px; font-family: 'Share Tech Mono', monospace; }

    .ar-chips { display: flex; flex-direction: column; gap: 5px; margin-bottom: 18px; text-align: left; }
    .ar-chip {
      display: flex; align-items: center; gap: 9px;
      background: rgba(0,255,225,0.03);
      border: 1px solid rgba(0,255,225,0.09);
      padding: 8px 11px;
      font-size: .68rem; color: rgba(224,248,255,0.4);
      font-family: 'Share Tech Mono', monospace; letter-spacing: .03em;
      transition: all .28s;
      clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%);
    }
    .ar-chip:hover {
      background: rgba(0,255,225,0.08);
      border-color: rgba(0,255,225,0.28);
      color: rgba(224,248,255,0.85);
      transform: translateX(6px);
      box-shadow: 0 0 12px rgba(0,255,225,0.08);
    }
    .ar-chip-icon { color: var(--cp-cyan); flex-shrink: 0; display: flex; align-items: center; }

    .ar-info-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; cursor: pointer;
      background: transparent;
      border: 1px solid rgba(255,0,110,0.35);
      color: var(--cp-pink); font-size: .7rem; font-weight: 700;
      font-family: 'Orbitron', monospace; letter-spacing: .1em; text-transform: uppercase;
      position: relative; overflow: hidden;
      transition: all .28s cubic-bezier(0.16,1,0.3,1);
      clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    }
    .ar-info-btn::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,0,110,0.15), rgba(255,0,110,0.08));
      opacity: 0; transition: opacity .28s;
    }
    .ar-info-btn:hover::before { opacity: 1; }
    .ar-info-btn:hover {
      border-color: var(--cp-pink);
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(255,0,110,0.28), 0 0 0 1px rgba(255,0,110,0.15);
      text-shadow: 0 0 12px rgba(255,0,110,0.6);
    }
    .ar-info-btn span { position: relative; z-index: 1; display: flex; align-items: center; gap: 7px; }

    /* Hidden on desktop */
    .ar-mobile-header,
    .ar-mob-tabs,
    .ar-mob-ticker,
    .ar-mob-hero,
    .ar-mob-stats-bar { display: none; }

    .ar-desktop-fields { display: block; }
    .ar-mobile-stepper { display: none; }

    .ar-step-card {
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(0,255,225,0.18);
      background:
        linear-gradient(145deg, rgba(0,255,225,0.08), transparent 34%),
        linear-gradient(315deg, rgba(255,0,110,0.11), transparent 42%),
        rgba(8,8,24,0.92);
      box-shadow: 0 18px 45px rgba(0,0,0,0.45), inset 0 0 38px rgba(0,255,225,0.05);
      clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
      padding: 18px 70px 30px;
    }
    .ar-step-card::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(circle at 15% 0%, rgba(245,255,0,0.12), transparent 32%);
      pointer-events: none;
    }
    .ar-step-progress { position: relative; display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
    .ar-step-dot {
      position: relative; z-index: 1; width: 30px; height: 30px; border-radius: 999px;
      display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid rgba(0,255,225,0.24); background: #111126; color: rgba(224,248,255,0.52);
      font-size: 0.68rem; font-weight: 700;
    }
    .ar-step-dot.done, .ar-step-dot.active {
      color: #05050f; background: var(--cp-cyan);
      box-shadow: 0 0 18px rgba(0,255,225,0.42);
    }
    .ar-step-line { height: 2px; flex: 1; overflow: hidden; border-radius: 999px; background: rgba(224,248,255,0.12); }
    .ar-step-line span { display: block; height: 100%; background: linear-gradient(90deg, var(--cp-cyan), var(--cp-pink)); }
    .ar-step-head { position: relative; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 15px; }
    .ar-step-icon {
      width: 38px; height: 38px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
      background: rgba(255,0,110,0.16); color: var(--cp-cyan); border: 1px solid rgba(255,0,110,0.28); flex-shrink: 0;
    }
    .ar-step-kicker { color: var(--cp-yellow); font-size: 0.58rem; letter-spacing: 0.18em; margin-bottom: 4px; }
    .ar-step-title { color: var(--cp-text); font-family: 'Orbitron', sans-serif; font-size: 1rem; line-height: 1.2; }
    .ar-step-hint { color: rgba(224,248,255,0.52); font-size: 0.68rem; line-height: 1.55; margin-top: 6px; }
    .ar-step-body { position: relative; min-height: 150px; }
    .ar-step-actions { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 16px; }
    .ar-step-back, .ar-step-next { border: 0; font-family: 'Share Tech Mono', monospace; cursor: pointer; }
    .ar-step-back {
      min-height: 44px; flex: 1; border-radius: 999px; color: #05050f; font-weight: 800; letter-spacing: 0.08em;
      background: linear-gradient(90deg, var(--cp-cyan), var(--cp-yellow)); box-shadow: 0 0 20px rgba(0, 140, 255, 0.28);
    }
    .ar-step-back:disabled { opacity: 0.35; cursor: default; }
    .ar-step-next {
      min-height: 44px; flex: 1; border-radius: 999px; color: #05050f; font-weight: 800; letter-spacing: 0.08em;
      background: linear-gradient(90deg, var(--cp-cyan), var(--cp-yellow)); box-shadow: 0 0 20px rgba(0,255,225,0.28);
    }
    .ar-step-next:disabled { opacity: 0.45; cursor: not-allowed; }


    /* ══════════════════════════════════════════════════════
       MOBILE — Full Portal Redesign (≤ 820px)
    ══════════════════════════════════════════════════════ */
    @media (max-width: 820px) {

      .ar-desktop-fields { display: none; }
      .ar-mobile-stepper { display: block; }
      .ar-mobile-stepper .ar-row { grid-template-columns: 1fr; gap: 0; }
      .ar-mobile-stepper .ar-field { margin-bottom: 10px; }
      .ar-scene.signup-mode .ar-form {
        background:
          linear-gradient(180deg, rgba(5,5,18,0.72), rgba(5,5,18,0.96)),
          radial-gradient(circle at 18% 8%, rgba(0,255,225,0.18), transparent 30%),
          radial-gradient(circle at 86% 4%, rgba(255,0,110,0.18), transparent 32%);
        border-color: rgba(0,255,225,0.24);
        box-shadow:
          0 22px 60px rgba(0,0,0,0.58),
          0 0 0 1px rgba(245,255,0,0.06),
          inset 0 0 42px rgba(0,255,225,0.06);
      }
      .ar-scene.signup-mode .ar-title {
        text-shadow: 0 0 24px rgba(0,255,225,0.34);
      }
      .ar-scene.signup-mode .ar-mobile-stepper {
        position: relative;
        margin-top: 2px;
      }
      .ar-scene.signup-mode .ar-mobile-stepper::before {
        content: '';
        position: absolute;
        inset: -12px -8px auto -8px;
        height: 70px;
        background:
          linear-gradient(90deg, transparent, rgba(0,255,225,0.22), transparent),
          repeating-linear-gradient(90deg, transparent 0 12px, rgba(245,255,0,0.08) 12px 13px);
        opacity: 0.75;
        filter: blur(0.2px);
        pointer-events: none;
        animation: stepScan 4.5s linear infinite;
      }
      @keyframes stepScan {
        0% { transform: translateX(-34%); opacity: 0.2; }
        45% { opacity: 0.9; }
        100% { transform: translateX(34%); opacity: 0.2; }
      }
      .ar-scene.signup-mode .ar-step-card {
        border-color: rgba(0,255,225,0.32);
        background:
          linear-gradient(150deg, rgba(0,255,225,0.14), transparent 34%),
          linear-gradient(330deg, rgba(255,0,110,0.16), transparent 40%),
          repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 13px),
          rgba(4,4,16,0.96);
        box-shadow:
          0 20px 60px rgba(0,0,0,0.58),
          0 0 34px rgba(0,255,225,0.12),
          inset 0 0 50px rgba(255,0,110,0.055);
      }
      .ar-scene.signup-mode .ar-step-card::after {
        content: '';
        position: absolute;
        left: 14px; right: 14px; bottom: 10px;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--cp-yellow), var(--cp-cyan), transparent);
        opacity: 0.55;
      }
      .ar-scene.signup-mode .ar-step-progress {
        padding: 4px;
        border: 1px solid rgba(224,248,255,0.08);
        background: rgba(0,0,0,0.18);
        border-radius: 999px;
      }
      .ar-scene.signup-mode .ar-step-dot {
        width: 32px;
        height: 32px;
        border-color: rgba(0,255,225,0.36);
        box-shadow: inset 0 0 12px rgba(0,255,225,0.06);
      }
      .ar-scene.signup-mode .ar-step-dot.active {
        background: linear-gradient(135deg, var(--cp-cyan), var(--cp-yellow));
        transform: translateY(-1px);
      }
      .ar-scene.signup-mode .ar-step-icon {
        background:
          linear-gradient(135deg, rgba(0,255,225,0.18), rgba(255,0,110,0.18));
        border-color: rgba(0,255,225,0.38);
        box-shadow: 0 0 24px rgba(0,255,225,0.18);
      }
      .ar-scene.signup-mode .ar-step-next {
        background: linear-gradient(90deg, var(--cp-cyan), var(--cp-yellow) 52%, #fff);
        box-shadow: 0 0 28px rgba(0,255,225,0.32), 0 8px 26px rgba(0,0,0,0.32);
      }

      .ar-back { display: none; }

      .ar {
        padding: 0;
        align-items: stretch;
        justify-content: stretch;
        min-height: 100svh;
      }

      .ar-scene {
        flex-direction: column !important;
        max-width: 100%;
        min-height: 100svh;
        clip-path: none !important;
        border-left: none !important;
        border-right: none !important;
        border-top: none !important;
        border-radius: 0 !important;
        overflow: visible;
        background: transparent;
        box-shadow: none;
      }
      .ar-scene::before, .ar-scene::after { display: none; }

      /* Kill desktop info panel */
      .ar-info-panel { display: none !important; }
      .ar-scene.signup-mode .ar-info-panel { display: none !important; }
      .ar-scene.signup-mode .ar-form-panel {
        border-right: none !important;
        border-left: none !important;
      }

      /* ─────────────────────────────────────────────
         MOBILE HUD HEADER — sticky neon nav bar
      ───────────────────────────────────────────── */
      .ar-mobile-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        height: 54px;
        background: rgba(3,3,14,0.96);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        position: sticky;
        top: 0;
        z-index: 50;
        flex-shrink: 0;
        border-bottom: 1px solid rgba(0,255,225,0.12);
        box-shadow:
          0 1px 0 rgba(0,255,225,0.05),
          0 4px 40px rgba(0,0,0,0.8),
          0 0 60px rgba(0,255,225,0.03) inset;
      }

      /* HUD: animated top trace line */
      .ar-mobile-header::after {
        content: '';
        position: absolute;
        bottom: -1px; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg,
          transparent 0%, var(--cp-cyan) 30%, var(--cp-pink) 70%, transparent 100%);
        opacity: 0.35;
        animation: cpTrace 3s ease-in-out infinite;
      }

      .ar-mh-left {
        display: flex; align-items: center; gap: 10px; text-decoration: none; cursor: pointer;
      }
      .ar-mh-logo-img {
        width: 32px; height: 32px; object-fit: contain;
        filter: drop-shadow(0 0 10px rgba(0,255,225,0.9));
        animation: logoPulse 3s ease-in-out infinite;
        flex-shrink: 0;
      }
      .ar-mh-brand {
        font-family: 'Orbitron', monospace; font-size: 0.65rem;
        font-weight: 900; letter-spacing: 0.22em;
        color: rgba(0,255,225,0.95); text-transform: uppercase; line-height: 1;
        text-shadow: 0 0 16px rgba(0,255,225,0.5);
      }
      .ar-mh-tagline {
        font-family: 'Share Tech Mono', monospace; font-size: 0.44rem;
        color: rgba(255,0,110,0.55); letter-spacing: 0.1em; margin-top: 3px; line-height: 1;
      }
      .ar-mh-status {
        display: flex; align-items: center; gap: 5px;
        font-family: 'Share Tech Mono', monospace; font-size: 0.46rem;
        color: rgba(0,255,225,0.35); letter-spacing: 0.12em; text-transform: uppercase;
      }
      .ar-mh-dot {
        width: 5px; height: 5px; background: var(--cp-cyan); border-radius: 50%;
        box-shadow: 0 0 8px var(--cp-cyan); animation: dotPulse 1.5s ease-in-out infinite;
        flex-shrink: 0;
      }

      /* ─────────────────────────────────────────────
         MOBILE HERO — cinematic brand splash
      ───────────────────────────────────────────── */
      .ar-mob-hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 28px 20px 0;
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
        /* Full-bleed background atmosphere */
        background:
          radial-gradient(ellipse 120% 60% at 50% 0%, rgba(0,255,225,0.1) 0%, transparent 65%),
          radial-gradient(ellipse 80% 40% at 80% 100%, rgba(255,0,110,0.08) 0%, transparent 55%),
          rgba(5,5,18,0.98);
      }

      /* Hero: subtle horizontal grid lines */
      .ar-mob-hero::before {
        content: '';
        position: absolute; inset: 0;
        background-image: repeating-linear-gradient(
          0deg, transparent, transparent 30px,
          rgba(0,255,225,0.025) 30px, rgba(0,255,225,0.025) 31px
        );
        pointer-events: none;
      }

      /* Hero: cyan glow pulse at top */
      .ar-mob-hero::after {
        content: '';
        position: absolute; top: -1px; left: 10%; right: 10%; height: 2px;
        background: linear-gradient(90deg, transparent, var(--cp-cyan), transparent);
        animation: cpTrace 2.5s ease-in-out infinite;
        filter: blur(1px);
      }

      .ar-mob-logo-ring {
        position: relative;
        width: 80px; height: 80px;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 10px;
        flex-shrink: 0;
      }

      /* Rotating outer hex ring */
      .ar-mob-logo-ring::before {
        content: '';
        position: absolute; inset: -6px;
        border: 1.5px solid transparent;
        border-top-color: var(--cp-cyan);
        border-right-color: rgba(0,255,225,0.4);
        border-radius: 50%;
        animation: ringRotate 3s linear infinite;
      }
      /* Counter-rotating inner ring */
      .ar-mob-logo-ring::after {
        content: '';
        position: absolute; inset: 2px;
        border: 1px dashed rgba(255,0,110,0.3);
        border-radius: 50%;
        animation: ringRotate 6s linear infinite reverse;
      }
      @keyframes ringRotate { to { transform: rotate(360deg); } }

      .ar-mob-logo-ring img {
        width: 58px; height: 58px; object-fit: contain;
        filter: drop-shadow(0 0 18px rgba(0,255,225,0.8)) drop-shadow(0 0 40px rgba(0,255,225,0.3));
        animation: logoPulse 3s ease-in-out infinite;
        position: relative; z-index: 1;
      }

      /* Hero brand title */
      .ar-mob-hero-title {
        font-family: 'Orbitron', monospace;
        font-size: 1.55rem; font-weight: 900;
        letter-spacing: 0.18em; text-transform: uppercase;
        color: var(--cp-text);
        text-shadow: 0 0 30px rgba(0,255,225,0.3);
        line-height: 1; margin-bottom: 4px;
        position: relative; z-index: 1;
      }
      .ar-mob-hero-title .hc { color: var(--cp-cyan); text-shadow: 0 0 20px rgba(0,255,225,0.8); }
      .ar-mob-hero-title .hp { color: var(--cp-pink); text-shadow: 0 0 20px rgba(255,0,110,0.8); }

      .ar-mob-hero-sub {
        font-family: 'Share Tech Mono', monospace;
        font-size: 0.5rem; letter-spacing: 0.22em;
        color: rgba(0,255,225,0.35); text-transform: uppercase;
        margin-bottom: 16px; position: relative; z-index: 1;
      }
      .ar-mob-hero-sub::before { content: '[ '; color: rgba(255,0,110,0.4); }
      .ar-mob-hero-sub::after  { content: ' ]'; color: rgba(255,0,110,0.4); }

      /* ─────────────────────────────────────────────
         MOBILE STATS BAR
      ───────────────────────────────────────────── */
      .ar-mob-stats-bar {
        display: flex;
        width: calc(100% - 32px);
        margin: 0 16px 16px;
        border: 1px solid rgba(0,255,225,0.1);
        background: rgba(0,255,225,0.025);
        overflow: hidden;
        flex-shrink: 0;
        position: relative; z-index: 1;
      }
      .ar-mob-stat {
        flex: 1; padding: 8px 4px; text-align: center;
        border-right: 1px solid rgba(0,255,225,0.07);
      }
      .ar-mob-stat:last-child { border-right: none; }
      .ar-mob-stat-val {
        font-family: 'Orbitron', monospace; font-size: 0.82rem; font-weight: 700;
        color: var(--cp-cyan); text-shadow: 0 0 10px rgba(0,255,225,0.5); line-height: 1;
      }
      .ar-mob-stat-lbl {
        font-size: 0.44rem; color: var(--cp-muted);
        letter-spacing: 0.08em; margin-top: 3px;
        font-family: 'Share Tech Mono', monospace; text-transform: uppercase;
      }

      /* ─────────────────────────────────────────────
         MOBILE TAB SWITCHER — pill selector
      ───────────────────────────────────────────── */
      .ar-mob-tabs {
        display: flex;
        padding: 0 16px 14px;
        width: 100%;
        flex-shrink: 0;
        gap: 0;
        background: rgba(5,5,18,0.98);
        position: relative; z-index: 2;
      }

      /* Pill container */
      .ar-mob-tab-track {
        width: 100%;
        display: flex;
        height: 48px;
        background: rgba(0,0,0,0.5);
        border: 1px solid rgba(0,255,225,0.1);
        position: relative;
        overflow: hidden;
        border-radius: 0;
        clip-path: polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, calc(100% - 8px) calc(100%), 8px 100%, 0 calc(100% - 8px), 0 8px);
      }

      /* Sliding highlight */
      .ar-mob-tab-track::before {
        content: '';
        position: absolute;
        top: 0; bottom: 0;
        left: var(--tab-x, 0%);
        width: 50%;
        background: linear-gradient(135deg, rgba(0,255,225,0.12), rgba(0,255,225,0.05));
        border-right: 1px solid rgba(0,255,225,0.2);
        transition: left 0.32s cubic-bezier(0.16,1,0.3,1);
        z-index: 0;
      }
      .ar-mob-tab-track.signup-active::before {
        left: 50%;
        background: linear-gradient(135deg, rgba(255,0,110,0.12), rgba(255,0,110,0.05));
        border-right: none;
        border-left: 1px solid rgba(255,0,110,0.2);
      }

      .ar-mob-tab {
        flex: 1; height: 100%;
        background: transparent;
        border: none;
        color: rgba(224,248,255,0.22);
        font-family: 'Orbitron', monospace;
        font-size: 0.57rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
        cursor: pointer;
        transition: color 0.24s, text-shadow 0.24s;
        display: flex; align-items: center; justify-content: center; gap: 7px;
        position: relative; z-index: 1;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .ar-mob-tab--active {
        color: var(--cp-cyan);
        text-shadow: 0 0 16px rgba(0,255,225,0.6);
      }
      .ar-mob-tab--signup.ar-mob-tab--active {
        color: var(--cp-pink);
        text-shadow: 0 0 16px rgba(255,0,110,0.6);
      }
      .ar-mob-tab:disabled { opacity: 0.5; cursor: not-allowed; }
      .ar-mob-tab:active:not(:disabled) { opacity: 0.7; }

      /* Bottom accent line for active tab */
      .ar-mob-tab-bar {
        position: absolute; bottom: 0; left: 15%; right: 15%; height: 2px;
        background: var(--cp-cyan); box-shadow: 0 0 10px var(--cp-cyan);
        opacity: 0; transition: opacity 0.24s; border-radius: 1px;
      }
      .ar-mob-tab--active .ar-mob-tab-bar { opacity: 1; }
      .ar-mob-tab--signup.ar-mob-tab--active .ar-mob-tab-bar {
        background: var(--cp-pink); box-shadow: 0 0 10px var(--cp-pink);
      }

      /* Tab divider */
      .ar-mob-tab-div {
        position: absolute; left: 50%; top: 20%; bottom: 20%;
        width: 1px; background: rgba(0,255,225,0.08); z-index: 2;
      }

      /* ─────────────────────────────────────────────
         FEATURE TICKER
      ───────────────────────────────────────────── */
      .ar-mob-ticker {
        display: flex;
        overflow: hidden;
        width: 100%;
        padding: 6px 0;
        border-top: 1px solid rgba(0,255,225,0.05);
        border-bottom: 1px solid rgba(0,255,225,0.05);
        background: rgba(0,0,0,0.3);
        flex-shrink: 0;
        -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        position: relative; z-index: 1;
      }
      .ar-mob-ticker-inner {
        display: flex;
        animation: tickerScroll 22s linear infinite;
        flex-shrink: 0; will-change: transform;
      }
      .ar-mob-ticker-inner:hover { animation-play-state: paused; }
      .ar-mob-ticker-item {
        font-family: 'Share Tech Mono', monospace; font-size: 0.5rem;
        color: rgba(0,255,225,0.28); letter-spacing: 0.14em;
        white-space: nowrap; padding: 0 18px;
        display: flex; align-items: center; gap: 7px; text-transform: uppercase;
      }
      .ar-mob-ticker-dot { color: rgba(255,0,110,0.4); font-size: 0.42rem; flex-shrink: 0; }
      @keyframes tickerScroll {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }

      /* ─────────────────────────────────────────────
         FORM PANEL — mobile card style
      ───────────────────────────────────────────── */
      .ar-form-panel {
        flex: 1;
        padding: 24px 18px 50px;
        border-right: none !important;
        border-left: none !important;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        position: relative;
        overflow: visible;
        min-height: 0;
        /* Layered background: deep space with subtle corner glows */
        background:
          radial-gradient(ellipse 60% 30% at 0% 0%, rgba(0,255,225,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 50% 25% at 100% 100%, rgba(255,0,110,0.05) 0%, transparent 55%),
          rgba(5,5,18,0.98);
      }

      /* Replace desktop CRT effects with clean corner accents */
      .ar-form-panel::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 1px;
        width: auto; bottom: auto;
        background: linear-gradient(90deg, transparent 5%, rgba(0,255,225,0.15) 30%, rgba(0,255,225,0.08) 70%, transparent 95%);
        pointer-events: none; z-index: 1; display: block;
        box-shadow: none; animation: none;
        background-size: auto; background-image: none;
        background: linear-gradient(90deg, transparent 5%, rgba(0,255,225,0.15) 30%, rgba(0,255,225,0.08) 70%, transparent 95%);
      }

      .ar-form-panel::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0; right: 0; height: 1px;
        top: auto; width: auto;
        background: linear-gradient(90deg, transparent 5%, rgba(255,0,110,0.1) 40%, rgba(255,0,110,0.06) 60%, transparent 95%);
        pointer-events: none; z-index: 1; display: block;
        animation: none; background-size: auto;
      }

      /* ─────────────────────────────────────────────
         MOBILE FORM — floating neon card
      ───────────────────────────────────────────── */
      .ar-form {
        max-width: 480px;
        width: 100%;
        position: relative; z-index: 1;
        /* Card glass surface */
        background: rgba(6,6,20,0.7);
        border: 1px solid rgba(0,255,225,0.1);
        padding: 22px 18px 18px;
        clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
        box-shadow:
          0 0 0 1px rgba(255,0,110,0.05),
          0 0 40px rgba(0,255,225,0.04) inset,
          0 20px 60px rgba(0,0,0,0.7);
      }

      /* Animated cyan corner accent on the card */
      .ar-form::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg,
          var(--cp-cyan) 0%, rgba(0,255,225,0.3) 40%, rgba(255,0,110,0.2) 70%, transparent 100%);
        animation: cpTrace 3s ease-in-out infinite;
        filter: blur(0.5px);
        clip-path: none;
        border: none; box-shadow: none;
      }

      /* Glowing bottom-right corner dot */
      .ar-form::after {
        content: '';
        position: absolute; bottom: 12px; right: 12px;
        width: 6px; height: 6px;
        background: var(--cp-pink);
        box-shadow: 0 0 10px var(--cp-pink);
        clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        animation: dotPulse 2s ease-in-out infinite;
      }

      /* Mode label badge inside form */
      .ar-eyebrow { font-size: 0.6rem; margin-bottom: 5px; }
      .ar-title   { font-size: 1.35rem; }
      .ar-sub     { font-size: 0.7rem; }

      /* Bigger touch targets */
      .ar-field input, .ar-field select {
        height: 50px; font-size: 0.8rem; padding: 0 14px 0 40px;
        border-color: rgba(0,255,225,0.1);
        clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%);
      }
      .ar-field { margin-bottom: 9px; }
      .ar-field-ico { left: 13px; }
      .ar-social-btn {
        height: 50px; font-size: 0.78rem;
        border-color: rgba(0,255,225,0.1);
      }
      .ar-submit {
        height: 54px; font-size: 0.75rem; margin-top: 6px;
        clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
      }
      .ar-forgot { padding: 6px 0; font-size: 0.72rem; min-height: 38px; display: flex; align-items: center; }
      .ar-alert { font-size: 0.7rem; }
      .ar-note  { font-size: 0.65rem; }
      .ar-divider { font-size: 0.58rem; }

      /* Future mobile console skin */
      .ar-bg {
        background:
          radial-gradient(circle at 20% 6%, rgba(0,255,225,0.22), transparent 34%),
          radial-gradient(circle at 86% 14%, rgba(255,0,110,0.2), transparent 30%),
          radial-gradient(circle at 52% 92%, rgba(245,255,0,0.08), transparent 34%),
          linear-gradient(160deg, #02020a 0%, #080522 44%, #02020a 100%);
      }
      .ar-bg::before,
      .ar-bg::after {
        content: '';
        position: absolute;
        inset: -20%;
        pointer-events: none;
      }
      .ar-bg::before {
        background:
          conic-gradient(from 90deg at 50% 50%, transparent 0deg, rgba(0,255,225,0.14) 38deg, transparent 82deg, rgba(255,0,110,0.12) 145deg, transparent 220deg, rgba(245,255,0,0.07) 300deg, transparent 360deg);
        filter: blur(28px);
        opacity: 0.34;
        animation: none;
      }
      .ar-bg::after {
        background-image:
          linear-gradient(115deg, transparent 0 42%, rgba(0,255,225,0.08) 42% 43%, transparent 43% 100%),
          linear-gradient(65deg, transparent 0 58%, rgba(255,0,110,0.075) 58% 59%, transparent 59% 100%);
        background-size: 170px 170px;
        opacity: 0.26;
        animation: none;
      }
      .ar-grid {
        background-size: 34px 34px;
        transform: none;
        transform-origin: center;
        opacity: 0.22;
        animation: none;
      }
      .ar-scanlines {
        display: none;
      }
      .ar-particle {
        border-radius: 999px;
        clip-path: none;
        filter: none;
        animation-name: mobileParticleLift;
      }

      .ar-mobile-header {
        height: 62px;
        margin: 10px 12px 0;
        border: 1px solid rgba(0,255,225,0.18);
        border-radius: 18px;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.015)),
          rgba(3,5,18,0.76);
        box-shadow:
          0 20px 50px rgba(0,0,0,0.42),
          0 0 38px rgba(0,255,225,0.08),
          inset 0 1px 0 rgba(255,255,255,0.14);
      }
      .ar-mobile-header::before {
        content: '';
        position: absolute;
        inset: 7px;
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 13px;
        pointer-events: none;
      }
      .ar-mobile-header::after {
        left: 18px;
        right: 18px;
        bottom: 6px;
        animation: mobileTraceSweep 2.8s ease-in-out infinite;
      }
      .ar-mh-logo-img {
        width: 38px;
        height: 38px;
        padding: 5px;
        border-radius: 14px;
        background: rgba(0,255,225,0.08);
        border: 1px solid rgba(0,255,225,0.24);
      }
      .ar-mh-brand {
        font-size: 0.74rem;
        letter-spacing: 0.18em;
      }
      .ar-mh-tagline {
        color: rgba(245,255,0,0.52);
      }
      .ar-mh-status {
        padding: 8px 9px;
        border-radius: 999px;
        color: rgba(224,248,255,0.62);
        border: 1px solid rgba(0,255,225,0.14);
        background: rgba(0,255,225,0.045);
      }

      .ar-mob-hero {
        min-height: 188px;
        padding: 30px 20px 12px;
        background:
          radial-gradient(circle at 50% 36%, rgba(0,255,225,0.2), transparent 24%),
          radial-gradient(circle at 28% 62%, rgba(255,0,110,0.13), transparent 30%),
          transparent;
      }
      .ar-mob-hero::before {
        inset: 14px 18px 0;
        border: 1px solid rgba(0,255,225,0.08);
        border-radius: 28px 28px 8px 8px;
        background:
          linear-gradient(90deg, transparent 0 18%, rgba(0,255,225,0.12) 18% 19%, transparent 19% 81%, rgba(255,0,110,0.12) 81% 82%, transparent 82%),
          repeating-linear-gradient(0deg, transparent 0 20px, rgba(255,255,255,0.035) 20px 21px);
        mask-image: linear-gradient(180deg, black 0 72%, transparent 100%);
      }
      .ar-mob-hero::after {
        top: 28px;
        left: 24%;
        right: 24%;
        height: 3px;
        background: linear-gradient(90deg, transparent, rgba(245,255,0,0.9), rgba(0,255,225,0.95), transparent);
        animation: mobileTraceSweep 3.2s ease-in-out infinite;
      }
      .ar-mob-logo-ring {
        width: 96px;
        height: 96px;
        margin-bottom: 14px;
        isolation: isolate;
      }
      .ar-mob-logo-ring::before {
        inset: -11px;
        border-width: 2px;
        border-left-color: rgba(245,255,0,0.42);
        box-shadow: 0 0 30px rgba(0,255,225,0.22);
      }
      .ar-mob-logo-ring::after {
        inset: 8px;
        border-style: solid;
        border-color: rgba(255,0,110,0.24);
        box-shadow: inset 0 0 24px rgba(255,0,110,0.1);
      }
      .ar-mob-logo-ring img {
        width: 68px;
        height: 68px;
        padding: 8px;
        border-radius: 24px;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)),
          rgba(0,0,0,0.36);
        border: 1px solid rgba(255,255,255,0.13);
        animation: mobileLogoFloat 4s ease-in-out infinite;
      }
      .ar-mob-hero-title {
        font-size: 1.8rem;
        letter-spacing: 0.2em;
        animation: mobileTitleGlitch 5.5s steps(1,end) infinite;
      }
      .ar-mob-hero-sub {
        color: rgba(224,248,255,0.58);
      }

      .ar-mob-stats-bar {
        width: calc(100% - 28px);
        margin: 0 14px 14px;
        border-radius: 16px;
        border-color: rgba(0,255,225,0.18);
        background:
          linear-gradient(135deg, rgba(0,255,225,0.08), rgba(255,0,110,0.045)),
          rgba(2,4,16,0.72);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 16px 32px rgba(0,0,0,0.26);
      }
      .ar-mob-stat {
        padding: 11px 4px;
      }
      .ar-mob-stat-val {
        color: #fff;
      }

      .ar-mob-tabs {
        padding: 0 14px 12px;
        background: transparent;
      }
      .ar-mob-tab-track {
        height: 58px;
        border-radius: 18px;
        clip-path: none;
        border-color: rgba(255,255,255,0.12);
        background:
          linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02)),
          rgba(0,0,0,0.46);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 14px 34px rgba(0,0,0,0.25);
      }
      .ar-mob-tab-track::before {
        top: 6px;
        bottom: 6px;
        left: calc(var(--tab-x, 0%) + 6px);
        width: calc(50% - 12px);
        border: 1px solid rgba(0,255,225,0.26);
        border-radius: 14px;
        background:
          radial-gradient(circle at 22% 20%, rgba(255,255,255,0.38), transparent 22%),
          linear-gradient(135deg, rgba(0,255,225,0.3), rgba(0,255,225,0.08));
        box-shadow: 0 0 22px rgba(0,255,225,0.18);
      }
      .ar-mob-tab-track.signup-active::before {
        left: calc(50% + 6px);
        border-color: rgba(255,0,110,0.3);
        background:
          radial-gradient(circle at 22% 20%, rgba(255,255,255,0.32), transparent 22%),
          linear-gradient(135deg, rgba(255,0,110,0.28), rgba(255,0,110,0.08));
        box-shadow: 0 0 22px rgba(255,0,110,0.18);
      }
      .ar-mob-tab {
        font-size: 0.66rem;
      }
      .ar-mob-tab svg {
        width: 18px;
        height: 18px;
        transition: transform 0.24s ease;
      }
      .ar-mob-tab--active svg {
        transform: translateY(-1px) scale(1.08);
      }
      .ar-mob-tab-bar {
        bottom: 9px;
        left: 32%;
        right: 32%;
      }

      .ar-mob-ticker {
        padding: 9px 0;
        border-color: rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.025);
      }
      .ar-mob-ticker-inner {
        animation-duration: 18s;
      }
      .ar-mob-ticker-item {
        color: rgba(224,248,255,0.5);
      }

      .ar-form-panel {
        padding: 22px 14px 50px;
        background: transparent;
      }
      .ar-form-panel::before {
        height: 150px;
        background:
          radial-gradient(ellipse at 50% 0%, rgba(0,255,225,0.16), transparent 62%);
        opacity: 0.8;
      }
      .ar-form-panel::after {
        display: none;
      }
      .ar-form {
        padding: 24px 18px 20px;
        border-radius: 24px;
        clip-path: none;
        border-color: rgba(255,255,255,0.13);
        background:
          linear-gradient(150deg, rgba(255,255,255,0.105), rgba(255,255,255,0.025)),
          rgba(4,6,18,0.78);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        box-shadow:
          0 24px 70px rgba(0,0,0,0.58),
          0 0 0 1px rgba(0,255,225,0.05),
          inset 0 1px 0 rgba(255,255,255,0.13),
          inset 0 -32px 80px rgba(0,255,225,0.025);
        animation: none;
      }
      .ar-form::before {
        top: 10px;
        left: 18px;
        right: 18px;
        height: 1px;
        border-radius: 999px;
        animation: mobileTraceSweep 2.6s ease-in-out infinite;
      }
      .ar-form::after {
        bottom: 16px;
        right: 16px;
        width: 8px;
        height: 8px;
        border-radius: 999px;
        clip-path: none;
      }
      .ar-eyebrow {
        width: max-content;
        padding: 5px 9px;
        border: 1px solid rgba(0,255,225,0.16);
        border-radius: 999px;
        background: rgba(0,255,225,0.055);
      }
      .ar-title {
        margin-top: 10px;
        line-height: 1.05;
      }
      .ar-sub {
        color: rgba(224,248,255,0.58);
      }
      .ar-social-btn,
      .ar-field input,
      .ar-field select {
        border-radius: 16px;
        clip-path: none;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.075), rgba(255,255,255,0.02)),
          rgba(0,0,0,0.28);
        border-color: rgba(255,255,255,0.11);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
      }
      .ar-field input:focus,
      .ar-field select:focus {
        border-color: rgba(0,255,225,0.5);
        box-shadow:
          0 0 0 3px rgba(0,255,225,0.1),
          0 0 22px rgba(0,255,225,0.1),
          inset 0 1px 0 rgba(255,255,255,0.11);
      }
      .ar-field-ico {
        color: rgba(0,255,225,0.72);
      }
      .ar-submit {
        height: 58px;
        border-radius: 18px;
        clip-path: none;
        overflow: hidden;
        box-shadow: 0 16px 38px rgba(0,255,225,0.16), 0 0 0 1px rgba(255,255,255,0.08);
      }
      .ar-submit::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(110deg, transparent 0 34%, rgba(255,255,255,0.4) 45%, transparent 56% 100%);
        transform: translateX(-120%);
        animation: mobileButtonSheen 3.6s ease-in-out infinite;
      }
      .ar-submit-inner {
        position: relative;
        z-index: 1;
      }
      .ar-divider {
        color: rgba(245,255,0,0.5);
      }
      .ar-forgot {
        justify-content: flex-end;
        color: rgba(0,255,225,0.64);
      }

      .ar-step-card {
        border-radius: 22px;
        clip-path: none;
        border-color: rgba(255,255,255,0.12);
        background:
          linear-gradient(145deg, rgba(0,255,225,0.1), rgba(255,255,255,0.025) 42%, rgba(255,0,110,0.08)),
          rgba(0,0,0,0.24);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.09), 0 18px 45px rgba(0,0,0,0.28);
      }
      .ar-step-card::before {
        background:
          radial-gradient(circle at 18% 0%, rgba(245,255,0,0.12), transparent 30%),
          linear-gradient(90deg, transparent, rgba(0,255,225,0.08), transparent);
        animation: mobileTraceSweep 3.4s ease-in-out infinite;
      }
      .ar-step-progress {
        height: 42px;
      }
      .ar-step-dot {
        border-radius: 13px;
        background: rgba(255,255,255,0.045);
      }
      .ar-step-dot.active {
        animation: mobileStepPulse 1.6s ease-in-out infinite;
      }
      .ar-step-icon {
        border-radius: 16px;
      }
      .ar-step-next {
        border-radius: 16px;
        position: relative;
        overflow: hidden;
      }
      .ar-step-next::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(110deg, transparent 0 36%, rgba(255,255,255,0.44) 48%, transparent 60% 100%);
        transform: translateX(-120%);
        animation: mobileButtonSheen 3.1s ease-in-out infinite;
      }

      @keyframes mobileAuroraSpin {
        to { transform: rotate(360deg); }
      }
      @keyframes mobileCircuitDrift {
        to { background-position: 170px 170px, -170px 170px; }
      }
      @keyframes mobileGridRush {
        from { background-position: 0 0; }
        to { background-position: 0 68px; }
      }
      @keyframes mobileParticleLift {
        0% { opacity: 0; transform: translate3d(0, 105vh, 0) scale(0.7); }
        12% { opacity: 0.85; }
        80% { opacity: 0.45; }
        100% { opacity: 0; transform: translate3d(18px, -12vh, 0) scale(1.25); }
      }
      @keyframes mobileTraceSweep {
        0%, 100% { opacity: 0.18; transform: scaleX(0.54); }
        48% { opacity: 1; transform: scaleX(1); }
      }
      @keyframes mobileLogoFloat {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-5px) scale(1.03); }
      }
      @keyframes mobileTitleGlitch {
        0%, 91%, 100% { transform: translateX(0); filter: none; }
        92% { transform: translateX(1px); filter: hue-rotate(35deg); }
        93% { transform: translateX(-2px); }
        94% { transform: translateX(0); filter: none; }
      }
      @keyframes mobileCardFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes mobileButtonSheen {
        0%, 55% { transform: translateX(-125%); }
        78%, 100% { transform: translateX(125%); }
      }
      @keyframes mobileStepPulse {
        0%, 100% { box-shadow: 0 0 18px rgba(0,255,225,0.34); }
        50% { box-shadow: 0 0 30px rgba(245,255,0,0.38); }
      }

      @media (prefers-reduced-motion: reduce) {
        .ar-bg::before,
        .ar-bg::after,
        .ar-grid,
        .ar-particle,
        .ar-mobile-header::after,
        .ar-mob-hero::after,
        .ar-mob-logo-ring::before,
        .ar-mob-logo-ring::after,
        .ar-mob-logo-ring img,
        .ar-mob-hero-title,
        .ar-mob-ticker-inner,
        .ar-form,
        .ar-form::before,
        .ar-submit::after,
        .ar-step-card::before,
        .ar-step-dot.active,
        .ar-step-next::after {
          animation: none !important;
        }
      }

      /* Mobile form transition */
      .ar-info-panel.anim-to-left,
      .ar-info-panel.anim-to-right { animation: none !important; }

      .ar-form-panel.anim-from-right { animation: mobFormFromRight 0.34s cubic-bezier(0.16,1,0.3,1) both; }
      .ar-form-panel.anim-from-left  { animation: mobFormFromLeft  0.34s cubic-bezier(0.16,1,0.3,1) both; }
      @keyframes mobFormFromRight {
        from { transform: translateX(30px); opacity: 0; }
        to   { transform: translateX(0);   opacity: 1; }
      }
      @keyframes mobFormFromLeft {
        from { transform: translateX(-30px); opacity: 0; }
        to   { transform: translateX(0);     opacity: 1; }
      }
    }

    /* ── MOBILE PERFORMANCE + SMOOTH SCROLLING ── */
    @media (max-width: 820px) {
      html,
      body,
      #root {
        min-height: 100%;
        height: auto;
      }

      body {
        overflow-x: clip;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: auto;
      }

      .ar {
        min-height: 100svh;
        height: auto;
        padding: 0 0 calc(28px + env(safe-area-inset-bottom, 0px));
        align-items: stretch;
        justify-content: stretch;
        overflow: visible;
        touch-action: pan-y;
        overscroll-behavior-y: auto;
      }

      .ar-scene {
        min-height: auto;
        height: auto;
        overflow: visible;
        contain: none;
      }

      .ar-form-panel,
      .ar-form,
      .ar-step-card {
        will-change: auto;
      }

      .ar-form {
        transform: translateZ(0);
      }

      .ar-mobile-header {
        position: sticky;
        top: env(safe-area-inset-top, 0px);
      }

      .ar-mob-ticker-inner {
        will-change: transform;
      }

      .ar-mob-hero-title,
      .ar-mh-logo-img,
      .ar-mob-logo-ring::before,
      .ar-mob-logo-ring::after {
        animation-duration: 5s;
      }

      .ar-form-panel,
      .ar-step-card {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }

      @media (prefers-reduced-motion: reduce) {
        .ar-mob-ticker-inner {
          animation: none !important;
        }
      }
    }

    /* ── SMALL MOBILE (≤ 480px) ── */
    @media (max-width: 480px) {
      .ar-form-panel  { padding: 16px 12px 48px; }
      .ar-mob-tabs    { padding: 0 12px 12px; }
      .ar-form        { padding: 18px 14px 16px; }
      .ar-title       { font-size: 1.2rem; }
      .ar-row         { grid-template-columns: 1fr 1fr; gap: 6px; }
      .ar-mob-hero    { padding: 22px 16px 0; }
      .ar-mob-hero-title { font-size: 1.35rem; letter-spacing: 0.14em; }
    }

    /* ── VERY SMALL (≤ 380px) ── */
    @media (max-width: 380px) {
      .ar-mobile-header { height: 50px; padding: 0 14px; }
      .ar-mh-status     { display: none; }
      .ar-mh-brand      { font-size: 0.58rem; }
      .ar-mob-hero-title { font-size: 1.15rem; }
      .ar-mob-logo-ring { width: 68px; height: 68px; }
      .ar-mob-logo-ring img { width: 48px; height: 48px; }
      .ar-form-panel    { padding: 14px 10px 44px; }
      .ar-form          { padding: 16px 12px 14px; }
      .ar-title         { font-size: 1.08rem; }
      .ar-mob-stat-val  { font-size: 0.72rem; }
    }
  `, []);

  return (
    <>
      <style>{css}</style>
      <div className="ar-bg" />
      <div className="ar-scanlines" />
      <div className="ar-grid" />
      <div className="ar-particles" aria-hidden="true">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="ar-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              "--pc": particle.color,
              "--dur": particle.duration,
              "--del": particle.delay,
            }}
          />
        ))}
      </div>

      <div className="ar">
        {/* Back button — desktop only */}
        <a className="ar-back" href="/">
          <span className="ar-back-icon">{I.home}</span>
          &gt; BACK_TO_HOME
        </a>

        <div className={`ar-scene${!isSignIn ? " signup-mode" : ""}`}>

          {/* ─── Mobile: Sticky HUD Header ─── */}
          <div className="ar-mobile-header">
            <a href="/" className="ar-mh-left" style={{ textDecoration: "none" }}>
              <img src="/logo.png" alt="DQD Logo" className="ar-mh-logo-img" />
              <div className="ar-mh-text">
                <div className="ar-mh-brand">DQD</div>
                <div className="ar-mh-tagline">▶ GAMING_ARENA</div>
              </div>
            </a>
            <div className="ar-mh-status">
              <div className="ar-mh-dot" />
              SYS_ONLINE
            </div>
          </div>

          <br/>
          

          {/* ─── Mobile: Tab Switcher ─── */}
          <div className="ar-mob-tabs" role="tablist" aria-label="Authentication mode">
            <div className={`ar-mob-tab-track${!isSignIn ? " signup-active" : ""}`}
              style={{ "--tab-x": isSignIn ? "0%" : "50%" }}>
              <div className="ar-mob-tab-div" />
              <button
                className={`ar-mob-tab${isSignIn ? " ar-mob-tab--active" : ""}`}
                onClick={() => { if (!isSignIn) doSwitch(false); }}
                type="button" disabled={animating}
                role="tab" aria-selected={isSignIn}
              >
                {I.login}
                <span>SIGN_IN</span>
                <div className="ar-mob-tab-bar" />
              </button>
              <button
                className={`ar-mob-tab ar-mob-tab--signup${!isSignIn ? " ar-mob-tab--active" : ""}`}
                onClick={() => { if (isSignIn) doSwitch(true); }}
                type="button" disabled={animating}
                role="tab" aria-selected={!isSignIn}
              >
                {I.rocket}
                <span>CREATE</span>
                <div className="ar-mob-tab-bar" />
              </button>
            </div>
          </div>

          {/* ─── Mobile: Feature Ticker ─── */}
          <div className="ar-mob-ticker" aria-hidden="true">
            <div className="ar-mob-ticker-inner">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} className="ar-mob-ticker-item">
                  <span className="ar-mob-ticker-dot">◆</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* ─── Desktop Info Panel ─── */}
          <div className={`ar-info-panel ${infoPanelAnim}`}>
            <div className="ar-orb ar-orb-1" />
            <div className="ar-orb ar-orb-2" />
            <div className="ar-orb ar-orb-3" />
            <div className="ar-hex-panel" />
            <div className="ar-corner ar-corner-tl" />
            <div className="ar-corner ar-corner-br" />
            <div className="ar-corner ar-corner-tr" />
            <div className="ar-corner ar-corner-bl" />
            <div className="ar-shard ar-shard-1"><CircuitNode size={22} color="#00ffe1"/></div>
            <div className="ar-shard ar-shard-2"><CircuitNode size={14} color="#ff006e"/></div>
            <div className="ar-shard ar-shard-3"><CircuitNode size={12} color="#f5ff00"/></div>
            <div className="ar-shard ar-shard-4"><CircuitNode size={18} color="#00ffe1"/></div>

            <div className={`ar-info ar-info-content ${infoFadeAnim}`}>
              <div className="ar-logo-wrap">
                <img src="/logo.png" alt="DQD Logo" className="ar-logo-img" />
              </div>
              <p className="ar-brand-name">Dominate Quest Destroy</p>
              <div className="ar-rule" />

              {infoVisible === "signup" ? (
                <>
                  <div className="ar-badge"><span className="ar-badge-dot"/>NEW_USER_DETECTED</div>
                  <h3 className="ar-info-title">
                    Everything<br/><span className="hl-cyan">Starts</span> <span className="hl-pink">Here</span>
                  </h3>
                  <p className="ar-info-desc">
                    One account. Full access to PS5 arenas, pool tables, OTT screens &amp; exclusive events.
                  </p>
                  <div className="ar-stats">
                    <div className="ar-stat"><div className="ar-stat-val">100+</div><div className="ar-stat-label">MEMBERS</div></div>
                    <div className="ar-stat"><div className="ar-stat-val">24/7</div><div className="ar-stat-label">ACCESS</div></div>
                    <div className="ar-stat"><div className="ar-stat-val">FREE</div><div className="ar-stat-label">SIGN_UP</div></div>
                  </div>
                  <div className="ar-chips">
                    <div className="ar-chip"><span className="ar-chip-icon">{I.gamepad}</span> PS5 &amp; gaming sessions</div>
                    <div className="ar-chip"><span className="ar-chip-icon">{I.pool}</span>   Pool tables &amp; sports</div>
                    <div className="ar-chip"><span className="ar-chip-icon">{I.ticket}</span> Loyalty points &amp; rewards</div>
                    <div className="ar-chip"><span className="ar-chip-icon">{I.gift}</span>   Combo packs &amp; events</div>
                  </div>
                  <button className="ar-info-btn" onClick={() => doSwitch(false)} type="button">
                    <span>SIGN_IN {I.arrow}</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="ar-badge"><span className="ar-badge-dot"/>FIRST_CONTACT</div>
                  <h3 className="ar-info-title">
                    Hello,<br/><span className="hl-cyan">WAR</span><span className="hl-pink">RIOR</span>
                  </h3>
                  <p className="ar-info-desc">
                    No account yet? Boot one up in seconds and dive straight into the action.
                  </p>
                  <div className="ar-stats">
                    <div className="ar-stat"><div className="ar-stat-val">TOP</div><div className="ar-stat-label">GAMES</div></div>
                    <div className="ar-stat"><div className="ar-stat-val">PTS</div><div className="ar-stat-label">REWARDS</div></div>
                    <div className="ar-stat"><div className="ar-stat-val">VIP</div><div className="ar-stat-label">ACCESS</div></div>
                  </div>
                  <div className="ar-chips">
                    <div className="ar-chip"><span className="ar-chip-icon">{I.shield}</span> Encrypted &amp; secure</div>
                    <div className="ar-chip"><span className="ar-chip-icon">{I.bolt}</span>   Instant access, zero wait</div>
                    <div className="ar-chip"><span className="ar-chip-icon">{I.gift}</span>   Free pts on boot-up</div>
                  </div>
                  <button className="ar-info-btn" onClick={() => doSwitch(true)} type="button">
                    <span>CREATE_ACCOUNT {I.arrow}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ─── Form Panel ─── */}
          <div className={`ar-form-panel ${formPanelAnim}`}>
            <div className={`ar-form ar-form-content ${formFadeAnim}`}>

              {formVisible === "signup" ? (
                <>
                  <p className="ar-eyebrow">INIT_SEQUENCE</p>
                  <h2 className="ar-title">CREATE <span className="cp-accent-cyan">ACCOUNT</span></h2>
                  <p className="ar-sub">Join thousands of warriors — it's free</p>

                  {error   && <div className="ar-alert error">  {I.alert} {error}   </div>}
                  {success && <div className="ar-alert success">{I.check} {success} </div>}

                  <div className="ar-socials ar-google-socials">
                    <div
                      ref={googleButtonRef}
                      className="ar-google-button"
                      aria-label="Continue with Google"
                    />
                  </div>
                  <div className="ar-divider">// or use email //</div>

                  <div className="ar-mobile-stepper">
                    <div className="ar-step-card">
                      <div className="ar-step-progress">
                        {signupSteps.map((step, index) => (
                          <Fragment key={step.key}>
                            <button
                              className={`ar-step-dot${index < signupStep ? " done" : ""}${index === signupStep ? " active" : ""}`}
                              type="button"
                              onClick={() => goSignupStep(index)}
                              aria-label={`Go to ${step.label}`}
                            >
                              {index < signupStep ? I.check : index + 1}
                            </button>
                            {index < signupSteps.length - 1 && (
                              <div className="ar-step-line"><motion.span animate={{ width: signupStep > index ? "100%" : "0%" }} transition={{ duration: 0.35 }} /></div>
                            )}
                          </Fragment>
                        ))}
                      </div>
                      <div className="ar-step-head">
                        <motion.span className="ar-step-icon" key={signupSteps[signupStep].key} initial={{ rotate: -10, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
                          {signupSteps[signupStep].icon}
                        </motion.span>
                        <div>
                          <p className="ar-step-kicker">{signupSteps[signupStep].label}</p>
                          <h3 className="ar-step-title">{signupSteps[signupStep].title}</h3>
                          <p className="ar-step-hint">{signupSteps[signupStep].hint}</p>
                        </div>
                      </div>
                      <div className="ar-step-body">
                        <AnimatePresence mode="wait" custom={1}>
                          <motion.div key={signupSteps[signupStep].key} custom={1} variants={mobileStepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: "easeOut" }}>
                            {signupStep === 0 && (
                              <div className="ar-row">
                                <div className="ar-field">
                                  <input type="text" name="first_name" placeholder="First name" value={signupForm.first_name} onChange={handleSignupChange} autoComplete="given-name"/>
                                  <span className="ar-field-ico">{I.user}</span>
                                </div>
                                <div className="ar-field">
                                  <input type="text" name="last_name" placeholder="Last name" value={signupForm.last_name} onChange={handleSignupChange} autoComplete="family-name"/>
                                  <span className="ar-field-ico">{I.user}</span>
                                </div>
                              </div>
                            )}
                            {signupStep === 1 && (
                              <>
                                <div className="ar-field">
                                  <input type="email" name="email" placeholder="Email address" value={signupForm.email} onChange={handleSignupChange} autoComplete="email"/>
                                  <span className="ar-field-ico">{I.mail}</span>
                                </div>
                                <div className="ar-field">
                                  <input type="tel" name="phone" placeholder="Mobile number" value={signupForm.phone} onChange={handleSignupChange} autoComplete="tel"/>
                                  <span className="ar-field-ico">{I.phone}</span>
                                </div>
                              </>
                            )}
                            {signupStep === 2 && (
                              <div className="ar-row">
                                <div className="ar-field has-caret">
                                  <select name="gender" value={signupForm.gender} onChange={handleSignupChange}>
                                    <option value="" disabled>Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                  </select>
                                  <span className="ar-field-ico">{I.gender}</span>
                                </div>
                                <div className="ar-field">
                                  <input type="date" name="dob" value={signupForm.dob} onChange={handleSignupChange} style={{ colorScheme: "dark" }}/>
                                  <span className="ar-field-ico">{I.calendar}</span>
                                </div>
                              </div>
                            )}
                            {signupStep === 3 && (
                              <>
                                <div className="ar-field">
                                  <input type="password" name="password" placeholder="Create password" value={signupForm.password} onChange={handleSignupChange} autoComplete="new-password"/>
                                  <span className="ar-field-ico">{I.lock}</span>
                                </div>
                                <div className="ar-field">
                                  <input type="password" name="password2" placeholder="Confirm password" value={signupForm.password2} onChange={handleSignupChange} autoComplete="new-password"/>
                                  <span className="ar-field-ico">{I.lock}</span>
                                </div>
                              </>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      <div className="ar-checkbox">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                        />
                        <label htmlFor="terms">
                          I agree to the{" "}
                          <button
                            type="button"
                            className="ar-link-btn"
                            onClick={() => setShowTerms(true)}
                          >
                            Terms &amp; Conditions
                          </button>
                        </label>
                      </div>

                      <div className="ar-step-actions">
                        <button className="ar-step-back" type="button" onClick={() => goSignupStep((step) => step - 1)} disabled={signupStep === 0}>BACK</button>
                        {signupStep < signupSteps.length - 1 ? (
                          <button className="ar-step-next" type="button" onClick={() => goSignupStep((step) => step + 1)}>NEXT</button>
                        ) : (
                          <button className="ar-step-next" onClick={handleSignup} disabled={loading} type="button">
                            {loading ? "BOOTING..." : "BOOT_ACCOUNT"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ar-desktop-fields">
                  <div className="ar-row">
                    <div className="ar-field">
                      <input type="text" name="first_name" placeholder="First name"
                        value={signupForm.first_name} onChange={handleSignupChange} autoComplete="given-name"/>
                      <span className="ar-field-ico">{I.user}</span>
                    </div>
                    <div className="ar-field">
                      <input type="text" name="last_name" placeholder="Last name"
                        value={signupForm.last_name} onChange={handleSignupChange} autoComplete="family-name"/>
                      <span className="ar-field-ico">{I.user}</span>
                    </div>
                  </div>
                  <div className="ar-field">
                    <input type="email" name="email" placeholder="Email address"
                      value={signupForm.email} onChange={handleSignupChange} autoComplete="email"/>
                    <span className="ar-field-ico">{I.mail}</span>
                  </div>
                  <div className="ar-field">
                    <input type="tel" name="phone" placeholder="Mobile number"
                      value={signupForm.phone} onChange={handleSignupChange} autoComplete="tel"/>
                    <span className="ar-field-ico">{I.phone}</span>
                  </div>
                  <div className="ar-row">
                    <div className="ar-field has-caret">
                      <select name="gender" value={signupForm.gender} onChange={handleSignupChange}>
                        <option value="" disabled>Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <span className="ar-field-ico">{I.gender}</span>
                    </div>
                    <div className="ar-field">
                      <input type="date" name="dob" value={signupForm.dob}
                        onChange={handleSignupChange} style={{ colorScheme: "dark" }}/>
                      <span className="ar-field-ico">{I.calendar}</span>
                    </div>
                  </div>
                  <div className="ar-field">
                    <input type="password" name="password" placeholder="Create password"
                      value={signupForm.password} onChange={handleSignupChange} autoComplete="new-password"/>
                    <span className="ar-field-ico">{I.lock}</span>
                  </div>
                  <div className="ar-field">
                    <input type="password" name="password2" placeholder="Confirm password"
                      value={signupForm.password2} onChange={handleSignupChange} autoComplete="new-password"/>
                    <span className="ar-field-ico">{I.lock}</span>
                  </div>

                  <div className="ar-checkbox">
                    <input
                      id="terms-desktop"
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                    <label htmlFor="terms-desktop">
                      I agree to the{" "}
                      <button
                        type="button"
                        className="ar-link-btn"
                        onClick={() => setShowTerms(true)}
                      >
                        Terms &amp; Conditions
                      </button>
                    </label>
                  </div>

                  <button className="ar-submit" onClick={handleSignup} disabled={loading} type="button">
                    <div className="ar-submit-bg"/>
                    <div className="ar-submit-bg-hover"/>
                    <span className="ar-submit-inner">
                      {loading ? <><div className="ar-spinner"/> BOOTING…</> : <>{I.rocket} BOOT_ACCOUNT</>}
                    </span>
                  </button>
                  <p className="ar-note">
                    By registering you accept our <a href="#">Terms</a> &amp; <a href="#">Privacy</a>
                    <br/>Already in the system?{" "}
                    <button type="button" onClick={() => doSwitch(false)}>SIGN_IN</button>
                  </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="ar-eyebrow">AUTH_PROTOCOL</p>
                  <h2 className="ar-title"><span className="cp-accent-pink">SIGN</span> IN</h2>
                  <p className="ar-sub">Identity verified — resume the mission</p>

                  {error   && <div className="ar-alert error">  {I.alert} {error}   </div>}
                  {success && <div className="ar-alert success">{I.check} {success} </div>}

                  <div className="ar-socials ar-google-socials">
                    <div
                      ref={googleButtonRef}
                      className="ar-google-button"
                      aria-label="Continue with Google"
                    />
                  </div>
                  <div className="ar-divider">// or use email //</div>

                  <div className="ar-field">
                    <input type="email" name="email" placeholder="Email address"
                      value={loginForm.email} onChange={handleLoginChange} autoComplete="email"/>
                    <span className="ar-field-ico">{I.mail}</span>
                  </div>
                  <div className="ar-field">
                    <input type="password" name="password" placeholder="Password"
                      value={loginForm.password} onChange={handleLoginChange} autoComplete="current-password"/>
                    <span className="ar-field-ico">{I.lock}</span>
                  </div>
                  <a
    type="button"
    className="ar-forgot"
    onClick={handleForgotPassword}
>
    FORGOT_CREDENTIALS?
</a>
                  <button className="ar-submit" onClick={handleLogin} disabled={loading} type="button">
                    <div className="ar-submit-bg"/>
                    <div className="ar-submit-bg-hover"/>
                    <span className="ar-submit-inner">
                      {loading ? <><div className="ar-spinner"/> AUTHENTICATING…</> : <>{I.login} AUTHENTICATE</>}
                    </span>
                  </button>
                  <p className="ar-note">
                    Not in the system?{" "}
                    <button type="button" onClick={() => doSwitch(true)}>CREATE_ACCOUNT</button>
                  </p>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
      />
    </>
  );
}