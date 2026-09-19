import "../styles/luxurySystem.css";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheck, FiClock, FiPlus, FiSearch, FiShield, FiShoppingBag, FiStar, FiTool, FiX } from "react-icons/fi";
import Nav from "../layouts/nav";
import ServicePlanImage from "../components/ServicePlanImage";
import { orderServicePlans } from "../utils/servicePlanOrder";
import Footer from "../layouts/Footer";
import { bySlug, getApplianceServices, getChildServices, getServiceCategories, getServicePlans, getProducts } from "../services/api";
import "../styles/applicationStyle/applicationStyling.css";
import "../styles/applicationStyle/quickPickerClose.css";
import "../styles/applicationStyle/quickCartSummary.css";
import { useLocationPreference } from "../hooks/useLocationPreference";
import LocationPicker from "../components/LocationPicker";
import { useCart } from "../context/CartContext";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { serviceVisual } from "../utils/premiumAssets";
import applianceCategorySprite from "../assets/service-catalog/generated/appliance-category-sprite-v1.png";
import homeRepairCategorySprite from "../assets/service-catalog/generated/home-repair-category-sprite-v1.png";
import washingMachineCategory from "../assets/service-catalog/generated/washing-machine-category-v2.png";

const relationId = (value) => (typeof value === "object" && value ? value._id : value);
const isActive = (value) => value?.isActive !== false;
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const cartItemFor = ({ service, category, child, plan }) => ({ serviceId: service._id, serviceTitle: service.title, categoryId: category._id, categoryTitle: category.title, childId: child._id, childTitle: child.title, planId: plan._id, planTitle: plan.title, price: plan.price, offerPrice: plan.offerPrice, platformFee: plan.platformFee ?? 5, customerPrice: plan.customerPrice, regularCustomerPrice: plan.regularCustomerPrice, visitCharge: plan.visitCharge, image: serviceVisual(plan), slugPath: `/applications/${service.slug}/${category.slug}/${child.slug}/${plan.slug}` });
const categoryArtwork = (category) => {
  const value = `${category?.slug || ""} ${category?.title || ""}`.toLowerCase();
  if (value.includes("washing machine")) return { src: washingMachineCategory, standalone: true };
  const repair = [["electric", 0], ["paint", 1], ["carpenter", 2], ["plumb", 3]].find(([keyword]) => value.includes(keyword));
  if (repair) return { src: homeRepairCategorySprite, index: repair[1], columns: 4, rows: 1 };
  const index = value.includes("refrigerator") || value.includes("fridge") ? 0
    : value.includes("microwave") ? 1
      : value.includes("purifier") || value.includes(" ro ") ? 2
        : value.includes("chimney") ? 3
          : value.includes("geyser") || value.includes("water heater") ? 4
            : value.includes(" ac ") || value.startsWith("ac ") || value.includes("air condition") ? 5
              : value.includes("tv") || value.includes("television") || value.includes("desktop") || value.includes("laptop") ? 6 : null;
  return index === null ? null : { src: applianceCategorySprite, index, columns: 4, rows: 2 };
};
function ApplianceArtwork({ category }) {
  const artwork = categoryArtwork(category);
  if (!artwork) return <span className="appliance-artwork appliance-artwork--fallback" aria-hidden="true"><img src={serviceVisual(category)} alt="" /></span>;
  if (artwork.standalone) return <span className="appliance-artwork appliance-artwork--fallback" aria-hidden="true"><img src={artwork.src} alt="" /></span>;
  return <span className="appliance-artwork" aria-hidden="true"><img src={artwork.src} alt="" style={{ "--sprite-column": artwork.index % artwork.columns, "--sprite-row": Math.floor(artwork.index / artwork.columns), "--sprite-columns": artwork.columns, "--sprite-rows": artwork.rows }} /></span>;
}

