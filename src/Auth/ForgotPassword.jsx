import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { emailjsForgotPassword } from "../Auth/User/DashboardComponents/emailjsConfig";
import {
    forgotPassword,
    verifyForgotOTP,
    resetPassword,
} from "./forgotPasswordApi";

/* ─── design tokens ─── */
const T = {
    bg: "#0a0a0f",
    surface: "#0d0d1a",
    border: "rgba(0,245,255,0.18)",
    cyan: "#00f5ff",
    pink: "#ff006e",
    yellow: "#ffd60a",
    green: "#39ff14",
    purple: "#7b2fff",
    textDim: "rgba(255,255,255,0.45)",
};

const STEPS = [
    { id: 1, label: "Identify", icon: "✦" },
    { id: 2, label: "Verify",   icon: "◈" },
    { id: 3, label: "Secure",   icon: "⬡" },
];

/* ═══════════════════════════════════════════
   OTP INPUT — fully rewritten, no bugs
   State: array of 6 strings stored in parent
   as a plain joined string e.g. "123456"
   ═══════════════════════════════════════════ */
function OtpInput({ value, onChange }) {
    const LEN = 6;
    const refs = useRef([]);

    // Derive a guaranteed-length array of single chars
    const digits = Array.from({ length: LEN }, (_, i) => value[i] ?? "");

    // Auto-focus first cell when component mounts
    useEffect(() => {
        setTimeout(() => refs.current[0]?.focus(), 50);
    }, []);

    const commit = (newDigits) => onChange(newDigits.join(""));

    const focusCell = (i) => {
        // clamp to valid range
        const target = Math.max(0, Math.min(LEN - 1, i));
        setTimeout(() => refs.current[target]?.focus(), 0);
    };

    const handleKeyDown = (i, e) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            if (digits[i] !== "") {
                // Clear current cell, stay here
                const next = [...digits];
                next[i] = "";
                commit(next);
                // move focus back only if cell was already empty (handled below)
            } else {
                // Cell already empty — clear previous and move back
                if (i > 0) {
                    const next = [...digits];
                    next[i - 1] = "";
                    commit(next);
                    focusCell(i - 1);
                }
            }
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            focusCell(i - 1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            focusCell(i + 1);
        }
    };

    const handleChange = (i, e) => {
        // Strip non-digits; take only the very last char typed
        // (handles mobile autocomplete sending multiple chars)
        const raw = e.target.value.replace(/\D/g, "");
        if (!raw) return;
        const char = raw[raw.length - 1];
        const next = [...digits];
        next[i] = char;
        commit(next);
        // advance to next empty cell, or next cell if none empty
        const nextEmpty = next.findIndex((d, idx) => idx > i && d === "");
        focusCell(nextEmpty === -1 ? Math.min(i + 1, LEN - 1) : nextEmpty);
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const raw = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
        if (!raw) return;
        const next = Array.from({ length: LEN }, (_, i) => raw[i] ?? "");
        commit(next);
        focusCell(Math.min(raw.length, LEN - 1));
    };

    return (
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {digits.map((digit, i) => {
                const filled = digit !== "";
                return (
                    <motion.div
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 20 }}
                        style={{ position: "relative" }}
                    >
                        <AnimatePresence>
                            {filled && (
                                <motion.div
                                    key="glow"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    style={{
                                        position: "absolute", inset: -2,
                                        borderRadius: 8,
                                        background: `${T.cyan}18`,
                                        boxShadow: `0 0 14px ${T.cyan}bb`,
                                        zIndex: 0,
                                        pointerEvents: "none",
                                    }}
                                />
                            )}
                        </AnimatePresence>
                        <input
                            ref={(el) => (refs.current[i] = el)}
                            type="text"
                            inputMode="numeric"
                            autoComplete={i === 0 ? "one-time-code" : "off"}
                            maxLength={2}        /* allow 2 so onChange sees new char appended */
                            value={digit}
                            onChange={(e) => handleChange(i, e)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            onFocus={(e) => e.target.select()}
                            style={{
                                position: "relative", zIndex: 1,
                                width: 48, height: 58,
                                textAlign: "center",
                                fontSize: 24,
                                fontFamily: "'Share Tech Mono', monospace",
                                fontWeight: 700,
                                color: filled ? T.cyan : "rgba(255,255,255,0.25)",
                                background: filled ? `${T.cyan}08` : "transparent",
                                border: `1.5px solid ${filled ? T.cyan : "rgba(0,245,255,0.2)"}`,
                                borderRadius: 8,
                                outline: "none",
                                caretColor: "transparent",
                                transition: "border-color 0.15s, color 0.15s, background 0.15s",
                                clipPath: "polygon(6px 0%,100% 0%,100% calc(100% - 6px),calc(100% - 6px) 100%,0% 100%,0% 6px)",
                            }}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}

/* ─── password strength bar ─── */
function StrengthBar({ password }) {
    const score = (() => {
        if (!password) return 0;
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    })();
    const labels = ["", "Weak", "Fair", "Strong", "Elite"];
    const colors = ["transparent", T.pink, T.yellow, T.cyan, T.green];
    if (!password) return null;
    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4].map((n) => (
                    <motion.div
                        key={n}
                        animate={{ background: n <= score ? colors[score] : "rgba(255,255,255,0.1)" }}
                        transition={{ duration: 0.3 }}
                        style={{ flex: 1, height: 3, borderRadius: 2 }}
                    />
                ))}
            </div>
            <motion.p
                key={score}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ color: colors[score], fontSize: 11, marginTop: 4, marginBottom: 0, fontFamily: "'Share Tech Mono', monospace", letterSpacing: 2 }}
            >
                {labels[score]?.toUpperCase()}
            </motion.p>
        </div>
    );
}

