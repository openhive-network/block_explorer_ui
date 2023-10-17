import { useMemo, type ReactNode } from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import Layout from "./layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAlertContext } from "./contexts/AlertContext";

const Providers = ({ children }: { children: ReactNode }) => {
  const { setAlerts } = useAlertContext();

  const queryClient = useMemo(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            setAlerts([
              { type: "error", message: `Error: ${(error as Error).message}` },
            ]);
          },
        }),
      }),
    [setAlerts]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>{children}</Layout>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default Providers;
