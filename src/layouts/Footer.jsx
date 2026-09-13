import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaClock, FaEnvelope, FaFacebookF, FaInstagram, FaLinkedinIn,
  FaMapMarkerAlt, FaPhoneAlt, FaShieldAlt, FaYoutube,
} from "react-icons/fa";
import { FiArrowRight, FiCheck, FiChevronRight, FiHome } from "react-icons/fi";
import mainlogo from "../assets/images/main_logo.optimized.webp";
import { getApplianceServices } from "../services/api";
import { useSiteSettings } from "../context/SiteSettingsContext";
import "../styles/Footer.css";
import "../styles/FooterBrandFix.css";

const exploreLinks = [
  ["About LocalPintu", "/about"],
  ["All services", "/#home-services"],
  ["Expert guides", "/blogs"],
  ["FAQs", "/faqs"],
  ["Contact us", "/contact"],
  ["My account", "/profile"],
  ["My orders", "/orders"],
  ["Privacy Policy", "/privacy-policy"],
  ["Terms & Conditions", "/terms-and-conditions"],
  ["Refund & Cancellation", "/refund-policy"],
];

export default function Footer() {
  const [services, setServices] = useState([]);
  const site = useSiteSettings();
  const socialLinks = [
    ["Facebook", site.facebookUrl, FaFacebookF], ["Instagram", site.instagramUrl, FaInstagram],
    ["YouTube", site.youtubeUrl, FaYoutube], ["LinkedIn", site.linkedinUrl, FaLinkedinIn],
  ].filter(([, url]) => Boolean(url));

  useEffect(() => {
    let alive = true;
    getApplianceServices()
      .then((items) => alive && setServices(items.slice(0, 6)))
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <footer className="footer">
      <div className="footer__glow" aria-hidden="true" />
      <div className="footerShell">
        <section className="footerCta" aria-label="Book a LocalPintu service">
          <div className="footerCta__icon"><FiHome aria-hidden="true" /></div>
          <div className="footerCta__copy">
            <span>Home care, made effortless</span>
            <h2>Something at home needs attention?</h2>
            <p>Choose a trusted service and book a verified professional in minutes.</p>
          </div>
          <Link to="/#home-services" className="footerCta__button">Explore services <FiArrowRight aria-hidden="true" /></Link>
        </section>

        <div className="footerContainer">
          <div className="footerCol company">
            <Link to="/" className="footerBrand">
              <span className="footerBrand__logo"><img src={site.logoUrl || mainlogo} alt={`${site.businessName} logo`} width="376" height="377" loading="lazy" decoding="async" onError={(event)=>{event.currentTarget.onerror=null;event.currentTarget.src=mainlogo;}} /></span>
              <span><strong>LocalPintu</strong><small>Care at your doorstep</small></span>
            </Link>
            <p className="footerDesc">Premium doorstep care backed by transparent service plans and skilled, verified professionals.</p>
            <div className="featureBox">
              <span><FaShieldAlt aria-hidden="true" /></span>
              <div><strong className="featureBox__title">Service you can trust</strong><p><FiCheck aria-hidden="true" /> Clear pricing &amp; secure booking</p></div>
            </div>
            <div className="socials" aria-label="Social media">
              {socialLinks.map(([label, url, SocialIcon]) => <a href={url} key={label} target="_blank" rel="noreferrer" aria-label={label}><SocialIcon /></a>)}
            </div>
          </div>

          <nav className="footerCol" aria-label="Footer navigation">
            <span className="footerCol__eyebrow">Discover</span><h3>Explore</h3>
            {exploreLinks.map(([label, path]) => <Link key={path} to={path}>{label}<FiChevronRight aria-hidden="true" /></Link>)}
          </nav>

          <nav className="footerCol" aria-label="Popular services">
            <span className="footerCol__eyebrow">Customer favourites</span><h3>Popular services</h3>
            {services.length
              ? services.map((service) => <Link key={service._id} to={`/applications/${service.slug}`}>{service.title}<FiChevronRight aria-hidden="true" /></Link>)
              : <div className="footer-services-loading"><i /><i /><i /><i /></div>}
          </nav>

          <div className="footerCol footerContact">
            <span className="footerCol__eyebrow">We are here to help</span><h3>Get in touch</h3>
            <a className="contactItem" href={site.phoneHref}><span><FaPhoneAlt /></span><div><small>Call our care team</small><strong>{site.phoneDisplay}</strong></div></a>
            <a className="contactItem" href={site.emailHref}><span><FaEnvelope /></span><div><small>Email support</small><strong>{site.email}</strong></div></a>
            <div className="contactItem"><span><FaMapMarkerAlt /></span><div><small>Service location</small><strong>{site.fullAddress}</strong></div></div>
            <div className="contactItem"><span><FaClock /></span><div><small>Open every day</small><strong>{site.openingHours}</strong></div></div>
          </div>
        </div>

        <div className="footerBottom">
          <p>© 2026 LocalPintu Repair Services. All rights reserved.</p>
          <div><span><i /> Services operating normally</span><Link to="/privacy-policy">Privacy</Link><Link to="/terms-and-conditions">Terms</Link><Link to="/contact">Help &amp; support</Link></div>
        </div>
      </div>
    </footer>
  );
}

