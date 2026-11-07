import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import { verification } from "@/utils/seo";
import { isLoginMethodEnabled } from "@/utils/deploySettings";

export default function Document() {
  // Get basePath from Next.js config (set at build time)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href={`${basePath}/favicon.ico`} />
        {verification.google && (
          <meta name="google-site-verification" content={verification.google} />
        )}
        {verification.bing && (
          <meta name="msvalidate.01" content={verification.bing} />
        )}
        {/* A boolean only: never put a Hivesigner setting's value in the page.
            Emitted only when Hivesigner login is on (which needs its settings):
            the reader checks `=== true`, and a site without it then serves no
            inline script, so a CSP without 'unsafe-inline' has nothing to block. */}
        {isLoginMethodEnabled("hivesigner") && (
          <script
            dangerouslySetInnerHTML={{
              __html: "window.__HIVESIGNER_READY__=true;",
            }}
          />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script src={`${basePath}/__ENV.js`} strategy="beforeInteractive" />
      </body>
    </Html>
  );
}
