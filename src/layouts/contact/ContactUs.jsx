import { useEffect, useState } from "react";
import { FiArrowRight, FiClock, FiMail, FiMapPin, FiPhone, FiShield, FiTag, FiUserCheck, FiZap } from "react-icons/fi";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import "../../styles/contactUs/contactUs.css";

const contactIcons = {
  phone: FiPhone,
  mail: FiMail,
  location: FiMapPin,
  arrow: FiArrowRight,
  shield: FiShield,
  spark: FiZap,
  clock: FiClock,
  expert: FiUserCheck,
  price: FiTag,
};

const Icon = ({ type }) => {
  const ContactIcon = contactIcons[type] || FiZap;
  return <ContactIcon aria-hidden="true" focusable="false" />;
};

const features = [
  { icon: "clock", title: "Same-day assistance", text: "Quick help for urgent home-service concerns." },
  { icon: "shield", title: "90-day support", text: "Clear post-service support on eligible repairs." },
  { icon: "expert", title: "Verified professionals", text: "Skilled and background-verified experts." },
  { icon: "price", title: "Upfront pricing", text: "Know the service scope before work begins." },
];const newChallenge = () => {
  const first = Math.floor(Math.random() * 7) + 2;
  const second = Math.floor(Math.random() * 6) + 1;
  return { first, second, answer: first + second };
};

