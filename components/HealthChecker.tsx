import { cn } from "@/lib/utils";
import { IHiveChainInterface, IScoredEndpoint } from "@hiveio/wax";
import { HealthChecker } from "@hiveio/wax";
import { useEffect, useState } from "react";

interface HealthCheckerComponentProps {
  hiveChain?: IHiveChainInterface;
  currentAddress: string | null;
  changeNodeAddress?: (url: string | undefined) => void;
}

const HealthCheckerComponent: React.FC<HealthCheckerComponentProps> = ({
  hiveChain,
  currentAddress,
  changeNodeAddress
}) => {

  const [chainInitialized, setChainIntialized] = useState<boolean>(false);

  const [scoredEndpoints, setScoredEndpoints] = useState<IScoredEndpoint[]>([]);

  const apiList = [
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

  return (
    <div>
      {scoredEndpoints.map((scoredEndpoint) => (
        <div className={cn({"text-red-800": scoredEndpoint.score <= 0})}>
          {scoredEndpoint.endpointUrl === currentAddress ? ">" : ""}
          {scoredEndpoint.endpointUrl}
        </div>
      ))}
    </div>
  );
};

export default HealthCheckerComponent;
