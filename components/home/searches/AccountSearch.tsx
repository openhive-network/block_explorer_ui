import { Input } from "@/components/ui/input";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import useSearchRanges from "@/components/searchRanges/useSearchRanges";
import { useState } from "react";
import Hive from "@/types/Hive";
import { getOperationButtonTitle } from "@/utils/UI";
import Explorer from "@/types/Explorer";

interface AccountSearchProps {
  startAccountOperationsSearch: (
    accountSearchOperationsProps: Explorer.AccountSearchOperationsProps
  ) => Promise<void>;
  operationsTypes?: Hive.OperationPattern[];
  loading?: boolean;
}

const AccountSearch: React.FC<AccountSearchProps> = ({
  startAccountOperationsSearch,
  operationsTypes,
  loading,
}) => {
  const [accountName, setAccountName] = useState<string>("");
  const [selectedOperationTypes, setSelectedOperationTypes] = useState<
    number[]
  >([]);

  const searchRanges = useSearchRanges("lastBlocks");
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
          accountName,
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
      <p className="ml-2">
        {"Find account's operations for given properties."}
      </p>
      <div className="flex flex-col">
        <label className="ml-2">Account name *</label>
        <Input
          className="w-1/2 md:w-1/3 bg-gray-700"
          type="text"
          value={accountName || ""}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="---"
        />
      </div>
      <SearchRanges rangesProps={searchRanges} safeTimeRangeDisplay />
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
          className=" bg-blue-800 hover:bg-blue-600 rounded"
          onClick={onButtonClick}
          disabled={!accountName}
        >
          <span>Search</span>{" "}
          {loading && <Loader2 className="animate-spin h-4 w-4  ..." />}
        </Button>
        {!accountName && (
          <label className="ml-2 text-muted-foreground">Set account name</label>
        )}
      </div>
    </>
  );
};

export default AccountSearch;
