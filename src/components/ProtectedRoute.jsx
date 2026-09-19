import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({ children }) { const { isAuthenticated } = useAuth(); const location = useLocation(); const returnTo = `${location.pathname}${location.search}`; return isAuthenticated ? children : <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />; }
