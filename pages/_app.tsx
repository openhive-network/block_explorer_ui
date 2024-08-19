import type { AppProps } from "next/app";
import { ErrorBoundary } from "react-error-boundary";
import Context from "@/components/context";
import "@/styles/globals.css";
import ErrorPage from "@/pages/ErrorPage";
import { useMemo } from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import useApiAddresses from "@/utils/ApiAddresses";
import { toast } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  const {
    apiAddress,
    nodeAddress,
    writeApiAddressToLocalStorage,
    writeNodeAddressToLocalStorage,
  } = useApiAddresses();

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            enabled: apiAddress !== null && nodeAddress !== null,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            toast.error("Error occured", {
              description: `${(error as Error).message}`,
            });
          },
        }),
      }),
    [apiAddress, nodeAddress]
  );

  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <QueryClientProvider client={queryClient}>
        <Context
          apiAddresses={{
            apiAddress,
            nodeAddress,
            writeApiAddressToLocalStorage,
            writeNodeAddressToLocalStorage,
          }}
        >
          <Component {...pageProps} />
        </Context>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
