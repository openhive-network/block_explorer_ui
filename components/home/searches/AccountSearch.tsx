import { useState } from "react";
import { Loader2 } from "lucide-react";

import Explorer from "@/types/Explorer";
import { getOperationButtonTitle } from "@/utils/UI";
import { trimAccountName } from "@/utils/StringUtils";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
import { startAccountOperationsSearch } from "./utils/accountSearchHelpers";
import { useSearchesContext } from "@/contexts/SearchesContext";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import useAccountOperations from "@/hooks/api/accountPage/useAccountOperations";
import NoValueErrorMessage from "./NoValueErrorMessage";

const AccountSearch = () => {
  const {
    setLastSearchKey,
    setAccountOperationsPage,
    accountOperationsSearchProps,
    setAccountOperationsSearchProps,
    setPreviousAccountOperationsSearchProps,
    searchRanges,
  } = useSearchesContext();

  const { isAccountOperationsFetching } = useAccountOperations(
    accountOperationsSearchProps
  );
  const { operationsTypes } = useOperationsTypes();

  const [accountName, setAccountName] = useState<string>("");
  const [selectedOperationTypes, setSelectedOperationTypes] = useState<
    number[] | null
  >([]);
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);

  const { getRangesValues } = searchRanges;

  const handleOperationSelect = (operationTypeIds: number[] | null) => {
    setSelectedOperationTypes(operationTypeIds);
    setAccountOperationsPage(undefined);
    setAccountOperationsSearchProps((prev: any) => {
      return {
        ...prev,
        operationTypes: operationTypeIds,
      };
    });
  };

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
          operationTypes:
            selectedOperationTypes && selectedOperationTypes.length
              ? selectedOperationTypes
              : null,
        };
      startAccountOperationsSearch(
        accountOperationsSearchProps,
        (val: "account") => setLastSearchKey(val),
        setAccountOperationsPage,
        setAccountOperationsSearchProps,
        setPreviousAccountOperationsSearchProps
      );
    }
  };
  return (
    <>
      <div className="flex flex-col">
        <AutocompleteInput
          value={accountName}
          onChange={setAccountName}
          placeholder="Account name"
          inputType="account_name"
          className="w-1/2 bg-theme dark:bg-theme border-0 border-b-2"
          required={true}
        />
      </div>
      <SearchRanges
        rangesProps={searchRanges}
        setIsSearchButtonDisabled={setIsSearchButtonDisabled}
      />
      <div className="flex items-center">
        <OperationTypesDialog
          operationTypes={operationsTypes}
          selectedOperations={selectedOperationTypes || []}
          setSelectedOperations={handleOperationSelect}
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
          disabled={isSearchButtonDisabled || !accountName}
        >
          Search
          {isAccountOperationsFetching && (
            <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />
          )}
        </Button>

        <NoValueErrorMessage
          accountName={accountName}
          isSearchButtonDisabled={isSearchButtonDisabled}
        />
      </div>
    </>
  );
};

export default AccountSearch;
