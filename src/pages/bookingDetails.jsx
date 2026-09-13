import "../styles/luxurySystem.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight, FiCalendar, FiCheck, FiCheckCircle, FiClock, FiClipboard, FiCreditCard, FiMail, FiMapPin, FiPhone, FiShield, FiStar, FiTool, FiUser } from "react-icons/fi";
import { getBookingById, getMyBookings } from "../services/api";
import { serviceVisual } from "../utils/premiumAssets";
import Nav from "../layouts/nav";
import Footer from "../layouts/Footer";
import { io } from "socket.io-client";
import { toast } from "../utils/toast";
import "../styles/booking/bookingService.css";

import { SOCKET_URL } from "../services/apiConfig";

const readLabel = (value) => value?.title || value?.name || "—";
const statusOrder = ["Pending", "Confirmed", "Assigned", "In Progress", "Waiting For OTP Verification", "Completed"];
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const bookingCache = (bookingId) => {
  try { return (JSON.parse(sessionStorage.getItem("localpintu-orders-v1") || "null")?.items || []).find((item) => String(item._id) === String(bookingId)) || null; }
  catch { return null; }
};
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(new Date(value)) : "—";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const cached = useMemo(() => bookingCache(bookingId), [bookingId]);
  const [booking, setBooking] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const [live, setLive] = useState(null);
  const [devOtp, setDevOtp] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    async function loadBooking() {
      setError("");
      try {
        const detailsRequest = getBookingById(bookingId);
        const ownedRequest = import.meta.env.DEV ? getMyBookings().catch(() => []) : Promise.resolve([]);
        const [nextBooking, ownedBookings] = await Promise.all([detailsRequest, ownedRequest]);
        const ownedBooking = ownedBookings.find((item) => String(item._id) === String(bookingId));
        if (ownedBooking?.completionOtp && ownedBooking.completionOtpExpiresAt) setDevOtp({ otp: ownedBooking.completionOtp, expiresAt: new Date(ownedBooking.completionOtpExpiresAt).getTime() });
        if (alive) setBooking(nextBooking);
      } catch {
        if (alive) setError("Unable to load this booking right now.");
      } finally { if (alive) setLoading(false); }
    }
    loadBooking();
    const token = (() => {
      try { return JSON.parse(localStorage.getItem("localpintu-auth") || "{}").token || ""; }
      catch { return ""; }
    })();
    const socket = io(SOCKET_URL, { auth: { token } });
    socket.on("technician:location", (update) => { if (String(update.bookingId) === String(bookingId)) setLive(update); });
    socket.on("booking:status", (update) => { if (String(update.bookingId) === String(bookingId)) loadBooking(); });
    socket.on("booking:completion-requested", (update) => { if (String(update.bookingId) === String(bookingId)) { toast.info("Service completion requested", { description: "Share the OTP only after you are satisfied with the work.", duration: 8000 }); loadBooking(); } });
    socket.on("booking:otp-resent", (update) => { if (String(update.bookingId) === String(bookingId)) toast.success("New verification OTP generated", { description: "Use the latest OTP to complete verification.", duration: 7000 }); });
    socket.on("booking:dev-otp", (update) => { if (String(update.bookingId) === String(bookingId)) { setDevOtp({ otp: update.otp, expiresAt: new Date(update.expiresAt).getTime() }); loadBooking(); } });
    return () => { alive = false; socket?.disconnect(); };
  }, [bookingId]);

  useEffect(() => { if (!devOtp) return undefined; const intervalId = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(intervalId); }, [devOtp]);
  const otpRemaining = devOtp ? devOtp.expiresAt - now : 0;
  const expiryDisplay = otpRemaining > 0 ? `${Math.floor(otpRemaining / 60000)}m ${Math.floor((otpRemaining % 60000) / 1000)}s` : "";
  const currentStep = booking?.status === "Cancelled" ? -1 : Math.max(0, statusOrder.indexOf(booking?.status));
  const serviceTitle = readLabel(booking?.applianceServiceId);
  const isPaid = booking?.paymentStatus === "Paid";
  const payable = booking?.paymentSummary?.payable ?? booking?.paymentSummary?.totalAmount ?? booking?.servicePlanId?.offerPrice ?? booking?.servicePlanId?.price;

  return <><Nav /><main className="booking-details-page booking-detail-premium">
    <div className="booking-detail-topbar"><Link to="/orders"><FiArrowLeft /> Back to bookings</Link>{loading && booking ? <span>Refreshing details…</span> : null}</div>
    {loading && !booking ? <div className="booking-detail-loading"><i /><b /><b /><b /></div> : null}
    {error && !booking ? <div className="booking-detail-error"><FiShield /><h2>Booking unavailable</h2><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div> : null}
    {booking ? <>
      <header className="booking-detail-premium-hero">
        <div className="booking-detail-premium-media"><img src={serviceVisual({ ...booking.applianceServiceId, image: booking.servicePlanId?.image })} alt={serviceTitle} /><span><FiShield /> LocalPintu protected booking</span></div>
        <div className="booking-detail-premium-copy"><div className="booking-detail-title-row"><span className="booking-detail-reference"><FiClipboard /> {booking.bookingNumber}</span><strong className={`booking-detail-status status-${String(booking.status).toLowerCase().replaceAll(" ", "-")}`}>{booking.status}</strong></div><h1>{serviceTitle}</h1><p>{readLabel(booking.servicePlanId)} · {readLabel(booking.childServiceId)}</p><div className="booking-detail-visit"><div><FiCalendar /><span><small>Scheduled date</small><strong>{formatDate(booking.bookingDate)}</strong></span></div><div><FiClock /><span><small>Arrival window</small><strong>{booking.timeSlot}</strong></span></div></div></div>
      </header>

      {booking.status === "Cancelled" ? <div className="booking-cancelled-note">This booking has been cancelled. Contact support if you need help arranging another visit.</div> : <section className="booking-progress" aria-label="Booking progress">{statusOrder.map((status, index) => <div className={index <= currentStep ? "is-complete" : ""} key={status}><i>{index < currentStep ? <FiCheck /> : index + 1}</i><span>{status === "Waiting For OTP Verification" ? "Verify" : status}</span></div>)}</section>}

      {devOtp && otpRemaining > 0 && !["Completed", "Cancelled"].includes(booking.status) ? <section className="dev-otp-card booking-premium-otp"><div><span>Service completion verification</span><p>Share this code only after checking the completed work.</p></div><strong>{devOtp.otp}</strong><small>Expires in {expiryDisplay}</small></section> : null}

      <section className="booking-detail-panels">
        <article className="booking-detail-panel"><div className="booking-detail-panel-title"><FiTool /><div><span>Service summary</span><h2>What you booked</h2></div></div><div className="booking-detail-list"><Detail label="Main service" value={serviceTitle} /><Detail label="Service category" value={readLabel(booking.serviceCategoryId)} /><Detail label="Exact service" value={readLabel(booking.childServiceId)} /><Detail label="Selected plan" value={readLabel(booking.servicePlanId)} /></div></article>
        <article className={`booking-detail-panel booking-payment-panel ${isPaid ? "is-paid" : ""}`}><div className="booking-detail-panel-title"><FiCreditCard /><div><span>Payment & receipt</span><h2>{isPaid ? "Payment received" : booking.paymentStatus === "Cash Due" ? "Payment at visit" : "Payment update"}</h2></div></div><div className="booking-payment-hero"><span>{isPaid ? <FiCheckCircle /> : <FiShield />}</span><div><strong>{isPaid ? "Paid successfully" : booking.paymentStatus === "Cash Due" ? "Pay after the visit" : booking.paymentStatus || "Awaiting payment"}</strong><small>{booking.paymentMethod || "Payment method to be confirmed"}</small></div>{payable != null ? <b>{money(payable)}</b> : null}</div><div className="booking-detail-list is-compact"><Detail label={isPaid ? "Paid on" : "Payment status"} value={isPaid ? formatDate(booking.paidAt) : booking.paymentStatus || "Pending"} /><Detail label="Reference" value={booking.paymentReference || (isPaid ? "Available securely" : "Will appear after payment")} /></div></article>
        <article className="booking-detail-panel"><h2>Parts &amp; additional work</h2>{(booking.selectedProducts || []).length ? booking.selectedProducts.map((part, index) => <div className="booking-detail-list is-compact" key={part._id || index}><Detail label={`${part.name} × ${part.quantity || 1}`} value={money(part.price * (part.quantity || 1))} />{part.faultDescription && <p>{part.faultDescription}</p>}</div>) : <p>No additional parts charged.</p>}{booking.amountPreviouslyPaid > 0 && <><Detail label="Previously paid" value={money(booking.amountPreviouslyPaid)} /><Detail label="Remaining due" value={money(isPaid ? 0 : Math.max(0, Number(payable || 0) - booking.amountPreviouslyPaid))} /></>}</article><article className="booking-detail-panel"><div className="booking-detail-panel-title"><FiMapPin /><div><span>Visit details</span><h2>Where we’re coming</h2></div></div><div className="booking-detail-address"><strong>{booking.customer?.address || "Address unavailable"}</strong><p>{readLabel(booking.cityId)}, {readLabel(booking.stateId)} · {booking.customer?.pincode || "—"}</p></div><div className="booking-detail-list is-compact"><Detail label="Booking date" value={formatDate(booking.bookingDate)} /><Detail label="Time slot" value={booking.timeSlot} /></div></article>
        <article className="booking-detail-panel"><div className="booking-detail-panel-title"><FiUser /><div><span>Customer</span><h2>Contact information</h2></div></div><div className="booking-contact-lines"><span><FiUser /><b>{booking.customer?.name || "—"}</b></span><a href={`tel:${booking.customer?.mobileNumber || ""}`}><FiPhone />{booking.customer?.mobileNumber || "—"}</a><a href={`mailto:${booking.customer?.email || ""}`}><FiMail />{booking.customer?.email || "—"}</a></div></article>
        <article className="booking-detail-panel booking-technician-panel"><div className="booking-detail-panel-title"><FiShield /><div><span>Professional</span><h2>{booking.technicianId ? "Your technician" : "Assignment update"}</h2></div></div>{booking.technicianId ? <div className="booking-technician-profile">
          <div className="booking-technician-head"><div className="booking-technician-avatar">{booking.technicianId.profileImage ? <img src={booking.technicianId.profileImage} alt={booking.technicianId.fullName} /> : booking.technicianId.fullName?.charAt(0)}</div><div className="booking-technician-name"><div><strong>{booking.technicianId.fullName}</strong>{booking.technicianId.verificationStatus === "Verified" ? <span><FiShield /> Verified</span> : null}</div><small>{booking.technicianId.skills?.slice(0, 2).join(" · ") || "Home service professional"}</small><i className={booking.technicianId.currentStatus === "Online" ? "is-online" : ""}>{booking.technicianId.currentStatus || booking.technicianId.availabilityStatus || "Assigned"}</i></div>{booking.technicianId.mobileNumber ? <a className="booking-technician-call" href={`tel:${booking.technicianId.mobileNumber}`} aria-label={`Call ${booking.technicianId.fullName}`}><FiPhone /></a> : null}</div>
          <div className="booking-technician-stats"><div><FiStar /><span><strong>{Number(booking.technicianId.rating || 0).toFixed(1)}</strong><small>Rating</small></span></div><div><FiTool /><span><strong>{booking.technicianId.experience || 0}+ yrs</strong><small>Experience</small></span></div><div><FiCheck /><span><strong>{booking.technicianId.completedJobs || 0}</strong><small>Jobs done</small></span></div></div>
          {booking.technicianId.skills?.length ? <div className="booking-technician-skills"><small>Expertise</small><div>{booking.technicianId.skills.slice(0, 5).map((skill) => <span key={skill}>{skill}</span>)}</div></div> : null}
          <div className="booking-technician-contact"><span><FiMapPin /> {booking.technicianId.city || "Your service area"}</span>{booking.technicianId.mobileNumber ? <a href={`tel:${booking.technicianId.mobileNumber}`}><FiPhone /> {booking.technicianId.mobileNumber}</a> : null}</div>
        </div> : <p className="booking-assignment-copy">A verified professional will be assigned as your appointment approaches. You’ll see their profile, experience, skills and contact details here.</p>}</article>
        {booking.customer?.problemDescription ? <article className="booking-detail-panel is-wide"><div className="booking-detail-panel-title"><FiClipboard /><div><span>Your request</span><h2>Problem description</h2></div></div><p className="booking-problem-copy">{booking.customer.problemDescription}</p></article> : null}
        {live ? <article className="booking-detail-panel is-wide booking-live-panel"><div><i /><span><small>Technician live location</small><strong>{live.location?.coordinates ? `${live.location.coordinates[1].toFixed(5)}, ${live.location.coordinates[0].toFixed(5)}` : "Updating location…"} · {Math.round((live.speed || 0) * 3.6)} km/h</strong></span></div><a href={`https://www.google.com/maps/dir/?api=1&destination=${live.location?.coordinates?.[1]},${live.location?.coordinates?.[0]}`} target="_blank" rel="noreferrer">Open live route <FiArrowUpRight /></a></article> : null}
      </section>
      <div className="booking-detail-support"><FiShield /><span><strong>Need help with this booking?</strong><small>Our customer care team is available every day, 8 AM–9 PM.</small></span><Link to="/contact">Contact support <FiArrowUpRight /></Link></div>
    </> : null}
  </main><Footer /></>;
};

function Detail({ label, value }) { return <div className="booking-premium-detail"><span>{label}</span><strong>{value || "—"}</strong></div>; }
export default BookingDetails;


