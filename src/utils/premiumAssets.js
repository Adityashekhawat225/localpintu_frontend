import ac from "../assets/premium/webp/hero-ac-branded.webp";
import electrician from "../assets/premium/webp/service-electrician-branded.webp";
import plumbing from "../assets/premium/webp/service-plumbing-branded.webp";
import appliance from "../assets/premium/webp/service-appliance-branded.webp";
import editorial from "../assets/blog-premium/localpintu-journal-hero.optimized.webp";
import blogAppliance from "../assets/blog-premium/localpintu-appliance-editorial.optimized.webp";
import blogCleaning from "../assets/blog-premium/localpintu-cleaning-editorial.optimized.webp";
import homeRepair from "../assets/service-catalog/home-repair.optimized.webp";
import interiors from "../assets/service-catalog/interiors.optimized.webp";
import cleaning from "../assets/service-catalog/cleaning.optimized.webp";
import pestControl from "../assets/service-catalog/pest-control-branded.webp";
import painting from "../assets/service-catalog/painting-branded.webp";
import carpentry from "../assets/service-catalog/carpentry.optimized.webp";
import moving from "../assets/service-catalog/moving.optimized.webp";

const blogImages = import.meta.glob("../assets/blog-premium/*.webp", { eager: true, import: "default", query: "?url" });
const brandedBlogImages = import.meta.glob("../assets/blog-premium/branded/*.webp", { eager: true, import: "default", query: "?url" });
const editorialBlogImages = {
  "localpintu-journal-hero.optimized": editorial,
  "localpintu-appliance-editorial.optimized": blogAppliance,
  "localpintu-cleaning-editorial.optimized": blogCleaning,
};
const normalized = (value) => String(value || "").toLowerCase();
const blogImageEntries = Object.entries(blogImages).map(([path, image]) => {
  const filename = path.split("/").pop();
  return [path, brandedBlogImages[`../assets/blog-premium/branded/${filename}`] || image];
});
const serviceCardPalette = [...new Set([homeRepair, cleaning, interiors, pestControl, painting, carpentry, moving, appliance, electrician, plumbing, ...blogImageEntries.map(([, image]) => image)])];
import { API_ORIGIN as apiOrigin } from "../services/apiConfig";
const databaseImage = (value) => {
  const source = String(value || "").trim();
  if (!source) return null;
  if (/^https?:/i.test(source)) {
    const url = new URL(source);
    if (["localhost", "127.0.0.1", "localpintu-backend.onrender.com"].includes(url.hostname)) return `${apiOrigin}${url.pathname}${url.search}`;
    return source;
  }
  if (/^(data:image\/|blob:)/i.test(source)) return source;
  if (source.startsWith("//")) return `https:${source}`;
  if (apiOrigin && /^(\/?catalog\/|\/?uploads\/)/.test(source)) return new URL(source, `${apiOrigin}/`).href;
  if (source.startsWith("/") && apiOrigin) return `${apiOrigin}${source}`;
  return null;
};
const visualSeed = (item) => String(item?.slug || item?.title || "localpintu").split("").reduce((total, char) => total + char.charCodeAt(0), 0);
const serviceCatalogImageMap = new Map([
  ["home-repair.jpg", homeRepair],
  ["home-repair.webp", homeRepair],
  ["interiors.jpg", interiors],
  ["interiors.webp", interiors],
  ["cleaning.jpg", cleaning],
  ["cleaning.webp", cleaning],
  ["pest-control.jpg", pestControl],
  ["pest-control.webp", pestControl],
  ["painting.jpg", painting],
  ["painting.webp", painting],
  ["carpentry.jpg", carpentry],
  ["carpentry.webp", carpentry],
  ["moving.jpg", moving],
  ["moving.webp", moving],
  ["appliance-repair-services-in-jaipur.webp", appliance],
]);
const resolveLegacyServiceCatalogImage = (image) => {
  const match = String(image || "").toLowerCase().match(/service-catalog\/([^/?#]+)/);
  if (!match) return null;
  return serviceCatalogImageMap.get(match[1]) || null;
};

export function serviceVisual(item, index = null) {
  const text = normalized(`${item?.title} ${item?.slug} ${item?.category}`);
  // The service image managed in Admin is stored as `icon`.  It must take
  // precedence over the branded fallback artwork so an admin update is
  // reflected on every customer-facing service card.
  const adminIcon = databaseImage(item?.icon);
  if (adminIcon) return adminIcon;
  const resolvedImage = resolveLegacyServiceCatalogImage(item?.image);
  if (resolvedImage) return resolvedImage;
  const directImage = databaseImage(item?.image);
  if (directImage) return directImage;
  if (index !== null) return serviceCardPalette[Math.abs(index) % serviceCardPalette.length];
  if (String(item?.image || "").includes("service-catalog/")) return serviceCardPalette[Math.abs(visualSeed(item)) % serviceCardPalette.length];
  if (/interior|renovation|modular|wardrobe|design consultation/.test(text)) return interiors;
  if (/clean|sofa|mattress|carpet/.test(text)) return cleaning;
  if (/pest|termite|cockroach|bed bug|ant control/.test(text)) return pestControl;
  if (/paint|waterproof|seepage/.test(text)) return painting;
  if (/carpentry|furniture|cabinet|drawer|door|hinge|wardrobe assembly/.test(text)) return carpentry;
  if (/moving|move|shifting|packing|assembly/.test(text)) return moving;
  if (/electric|smart home|camera|doorbell|wiring|socket|fan|light|microwave|oven/.test(text)) return electrician;
  if (/plumb|water|ro |purifier|kitchen|sink|tap|drain|bathroom fixture/.test(text)) return plumbing;
  if (/ac |air.condition|cool/.test(text)) return ac;
  if (/wash|refriger|appliance/.test(text)) return appliance;
  if (/repair|handyman|fixture|mounting/.test(text)) return homeRepair;
  return serviceCardPalette[Math.abs(index ?? visualSeed(item)) % serviceCardPalette.length];
}

export function blogVisual(item) {
  const slug = String(item?.slug || "").trim().toLowerCase();
  const brandedImage = brandedBlogImages[`../assets/blog-premium/branded/${slug}.webp`];
  if (brandedImage) return brandedImage;
  const uniqueImage = blogImages[`../assets/blog-premium/${slug}.webp`];
  if (uniqueImage) return uniqueImage;
  if (editorialBlogImages[slug]) return editorialBlogImages[slug];
  return item?.image || editorial;
}

export function blogReadingTime(item) {
  const words = String(item?.content || item?.excerpt || "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

export function blogPublishDate(item) {
  const value = item?.publishedAt || item?.createdAt;
  if (!value) return "Expert guide";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export { ac, electrician, plumbing, appliance, editorial };
