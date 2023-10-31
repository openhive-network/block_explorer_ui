import type { AppProps } from "next/app";
import Context from "@/components/context";
import Providers from "@/components/providers";
import "@/styles/globals.css";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "@/components/ErrorPage";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Context>
        <Providers>
          <Component {...pageProps} />
        </Providers>
      </Context>
    </ErrorBoundary>
  );
}