/* ─── styled input ─── */
function CyberInput({ label, type = "text", name, value, onChange, placeholder, icon }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ marginBottom: 20 }}>
            <label style={{
                display: "block", marginBottom: 6,
                fontSize: 11, letterSpacing: 3,
                fontFamily: "'Share Tech Mono', monospace",
                color: focused ? T.cyan : T.textDim,
                transition: "color 0.2s",
                textTransform: "uppercase",
            }}>{label}</label>
            <div style={{ position: "relative" }}>
                {icon && (
                    <span style={{
                        position: "absolute", left: 14, top: "50%",
                        transform: "translateY(-50%)",
                        color: focused ? T.cyan : T.textDim,
                        fontSize: 16, pointerEvents: "none",
                        transition: "color 0.2s",
                    }}>{icon}</span>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    style={{
                        width: "100%",
                        padding: icon ? "13px 14px 13px 40px" : "13px 14px",
                        background: "rgba(0,245,255,0.04)",
                        border: `1.5px solid ${focused ? T.cyan : "rgba(0,245,255,0.18)"}`,
                        borderRadius: 0,
                        color: "#fff",
                        fontSize: 14,
                        fontFamily: "'Share Tech Mono', monospace",
                        outline: "none",
                        transition: "border-color 0.25s, box-shadow 0.25s",
                        boxShadow: focused ? `0 0 20px ${T.cyan}33, inset 0 0 10px ${T.cyan}08` : "none",
                        clipPath: "polygon(10px 0%,100% 0%,100% calc(100% - 10px),calc(100% - 10px) 100%,0% 100%,0% 10px)",
                        boxSizing: "border-box",
                    }}
                />
                {focused && (
                    <motion.div
                        style={{
                            position: "absolute", bottom: 0, left: 0, right: 0,
                            height: 2, background: T.cyan,
                            boxShadow: `0 0 8px ${T.cyan}`,
                        }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </div>
        </div>
    );
}

/* ─── CTA button ─── */
function CyberButton({ children, onClick, disabled, color = T.cyan }) {
    const [hover, setHover] = useState(false);
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            onHoverStart={() => setHover(true)}
            onHoverEnd={() => setHover(false)}
            whileTap={{ scale: 0.97 }}
            style={{
                width: "100%",
                padding: "15px",
                background: disabled ? "rgba(255,255,255,0.05)" : hover ? `${color}22` : "transparent",
                border: `1.5px solid ${disabled ? "rgba(255,255,255,0.1)" : color}`,
                color: disabled ? "rgba(255,255,255,0.3)" : color,
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 13, fontWeight: 700, letterSpacing: 3,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                clipPath: "polygon(12px 0%,100% 0%,100% calc(100% - 12px),calc(100% - 12px) 100%,0% 100%,0% 12px)",
                boxShadow: hover && !disabled ? `0 0 24px ${color}55` : "none",
                position: "relative", overflow: "hidden",
            }}
        >
            {hover && !disabled && (
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                    style={{
                        position: "absolute", top: 0, left: 0,
                        width: "40%", height: "100%",
                        background: `linear-gradient(90deg, transparent, ${color}22, transparent)`,
                        pointerEvents: "none",
                    }}
                />
            )}
            {children}
        </motion.button>
    );
}

/* ─── progress stepper ─── */
function Stepper({ step }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40 }}>
            {STEPS.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <motion.div
                            animate={{
                                borderColor: step >= s.id ? T.cyan : "rgba(0,245,255,0.18)",
                                color: step >= s.id ? T.cyan : T.textDim,
                                boxShadow: step === s.id ? `0 0 20px ${T.cyan}` : "none",
                                background: step > s.id ? `${T.cyan}22` : "transparent",
                            }}
                            transition={{ duration: 0.4 }}
                            style={{
                                width: 38, height: 38,
                                border: "1.5px solid",
                                borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "'Share Tech Mono', monospace",
                                fontSize: 16,
                            }}
                        >
                            {step > s.id ? "✓" : s.icon}
                        </motion.div>
                        <span style={{
                            fontSize: 9, letterSpacing: 2,
                            fontFamily: "'Share Tech Mono', monospace",
                            color: step >= s.id ? T.cyan : T.textDim,
                            textTransform: "uppercase",
                            transition: "color 0.3s",
                        }}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <motion.div
                            animate={{ background: step > s.id ? `linear-gradient(90deg,${T.cyan},${T.cyan}44)` : "rgba(0,245,255,0.12)" }}
                            transition={{ duration: 0.5 }}
                            style={{ width: 52, height: 1, marginBottom: 22, marginInline: 4 }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

/* ─── helpers ─── */
function ErrorMsg({ msg }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                marginBottom: 14, padding: "10px 14px",
                border: `1px solid ${T.pink}44`,
                background: `${T.pink}11`,
                color: T.pink,
                fontSize: 12, letterSpacing: 1,
                fontFamily: "'Share Tech Mono', monospace",
                clipPath: "polygon(8px 0%,100% 0%,100% calc(100% - 8px),calc(100% - 8px) 100%,0% 100%,0% 8px)",
            }}
        >
            ✗ {msg}
        </motion.div>
    );
}

