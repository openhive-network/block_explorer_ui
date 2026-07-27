import type { GetServerSideProps } from "next";
import { absoluteBaseUrl } from "@/utils/seo";

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
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.write(body);
  res.end();
  return { props: {} };
};

export default Robots;
