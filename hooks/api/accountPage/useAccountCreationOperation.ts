import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";

const ACCOUNT_CREATED_OP_TYPE_ID = 80;

// The oldest account_created operation an account takes part in is its own
// creation; later ones are accounts it created for others.
const useAccountCreationOperation = (accountName: string) => {
  const { data: creationOperation } = useQuery({
    queryKey: ["account_creation_operation", accountName],
    queryFn: async () => {
      const response = await fetchingService.getOpsByAccount({
        accountName,
        operationTypes: [ACCOUNT_CREATED_OP_TYPE_ID],
        pageNumber: 1,
        pageSize: 1,
      });
      const operation = response.operations_result?.[0];
      const createdName = (operation?.op?.value as any)?.new_account_name;
      if (!operation || createdName !== accountName) return null;
      return {
        block: operation.block,
        trxId: operation.trx_id,
        operationId: operation.operation_id,
      };
    },
    enabled: !!accountName,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return { creationOperation };
};

export default useAccountCreationOperation;
