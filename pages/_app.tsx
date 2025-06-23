import type { AppProps } from "next/app";

import "@/styles/theme.css";
import Providers from "@/components/providers";
import { I18nProvider } from "../i18n/i18n"; 

export default function App({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider initialLocale="en">
      <Providers>
        <Component {...pageProps} />
      </Providers>
    </I18nProvider>
  );
}
