import { IHiveChainInterface } from "@hiveio/wax";
import { HealthChecker } from "@hiveio/wax";
import { useEffect } from "react";

interface HealthCheckerComponentProps {
  hiveChain?: IHiveChainInterface
}

const HealthCheckerComponent: React.FC<HealthCheckerComponentProps> = ({
  hiveChain
}) => {

  const hc = new HealthChecker();

  console.log('HC', hc);

  useEffect(() => { 
    if (hc && hiveChain) {
      hc.register(hiveChain?.api.block_api.get_block, {block_num: 1}, data => data.block?.previous === "0000000000000000000000000000000000000000", ["api.openhive.network"])
    }
  }, [hc, hiveChain])

  return (
    <div>

    </div>
  );
};

export default HealthCheckerComponent;
