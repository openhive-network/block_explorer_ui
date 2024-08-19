import type { AppProps } from "next/app";

import "@/styles/globals.css";
import Providers from "@/components/providers";

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
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
