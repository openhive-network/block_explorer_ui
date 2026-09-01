import { useCallback, useMemo } from "react";

import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import {
  bucketOperations,
  totalBucketed,
  type OpBucket,
} from "@/utils/operationBuckets";

interface OperationCount {
  op_type_id: number;
  op_count: number;
}

export interface BlockOperationCounts {
  operationCount: number;
  virtualOperationCount: number;
  buckets: Record<OpBucket, number>;
}

// The node's is_virtual flag decides the virtual bucket; the id floor in
// bucketOperations is only a fallback for a type the metadata call omitted.
const useOperationBuckets = () => {
  const { operationsTypes } = useOperationsTypes();

  const virtualByOpId = useMemo(() => {
    const map = new Map<number, boolean>();
    operationsTypes?.forEach((type) =>
      map.set(type.op_type_id, type.is_virtual)
    );
    return map;
  }, [operationsTypes]);

  const isVirtualOpType = useCallback(
    (opTypeId: number) => virtualByOpId.get(opTypeId),
    [virtualByOpId]
  );

  const getOperationsCounts = useCallback(
    (operations: OperationCount[] | undefined): BlockOperationCounts => {
      const buckets = bucketOperations(operations, isVirtualOpType);
      const virtualOperationCount = buckets.virtual;

      return {
        operationCount: totalBucketed(buckets) - virtualOperationCount,
        virtualOperationCount,
        buckets,
      };
    },
    [isVirtualOpType]
  );

  return { getOperationsCounts, isVirtualOpType, operationsTypes };
};

export default useOperationBuckets;