function PageShell({ children }) {
  const { serviceAvailable, locationError, loadingLocation } = useLocationPreference();
  const serviceBlocked = !loadingLocation && serviceAvailable !== true;
  return <><Nav /><main className="service-flow-page">{serviceBlocked ? <section className="application-services-section"><StatusMessage type="error">{locationError || "Choose an active service location to view available services."}</StatusMessage><LocationPicker /></section> : children}</main><Footer /></>;
}

function StatusMessage({ type = "default", children }) {
  return <div className={`application-status application-status--${type}`}><FiShield /> <span>{children}</span></div>;
}

function SearchInput({ value, onChange, placeholder, count }) {
  return <div className="application-toolbar"><label className="application-search-row"><FiSearch /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />{value && <button type="button" onClick={() => onChange("")}>Clear</button>}</label><span>{count} {count === 1 ? "option" : "options"}</span></div>;
}

function FlowHeader({ eyebrow, title, text, backTo, backLabel, level }) {
  const steps = ["Category", "Service", "Plan"];
  const visual = serviceVisual({ title, description: text });
  return <header className="application-flow-heading" data-reveal="up">
    <div className="application-flow-heading__content">
      <div className="application-flow-heading__crumb"><Link to="/applications">Home services</Link><span>/</span><strong>{eyebrow}</strong></div>
      <div className="application-flow-heading__copy">
        <span className="application-flow-heading__eyebrow"><FiTool /> LocalPintu expert care</span>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="application-flow-heading__proof">
          <span><FiShield /><b>Verified experts</b></span>
          <span><FiStar /><b>Quality assured</b></span>
          <span><FiClock /><b>On-time service</b></span>
        </div>
      </div>
      <div className="application-flow-heading__foot">
        {backTo ? <Link className="application-back-link" to={backTo}><FiArrowLeft /> {backLabel}</Link> : <span />}
        <div className="application-progress" aria-label={`Step ${level} of 3`}>{steps.map((step, index) => <span className={index + 1 <= level ? "is-active" : ""} key={step}><i>{index + 1 <= level ? <FiCheck /> : index + 1}</i><small>{step}</small></span>)}</div>
      </div>
    </div>
    <div className="application-flow-heading__media">
      <img src={visual} alt={`${title} professional service`} fetchPriority="high" decoding="async" />
      <div className="application-flow-heading__media-shade" />
      <span className="application-flow-heading__media-label"><FiShield /> Trusted doorstep service</span>
      <div className="application-flow-heading__media-card"><strong>4.9</strong><span><FiStar /> Customer rating</span></div>
    </div>
  </header>;
}

function ServiceCard({ to, title, text, image, index, label = "Explore service" }) {
  return <article className="application-flow-card" data-reveal="up" style={{ "--reveal-delay": `${index * 55}ms` }}>
    <Link className="application-flow-image" to={to} aria-label={`${label}: ${title}`}><img src={serviceVisual({ title, description: text, image }, index)} alt={title} loading="lazy" decoding="async" /><span>{String(index + 1).padStart(2, "0")}</span><i>Professional care</i></Link>
    <div className="application-flow-card__content"><div className="application-card-meta"><FiShield /> Verified service</div><h2><Link to={to}>{title}</Link></h2><p>{text || "Professional doorstep service delivered with care and expertise."}</p><Link className="application-view-button" to={to}>{label}<span><FiArrowRight /></span></Link></div>
  </article>;
}

function TrustStrip() {
  return <aside className="application-trust-strip"><span><FiShield /><strong>Verified professionals</strong></span><span><FiStar /><strong>Quality-first service</strong></span><span><FiClock /><strong>Convenient scheduling</strong></span></aside>;
}

