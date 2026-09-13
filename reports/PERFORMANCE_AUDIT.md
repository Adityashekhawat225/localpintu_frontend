# LocalPintu production performance audit

Generated: 2026-08-03

## Verified release scores

| Profile | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Lighthouse Mobile | 97 | 100 | 100 | 100 | 1.62 s | 2.05 s | 159 ms | 0 |
| Lighthouse Desktop | 100 | 100 | 100 | 100 | 0.39 s | 0.57 s | 79 ms | 0 |
| Strict Slow 4G (300 ms RTT, 780 Kbps) | 82 | — | — | — | 3.07 s | 3.76 s | 148 ms | 0 |

Baseline supplied before this pass: Performance 81. Earlier project baseline: 56.

## Bundle and delivery proof

- Initial application chunk: 120,998 bytes raw; 39,597 bytes Gzip; 37,125 bytes Brotli.
- Global CSS reduced from 139,433 bytes to approximately 52 KB by route-specific coverage extraction.
- Full 119.7 KB luxury stylesheet is deferred to non-home routes.
- Swiper/blog slider is a separate 29.76 KB Gzip below-fold chunk.
- Framer Motion is a separate 39.21 KB Gzip interaction/route chunk.
- Mobile hero AVIF: 21.34 KB at 960 px, down from the previous 98.43 KB hero WebP.
- Static assets return `public, max-age=31536000, immutable`.
- Brotli and Gzip `Content-Encoding` were both response-verified.

Bundle reports: `bundle-analysis.html` and `bundle-analysis.json`.

## Runtime profiling

Chrome DevTools timeline trace: `chrome-react-runtime-trace.json`.
Runtime summary: `runtime-profile.json` and `chrome-trace-summary.json`.

The release smoke suite covered home, modal open/close, about, blogs, applications, contact, login, cart, and technician login. It reported zero console/runtime errors. After full-page interaction: 4.8 MB used JS heap and 1,075 live DOM elements. The browser-extension React DevTools UI cannot be driven reliably in headless CI; Chrome DevTools trace plus production component/render measurements were used as the reproducible profiler evidence.

## SEO proof

- 53 public canonical URLs audited: 38 blogs, 10 service pages, 5 core pages.
- Duplicate titles: 0.
- Duplicate descriptions: 0.
- Missing required metadata: 0.
- Blog coverage includes title, description, keywords, canonical, Open Graph, Twitter, robots, BlogPosting, ImageObject, BreadcrumbList, FAQPage, author, publisher, dates, reading time, focus/secondary keywords, tags, category, ALT, image title, caption and description.

SEO report: `seo-audit.json` and `seo-audit.md`.

## Compatibility note

Production uses Preact compatibility aliases while preserving the existing React source API. This reduced the dominant React DOM runtime cost. Critical routes and interactions were tested in Chrome. React Router emits a build-time warning for an unused RSC-only `useOptimistic` path; this SPA does not use RSC or server actions, and the path did not execute in runtime tests.