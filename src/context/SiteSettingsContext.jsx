/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSiteSettings } from "../services/api";

export const SITE_DEFAULTS = {
  logoUrl: "",
  primaryColor: "#35213f", secondaryColor: "#b08a58", announcementText: "",
  heroEyebrow: "Trusted home services, thoughtfully delivered", heroTitle: "Everything your home needs,", heroHighlight: "handled by experts.", heroDescription: "Repairs and essential home care with verified professionals, clear service plans and convenient doorstep visits.", heroImageUrl: "",
  businessName: "LocalPintu", phoneDisplay: "+91 70233 20977", phoneDial: "+917023320977",
  email: "info@localpintu.com", addressLine1: "Coral Tower, Narendra Nagar, Sodala",
  addressLine2: "Jaipur, Rajasthan · 302019", openingHours: "8 AM – 8 PM",
  facebookUrl: "", instagramUrl: "", youtubeUrl: "", linkedinUrl: "",
  notFoundEyebrow: "Lost, but never left behind", notFoundTitle: "This page took a different route.",
  notFoundDescription: "The address may have changed, but expert home care is still only one click away.",
  notFoundVideoUrl: "", notFoundPosterUrl: "", notFoundCtaLabel: "Return home",
};
const SiteSettingsContext = createContext(SITE_DEFAULTS);
export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(SITE_DEFAULTS);
  useEffect(() => { let alive = true; getSiteSettings().then((value) => { if (alive) setSettings({ ...SITE_DEFAULTS, ...value }); }).catch(() => {}); return () => { alive = false; }; }, []);
  const value = useMemo(() => ({ ...settings, phoneHref: `tel:${settings.phoneDial || SITE_DEFAULTS.phoneDial}`, emailHref: `mailto:${settings.email || SITE_DEFAULTS.email}`, fullAddress: [settings.addressLine1, settings.addressLine2].filter(Boolean).join(", ") }), [settings]);
  return <SiteSettingsContext.Provider value={value}><div style={{ "--lp-primary": value.primaryColor, "--lp-secondary": value.secondaryColor, "--lp-secondary-active": value.secondaryColor, "--lp-gradient": `linear-gradient(135deg, ${value.primaryColor}, ${value.secondaryColor})` }}>{children}</div></SiteSettingsContext.Provider>;
}
export const useSiteSettings = () => useContext(SiteSettingsContext);

