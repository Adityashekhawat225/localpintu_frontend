# LocalPintu SEO launch checklist

Complete these steps immediately after deploying the `Frontend/dist` build. They are required for the new LocalPintu pages and sitemap to replace the old public site in search results.

1. Deploy `Frontend/dist` to the domain serving `https://localpintu.com`.
2. Select one canonical host: `https://localpintu.com`. Redirect `http`, `www.localpintu.com`, and any prior host to it with a permanent 301 redirect. Do not redirect every unknown URL to the homepage; public service and blog URLs must continue to serve the React app.
3. Confirm these return HTTP 200 and their displayed canonical URL is exactly on the canonical host:
   - `/`
   - `/blogs`
   - one `/blogs/<slug>` URL
   - one `/applications/<service>/<category>/<child>/<plan>` URL
   - `/sitemap.xml`
   - `/robots.txt`
4. In Google Search Console, verify the Domain property for `localpintu.com`, submit `https://localpintu.com/sitemap.xml`, then inspect and request indexing for the homepage, the two service hubs, and the strongest original articles. Do the same in Bing Webmaster Tools.
5. Keep the business name, Jaipur address, primary phone number, opening hours and service areas identical on the website and Google Business Profile. Only publish claims and customer reviews that can be substantiated.
6. Publish useful original guides regularly. Every article should answer a real customer question, use a descriptive title, include an accurate image alt text, link naturally to its relevant service page, and link to 2–3 genuinely related articles. Do not create copied or near-duplicate locality pages solely to target keywords.
7. Monitor Search Console weekly for indexed pages, page-experience issues, crawl errors, queries and click-through rate. Improve titles/descriptions from actual query data; do not change URLs unnecessarily.

## Release checks

```powershell
cd Frontend
npm run lint
npm run build
npm run seo:audit
```

`npm run build` generates the sitemap from the live catalogue API. Rebuild and redeploy whenever services, plans or active blog posts change.
