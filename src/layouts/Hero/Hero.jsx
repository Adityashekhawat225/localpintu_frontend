import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "../../utils/motionLite";
import { FiArrowRight, FiCalendar, FiCheckCircle, FiMapPin, FiPlay, FiSearch, FiShield, FiStar, FiUserCheck, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import poster from "../../assets/premium/responsive/hero-premium-branded-1200.webp";
import hero640Avif from "../../assets/premium/responsive/hero-premium-branded-640.avif";
import hero960Avif from "../../assets/premium/responsive/hero-premium-branded-960.avif";
import hero1200Avif from "../../assets/premium/responsive/hero-premium-branded-1200.avif";
import hero640Webp from "../../assets/premium/responsive/hero-premium-branded-640.webp";
import hero960Webp from "../../assets/premium/responsive/hero-premium-branded-960.webp";
import applianceCategorySprite from "../../assets/service-catalog/generated/appliance-category-sprite-mini.webp";
import homeServiceCardSprite from "../../assets/service-catalog/generated/home-service-card-sprite-mini.webp";
import homeRepairCategorySprite from "../../assets/service-catalog/generated/home-repair-category-sprite-mini.webp";
import { useLocationPreference } from "../../hooks/useLocationPreference";
import { getApplianceServices, getServiceCategories } from "../../services/api";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import "../../styles/Home/hero.css";
import "../../styles/Home/trendingSubservices.css";
import "../../styles/Home/premiumTrustbar.css";



const steps = [
  { icon: FiSearch, number: "01", title: "Choose your service", text: "Explore verified home-care services and select the plan that fits your exact need." },
  { icon: FiCalendar, number: "02", title: "Pick a convenient time", text: "Confirm your address and schedule a doorstep visit with transparent upfront pricing." },
  { icon: FiUserCheck, number: "03", title: "Relax while we handle it", text: "A trusted professional arrives, completes the work and closes it through secure verification." },
];

const trendingServices = [
  { title: "Washing Machine", sprite: homeServiceCardSprite, spriteIndex: 1, columns: 3, rows: 2, to: "/applications/appliance-repair/washing-machine" },
  { title: "AC Repair", spriteIndex: 5, to: "/applications/appliance-repair?category=ac-repair-services" },
  { title: "Refrigerator", spriteIndex: 0, to: "/applications/appliance-repair?category=refrigerator" },
  { title: "Geyser", spriteIndex: 4, to: "/applications/appliance-repair?category=geyser" },
  { title: "Microwave", spriteIndex: 1, to: "/applications/appliance-repair?category=microwave" },
  { title: "RO Service", spriteIndex: 2, to: "/applications/appliance-repair?category=water-purifier" },
];

const allServiceArtwork = (item) => {
  const value = `${item.slug} ${item.title}`.toLowerCase();
  if (value.includes("washing")) return { sprite: homeServiceCardSprite, index: 1, columns: 3, rows: 2 };
  const applianceIndex = value.includes("refrigerator") ? 0 : value.includes("microwave") ? 1 : value.includes("purifier") ? 2 : value.includes("chimney") ? 3 : value.includes("geyser") ? 4 : value.includes("ac ") || value.startsWith("ac-") || value.includes("air-condition") ? 5 : value.includes("tv") ? 6 : null;
  if (applianceIndex !== null) return { sprite: applianceCategorySprite, index: applianceIndex, columns: 4, rows: 2 };
  const homeIndex = value.includes("electric") ? 0 : value.includes("paint") ? 1 : value.includes("carpenter") ? 2 : value.includes("plumb") ? 3 : null;
  if (homeIndex !== null) return { sprite: homeRepairCategorySprite, index: homeIndex, columns: 4, rows: 1 };
  return null;
};

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const location = useLocationPreference();
  const site = useSiteSettings();
  const [showHow, setShowHow] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [allServicesLoading, setAllServicesLoading] = useState(false);
  const locationLabel = location.selectedArea?.exactAddress || [location.selectedArea?.name, location.selectedPincode?.code, location.selectedCity?.name, location.selectedState?.name].filter(Boolean).join(", ");

  useEffect(() => {
    document.body.classList.toggle("hero-modal-open", showHow || showAllServices);
    const close = (event) => { if (event.key === "Escape") { setShowHow(false); setShowAllServices(false); } };
    window.addEventListener("keydown", close);
    return () => { document.body.classList.remove("hero-modal-open"); window.removeEventListener("keydown", close); };
  }, [showHow, showAllServices]);

  const openAllServices = async () => {
    setShowAllServices(true);
    if (allServices.length) return;
    setAllServicesLoading(true);
    try {
      const [services, categories] = await Promise.all([getApplianceServices(), getServiceCategories()]);
      const allowedGroups = services.filter((item) => item.isActive !== false && ["appliance-repair", "home-repair"].includes(item.slug));
      const groupById = new Map(allowedGroups.map((item) => [item._id, item]));
      setAllServices(categories.filter((category) => category.isActive !== false).map((category) => {
        const serviceId = typeof category.serviceId === "object" ? category.serviceId?._id : category.serviceId;
        const service = groupById.get(serviceId);
        return service && allServiceArtwork(category) ? { ...category, service } : null;
      }).filter(Boolean));
    } catch {
      setAllServices([]);
    } finally {
      setAllServicesLoading(false);
    }
  };

  return (
    <section className="marketplace-hero" aria-labelledby="marketplace-hero-title">
      <div className="marketplace-hero__shell">
        <motion.div className="marketplace-hero__copy" initial={reduceMotion ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <span className="marketplace-hero__eyebrow"><FiShield /> {site.heroEyebrow}</span>
          <h1 id="marketplace-hero-title">{site.heroTitle} <em>{site.heroHighlight}</em></h1>
          <p>{site.heroDescription}</p>

          <div className="marketplace-location" role="status" aria-live="polite" aria-label={`Current service location: ${locationLabel || location.locationError || "Location unavailable"}`}>
            <span><FiMapPin /></span>
            <div><small>{location.loadingLocation ? "Detecting your location" : "Service location"}</small><strong>{locationLabel || location.locationError || "Choose your area to get started"}</strong></div>
            {location.serviceAvailable && <FiCheckCircle />}
          </div>

          <div className="marketplace-service-box">
            <div className="marketplace-service-box__head"><strong>Trending services</strong><button type="button" onClick={openAllServices}>View all <FiArrowRight /></button></div>
            <div className="marketplace-service-grid">
              {trendingServices.map(({ title, sprite = applianceCategorySprite, spriteIndex, columns = 4, rows = 2, to }) => <Link key={title} to={to} title={title}><span className="trending-service-art"><img className="trending-service-sprite" src={sprite} alt="" style={{ "--trending-sprite-column": spriteIndex % columns, "--trending-sprite-row": Math.floor(spriteIndex / columns), "--trending-sprite-columns": columns, "--trending-sprite-rows": rows }} /></span><small>{title}</small></Link>)}
            </div>
          </div>
        </motion.div>

        <motion.div className="marketplace-hero__visual" initial={reduceMotion ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}>
          {site.heroImageUrl ? <img src={site.heroImageUrl} alt={`${site.businessName} home service`} fetchPriority="high" decoding="async" /> : <picture><source type="image/avif" srcSet={`${hero640Avif} 640w, ${hero960Avif} 960w, ${hero1200Avif} 1200w`} sizes="(max-width: 760px) 100vw, 55vw" /><source type="image/webp" srcSet={`${hero640Webp} 640w, ${hero960Webp} 960w, ${poster} 1200w`} sizes="(max-width: 760px) 100vw, 55vw" /><img src={poster} alt="LocalPintu professional servicing an air conditioner in a modern home" title="Verified LocalPintu AC service professional" fetchPriority="high" decoding="async" width="1200" height="900" /></picture>}
          <div className="marketplace-hero__image-shade" />
          <span className="marketplace-hero__image-label">Care that feels professional</span>
          <div className="marketplace-rating"><span><FiStar /></span><div><strong>4.9 / 5</strong><small>Customer-rated service</small></div></div>
          <div className="marketplace-promise"><FiShield /><span><strong>Verified professionals</strong><small>Background checked & skilled</small></span></div>
          <button className="marketplace-how" type="button" onClick={() => setShowHow(true)}><span><FiPlay /></span>How LocalPintu works</button>
        </motion.div>
      </div>
      <div className="marketplace-trustbar"><span><FiShield /> Verified professionals</span><span><FiCheckCircle /> Clear service plans</span><span><FiCalendar /> Convenient time slots</span><span><FiStar /> Service support</span></div>

      <AnimatePresence>
        {showAllServices && <motion.div className="all-services-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="all-services-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAllServices(false); }}>
          <motion.section className="all-services-card" initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}>
            <header><div><span>LOCALPINTU PRIVATE CARE</span><h2 id="all-services-title">Choose your service</h2><p>Explore all appliance and home repair services in one place.</p></div><motion.button className="all-services-close" type="button" onClick={() => setShowAllServices(false)} aria-label="Close all services" whileHover={{ rotate: 90, scale: 1.08 }} whileTap={{ rotate: 90, scale: 0.92 }} transition={{ type: "spring", stiffness: 360, damping: 20 }}><FiX /></motion.button></header>
            {allServicesLoading ? <div className="all-services-loading">Loading services…</div> : <div className="all-services-grid">{allServices.map((item, index) => { const art = allServiceArtwork(item); return <Link key={item._id} to={`/applications/${item.service.slug}?category=${item.slug}`} onClick={() => setShowAllServices(false)}><span className="all-services-image"><img src={art.sprite} alt="" style={{ "--all-column": art.index % art.columns, "--all-row": Math.floor(art.index / art.columns), "--all-columns": art.columns, "--all-rows": art.rows }} /><i>{String(index + 1).padStart(2, "0")}</i></span><strong>{item.title}</strong><small>View services</small><FiArrowRight /></Link>; })}</div>}
          </motion.section>
        </motion.div>}
        {showHow && <motion.div className="how-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="how-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowHow(false); }}>
          <motion.div className="how-modal-card" initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <button className="how-modal-close" type="button" onClick={() => setShowHow(false)} aria-label="Close walkthrough"><FiX /></button>
            <span className="how-kicker">Simple. Transparent. Secure.</span>
            <h2 id="how-title">Premium home care in three easy steps.</h2>
            <p className="how-intro">From finding the right service to secure completion, LocalPintu keeps every step clear and effortless.</p>
            <div className="how-steps">{steps.map(({ icon: Icon, number, title, text }, index) => <motion.article key={number} initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.08 }}><div className="how-step-icon"><Icon /><small>{number}</small></div><h3>{title}</h3><p>{text}</p>{index < steps.length - 1 && <span className="how-step-line" />}</motion.article>)}</div>
            <div className="how-modal-footer"><div><FiShield /><span><strong>Built for peace of mind</strong><small>Verified professionals · Secure completion</small></span></div><Link to="/#home-services" onClick={() => setShowHow(false)}>Find a service <FiArrowRight /></Link></div>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </section>
  );
}
