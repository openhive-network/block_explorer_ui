import { useMemo, type ReactNode } from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import Layout from "./layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAddressesContext } from "./contexts/AddressesContext";
import { toast } from "sonner";

const Providers = ({ children }: { children: ReactNode }) => {
  const { apiAddress, nodeAddress } = useAddressesContext();

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
    <QueryClientProvider client={queryClient}>
      <Layout>{children}</Layout>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default Providers;
