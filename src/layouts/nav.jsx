import "../styles/Home/nav.css";
import logo from "../assets/images/main_logo.optimized.webp";
import "../styles/mobileApp.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLocationPreference } from "../hooks/useLocationPreference";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { AnimatePresence, motion } from "../utils/animations";
import { FiArrowRight, FiBriefcase, FiChevronDown, FiClock, FiGrid, FiHeadphones, FiHome, FiMapPin, FiMenu, FiPhone, FiSearch, FiShoppingBag, FiUser, FiX } from "react-icons/fi";
import { getApplianceServices, getServiceCategories } from "../services/api";
import { serviceVisual } from "../utils/premiumAssets";

let serviceRequest;
const loadServices = () => {
  if (!serviceRequest) serviceRequest = getApplianceServices().catch((error) => { serviceRequest = null; throw error; });
  return serviceRequest;
};

const SEARCH_SUGGESTIONS = ["Home cleaning near me", "Interior designer", "Home repair service", "Trusted electrician", "Plumbing and water care"];
const SERVICE_PRIORITY = ["home-repair", "interior-designer", "cleaning-services", "appliance-repair", "plumbing-water-care", "electrical-smart-home", "painting-waterproofing"];
const prioritizeServices = (services) => [...services].sort((a, b) => {
  const aRank = SERVICE_PRIORITY.indexOf(a.slug);
  const bRank = SERVICE_PRIORITY.indexOf(b.slug);
  return (aRank < 0 ? 999 : aRank) - (bRank < 0 ? 999 : bRank);
});

const primaryLinks = [
  { to: "/", label: "Home", icon: FiHome, exact: true },
  { to: "/about", label: "About", icon: FiUser },
  { to: "/blogs", label: "Blog", icon: FiBriefcase },
  { to: "/contact", label: "Contact", icon: FiHeadphones },
];

function SearchDirectory({ focused, query, loading, suggestions, onChoose }) {
  if (!focused || query.trim().length < 2) return null;
  return <motion.div className="search-directory" role="listbox" aria-label="Matching LocalPintu services" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
    <header><strong>Services &amp; sub-services</strong><small>{loading ? "Searching" : `${suggestions.length} results`}</small></header>
    {loading ? <div className="search-directory__loading" aria-live="polite" aria-label="Searching"><span><i /><i /><i /></span></div> : suggestions.length ? <div className="search-directory__list">{suggestions.map((item) => <button type="button" role="option" key={item.id} onMouseDown={(event) => event.preventDefault()} onClick={() => onChoose(item)}><img src={item.image} alt="" loading="lazy" /><span><strong>{item.title}</strong><small><b>{item.kind}</b><em>{item.parent || "LocalPintu services"}</em></small></span><FiArrowRight /></button>)}</div> : <div className="search-directory__empty"><FiSearch /><strong>No active service found</strong><span>Try another service name</span></div>}
  </motion.div>;
}

