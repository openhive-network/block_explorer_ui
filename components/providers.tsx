import React, { ReactNode, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ErrorBoundary } from "react-error-boundary";

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then(
            (m) => m.ReactQueryDevtools
          ),
        { ssr: false }
      )
    : () => null;

import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { I18nProvider } from "@/i18n/i18n";

import { HiveChainContextProvider } from "../contexts/HiveChainContext";
import { AddressesContextProvider } from "../contexts/AddressesContext";
import { HeadBlockContextProvider } from "@/contexts/HeadBlockContext";
import Layout from "./layout";
import useApiAddresses from "@/utils/ApiAddresses";
import ErrorPage from "@/pages/ErrorPage";
import { OperationTypesContextProvider } from "@/contexts/OperationsTypesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SearchesContextProvider } from "@/contexts/SearchesContext";
import { HealthCheckerContextProvider } from "@/contexts/HealthCheckerContext";
import { NodeSupportContextProvider } from "@/contexts/NodeSupportContext";
import { EndpointUnsupportedError } from "@/utils/nodeSupport";
import { nodeSupportStore } from "@/utils/nodeSupportStore";
import { WaxError } from "@hiveio/wax";

import { config } from "@/Config";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { WatchlistProvider } from "@/contexts/WatchlistContext";

// This component lives *inside* the SettingsProvider, so it can safely call useSettings().
// Its job is to manage the dynamic layout width based on the setting.
const DynamicLayoutManager: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { settings } = useSettings();

  useEffect(() => {
    // Map our setting value to the actual CSS width value
    const newWidth =
      settings.layoutWidth === "compact"
        ? config.compactViewPercentage
        : config.fullViewPercentage;

    // Set the CSS variable on the root <html> element
    document.documentElement.style.setProperty(
      "--page-container-width",
      newWidth
    );
  }, [settings.layoutWidth]);

  return <>{children}</>;
};

const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  // The logic that used useSettings() has been moved to the component above.
  const { apiAddress, nodeAddress } = useApiAddresses();

  // The home dashboard renders every widget with its own inline error/loading
  // state, so a global toast there just floods the screen on an incompatible
  // node. Track whether we're on home so onError can suppress request-error
  // toasts there only (kept on every other page). Read via ref so the memoized
  // onError closure always sees the current route.
  const router = useRouter();
  const isHomeRouteRef = useRef(false);
  useEffect(() => {
    isHomeRouteRef.current = router.pathname === "/";
  }, [router.pathname]);

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            enabled: apiAddress !== null && nodeAddress !== null,
            staleTime: 10000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (error instanceof EndpointUnsupportedError) {
                // A definitive missing route never retries; a transient
                // (status-less: timeout/network/CORS) failure gets a couple of
                // retries before it's allowed to stick.
                return error.transient && failureCount < 2;
              }
              return failureCount < 1;
            },
          },
        },

        queryCache: new QueryCache({
          onError: (error: any) => {
            // A missing endpoint is handled gracefully by the widget itself
            // (NodeSupportGate): record it for the active node and stay quiet.
            if (error instanceof EndpointUnsupportedError) {
              if (apiAddress)
                nodeSupportStore.report(apiAddress, error.supportKey);
              return;
            }
            // On home only, request failures are shown inline per widget — don't
            // also pop a global toast. Everywhere else the toast is the signal.
            if (isHomeRouteRef.current && error instanceof WaxError) return;
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
      <I18nProvider initialLocale="en">
        <SettingsProvider>
          <AuthContextProvider>
            <WatchlistProvider>
              <DynamicLayoutManager>
                <HiveChainContextProvider>
                  <AddressesContextProvider>
                    <ThemeProvider>
                      <HealthCheckerContextProvider>
                        <NodeSupportContextProvider>
                          <ErrorBoundary fallback={<ErrorPage />}>
                            <HeadBlockContextProvider>
                              <OperationTypesContextProvider>
                                <SearchesContextProvider>
                                  <Layout>{children}</Layout>
                                  <ReactQueryDevtools initialIsOpen={false} />
                                </SearchesContextProvider>
                              </OperationTypesContextProvider>
                            </HeadBlockContextProvider>
                          </ErrorBoundary>
                        </NodeSupportContextProvider>
                      </HealthCheckerContextProvider>
                    </ThemeProvider>
                  </AddressesContextProvider>
                </HiveChainContextProvider>
              </DynamicLayoutManager>
            </WatchlistProvider>
          </AuthContextProvider>
        </SettingsProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};

export default Providers;
