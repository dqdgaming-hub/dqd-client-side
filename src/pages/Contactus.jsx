import { useState } from "react";
import {
  CalendarDays, CircleCheck, Clock, ExternalLink, Globe, Info, Mail, MapPin, MessageSquare, Phone, Send, ShoppingBag, Store,
} from "lucide-react";
import { infoCss, PageHero, Rise } from "./infoPage";

const css = `
.cu-wide { grid-column: 1 / -1; }
.cu-hours-note { margin: 4px 0 0; color: #8f89b0; font-size: 14px; }
.cu-form-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
@media (max-width: 640px) { .cu-form-foot .ip-btn { width: 100%; } }
`;

// Sourced from the DQD Gaming Hub listing
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
    <div className="ip">
      <style>{infoCss + css}</style>

      <PageHero
        eyebrow="DQD Gaming Hub"
        title="Contact"
        accent="Us"
        sub="DQD Gaming Hub in Kadavanthra Junction, Kochi, Ernakulam — one of the leading Game Dealers in the area. Reach out for address, pricing, or product availability."
      >
        <span className="ip-chip"><CalendarDays size={16} aria-hidden="true" /> Est. Feb 2025</span>
        <span className="ip-chip alt"><MapPin size={16} aria-hidden="true" /> Kadavanthra, Kochi</span>
      </PageHero>

      <div className="ip-body ip-grid">
        <Rise className="ip-card cu-wide">
          <h2 className="ip-card-label"><Info size={18} aria-hidden="true" /> Location & Overview</h2>
          <p className="ip-p">
            Established in 2025, DQD Gaming Hub in Kadavanthra Junction, Kochi, Ernakulam is a
            top player in the Game Dealers category. This well-known establishment serves
            customers both local and from other parts of Kochi, with a strong focus on customer
            satisfaction alongside its products and services.
          </p>
          <p className="ip-p">
            Positioned at a prominent location in Kadavanthra Junction, the store is easy to
            reach with various modes of transport readily available nearby.
          </p>
          <hr className="ip-hr" />
          <div className="ip-row-label" style={{ marginBottom: 10 }}>Categories</div>
          <div className="ip-tags">
            {CATEGORIES.map((c) => <span className="ip-tag" key={c}><Store size={15} aria-hidden="true" />{c}</span>)}
          </div>
        </Rise>

        <Rise index={1} className="ip-card">
          <h2 className="ip-card-label"><Phone size={18} aria-hidden="true" /> Get In Touch</h2>
          <div className="ip-rows">
            <div className="ip-row">
              <span className="ip-ico"><MapPin size={18} aria-hidden="true" /></span>
              <div className="ip-row-body">
                <span className="ip-row-label">Address</span>
                <span className="ip-row-value">Kadavanthra Jn, Ernakulam, Cochin-20, Opposite KR Bakers, Kerala, India</span>
              </div>
            </div>
            <div className="ip-row">
              <span className="ip-ico"><Phone size={18} aria-hidden="true" /></span>
              <div className="ip-row-body">
                <span className="ip-row-label">Phone</span>
                <a className="ip-row-value" href="tel:+917947105311">+91 79471 05311</a>
              </div>
            </div>
            <div className="ip-row">
              <span className="ip-ico"><Mail size={18} aria-hidden="true" /></span>
              <div className="ip-row-body">
                <span className="ip-row-label">Email</span>
                <a className="ip-row-value" href="mailto:dqdgaminghub3003@gmail.com">dqdgaminghub3003@gmail.com</a>
              </div>
            </div>
            <div className="ip-row">
              <span className="ip-ico"><Globe size={18} aria-hidden="true" /></span>
              <div className="ip-row-body">
                <span className="ip-row-label">Website</span>
                <a className="ip-row-value" href="https://www.dqdgaming.com" target="_blank" rel="noopener noreferrer">www.dqdgaming.com</a>
              </div>
            </div>
          </div>
        </Rise>

        <Rise index={2} className="ip-card">
          <h2 className="ip-card-label"><ShoppingBag size={18} aria-hidden="true" /> Products & Services</h2>
          <p className="ip-p">
            A wide range of gaming products and services, with staff on hand to answer questions
            and help you find what you need.
          </p>
          <hr className="ip-hr" />
          <div className="ip-row-label" style={{ marginBottom: 10 }}>Payment Methods Accepted</div>
          <div className="ip-tags">
            {PAYMENT_METHODS.map((p) => <span className="ip-tag" key={p}>{p}</span>)}
          </div>
        </Rise>

        <Rise index={3} className="ip-card">
          <h2 className="ip-card-label"><Clock size={18} aria-hidden="true" /> Store Hours</h2>
          <div className="ip-rows">
            <div className="ip-row">
              <span className="ip-ico"><CalendarDays size={18} aria-hidden="true" /></span>
              <div className="ip-row-body">
                <span className="ip-row-label">Mon – Sat</span>
                <span className="ip-row-value">10:00 AM – 9:00 PM</span>
              </div>
            </div>
            <div className="ip-row">
              <span className="ip-ico"><CalendarDays size={18} aria-hidden="true" /></span>
              <div className="ip-row-body">
                <span className="ip-row-label">Sunday</span>
                <span className="ip-row-value">11:00 AM – 6:00 PM</span>
              </div>
            </div>
          </div>
          <p className="cu-hours-note">Please confirm hours by phone before visiting on public holidays.</p>
        </Rise>

        <Rise index={4} className="ip-card flush">
          <iframe
            className="ip-map"
            title="DQD Gaming Hub location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Kadavanthra+Junction,+Kochi,+Ernakulam&output=embed"
          />
          <div className="ip-map-cap">
            <span>Kadavanthra Junction, Kochi, Ernakulam</span>
            <a
              href="https://www.google.com/maps/search/?api=1&query=DQD+Gaming+Hub+Kadavanthra+Junction+Kochi"
              target="_blank" rel="noopener noreferrer"
            >
              Open in Google Maps <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </Rise>

        <Rise className="ip-card cu-wide">
          <h2 className="ip-card-label"><MessageSquare size={18} aria-hidden="true" /> Send A Message</h2>
          <form className="ip-form" onSubmit={onSubmit}>
            <div className="ip-field">
              <label htmlFor="cu-name">Name</label>
              <input className="ip-input" id="cu-name" name="name" value={form.name} onChange={onChange} placeholder="Your name" autoComplete="name" required />
            </div>
            <div className="ip-field">
              <label htmlFor="cu-email">Email</label>
              <input className="ip-input" id="cu-email" type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" autoComplete="email" required />
            </div>
            <div className="ip-field full">
              <label htmlFor="cu-message">Message</label>
              <textarea className="ip-input" id="cu-message" name="message" value={form.message} onChange={onChange} placeholder="What can we help with?" required />
            </div>
            <div className="ip-field full cu-form-foot">
              <button className="ip-btn" type="submit" disabled={sending}>
                <Send size={16} aria-hidden="true" /> {sending ? "Sending…" : "Send Message"}
              </button>
              {sent && (
                <div className="ip-note ok" role="status">
                  <CircleCheck size={18} aria-hidden="true" /> Message sent — we'll get back to you soon.
                </div>
              )}
            </div>
          </form>
        </Rise>
      </div>
    </div>
  );
}
