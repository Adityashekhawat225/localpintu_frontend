# LocalPintu SEO Audit & Implementation Report (2026)

Audit date: 3 August 2026  
Scope: customer-facing React/Vite site (`Frontend`). Admin, technician and vendor workspaces are transactional portals and intentionally excluded from search indexing.

## Executive summary

The original application had a useful route structure and mostly good visible alt text, but it was not production-complete for organic search. Metadata was generic on dynamic routes, structured data was absent, private pages could be indexed, the sitemap listed only five URLs, large editorial PNGs increased page weight, there were no deployable security/cache headers, analytics hooks were missing, and production API CORS allowed localhost only.

The implementation now provides route-specific metadata, canonical and index rules, dynamic schema, a backend-aware 53-URL sitemap, local entity/FAQ content, BlogPosting metadata, AI-readable entity facts, image compression, resource hints, analytics hooks, SPA fallbacks, cache/security headers, backend compression and production-domain CORS.

A first-page position cannot be guaranteed by code. Rankings also depend on competition, real reviews, backlinks, Google Business Profile quality, content quality, crawl history and user satisfaction.

## Findings and resolutions

| Area | Original issue | Resolution | SEO impact |
|---|---|---|---|
| Titles | Generic titles such as “Trusted Home Services” and slug-humanized fallbacks | Unique intent/location titles for core routes and dynamic services/blogs | Clearer relevance and stronger SERP CTR |
| Descriptions | Generic/duplicate descriptions on dynamic pages | Page-type and entity-specific descriptions | Better snippets and reduced duplication |
| Canonicals | Present but query handling was incomplete | Clean pathname canonicals; query/filter URLs set `noindex, follow` | Consolidates duplicate signals |
| Indexing | Account, cart, booking and technician routes incompletely protected | Comprehensive private-route `noindex, nofollow` plus robots exclusions | Keeps thin/private pages out of the index |
| Structured data | None | LocalBusiness, Organization-equivalent subtype, WebSite, WebPage, AboutPage, ContactPage, Service, BreadcrumbList, FAQPage and BlogPosting | Machine-readable entities and rich-result eligibility |
| Sitemap | Five hard-coded URLs | Build-time API-aware sitemap generator; current build contains 53 canonical URLs | Better discovery and freshness |
| Robots | Partial private route exclusions | Full private route policy, host and sitemap declaration | Cleaner crawl allocation |
| Local SEO | Limited NAP/entity context | Consistent Jaipur/Sodala NAP, hours, service area, geo metadata and visible local copy | Stronger local entity consistency |
| AI search | No concise entity source | Added `llms.txt`, semantic FAQ answers and structured entity graph | Easier grounding for AI answer engines |
| Blog SEO | Generic route metadata | Unique title/description/canonical, Article OG fields, author, dates and BlogPosting schema | Stronger article understanding |
| Internal links | Navigation existed but topical context was thin | Added service, guide, FAQ and contextual CTA links on the home pillar | Improves crawl paths and topic relationships |
| Semantic HTML | Homepage `<main>` wrapped navigation/footer | Corrected main content boundary and global skip target | Better landmarks and accessibility |
| Accessibility | No global skip link | Keyboard-visible “Skip to main content”; existing focus/reduced-motion support retained | WCAG navigation improvement |
| Images | Several 1.6–2.1 MB PNGs; incomplete decoding/loading hints | Referenced assets converted to WebP (about assets ~67–78 KB; editorial assets ~77–97 KB), lazy/decode/priority hints added | Lower LCP/network cost and improved stability |
| JS | Route lazy loading already existed; initial bundle still substantial | Preserved route chunks; analytics loads only when configured | Avoids unconditional third-party JS |
| Caching | No platform cache policy | Immutable hashed assets, media cache and HSTS headers | Faster repeat visits |
| Compression | Backend responses not compressed | Added gzip/Brotli-capable Express compression middleware | Lower API transfer size |
| Security | Missing CSP/HSTS/referrer/permissions headers | Netlify/Vercel policies plus Helmet, rate limiting and hidden Express signature | Better trust and best-practice score |
| Deployment | Backend CORS accepted localhost only | `ALLOWED_ORIGINS` production allowlist | Prevents live frontend API failure |
| Analytics | No GA/Search Console/Bing integration point | Optional environment-driven GA4 page views and ownership verification | Deploy-ready measurement without placeholder tracking |
| 404 | Existing functional 404 | Retained and explicitly `noindex` | Correct UX without index pollution |

