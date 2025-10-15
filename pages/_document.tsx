import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  // Get basePath from Next.js config (set at build time)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href={`${basePath}/favicon.ico`} />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script src={`${basePath}/__ENV.js`} strategy='beforeInteractive' />
      </body>
    </Html>
  )
}
