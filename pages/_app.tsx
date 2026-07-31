import type { AppProps } from "next/app";

import "@/styles/theme.css";
import Providers from "@/components/providers";
import Seo from "@/components/seo/Seo";
import type { SeoMeta } from "@/utils/seo";

export default function App({ Component, pageProps }: AppProps) {
  // The SEO <Head> must render OUTSIDE the hiveChain-gated <Layout> (which returns
  // null during SSR), otherwise the tags never reach the server HTML and crawlers
  // see nothing. getServerSideProps already returns the meta as pageProps.meta,
  // so emit it here, above <Providers>. Pages still render their own <Seo> for the
  // client-localized title; the keyed canonical/JSON-LD tags dedupe.
  const meta = (pageProps as { meta?: SeoMeta }).meta;
  return (
    <>
      {meta && <Seo meta={meta} />}
      <Providers>
        <Component {...pageProps} />
      </Providers>
    </>
  );
}
