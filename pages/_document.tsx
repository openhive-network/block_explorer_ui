import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import { verification } from "@/utils/seo";
import { isHivesignerReady } from "@/utils/deploySettings";

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
        {/* A boolean only: never put a Hivesigner setting's value in the page. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__HIVESIGNER_READY__=${isHivesignerReady};`,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script src={`${basePath}/__ENV.js`} strategy="beforeInteractive" />
      </body>
    </Html>
  );
}
