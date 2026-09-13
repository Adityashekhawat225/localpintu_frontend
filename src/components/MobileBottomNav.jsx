import { Link, useLocation } from "react-router-dom";
import { FiBriefcase, FiHome, FiShoppingBag, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const homeActive = location.pathname === "/";
  const cartActive = ["/cart", "/checkout"].includes(location.pathname);
  const bookingsActive = location.pathname === "/orders" || location.pathname.startsWith("/booking-");
  const accountActive = ["/login", "/signup", "/profile", "/change-password"].includes(location.pathname);
  const bookingsTarget = isAuthenticated ? "/orders" : "/login?returnTo=%2Forders";
  const accountTarget = isAuthenticated ? "/profile" : "/login?returnTo=%2Fprofile";
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <Link className={homeActive ? "active" : ""} to="/"><FiHome /><span>Home</span></Link>
      <Link className={cartActive ? "active" : ""} to="/cart"><FiShoppingBag /><span>Cart</span></Link>
      <Link className={bookingsActive ? "active" : ""} to={bookingsTarget}><FiBriefcase /><span>Bookings</span></Link>
      <Link className={accountActive ? "active" : ""} to={accountTarget}><FiUser /><span>Account</span></Link>
    </nav>
  );
}
