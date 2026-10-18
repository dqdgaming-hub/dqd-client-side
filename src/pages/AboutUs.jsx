import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  Bus, CalendarDays, Gamepad2, Globe, Heart, MapPin, Monitor, Quote, Swords, Tag, Trophy, Wallet, Zap,
} from "lucide-react";
import { infoCss, PageHero, Rise, SecHead } from "./infoPage";

const css = `
.ab-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.ab-stat { text-align: center; padding: 22px 12px; }
.ab-stat b { display: block; font: 900 clamp(26px, 4vw, 38px)/1 'Orbitron', sans-serif; color: var(--tone); text-shadow: 0 0 18px color-mix(in srgb, var(--tone) 45%, transparent); }
.ab-stat span { display: block; margin-top: 10px; font: 700 11.5px/1.2 'Share Tech Mono', monospace; letter-spacing: .18em; text-transform: uppercase; color: #a9a3c8; }
.ab-story { display: grid; grid-template-columns: 1.1fr 1fr; gap: 18px; align-items: start; }
.ab-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.ab-brand img { width: 64px; height: 64px; flex: none; object-fit: contain; border-radius: 50%; padding: 6px; background: #0a0a18;
  border: 1px solid color-mix(in srgb, var(--acc) 45%, transparent); box-shadow: 0 0 24px color-mix(in srgb, var(--acc) 25%, transparent); }
.ab-brand strong { display: block; font: 900 18px/1.2 'Orbitron', sans-serif; color: #fff; }
.ab-brand small { display: block; margin-top: 4px; font: 700 11.5px/1.2 'Share Tech Mono', monospace; letter-spacing: .2em; text-transform: uppercase; color: var(--acc); }
.ab-feats { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr)); gap: 12px; }
.ab-feat { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 16px; font-weight: 700; font-size: 16.5px; color: #fff;
  background: linear-gradient(165deg, #12112a, #0a0a18); border: 1px solid rgba(255,255,255,.08); transition: border-color .25s, transform .25s; }
.ab-feat:hover { border-color: color-mix(in srgb, var(--acc) 40%, transparent); transform: translateY(-2px); }
.ab-mission { text-align: center; padding: clamp(26px, 5vw, 48px) clamp(18px, 5vw, 56px); }
.ab-mission > svg { color: var(--acc2); margin-bottom: 12px; }
.ab-quote { margin: 0 0 16px; font: 700 clamp(17px, 2.6vw, 24px)/1.45 'Orbitron', sans-serif; color: #fff; }
.ab-quote em { font-style: normal; color: var(--acc); }
.ab-mission .ip-p { max-width: 720px; margin-inline: auto; }
.ab-pay { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; }
.ab-foot { margin: 8px 0 0; text-align: center; font: 700 11.5px/1.6 'Share Tech Mono', monospace; letter-spacing: .14em; text-transform: uppercase; color: #6f6990; }
.ab-foot span { color: var(--acc); }
@media (max-width: 860px) { .ab-story { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .ab-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
`;

