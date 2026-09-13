import { Link } from "react-router-dom";
import {
  FaArrowRight, FaAward, FaCheck, FaClock, FaHeadset, FaQuoteLeft,
  FaShieldAlt, FaStar, FaTools, FaUserCheck, FaUsers,
} from "react-icons/fa";
import { FiArrowUpRight, FiCheckCircle, FiHeart, FiHome, FiMapPin, FiPhone } from "react-icons/fi";
import aboutHero from "../../assets/about-premium/about-team-hero-v2.optimized.webp";
import aboutStory from "../../assets/about-premium/about-service-story-v2.optimized.webp";
import "../../styles/About/about.css";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const stats = [
  { icon: <FaUsers />, value: "25K+", label: "Happy customers" },
  { icon: <FaTools />, value: "100K+", label: "Services completed" },
  { icon: <FaShieldAlt />, value: "90 Days", label: "Service warranty" },
  { icon: <FaStar />, value: "4.8/5", label: "Customer rating" },
];

const values = [
  { icon: <FaUserCheck />, number: "01", title: "People you can trust", text: "Skilled professionals selected to deliver respectful, dependable service in your home." },
  { icon: <FiCheckCircle />, number: "02", title: "Clarity at every step", text: "Straightforward service plans and clear communication before the work begins." },
  { icon: <FiHeart />, number: "03", title: "Care beyond the repair", text: "We focus on lasting solutions, thoughtful support and a home left better than we found it." },
];

const process = [
  { icon: <FiHome />, title: "Choose your service", text: "Find the right care for your home." },
  { icon: <FaClock />, title: "Pick a convenient time", text: "Book around your daily schedule." },
  { icon: <FaTools />, title: "Welcome your expert", text: "A professional handles the job." },
  { icon: <FaAward />, title: "Enjoy peace of mind", text: "Quality work with service support." },
];

const About = () => {
  const site = useSiteSettings();
  return (
  <main className="aboutPage">
    <section className="aboutHero">
      <div className="aboutHero__copy" data-reveal="left">
        <span className="aboutEyebrow"><FiMapPin /> Proudly serving Jaipur</span>
        <h1>Home care built on <em>skill, honesty and trust.</em></h1>
        <p>LocalPintu brings dependable repair and maintenance professionals to your doorstep&mdash;making it simpler to care for the place that matters most.</p>
        <div className="aboutHero__actions">
          <Link className="aboutButton aboutButton--primary" to="/applications">Explore our services <FaArrowRight /></Link>
          <a className="aboutButton aboutButton--secondary" href={site.phoneHref}><FiPhone /> Talk to our team</a>
        </div>
        <div className="aboutHero__proof">
          <span><FaShieldAlt /> Verified professionals</span>
          <span><FaCheck /> Transparent service plans</span>
        </div>
      </div>
      <div className="aboutHero__visual" data-reveal="right">
        <img src={aboutHero} alt="LocalPintu home-service professionals in a Jaipur home" fetchPriority="high" decoding="async" />
        <div className="aboutHero__visualShade" />
        <div className="aboutHero__badge"><span><FaShieldAlt /></span><div><strong>Trusted local care</strong><small>Professional &bull; Respectful &bull; Reliable</small></div></div>
        <div className="aboutHero__caption"><i /><span><small>Our purpose</small>Making every home feel looked after</span></div>
      </div>
    </section>

    <section className="aboutStats" aria-label="LocalPintu highlights">
      {stats.map((stat, index) => <article className="aboutStats__card" key={stat.label} data-reveal="up" style={{ "--reveal-delay": `${index * 70}ms` }}><span>{stat.icon}</span><div><strong>{stat.value}</strong><p>{stat.label}</p></div></article>)}
    </section>

    <section className="aboutStory">
      <div className="aboutStory__visual" data-reveal="left">
        <img src={aboutStory} alt="A LocalPintu professional explaining completed service to homeowners" loading="lazy" decoding="async" />
        <div className="aboutStory__float"><FaHeadset /><span><strong>Human support</strong><small>Here when you need us</small></span></div>
      </div>
      <div className="aboutStory__copy" data-reveal="right">
        <span className="aboutEyebrow">Why LocalPintu exists</span>
        <h2>To make home services feel <em>human again.</em></h2>
        <p>Finding reliable help for everyday home repairs should not feel uncertain. LocalPintu was created to bring skilled professionals, clearer choices and attentive support together in one trusted place.</p>
        <blockquote><FaQuoteLeft /><span>&ldquo;Every booking is an opportunity to earn a customer&apos;s trust&mdash;not just complete a task.&rdquo;</span></blockquote>
        <div className="aboutStory__signature"><strong>Ramswaroop Jangir</strong><span>Founder, LocalPintu</span></div>
      </div>
    </section>

    <section className="aboutValues">
      <div className="aboutSectionHeading" data-reveal="up"><span className="aboutEyebrow">What guides us</span><h2>The standards behind <em>every service.</em></h2><p>Thoughtful principles that shape how we work, communicate and care for your home.</p></div>
      <div className="aboutValues__grid">{values.map((value, index) => <article className="aboutValue" key={value.title} data-reveal="up" style={{ "--reveal-delay": `${index * 80}ms` }}><div className="aboutValue__top"><span>{value.icon}</span><small>{value.number}</small></div><h3>{value.title}</h3><p>{value.text}</p><i /></article>)}</div>
    </section>

    <section className="aboutProcess">
      <div className="aboutProcess__heading" data-reveal="left"><span className="aboutEyebrow">The LocalPintu way</span><h2>From &ldquo;something&apos;s wrong&rdquo; to <em>all sorted.</em></h2><p>A simple, transparent journey designed around your time and peace of mind.</p><Link to="/applications">Book your first service <FiArrowUpRight /></Link></div>
      <div className="aboutProcess__steps">{process.map((step, index) => <article key={step.title} data-reveal="up" style={{ "--reveal-delay": `${index * 65}ms` }}><span>{step.icon}</span><small>0{index + 1}</small><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
    </section>

    <section className="aboutCta" data-reveal="up">
      <div><span>Care for every corner</span><h2>Your home deserves a dependable helping hand.</h2><p>Discover expert services designed for real homes and real life.</p></div>
      <Link to="/applications">Find a service <FaArrowRight /></Link>
    </section>
  </main>
  );
};

export default About;