function QuickCartSummary({ cart, inline = false, hiddenOnMobile = false }) {
  const itemCount = cart.items.reduce((total, item) => total + Math.max(1, Number(item.quantity || 1)), 0);
  const categoryCount = new Set(cart.items.map((item) => item.categoryId).filter(Boolean)).size;
  if (!itemCount) return null;
  const summary = <aside key={`${itemCount}-${categoryCount}`} className={`quick-cart-summary${inline ? " quick-cart-summary--inline" : ""}${hiddenOnMobile ? " quick-cart-summary--mobile-hidden" : ""}`} aria-live={inline ? "polite" : "off"}><span className="quick-cart-summary__icon"><FiShoppingBag /><i>{itemCount}</i></span><div className="quick-cart-summary__copy"><strong>{itemCount} {itemCount === 1 ? "item" : "items"} added</strong><span>From {categoryCount || 1} {categoryCount === 1 ? "category" : "categories"}</span></div><Link to="/cart">View cart <FiArrowRight /></Link></aside>;
  return inline ? summary : createPortal(summary, document.body);
}

function useServiceData(load) {
  const [data, setData] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState("");
  useEffect(() => { let alive = true; async function run() { setLoading(true); setError(""); try { const result = await load(); if (alive) setData(result); } catch { if (alive) setError("Unable to load this service information right now."); } finally { if (alive) setLoading(false); } } run(); return () => { alive = false; }; }, [load]);
  return { data, loading, error };
}

function useRecommendedProducts(childId, categoryId) {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    let alive = true;
    if (!childId && !categoryId) return () => { alive = false; };
    async function loadProducts() {
      try {
        const direct = childId ? await getProducts({ active: true, recommended: true, childServiceId: childId }) : [];
        const items = direct.length ? direct : await getProducts({ active: true, recommended: true, categoryId });
        if (alive) setProducts(items);
      } catch {
        if (alive) setProducts([]);
      }
    }
    loadProducts();
    return () => { alive = false; };
  }, [childId, categoryId]);
  return products;
}
function FlowState({ loading, error, missing, missingText, children }) {
  if (loading) return <div className="application-flow-skeleton">{Array.from({ length: 3 }, (_, index) => <i key={index} />)}</div>;
  if (error) return <StatusMessage type="error">{error}</StatusMessage>;
  if (missing) return <StatusMessage type="error">{missingText}</StatusMessage>;
  return children;
}