## Representative old and improved code

### Metadata

Old:
```jsx
const dynamicTitle = humanize(parts.at(-1));
<title>{`${dynamicTitle} | LocalPintu`}</title>
<meta name="description" content={DEFAULT_DESCRIPTION} />
```

Improved:
```jsx
const canonical = `${SITE}${pathname === "/" ? "" : pathname}`;
<meta name="robots" content={isPrivate ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
<link rel="canonical" href={canonical} />
<script type="application/ld+json">{JSON.stringify(schemas)}</script>
```

### Sitemap

Old:
```xml
<url><loc>https://localpintu.com/</loc></url>
<!-- only five static URLs -->
```

Improved:
```js
const [services, blogs] = await Promise.all([fetch(`${api}/appliance-services`), fetch(`${api}/blogs`)]);
// Active service and article slugs are emitted at build time.
```

### Production CORS

Old:
```js
if (!["localhost", "127.0.0.1"].includes(hostname)) return false;
```

Improved:
```js
const configuredOrigins = process.env.ALLOWED_ORIGINS.split(",");
if (configuredOrigins.includes(origin)) return true;
if (process.env.NODE_ENV === "production") return false;
```

## Page coverage

- `/`: unique local-services metadata, WebSite/LocalBusiness/WebPage/FAQ schema, entity content and internal links.
- `/about`: AboutPage metadata/schema and E-E-A-T company context.
- `/contact`: ContactPage metadata/schema and consistent NAP.
- `/applications`: service catalogue metadata and crawlable internal route links.
- `/applications/*`: dynamic canonical metadata, breadcrumbs and Service schema.
- `/blogs`: journal metadata and crawlable article cards.
- `/blogs/*`: unique BlogPosting metadata/schema, published/updated dates, TOC, reading time and related articles.
- `/cart`, `/checkout`, auth/profile/orders/booking routes and `/technician/*`: intentionally noindex.
- Unknown routes: noindex 404.

## Remaining launch inputs

These cannot be truthfully fabricated and must be supplied before launch:

1. Actual final canonical domain if it differs from `https://localpintu.com`.
2. GA4 measurement ID, Google Search Console token and Bing verification token.
3. Exact official Facebook/Instagram/YouTube/LinkedIn profile URLs.
4. Verified latitude/longitude and full postal street address for richer LocalBusiness data.
5. Real review counts/ratings. AggregateRating schema was intentionally not added because unsupported/fake ratings violate structured-data guidelines.
6. Google Tag Manager, Clarity or Meta Pixel IDs only if the business chooses those products and updates its privacy/consent policy.

## Validation checklist

- ESLint: pass.
- Vite production build: pass.
- Dynamic sitemap: 53 canonical URLs in current build.
- Backend syntax/module loading: pass.
- Structured data uses visible/truthful page facts; no fabricated reviews.
- SPA direct-route fallbacks: Netlify and Vercel configured.
- Production output: `Frontend/dist`.

After deployment, submit `/sitemap.xml` in Google Search Console and Bing Webmaster Tools, test representative pages in Google Rich Results Test and PageSpeed Insights, and monitor real-user Core Web Vitals. Lab targets cannot guarantee field CWV because TTFB, hosting, device/network and third-party scripts affect real measurements.
## Measured Lighthouse result

Final local production build, Chrome mobile throttling:

- SEO: **100**
- Accessibility: **100**
- Best Practices: **100**
- Performance: **56**
- CLS: **0**
- LCP: **4.1 s**
- FCP: **2.6 s**
- Speed Index: **3.5 s**

Performance improved after removing the forced 1.8-second loader, deferring the promotional modal, making geolocation user-initiated and shrinking the main service images. The remaining performance cost is primarily React/framer-motion main-thread work and shared CSS/JS. Reaching a stable 95+ mobile lab score would require a separate architectural pass (SSR/static prerendering, animation-system reduction and deeper CSS route isolation), which carries higher regression risk and was not silently forced into this no-redesign/no-feature-removal scope. Real field CWV must be measured after deployment.

Reports: `lighthouse-report-final.json` (final) and `lighthouse-report.json` (baseline).