import "../styles/luxurySystem.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaCheck, FaClipboardList, FaClock, FaHome, FaShieldAlt, FaTools } from "react-icons/fa";
import { getBookingById } from "../services/api";
import "../styles/booking/bookingService.css";

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getBookingById(bookingId)
      .then((nextBooking) => { if (alive) setBooking(nextBooking); })
      .catch(() => {
        if (alive) setError("Your booking is confirmed. The reference number will be available in My Bookings.");
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [bookingId]);

  return (
    <main className="booking-service-page booking-result-page booking-arrival-page">
      <div className="booking-arrival-glow booking-arrival-glow--one" />
      <div className="booking-arrival-glow booking-arrival-glow--two" />
      <section className="booking-result-card booking-arrival-card">
        <div className="booking-arrival-check" aria-hidden="true"><span><FaCheck /></span><i /><i /><i /></div>
        <span className="booking-arrival-kicker"><FaShieldAlt /> Booking confirmed</span>
        <h1>Your expert is on the way.</h1>
        <p className="booking-arrival-intro">Sit back and relax. A verified LocalPintu professional will reach you within the promised arrival window.</p>

        <div className="booking-arrival-promise">
          <div className="booking-arrival-clock"><FaClock /><span /></div>
          <div><small>Estimated arrival</small><strong>Within 2 hours</strong><p>We are preparing the right professional for your service.</p></div>
          <div className="booking-arrival-route" aria-hidden="true"><i /><span><FaTools /></span><b /></div>
        </div>

        <div className="booking-arrival-trust">
          <span><FaShieldAlt /><b>Verified professional</b></span>
          <span><FaClock /><b>Timely doorstep visit</b></span>
          <span><FaCheck /><b>Booking protected</b></span>
        </div>

        {loading ? <div className="booking-arrival-reference is-loading">Preparing your booking reference…</div> : null}
        {error ? <p className="booking-status-message booking-status-message--error">{error}</p> : null}
        {booking ? <div className="booking-result-number booking-arrival-reference"><small>Booking reference</small><strong>{booking.bookingNumber}</strong><span>Keep this number handy for support.</span></div> : null}

        <div className="booking-result-actions booking-arrival-actions">
          <Link to={`/booking-details/${bookingId}`}><FaClipboardList /> View booking</Link>
          <Link to="/"><FaHome /> Back to home</Link>
        </div>
      </section>
    </main>
  );
};

export default BookingSuccess;
