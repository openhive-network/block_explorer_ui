import Head from "next/head";
import { SeoMeta, siteConfig, serializeJsonLd } from "@/utils/seo";

interface SeoProps {
  meta: SeoMeta;
  // Client-localized title override (SSR renders English, the client swaps in
  // the user's locale) — keeps the browser tab localized without losing the
  // server-rendered title crawlers read.
  title?: string;
}

const Seo: React.FC<SeoProps> = ({ meta, title: titleOverride }) => {
  const { description, canonical, ogImage, ogType, noindex, jsonLd } = meta;
  const title = titleOverride ?? meta.title;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,follow" />}
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType || "website"} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta
        name="twitter:card"
        content={ogImage ? "summary_large_image" : "summary"}
      />
      {siteConfig.twitter && (
        <meta name="twitter:site" content={siteConfig.twitter} />
      )}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      )}
    </Head>
  );
};

export default Seo;
