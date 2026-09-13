import "../styles/luxurySystem.css";
import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiClock, FiEdit3, FiExternalLink, FiLock, FiMapPin, FiNavigation, FiShield, FiSmartphone } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../layouts/nav";
import Footer from "../layouts/Footer";
import LocationPicker from "../components/LocationPicker";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLocationPreference } from "../hooks/useLocationPreference";
import { usePriceBreakdown } from "../hooks/usePricingSettings";
import { createBooking, createRazorpayOrder, getSlotAvailability, initiatePayuPayment, verifyRazorpayPayment } from "../services/api";
import "../styles/commerce.css";
import "../styles/locationCheckout.css";

const slots = ["08:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "12:00 PM - 02:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM"];
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const slotStart = (slot) => { const match = String(slot).match(/^(\d{2}):(\d{2})\s*(AM|PM)/i); if (!match) return 0; let hour = Number(match[1]) % 12; if (match[3].toUpperCase() === "PM") hour += 12; return hour * 60 + Number(match[2]); };
const isPastSlot = (date, slot) => { if (!date) return false; const selected = new Date(`${date}T00:00:00`), now = new Date(); if (selected.toDateString() !== now.toDateString()) return selected < new Date(now.getFullYear(), now.getMonth(), now.getDate()); return slotStart(slot) <= now.getHours() * 60 + now.getMinutes(); };
const isMapsLink = (value) => !value || /^https:\/\/(?:www\.)?(?:google\.[^/]+\/maps|maps\.app\.goo\.gl)\//i.test(value.trim());
const loadRazorpay = () => new Promise((resolve, reject) => { if (window.Razorpay) return resolve(); const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.onload = resolve; script.onerror = () => reject(new Error("Razorpay checkout could not load.")); document.head.append(script); });

export default function CheckoutPage() {
  const cart = useCart(), { customer, logout } = useAuth(), location = useLocationPreference(), navigate = useNavigate();
  const [form, setForm] = useState({ bookingDate: "", timeSlot: "", address: customer?.address || "", pincode: customer?.pincode || "", locationLink: "" });
  const [locationMode, setLocationMode] = useState("current");
  const [method, setMethod] = useState("razorpay"), [busy, setBusy] = useState(false), [error, setError] = useState(""), [availability, setAvailability] = useState([]);
  const pin = location.selectedPincode?.code || form.pincode;
  const detectedAddress = [
    location.selectedArea?.exactAddress || location.selectedArea?.name,
    location.selectedCity?.name,
    location.selectedState?.name,
    location.selectedPincode?.code,
  ].filter((value, index, values) => value && values.indexOf(value) === index).join(", ");
  const serviceAddress = locationMode === "manual" ? form.address.trim() : detectedAddress;
  const serviceLocationLink = locationMode === "manual" ? form.locationLink.trim() : "";
  const serviceIds = useMemo(() => [...new Set(cart.items.map((item) => item.childId).filter(Boolean))], [cart.items]);
  const pricing = usePriceBreakdown(cart.serviceSubtotal, cart.productSubtotal, 0, cart.servicePlatformFee);
  const canLoadAvailability = Boolean(form.bookingDate && serviceIds.length && location.selectedAreaId);
  const selectedSlot = (canLoadAvailability ? availability : []).find((item) => item.timeSlot === form.timeSlot);
  const visibleSlots = slots.filter((slot) => !isPastSlot(form.bookingDate, slot));
  const valid = Boolean(cart.items.length && location.serviceAvailable && form.bookingDate && form.timeSlot && !isPastSlot(form.bookingDate, form.timeSlot) && selectedSlot?.available && serviceAddress.length >= 8 && /^\d{6}$/.test(pin) && isMapsLink(serviceLocationLink));

  useEffect(() => {
    if (!canLoadAvailability) return undefined;
    let active = true;
    getSlotAvailability({ bookingDate: form.bookingDate, childServiceIds: serviceIds.join(","), areaId: location.selectedAreaId }).then((rows) => { if (active) setAvailability(rows); }).catch(() => { if (active) setAvailability([]); });
    return () => { active = false; };
  }, [canLoadAvailability, serviceIds, form.bookingDate, location.selectedAreaId]);

  const done = (created) => { cart.clearCart(); navigate(`/booking-success/${created.at(-1)._id}`, { state: { bookingCount: created.length } }); };
  const submit = async (event) => {
    event.preventDefault(); if (!valid || busy) return; setBusy(true); setError("");
    try {
      const created = [];
      for (const [index, item] of cart.items.entries()) {
        const productItems = index === 0 ? { pricingItems: { planIds: [item.planId], productIds: cart.productItems.map((product) => product.productId) } } : {};
        const coordinates = locationMode === "current" && location.coordinates ? { latitude: location.coordinates.latitude, longitude: location.coordinates.longitude, capturedAt: new Date().toISOString() } : undefined;
        created.push(await createBooking({ ...productItems, paymentMethod: method === "cod" ? "Cash on Service (COD)" : method === "payu" ? "PayU" : "Razorpay", stateId: location.selectedStateId, cityId: location.selectedCityId, areaId: location.selectedAreaId, applianceServiceId: item.serviceId, serviceCategoryId: item.categoryId, childServiceId: item.childId, servicePlanId: item.planId, quantity: item.quantity, bookingDate: form.bookingDate, timeSlot: form.timeSlot, customerLocation: coordinates, customerLocationLink: serviceLocationLink, customer: { name: customer.fullName, mobileNumber: customer.mobileNumber, email: customer.email, address: serviceAddress, pincode: pin, problemDescription: `${item.planTitle} requested through checkout.` } }));
      }
      if (method === "cod") return done(created);
      const ids = created.map((booking) => booking._id);
      if (method === "payu") { const payment = await initiatePayuPayment(ids), paymentForm = document.createElement("form"); paymentForm.method = "POST"; paymentForm.action = payment.action; Object.entries(payment.fields).forEach(([name, value]) => { const input = document.createElement("input"); input.type = "hidden"; input.name = name; input.value = value; paymentForm.append(input); }); document.body.append(paymentForm); paymentForm.submit(); return; }
      const order = await createRazorpayOrder(ids); await loadRazorpay(); new window.Razorpay({ key: order.key, amount: order.amount, currency: "INR", name: "LocalPintu", order_id: order.orderId, prefill: order.prefill, handler: async (response) => { try { await verifyRazorpayPayment({ paymentId: order.paymentId, ...response }); done(created); } catch (requestError) { setError(requestError.message); } finally { setBusy(false); } }, modal: { ondismiss: () => setBusy(false) } }).open();
    } catch (requestError) { if (requestError.status === 401) { await logout(); navigate("/login?returnTo=%2Fcheckout"); } else setError(requestError.message || "Unable to continue"); setBusy(false); }
  };

  if (!cart.items.length) return <><Nav/><main className="commerce-page"><section className="lux-state"><FiCheckCircle/><h2>Your cart is empty</h2><Link className="primary-action" to="/applications">Explore services</Link></section></main><Footer/></>;
  return <><Nav/><main className="commerce-page"><Link className="checkout-back" to="/cart"><FiArrowLeft/>Back to cart</Link><header className="commerce-hero compact"><span>Private & secure checkout</span><h1>Book with confidence</h1><p>Each service is matched with a technician qualified for that exact work.</p></header><form className="checkout-layout" onSubmit={submit}><section className="checkout-main">
    <article className="checkout-card"><div className="checkout-title"><FiMapPin/><div><h2>Where should we provide the service?</h2><p>Use your current location or book for another property.</p></div></div><div className="location-mode-options"><button type="button" className={locationMode === "current" ? "active" : ""} onClick={() => { setLocationMode("current"); location.refreshLocation(); }}><FiNavigation/><span><strong>Current location</strong><small>Detect securely with GPS</small></span></button><button type="button" className={locationMode === "manual" ? "active" : ""} onClick={() => setLocationMode("manual")}><FiEdit3/><span><strong>Another address</strong><small>Book for family or another property</small></span></button></div>{locationMode === "manual" ? <LocationPicker/> : location.serviceAvailable ? <div className="detected-address"><FiCheckCircle/><div><strong>{location.selectedArea?.name}, {location.selectedCity?.name} — {location.selectedPincode?.code}</strong><p>{location.selectedState?.name} · Current location is serviceable</p></div><button type="button" onClick={location.refreshLocation}>Refresh GPS</button></div> : <LocationPicker/>}</article>
    <article className="checkout-card"><div className="checkout-title"><FiCalendar/><div><h2>Choose your visit</h2><p>Only available upcoming time slots are shown.</p></div></div><div className="checkout-fields"><label><span><FiCalendar/>Date</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={form.bookingDate} onChange={(event) => setForm({ ...form, bookingDate: event.target.value, timeSlot: "" })} required/></label><label><span><FiClock/>Time</span><select value={form.timeSlot} onChange={(event) => setForm({ ...form, timeSlot: event.target.value })} required><option value="">Select a time slot</option>{visibleSlots.map((slot) => { const row = availability.find((item) => item.timeSlot === slot); return <option key={slot} value={slot} disabled={!row?.available}>{slot}{row?.available === false ? " — Fully booked" : ""}</option>; })}</select></label></div></article>
    {locationMode === "manual" ? <article className="checkout-card"><div className="checkout-title"><FiMapPin/><div><h2>Complete doorstep address</h2><p>Precise details help your professional reach without repeated calls.</p></div></div><div className="checkout-fields"><label className="wide"><span>House/flat, building, street and landmark</span><textarea placeholder="Flat 204, Shree Residency, near Central Park, Mansarovar" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required/></label><label><span>Service pincode</span><input value={pin} readOnly={Boolean(location.selectedPincode?.code)} onChange={(event) => setForm({ ...form, pincode: event.target.value.replace(/\D/g, "").slice(0, 6) })} required/></label><label><span><FiExternalLink/>Google Maps link (optional)</span><input type="url" placeholder="https://maps.app.goo.gl/..." value={form.locationLink} onChange={(event) => setForm({ ...form, locationLink: event.target.value })}/>{!isMapsLink(form.locationLink) ? <small className="field-error">Enter a valid Google Maps link.</small> : null}</label></div><p className="location-privacy-note"><FiShield/>Location is used only for serviceability and technician navigation.</p></article> : null}
    {error && <p className="checkout-error">{error}</p>}</section><aside className="price-card checkout-summary"><span>Your order</span>{cart.items.map((item) => <div className="checkout-line" key={item.planId}><p>{item.planTitle}<small>{item.childTitle}</small></p><strong>{money(item.offerPrice ?? item.price)}</strong></div>)}<div className="payment-luxury"><div className="payment-luxury__head"><FiShield/><div><strong>Choose payment</strong><small>Encrypted, secure and trusted</small></div></div>{[["razorpay", "Razorpay", "UPI · Cards · Netbanking", "Instant online payment"], ["payu", "PayU", "UPI · Cards · Netbanking", "Pay with PayU securely"], ["cod", "Cash on Service", "Pay after the professional arrives", "No online payment needed"]].map(([id, title, sub, note]) => <button type="button" onClick={() => setMethod(id)} className={`payment-option ${method === id ? "selected" : ""}`} key={id}><FiSmartphone/><span><strong>{title}</strong><small>{sub}</small></span><i>{method === id ? "✓" : ""}</i><em>{note}</em></button>)}</div><div className="price-row"><p>Service charges</p><strong>{money(pricing.subtotal)}</strong></div>{pricing.platformFee > 0 && <div className="price-row"><p>Platform fee</p><strong>{money(pricing.platformFee)}</strong></div>}<div className="price-row"><p>GST ({pricing.gstPercentage}%)</p><strong>{money(pricing.gstAmount)}</strong></div><div className="grand-total"><p>{method === "cod" ? "Pay at visit" : "Total payable"}</p><strong>{money(pricing.totalAmount)}</strong></div><button className="primary-action" disabled={!valid || busy}><FiLock/>{busy ? "Please wait…" : method === "cod" ? "Confirm cash-on-service booking" : `Continue securely with ${method === "payu" ? "PayU" : "Razorpay"}`}</button><small className="secure-copy">No card, UPI PIN or bank details are stored by LocalPintu.</small></aside></form></main><Footer/></>;
}
