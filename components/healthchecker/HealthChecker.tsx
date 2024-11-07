import { cn } from "@/lib/utils";
import { IHiveChainInterface, IScoredEndpoint, TWaxRestApiRequest } from "@hiveio/wax";
import { HealthChecker } from "@hiveio/wax";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import ProviderCard from "./ProviderCard";
import ApiCheckDialog from "./ApiCheckDialog";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import EndpointProviderDialog from "./EndpointProviderDialog";


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
  providersForEndpoints: Map<string, string>;
  changeNodeAddress: (url: string | null) => void; 
  changeEndpointAddress: (endpoint: string, newProvider: string) => void;
}

const HealthCheckerComponent: React.FC<HealthCheckerComponentProps> = ({
  hiveChain,
  currentAddress,
  customApiList,
  changeNodeAddress,
  changeEndpointAddress,
  customApiCheckers,
  className,
  providersForEndpoints
}) => {

  const [chainInitialized, setChainIntialized] = useState<boolean>(false);
  const [scoredEndpoints, setScoredEndpoints] = useState<IScoredEndpoint[]>([]);
  const [apiChecksByProvider, setApiChecksByProvider] = useState<Map<string, string[]>>(new Map());
  const [isApiCheckDialogOpened, setIsApiCheckDialogOpened] = useState<boolean>(false);
  const [isEndpointProviderDialogOpened, setIsEndpointProviderDialogOpened] = useState<boolean>(false);
  const [openedProvider, setOpenedProvider] = useState<string | undefined>(undefined);
  const [openedEndpoint, setOpenedEndpoint] = useState<string | undefined>(undefined);
  const [healthChecker, setHealthChecker] = useState<HealthChecker | undefined>(undefined);

  const onApiCheckDialogChange = (isOpened: boolean, provider?: string) => {
    if (isOpened) {
      setOpenedProvider(provider);
    }
    setIsApiCheckDialogOpened(isOpened);
  }

  const onEndpointProviderDialogChange = (isOpened: boolean, endpoint?: string) => {
    if (isOpened) {
      setOpenedEndpoint(endpoint)
    }
    setIsEndpointProviderDialogOpened(isOpened);
  }

  const changeChecksForProvider = (provider: string, newCheckers: string[]) => {
    const newApiChecks = structuredClone(apiChecksByProvider);
    newApiChecks.set(provider, newCheckers);
    setApiChecksByProvider(newApiChecks);
    setIsApiCheckDialogOpened(false);
    restartCheckerAfterChange(newApiChecks);
  }

  const changeEndpointProvider = (endpointKey: string, newProvider: string) => {
    changeEndpointAddress(endpointKey, newProvider);
    setIsEndpointProviderDialogOpened(false);
  }

  const initializeDefaultChecks = () => {
    const initialApiChecksByProviders = new Map<string, string[]>();
    customApiList?.forEach((api) => {
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
    healthChecker?.unregisterAll();
    for (const [checkerKey, providers] of providersByChecks) {
      const checker = customApiCheckers?.get(checkerKey);
      healthChecker?.register(checker!.method, checker!.params, checker!.validatorFunction, providers);
    }
  }

  useEffect(() => { 
    if (healthChecker && hiveChain && !chainInitialized && !!customApiCheckers) {
      if (apiChecksByProvider.size === 0) {
        initializeDefaultChecks();
      }
      healthChecker.on("data", (data: Array<IScoredEndpoint>) => { console.log(JSON.stringify(data)); setScoredEndpoints(data) });
      setChainIntialized(true);
    }
  }, [hiveChain, chainInitialized, customApiCheckers, customApiList, healthChecker, apiChecksByProvider])

  useEffect(() => {
    if (!healthChecker) {
      const hc = new HealthChecker();
      hc.on('error', error => console.error(error.message));
      setHealthChecker(hc);
    }
  }, [healthChecker])

  const renderProvider = (scoredEndpoint: IScoredEndpoint, index: number) => {
    const {endpointUrl, score} = scoredEndpoint;
    const apiList = apiChecksByProvider.get(endpointUrl);
    return (
      <ProviderCard 
        index={index}
        providerLink={endpointUrl}
        switchToProvider={changeNodeAddress}
        disabled={score <= 0}
        isSelected={endpointUrl === currentAddress}
        apiList={apiList || []}
        customApiCheckers={customApiCheckers}
        providersForEndpoints={providersForEndpoints}
        onDialogOpenChange={onApiCheckDialogChange}
        onEndpointProviderDialogChange={onEndpointProviderDialogChange}
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
          <div className="flex flex-wrap">
            {Array.from(customApiCheckers?.entries() || []).map(([key, apiChecker]) => (
              <Badge key={key} variant={"outline"} onClick={() => {onEndpointProviderDialogChange(true, key)}}>{apiChecker.title}</Badge>
            ))}
          </div>
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
        isOpened={isApiCheckDialogOpened}
        onDialogOpenChange={onApiCheckDialogChange}
        checksList={customApiCheckers}
        openedProvider={openedProvider}
        changeChecks={changeChecksForProvider}
        activeChecksKeys={apiChecksByProvider?.get(openedProvider || "") || []}
      />
      <EndpointProviderDialog
        isOpened={isEndpointProviderDialogOpened}
        checkKey={openedEndpoint}
        checkTitle={customApiCheckers?.get(openedEndpoint || "")?.title || ""}
        currentProvider={providersForEndpoints.get(openedEndpoint || "") || currentAddress}
        onDialogOpenChange={onEndpointProviderDialogChange}
        providers={customApiList}
        changeProviderForEndpoint={changeEndpointProvider}
      />
    </div>
  );
};

export default HealthCheckerComponent;