// Counts up from 0 once the number scrolls into view.
function Counter({ to, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const steps = 60;
    const increment = to / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, (duration * 1000) / steps);
    return () => clearInterval(timer);
  }, [inView, to, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const STATS = [
  { value: 2025, suffix: "", label: "Est. Year", tone: "#00f5ff" },
  { value: 500, suffix: "+", label: "Happy Gamers", tone: "#c084fc" },
  { value: 100, suffix: "%", label: "Satisfaction", tone: "#ffd60a" },
  { value: 5, suffix: "/5", label: "Star Rated", tone: "#ff2d78" },
];

const FACTS = [
  { icon: MapPin, label: "Location", value: "Kadavanthra Junction, Kochi, Ernakulam" },
  { icon: CalendarDays, label: "Established", value: "February 2025" },
  { icon: Tag, label: "Category", value: "Game Dealer · Console Dealer · Gaming Hub" },
  { icon: Bus, label: "Access", value: "Easily reachable via multiple modes of transport" },
];

const FEATURES = [
  { icon: Gamepad2, text: "Game Dealer" },
  { icon: Monitor, text: "Console Dealer" },
  { icon: Trophy, text: "Gaming Hub" },
  { icon: Zap, text: "Premium Setup" },
  { icon: Globe, text: "Local & Online" },
  { icon: Heart, text: "Customer First" },
];

const PAYMENTS = ["Cash", "UPI", "Paytm", "PhonePe", "Amazon Pay"];

export default function AboutUs() {
  return (
    <div className="ip">
      <style>{infoCss + css}</style>

      <PageHero
        eyebrow="Kadavanthra · Kochi"
        title="DQD"
        accent="Gaming Hub"
        sub="Kochi's premier gaming destination — a one-stop hub for game enthusiasts, console seekers, and competitive players. Where every session is a quest and every win rewarded."
      >
        <span className="ip-chip"><Swords size={16} aria-hidden="true" /> Dominate · Quest · Destroy</span>
        <span className="ip-chip alt"><MapPin size={16} aria-hidden="true" /> Kadavanthra Junction</span>
      </PageHero>

      <div className="ip-body">
        <div className="ab-stats">
          {STATS.map((s, i) => (
            <Rise key={s.label} index={i} className="ip-card ab-stat" style={{ "--tone": s.tone }}>
              <b><Counter to={s.value} suffix={s.suffix} /></b>
              <span>{s.label}</span>
            </Rise>
          ))}
        </div>

        <section className="ip-sec">
          <SecHead eyebrow="Our Story" title="Born in 2025," accent="Built for Gamers" />
          <div className="ab-story">
            <Rise className="ip-card">
              <div className="ab-brand">
                <img src="/logo.png" alt="DQD Gaming Hub logo" />
                <div>
                  <strong>DQD Gaming Hub</strong>
                  <small>Dominate · Quest · Destroy</small>
                </div>
              </div>
              <p className="ip-p">
                Established in February 2025, DQD Gaming Hub emerged at Kadavanthra Junction with a singular mission — to build Kochi's most dedicated gaming ecosystem. From day one, we've been more than a store: we're a community hub where players discover, compete, and connect.
              </p>
              <p className="ip-p">
                We serve customers from across Kochi and Ernakulam, offering a curated range of gaming products and consoles backed by expert advice. Every team member here is a gamer at heart, ensuring you always get honest, informed recommendations.
              </p>
            </Rise>
            <Rise index={1} className="ip-card">
              <div className="ip-rows">
                {FACTS.map(({ icon: Icon, label, value }) => (
                  <div className="ip-row" key={label}>
                    <span className="ip-ico"><Icon size={18} aria-hidden="true" /></span>
                    <div className="ip-row-body">
                      <span className="ip-row-label">{label}</span>
                      <span className="ip-row-value">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Rise>
          </div>
        </section>

        <section className="ip-sec">
          <SecHead eyebrow="Find Us" title="We're at" accent="Kadavanthra Junction" />
          <Rise className="ip-card flush">
            <iframe
              className="ip-map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.587219367345!2d76.29699597487094!3d9.968259590135487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b087306fc6f7f17%3A0x39dba6f2646508c!2sDQD%20gaming%20hub!5e0!3m2!1sen!2sin!4v1782751280000!5m2!1sen!2sin"
              title="DQD Gaming Hub Location"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </Rise>
        </section>

        <section className="ip-sec">
          <SecHead
            eyebrow="What We Offer"
            title="Everything a"
            accent="Gamer Needs"
            sub="From the latest console drops to expert gaming advice — we've got your setup covered."
          />
          <div className="ab-feats">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <Rise key={text} index={i} className="ab-feat">
                <span className="ip-ico"><Icon size={18} aria-hidden="true" /></span>
                {text}
              </Rise>
            ))}
          </div>
        </section>

        <Rise className="ip-sec ip-card ab-mission">
          <Quote size={30} aria-hidden="true" />
          <p className="ab-quote">Customer satisfaction is as important as <em>the products we carry.</em></p>
          <p className="ip-p">
            Our team is dedicated, courteous, and always ready to assist. Whether you're a seasoned pro or a first-time buyer, we take the time to understand your needs and match you with the perfect gaming solution. Our goal is to grow alongside our community — with more products, more services, and a bigger gaming family.
          </p>
        </Rise>

        <Rise className="ip-card ab-pay">
          <div>
            <div className="ip-eyebrow"><i aria-hidden="true" />Accepted Payments</div>
            <div className="ip-card-label" style={{ margin: 0 }}><Wallet size={18} aria-hidden="true" /> Pay your way — we accept it all</div>
          </div>
          <div className="ip-tags">
            {PAYMENTS.map((p) => <span className="ip-tag" key={p}>{p}</span>)}
          </div>
        </Rise>

        <p className="ab-foot">© 2025 <span>DQD Gaming Hub</span> · Kadavanthra Junction, Kochi · All rights reserved</p>
      </div>
    </div>
  );
}
