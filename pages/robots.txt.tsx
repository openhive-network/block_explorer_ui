import type { GetServerSideProps } from "next";
import { absoluteBaseUrl, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";

const Robots = () => null;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const base = absoluteBaseUrl(req);
  const body = [
    "User-agent: *",
    "Allow: /",
    // Allow the OG share-image routes; block the rest of the API.
    "Allow: /api/og/",
    "Disallow: /api/",
    "Disallow: /settings",
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  // The Sitemap: line is host-derived without a configured origin — same
  // shared-cache hazard as the sitemap itself.
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  res.write(body);
  res.end();
  return { props: {} };
};

export default Robots;
