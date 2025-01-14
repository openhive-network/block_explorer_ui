import { cn } from "@/lib/utils";
import { TScoredEndpoint, HealthChecker } from "@hiveio/wax";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import ProviderCard from "./ProviderCard";
import ApiCheckDialog from "./ApiCheckDialog";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import EndpointProviderDialog from "./EndpointProviderDialog";
import ProviderAdditionDialog from "./ProviderAdditionDialog";


export interface ApiChecker {
  title: string;
  method: any;
  params: any;
  validatorFunction: (data: any) => string | true;
}

interface HealthCheckerComponentProps {
  className?: string;
  currentAddress?: string;
  customApiList?: string[];
  customApiCheckers?: Map<string, ApiChecker>;
  providersForEndpoints: Map<string, string>;
  healthChecker?: HealthChecker;
  scoredEndpoints?: TScoredEndpoint[];
  fallbacks: string[];
  changeNodeAddress: (url: string | null) => void; 
  setScoredEndpoints: (scoredEndpoints: TScoredEndpoint[] | undefined ) => void;
  addNewProvider: (provider: string) => void;
  deleteProvider: (provider: string) => void;
  registerFallback: (provider: string) => void;
  removeFallback: (provider: string) => void;
}

const HealthCheckerComponent: React.FC<HealthCheckerComponentProps> = ({
  currentAddress,
  customApiList,
  changeNodeAddress,
  setScoredEndpoints,
  addNewProvider,
  deleteProvider,
  registerFallback,
  removeFallback,
  customApiCheckers,
  className,
  providersForEndpoints,
  healthChecker,
  scoredEndpoints,
  fallbacks
}) => {

  const [chainInitialized, setChainIntialized] = useState<boolean>(false);
  const [apiChecksByProvider, setApiChecksByProvider] = useState<Map<string, string[]>>(new Map());
  const [isProviderAdditionDialogOpened, setIsProviderAdditionDialogOpened] = useState<boolean>(false);


  const changeChecksForProvider = (provider: string, newCheckers: string[]) => {
    const newApiChecks = structuredClone(apiChecksByProvider);
    newApiChecks.set(provider, newCheckers);
    setApiChecksByProvider(newApiChecks);
    subscribeToCheckers(newApiChecks);
  }

  const initializeDefaultChecks = () => {
    const initialEndpoints: TScoredEndpoint[] | undefined = customApiList?.map((api) => ({endpointUrl: api, score: 1, up: true, lastLatency: 0}))
    if (!!initialEndpoints && !scoredEndpoints) setScoredEndpoints(initialEndpoints);
    const initialApiChecksByProviders = new Map<string, string[]>();
    customApiList?.forEach((api) => {
      initialApiChecksByProviders.set(api, Array.from(customApiCheckers?.keys() || []));
    })
    setApiChecksByProvider(initialApiChecksByProviders);
    subscribeToCheckers(initialApiChecksByProviders)

  }

  const subscribeToCheckers = (newCheckers: Map<string, string[]>) => {
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

  const handleDeletionOfProvider = (provider: string) => {
    deleteProvider(provider);
    const newApiChecks = structuredClone(apiChecksByProvider);
    newApiChecks.delete(provider);
    setApiChecksByProvider(newApiChecks);
    subscribeToCheckers(newApiChecks);
  }

  const handleAdditionOfProvider = (provider: string) => {
    addNewProvider(provider);
    setIsProviderAdditionDialogOpened(false);
    changeChecksForProvider(provider, Array.from(customApiCheckers?.keys() || []));
  }
  
  useEffect(() => { 
    if (healthChecker && !chainInitialized && !!customApiCheckers) {
      if (apiChecksByProvider.size === 0) {
        initializeDefaultChecks();
      }
      setChainIntialized(true);
    }
  }, [chainInitialized, customApiCheckers, healthChecker, initializeDefaultChecks, apiChecksByProvider])

  const renderProvider = (scoredEndpoint: TScoredEndpoint) => {
    const {endpointUrl, score, up,} = scoredEndpoint;
    const apiList = apiChecksByProvider.get(endpointUrl);
    let lastLatency: number | null = null;
    if (up) {
      lastLatency = scoredEndpoint.lastLatency || null;
    }
    if (!customApiList?.find((customApi) => customApi === endpointUrl)) {
      return null;
    }
    return (
      <ProviderCard 
        key={endpointUrl}
        providerLink={endpointUrl}
        switchToProvider={changeNodeAddress}
        disabled={score <= 0}
        latency={lastLatency}
        isSelected={endpointUrl === currentAddress}
        apiList={apiList || []}
        customApiCheckers={customApiCheckers}
        providersForEndpoints={providersForEndpoints}
        isFallback={!!fallbacks.includes(endpointUrl)}
        deleteProvider={handleDeletionOfProvider}
        registerFallback={registerFallback}
      />
    )       
  }

  return (
    <div className={cn(className)}>
      <Card className="grid grid-cols-4 grid-rows-4 gap-y-1 my-1 p-2 mb-4">
        <div className="row-start-1 col-start-1 col-span-4 flex justify-center">Block Explorer healthchecker for nodes</div>
        <div className="col-start-1 row-start-2 row-span-2 col-span-3">
          <div>Api checks:</div>
          <div className="flex flex-wrap">
            {Array.from(customApiCheckers?.entries() || []).map(([key, apiChecker]) => (
              <Badge key={key} variant={"outline"}>{apiChecker.title}</Badge>
            ))}
          </div>
        </div>
        <div className="row-start-2 row-span-2 col-end-5 flex items-center justify-end">
          <Button onClick={() => {initializeDefaultChecks()}}>Restore default</Button>
        </div>
        <div className="row-start-4">
          {fallbacks.map((fallback) => (
            <div key={fallback} className="flex gap-1">{fallback}<X className="cursor-pointer" onClick={() => {removeFallback(fallback)}} /></div>
          ))}
        </div>
      </Card>
      {scoredEndpoints?.map(
        (scoredEndpoint) => renderProvider(scoredEndpoint)
      )}
      <Button onClick={() => {setIsProviderAdditionDialogOpened(true)}} className="w-full"><Plus /></Button>
      <ProviderAdditionDialog 
        isOpened={isProviderAdditionDialogOpened}
        onDialogOpenChange={setIsProviderAdditionDialogOpened}
        onProviderSubmit={handleAdditionOfProvider}
      />
    </div>
  );
};

export default HealthCheckerComponent;
