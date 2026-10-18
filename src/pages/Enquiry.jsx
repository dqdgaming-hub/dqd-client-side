import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  CircleAlert, CircleCheck, Gamepad2, Lock, Mail, MapPin, MessageSquare, Phone, RotateCcw, Send, User,
} from "lucide-react";
import { emailjsConfig } from "../Auth/User/DashboardComponents/emailjsConfig";
import { infoCss, PageHero, Rise } from "./infoPage";

const css = `
.eq-wrap { max-width: 760px; width: 100%; margin: 0 auto; }
.eq-head { display: flex; align-items: center; gap: 10px; padding-bottom: 16px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,.08); }
.eq-head .ip-card-label { margin: 0; }
.eq-live { margin-left: auto; display: inline-flex; align-items: center; gap: 7px; font: 700 11px/1 'Share Tech Mono', monospace; letter-spacing: .18em; color: #8dff7a; }
.eq-live::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #39ff14; box-shadow: 0 0 8px #39ff14; animation: eq-blink 1.6s ease-in-out infinite; }
@keyframes eq-blink { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
.eq-count { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 12px; margin-top: -6px;
  font: 700 11.5px/1.3 'Share Tech Mono', monospace; letter-spacing: .12em; color: #8f89b0; }
.eq-count.over b { color: var(--dqd-pink, #ff2d78); }
.eq-count span { display: inline-flex; align-items: center; gap: 6px; color: var(--acc); }
.eq-foot { margin: 16px 0 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 10px; text-align: center; color: #8f89b0; font-size: 14.5px; }
.eq-foot span { display: inline-flex; align-items: center; gap: 6px; color: var(--acc); }
.eq-done { display: grid; justify-items: center; gap: 10px; padding: clamp(28px, 6vw, 48px) 8px; text-align: center; }
.eq-done > svg { color: #39ff14; filter: drop-shadow(0 0 16px rgba(57,255,20,.5)); }
.eq-done h3 { margin: 6px 0 0; font: 900 clamp(18px, 3vw, 22px)/1.2 'Orbitron', sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #fff; }
.eq-done p { margin: 0 0 8px; color: #b7b1d6; font-size: 16.5px; }
@media (prefers-reduced-motion: reduce) { .eq-live::before { animation: none; } }
`;

// Rotating example text for the message box placeholder.
function useTypingPlaceholder(phrases, speed = 70, pause = 1800) {
  const [text, setText] = useState("");
  const [pi, setPi] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const phrase = phrases[pi % phrases.length];
    let timeout;
    if (typing) {
      if (text.length < phrase.length) {
        timeout = setTimeout(() => setText(phrase.slice(0, text.length + 1)), speed);
      } else {
        timeout = setTimeout(() => setTyping(false), pause);
      }
    } else if (text.length > 0) {
      timeout = setTimeout(() => setText(text.slice(0, -1)), speed / 2);
    } else {
      setPi((p) => p + 1);
      setTyping(true);
    }
    return () => clearTimeout(timeout);
  }, [text, typing, pi, phrases, speed, pause]);

  return text;
}

const PHRASES = [
  "Ask about game availability…",
  "Enquire about console deals…",
  "Need a custom gaming setup?",
  "Want to know our trade-in rates?",
];

const MAX_CHARS = 500;
const EMPTY = { name: "", email: "", phone: "", message: "" };

export default function Enquiry({ onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState("");
  const [sentName, setSentName] = useState("");

  const msgPlaceholder = useTypingPlaceholder(PHRASES);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setStatus("sending");
    setError("");
    const params = {
      from_name: form.name,
      from_email: form.email,
      phone: form.phone || "Not provided",
      message: form.message || "No message provided",
      submitted_at: new Date().toLocaleString(),
    };
    try {
      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        params,
        { publicKey: emailjsConfig.publicKey }
      );
      if (onSubmit) onSubmit(form);
      setSentName(form.name.trim().split(" ")[0]);
      setStatus("sent");
      setForm(EMPTY);
    } catch {
      setStatus("idle");
      setError("Transmission failed. Check your connection and try again.");
    }
  };

  const len = form.message.length;

  return (
    <div className="ip">
      <style>{infoCss + css}</style>

      <PageHero
        eyebrow="DQD Gaming Hub · Kochi"
        title="Drop Us a"
        accent="Signal"
        sub="Questions about consoles, games, or gear? Transmit your enquiry — our team responds within 24 hours."
      />

      <div className="ip-body">
        <Rise className="ip-card eq-wrap">
          <div className="eq-head">
            <h2 className="ip-card-label"><Gamepad2 size={18} aria-hidden="true" /> Send an Enquiry</h2>
            <span className="eq-live">ONLINE</span>
          </div>

          {status === "sent" ? (
              <div className="eq-done ip-rise" role="status">
                <CircleCheck size={56} aria-hidden="true" />
                <h3>Signal Received!</h3>
                <p>{sentName ? `Hey ${sentName}, we` : "We"}'ll ping you back within 24h.</p>
                <button type="button" className="ip-btn ghost" onClick={() => setStatus("idle")}>
                  <RotateCcw size={15} aria-hidden="true" /> Send another
                </button>
              </div>
            ) : (
              <form className="ip-form" onSubmit={submit}>
                {error && (
                  <div className="ip-note bad ip-field full" role="alert">
                    <CircleAlert size={18} aria-hidden="true" /> {error}
                  </div>
                )}
                <div className="ip-field">
                  <label htmlFor="eq-name"><User size={14} aria-hidden="true" /> Full Name <b>*</b></label>
                  <input className="ip-input" id="eq-name" value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" required />
                </div>
                <div className="ip-field">
                  <label htmlFor="eq-email"><Mail size={14} aria-hidden="true" /> Email <b>*</b></label>
                  <input className="ip-input" id="eq-email" type="email" value={form.email} onChange={set("email")} placeholder="name@email.com" autoComplete="email" required />
                </div>
                <div className="ip-field full">
                  <label htmlFor="eq-phone"><Phone size={14} aria-hidden="true" /> Phone (optional)</label>
                  <input className="ip-input" id="eq-phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" autoComplete="tel" />
                </div>
                <div className="ip-field full">
                  <label htmlFor="eq-message"><MessageSquare size={14} aria-hidden="true" /> Message</label>
                  <textarea className="ip-input" id="eq-message" value={form.message} onChange={set("message")}
                    placeholder={msgPlaceholder || "Tell us what you need…"} />
                </div>
                <div className={`eq-count ip-field full${len > MAX_CHARS * 0.85 ? " over" : ""}`}>
                  <span><Lock size={13} aria-hidden="true" /> Encrypted · Secure</span>
                  <div><b>{len}</b> / {MAX_CHARS} chars</div>
                </div>
                <div className="ip-field full">
                  <button type="submit" className="ip-btn block" disabled={status === "sending" || !form.name || !form.email}>
                    <Send size={16} aria-hidden="true" /> {status === "sending" ? "Transmitting…" : "Transmit Message"}
                  </button>
                </div>
              </form>
            )}

          {status !== "sent" && (
            <p className="eq-foot">
              No spam. Just gaming talk.
              <span><MapPin size={14} aria-hidden="true" /> DQD Gaming Hub, Kadavanthra, Kochi</span>
            </p>
          )}
        </Rise>
      </div>
    </div>
  );
}
