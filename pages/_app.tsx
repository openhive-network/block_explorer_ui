import type { AppProps } from "next/app";

import "@/styles/theme.css";
import Providers from "@/components/providers";
import { I18nProvider } from "../i18n/i18n"; 
import { SettingsProvider } from "@/contexts/SettingsContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider initialLocale="en">
      <SettingsProvider>
        <Providers>
          <Component {...pageProps} />
        </Providers>
      </SettingsProvider>
    </I18nProvider>
  );
}