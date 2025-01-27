import { cn } from "@/lib/utils";
import { TScoredEndpoint, HealthChecker } from "@hiveio/wax";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Loader2, Plus } from "lucide-react";
import ProviderCard from "./ProviderCard";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
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
  customProviders?: string[];
  customApiCheckers?: ApiChecker[];
  healthChecker?: HealthChecker;
  scoredEndpoints?: TScoredEndpoint[];
  fallbacks: string[];
  changeNodeAddress: (url: string | null) => void; 
  setScoredEndpoints: (scoredEndpoints: TScoredEndpoint[] | undefined ) => void;
  addNewProvider: (provider: string) => void;
  deleteProvider: (provider: string) => void;
  resetProviders: () => void;
  registerFallback: (provider: string) => void;
  removeFallback: (provider: string) => void;
}

const HealthCheckerComponent: React.FC<HealthCheckerComponentProps> = ({
  className,
  currentAddress,
  customProviders,
  customApiCheckers,
  healthChecker,
  scoredEndpoints,
  fallbacks,
  changeNodeAddress,
  setScoredEndpoints,
  addNewProvider,
  deleteProvider,
  resetProviders,
  registerFallback,
  removeFallback,
}) => {

  const [chainInitialized, setChainIntialized] = useState<boolean>(false);
  const [isProviderAdditionDialogOpened, setIsProviderAdditionDialogOpened] = useState<boolean>(false);

  const initializeDefaultChecks = () => {
    const initialEndpoints: TScoredEndpoint[] | undefined = customProviders?.map((customProvider) => ({endpointUrl: customProvider, score: 1, up: true, lastLatency: 0}))
    if (!!initialEndpoints && !scoredEndpoints) setScoredEndpoints(initialEndpoints);
    subscribeToCheckers();
    setChainIntialized(true);
  }

  
  const subscribeToCheckers = () => {
    healthChecker?.unregisterAll();
    for (const checker of customApiCheckers || []) {
      healthChecker?.register(checker!.method, checker!.params, checker!.validatorFunction, customProviders);
    }
  }
  
  const restoreDefault = () => {
    resetProviders();
  }
  
  const handleDeletionOfProvider = (provider: string) => {
    deleteProvider(provider);
    setScoredEndpoints(scoredEndpoints?.filter((endpoint) => endpoint.endpointUrl !== provider));
  }

  const handleAdditionOfProvider = (provider: string) => {
    addNewProvider(provider);
    setIsProviderAdditionDialogOpened(false);
  }
  
  useEffect(() => { 
    if (healthChecker && !chainInitialized && !!customApiCheckers) {
      initializeDefaultChecks();
    }
  }, [chainInitialized, customApiCheckers, healthChecker, initializeDefaultChecks])

  useEffect(() => {
    if (customProviders) subscribeToCheckers();
  }, [customProviders])

  const renderProvider = (scoredEndpoint: TScoredEndpoint) => {
    const {endpointUrl, score, up,} = scoredEndpoint;
    let lastLatency: number | null = null;
    if (up) {
      lastLatency = scoredEndpoint.lastLatency || null;
    }
    if (!customProviders?.find((customProvider) => customProvider === endpointUrl)) {
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
        checkerNamesList={customApiCheckers?.map((customApiChecker) => customApiChecker.title) || []}
        isFallback={!!fallbacks.includes(endpointUrl)}
        deleteProvider={handleDeletionOfProvider}
        registerFallback={registerFallback}
        removeFallback={removeFallback}                                                                                    
      />
    )       
  }

  return (
    <div className={cn(className)}>
      <Card className="grid grid-cols-4 grid-rows-4 md:grid-rows-2 gap-y-1 my-1 p-2 mb-4">
        <div className="row-start-1 col-start-1 col-span-4 flex justify-center">Block Explorer healthchecker for nodes</div>
        <div className="col-start-1 row-start-2 row-span-2 col-span-3">
          <div>Api checks:</div>
          <div className="flex flex-wrap">
            {Array.from(customApiCheckers?.entries() || []).map(([key, apiChecker]) => (
              <Badge key={key} variant={"outline"}>{apiChecker.title}</Badge>
            ))}
          </div>
        </div>
        <Button className="row-start-4 md:row-start-2 row-span-1 col-span-full md:col-span-1 md:col-end-5" onClick={() => {restoreDefault()}}>Restore default</Button>
      </Card>
        {(!!scoredEndpoints && scoredEndpoints.length) ? scoredEndpoints?.map(
          (scoredEndpoint) => renderProvider(scoredEndpoint)
        ) :
        <Loader2 className="ml-2 animate-spin h-8 w-8 justify-self-center mb-4  ..." />                                                                                                                                         }
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
