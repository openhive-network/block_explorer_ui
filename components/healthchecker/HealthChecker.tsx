import { cn } from "@/lib/utils";
import { ApiBlock, IHiveChainInterface, IScoredEndpoint } from "@hiveio/wax";
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

  const changeChecksForProvider = (provider: string, newCheckers: string[]) => {
    const newApiChecks = structuredClone(apiChecksByProvider);
    newApiChecks.set(provider, newCheckers);
    setApiChecksByProvider(newApiChecks);
    setIsDialogOpened(false);
  }

  const initializeDefaultChecks = () => {
    const initialApiChecksByProviders = new Map<string, string[]>();
    apiList.forEach((api) => {
      initialApiChecksByProviders.set(api, Array.from(customApiCheckers?.keys() || []));
    })
    setApiChecksByProvider(initialApiChecksByProviders);
  }

  useEffect(() => { 
    if (hc && hiveChain && !chainInitialized) {
      Array.from(customApiCheckers?.entries() || []).forEach(([key, checker]) => {
        hc.register(checker.method, checker.params, checker.validatorFunction, apiList);
      })
      hc.on("data", (data: Array<IScoredEndpoint>) => { console.log(JSON.stringify(data)); setScoredEndpoints(data) });
      setChainIntialized(true);
    }
  }, [hiveChain])

  useEffect(() => {
    if (apiChecksByProvider.size === 0) {
      initializeDefaultChecks();
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
      <Card className="grid grid-cols-3 grid-rows-2 my-1 p-2 ">
        <div className="row-start-1 col-start-1 col-span-2">Block Explorer node's healthchecker</div>
        <div className="row-start-2">
          {Array.from(customApiCheckers?.entries() || []).map(([key, apiChecker]) => (
            <Badge variant={"outline"}>{apiChecker.title}</Badge>
          ))}
        </div>
        <Button className="row-start-1 row-span-2 col-end-4 items-center justify-center" onClick={() => {initializeDefaultChecks()}}>Restore default</Button>
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
        activeChecksKeys={apiChecksByProvider?.get(openedProvider || "") || []}
      />
    </div>
  );
};

export default HealthCheckerComponent;
