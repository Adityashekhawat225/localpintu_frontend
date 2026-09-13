import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { logout as logoutRequest } from "../services/api";
const AuthContext = createContext(null);
const KEY = "localpintu-auth";
const read = () => { try { return JSON.parse(typeof localStorage!=="undefined"?localStorage.getItem(KEY):null) || {}; } catch { return {}; } };
export function AuthProvider({ children }) {
  const [session, setSession] = useState(read);
  const login = useCallback(({ token, customer }) => { const next = { token, customer }; localStorage.setItem(KEY, JSON.stringify(next)); setSession(next); }, []);
  const logout = useCallback(async () => { try { await logoutRequest(); } finally { localStorage.removeItem(KEY); setSession({}); } }, []);
  const setCustomer = useCallback((customer) => { setSession((current) => { const next = { ...current, customer }; localStorage.setItem(KEY, JSON.stringify(next)); return next; }); }, []);
  const value = useMemo(() => ({ ...session, isAuthenticated: Boolean(session.token), login, logout, setCustomer }), [session, login, logout, setCustomer]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
