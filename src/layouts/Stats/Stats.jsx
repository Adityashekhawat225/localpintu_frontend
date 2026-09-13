import { useEffect, useState } from "react";
import { FaBlog, FaCheckCircle, FaLayerGroup, FaTools } from "react-icons/fa";
import { FiArrowUpRight, FiCheck, FiShield } from "react-icons/fi";
import { getApplianceServices, getBlogs, getServicePlans } from "../../services/api";
import "../../styles/Home/Stats.css";

const cardMeta = [
  { icon: <FaTools />, title: "Active Services", desc: "Professional services currently available in the LocalPintu catalogue.", accent: "blue" },
  { icon: <FaLayerGroup />, title: "Service Plans", desc: "Flexible service options created for different homes and budgets.", accent: "violet" },
  { icon: <FaCheckCircle />, title: "Upfront Prices", desc: "Published plans with clear, customer-visible pricing before booking.", accent: "emerald" },
  { icon: <FaBlog />, title: "Expert Guides", desc: "Practical home-care advice written to help your appliances last longer.", accent: "amber" },
];

export default function Stats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([getApplianceServices(), getServicePlans(), getBlogs()])
      .then(([services, plans, blogs]) => {
        if (!alive) return;
        const values = [
          services.status === "fulfilled" ? services.value.length : null,
          plans.status === "fulfilled" ? plans.value.length : null,
          plans.status === "fulfilled" ? plans.value.filter((item) => Number(item.offerPrice) >= 0).length : null,
          blogs.status === "fulfilled" ? blogs.value.length : null,
        ];
        setStats(cardMeta.map((item, index) => ({ ...item, number: values[index] })).filter((item) => item.number !== null));
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return (
    <section className="stats-section" aria-labelledby="marketplace-title">
      <div className="stats-section__orb stats-section__orb--one" aria-hidden="true" />
      <div className="stats-section__orb stats-section__orb--two" aria-hidden="true" />
      <div className="stats-shell">
        <div className="stats-heading" data-reveal="up">
          <span><FiShield aria-hidden="true" /> Live LocalPintu marketplace</span>
          <h2 id="marketplace-title">Everything your home needs, <em>in one trusted place.</em></h2>
          <p>One thoughtfully curated platform for expert repairs, transparent service plans and practical home-care guidance.</p>
        </div>

        <div className="stats-container">
          {loading
            ? Array.from({ length: 4 }, (_, index) => <div className="stats-card stats-card--skeleton" key={index} />)
            : stats.map((item, index) => (
              <article
                key={item.title}
                className={`stats-card stats-card--${item.accent}`}
                data-reveal="up"
                style={{ "--reveal-delay": `${index * 90}ms` }}
              >
                <div className="stats-card__top">
                  <div className="stats-icon">{item.icon}</div>
                  <span className="stats-card__live"><i /> Live</span>
                </div>
                <div className="stats-card__value"><strong>{item.number}</strong><FiArrowUpRight aria-hidden="true" /></div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className="stats-card__foot"><FiCheck aria-hidden="true" /> Verified from our live catalogue</div>
              </article>
            ))}
        </div>

        <div className="stats-trust" data-reveal="up">
          <div><FiShield aria-hidden="true" /><span><strong>Quality-first marketplace</strong>Every listing is managed through LocalPintu</span></div>
          <span className="stats-trust__divider" aria-hidden="true" />
          <p>No hidden surprises. Just dependable home care, whenever you need it.</p>
        </div>
      </div>
    </section>
  );
}
