import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "../../utils/motionLite";
import { FiArrowRight, FiCheck, FiClock, FiShield, FiStar, FiTool, FiUsers } from "react-icons/fi";
import { getApplianceServices } from "../../services/api";
import { serviceVisual } from "../../utils/premiumAssets";
import { cardMotion, imageMotion, sectionReveal } from "../../utils/animations";
import "../../styles/Home/Services.css";

const serviceBadges = ["Most booked", "Expert care", "Same-day slots", "Service warranty"];
const trustItems = [
  { icon: <FiShield />, title: "Service warranty", text: "Support after every repair" },
  { icon: <FiUsers />, title: "Verified experts", text: "Skilled local professionals" },
  { icon: <FiClock />, title: "Convenient visits", text: "Slots designed around you" },
  { icon: <FiCheck />, title: "Clear service plans", text: "Know before you book" },
];

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getApplianceServices()
      .then((items) => alive && setServices(items))
      .catch(() => {
        if (alive) setError("Unable to load services right now.");
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return (
    <motion.section id="home-services" className="services" {...sectionReveal} layout aria-labelledby="home-services-title">
      <div className="services__glow" aria-hidden="true" />
      <div className="services__container">
        <motion.header className="services-heading" {...sectionReveal}>
          <div>
            <span className="services-heading__eyebrow"><FiTool /> Premium home services</span>
            <h2 id="home-services-title">Expert care for every <em>hard-working appliance.</em></h2>
            <p>From everyday fixes to essential maintenance, discover dependable doorstep services delivered by skilled professionals.</p>
          </div>
          <div className="services-heading__aside">
            <strong>{services.length || "—"}<small>Live service categories</small></strong>
            <Link to="/#home-services">Explore all services <FiArrowRight /></Link>
          </div>
        </motion.header>

        {loading && <div className="services__skeletons" aria-label="Loading services">{Array.from({ length: 6 }, (_, index) => <div className="services__skeleton" key={index}><i /><span /><span /><small /></div>)}</div>}
        {!loading && error && <div className="home-service-status home-service-status--error"><FiShield /><strong>Services are taking a moment</strong><p>{error}</p></div>}
        {!loading && !error && services.length === 0 && <div className="home-service-status"><FiTool /><strong>No services available yet</strong><p>Please check again shortly.</p></div>}

        {!loading && !error && services.length > 0 && (
          <div className="services-grid">
            {services.map((item, index) => (
              <motion.article key={item._id || item.slug} className="service-card" {...cardMotion}>
                <Link className="service-card__visual" to={`/applications/${item.slug}`}>
                  <motion.img src={serviceVisual(item, index)} alt={item.title} loading="lazy" decoding="async" {...imageMotion} />
                  <span className="service-card__shade" />
                  <span className="service-badge">{serviceBadges[index % serviceBadges.length]}</span>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                </Link>
                <div className="service-card__content">
                  <div className="service-card__meta"><span><FiStar /> Professional care</span><i>Doorstep</i></div>
                  <h3><Link to={`/applications/${item.slug}`}>{item.title}</Link></h3>
                  <p>{item.shortDescription || "Professional repair and maintenance service for your home."}</p>
                  <Link className="service-card__action" to={`/applications/${item.slug}`}>View service options <span><FiArrowRight /></span></Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="service-features">
          {trustItems.map((feature, index) => <article key={feature.title} data-reveal="up" style={{ "--reveal-delay": `${index * 70}ms` }}><span>{feature.icon}</span><div><h3>{feature.title}</h3><p>{feature.text}</p></div></article>)}
        </div>
      </div>
    </motion.section>
  );
};

export default Services;
