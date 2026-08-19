import { useMemo, useRef } from "react";

import useBlockOperations from "@/hooks/api/common/useBlockOperations";

// Operation and transaction counts for a block, shared by the logged-in and
// logged-out home so the same block never reports different numbers.
const useBlockOperationCounts = (headBlockNum?: number) => {
  const { blockOperations } = useBlockOperations(headBlockNum || 0);
  const lastCounts = useRef({ opcount: 0, trxOpsLength: 0 });

  return useMemo(() => {
    const totalOperations = blockOperations?.total_operations;
    // Show last counts instead of flashing zeros.
    if (!totalOperations) return lastCounts.current;

    const trxInBlock = blockOperations?.operations_result.reduce(
      (max, op) =>
        typeof op?.trx_in_block === "number"
          ? Math.max(max, op.trx_in_block)
          : max,
      0
    );

    lastCounts.current = {
      opcount: totalOperations,
      trxOpsLength: trxInBlock ? trxInBlock + 1 : 0,
    };
    return lastCounts.current;
  }, [blockOperations]);
};

export default useBlockOperationCounts;