function PulseText({ text }) {
    return (
        <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
        >
            {text}…
        </motion.span>
    );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", otp: "", new_password: "", confirm_password: "" });
    const [showPass, setShowPass] = useState({ new: false, confirm: false });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const sendOTP = async () => {
        setError("");
        try {
            setLoading(true);
            const res = await forgotPassword({ email: form.email });
            await emailjs.send(
                emailjsForgotPassword.serviceId,
                emailjsForgotPassword.templateId,
                { email: form.email, otp: res.otp, app_name: "DQD Gaming" },
                emailjsForgotPassword.publicKey
            );
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        setError("");
        try {
            setLoading(true);
            await verifyForgotOTP({ email: form.email, otp: form.otp });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || "Invalid OTP.");
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async () => {
        setError("");
        if (form.new_password !== form.confirm_password) { setError("Passwords do not match."); return; }
        try {
            setLoading(true);
            await resetPassword({ email: form.email, otp: form.otp, new_password: form.new_password, confirm_password: form.confirm_password });
            setStep(4);
            setTimeout(() => navigate("/sign-in"), 2200);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    const stepTitles = ["Access Recovery", "OTP Verification", "New Credentials", "Identity Secured"];
    const stepSubs   = [
        "Enter your registered email address",
        `6-digit code dispatched to ${form.email}`,
        "Set a strong new password",
        "Redirecting to login…",
    ];

    const slide = {
        enter:  { x: 40, opacity: 0 },
        center: { x: 0,  opacity: 1 },
        exit:   { x: -40, opacity: 0 },
    };

    // derived — OTP is valid when all 6 cells are digits
    const otpComplete = /^\d{6}$/.test(form.otp);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                body { background: ${T.bg}; margin: 0; }
                .cyber-corner::before, .cyber-corner::after {
                    content: ''; position: absolute;
                    width: 18px; height: 18px;
                    border-color: ${T.cyan}; border-style: solid; opacity: 0.6;
                }
                .cyber-corner::before { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
                .cyber-corner::after  { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }
                @media (max-width: 480px) {
                    .fp-card { padding: 28px 18px !important; }
                }
                @media (max-width: 360px) {
                    .otp-wrap { gap: 6px !important; }
                    .otp-wrap input { width: 40px !important; height: 50px !important; font-size: 20px !important; }
                }
            `}</style>

            <div style={{
                minHeight: "100vh", width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "24px 16px",
                background: `radial-gradient(ellipse 60% 50% at 30% 20%, ${T.purple}18 0%, transparent 60%),
                             radial-gradient(ellipse 50% 40% at 80% 80%, ${T.cyan}10 0%, transparent 55%),
                             ${T.bg}`,
                fontFamily: "'Orbitron', sans-serif",
            }}>
                <div style={{ width: "100%", maxWidth: 480 }}>

                    {/* brand mark */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: "center", marginBottom: 32 }}>
                        <div style={{
                            display: "inline-block", padding: "6px 18px",
                            border: `1px solid ${T.cyan}44`, color: T.cyan,
                            fontSize: 11, letterSpacing: 5,
                            fontFamily: "'Share Tech Mono', monospace", marginBottom: 8,
                        }}>DQD GAMING</div>
                        <div style={{ width: 40, height: 2, background: `linear-gradient(90deg,transparent,${T.cyan},transparent)`, margin: "0 auto" }} />
                    </motion.div>

                    {/* card */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="cyber-corner fp-card"
                        style={{
                            position: "relative",
                            background: `linear-gradient(135deg, ${T.surface} 0%, #0a0a14 100%)`,
                            border: `1px solid ${T.border}`,
                            padding: "40px 36px",
                            boxShadow: `0 0 40px ${T.cyan}0a, 0 24px 60px rgba(0,0,0,0.6)`,
                        }}
                    >
                        {/* scan line */}
                        <motion.div
                            animate={{ scaleX: [0, 1, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                            style={{
                                position: "absolute", top: 0, left: 0, right: 0, height: 1,
                                background: `linear-gradient(90deg,transparent,${T.cyan},transparent)`,
                                boxShadow: `0 0 8px ${T.cyan}`, transformOrigin: "left",
                            }}
                        />

                        {step < 4 && <Stepper step={step} />}

                        {/* header */}
                        <AnimatePresence mode="wait">
                            <motion.div key={`h${step}`} variants={slide} initial="enter" animate="center" exit="exit"
                                transition={{ duration: 0.3 }} style={{ marginBottom: 28 }}>
                                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: 2, lineHeight: 1.2 }}>
                                    <span style={{ color: T.cyan }}>// </span>{stepTitles[step - 1]}
                                </h2>
                                <p style={{ margin: "8px 0 0", fontSize: 12, letterSpacing: 1, color: T.textDim, fontFamily: "'Share Tech Mono', monospace" }}>
                                    {stepSubs[step - 1]}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* step panels */}
                        <AnimatePresence mode="wait">

                            {step === 1 && (
                                <motion.div key="s1" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                    <CyberInput label="Email Address" type="email" name="email" value={form.email}
                                        onChange={handleChange} placeholder="operative@domain.com" icon="@" />
                                    {error && <ErrorMsg msg={error} />}
                                    <CyberButton onClick={sendOTP} disabled={loading || !form.email}>
                                        {loading ? <PulseText text="TRANSMITTING" /> : "SEND OTP →"}
                                    </CyberButton>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="s2" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                    <p style={{ textAlign: "center", fontSize: 12, color: T.textDim, fontFamily: "'Share Tech Mono', monospace", marginTop: 0, marginBottom: 24, letterSpacing: 1 }}>
                                        ENTER 6-DIGIT CODE
                                    </p>

                                    {/* OTP wrapper — gives the media-query a hook */}
                                    <div className="otp-wrap" style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                                        <OtpInput
                                            value={form.otp}
                                            onChange={(v) => { setForm(p => ({ ...p, otp: v })); setError(""); }}
                                        />
                                    </div>

                                    {error && <div style={{ marginTop: 16 }}><ErrorMsg msg={error} /></div>}

                                    <div style={{ marginTop: 28 }}>
                                        <CyberButton onClick={verifyOTP} disabled={loading || !otpComplete} color={T.green}>
                                            {loading ? <PulseText text="VERIFYING" /> : "VERIFY CODE →"}
                                        </CyberButton>
                                    </div>
                                    <p style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: T.textDim, fontFamily: "'Share Tech Mono', monospace" }}>
                                        Didn't receive?{" "}
                                        <button onClick={sendOTP} style={{ background: "none", border: "none", color: T.cyan, cursor: "pointer", fontSize: 11, fontFamily: "'Share Tech Mono', monospace", textDecoration: "underline", padding: 0 }}>
                                            Resend
                                        </button>
                                    </p>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="s3" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                    <div style={{ position: "relative" }}>
                                        <CyberInput label="New Password" type={showPass.new ? "text" : "password"}
                                            name="new_password" value={form.new_password} onChange={handleChange}
                                            placeholder="Min 8 characters" icon="🔑" />
                                        <button onClick={() => setShowPass(p => ({ ...p, new: !p.new }))}
                                            style={{ position: "absolute", right: 12, top: 34, background: "none", border: "none", color: T.textDim, cursor: "pointer", fontSize: 11, fontFamily: "'Share Tech Mono', monospace", letterSpacing: 1, padding: 0 }}>
                                            {showPass.new ? "HIDE" : "SHOW"}
                                        </button>
                                        <StrengthBar password={form.new_password} />
                                    </div>
                                    <div style={{ position: "relative", marginTop: 12 }}>
                                        <CyberInput label="Confirm Password" type={showPass.confirm ? "text" : "password"}
                                            name="confirm_password" value={form.confirm_password} onChange={handleChange}
                                            placeholder="Repeat password" icon="🔒" />
                                        <button onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))}
                                            style={{ position: "absolute", right: 12, top: 34, background: "none", border: "none", color: T.textDim, cursor: "pointer", fontSize: 11, fontFamily: "'Share Tech Mono', monospace", letterSpacing: 1, padding: 0 }}>
                                            {showPass.confirm ? "HIDE" : "SHOW"}
                                        </button>
                                        {form.confirm_password && form.new_password !== form.confirm_password && (
                                            <p style={{ color: T.pink, fontSize: 11, margin: "4px 0 0", fontFamily: "'Share Tech Mono', monospace" }}>✗ Passwords don't match</p>
                                        )}
                                        {form.confirm_password && form.new_password === form.confirm_password && (
                                            <p style={{ color: T.green, fontSize: 11, margin: "4px 0 0", fontFamily: "'Share Tech Mono', monospace" }}>✓ Passwords match</p>
                                        )}
                                    </div>
                                    {error && <div style={{ marginTop: 12 }}><ErrorMsg msg={error} /></div>}
                                    <div style={{ marginTop: 20 }}>
                                        <CyberButton onClick={updatePassword}
                                            disabled={loading || !form.new_password || form.new_password !== form.confirm_password}
                                            color={T.pink}>
                                            {loading ? <PulseText text="ENCRYPTING" /> : "RESET PASSWORD →"}
                                        </CyberButton>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="s4"
                                    variants={{ enter: { scale: 0.9, opacity: 0 }, center: { scale: 1, opacity: 1 }, exit: { scale: 1.1, opacity: 0 } }}
                                    initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
                                    style={{ textAlign: "center", padding: "20px 0" }}>
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
                                        transition={{ duration: 0.6, times: [0, 0.6, 1] }}
                                        style={{ fontSize: 64, marginBottom: 16, color: T.green }}>
                                        ✦
                                    </motion.div>
                                    <motion.div
                                        animate={{ boxShadow: [`0 0 24px ${T.green}44`, `0 0 40px ${T.green}88`, `0 0 24px ${T.green}44`] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        style={{
                                            display: "inline-block", padding: "10px 24px",
                                            border: `1px solid ${T.green}`, color: T.green,
                                            fontFamily: "'Share Tech Mono', monospace",
                                            fontSize: 13, letterSpacing: 3,
                                        }}>
                                        PASSWORD UPDATED
                                    </motion.div>
                                    <p style={{ color: T.textDim, fontSize: 12, marginTop: 16, fontFamily: "'Share Tech Mono', monospace" }}>
                                        Redirecting to secure login…
                                    </p>
                                </motion.div>
                            )}

                        </AnimatePresence>

                        {/* back link */}
                        {step < 4 && (
                            <div style={{ textAlign: "center", marginTop: 24 }}>
                                <button
                                    onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/sign-in")}
                                    style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer", fontSize: 11, fontFamily: "'Share Tech Mono', monospace", letterSpacing: 2, transition: "color 0.2s" }}
                                    onMouseEnter={e => e.target.style.color = T.cyan}
                                    onMouseLeave={e => e.target.style.color = T.textDim}
                                >
                                    ← {step > 1 ? "GO BACK" : "RETURN TO LOGIN"}
                                </button>
                            </div>
                        )}
                    </motion.div>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                        style={{ textAlign: "center", marginTop: 20, fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.15)", fontFamily: "'Share Tech Mono', monospace" }}>
                        DQD GAMING © SECURE RECOVERY PROTOCOL
                    </motion.p>
                </div>
            </div>
        </>
    );
}