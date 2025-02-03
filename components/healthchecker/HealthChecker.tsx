import { cn } from "@/lib/utils";
import { TScoredEndpoint } from "@hiveio/wax";
import { useState } from "react";
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
  scoredEndpoints?: TScoredEndpoint[];
  fallbacks: string[];
  defaultProviders: string[];
  setScoredEndpoints: (scoredEndpoints: TScoredEndpoint[] | undefined ) => void;
  setFallbacks: (providers: string[]) => void;
  setLocalProviders: (providers: string[]) => void;
  setNodeAddress: (address: string) => void;
}

const HealthCheckerComponent: React.FC<HealthCheckerComponentProps> = ({
  className,
  currentAddress,
  customProviders,
  customApiCheckers,
  scoredEndpoints,
  fallbacks,
  defaultProviders,
  setScoredEndpoints,
  setFallbacks,
  setLocalProviders,
  setNodeAddress
}) => {

  const [isProviderAdditionDialogOpened, setIsProviderAdditionDialogOpened] = useState<boolean>(false);

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

  const registerFallback = (provider: string) => {
    if (!fallbacks?.includes(provider)) {
      setFallbacks([...fallbacks || [], provider])
    }
  }

  const removeFallback = (provider: string) => {
    setFallbacks(fallbacks?.filter((fallback) => fallback !== provider) || []);
  }

  const addNewProvider = (provider: string) => {
    if (customProviders) {
      setLocalProviders([...(customProviders || []), provider]);
    }
  }

  const deleteProvider = (provider: string) => {
    if (customProviders) {
      const newLocalProviders = customProviders?.filter((node) => node !== provider);
      setLocalProviders(newLocalProviders);
      removeFallback(provider);
    }
  }

  const resetProviders = () => {
    setLocalProviders(defaultProviders);
    setScoredEndpoints([]);
  }

  const changeNodeAddress = (nodeAddress: string | null) => {
    if (nodeAddress) {
      removeFallback(nodeAddress);
      setNodeAddress(nodeAddress);
    }
  }
  
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
            {customApiCheckers?.map((apiChecker, index) => (
              <Badge key={index} variant={"outline"}>{apiChecker.title}</Badge>
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
