import { cn } from "@/lib/utils";
import { ApiBlock, IHiveChainInterface, IScoredEndpoint } from "@hiveio/wax";
import { HealthChecker } from "@hiveio/wax";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import ProviderCard from "./ProviderCard";
import ApiCheckDialog from "./ApiCheckDialog";


export interface ApiChecker {
  title: string;
  method: any;
  params: any;
  validatorFunction: (data: any) => boolean;
}

interface HealthCheckerComponentProps {
  className?: string;
  hiveChain?: IHiveChainInterface;
  currentAddress?: string;
  customApiList?: string[];
  customApiCheckers?: Map<string, ApiChecker>;
  changeNodeAddress: (url: string | null) => void; 
}

const HealthCheckerComponent: React.FC<HealthCheckerComponentProps> = ({
  hiveChain,
  currentAddress,
  customApiList,
  changeNodeAddress,
  customApiCheckers,
  className
}) => {

  const [chainInitialized, setChainIntialized] = useState<boolean>(false);
  const [scoredEndpoints, setScoredEndpoints] = useState<IScoredEndpoint[]>([]);
  const [apiChecksByProvider, setApiChecksByProvider] = useState<Map<string, string[]>>(new Map());
  const [isDialogOpened, setIsDialogOpened] = useState<boolean>(false);
  const [openedProvider, setOpenedProvider] = useState<string | undefined>(undefined);

  const apiList = customApiList ? customApiList : [
    "https://api.hive.blog",
    "https://api.openhive.network",
    "https://anyx.io",
    "https://rpc.ausbit.dev",
    "https://rpc.mahdiyari.info",
    "https://techcoderx.com",
    "https://hive.roelandp.nl",
    "https://hived.emre.sh",
    "https://api.deathwing.me",
    "https://api.c0ff33a.uk",
    "https://hive-api.arcange.eu",
    "https://hive-api.3speak.tv",
    "https://hiveapi.actifit.io"
  ];

  const hc = new HealthChecker();

  const onDialogOpenChange = (isOpened: boolean, provider?: string) => {
    if (isOpened) {
      setOpenedProvider(provider);
    }
    setIsDialogOpened(isOpened);
  }

  useEffect(() => { 
    if (hc && hiveChain && !chainInitialized) {
      const checks = customApiCheckers?.get("find_account");
      Array.from(customApiCheckers?.entries() || []).forEach(([key, checker]) => {
        hc.register(checker.method, checker.params, checker.validatorFunction, apiList);
      })
      hc.on("data", (data: Array<IScoredEndpoint>) => { console.log(JSON.stringify(data)); setScoredEndpoints(data) });
      setChainIntialized(true);
    }
  }, [hiveChain])

  useEffect(() => {
    if (apiChecksByProvider.size === 0) {
      const initialApiChecksByProviders = new Map<string, string[]>();
      apiList.forEach((api) => {
        initialApiChecksByProviders.set(api, Array.from(customApiCheckers?.keys() || []));
      })
      setApiChecksByProvider(initialApiChecksByProviders);
    }
  }, [customApiCheckers, apiChecksByProvider])

  const renderProvider = (scoredEndpoint: IScoredEndpoint, index: number) => {
    const {endpointUrl, score} = scoredEndpoint;
    const apiList = apiChecksByProvider.get(endpointUrl)?.map((apiCheck) => customApiCheckers?.get(apiCheck)?.title || "");
    return (
      <ProviderCard 
        index={index}
        providerLink={endpointUrl}
        switchToProvider={changeNodeAddress}
        disabled={score <= 0}
        isSelected={endpointUrl === currentAddress}
        apiList={apiList || []}
        onDialogOpenChange={onDialogOpenChange}
      />
    )       
  }

  if (!scoredEndpoints.length) {
    return <Loader2 className="ml-2 animate-spin h-16 w-16  ..." />
  }
  return (
    <div className={cn([className])}>
      {scoredEndpoints.map((scoredEndpoint, index) => renderProvider(scoredEndpoint, index)
      )}
      <ApiCheckDialog 
        className="bg-white"
        isOpened={isDialogOpened}
        onDialogOpenChange={onDialogOpenChange}
        checksList={customApiCheckers}
        openedProvider={openedProvider}
        changeChecks={(data) => {}}
      />
    </div>
  );
};

export default HealthCheckerComponent;
