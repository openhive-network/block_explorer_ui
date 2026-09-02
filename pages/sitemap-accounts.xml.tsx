import type { GetServerSideProps } from "next";
import {
  absoluteBaseUrl,
  escapeXml,
  SEO_LIST_CACHE_CONTROL,
} from "@/utils/seo";
import { isAccountName } from "@/utils/seo/entityIds";
import { rpcOrNull } from "@/utils/seo/serverRpc";

// Seeds /@account discovery: millions of accounts cannot be listed, the ranked witness set can.
const WITNESS_COUNT = 100;

const SITEMAP_LOOKUP_TIMEOUT_MS = 4000;

const SiteMapAccounts = () => null;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const base = absoluteBaseUrl(req);

  const witnesses = await rpcOrNull<{ owner?: string }[]>(
    "condenser_api.get_witnesses_by_vote",
    [null, WITNESS_COUNT],
    SITEMAP_LOOKUP_TIMEOUT_MS
  );

  // A node hiccup yields a valid empty urlset, never a partial body.
  const names = Array.from(
    new Set(
      (witnesses || [])
        .map((w) => String(w?.owner || ""))
        .filter((n) => isAccountName(n))
    )
  );

  const urls = names
    .map(
      (n) =>
        `  <url><loc>${escapeXml(`${base}/@${n}`)}</loc><changefreq>daily</changefreq><priority>0.6</priority></url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // Same host-derived <loc> hazard as sitemap.xml.
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  res.write(xml);
  res.end();
  return { props: {} };
};

export default SiteMapAccounts;
