import { cn } from "@/lib/utils";
import { IHiveChainInterface, IScoredEndpoint } from "@hiveio/wax";
import { HealthChecker } from "@hiveio/wax";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import ProviderCard from "./ProviderCard";
import ApiCheckDialog from "./ApiCheckDialog";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";


export interface ApiChecker {
  title: string;
  method: any;
  params: any;
  currentProvider: string;
  validatorFunction: (data: any) => boolean;
}

interface HealthCheckerComponentProps {
  className?: string;
  hiveChain?: IHiveChainInterface;
  currentAddress?: string;
  customApiList?: string[];
  customApiCheckers?: Map<string, ApiChecker>;
  changeNodeAddress: (url: string | null) => void; 
  changeEndpointAddress: (checker: ApiChecker) => void;
}

const HealthCheckerComponent: React.FC<HealthCheckerComponentProps> = ({
  hiveChain,
  currentAddress,
  customApiList,
  changeNodeAddress,
  changeEndpointAddress,
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

  const changeChecksForProvider = (provider: string, newCheckers: string[]) => {
    const newApiChecks = structuredClone(apiChecksByProvider);
    newApiChecks.set(provider, newCheckers);
    setApiChecksByProvider(newApiChecks);
    setIsDialogOpened(false);
    restartCheckerAfterChange(newApiChecks);
  }

  const initializeDefaultChecks = () => {
    const initialApiChecksByProviders = new Map<string, string[]>();
    apiList.forEach((api) => {
      initialApiChecksByProviders.set(api, Array.from(customApiCheckers?.keys() || []));
    })
    setApiChecksByProvider(initialApiChecksByProviders);
    restartCheckerAfterChange(initialApiChecksByProviders)
  }

  const restartCheckerAfterChange = (newCheckers: Map<string, string[]>) => {
    const providersByChecks = new Map<string, string[]>();
    for (const [providerKey, checkers] of newCheckers) {
      checkers.forEach((check) => {
        if (providersByChecks.has(check)) {
          const previousProviders = providersByChecks.get(check) as string[];
          providersByChecks.set(check, [...previousProviders, providerKey]);
        } else {
          providersByChecks.set(check, [providerKey]);
        }
      })
    }
    hc.unregisterAll();
    for (const [checkerKey, providers] of providersByChecks) {
      const checker = customApiCheckers?.get(checkerKey);
      hc.register(checker!.method, checker!.params, checker!.validatorFunction, providers);
    }
  }

  useEffect(() => { 
    if (hc && hiveChain && !chainInitialized && !!customApiCheckers) {
      if (apiChecksByProvider.size === 0) {
        initializeDefaultChecks();
      }
      for (const [key, checker] of customApiCheckers) {
        hc.register(checker.method, checker.params, checker.validatorFunction, apiList);
      }
      hc.on("data", (data: Array<IScoredEndpoint>) => { console.log(JSON.stringify(data)); setScoredEndpoints(data) });
      setChainIntialized(true);
    }
  }, [hiveChain, chainInitialized, customApiCheckers, apiList, hc, apiChecksByProvider])

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
      <Card className="grid grid-cols-3 grid-rows-3 gap-y-1 my-1 p-2 ">
        <div className="row-start-1 col-start-1 col-span-3 flex justify-center">Block Explorer healthchecker for nodes</div>
        <div className="col-start-1 row-start-2 row-span-2 col-span-3">
          <div>Api checks:</div>
          {Array.from(customApiCheckers?.entries() || []).map(([key, apiChecker]) => (
            <Badge key={key} variant={"outline"}>{apiChecker.title}</Badge>
          ))}
        </div>
        <div className="row-start-2 row-span-2 col-end-4 flex items-center justify-end">
          <Button onClick={() => {initializeDefaultChecks()}}>Restore default</Button>
        </div>

      </Card>
      {scoredEndpoints.map(
        (scoredEndpoint, index) => renderProvider(scoredEndpoint, index)
      )}
      <ApiCheckDialog 
        className="bg-white"
        isOpened={isDialogOpened}
        onDialogOpenChange={onDialogOpenChange}
        checksList={customApiCheckers}
        openedProvider={openedProvider}
        changeChecks={changeChecksForProvider}
        changeEndpointAddress={changeEndpointAddress}
        activeChecksKeys={apiChecksByProvider?.get(openedProvider || "") || []}
      />
    </div>
  );
};

export default HealthCheckerComponent;