export function ServiceCategoriesPage() {
  const { serviceSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCategorySlug = searchParams.get("category") || "";
  const cart = useCart();
  const [categoryId, setCategoryId] = useState("");
  const [childId, setChildId] = useState("");
  const [showPicker, setShowPicker] = useState(!requestedCategorySlug);
  const load = useMemo(() => async () => {
    const [services, categories, childServices, plans] = await Promise.all([
      getApplianceServices(), getServiceCategories(), getChildServices(), getServicePlans(),
    ]);
    return { services, categories, childServices, plans };
  }, []);
  const { data, loading, error } = useServiceData(load);
  const service = data ? bySlug(data.services, serviceSlug) : null;
  const categories = useMemo(() => data && service
    ? data.categories.filter((item) => isActive(item) && relationId(item.serviceId) === service._id)
    : [], [data, service]);
  const selectedCategory = requestedCategorySlug
    ? categories.find((item) => item.slug === requestedCategorySlug) || null
    : categories.find((item) => item._id === categoryId) || categories[0] || null;
  const children = useMemo(() => data && selectedCategory
    ? data.childServices.filter((item) => isActive(item) && relationId(item.categoryId) === selectedCategory._id)
    : [], [data, selectedCategory]);
  const selectedChild = children.find((item) => item._id === childId) || children[0] || null;
  const plans = useMemo(() => {
    if (!data || !selectedChild) return [];
    return orderServicePlans(data.plans.filter((item) => isActive(item) && relationId(item.childServiceId) === selectedChild._id));
  }, [data, selectedChild]);
  const recommendedProducts = useRecommendedProducts(selectedChild?._id, selectedCategory?._id);
  const chooseCategory = (id) => {
    const category = categories.find((item) => item._id === id);
    setCategoryId(id);
    setChildId("");
    if (category) setSearchParams({ category: category.slug }, { replace: true });
    setShowPicker(false);
  };
  return <PageShell><section className="application-services-section quick-booking-page">
    <FlowHeader eyebrow="Book in one page" title={service?.title || "Home service"} text={service?.shortDescription || "Choose what you need and add a plan without opening multiple pages."} backTo="/applications" backLabel="All services" level={3} />
    {showPicker && service && <div className="quick-picker-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPicker(false); }}><section className="quick-picker-modal" role="dialog" aria-modal="true" aria-labelledby="quick-picker-title"><header><div><span>LOCALPINTU CONCIERGE</span><h2 id="quick-picker-title">Choose your appliance</h2><p>Select one to see exact services and transparent plans.</p></div><button className="quick-picker-close" type="button" onClick={() => setShowPicker(false)} aria-label="Close service picker"><FiX /></button></header><div className="quick-picker-grid">{categories.map((category, index) => <button type="button" onClick={() => chooseCategory(category._id)} key={category._id}><span><ApplianceArtwork category={category} /><i>{String(index + 1).padStart(2, "0")}</i></span><strong>{category.title}</strong><small>View services</small><FiArrowRight /></button>)}</div><footer><FiShield /><span><strong>Verified professionals</strong><small>Clear pricing · Doorstep convenience</small></span></footer></section></div>}
    <FlowState loading={loading} error={error} missing={!service} missingText="This home service was not found.">{service && <>
      <section className="quick-booking-shell">
        <header className="quick-booking-intro"><div><span>FAST BOOKING</span><h2>What do you need help with?</h2><p>Select a category, choose the exact service and add a plan—all here.</p></div><div className="quick-booking-intro__actions"><button type="button" onClick={() => setShowPicker(true)}>Browse appliances</button>{cart.count > 0 && <Link className="quick-cart-pill" to="/cart"><FiShoppingBag /><span>{cart.count} in cart</span><FiArrowRight /></Link>}</div></header>
        <div className="quick-step quick-appliance-stage"><div className="quick-step-title"><i>1</i><div><strong>Selected appliance</strong><small>{categories.length} appliance categories available</small></div></div>{selectedCategory && <article className="quick-appliance-showcase"><div className="quick-appliance-showcase__media"><ApplianceArtwork category={selectedCategory} /><span>LocalPintu expert care</span></div><div className="quick-appliance-showcase__copy"><small>YOUR APPLIANCE</small><h3>{selectedCategory.title}</h3><p>{selectedCategory.description || `Professional ${selectedCategory.title.toLowerCase()} service at your doorstep.`}</p><div><span><FiShield /> Verified experts</span><span><FiClock /> Convenient slots</span></div></div><button type="button" onClick={() => setShowPicker(true)}>Change appliance <FiArrowRight /></button></article>}</div>
        <div className="quick-step"><div className="quick-step-title"><i>2</i><div><strong>Select exact service</strong><small>{children.length} options</small></div></div>{children.length ? <div className="quick-child-grid">{children.map((child, index) => <button type="button" className={selectedChild?._id === child._id ? "is-active" : ""} onClick={() => setChildId(child._id)} key={child._id}><img src={serviceVisual(child, index)} alt="" /><span><strong>{child.title}</strong><small>{child.description || "Professional doorstep care"}</small></span><FiCheck /></button>)}</div> : <StatusMessage>No services are available in this category.</StatusMessage>}</div>
        {selectedChild && <><aside className="quick-selection-strip"><span><FiCheck /></span><div><small>Your selection</small><strong>{selectedCategory?.title} <i>/</i> {selectedChild.title}</strong></div><button type="button" onClick={() => setChildId("")}>Change</button></aside><div className="quick-step quick-plans"><div className="quick-step-title"><i>3</i><div><strong>Choose a service plan</strong><small>Clear scope and transparent pricing</small></div></div>{plans.length ? <div className="quick-plan-list">{plans.map((plan, index) => { const servicePrice = plan.offerPrice ?? plan.price; const regularPrice = plan.price; const discounted = Number(regularPrice) > Number(servicePrice); const added = cart.items.some((item) => item.planId === plan._id); return <article key={plan._id} className={added ? "is-added" : ""}><div className="quick-plan-visual"><ServicePlanImage plan={plan} index={index} alt={plan.title} loading={index < 4 ? "eager" : "lazy"} /><span>{index === 0 ? "Popular" : "Expert care"}</span></div><div className="quick-plan-copy"><span>{index === 0 ? "MOST BOOKED" : "SERVICE PLAN"}</span><h3>{plan.title}</h3><p>{plan.description || "Professional service with transparent pricing."}</p><div><small><FiShield /> Verified professional</small><small><FiClock /> Doorstep visit</small>{Number(plan.visitCharge) > 0 && <small><FiCheck /> Visit charge {money(plan.visitCharge)}</small>}</div></div><div className="quick-plan-action">{discounted && <em>Save {Math.round((1 - Number(servicePrice) / Number(regularPrice)) * 100)}%</em>}<del>{discounted ? money(regularPrice) : ""}</del><strong>{money(servicePrice)}</strong><button type="button" onClick={() => cart.addItem(cartItemFor({ service, category: selectedCategory, child: selectedChild, plan }))}>{added ? <FiCheck /> : <FiPlus />}{added ? "Added" : "Add"}</button>{added && <Link className="quick-plan-view-cart" to="/cart">View cart <FiArrowRight /></Link>}</div></article>; })}</div> : <StatusMessage>No service plans are available.</StatusMessage>}<QuickCartSummary cart={cart} inline /></div></>}
      </section>
      <RecommendedProducts products={recommendedProducts} />
      <TrustStrip />
    </>}</FlowState>
    <QuickCartSummary cart={cart} hiddenOnMobile={Boolean(selectedChild && service && !loading && !error)} />
  </section></PageShell>;
}

export function ChildServicesPage() {
  const { serviceSlug, categorySlug } = useParams(); const [query, setQuery] = useState("");
  const load = useMemo(() => async () => { const [services, categories, childServices] = await Promise.all([getApplianceServices(), getServiceCategories(), getChildServices()]); return { services, categories, childServices }; }, []);
  const { data, loading, error } = useServiceData(load); const service = data ? bySlug(data.services, serviceSlug) : null; const category = data && service ? data.categories.find((item) => isActive(item) && item.slug === categorySlug && relationId(item.serviceId) === service._id) : null;
  const childServices = useMemo(() => { if (!data || !category) return []; const needle = query.toLowerCase(); return data.childServices.filter((item) => isActive(item) && relationId(item.categoryId) === category._id).filter((item) => !needle || [item.title, item.slug, item.description].some((value) => String(value || "").toLowerCase().includes(needle))); }, [category, data, query]);
  if (data && service && !category) return <Navigate to={`/applications/${service.slug}`} replace />;
  return <PageShell><section className="application-services-section"><FlowHeader eyebrow="Choose exact service" title={category?.title || "Home service"} text={category?.description || "Tell us exactly what kind of help your home needs."} backTo={service ? `/applications/${service.slug}` : "/applications"} backLabel="Service categories" level={2} /><FlowState loading={loading} error={error} missing={!category} missingText="This service category was not found.">{category && <><SearchInput value={query} onChange={setQuery} placeholder="Search available services" count={childServices.length} />{childServices.length ? <div className="application-services-grid">{childServices.map((child, index) => <ServiceCard key={child._id} index={index} to={`/applications/${service.slug}/${category.slug}/${child.slug}`} title={child.title} text={child.description} image={child.image} label="See service plans" />)}</div> : <StatusMessage>No matching services are available.</StatusMessage>}<TrustStrip /></>}</FlowState></section></PageShell>;
}

export function ServicePlansPage() {
  const { serviceSlug, categorySlug, childSlug } = useParams(); const cart = useCart(); const [query, setQuery] = useState("");
  const load = useMemo(() => async () => { const [services, categories, childServices, plans] = await Promise.all([getApplianceServices(), getServiceCategories(), getChildServices(), getServicePlans()]); return { services, categories, childServices, plans }; }, []);
  const { data, loading, error } = useServiceData(load); const service = data ? bySlug(data.services, serviceSlug) : null; const category = data && service ? data.categories.find((item) => isActive(item) && item.slug === categorySlug && relationId(item.serviceId) === service._id) : null; const child = data && category ? data.childServices.find((item) => isActive(item) && item.slug === childSlug && relationId(item.categoryId) === category._id) : null;
  const plans = useMemo(() => { if (!data || !child) return []; const needle = query.toLowerCase(); return orderServicePlans(data.plans.filter((item) => isActive(item) && relationId(item.childServiceId) === child._id)).filter((item) => !needle || [item.title, item.slug, item.description].some((value) => String(value || "").toLowerCase().includes(needle))); }, [child, data, query]);
  const recommendedProducts = useRecommendedProducts(child?._id, category?._id);
  if (data && service && (!category || !child)) return <Navigate to={`/applications/${service.slug}`} replace />;
  return <PageShell><section className="application-services-section"><FlowHeader eyebrow="Compare service plans" title={child?.title || "Service plans"} text={child?.description || "Choose the right plan with clear, upfront pricing."} backTo={service && category ? `/applications/${service.slug}/${category.slug}` : "/applications"} backLabel="Available services" level={3} /><FlowState loading={loading} error={error} missing={!child} missingText="This service was not found.">{child && <><SearchInput value={query} onChange={setQuery} placeholder="Search service plans" count={plans.length} />{plans.length ? <div className="application-services-grid application-plans-grid">{plans.map((plan, index) => { const servicePrice = plan.offerPrice ?? plan.price; const regularPrice = plan.price; const discounted = Number(regularPrice) > Number(servicePrice); return <article className="application-plan-card" key={plan._id} data-reveal="up" style={{ "--reveal-delay": `${index * 55}ms` }}><Link className="application-flow-image" to={`/applications/${service.slug}/${category.slug}/${child.slug}/${plan.slug}`}><ServicePlanImage plan={plan} index={index} alt={plan.title} loading={index < 4 ? "eager" : "lazy"} decoding="async" /><span>{index === 0 ? "Popular" : "Plan"}</span></Link><div className="application-plan-card__content"><div className="application-plan-card__price"><div><small>Starts from</small><strong>{money(servicePrice)}</strong></div>{discounted && <div className="application-plan-card__saving"><del>{money(regularPrice)}</del><small>Save {Math.round((1 - Number(servicePrice) / Number(regularPrice)) * 100)}%</small></div>}</div><h2>{plan.title}</h2><p>{plan.description}</p><ul><li><FiCheck /> Verified professional</li><li><FiCheck /> Transparent pricing</li><li><FiCheck /> Doorstep service</li></ul><div className="application-plan-card__actions"><button onClick={() => cart.addItem(cartItemFor({ service, category, child, plan }))}><FiShoppingBag /> Add to cart</button><Link to={`/applications/${service.slug}/${category.slug}/${child.slug}/${plan.slug}`}>Details <FiArrowRight /></Link></div></div></article>; })}</div> : <StatusMessage>No matching service plans are available.</StatusMessage>}<RecommendedProducts products={recommendedProducts} /><TrustStrip /></>}</FlowState></section></PageShell>;
}

function RecommendedProducts({ products }) {
  const cart = useCart();
  const site = useSiteSettings();
  if (!products?.length) return null;
  return <section className="recommended-products" data-no-reveal>
    <header><div><span>Selected for this service</span><h2>Recommended <em>Products</em></h2><p>Compatible parts commonly required for this repair. Final fitment is verified by your technician.</p></div><small>{products.length} compatible parts</small></header>
    <div className="recommended-products__grid">{products.slice(0, 9).map((product) => { const selected = cart.productItems.some((item) => item.productId === product._id); return <article className={selected ? "is-added" : ""} key={product._id}>
      <div className="recommended-products__body"><small>{product.brand || "Compatible part"}</small><h3>{product.name}</h3><div className="recommended-products__price"><strong>{money(product.price)}</strong>{product.mrp > product.price && <del>{money(product.mrp)}</del>}</div><div className="recommended-products__meta"><span><FiShield /> {product.warrantyDays || 0} day warranty</span><span><FiCheck /> Fitment verified</span></div></div>
      <div className="recommended-products__image"><img src={product.image} alt={product.imageAlt || product.name} loading="lazy" decoding="async" /></div>
      <button type="button" className="recommended-products__add" onClick={() => cart.addProduct({ productId: product._id, name: product.name, slug: product.slug, image: product.image, price: product.price, mrp: product.mrp, warrantyDays: product.warrantyDays })} aria-pressed={selected}>{selected ? <FiCheck /> : <FiPlus />}{selected ? "Added" : "Add"}</button>
    </article>; })}</div>
    <footer><span><FiShield /> No part is installed without your approval</span><a href={site.phoneHref}>Need help choosing? <strong>Call an expert</strong> <FiArrowRight /></a></footer>
  </section>;
}
export function ServicePlanDetailsPage() {
  const { serviceSlug, categorySlug, childSlug, planSlug } = useParams(); const cart = useCart();
  const load = useMemo(() => async () => { const [services, categories, childServices, plans] = await Promise.all([getApplianceServices(), getServiceCategories(), getChildServices(), getServicePlans()]); return { services, categories, childServices, plans }; }, []);
  const { data, loading, error } = useServiceData(load); const service = data ? bySlug(data.services, serviceSlug) : null; const category = data && service ? data.categories.find((item) => isActive(item) && item.slug === categorySlug && relationId(item.serviceId) === service._id) : null; const child = data && category ? data.childServices.find((item) => isActive(item) && item.slug === childSlug && relationId(item.categoryId) === category._id) : null; const plan = data && child ? data.plans.find((item) => isActive(item) && item.slug === planSlug && relationId(item.childServiceId) === child._id && isActive(item)) : null;
  const recommendedProducts = useRecommendedProducts(child?._id, category?._id);
  if (data && service && (!category || !child || !plan)) return <Navigate to={`/applications/${service.slug}`} replace />;
  return <PageShell><section className="application-services-section"><FlowHeader eyebrow="Plan details" title={plan?.title || "Service plan"} text={plan?.description || "Review everything included in this service plan."} backTo={service && category && child ? `/applications/${service.slug}/${category.slug}/${child.slug}` : "/applications"} backLabel="Service plans" level={3} /><FlowState loading={loading} error={error} missing={!plan} missingText="This service plan was not found.">{plan && <><article className="application-plan-detail"><ServicePlanImage plan={plan} alt={plan.title} loading="lazy" decoding="async" /><div><span>{service.title} / {category.title} / {child.title}</span><h2>{plan.title}</h2><p>{plan.description}</p><dl><div><dt>Service price</dt><dd>{money(plan.offerPrice ?? plan.price)}</dd></div><div><dt>Regular service price</dt><dd>{money(plan.price)}</dd></div><div><dt>Visit charge</dt><dd>{money(plan.visitCharge)}</dd></div></dl><button onClick={() => cart.addItem(cartItemFor({ service, category, child, plan }))}><FiShoppingBag /> Add to cart</button><Link to="/cart">View cart <FiArrowRight /></Link></div></article><RecommendedProducts products={recommendedProducts} /></>}</FlowState></section></PageShell>;
}




















