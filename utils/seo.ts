export interface SeoRequest {
  headers: Record<string, string | string[] | undefined>;
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Hive Block Explorer",
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "Hive Explorer",
  twitter: process.env.NEXT_PUBLIC_SITE_TWITTER || "",
};

// Search-engine ownership-verification tokens. Set as env on the deployment
// (NEXT_PUBLIC_* at build time, or REACT_APP_* at container runtime) — no code
// change needed to verify a domain in Google/Bing.
export const verification = {
  google:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
    process.env.REACT_APP_GOOGLE_SITE_VERIFICATION ||
    "",
  bing:
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ||
    process.env.REACT_APP_BING_SITE_VERIFICATION ||
    "",
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Resolve the deployment's absolute base URL from the request (proxy-aware) so
// SEO output is correct on any domain without hardcoding one.
export const absoluteBaseUrl = (req: SeoRequest): string => {
  const proto =
    String(req.headers["x-forwarded-proto"] || "").split(",")[0] || "https";
  const host =
    (req.headers["x-forwarded-host"] as string) ||
    (req.headers["host"] as string) ||
    "";
  return host ? `${proto}://${host}${BASE_PATH}` : BASE_PATH;
};

export const canonicalUrl = (req: SeoRequest, path: string): string => {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${absoluteBaseUrl(req)}${p === "/" ? "" : p}` || "/";
};

// Default share image for pages without their own. Falls back to the generated
// cover route (/api/og/cover); deployments can override with an absolute URL or
// a site-relative path via NEXT_PUBLIC_DEFAULT_OG_IMAGE / REACT_APP_DEFAULT_OG_IMAGE.
export const defaultOgImage = (base: string): string => {
  const img =
    process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE ||
    process.env.REACT_APP_DEFAULT_OG_IMAGE ||
    "";
  if (img) {
    return /^https?:\/\//i.test(img)
      ? img
      : `${base}${img.startsWith("/") ? img : `/${img}`}`;
  }
  return `${base}/api/og/cover`;
};

export const clamp = (s: string, n = 160): string =>
  s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string | null;
  ogType?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

// Page title with the site name appended, unless it already is the site name.
export const pageTitle = (title?: string): string =>
  title && title !== siteConfig.name
    ? `${title} | ${siteConfig.name}`
    : siteConfig.name;

// --- JSON-LD builders -------------------------------------------------------

export const webSiteJsonLd = (
  base: string,
  description: string
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: base || "/",
  description,
});

export const organizationJsonLd = (base: string): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: base || "/",
});

export const breadcrumbJsonLd = (
  base: string,
  trail: { name: string; path: string }[]
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: `${base}${t.path}`,
  })),
});

export const profilePageJsonLd = (
  canonical: string,
  handle: string
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: canonical,
  mainEntity: {
    "@type": "Person",
    name: handle,
    alternateName: handle,
    identifier: handle.replace(/^@/, ""),
  },
});

export const collectionPageJsonLd = (
  canonical: string,
  name: string,
  description: string
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name,
  description,
  url: canonical,
});

// Meta for a static index/list route (witnesses, proposals, …).
export const listPageMeta = (
  req: SeoRequest,
  path: string,
  title: string,
  description: string
): SeoMeta => {
  const canonical = canonicalUrl(req, path);
  const full = pageTitle(title);
  const desc = clamp(description);
  return {
    title: full,
    description: desc,
    canonical,
    ogType: "website",
    ogImage: defaultOgImage(absoluteBaseUrl(req)),
    jsonLd: collectionPageJsonLd(canonical, full, desc),
  };
};
