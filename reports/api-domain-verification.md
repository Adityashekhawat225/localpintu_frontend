# API domain verification — 2026-09-13

Only Frontend and admin were changed. Both use `https://api.localpintu.com/api` for production/live API requests and `https://api.localpintu.com` for sockets and backend assets. API clients, all existing socket consumers, backend image resolvers, production environment files, and frontend sitemap/SEO/preview scripts were reviewed and updated. Legacy backend image hosts are remapped to the configured origin.

Local development remains available: Frontend uses localhost:5031, admin uses localhost:8000. `npm run dev` selects local; `npm run dev:live` selects the live API. Production builds select the live API.

## Results

- Both production builds passed.
- Frontend lint passed.
- 7 API configuration/client tests passed, covering both apps in development, live and production modes, plus request caching/retries.
- Live checks: 22 passed, 1 timed out. Machine-readable details: `api-domain-verification.json`.
- 12 public API endpoints returned successful JSON responses: appliance services, service categories, child services, service plans, products, pricing settings, blogs, latest blogs, states, cities, areas and pincodes.
- CORS preflight passed for the frontend/admin production origins and localhost:5173/5174, including authorization, content-type and cache-control headers.
- Socket.IO polling handshake passed.
- Live browser checks passed for frontend home, blogs, login, cart and admin login, with successful browser API/CORS requests. No old Render backend or local backend requests were observed in those production pages.
- Sitemap generation used live data and generated 128 canonical URLs.

## Remaining live API performance issue

`GET /api/offers` timed out after 20 seconds during the initial JSON check. Independent retries for both `/api/offers` and `/api/offers?active=true&popup=true` returned HTTP 200 but did not finish downloading within 30 seconds. Both responses advertised 2,297,442 bytes; approximately 1.33–1.36 MB arrived before timeout. The existing app API clients use 15-second timeouts, so offers may fail to load on a similarly slow connection. This is a live response-size/transfer-speed issue, not a missing API URL. Backend and infrastructure were outside this change's two-app scope.

Authenticated admin actions, customer booking/payment mutations, actual SMS and authenticated socket events were not exercised. No production data was created or modified. No deployment or GitHub push was performed for these frontend/admin changes.
