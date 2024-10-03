import type { AppProps } from "next/app";

import "@/styles/theme.css";
import Providers from "@/components/providers";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
