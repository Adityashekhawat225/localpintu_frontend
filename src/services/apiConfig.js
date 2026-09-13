const env = import.meta.env;
export const LOCAL_API_BASE = "http://localhost:5031/api";
export const PRODUCTION_API_BASE = "https://api.localpintu.com/api";
const base = String(env.VITE_API_BASE_URL || (env.DEV ? LOCAL_API_BASE : PRODUCTION_API_BASE)).trim().replace(/\/+$/, "");
export const API_BASE = base.endsWith("/api") ? base : `${base}/api`;
export const API_ORIGIN = new URL(API_BASE, typeof window === "undefined" ? LOCAL_API_BASE : window.location.origin).origin;
export const SOCKET_URL = String(env.VITE_SOCKET_URL || API_ORIGIN).trim().replace(/\/+$/, "");
