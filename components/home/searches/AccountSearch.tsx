import { useState } from "react";
import { Loader2 } from "lucide-react";

import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import { getOperationButtonTitle } from "@/utils/UI";
import { trimAccountName } from "@/utils/StringUtils";
import { SearchRangesResult } from "@/hooks/common/useSearchRanges";
import { Input } from "@/components/ui/input";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";

interface AccountSearchProps {
  startAccountOperationsSearch: (
    accountSearchOperationsProps: Explorer.AccountSearchOperationsProps
  ) => Promise<void>;
  operationsTypes?: Hive.OperationPattern[];
  loading?: boolean;
  searchRanges: SearchRangesResult;
}

const AccountSearch: React.FC<AccountSearchProps> = ({
  startAccountOperationsSearch,
  operationsTypes,
  loading,
  searchRanges,
}) => {
  const [accountName, setAccountName] = useState<string>("");
  const [selectedOperationTypes, setSelectedOperationTypes] = useState<
    number[]
  >([]);

  const { getRangesValues } = searchRanges;

  const onButtonClick = async () => {
    if (accountName !== "") {
      const {
        payloadFromBlock,
        payloadToBlock,
        payloadStartDate,
        payloadEndDate,
      } = await getRangesValues();

      const accountOperationsSearchProps: Explorer.AccountSearchOperationsProps =
        {
          accountName: trimAccountName(accountName),
          fromBlock: payloadFromBlock,
          toBlock: payloadToBlock,
          startDate: payloadStartDate,
          endDate: payloadEndDate,
          operationTypes: selectedOperationTypes.length
            ? selectedOperationTypes
            : undefined,
        };
      startAccountOperationsSearch(accountOperationsSearchProps);
    }
  };

  return (
    <>
      <div className="flex flex-col">
        <Input
          data-testid="account-name"
          className="w-1/2 bg-explorer-gray-light dark:bg-explorer-gray-dark border-0 border-b-2"
          type="text"
          value={accountName || ""}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Account name *"
          required
        />
      </div>
      <SearchRanges
        rangesProps={searchRanges}
        safeTimeRangeDisplay
      />
      <div className="flex items-center">
        <OperationTypesDialog
          operationTypes={operationsTypes}
          selectedOperations={selectedOperationTypes}
          setSelectedOperations={setSelectedOperationTypes}
          buttonClassName="bg-gray-500"
          triggerTitle={getOperationButtonTitle(
            selectedOperationTypes,
            operationsTypes
          )}
        />
      </div>
      <div className="flex items-center ">
        <Button
          data-testid="search-button"
          onClick={onButtonClick}
          disabled={!accountName}
        >
          Search
          {loading && <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />}
        </Button>
        {!accountName && (
          <label className="ml-2 text-muted-foreground">Set account name</label>
        )}
      </div>
    </>
  );
};

export default AccountSearch;
