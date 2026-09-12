import { useState } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════
   DESIGN TOKENS
   (shared visual system with Home / PrivacyPolicy:
   near-black void, violet + gold accents, Orbitron
   display type, angular corner brackets, scanlines)
═══════════════════════════════════════════════ */
const INK      = "#05040A";
const VIOLET   = "#7A2CFF";
const VIOLET_L = "#c084fc";
const GOLD     = "#D4AF37";
const GOLD_L   = "#F4D886";
const TEXT     = "#D8DAE8";
const MUTED    = "rgba(185,194,217,0.55)";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600&display=swap');

  .cu-root {
    position: relative;
    min-height: 100vh;
    background: ${INK};
    color: ${TEXT};
    font-family: 'Inter', -apple-system, sans-serif;
    overflow-x: hidden;
  }
  .cu-root * { box-sizing: border-box; }

  .cu-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(90px); z-index: 0; }
  .cu-orb-1 { width: 460px; height: 460px; top: -10%; right: -10%;
    background: radial-gradient(circle, rgba(122,44,255,0.16) 0%, transparent 70%); }
  .cu-orb-2 { width: 380px; height: 380px; bottom: -10%; left: -8%;
    background: radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%); }

  .cu-scanlines {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px);
  }
  .cu-topline {
    position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 1;
    background: linear-gradient(90deg, transparent, ${VIOLET}, ${GOLD}, ${VIOLET}, transparent);
  }

  /* ── hero ── */
  .cu-hero {
    position: relative; z-index: 1;
    padding: 76px 24px 40px;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    border-bottom: 1px solid rgba(122,44,255,0.18);
  }
  .cu-corner { position: absolute; width: 22px; height: 22px; pointer-events: none; }
  .cu-c-tl { top: 22px; left: 22px; border-top: 2px solid rgba(212,175,55,0.4); border-left: 2px solid rgba(212,175,55,0.4); }
  .cu-c-tr { top: 22px; right: 22px; border-top: 2px solid rgba(212,175,55,0.4); border-right: 2px solid rgba(212,175,55,0.4); }

  .cu-hex {
    width: 56px; height: 56px;
    border: 2px solid ${GOLD};
    clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
    display: grid; place-items: center;
    font-family: 'Orbitron', monospace; font-weight: 900; font-size: 20px; color: ${GOLD};
    margin-bottom: 22px;
    box-shadow: 0 0 24px rgba(212,175,55,0.25);
  }
  .cu-eyebrow {
    font-family: 'Orbitron', monospace; font-size: 10px; letter-spacing: 0.35em;
    color: ${VIOLET_L}; text-transform: uppercase; margin-bottom: 14px;
  }
  .cu-title {
    font-family: 'Orbitron', monospace; font-weight: 900; font-size: clamp(28px, 5vw, 46px);
    letter-spacing: 0.02em; line-height: 1.15; color: #fff; max-width: 720px;
    background: linear-gradient(135deg, #fff 40%, ${GOLD_L} 100%);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  }
  .cu-sub {
    margin-top: 16px; max-width: 620px; font-size: 15px; line-height: 1.7; color: ${MUTED};
  }
  .cu-chip-row { margin-top: 24px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
  .cu-chip {
    font-family: 'Orbitron', monospace; font-size: 9px; letter-spacing: 0.14em;
    text-transform: uppercase; color: ${GOLD};
    border: 1px solid rgba(212,175,55,0.35); padding: 7px 14px;
    clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));
    background: rgba(212,175,55,0.06);
  }

  /* ── shell ── */
  .cu-shell {
    position: relative; z-index: 1;
    max-width: 1080px; margin: 0 auto;
    padding: 52px 24px 100px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 28px;
  }
  @media (max-width: 860px) { .cu-shell { grid-template-columns: 1fr; } }

  /* ── info cards ── */
  .cu-card {
    border: 1px solid rgba(122,44,255,0.22);
    background: rgba(13,12,30,0.55);
    backdrop-filter: blur(6px);
    padding: 22px 22px 24px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .cu-card-label {
    font-family: 'Orbitron', monospace; font-size: 10px; letter-spacing: 0.28em;
    color: ${MUTED}; text-transform: uppercase; margin-bottom: 2px;
  }
  .cu-row { display: flex; align-items: flex-start; gap: 12px; }
  .cu-glyph {
    width: 30px; height: 30px; flex-shrink: 0; display: grid; place-items: center;
    border: 1px solid rgba(212,175,55,0.4); font-family: 'Orbitron', monospace; font-size: 11px; color: ${GOLD};
    clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  }
  .cu-row-body { display: flex; flex-direction: column; gap: 2px; }
  .cu-row-title { font-family: 'Orbitron', monospace; font-size: 10px; letter-spacing: 0.1em; color: ${VIOLET_L}; text-transform: uppercase; }
  .cu-row-value { font-size: 14.5px; line-height: 1.6; color: ${TEXT}; }
  .cu-link { color: ${TEXT}; text-decoration: none; }
  .cu-link:hover { color: ${GOLD}; text-decoration: underline; text-underline-offset: 2px; }

  .cu-divider { height: 1px; background: rgba(122,44,255,0.16); margin: 4px 0; }

  .cu-tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .cu-tag {
    font-size: 11.5px; padding: 6px 12px; color: ${MUTED};
    border: 1px solid rgba(122,44,255,0.28);
    background: rgba(122,44,255,0.06);
  }

  .cu-pay-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .cu-pay-chip {
    font-family: 'Orbitron', monospace; font-size: 9.5px; letter-spacing: 0.06em;
    padding: 7px 12px; color: ${GOLD_L};
    border: 1px solid rgba(212,175,55,0.3);
    background: rgba(212,175,55,0.05);
  }

  /* ── about block ── */
  .cu-about { grid-column: 1 / -1; }
  .cu-about-title { font-family: 'Orbitron', monospace; font-size: 15px; color: #fff; margin-bottom: 10px; letter-spacing: 0.01em; }
  .cu-about-p { font-size: 14.5px; line-height: 1.8; color: ${TEXT}; max-width: 78ch; margin: 0 0 12px; }
  .cu-about-p:last-child { margin-bottom: 0; }

  /* ── form ── */
  .cu-form-card { grid-column: 1 / -1; }
  .cu-form { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .cu-field { display: flex; flex-direction: column; gap: 6px; }
  .cu-field.full { grid-column: 1 / -1; }
  .cu-field label {
    font-family: 'Orbitron', monospace; font-size: 9.5px; letter-spacing: 0.16em;
    text-transform: uppercase; color: ${MUTED};
  }
  .cu-field input, .cu-field textarea {
    background: rgba(5,4,10,0.6);
    border: 1px solid rgba(122,44,255,0.28);
    color: ${TEXT}; font-family: 'Inter', sans-serif; font-size: 14px;
    padding: 11px 13px; outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .cu-field input:focus, .cu-field textarea:focus {
    border-color: ${GOLD}; box-shadow: 0 0 0 3px rgba(212,175,55,0.12);
  }
  .cu-field textarea { resize: vertical; min-height: 96px; font-family: 'Inter', sans-serif; }
  @media (max-width: 640px) { .cu-form { grid-template-columns: 1fr; } .cu-field.full { grid-column: 1; } }

  .cu-submit {
    margin-top: 4px; align-self: flex-start;
    padding: 12px 26px;
    font-family: 'Orbitron', monospace; font-size: 10.5px; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase;
    background: linear-gradient(135deg, ${VIOLET}, ${VIOLET_L});
    border: none; color: #fff; cursor: pointer;
    clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));
    transition: filter 0.2s ease, transform 0.15s ease;
  }
  .cu-submit:hover { filter: brightness(1.15); }
  .cu-submit:active { transform: scale(0.97); }
  .cu-submit:disabled { opacity: 0.6; cursor: default; }

  .cu-sent {
    margin-top: 10px; font-family: 'Orbitron', monospace; font-size: 10px;
    letter-spacing: 0.1em; color: ${GOLD_L};
  }

  /* ── map ── */
  .cu-map-card { grid-column: 1 / -1; padding: 0; overflow: hidden; }
  .cu-map-frame { width: 100%; height: 320px; border: 0; display: block; filter: grayscale(0.35) invert(0.92) contrast(0.9); }
  .cu-map-caption {
    padding: 14px 20px; font-size: 12.5px; color: ${MUTED};
    border-top: 1px solid rgba(122,44,255,0.18);
    display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
  }

  @media (prefers-reduced-motion: reduce) {
    .cu-root * { animation: none !important; transition: none !important; }
  }
`;

/* ═══════════════════════════════════════════════
   DATA — sourced from the DQD Gaming Hub listing
═══════════════════════════════════════════════ */
const CATEGORIES = ["Game Dealers", "Gaming Console Dealers"];
const PAYMENT_METHODS = ["Cash", "UPI", "Paytm", "PhonePe", "Amazon Pay"];

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    // Hook this up to your actual send-message endpoint.
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    }, 700);
  };

  return (
    <div className="cu-root">
      <style>{CSS}</style>
      <div className="cu-scanlines" />
      <div className="cu-orb cu-orb-1" />
      <div className="cu-orb cu-orb-2" />
      <div className="cu-topline" />

      {/* ── hero ── */}
      <motion.header
        className="cu-hero"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
      
        <span className="cu-eyebrow">DQD Gaming Hub</span>
        <h1 className="cu-title">Contact Us</h1>
        <p className="cu-sub">
          DQD Gaming Hub in Kadavanthra Junction, Kochi, Ernakulam — one of the leading Game
          Dealers in the area. Reach out for address, pricing, or product availability.
        </p>
        <div className="cu-chip-row">
          <span className="cu-chip">Est. Feb 2025</span>
          <span className="cu-chip">Kadavanthra, Kochi</span>
        </div>
      </motion.header>

      {/* ── shell ── */}
      <div className="cu-shell">
        {/* about */}
        <motion.div
          className="cu-card cu-about"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="cu-about-title">Location & Overview</div>
          <p className="cu-about-p">
            Established in 2025, DQD Gaming Hub in Kadavanthra Junction, Kochi, Ernakulam is a
            top player in the Game Dealers category. This well-known establishment serves
            customers both local and from other parts of Kochi, with a strong focus on customer
            satisfaction alongside its products and services.
          </p>
          <p className="cu-about-p">
            Positioned at a prominent location in Kadavanthra Junction, the store is easy to
            reach with various modes of transport readily available nearby.
          </p>
          <div className="cu-divider" />
          <div className="cu-card-label">Categories</div>
          <div className="cu-tag-list">
            {CATEGORIES.map((c) => (
              <span className="cu-tag" key={c}>{c}</span>
            ))}
          </div>
        </motion.div>

        {/* contact details */}
        <motion.div
          className="cu-card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <span className="cu-card-label">Get In Touch</span>

          <div className="cu-row">
            <span className="cu-glyph">*</span>
            <div className="cu-row-body">
              <span className="cu-row-title">Address</span>
              <span className="cu-row-value">
                Kadavanthra Jn, Ernakulam, Cochin-20, Opposite KR Bakers, Kerala, India
              </span>
            </div>
          </div>

          <div className="cu-row">
            <span className="cu-glyph">#</span>
            <div className="cu-row-body">
              <span className="cu-row-title">Phone</span>
              <a className="cu-link cu-row-value" href="tel:+917947105311">+91 79471 05311</a>
            </div>
          </div>

          <div className="cu-row">
            <span className="cu-glyph">@</span>
            <div className="cu-row-body">
              <span className="cu-row-title">Email</span>
              <a className="cu-link cu-row-value" href="mailto:dqdgaminghub3003@gmail.com">
                dqdgaminghub3003@gmail.com
              </a>
            </div>
          </div>

          <div className="cu-row">
            <span className="cu-glyph">W</span>
            <div className="cu-row-body">
              <span className="cu-row-title">Website</span>
              <a className="cu-link cu-row-value" href="https://www.dqdgaming.com" target="_blank" rel="noopener noreferrer">
                www.dqdgaming.com
              </a>
            </div>
          </div>
        </motion.div>

        {/* payments */}
        <motion.div
          className="cu-card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="cu-card-label">Products & Services</span>
          <p className="cu-row-value">
            A wide range of gaming products and services, with staff on hand to answer questions
            and help you find what you need.
          </p>
          <div className="cu-divider" />
          <span className="cu-card-label">Payment Methods Accepted</span>
          <div className="cu-pay-list">
            {PAYMENT_METHODS.map((p) => (
              <span className="cu-pay-chip" key={p}>{p}</span>
            ))}
          </div>
        </motion.div>

        {/* hours */}
        <motion.div
          className="cu-card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <span className="cu-card-label">Store Hours</span>
          <div className="cu-row">
            <span className="cu-glyph">T</span>
            <div className="cu-row-body">
              <span className="cu-row-title">Mon – Sat</span>
              <span className="cu-row-value">10:00 AM – 9:00 PM</span>
            </div>
          </div>
          <div className="cu-row">
            <span className="cu-glyph">S</span>
            <div className="cu-row-body">
              <span className="cu-row-title">Sunday</span>
              <span className="cu-row-value">11:00 AM – 6:00 PM</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
            Please confirm hours by phone before visiting on public holidays.
          </p>
        </motion.div>

        {/* map */}
        <motion.div
          className="cu-card cu-map-card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <iframe
            className="cu-map-frame"
            title="DQD Gaming Hub location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Kadavanthra+Junction,+Kochi,+Ernakulam&output=embed"
          />
          <div className="cu-map-caption">
            <span>Kadavanthra Junction, Kochi, Ernakulam</span>
            <a
              className="cu-link"
              href="https://www.google.com/maps/search/?api=1&query=DQD+Gaming+Hub+Kadavanthra+Junction+Kochi"
              target="_blank" rel="noopener noreferrer"
            >
              Open in Google Maps ↗
            </a>
          </div>
        </motion.div>

        {/* message form */}
        <motion.div
          className="cu-card cu-form-card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <span className="cu-card-label">Send A Message</span>
          <form className="cu-form" onSubmit={onSubmit}>
            <div className="cu-field">
              <label htmlFor="cu-name">Name</label>
              <input id="cu-name" name="name" value={form.name} onChange={onChange} placeholder="Your name" required />
            </div>
            <div className="cu-field">
              <label htmlFor="cu-email">Email</label>
              <input id="cu-email" type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" required />
            </div>
            <div className="cu-field full">
              <label htmlFor="cu-message">Message</label>
              <textarea id="cu-message" name="message" value={form.message} onChange={onChange} placeholder="What can we help with?" required />
            </div>
            <div className="cu-field full">
              <button className="cu-submit" type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send Message"}
              </button>
              {sent && <div className="cu-sent">✓ Message sent — we'll get back to you soon.</div>}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}