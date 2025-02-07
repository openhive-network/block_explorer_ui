import React, { ReactNode, useMemo } from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ErrorBoundary } from "react-error-boundary";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { UserSettingsContextProvider } from "../contexts/UserSettingsContext";
import { HiveChainContextProvider } from "../contexts/HiveChainContext";
import { HeadBlockContextProvider } from "@/contexts/HeadBlockContext";
import Layout from "./layout";
import useApiAddresses from "@/utils/ApiAddresses";
import ErrorPage from "@/pages/ErrorPage";
import { OperationTypesContextProvider } from "@/contexts/OperationsTypesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { HealthCheckerContextProvider } from "@/contexts/HealthCheckerContext";
import { ApiAddressesContextProvider } from "@/contexts/ApiAddressesContext";

const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
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
              style: {
                background: "red",
              },
            });
          },
        }),
      }),
    [apiAddress, nodeAddress]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary fallback={<ErrorPage />}>
        <ThemeProvider>
          <HiveChainContextProvider>
            <ApiAddressesContextProvider>
              <HealthCheckerContextProvider>
                <UserSettingsContextProvider>
                  <HeadBlockContextProvider>
                    <OperationTypesContextProvider>
                      <Layout>{children}</Layout>
                      <ReactQueryDevtools initialIsOpen={false} />
                    </OperationTypesContextProvider>
                  </HeadBlockContextProvider>
                </UserSettingsContextProvider>
              </HealthCheckerContextProvider>
            </ApiAddressesContextProvider>
          </HiveChainContextProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default Providers;
