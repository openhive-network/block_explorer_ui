import { cn } from "@/lib/utils";
import { IHiveChainInterface, IScoredEndpoint } from "@hiveio/wax";
import { HealthChecker } from "@hiveio/wax";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface HealthCheckerComponentProps {
  hiveChain?: IHiveChainInterface;
  currentAddress: string | null;
  customApiList?: string[];
  changeNodeAddress: (url: string | null) => void;
}

const HealthCheckerComponent: React.FC<HealthCheckerComponentProps> = ({
  hiveChain,
  currentAddress,
  customApiList,
  changeNodeAddress
}) => {

  const [chainInitialized, setChainIntialized] = useState<boolean>(false);

  const [scoredEndpoints, setScoredEndpoints] = useState<IScoredEndpoint[]>([]);

  const apiList = customApiList ? customApiList : [
    "https://api.hive.blog",
    "https://api.openhive.network",
    "https://anyx.io",
    "https://rpc.ausbit.dev",
    "https://rpc.mahdiyari.info",
    "https://api.hive.blue",
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


  useEffect(() => { 
    if (hc && hiveChain && !chainInitialized) {
      hc.register(hiveChain?.api.block_api.get_block, {block_num: 1}, data => data.block?.previous === "0000000000000000000000000000000000000000", apiList);
      hc.on("data", (data: Array<IScoredEndpoint>) => { console.log(JSON.stringify(data)); setScoredEndpoints(data) });
      setChainIntialized(true);
    }
  }, [hiveChain])
  if (!scoredEndpoints.length) {
    return <Loader2 className="ml-2 animate-spin h-16 w-16  ..." />
  }
  return (
    <div>
      {scoredEndpoints.map((scoredEndpoint) => (
        <div className={cn("flex items-center", {"text-red-800": scoredEndpoint.score <= 0})}>
          <div>
            {scoredEndpoint.endpointUrl === currentAddress ? ">" : ""}
            {scoredEndpoint.endpointUrl}
          </div>
          <Button onClick={() => {changeNodeAddress(scoredEndpoint.endpointUrl)}}>Switch</Button>
        </div>
      ))}
    </div>
  );
};

export default HealthCheckerComponent;
