API requests, booking Socket.IO connections and backend image URLs share `src/services/apiConfig.js`.

- `npm run dev`: existing local backend at `http://localhost:5031`.
- `npm run dev:live`: live backend at `https://api.localpintu.com`.
- `npm run build`: production uses `https://api.localpintu.com/api` and sockets at `https://api.localpintu.com`.

`.env.production` and `.env.live` contain the live configuration. `.env` retains local development settings. Hosting environment overrides must use the same live URLs; Vite embeds them at build time, so rebuild after changing them.

Sitemap/SEO scripts default to the live API. Set `VITE_API_BASE_URL=http://localhost:5031/api` to run these scripts against local data. The optional production server accepts `API_PROXY_TARGET=http://localhost:5031` for a local proxy; its default is the live API.

Verification: `node --test scripts/test-api-config.mjs scripts/test-api.mjs`, then build both apps and run `node scripts/test-live-api.mjs`. The live checks are read-only and do not send OTPs, create bookings or take payments.
