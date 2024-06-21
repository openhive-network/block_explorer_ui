import { IHiveChainInterface } from "@hiveio/wax";
import { HealthChecker } from "@hiveio/wax";

interface HealthCheckerComponentProps {
  hiveChain: IHiveChainInterface
}

const HealthCheckerComponent: React.FC<HealthCheckerComponentProps> = ({
  hiveChain
}) => {

  const hc = new HealthChecker();

  return (
    <div>

    </div>
  );
};

export default HealthCheckerComponent;
