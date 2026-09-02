import Head from "next/head";
import {
  SeoMeta,
  siteConfig,
  serializeJsonLd,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
} from "@/utils/seo";

interface SeoProps {
  meta: SeoMeta;
  // Client-localized title override (SSR renders English, the client swaps in
  // the user's locale) — keeps the browser tab localized without losing the
  // server-rendered title crawlers read.
  title?: string;
}

const Seo: React.FC<SeoProps> = ({ meta, title: titleOverride }) => {
  const {
    description,
    canonical,
    ogImage,
    ogImageAlt,
    ogType,
    noindex,
    jsonLd,
  } = meta;
  const title = titleOverride ?? meta.title;
  // Omit rather than emit an empty description.
  const hasDescription = Boolean(description);
  return (
    <Head>
      <title>{title}</title>
      {hasDescription && <meta name="description" content={description} />}
      {/* key so the App-level <Seo> and the per-page <Seo> collapse to one link
          (next/head only auto-dedupes title + meta, not <link>/<script>).
          (next/head only auto-dedupes title + meta, not <link>/<script>). */}
      {canonical && (
        <link rel="canonical" href={canonical} key="seo-canonical" />
      )}
      {noindex && <meta name="robots" content="noindex,follow" />}
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:title" content={title} />
      {hasDescription && (
        <meta property="og:description" content={description} />
      )}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:type" content={ogType || "website"} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && (
        <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
      )}
      {ogImage && (
        <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
      )}
      {ogImage && (
        <meta property="og:image:alt" content={ogImageAlt || title} />
      )}
      <meta
        name="twitter:card"
        content={ogImage ? "summary_large_image" : "summary"}
      />
      {siteConfig.twitter && (
        <meta name="twitter:site" content={siteConfig.twitter} />
      )}
      <meta name="twitter:title" content={title} />
      {hasDescription && (
        <meta name="twitter:description" content={description} />
      )}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {ogImage && (
        <meta name="twitter:image:alt" content={ogImageAlt || title} />
      )}
      {jsonLd && (
        <script
          key="seo-jsonld"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      )}
    </Head>
  );
};

export default Seo;