const ContactUs = () => {
  const site = useSiteSettings();
  const contactInfo = [
    { icon: "phone", title: "Call our care team", value: site.phoneDisplay, detail: `Every day · ${site.openingHours}`, href: site.phoneHref },
    { icon: "mail", title: "Email support", value: site.email, detail: "Typical reply within 24 hours", href: site.emailHref },
    { icon: "location", title: "Jaipur office", value: site.addressLine1, detail: site.addressLine2 },
  ];
  const [challenge, setChallenge] = useState(newChallenge);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [verified, setVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    if (!verified) return undefined;
    const timer = window.setTimeout(() => {
      setVerified(false);
      setChallenge(newChallenge());
      setCaptchaError("Verification expired. Please verify again.");
    }, 120000);
    return () => window.clearTimeout(timer);
  }, [verified]);

  const startVerification = () => {
    if (verified) return;
    setChallenge(newChallenge());
    setChallengeAnswer("");
    setCaptchaError("");
    setChallengeOpen(true);
  };

  const verifyChallenge = () => {
    if (Number(challengeAnswer) !== challenge.answer) {
      setVerified(false);
      setCaptchaError("That answer is not correct. Please try the new challenge.");
      setChallenge(newChallenge());
      setChallengeAnswer("");
      return;
    }
    setVerified(true);
    setChallengeOpen(false);
    setCaptchaError("");
  };

  const submitContact = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    if (values.get("website")) return;
    if (!verified) {
      setFormMessage("Please complete the human verification before sending your message.");
      startVerification();
      return;
    }
    const subject = `Customer enquiry from ${values.get("name")}`;
    const body = `Name: ${values.get("name")}\nEmail: ${values.get("email")}\nPhone: ${values.get("phone")}\nTopic: ${values.get("topic")}\n\n${values.get("message")}`;
    setFormMessage("Verified. Opening your email app…");
    window.location.href = `${site.emailHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return <main className="contact-us-page">
    <section className="contact-command-hero" aria-labelledby="contact-hero-title">
      <div className="contact-command-hero__copy">
        <span className="contact-command-hero__eyebrow"><Icon type="spark" /> LocalPintu concierge</span>
        <h1 id="contact-hero-title">One place for every <em>service question.</em></h1>
        <p>Get booking guidance, check service availability or speak with our care team about an ongoing visit.</p>
        <div className="contact-command-hero__actions">
          <a className="is-primary" href={site.phoneHref}><Icon type="phone" /><span><small>Talk to a specialist</small>{site.phoneDisplay}</span></a>
          <a href="#contact-form"><Icon type="mail" /><span><small>Prefer writing?</small>Send a message</span></a>
        </div>
        <div className="contact-command-hero__assurance"><span><Icon type="shield" /> Your details stay private</span><span><Icon type="clock" /> Open daily, {site.openingHours}</span></div>
      </div>
      <aside className="contact-concierge" aria-label="Contact LocalPintu support">
        <div className="contact-concierge__head"><div><i /><span><small>Care team status</small><strong>Available now</strong></span></div><span>Jaipur</span></div>
        <div className="contact-concierge__body">
          <a href={site.phoneHref}><span className="contact-concierge__icon"><Icon type="phone" /></span><span><small>Call for immediate help</small><strong>{site.phoneDisplay}</strong></span><Icon type="arrow" /></a>
          <a href={site.emailHref}><span className="contact-concierge__icon"><Icon type="mail" /></span><span><small>Email our support desk</small><strong>{site.email}</strong></span><Icon type="arrow" /></a>
          <div><span className="contact-concierge__icon"><Icon type="location" /></span><span><small>Visit our Jaipur office</small><strong>{site.addressLine1}</strong></span></div>
        </div>
        <div className="contact-concierge__foot"><Icon type="shield" /><p><strong>Human support, not a ticket queue.</strong><span>A real specialist will help you find the right next step.</span></p></div>
      </aside>
    </section>
    <section className="contact-content" aria-label="Contact information and message form">
      <div className="contact-info-column">
        <article className="contact-card contact-details-card contact-fade-up">
          <span className="contact-section-kicker">Choose how to connect</span><h2>We’re ready when you are.</h2><p>Reach the right team directly—no confusing menus or unnecessary waiting.</p>
          <div className="contact-info-list">{contactInfo.map((item) => {
            const content = <><div className="contact-info-item__icon"><Icon type={item.icon} /></div><div className="contact-info-item__copy"><h3>{item.title}</h3><p>{item.value}</p><span>{item.detail}</span></div></>;
            return item.href ? <a className="contact-info-item" href={item.href} key={item.title}>{content}</a> : <div className="contact-info-item" key={item.title}>{content}</div>;
          })}</div>
        </article>
        <article className="contact-card contact-trust-card contact-fade-up"><div className="contact-trust-card__badge"><Icon type="shield" /></div><div><h3>Your request stays private</h3><p>We only use your details to respond to this enquiry.</p></div></article>
      </div>

      <article className="contact-card contact-form-card contact-fade-up" id="contact-form">
        <span className="contact-section-kicker">Message our team</span><h2>How can we help?</h2><p>Share a few details and our care team will guide you.</p>
        <form className="contact-form" onSubmit={submitContact}>
          <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" /></label>
          <div className="contact-form__row"><label><span>Your name</span><input type="text" name="name" placeholder="Full name" autoComplete="name" required /></label><label><span>Email address</span><input type="email" name="email" placeholder="you@example.com" autoComplete="email" required /></label></div>
          <div className="contact-form__row"><label><span>Phone number</span><input type="tel" name="phone" placeholder="10-digit mobile number" inputMode="numeric" pattern="[6-9][0-9]{9}" autoComplete="tel" required /></label><label><span>What is this about?</span><select name="topic" defaultValue=""><option value="" disabled>Select a topic</option><option>New service booking</option><option>Existing booking support</option><option>Service availability</option><option>Payment or refund</option><option>Feedback or partnership</option></select></label></div>
          <label><span>Your message</span><textarea name="message" rows="5" placeholder="Tell us what happened and how we can help…" minLength="10" required /></label>

          <div className={`contact-captcha ${verified ? "is-verified" : ""}`}>
            <button type="button" className="contact-captcha__check" onClick={startVerification} aria-expanded={challengeOpen} aria-pressed={verified}><span>{verified ? "✓" : ""}</span><b>{verified ? "Human verified" : "I’m not a robot"}</b></button>
            <div className="contact-captcha__brand"><Icon type="shield" /><small>LocalPintu<br />Secure</small></div>
            {challengeOpen && !verified && <div className="contact-captcha__challenge"><div><small>Quick verification</small><strong>What is {challenge.first} + {challenge.second}?</strong></div><input value={challengeAnswer} onChange={(event) => setChallengeAnswer(event.target.value.replace(/\D/g, ""))} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); verifyChallenge(); } }} inputMode="numeric" maxLength="2" aria-label="Verification answer" autoFocus /><button type="button" onClick={verifyChallenge}>Verify</button></div>}
          </div>
          {captchaError && <p className="contact-form__status is-error" role="alert">{captchaError}</p>}
          {formMessage && <p className={`contact-form__status ${verified ? "is-success" : "is-error"}`} role="status">{formMessage}</p>}
          <button type="submit" className="contact-submit-button">Send message <Icon type="arrow" /></button>
        </form>
      </article>
    </section>

    <section className="contact-feature-strip" aria-labelledby="contact-promises-title"><div className="contact-feature-intro"><span>Our service promise</span><h2 id="contact-promises-title">Support that stays with you.</h2><p>From your first question to the final service check, LocalPintu keeps every step clear, secure and dependable.</p><a href={site.phoneHref}><Icon type="phone" /> Speak with our care team</a></div><div className="contact-feature-list">{features.map((feature, index) => <article className="contact-feature-card" key={feature.title}><div className="contact-feature-card__icon"><Icon type={feature.icon} /></div><div><small>0{index + 1}</small><h3>{feature.title}</h3><p>{feature.text}</p></div></article>)}</div></section>
  </main>;
};

export default ContactUs;








