import "../../styles/Home/HomeRepair.css";
import "../../styles/Home/HomeRepairArtwork.css";
import homeServiceSprite from "../../assets/service-catalog/generated/home-service-action-sprite-v2.png";
import { FiArrowUpRight, FiCheck, FiDroplet, FiGrid, FiHome, FiShield, FiTool, FiWind, FiZap } from "react-icons/fi";
import { Link } from "react-router-dom";
import { motion } from "../../utils/motionLite";

const services = [
  { title: "AC Repair & Service", badge: "Cooling care", icon: FiWind, tone: "indigo", to: "/applications", description: "Precision AC diagnostics, deep servicing and cooling-performance care for modern homes.", points: ["Expert inspection", "Clean service process"] },
  { title: "Washing Machine", badge: "Laundry care", icon: FiGrid, tone: "violet", to: "/applications/appliance-repair/washing-machine", description: "Professional repair and preventive care for front-load, top-load and semi-automatic machines.", points: ["All major types", "Doorstep diagnosis"] },
  { title: "Refrigerator", badge: "Freshness care", icon: FiHome, tone: "emerald", to: "/applications/appliance-repair/refrigerator", description: "Reliable cooling, compressor and maintenance support that protects food and energy efficiency.", points: ["Cooling diagnosis", "Careful handling"] },
  { title: "Electrical Service", badge: "Home safety", icon: FiZap, tone: "amber", to: "/applications", description: "Safe, professional electrical inspection and repair for essential home systems and fittings.", points: ["Safety-first work", "Professional tools"] },
  { title: "RO Water Purifier", badge: "Pure water", icon: FiDroplet, tone: "cyan", to: "/applications", description: "Installation, filter care and performance checks for clean, dependable drinking water.", points: ["Hygienic service", "System check"] },
  { title: "Kitchen Chimney", badge: "Kitchen care", icon: FiTool, tone: "rose", to: "/applications", description: "Premium chimney inspection, cleaning and installation for a fresher, more efficient kitchen.", points: ["Motor inspection", "Deep cleaning"] },
];

export default function HomeRepair() {
  return (
    <section className="home-repair" id="home-repair">
      <div className="home-repair-glow home-repair-glow-one" /><div className="home-repair-glow home-repair-glow-two" />
      <div className="home-repair-shell">
        <header className="home-repair-header" data-reveal="up">
          <div><span className="home-repair-kicker"><FiShield /> Complete home care</span><h2>Expert repairs. <em>Elevated service.</em></h2><p>From everyday appliance care to essential home systems, discover trained professionals for a more comfortable home.</p></div>
          <Link className="home-repair-view-all" to="/applications">Explore all services <FiArrowUpRight /></Link>
        </header>

        <div className="home-repair-grid">
          {services.map((service, index) => { const Icon = service.icon; return (
            <motion.article className="home-repair-card" data-tone={service.tone} key={service.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: 0.45, delay: (index % 3) * 0.07, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -8 }}>
              <Link className="home-repair-image" to={service.to}><span className="home-repair-artwork" aria-hidden="true"><img src={homeServiceSprite} alt="" style={{ "--home-sprite-column": index % 3, "--home-sprite-row": Math.floor(index / 3) }} /></span><span className="home-repair-number">0{index + 1}</span><span className="home-repair-image-badge">Verified care</span><div className="home-repair-image-shade" /></Link>
              <div className="home-repair-content">
                <div className="home-repair-card-top"><span className="home-repair-icon"><Icon /></span><span className="home-repair-badge">{service.badge}</span></div>
                <h3>{service.title}</h3><p>{service.description}</p>
                <div className="home-repair-points">{service.points.map((point) => <span key={point}><FiCheck />{point}</span>)}</div>
                <Link className="home-repair-btn" to={service.to}><span>View service</span><FiArrowUpRight /></Link>
              </div>
            </motion.article>
          ); })}
        </div>

        <div className="home-repair-trust" data-reveal="up"><span><FiShield /></span><div><strong>Not sure which service you need?</strong><p>Explore the complete service catalog and choose the right care for your home.</p></div><Link to="/applications">Browse service catalog <FiArrowUpRight /></Link></div>
      </div>
    </section>
  );
}
