import { useHiveChainContext } from "@/contexts/HiveChainContext";
import OperationsFormatter from "@/lib/Formatter";

const useOperationsFormatter = (operations?: any) => {
  const { hiveChain } = useHiveChainContext();

  let basicFormatter = hiveChain?.formatter;
  basicFormatter = basicFormatter?.extend(OperationsFormatter, {
    transaction: { displayAsId: false },
  });

  if (basicFormatter && operations) {
    return basicFormatter.format(operations);
  } else {
    return operations;
  }
};

export default useOperationsFormatter;
