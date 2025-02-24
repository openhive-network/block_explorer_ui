import { cn } from "@/lib/utils";
import { TScoredEndpoint } from "@hiveio/wax";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Loader2, Plus } from "lucide-react";
import ProviderCard from "./ProviderCard";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import ProviderAdditionDialog from "./ProviderAdditionDialog";
import { HealthCheckerProps, ValidationErrorDetails } from "@/contexts/HealthCheckerContext";
import ValidationErrorDialog from "./ValidationErrorDialog";
import HealthCheckerService from "@/services/HealthCheckerService";

export interface ApiChecker {
  title: string;
  method: any;
  params: any;
  validatorFunction: (data: any) => string | true;
}

interface HealthCheckerComponentProps {
  className?: string;
  healthCheckerService: HealthCheckerService
}

const HealthCheckerComponent: React.FC<HealthCheckerComponentProps> = ({
  className,
  healthCheckerService
}) => {

  const {
    addProvider,
    removeProvider,
    resetProviders,
    clearValidationError,
  } = healthCheckerService

  const [apiCheckers, setApiCheckers] = useState<ApiChecker[] | undefined>(undefined);
  const [scoredEndpoints, setScoredEndpoints] = useState<TScoredEndpoint[] | undefined>(undefined);
  const [fallbacks, setFallbacks] = useState<string[] | undefined>(undefined);
  const [nodeAddress, setNodeAddress] = useState<string | null>(null);
  const [providers, setProviders] = useState<string[] | undefined>(undefined);
  const [failedChecksByProvider, setFailedChecksByProvider] = useState<Map<string, ValidationErrorDetails[]>>(new Map());

  const [isProviderAdditionDialogOpened, setIsProviderAdditionDialogOpened] = useState<boolean>(false);
  const [isValidationErrorDialogOpened, setIsValidationErrorDialogOpened] = useState<boolean>(false);
  const [selectedValidator, setSelectedValidator] = useState<ValidationErrorDetails | undefined>(undefined);
  
  const handleAdditionOfProvider = (provider: string) => {
    addProvider(provider);
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

  const changeNodeAddress = (nodeAddress: string | null) => {
    if (nodeAddress) {
      removeFallback(nodeAddress);
      setNodeAddress(nodeAddress);
    }
  }

  const selectValidator = (providerName: string, checkTitle: string) => {
    const foundValidator = failedChecksByProvider?.get(providerName)?.find((failedCheck) => failedCheck.checkName === checkTitle);
    if (foundValidator) {
      setSelectedValidator(foundValidator);
      setIsValidationErrorDialogOpened(true);
    }
  }

  const actualizeData = () => {
    const hcData = healthCheckerService.getComponentData();
    if (hcData) {
      setFallbacks(hcData?.fallbacks);
      setScoredEndpoints(hcData?.scoredEndpoints);
      setApiCheckers(hcData?.apiCheckers)
      setProviders(hcData?.providers)
      setFailedChecksByProvider(hcData.failedChecksByProvider)
    }
  }

  useEffect(() => {
    healthCheckerService.on("scoredEndpoint", () => {actualizeData()})
  }, [])
  
  const renderProvider = (scoredEndpoint: TScoredEndpoint, index: number, isTop?: boolean) => {
    const {endpointUrl, score, up,} = scoredEndpoint;
    let lastLatency: number | null = null;
    if (up && scoredEndpoint.latencies.length) {
      lastLatency = scoredEndpoint.latencies[scoredEndpoint.latencies.length - 1];
    }
    if (!providers?.find((customProvider) => customProvider === endpointUrl)) {
      return null;
    }
    return (
      <ProviderCard 
        isTop={!!isTop}
        key={endpointUrl}
        providerLink={endpointUrl}
        switchToProvider={changeNodeAddress}
        disabled={score === 0}
        latency={lastLatency}
        isSelected={scoredEndpoint.endpointUrl === nodeAddress}
        checkerNamesList={apiCheckers?.map((apicChecker) => apicChecker.title) || []}
        isFallback={!!fallbacks?.includes(endpointUrl)}
        index={index + 1}
        score={scoredEndpoint.score}
        deleteProvider={removeProvider}
        registerFallback={registerFallback}
        removeFallback={removeFallback}    
        failedChecks={failedChecksByProvider.get(endpointUrl)?.map((failedCheck) => failedCheck.checkName) || []}
        selectValidator={selectValidator}                                                                               
      />
    )       
  }

  const renderProviders = () => {
    if (!scoredEndpoints || !scoredEndpoints.length) return <Loader2 className="ml-2 animate-spin h-8 w-8 justify-self-center mb-4  ..." />  
    const selectedProviderIndex = scoredEndpoints.findIndex((scoredEndpoint) => scoredEndpoint.endpointUrl === nodeAddress);
    const selectedProvider = scoredEndpoints[selectedProviderIndex]
    return (
      <>
        {!!selectedProvider && renderProvider(selectedProvider, selectedProviderIndex, true)}
        {scoredEndpoints?.map(
          (scoredEndpoint, index) => renderProvider(scoredEndpoint, index)
        )}
      </>
    )
  }

  return (
    <div className={cn(className)}>
      <Card className="grid grid-cols-4 grid-rows-4 lg:grid-rows-2 gap-y-1 my-1 p-2 mb-4">
        <div className="row-start-1 col-start-1 col-span-4 flex justify-center">Healthchecker for API servers</div>
        <div className="col-start-1 row-start-2 row-span-2 col-span-3">
          <div>Api checks:</div>
          <div className="flex flex-wrap">
            {apiCheckers?.map((apiChecker, index) => (
              <Badge key={index} variant={"outline"}>{apiChecker.title}</Badge>
            ))}
          </div>
        </div>
        <Button className="row-start-4 lg:row-start-2 row-span-1 col-span-full lg:col-span-1 lg:col-end-5" onClick={() => {resetProviders()}}>Restore default API server set</Button>
      </Card>
      {renderProviders()}
      <Button onClick={() => {setIsProviderAdditionDialogOpened(true)}} className="w-full"><Plus /></Button>
      <ProviderAdditionDialog 
        isOpened={isProviderAdditionDialogOpened}
        onDialogOpenChange={setIsProviderAdditionDialogOpened}
        onProviderSubmit={handleAdditionOfProvider}
      />
      <ValidationErrorDialog 
        isOpened={isValidationErrorDialogOpened}
        onDialogOpenChange={setIsValidationErrorDialogOpened}
        validatorDetails={selectedValidator}
        clearValidationError={clearValidationError}
      />
    </div>
  );
};

export default HealthCheckerComponent;
