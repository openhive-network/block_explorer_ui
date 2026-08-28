import { useEffect, useState } from "react";

import useBlockOperations from "@/hooks/api/common/useBlockOperations";

export interface BlockOperationCounts {
  opcount?: number;
  trxOpsLength?: number;
}

// Operation and transaction counts for a block, shared by the logged-in and
// logged-out home so the same block never reports different numbers.
//
// Undefined until the first block resolves, so the cards show a placeholder
// rather than a real-looking 0/0; from then on the previous block's counts are
// held while the next one loads.
const useBlockOperationCounts = (
  headBlockNum?: number
): BlockOperationCounts => {
  const { blockOperations } = useBlockOperations(headBlockNum || 0);
  const [counts, setCounts] = useState<BlockOperationCounts>({});

  useEffect(() => {
    const totalOperations = blockOperations?.total_operations;
    if (!totalOperations) return;

    // trx_in_block is 0-based, so seed below zero to tell "one transaction"
    // apart from "no transaction carried an index".
    const maxTrxInBlock = blockOperations.operations_result.reduce(
      (max, op) =>
        typeof op?.trx_in_block === "number"
          ? Math.max(max, op.trx_in_block)
          : max,
      -1
    );

    setCounts({
      opcount: totalOperations,
      trxOpsLength: maxTrxInBlock >= 0 ? maxTrxInBlock + 1 : 0,
    });
  }, [blockOperations]);

  return counts;
};

export default useBlockOperationCounts;
