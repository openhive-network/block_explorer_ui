import type { ReactNode } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import { Toaster } from "sonner";
import { useHiveChainContext } from "@/contexts/HiveChainContext";

import { ApiChecker } from "@/services/HealthCheckerService";
import { ExplorerNodeApi } from "@/types/Node";
import { config } from "@/Config";
import { useApiAddressesContext } from "@/contexts/ApiAddressesContext";
import { HealthCheckerServiceContextProvider } from "@/contexts/HealthCheckerServiceContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const {hiveChain} = useHiveChainContext();
  if (!hiveChain) return null;

  const {nodeAddress, setNodeAddress} = useApiAddressesContext();

  const extendedHiveChain = hiveChain
  ?.extend<ExplorerNodeApi>();

  const apiCheckers: ApiChecker[] = [
    {
      title: "Reward Funds",
      method: extendedHiveChain?.api.database_api.get_reward_funds,
      params: {}, 
      validatorFunction: data => !!data.funds ? true : "Reward funds error",
    },
    {
      title: "Dynamic Global",
      method: extendedHiveChain?.api.database_api.get_dynamic_global_properties,
      params: {}, 
      validatorFunction: data => data.id === 0 ? true : "Dynamic global error",
    },
    {
      title: "Price Feed",
      method: extendedHiveChain?.api.database_api.get_current_price_feed,
      params: {}, 
      validatorFunction: data => !!data.base ? true : "Price feed error",
    },
    {
      title: "Witness Schedule",
      method: extendedHiveChain?.api.database_api.get_witness_schedule,
      params: { id: 1 }, 
      validatorFunction: data => /*data.max_scheduled_witnesses === 21*/ !!data ? true : "Witness schedule error",
      // This is left wrong on purpose for tests
    },
    {
      title: "Vesting Delegations",
      method: extendedHiveChain?.api.database_api.find_vesting_delegations,
      params: { account: "hiveio" }, 
      validatorFunction: data => !!data.delegations ? true : "Vesting delegations error",
    },
    {
      title: "RC Direct Delegations",
      method: extendedHiveChain?.api.rc_api.list_rc_direct_delegations,
      params: { start: ["hiveio", ""], limit: 1000 }, 
      validatorFunction: data => !!data.rc_direct_delegations ? true : "RC delegation error",
    }
  ]

  return (
    <HealthCheckerServiceContextProvider
      apiCheckers={apiCheckers}
      defaultProviders={config.defaultProviders}
      nodeAddress={nodeAddress}
      setNodeAddress={setNodeAddress}
    >
      <main className="flex flex-col min-h-screen justify-between items-center max-w-[100vw] mt-[72px] md:mt-20">
        <Navbar />
          {children}
        <Toaster
          richColors
          closeButton
        />
        <Footer />
      </main>
    </HealthCheckerServiceContextProvider>
  );
}
