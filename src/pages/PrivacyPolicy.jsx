import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════
   DESIGN TOKENS
   (matches the Home / RacingGame visual system:
   near-black void, violet + gold accents, Orbitron
   display type, angular corner brackets, scanlines)
═══════════════════════════════════════════════ */
const INK      = "#05040A";
const SURFACE  = "#0d0c1e";
const VIOLET   = "#7A2CFF";
const VIOLET_L = "#c084fc";
const GOLD     = "#D4AF37";
const GOLD_L   = "#F4D886";
const TEXT     = "#D8DAE8";
const MUTED    = "rgba(185,194,217,0.55)";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600&display=swap');

  .pp-root {
    position: relative;
    min-height: 100vh;
    background: ${INK};
    color: ${TEXT};
    font-family: 'Inter', -apple-system, sans-serif;
    overflow-x: hidden;
  }
  .pp-root * { box-sizing: border-box; }

  .pp-orb {
    position: absolute; border-radius: 50%; pointer-events: none; filter: blur(90px); z-index: 0;
  }
  .pp-orb-1 { width: 480px; height: 480px; top: -12%; left: -10%;
    background: radial-gradient(circle, rgba(122,44,255,0.16) 0%, transparent 70%); }
  .pp-orb-2 { width: 380px; height: 380px; top: 40%; right: -12%;
    background: radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%); }
  .pp-orb-3 { width: 420px; height: 420px; bottom: -14%; left: 20%;
    background: radial-gradient(circle, rgba(122,44,255,0.08) 0%, transparent 70%); }

  .pp-scanlines {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px);
  }

  .pp-topline {
    position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 1;
    background: linear-gradient(90deg, transparent, ${VIOLET}, ${GOLD}, ${VIOLET}, transparent);
  }

  /* ── hero ── */
  .pp-hero {
    position: relative; z-index: 1;
    padding: 76px 24px 48px;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    border-bottom: 1px solid rgba(122,44,255,0.18);
  }
  .pp-corner { position: absolute; width: 22px; height: 22px; pointer-events: none; }
  .pp-c-tl { top: 22px; left: 22px; border-top: 2px solid rgba(212,175,55,0.4); border-left: 2px solid rgba(212,175,55,0.4); }
  .pp-c-tr { top: 22px; right: 22px; border-top: 2px solid rgba(212,175,55,0.4); border-right: 2px solid rgba(212,175,55,0.4); }

  .pp-hex {
    width: 56px; height: 56px;
    border: 2px solid ${GOLD};
    clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
    display: grid; place-items: center;
    font-family: 'Orbitron', monospace; font-weight: 900; font-size: 20px; color: ${GOLD};
    margin-bottom: 22px;
    box-shadow: 0 0 24px rgba(212,175,55,0.25);
  }
  .pp-eyebrow {
    font-family: 'Orbitron', monospace; font-size: 10px; letter-spacing: 0.35em;
    color: ${VIOLET_L}; text-transform: uppercase; margin-bottom: 14px;
  }
  .pp-title {
    font-family: 'Orbitron', monospace; font-weight: 900; font-size: clamp(28px, 5vw, 46px);
    letter-spacing: 0.02em; line-height: 1.15; color: #fff; max-width: 720px;
    background: linear-gradient(135deg, #fff 40%, ${GOLD_L} 100%);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  }
  .pp-sub {
    margin-top: 16px; max-width: 560px; font-size: 15px; line-height: 1.7; color: ${MUTED};
  }
  .pp-meta-row {
    margin-top: 26px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
  }
  .pp-chip {
    font-family: 'Orbitron', monospace; font-size: 9px; letter-spacing: 0.14em;
    text-transform: uppercase; color: ${GOLD};
    border: 1px solid rgba(212,175,55,0.35); padding: 7px 14px;
    clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));
    background: rgba(212,175,55,0.06);
  }

  /* ── layout shell ── */
  .pp-shell {
    position: relative; z-index: 1;
    max-width: 1120px; margin: 0 auto;
    display: grid; grid-template-columns: 260px 1fr; gap: 48px;
    padding: 48px 24px 100px;
  }
  @media (max-width: 860px) {
    .pp-shell { grid-template-columns: 1fr; }
  }

  /* ── TOC ── */
  .pp-toc-wrap { position: relative; }
  .pp-toc {
    position: sticky; top: 24px;
    border: 1px solid rgba(122,44,255,0.22);
    background: rgba(13,12,30,0.6);
    backdrop-filter: blur(6px);
    padding: 18px 16px;
  }
  .pp-toc-label {
    font-family: 'Orbitron', monospace; font-size: 9px; letter-spacing: 0.3em;
    color: ${MUTED}; text-transform: uppercase; margin-bottom: 12px; display: block;
  }
  .pp-toc-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
  .pp-toc-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 8px; cursor: pointer; border: none; background: none; width: 100%;
    text-align: left; font-family: 'Inter', sans-serif; font-size: 12.5px;
    color: ${MUTED}; border-left: 2px solid transparent;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  }
  .pp-toc-item:hover { color: ${TEXT}; background: rgba(122,44,255,0.06); }
  .pp-toc-item.active {
    color: ${GOLD_L}; border-left: 2px solid ${GOLD};
    background: rgba(212,175,55,0.06);
  }
  .pp-toc-dot {
    width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
    background: ${VIOLET}; box-shadow: 0 0 6px rgba(122,44,255,0.7);
  }
  .pp-toc-item.active .pp-toc-dot { background: ${GOLD}; box-shadow: 0 0 6px rgba(212,175,55,0.8); }

  /* ── content ── */
  .pp-content { min-width: 0; }
  .pp-section {
    padding: 30px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
    scroll-margin-top: 24px;
  }
  .pp-section:last-child { border-bottom: none; }
  .pp-h2 {
    display: flex; align-items: baseline; gap: 12px;
    font-family: 'Orbitron', monospace; font-weight: 700; font-size: 18px;
    color: #fff; letter-spacing: 0.01em; margin: 0 0 14px;
  }
  .pp-h2-index {
    font-size: 11px; color: ${VIOLET_L}; font-weight: 900; opacity: 0.7;
  }
  .pp-h3 {
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14.5px;
    color: ${GOLD_L}; margin: 22px 0 8px;
  }
  .pp-p { font-size: 14.5px; line-height: 1.8; color: ${TEXT}; margin: 0 0 12px; max-width: 68ch; }
  .pp-p.muted { color: ${MUTED}; }
  .pp-ul { margin: 0 0 14px; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; max-width: 68ch; }
  .pp-ul li { font-size: 14.5px; line-height: 1.7; color: ${TEXT}; }
  .pp-ul.dash { list-style: none; padding-left: 0; }
  .pp-ul.dash li { position: relative; padding-left: 18px; }
  .pp-ul.dash li::before {
    content: ""; position: absolute; left: 0; top: 8px; width: 8px; height: 2px; background: ${VIOLET};
  }
  .pp-strong { color: ${GOLD_L}; font-weight: 600; }
  .pp-link { color: ${VIOLET_L}; text-decoration: underline; text-underline-offset: 2px; }
  .pp-link:hover { color: ${GOLD}; }

  .pp-note {
    margin: 6px 0 16px; padding: 12px 14px;
    border-left: 2px solid ${VIOLET};
    background: rgba(122,44,255,0.06);
    font-size: 13.5px; line-height: 1.7; color: ${MUTED};
    max-width: 68ch;
  }

  .pp-def-grid { display: flex; flex-direction: column; gap: 14px; }
  .pp-def { max-width: 68ch; }
  .pp-def-term {
    font-family: 'Orbitron', monospace; font-size: 11px; letter-spacing: 0.05em;
    color: ${GOLD}; text-transform: uppercase; margin-bottom: 4px; display: block;
  }
  .pp-def-body { font-size: 14.5px; line-height: 1.75; color: ${TEXT}; }

  .pp-table-wrap { border: 1px solid rgba(122,44,255,0.2); margin: 4px 0 18px; max-width: 68ch; }
  .pp-cookie-row { padding: 14px 16px; border-bottom: 1px solid rgba(122,44,255,0.14); }
  .pp-cookie-row:last-child { border-bottom: none; }
  .pp-cookie-name { font-family: 'Orbitron', monospace; font-size: 11px; color: ${VIOLET_L}; letter-spacing: 0.03em; margin-bottom: 6px; }
  .pp-cookie-meta { font-size: 11.5px; color: ${MUTED}; margin-bottom: 6px; display: flex; gap: 14px; flex-wrap: wrap; }
  .pp-cookie-meta b { color: ${MUTED}; font-weight: 600; }
  .pp-cookie-purpose { font-size: 13.5px; line-height: 1.7; color: ${TEXT}; }

  /* ── contact card ── */
  .pp-contact {
    margin-top: 8px;
    border: 1px solid rgba(212,175,55,0.3);
    background: linear-gradient(160deg, rgba(122,44,255,0.08), rgba(212,175,55,0.05));
    padding: 26px 24px;
    display: flex; flex-direction: column; gap: 14px;
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
  }
  .pp-contact-title { font-family: 'Orbitron', monospace; font-size: 14px; color: #fff; letter-spacing: 0.04em; }
  .pp-contact-row { display: flex; align-items: center; gap: 10px; font-size: 14px; color: ${TEXT}; }
  .pp-contact-glyph {
    width: 26px; height: 26px; flex-shrink: 0; display: grid; place-items: center;
    border: 1px solid rgba(212,175,55,0.4); font-family: 'Orbitron', monospace; font-size: 10px; color: ${GOLD};
    clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  }

  .pp-back-top {
    display: inline-flex; align-items: center; gap: 8px; margin-top: 40px;
    font-family: 'Orbitron', monospace; font-size: 10px; letter-spacing: 0.2em;
    color: ${MUTED}; text-transform: uppercase; cursor: pointer; background: none; border: none;
  }
  .pp-back-top:hover { color: ${GOLD}; }

  @media (prefers-reduced-motion: reduce) {
    .pp-root * { animation: none !important; transition: none !important; }
  }
`;

/* ═══════════════════════════════════════════════
   CONTENT
═══════════════════════════════════════════════ */
const SECTIONS = [
  { id: "definitions", label: "Definitions" },
  { id: "collecting", label: "Data We Collect" },
  { id: "cookies", label: "Cookies & Tracking" },
  { id: "use", label: "How We Use It" },
  { id: "sms", label: "Text Messages" },
  { id: "retention", label: "Retention" },
  { id: "transfer", label: "International Transfer" },
  { id: "delete", label: "Deleting Your Data" },
  { id: "disclosure", label: "Disclosure" },
  { id: "security", label: "Security" },
  { id: "children", label: "Children's Privacy" },
  { id: "links", label: "Other Websites" },
  { id: "changes", label: "Policy Changes" },
  { id: "contact", label: "Contact Us" },
];

const DEFINITIONS = [
  ["Account", "A unique account created for you to access our service or parts of our service."],
  ["Affiliate", 'An entity that controls, is controlled by, or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest, or other securities entitled to vote for election of directors or other managing authority.'],
  ["Company", 'Referred to as "the Company", "We", "Us", or "Our" — DQD Gaming Hub, Kadavanthra Jn, Ernakulam, Cochin-20, opposite KR Bakers.'],
  ["Cookies", "Small files placed on your computer, mobile device, or any other device by a website, containing details of your browsing history on that website, among its many uses."],
  ["Country/State", "Kerala, India."],
  ["Device", "Any device that can access the service, such as a computer, a cell phone, or a digital tablet."],
  ["Personal Data", 'Any information that relates to an identified or identifiable individual. We use "Personal Data" and "Personal Information" interchangeably unless a law uses a specific term.'],
  ["Service", "Refers to the website."],
  ["Service Provider", "Any natural or legal person who processes data on our behalf — third-party companies or individuals employed to facilitate the service, provide it on our behalf, or assist us in analyzing how it's used."],
  ["Usage Data", "Data collected automatically, either generated by the use of the service or from the service infrastructure itself (for example, the duration of a page visit)."],
  ["User", "Any individual who accesses or uses the service."],
  ["Website", "DQD Gaming, accessible from www.dqdgaming.com."],
  ["You", "The individual accessing or using the service, or the company or other legal entity on whose behalf such individual is accessing or using the service."],
];

const COOKIE_TYPES = [
  {
    name: "Necessary / Essential Cookies",
    type: "Session Cookies",
    admin: "Us",
    purpose: "Essential to provide you with services available through the website and to enable you to use some of its features. They help authenticate users and prevent fraudulent use of user accounts.",
  },
  {
    name: "Cookies Policy / Notice Acceptance Cookies",
    type: "Persistent Cookies",
    admin: "Us",
    purpose: "Identify whether users have accepted the use of cookies on the website and record the consent choices you've made, so we can honor them on future visits.",
  },
  {
    name: "Functionality Cookies",
    type: "Persistent Cookies",
    admin: "Us",
    purpose: "Let us remember choices you make when using the website, such as your account login details or language preference — for a more personal experience.",
  },
];

/* ═══════════════════════════════════════════════
   SMALL HELPERS
═══════════════════════════════════════════════ */
function Section({ id, index, title, children }) {
  return (
    <section id={id} className="pp-section">
      <h2 className="pp-h2">
        <span className="pp-h2-index">{String(index).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ═══════════════════════════════════════════════
   PRIVACY POLICY PAGE
═══════════════════════════════════════════════ */
export default function PrivacyPolicy() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const observerRef = useRef(null);

  useEffect(() => {
    const opts = { rootMargin: "-15% 0px -70% 0px", threshold: 0 };
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, opts);

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current && observerRef.current.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="pp-root">
      <style>{CSS}</style>
      <div className="pp-scanlines" />
      <div className="pp-orb pp-orb-1" />
      <div className="pp-orb pp-orb-2" />
      <div className="pp-orb pp-orb-3" />
      <div className="pp-topline" />

      {/* ── hero ── */}
      <motion.header
        className="pp-hero"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        
        <span className="pp-eyebrow">DQD Gaming Hub</span>
        <h1 className="pp-title">Privacy Policy</h1>
        <p className="pp-sub">
          How we collect, use, and protect your information when you use our service —
          and the choices you have about it.
        </p>
        <div className="pp-meta-row">
          <span className="pp-chip">Last Updated · Sep 12, 2026</span>
          <span className="pp-chip">Kerala, India</span>
        </div>
      </motion.header>

      {/* ── body ── */}
      <div className="pp-shell">
        {/* TOC */}
        <div className="pp-toc-wrap">
          <nav className="pp-toc">
            <span className="pp-toc-label">On This Page</span>
            <ul className="pp-toc-list">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    className={`pp-toc-item${active === s.id ? " active" : ""}`}
                    onClick={() => scrollTo(s.id)}
                  >
                    <span className="pp-toc-dot" />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* content */}
        <main className="pp-content">
          <p className="pp-p muted">
            This Privacy Policy describes our policies and procedures on the collection, use,
            and disclosure of your information when you use the service, and tells you about
            your privacy rights and how the law protects you. We use your personal data to
            provide and improve the service, and we collect, use, and disclose it only where we
            have a valid legal basis to do so, including your consent where consent is required.
          </p>

          <Section id="definitions" index={1} title="Interpretation & Definitions">
            <p className="pp-p">
              The words whose initial letters are capitalized have meanings defined below. These
              definitions apply whether the terms appear in singular or plural form.
            </p>
            <div className="pp-def-grid">
              {DEFINITIONS.map(([term, body]) => (
                <div className="pp-def" key={term}>
                  <span className="pp-def-term">{term}</span>
                  <p className="pp-def-body">{body}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="collecting" index={2} title="Collecting & Using Your Personal Information">
            <h3 className="pp-h3">Personal Data</h3>
            <p className="pp-p">
              While using our service, we may ask you to provide certain personally identifiable
              information that can be used to contact or identify you, including but not limited to:
            </p>
            <ul className="pp-ul dash">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
            </ul>

            <h3 className="pp-h3">Usage Data</h3>
            <p className="pp-p">
              Usage data is collected automatically when using the service. It may include your
              device's IP address, browser type and version, the pages you visit, the time and
              date of your visit, time spent on those pages, unique device identifiers, and other
              diagnostic data — including, when you access the service through a mobile device,
              your device type, mobile operating system, and mobile browser type.
            </p>
          </Section>

          <Section id="cookies" index={3} title="Cookies & Tracking Technologies">
            <p className="pp-p">
              We use tracking technologies such as cookies and web beacons to track activity and
              improve our service. Cookies can be <span className="pp-strong">Persistent</span> or{" "}
              <span className="pp-strong">Session</span> — persistent cookies remain on your device
              after you go offline, while session cookies are deleted once you close your browser.
            </p>
            <p className="pp-p">
              Where required by law, non-essential cookies are used only with your consent. You
              can withdraw or change your consent at any time through our cookie preferences tool
              (if available) or your browser settings, without affecting the lawfulness of
              processing carried out before withdrawal.
            </p>
            <div className="pp-table-wrap">
              {COOKIE_TYPES.map((c) => (
                <div className="pp-cookie-row" key={c.name}>
                  <div className="pp-cookie-name">{c.name}</div>
                  <div className="pp-cookie-meta">
                    <span><b>Type —</b> {c.type}</span>
                    <span><b>Administered by —</b> {c.admin}</span>
                  </div>
                  <div className="pp-cookie-purpose">{c.purpose}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="use" index={4} title="How We Use Your Personal Data">
            <p className="pp-p">The company may use personal data for the following purposes:</p>
            <ul className="pp-ul dash">
              <li><span className="pp-strong">To provide and maintain our service</span>, including monitoring its usage.</li>
              <li><span className="pp-strong">To manage your account</span> and the registration you hold as a user.</li>
              <li><span className="pp-strong">For the performance of a contract</span> — developing, complying with, and fulfilling purchases or other agreements made through the service.</li>
              <li><span className="pp-strong">To contact you</span> by email, phone, SMS, or push notification about updates or service-related communications, including security updates.</li>
              <li><span className="pp-strong">To send news and offers</span> about goods, services, and events similar to those you've already used — only with your consent where required by law, and always with the option to opt out.</li>
              <li><span className="pp-strong">To manage your requests</span> made to us.</li>
              <li><span className="pp-strong">For business transfers</span> — evaluating or conducting a merger, sale, or reorganization involving some or all of our assets.</li>
              <li><span className="pp-strong">For other purposes</span> such as data analysis, identifying usage trends, and improving our service, marketing, and your experience.</li>
            </ul>

            <h3 className="pp-h3">Who We Share It With</h3>
            <ul className="pp-ul dash">
              <li><span className="pp-strong">Service providers</span>, to monitor and analyze use of the service and to contact you.</li>
              <li><span className="pp-strong">Business transfers</span>, in connection with a merger, asset sale, financing, or acquisition.</li>
              <li><span className="pp-strong">Affiliates</span>, who are required to honor this privacy policy.</li>
              <li><span className="pp-strong">Other users</span>, if you interact in any public areas the service may offer.</li>
              <li><span className="pp-strong">With your consent</span>, for any other disclosed purpose.</li>
            </ul>
          </Section>

          <Section id="sms" index={5} title="Text Messages Privacy Notice">
            <p className="pp-p">
              If you opt in to text (SMS) messages, we collect and store the information you
              provide in connection with texting — your phone number, the date and method of your
              consent, and message delivery and read information.
            </p>
            <p className="pp-note">
              No mobile information is shared with or sold to third parties or affiliates for
              marketing or promotional purposes. Phone numbers and consent records collected for
              texting are shared only with the service providers technically required to deliver
              the messages.
            </p>
            <p className="pp-p">
              Consent to receive text messages is never a condition of purchase or use of our
              service. If you consent, you agree to receive messages related to:
            </p>
            <ul className="pp-ul dash">
              <li>Customer care and support</li>
              <li>Account notifications — activity, status, or renewal reminders</li>
              <li>Delivery notifications and status updates</li>
              <li>Authentication messages, such as one-time passwords and passcodes</li>
              <li>Security alerts for suspicious login attempts or unusual activity</li>
              <li>Marketing and promotional offers</li>
            </ul>
            <p className="pp-p muted">
              Reply STOP to opt out, or HELP for support. Message and data rates may apply.
              Messaging frequency may vary. Carriers aren't liable for delayed or undelivered messages.
            </p>
          </Section>

          <Section id="retention" index={6} title="Retention of Your Personal Data">
            <p className="pp-p">
              We retain your personal data only as long as necessary for the purposes set out in
              this policy, or to comply with legal obligations, resolve disputes, and enforce our
              agreements. Where possible, we apply shorter retention periods or anonymize data
              sooner than these maximums:
            </p>
            <ul className="pp-ul dash">
              <li><span className="pp-strong">User accounts —</span> for the life of your account, plus up to 24 months after closure.</li>
              <li><span className="pp-strong">Support tickets & correspondence —</span> up to 24 months from ticket closure.</li>
              <li><span className="pp-strong">Chat transcripts —</span> up to 24 months for quality assurance and training.</li>
              <li><span className="pp-strong">Website analytics (cookies, IPs, device IDs) —</span> up to 24 months from collection.</li>
              <li><span className="pp-strong">Server logs —</span> up to 24 months for security monitoring and troubleshooting.</li>
            </ul>
            <p className="pp-p">
              Data may be retained longer where required by law, to establish or defend legal
              claims, at your explicit request, or where it exists in backup systems awaiting
              routine deletion. Once a retention period expires, data is deleted, retained briefly
              in encrypted backups, or anonymized into statistical data that can no longer be
              linked back to you.
            </p>
          </Section>

          <Section id="transfer" index={7} title="Transfer of Your Personal Data">
            <p className="pp-p">
              Your information is processed at the company's operating offices and wherever the
              parties involved in processing are located — which may mean it is transferred to,
              and maintained on, computers outside your state, province, or country. Where
              required by law, we ensure appropriate safeguards accompany any such transfer, and
              we take reasonable steps to confirm your data is handled securely and in line with
              this policy before it moves to any organization or country.
            </p>
          </Section>

          <Section id="delete" index={8} title="Deleting Your Personal Data">
            <p className="pp-p">
              You have the right to delete, or ask us to help delete, the personal data we've
              collected about you. Where the service allows it, you can delete certain
              information directly from within your account settings — or contact us to request
              access, correction, or deletion of any personal data you've provided.
            </p>
            <p className="pp-p muted">
              We may need to retain certain information where we have a legal obligation or
              lawful basis to do so.
            </p>
          </Section>

          <Section id="disclosure" index={9} title="Disclosure of Your Personal Data">
            <h3 className="pp-h3">Business Transactions</h3>
            <p className="pp-p">
              If the company is involved in a merger, acquisition, or asset sale, your personal
              data may be transferred. We'll provide notice before it becomes subject to a
              different privacy policy.
            </p>
            <h3 className="pp-h3">Law Enforcement</h3>
            <p className="pp-p">
              Under certain circumstances, we may disclose your personal data if required by law
              or in response to valid requests from public authorities.
            </p>
            <h3 className="pp-h3">Other Legal Requirements</h3>
            <ul className="pp-ul dash">
              <li>Comply with a legal obligation</li>
              <li>Protect and defend the rights or property of the company</li>
              <li>Prevent or investigate possible wrongdoing connected to the service</li>
              <li>Protect the personal safety of users or the public</li>
              <li>Protect against legal liability</li>
            </ul>
          </Section>

          <Section id="security" index={10} title="Security of Your Personal Data">
            <p className="pp-p">
              The security of your personal data matters to us, but no method of transmission
              over the internet or electronic storage is 100% secure. While we use commercially
              reasonable measures to protect your data, we can't guarantee its absolute security.
            </p>
          </Section>

          <Section id="children" index={11} title="Children's & Minors' Privacy">
            <p className="pp-p">
              Our service is not directed to, and we do not knowingly collect personal
              information from, anyone under the age of 16. If you're a parent or guardian and
              believe your child has provided us with personal information, please contact us —
              if we become aware of it, we'll take steps to remove that data as soon as
              reasonably possible.
            </p>
            <p className="pp-p muted">
              Where a jurisdiction sets a higher age of consent than 16 and we rely on consent as
              our legal basis, we may require a parent's or guardian's consent before collecting
              or using that user's personal information.
            </p>
          </Section>

          <Section id="links" index={12} title="Links to Other Websites">
            <p className="pp-p">
              Our service may contain links to third-party websites we don't operate. If you
              click through to one, we strongly advise reviewing its privacy policy — we have no
              control over, and assume no responsibility for, the content or practices of any
              third-party site.
            </p>
          </Section>

          <Section id="changes" index={13} title="Changes to This Privacy Policy">
            <p className="pp-p">
              We may update this policy from time to time. We'll notify you by posting the new
              policy on this page, and where the change is material, by email and/or a prominent
              notice on the service prior to it becoming effective. The "Last updated" date at
              the top of this page always reflects the most recent revision.
            </p>
          </Section>

          <Section id="contact" index={14} title="Contact Us">
            <p className="pp-p">
              Questions about this privacy policy? Reach the team directly.
            </p>
            <div className="pp-contact">
              <span className="pp-contact-title">DQD Gaming Hub</span>
              <div className="pp-contact-row">
                <span className="pp-contact-glyph">@</span>
                <a className="pp-link" href="mailto:dqdgaminghub3003@gmail.com">
                  dqdgaminghub3003@gmail.com
                </a>
              </div>
              <div className="pp-contact-row">
                <span className="pp-contact-glyph">#</span>
                <a className="pp-link" href="tel:+917947105311">+91 79471 05311</a>
              </div>
              <div className="pp-contact-row">
                <span className="pp-contact-glyph">W</span>
                <a className="pp-link" href="https://www.dqdgaming.com" target="_blank" rel="external nofollow noopener">
                  www.dqdgaming.com
                </a>
              </div>
              <div className="pp-contact-row">
                <span className="pp-contact-glyph">*</span>
                Kadavanthra Jn, Ernakulam, Cochin-20, opposite KR Bakers, Kerala, India
              </div>
            </div>
          </Section>

          <button className="pp-back-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            ↑ Back to top
          </button>
        </main>
      </div>
    </div>
  );
}