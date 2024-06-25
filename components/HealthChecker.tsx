import { IHiveChainInterface, IScoredEndpoint } from "@hiveio/wax";
import { HealthChecker } from "@hiveio/wax";
import { useEffect } from "react";

interface HealthCheckerComponentProps {
  hiveChain?: IHiveChainInterface
}

const HealthCheckerComponent: React.FC<HealthCheckerComponentProps> = ({
  hiveChain
}) => {

  const apiList = [
    "api.hive.blog",
    "api.openhive.network",
    "anyx.io",
    "rpc.ausbit.dev",
    "rpc.mahdiyari.info",
    "api.hive.blue",
    "techcoderx.com",
    "hive.roelandp.nl",
    "hived.emre.sh",
    "api.deathwing.me",
    "api.c0ff33a.uk",
    "hive-api.arcange.eu",
    "hive-api.3speak.tv",
    "hiveapi.actifit.io"
  ];

  const hc = new HealthChecker();

  console.log('HC', hc);

  useEffect(() => { 
    if (hc && hiveChain) {
      hc.register(hiveChain?.api.block_api.get_block, {block_num: 1}, data => data.block?.previous === "0000000000000000000000000000000000000000", apiList);
      hc.on("data", (data: Array<IScoredEndpoint>) => { console.log(JSON.stringify(data)); });
    }
  }, [hiveChain])

  return (
    <div>

    </div>
  );
};

export default HealthCheckerComponent;
