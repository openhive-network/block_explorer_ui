import type { AppProps } from "next/app";
import { ErrorBoundary } from "react-error-boundary";
import Context from "@/components/context";
import Providers from "@/components/providers";
import "@/styles/globals.css";
import ErrorPage from "@/pages/ErrorPage";
import useApiAddresses from "@/utils/ApiAddresses";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {

  const {nodeAddressFromLocalStorage, apiAddressFromLocalStorage, writeNodeAddressToLocalStorage, writeApiAddressToLocalStorage} = useApiAddresses();

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
