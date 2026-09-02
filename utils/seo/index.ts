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

// A configured canonical origin (trusted env). When set it takes precedence over
// request headers so canonical/OG/sitemap URLs can't be poisoned by a spoofed
// Host / X-Forwarded-Host behind a shared cache.
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.REACT_APP_SITE_URL ||
  ""
).replace(/\/+$/, "");

// Cache policy for the meta-only SSR pages. A shared-cacheable TTL is safe ONLY
// when the base is a configured origin (constant); a host-derived response is
// per-request and must never be shared-cached (else a spoofed Host could be
// served to others), so it is marked private/no-store.
export const SEO_LIST_CACHE_CONTROL = SITE_URL
  ? "public, s-maxage=300, stale-while-revalidate=600"
  : "private, no-store";

// Without a configured origin every SEO URL falls back to request headers, which
// costs shared caching and leaves canonical/OG/sitemap URLs host-derived. Fine
// for local dev; say so loudly on a server build so it isn't missed in prod.
if (
  typeof window === "undefined" &&
  !SITE_URL &&
  process.env.NODE_ENV === "production"
) {
  console.warn(
    "[seo] NEXT_PUBLIC_SITE_URL / REACT_APP_SITE_URL is not set — canonical, OG " +
      "and sitemap URLs will be derived from request headers and cannot be " +
      "shared-cached. Set it to the public origin (e.g. https://hivescan.info)."
  );
}

// Resolve the deployment's absolute base URL. Prefer the configured origin;
// fall back to the (proxy-aware) request host so zero-config deploys still work.
export const absoluteBaseUrl = (req: SeoRequest): string => {
  if (SITE_URL) return `${SITE_URL}${BASE_PATH}`;
  const proto =
    String(req.headers["x-forwarded-proto"] || "").split(",")[0] || "https";
  const host =
    (req.headers["x-forwarded-host"] as string) ||
    (req.headers["host"] as string) ||
    "";
  return host ? `${proto}://${host}${BASE_PATH}` : BASE_PATH;
};

// Escape a value for inclusion in XML text/attributes (sitemap <loc>).
export const escapeXml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    c === "&"
      ? "&amp;"
      : c === "<"
        ? "&lt;"
        : c === ">"
          ? "&gt;"
          : c === '"'
            ? "&quot;"
            : "&apos;"
  );

export const canonicalUrl = (req: SeoRequest, path: string): string => {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${absoluteBaseUrl(req)}${p === "/" ? "" : p}` || "/";
};

// Serialize a JSON-LD object for injection inside a <script> tag. JSON.stringify
// does NOT escape `<`, so a value containing `</script>` would break out of the
// tag (XSS). Neutralize `<` and the line/paragraph separators that are valid in
// JSON strings but not in JS source.
export const serializeJsonLd = (jsonLd: unknown): string =>
  JSON.stringify(jsonLd).replace(
    /[<\u2028\u2029]/g,
    (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")
  );

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

// Both generated share images render at this size; unfurlers need it declared.
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string | null;
  ogImageAlt?: string;
  ogType?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

// Page title with the site name appended, unless it already is the site name.
export const pageTitle = (title?: string): string =>
  title && title !== siteConfig.name
    ? `${title} | ${siteConfig.name}`
    : siteConfig.name;

// Keeps "block explorer" in the home title when the brand name does not already say it.
export const siteNameSaysExplorer = /explorer/i.test(siteConfig.name);

// Brand social profiles for the Organization `sameAs` (helps Google associate
// the site with its accounts). Ops sets a comma-separated list of profile URLs
// in NEXT_PUBLIC_SITE_SOCIAL_PROFILES (or REACT_APP_*); the X/Twitter handle in
// siteConfig.twitter is folded in automatically.
export const socialProfiles = (): string[] => {
  const listed = (
    process.env.NEXT_PUBLIC_SITE_SOCIAL_PROFILES ||
    process.env.REACT_APP_SITE_SOCIAL_PROFILES ||
    ""
  )
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
  const twitter = siteConfig.twitter
    ? `https://x.com/${siteConfig.twitter.replace(/^@/, "")}`
    : null;
  return [...(twitter ? [twitter] : []), ...listed].filter(
    (v, i, a) => a.indexOf(v) === i
  );
};

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

export const organizationJsonLd = (base: string): Record<string, unknown> => {
  const sameAs = socialProfiles();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: base || "/",
    ...(sameAs.length ? { sameAs } : {}),
  };
};

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

// Meta for a utility or parameterized view that shouldn't be indexed — a thin
// page, an internal search, or a slice of data that already has a canonical home
// elsewhere. Still declares a canonical so the URL consolidates correctly.
// NOTE: this must come from getServerSideProps. A <Head> in the page body sits
// under the hiveChain-gated <Layout>, which renders null on the server, so a
// crawler would never see the robots tag.
export const noindexMeta = (
  req: SeoRequest,
  path: string,
  title: string,
  description = ""
): SeoMeta => ({
  title: pageTitle(title),
  description: clamp(description),
  canonical: canonicalUrl(req, path),
  noindex: true,
});

// 404 meta: no canonical, no description. Title is passed in so en.json stays out of the client bundle.
export const notFoundMeta = (title: string): SeoMeta => ({
  title: pageTitle(title),
  description: "",
  canonical: "",
  noindex: true,
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
    ogImageAlt: full,
    jsonLd: collectionPageJsonLd(canonical, full, desc),
  };
};