const Nav = () => {
  const route = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeServices, setActiveServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCatalog, setSearchCatalog] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTyping, setSearchTyping] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationDraft, setLocationDraft] = useState(null);
  const profileMenuRef = useRef(null);
  const servicesCloseTimerRef = useRef(null);
  const searchTypingTimerRef = useRef(null);
  const closeLocationAfterDetectionRef = useRef(false);
  const locationRequestObservedRef = useRef(false);
  const { isAuthenticated, customer } = useAuth();
  const { count } = useCart();
  const site = useSiteSettings();
  const { selectedState, selectedCity, selectedArea, selectedPincode, serviceAvailable, loadingLocation, locationError, refreshLocation, saveExactAddress } = useLocationPreference();
  const isServicesEnabled = Boolean(serviceAvailable);
  const locationLabel = selectedArea?.exactAddress || [selectedArea?.name, selectedPincode?.code, selectedCity?.name, selectedState?.name].filter(Boolean).join(", ") || "Choose your location";
  const mobileLocationLabel = selectedArea?.exactAddress || [selectedArea?.name, selectedPincode?.code, selectedCity?.name, selectedState?.name].filter(Boolean).join(", ") || "Set location";
  const initials = useMemo(() => String(customer?.fullName || "My account").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(), [customer?.fullName]);
  const isActive = (item) => item.exact ? route.pathname === item.to : route.pathname.startsWith(item.to);
  const searchSuggestions = useMemo(() => {
    const query = searchQuery.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (query.length < 2) return [];
    const terms = query.split(" ").filter((term) => term.length > 1 && !["near", "me", "service", "services", "in", "for"].includes(term));
    return searchCatalog.filter((item) => item.searchable.includes(query) || terms.some((term) => item.searchable.includes(term))).map((item) => ({ ...item, score: item.title.toLowerCase().startsWith(query) ? 0 : item.title.toLowerCase().includes(query) ? 1 : item.kind === "Service" ? 2 : 3 })).sort((a, b) => a.score - b.score || a.title.localeCompare(b.title)).slice(0, 6);
  }, [searchCatalog, searchQuery]);
  const chooseSuggestion = (item) => { navigate(item.path); setSearchQuery(""); setSearchFocused(false); };
  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim() || SEARCH_SUGGESTIONS[placeholderIndex];
    const normalized = query.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const exact = activeServices.find((service) => {
      const title = String(service.title || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      const slug = String(service.slug || "").toLowerCase().replace(/-/g, " ");
      return normalized === title || normalized === slug;
    });
    navigate(exact ? `/applications/${exact.slug}` : searchSuggestions[0]?.path || "/#home-services");
    setSearchQuery("");
  };
  const closeMenu = () => { setMenuOpen(false); setServicesOpen(false); setProfileOpen(false); };
  const openServicesMenu = () => {
    window.clearTimeout(servicesCloseTimerRef.current);
    setServicesOpen(true);
  };
  const scheduleServicesClose = () => {
    window.clearTimeout(servicesCloseTimerRef.current);
    servicesCloseTimerRef.current = window.setTimeout(() => setServicesOpen(false), 350);
  };

  useEffect(() => {
    const timer = window.setInterval(() => setPlaceholderIndex((index) => (index + 1) % SEARCH_SUGGESTIONS.length), 2800);
    return () => { window.clearInterval(timer); window.clearTimeout(servicesCloseTimerRef.current); window.clearTimeout(searchTypingTimerRef.current); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const closeOutside = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [profileOpen]);

  useEffect(() => {
    const noteCurrentLocationRequest = (event) => {
      if (event.target.closest(".nav-use-location")) {
        closeLocationAfterDetectionRef.current = true;
        locationRequestObservedRef.current = false;
      }
    };
    document.addEventListener("pointerdown", noteCurrentLocationRequest);
    return () => document.removeEventListener("pointerdown", noteCurrentLocationRequest);
  }, []);

  useEffect(() => {
    if (!closeLocationAfterDetectionRef.current) return undefined;
    if (loadingLocation) {
      locationRequestObservedRef.current = true;
      return undefined;
    }
    if (!locationRequestObservedRef.current) return undefined;
    closeLocationAfterDetectionRef.current = false;
    locationRequestObservedRef.current = false;
    if (!serviceAvailable || locationError) return undefined;
    const timer = window.setTimeout(() => setLocationOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [loadingLocation, locationError, serviceAvailable]);


  useEffect(() => {
    document.body.classList.toggle("nav-drawer-open", menuOpen);
    const onKeyDown = (event) => { if (event.key === "Escape") closeMenu(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.classList.remove("nav-drawer-open"); window.removeEventListener("keydown", onKeyDown); };
  }, [menuOpen]);

  useEffect(() => {
    if (!searchFocused || searchCatalog.length) return undefined;
    let alive = true;
    Promise.all([loadServices(), getServiceCategories()]).then(([services, categories]) => {
      if (!alive) return;
      const relation = (value) => typeof value === "object" ? value?._id : value;
      const active = (item) => item?.isActive !== false;
      const activeServices = services.filter(active);
      const serviceById = new Map(services.map((item) => [item._id, item]));
      const entries = activeServices.map((service) => ({ id: `service-${service._id}`, title: service.title, kind: "Service", image: serviceVisual(service), path: `/applications/${service.slug}`, searchable: `${service.title} ${service.slug} ${service.shortDescription || ""}`.toLowerCase().replace(/-/g, " ") }));
      categories.filter(active).forEach((category) => {
        const service = serviceById.get(relation(category.serviceId));
        if (!service?.slug || !category.slug) return;
        entries.push({ id: `sub-service-${category._id}`, title: category.title, kind: "Sub-service", image: serviceVisual(category), parent: service.title, path: `/applications/${service.slug}/${category.slug}`, searchable: `${category.title} ${category.slug} ${category.description || ""} ${service.title}`.toLowerCase().replace(/-/g, " ") });
      });
      setSearchCatalog(entries);
    }).catch(() => {}).finally(() => { if (alive) setSearchLoading(false); });
    return () => { alive = false; };
  }, [searchFocused, searchCatalog.length]);
  useEffect(() => {
    if (!servicesOpen) return undefined;
    let alive = true;
    loadServices().then((services) => { if (alive) setActiveServices(prioritizeServices(services)); }).catch(() => {}).finally(() => { if (alive) setServicesLoading(false); });
    return () => { alive = false; };
  }, [servicesOpen]);

  const serviceMenu = (
    <div className="premium-service-list">
      <div className="service-menu-heading"><span>Home care</span><strong>Popular services</strong></div>
      {isServicesEnabled ? (servicesLoading ? <span className="dropdown-loading">Loading live services...</span> : activeServices.length ? activeServices.slice(0, 7).map((service) => <Link key={service._id} to={`/applications/${service.slug}`} onClick={closeMenu}><span>{service.title}</span><small>Explore plans</small></Link>) : <span className="dropdown-loading">No services available</span>) : <span className="dropdown-loading">Services unavailable in this area</span>}
      <Link className="service-menu-all" to="/#home-services" onClick={closeMenu}>Browse service catalog <FiArrowRight aria-hidden="true" /></Link>
    </div>
  );

  return (
    <motion.header className={`premium-header ${scrolled ? "is-scrolled" : "is-top"}`} initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
      <div className="premium-utility discovery-bar">
        {site.announcementText ? <div className="site-announcement" style={{ padding: "7px 14px", color: "#fff", background: "var(--lp-gradient)", textAlign: "center", fontSize: 10, fontWeight: 750 }}>{site.announcementText}</div> : null}
        <div className="utility-inner discovery-inner">
          <button type="button" className="discovery-location" aria-label={`Current service area: ${locationLabel}`} onClick={() => { setLocationDraft(null); setLocationOpen(true); }}>
            <span className="discovery-location__icon"><FiMapPin /></span>
            <span className="discovery-location__copy"><small>Your service area</small><strong><span className="location-label-desktop">{locationLabel}</span><span className="location-label-mobile">{mobileLocationLabel}</span></strong></span>
            <i className={isServicesEnabled ? "is-available" : "is-unavailable"}><span />{isServicesEnabled ? "Available" : "Check"}</i>
          </button>
          <form className="discovery-search" role="search" onSubmit={submitSearch} onFocus={() => { if (!searchCatalog.length) setSearchLoading(true); }} onInput={(event) => { if (event.target.tagName !== "INPUT") return; window.clearTimeout(searchTypingTimerRef.current); const isQueryReady = event.target.value.trim().length >= 2; setSearchTyping(isQueryReady); if (isQueryReady) searchTypingTimerRef.current = window.setTimeout(() => setSearchTyping(false), 280); }}>
            <AnimatePresence><SearchDirectory focused={searchFocused} query={searchQuery} loading={searchLoading || searchTyping} suggestions={searchSuggestions} onChoose={chooseSuggestion} /></AnimatePresence>
            <FiSearch />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)} placeholder="" aria-label="Search LocalPintu services" autoComplete="off" />{!searchQuery && <span className="discovery-placeholder" key={placeholderIndex}>Search “{SEARCH_SUGGESTIONS[placeholderIndex]}”</span>}
            <button type="submit" aria-label="Search services"><FiArrowRight /></button>
            <AnimatePresence>{searchFocused && searchQuery.trim().length >= 2 && <motion.div className="discovery-suggestions" role="listbox" initial={{ opacity: 0, y: -12, rotateX: -12, scale: .96 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} exit={{ opacity: 0, y: -8, rotateX: -8, scale: .97 }} transition={{ type: "spring", stiffness: 360, damping: 28 }}><div className="discovery-suggestions__head"><span>Services &amp; products</span><small>{searchSuggestions.length} results</small></div>{searchSuggestions.length ? <motion.div className="discovery-suggestions__list" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: .055 } } }}>{searchSuggestions.map((item) => <motion.button variants={{ hidden: { opacity: 0, x: -18, rotateY: -8 }, show: { opacity: 1, x: 0, rotateY: 0 } }} transition={{ duration: .32 }} type="button" role="option" key={item.id} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSuggestion(item)}><span className={`suggestion-mark suggestion-mark--${item.kind.toLowerCase().replace(/\s+/g, "-")}`}>{item.kind === "Product" ? "P" : "S"}</span><span className="suggestion-copy"><strong>{item.title}</strong><small><b>{item.kind}</b>{item.parent ? <em>{item.parent}</em> : null}</small></span>{item.price != null ? <span className="suggestion-price">₹{Number(item.price).toLocaleString("en-IN")}</span> : <FiArrowRight className="suggestion-arrow" />}</motion.button>)}</motion.div> : <div className="discovery-suggestions__empty"><FiSearch /><strong>No match found</strong><span>Try “washing machine”, “cleaning” or “electrician”</span></div>}<button className="discovery-suggestions__all" type="submit">See all results for “{searchQuery}” <FiArrowRight /></button></motion.div>}</AnimatePresence>
          </form>
          <div className="discovery-support"><span><FiClock /><small>Open daily</small><strong>{site.openingHours}</strong></span><a href={site.phoneHref}><FiPhone /><span><small>Need help?</small><strong>{site.phoneDisplay}</strong></span></a></div>
        </div>
      </div>

      <nav className="premium-navbar" aria-label="Primary navigation">
        <Link to="/" className="premium-logo" onClick={closeMenu}><span className="logo-mark"><img src={site.logoUrl || logo} alt={`${site.businessName} logo`} width="376" height="377" decoding="async" onError={(event)=>{event.currentTarget.onerror=null;event.currentTarget.src=logo;}} /></span><span className="premium-logo-copy"><strong>LOCAL<span>PINTU</span></strong><small>Premium home care</small></span></Link>

        <ul className="premium-links">
          {primaryLinks.slice(0, 2).map((item) => <li key={item.to}><Link className={isActive(item) ? "is-active" : ""} to={item.to}>{item.label}{isActive(item) && <motion.i layoutId="desktop-nav-active" />}</Link></li>)}
          <li className="premium-services" onMouseEnter={openServicesMenu} onMouseLeave={scheduleServicesClose}>
            <button className={route.pathname.startsWith("/applications") || route.pathname === "/book-service" ? "is-active" : ""} type="button" aria-expanded={servicesOpen} onClick={() => { window.clearTimeout(servicesCloseTimerRef.current); setServicesOpen((value) => !value); }}>Services <FiChevronDown /></button>
            <AnimatePresence>{servicesOpen && <motion.div className="premium-dropdown" initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 7, scale: 0.985 }} transition={{ duration: 0.2 }}>{serviceMenu}</motion.div>}</AnimatePresence>
          </li>
          {primaryLinks.slice(2).map((item) => <li key={item.to}>{item.requiresService && !isServicesEnabled ? <span className="nav-disabled">{item.label}</span> : <Link className={isActive(item) ? "is-active" : ""} to={item.to}>{item.label}{isActive(item) && <motion.i layoutId="desktop-nav-active" />}</Link>}</li>)}
        </ul>

        <div className="premium-actions">
          <a className="nav-call" href={site.phoneHref} aria-label="Call LocalPintu"><FiPhone /></a>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}><Link to="/cart" className="premium-cart" aria-label={`Cart with ${count} services`}><FiShoppingBag />{count > 0 && <motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }}>{count}</motion.span>}</Link></motion.div>
          {isAuthenticated ? <div className="profile-menu" ref={profileMenuRef}><button type="button" aria-expanded={profileOpen} onClick={() => setProfileOpen((value) => !value)}><span>{initials}</span><FiChevronDown /></button><AnimatePresence>{profileOpen && <motion.div className="profile-dropdown" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}><small>Signed in as</small><strong>{customer?.fullName || "Customer"}</strong><Link to="/profile" onClick={closeMenu}>My profile</Link><Link to="/orders" onClick={closeMenu}>My orders</Link></motion.div>}</AnimatePresence></div> : <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}><Link to="/login" className="premium-cta">Log in <FiArrowRight aria-hidden="true" /></Link></motion.div>}
          <button className="premium-menu-button" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <FiX /> : <FiMenu />}</button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && <><motion.button className="drawer-backdrop" aria-label="Close navigation menu" onClick={closeMenu} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} /><motion.aside className="premium-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 340, damping: 34 }}><div className="drawer-head"><div><span>LOCALPINTU</span><small>Premium home care</small></div><button onClick={closeMenu} aria-label="Close menu"><FiX /></button></div><div className="drawer-location" aria-label={`Current service location: ${locationLabel}`}><FiMapPin /><div><small>Your service location</small><strong>{locationLabel}</strong></div></div><div className="drawer-links">{primaryLinks.slice(0, 2).map((item) => { const Icon = item.icon; return <Link className={isActive(item) ? "is-active" : ""} key={item.to} to={item.to} onClick={closeMenu}><Icon />{item.label}<FiArrowRight aria-hidden="true" /></Link>; })}<button className="drawer-services-toggle" onClick={() => setServicesOpen((value) => !value)}><FiGrid />Services<FiChevronDown className={servicesOpen ? "rotate" : ""} /></button><AnimatePresence>{servicesOpen && <motion.div className="drawer-services" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>{serviceMenu}</motion.div>}</AnimatePresence>{primaryLinks.slice(2).map((item) => { const Icon = item.icon; return item.requiresService && !isServicesEnabled ? null : <Link className={isActive(item) ? "is-active" : ""} key={item.to} to={item.to} onClick={closeMenu}><Icon />{item.label}<FiArrowRight aria-hidden="true" /></Link>; })}</div><div className="drawer-footer">{isAuthenticated ? <><Link to="/profile" onClick={closeMenu}><FiUser /> My profile</Link><Link to="/orders" onClick={closeMenu}><FiBriefcase /> My orders</Link></> : <Link className="drawer-cta" to="/login" onClick={closeMenu}>Log in or register <FiArrowRight aria-hidden="true" /></Link>}<a href={site.phoneHref}><FiPhone /> Need help? Call us</a></div></motion.aside></>}
      </AnimatePresence>
      <AnimatePresence>{locationOpen && <motion.div className="nav-location-backdrop" onClick={() => setLocationOpen(false)} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.section className="nav-location-dialog" role="dialog" aria-modal="true" aria-labelledby="nav-location-title" onClick={(event) => event.stopPropagation()} initial={{opacity:0,y:18,scale:.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:12,scale:.98}}><header><h2 id="nav-location-title">Location</h2><button type="button" aria-label="Close location" onClick={() => setLocationOpen(false)}><FiX /></button></header><textarea className="nav-location-address" aria-label="Exact service address" value={locationDraft ?? locationLabel} onChange={(event) => setLocationDraft(event.target.value)} placeholder="House number, road, colony, city, pincode" /><button type="button" className="nav-save-location" disabled={!(locationDraft ?? locationLabel).trim()} onClick={async() => { try { await saveExactAddress(locationDraft ?? locationLabel); setLocationDraft(null); setLocationOpen(false); } catch { /* error is shown inside the dialog */ } }}>Save Address</button><button type="button" className="nav-use-location" disabled={loadingLocation} onClick={() => { setLocationDraft(null); refreshLocation(); }}><FiMapPin />{loadingLocation?"Getting your precise location...":"Use Current Location"}</button>{locationError?<p>{locationError}</p>:null}</motion.section></motion.div>}</AnimatePresence>
    </motion.header>
  );
};

export default Nav;











