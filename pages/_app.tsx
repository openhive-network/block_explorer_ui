import { useMemo } from "react";
import type { AppProps } from "next/app";
import { ErrorBoundary } from "react-error-boundary";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast } from "sonner";

import "@/styles/globals.css";
import Context from "@/components/context";
import ErrorPage from "@/pages/ErrorPage";

import useApiAddresses from "@/utils/ApiAddresses";

export default function App({ Component, pageProps }: AppProps) {
  const { apiAddress, nodeAddress } = useApiAddresses();
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            enabled: apiAddress !== null && nodeAddress !== null,
          },
        },
        queryCache: new QueryCache({
          onError: (error: any) => {
            toast.error("Error occured", {
              description: `${(error as Error).message}`,
            });
          },
        }),
      }),
    [apiAddress, nodeAddress]
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary fallback={<ErrorPage />}>
        <Context>
          <Component {...pageProps} />
        </Context>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
