import "../styles/luxurySystem.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowUpRight, FiCalendar, FiCheckCircle, FiClock, FiClipboard, FiCreditCard, FiMapPin, FiRefreshCw, FiSearch, FiShield } from "react-icons/fi";
import { Link } from "react-router-dom";
import Nav from "../layouts/nav";
import Footer from "../layouts/Footer";
import { EmptyState, ErrorState } from "../components/AsyncStates";
import { getMyBookings } from "../services/api";
import { serviceVisual } from "../utils/premiumAssets";
import "../styles/commerce.css";

const CACHE_KEY = "localpintu-orders-v1";
const readCache = () => {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
    return cached && Date.now() - cached.savedAt < 300000 && Array.isArray(cached.items) ? cached.items : [];
  } catch { return []; }
};
const formatDate = (value) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const statusClass = (status) => `status-${String(status || "pending").toLowerCase().replaceAll(" ", "-")}`;
const statusFilters = ["All", "Active", "Completed", "Cancelled"];
const isActive = (status) => !["Completed", "Cancelled"].includes(status);
const paymentCopy = (booking) => {
  if (booking.paymentStatus === "Paid") return { label: "Paid online", detail: booking.paymentMethod || "Online payment", tone: "paid" };
  if (booking.paymentStatus === "Cash Due") return { label: "Pay at visit", detail: "Cash on Service", tone: "cash" };
  if (booking.paymentStatus === "Pending" || booking.status === "Payment Pending") return { label: "Payment processing", detail: "We are confirming your payment", tone: "pending" };
  return { label: booking.paymentStatus || "Payment details", detail: booking.paymentMethod || "Payment method pending", tone: "pending" };
};

function OrdersSkeleton() {
  return <section className="orders-premium-grid" aria-label="Loading bookings">{Array.from({ length: 3 }, (_, index) => <article className="order-premium-card order-premium-skeleton" key={index}><i /><div><b /><b /><b /></div></article>)}</section>;
}

export default function OrdersPage() {
  const [initialItems] = useState(() => readCache());
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(!initialItems.length);
  const [refreshing, setRefreshing] = useState(Boolean(initialItems.length));
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const nextItems = await getMyBookings();
      setItems(nextItems);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ items: nextItems, savedAt: Date.now() }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

useEffect(() => {
    const frame = window.requestAnimationFrame(() => load({ quiet: initialItems.length > 0 }));
    return () => window.cancelAnimationFrame(frame);
  }, [initialItems.length, load]);

  const counts = useMemo(() => ({
    total: items.length,
    active: items.filter((item) => isActive(item.status)).length,
    completed: items.filter((item) => item.status === "Completed").length,
  }), [items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesFilter = filter === "All" || (filter === "Active" ? isActive(item.status) : item.status === filter);
      const matchesQuery = !needle || [item.bookingNumber, item.status, item.applianceServiceId?.title, item.serviceCategoryId?.title, item.childServiceId?.title, item.servicePlanId?.title].some((value) => String(value || "").toLowerCase().includes(needle));
      return matchesFilter && matchesQuery;
    });
  }, [filter, items, query]);

  return <><Nav /><main className="commerce-page orders-premium-page">
    <header className="orders-premium-hero">
      <div><span className="orders-premium-kicker"><FiShield /> Your service history</span><h1>Bookings, beautifully organised.</h1><p>Track upcoming visits, technician updates and completed home services from one calm workspace.</p></div>
      <div className="orders-summary"><article><small>Total bookings</small><strong>{counts.total}</strong><span>All service requests</span></article><article><small>Currently active</small><strong>{counts.active}</strong><span>Visits in progress</span></article><article><small>Completed</small><strong>{counts.completed}</strong><span>Successfully delivered</span></article></div>
    </header>

    <section className="orders-controls" aria-label="Booking filters">
      <div className="orders-filter-tabs">{statusFilters.map((status) => <button className={filter === status ? "is-active" : ""} type="button" onClick={() => setFilter(status)} key={status}>{status}</button>)}</div>
      <div className="orders-control-actions"><label><FiSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search service or booking ID" /></label><button type="button" className={refreshing ? "is-loading" : ""} onClick={() => load({ quiet: true })} disabled={refreshing} aria-label="Refresh bookings"><FiRefreshCw /></button></div>
    </section>

    {error && items.length > 0 ? <div className="orders-refresh-warning">Latest update could not be loaded. Showing your saved bookings. <button type="button" onClick={() => load({ quiet: true })}>Try again</button></div> : null}
    {loading ? <OrdersSkeleton /> : error && !items.length ? <ErrorState message={error} onRetry={() => load()} /> : !filtered.length ? <EmptyState title={query || filter !== "All" ? "No matching bookings" : "No bookings yet"} message={query || filter !== "All" ? "Try a different service name, booking ID or filter." : "Your confirmed services will appear here."} action={<Link className="primary-action" to="/applications">Book a service</Link>} /> : <section className="orders-premium-grid">
      {filtered.map((booking, index) => {
        const serviceTitle = booking.applianceServiceId?.title || "Home service";
        const planTitle = booking.servicePlanId?.title || booking.childServiceId?.title || "Professional care";
        const price = booking.servicePlanId?.offerPrice ?? booking.servicePlanId?.price;
        const payment = paymentCopy(booking);
        return <Link className="order-premium-card" to={`/booking-details/${booking._id}`} key={booking._id}>
          <div className="order-premium-image"><img src={serviceVisual({ ...booking.applianceServiceId, image: booking.servicePlanId?.image }, index)} alt={serviceTitle} loading="lazy" decoding="async" /><span className={`order-badge ${statusClass(booking.status)}`}>{booking.status}</span></div>
          <div className="order-premium-content"><div className="order-premium-number"><FiClipboard /> {booking.bookingNumber}</div><h2>{serviceTitle}</h2><p>{planTitle}</p><div className="order-premium-meta"><span><FiCalendar /> {formatDate(booking.bookingDate)}</span><span><FiClock /> {booking.timeSlot}</span>{booking.customer?.pincode ? <span><FiMapPin /> {booking.customer.pincode}</span> : null}</div><div className={`order-payment-state is-${payment.tone}`}><FiCreditCard /><span><small>{payment.detail}</small><strong>{payment.label}</strong></span>{booking.paymentStatus === "Paid" ? <FiCheckCircle className="order-payment-check" /> : null}</div><div className="order-premium-footer"><div>{price != null ? <><small>Plan value</small><strong>{money(price)}</strong></> : <><small>Service status</small><strong>{booking.status}</strong></>}</div><span>View details <FiArrowUpRight /></span></div></div>
        </Link>;
      })}
    </section>}
    {!loading && filtered.length > 0 ? <div className="orders-assurance"><FiCheckCircle /><span><strong>Need help with a booking?</strong> Our care team is available every day from 8 AM to 9 PM.</span><Link to="/contact">Contact support <FiArrowUpRight /></Link></div> : null}
  </main><Footer /></>;
}

