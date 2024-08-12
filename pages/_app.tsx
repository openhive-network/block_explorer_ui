import type { AppProps } from "next/app";
import { ErrorBoundary } from "react-error-boundary";
import Context from "@/components/context";
import "@/styles/globals.css";
import ErrorPage from "@/pages/ErrorPage";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Context>
        <Component {...pageProps} />
      </Context>
    </ErrorBoundary>
  );
}
