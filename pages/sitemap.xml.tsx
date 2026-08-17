import type { GetServerSideProps } from "next";
import {
  absoluteBaseUrl,
  escapeXml,
  SEO_LIST_CACHE_CONTROL,
} from "@/utils/seo";

// Entity pages (accounts, blocks, transactions) number in the millions, so the
// sitemap lists only the stable index routes; crawlers reach entity pages via
// internal links. Base URL is resolved per-request so it's domain-agnostic.
const STATIC_ROUTES: { path: string; changefreq: string; priority: string }[] =
  [
    { path: "/", changefreq: "hourly", priority: "1.0" },
    { path: "/witnesses", changefreq: "hourly", priority: "0.9" },
    { path: "/proposals", changefreq: "daily", priority: "0.8" },
    { path: "/communities", changefreq: "daily", priority: "0.7" },
    { path: "/top-holders", changefreq: "daily", priority: "0.7" },
    { path: "/blocks", changefreq: "hourly", priority: "0.6" },
    { path: "/schedule", changefreq: "hourly", priority: "0.5" },
    { path: "/tools/compare", changefreq: "weekly", priority: "0.6" },
    { path: "/tools/bad-actors", changefreq: "weekly", priority: "0.5" },
  ];

const SiteMap = () => null;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const base = absoluteBaseUrl(req);
  const urls = STATIC_ROUTES.map(({ path, changefreq, priority }) => {
    const loc = escapeXml(`${base}${path === "/" ? "" : path}` || base || "/");
    return `  <url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // Every <loc> is built from absoluteBaseUrl, so without a configured origin
  // this body is host-derived and must not be shared-cached — a spoofed Host
  // would otherwise be served to every later crawler.
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  res.write(xml);
  res.end();
  return { props: {} };
};

export default SiteMap;
