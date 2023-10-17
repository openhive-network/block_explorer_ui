import type { AppProps } from "next/app";
import Context from "@/components/context";
import Providers from "@/components/providers";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Context>
      <Providers>
        <Component {...pageProps} />
      </Providers>
    </Context>
  );
}
