import { useMemo, type ReactNode } from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import Layout from "./layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAlertContext } from "./contexts/AlertContext";
import { useAddressesContext } from "./contexts/AddressesContext";

const Providers = ({ children }: { children: ReactNode }) => {
  const { setAlerts } = useAlertContext();
  const { apiAddress, nodeAddress } = useAddressesContext();

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            enabled: apiAddress !== null && nodeAddress !== null,
          }
        },
        queryCache: new QueryCache({
          onError: (error) => {
            setAlerts([
              { type: "error", message: `Error: ${(error as Error).message}` },
            ]);
          },
        }),
      }),
    [setAlerts, apiAddress, nodeAddress]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>{children}</Layout>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default Providers;
