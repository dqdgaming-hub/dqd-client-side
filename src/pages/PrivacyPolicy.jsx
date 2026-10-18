import { useEffect, useRef, useState } from "react";
import { ArrowUp, CalendarDays, Globe, List, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { infoCss, PageHero, Rise } from "./infoPage";

const css = `
.pp-shell { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: clamp(18px, 3vw, 32px); align-items: start; }
.pp-toc { position: sticky; top: 96px; max-height: calc(100vh - 120px); overflow-y: auto; padding: 18px 14px; }
.pp-toc .ip-card-label { margin: 0 6px 12px; font-size: 13px; }
.pp-toc ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.pp-toc button { width: 100%; display: flex; align-items: center; gap: 10px; min-height: 38px; padding: 6px 10px; border: 0; border-radius: 10px; cursor: pointer;
  text-align: left; background: transparent; color: #a9a3c8; font: 600 15px/1.25 'Rajdhani', sans-serif; letter-spacing: .03em; transition: color .2s, background .2s; }
.pp-toc button:hover { color: #fff; background: rgba(255,255,255,.04); }
.pp-toc button i { width: 6px; height: 6px; flex: none; border-radius: 50%; background: rgba(255,255,255,.2); transition: background .2s, box-shadow .2s; }
.pp-toc button.active { color: #fff; background: color-mix(in srgb, var(--acc) 10%, transparent); }
.pp-toc button.active i { background: var(--acc); box-shadow: 0 0 8px var(--acc); }
.pp-content { display: grid; gap: 16px; min-width: 0; }
.pp-section { scroll-margin-top: 96px; }
.pp-h2 { display: flex; align-items: baseline; gap: 12px; margin: 0 0 14px; font: 900 clamp(17px, 2.4vw, 21px)/1.3 'Orbitron', sans-serif; letter-spacing: .03em; color: #fff; }
.pp-h2 span { flex: none; font: 700 13px/1 'Share Tech Mono', monospace; letter-spacing: .1em; color: var(--acc); }
.pp-h3 { margin: 18px 0 8px; font: 700 13px/1.3 'Share Tech Mono', monospace; letter-spacing: .16em; text-transform: uppercase; color: var(--acc); }
.pp-p { margin: 0 0 12px; color: #c3bedd; font: 400 15.5px/1.7 'Inter', sans-serif; }
.pp-p:last-child { margin-bottom: 0; }
.pp-p.muted { color: #9b95bb; }
.pp-strong { color: #fff; font-weight: 600; }
.pp-ul { margin: 0 0 12px; padding: 0; list-style: none; display: grid; gap: 8px; }
.pp-ul li { position: relative; padding-left: 20px; color: #c3bedd; font: 400 15.5px/1.6 'Inter', sans-serif; }
.pp-ul li::before { content: ""; position: absolute; left: 2px; top: .7em; width: 8px; height: 2px; border-radius: 2px; background: var(--acc); }
.pp-def-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 10px; }
.pp-def, .pp-cookie-row { padding: 14px 16px; border-radius: 14px; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07); }
.pp-def-term, .pp-cookie-name { display: block; margin-bottom: 6px; font: 700 14px/1.3 'Orbitron', sans-serif; letter-spacing: .03em; color: #fff; }
.pp-def-body, .pp-cookie-purpose { margin: 0; color: #a9a3c8; font: 400 14.5px/1.6 'Inter', sans-serif; }
.pp-table-wrap { display: grid; gap: 10px; }
.pp-cookie-meta { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-bottom: 6px; color: #9b95bb; font-size: 14px; }
.pp-cookie-meta b { color: var(--acc); font-weight: 600; }
.pp-note { margin: 0 0 12px; padding: 12px 14px; border-radius: 12px; border-left: 3px solid var(--acc); color: #d6d1ee;
  background: color-mix(in srgb, var(--acc) 7%, transparent); font: 400 15px/1.6 'Inter', sans-serif; }
.pp-contact { display: grid; gap: 12px; padding: 16px; border-radius: 14px; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07); }
.pp-contact-title { font: 900 15px/1.2 'Orbitron', sans-serif; color: #fff; }
.pp-contact .ip-row { align-items: center; color: #d6d1ee; font-size: 15.5px; }
.pp-contact .ip-ico { width: 36px; height: 36px; }
.pp-link { overflow-wrap: anywhere; }
.pp-back-top { justify-self: start; }
@media (max-width: 900px) {
  .pp-shell { grid-template-columns: 1fr; }
  .pp-toc { position: static; max-height: none; }
  .pp-toc ul { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
  .pp-toc ul::-webkit-scrollbar { display: none; }
  .pp-toc li { flex: none; }
  .pp-toc button { width: auto; white-space: nowrap; border: 1px solid rgba(255,255,255,.1); border-radius: 999px; padding: 6px 14px; }
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


function Section({ id, index, title, children }) {
  return (
    <Rise as="section" id={id} className="ip-card pp-section">
      <h2 className="pp-h2">
        <span>{String(index).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </Rise>
  );
}

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
    <div className="ip">
      <style>{infoCss + css}</style>

      <PageHero
        eyebrow="DQD Gaming Hub"
        title="Privacy"
        accent="Policy"
        sub="How we collect, use, and protect your information when you use our service — and the choices you have about it."
      >
        <span className="ip-chip"><CalendarDays size={16} aria-hidden="true" /> Last Updated · Sep 12, 2026</span>
        <span className="ip-chip alt"><MapPin size={16} aria-hidden="true" /> Kerala, India</span>
      </PageHero>

      <div className="ip-body">
        <div className="pp-shell">
          <nav className="ip-card pp-toc" aria-label="On this page">
            <h2 className="ip-card-label"><List size={16} aria-hidden="true" /> On This Page</h2>
            <ul>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button type="button" className={active === s.id ? "active" : ""} onClick={() => scrollTo(s.id)}>
                    <i aria-hidden="true" />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <main className="pp-content">
          <div className="ip-card">
          <h2 className="ip-card-label"><ShieldCheck size={18} aria-hidden="true" /> Overview</h2>
          <p className="pp-p muted">
            This Privacy Policy describes our policies and procedures on the collection, use,
            and disclosure of your information when you use the service, and tells you about
            your privacy rights and how the law protects you. We use your personal data to
            provide and improve the service, and we collect, use, and disclose it only where we
            have a valid legal basis to do so, including your consent where consent is required.
          </p>
          </div>

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
              <div className="ip-row">
                <span className="ip-ico"><Mail size={16} aria-hidden="true" /></span>
                <a className="pp-link" href="mailto:dqdgaminghub3003@gmail.com">
                  dqdgaminghub3003@gmail.com
                </a>
              </div>
              <div className="ip-row">
                <span className="ip-ico"><Phone size={16} aria-hidden="true" /></span>
                <a className="pp-link" href="tel:+917947105311">+91 79471 05311</a>
              </div>
              <div className="ip-row">
                <span className="ip-ico"><Globe size={16} aria-hidden="true" /></span>
                <a className="pp-link" href="https://www.dqdgaming.com" target="_blank" rel="external nofollow noopener">
                  www.dqdgaming.com
                </a>
              </div>
              <div className="ip-row">
                <span className="ip-ico"><MapPin size={16} aria-hidden="true" /></span>
                Kadavanthra Jn, Ernakulam, Cochin-20, opposite KR Bakers, Kerala, India
              </div>
            </div>
          </Section>

          <button type="button" className="ip-btn ghost pp-back-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <ArrowUp size={16} aria-hidden="true" /> Back to top
          </button>
          </main>
        </div>
      </div>
    </div>
  );
}
