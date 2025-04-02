import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import useURLParams from "@/hooks/common/useURLParams";
import {
  cn,
  convertBooleanArrayToIds,
  convertIdsToBooleanArray,
} from "@/lib/utils";
import useAccountOperations from "@/hooks/api/accountPage/useAccountOperations";
import useAccountOperationTypes from "@/hooks/api/accountPage/useAccountOperationTypes";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { getOperationButtonTitle } from "@/utils/UI";
import AccountOperationsSection from "./AccountOperationsSection";
import { trimAccountName } from "@/utils/StringUtils";
import useAccountOperationsTabSearchRanges, {
  defaultAccountOperationsTabSearchParams,
} from "./useAccountOperationsTabSearchRanges";

interface OpeationTabContentProps {
  liveDataEnabled: boolean;
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsFiltersActive: Dispatch<SetStateAction<boolean>>;
}

const OperationTabContent: React.FC<OpeationTabContentProps> = ({
  liveDataEnabled,
  isVisible,
  setIsVisible,
  setIsFiltersActive,
}) => {
  const router = useRouter();
  const searchRanges = useAccountOperationsTabSearchRanges();

  const [accountName, setAccountName] = useState("");
  const { paramsState, setParams } = useURLParams(
    defaultAccountOperationsTabSearchParams,
    ["accountName"]
  );

  // Operation types
  const [filters, setFilters] = useState<boolean[]>([]);
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);

  const {
    filters: filtersParam,
    fromBlock: fromBlockParam,
    toBlock: toBlockParam,
    fromDate: fromDateParam,
    toDate: toDateParam,
  } = paramsState;

  const accountOperationsProps = {
    accountName,
    operationTypes: filtersParam.length
      ? convertBooleanArrayToIds(filtersParam)
      : null,
    pageNumber: paramsState.page,
    fromBlock: fromBlockParam,
    toBlock: toBlockParam,
    startDate: fromDateParam,
    endDate: toDateParam,
  };

  const { accountOperations, isAccountOperationsLoading } =
    useAccountOperations(accountOperationsProps, liveDataEnabled);

  const { accountOperationTypes } = useAccountOperationTypes(accountName);

  const handleClearFilter = () => {
    const {
      setRangeSelectKey,
      setTimeUnitSelectKey,
      setLastTimeUnitValue,
      setLastBlocksValue,
    } = searchRanges;

    const props = {
      ...defaultAccountOperationsTabSearchParams,
      accountName,
    };

    setRangeSelectKey("none");
    setTimeUnitSelectKey(undefined);
    setLastTimeUnitValue(undefined);
    setLastBlocksValue(undefined);
    setParams(props);
    setFilters([]);
    setIsVisible(false);
    setIsFiltersActive(false);
  };

  const handleOperationSelect = (filters: number[] | null) => {
    const newFilters = convertIdsToBooleanArray(filters);
    setFilters(newFilters);
    setParams({ ...paramsState, filters: newFilters, page: undefined });
  };

  const handleSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await searchRanges.getRangesValues();

    const props = {
      ...paramsState,
      fromBlock: payloadFromBlock,
      toBlock: payloadToBlock,
      fromDate: payloadStartDate,
      toDate: payloadEndDate,
      lastBlocks:
        searchRanges.rangeSelectKey === "lastBlocks"
          ? searchRanges.lastBlocksValue
          : undefined,
      lastTime:
        searchRanges.rangeSelectKey === "lastTime"
          ? searchRanges.lastTimeUnitValue
          : undefined,
      timeUnit:
        searchRanges.rangeSelectKey === "lastTime"
          ? searchRanges.timeUnitSelectKey
          : undefined,
      rangeSelectKey: searchRanges.rangeSelectKey,
      page: undefined,
    };

    setParams(props);
  };

  useEffect(() => {
    if (!router.isReady) return;

    const accounNameFromRoute = trimAccountName(
      router.query.accountName as string
    );
    setAccountName(accounNameFromRoute);
  }, [router.isReady, router.query.accountName]);

  // Don't show filters if only account name is present
  useEffect(() => {
    Object.keys(defaultAccountOperationsTabSearchParams).forEach((key) => {
      if (key === "accountName" || key === "page") return;

      const param =
        paramsState[
          key as keyof typeof defaultAccountOperationsTabSearchParams
        ];
      const defaultParam =
        defaultAccountOperationsTabSearchParams[
          key as keyof typeof defaultAccountOperationsTabSearchParams
        ];
      if (param !== defaultParam) {
        setIsFiltersActive(true);
        setIsVisible(true);
      }
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState]);

  const buttonLabel = `Value field can't be empty`;

  return (
    <TabsContent value="operations">
      <Card
        className={cn(
          "mb-4 overflow-hidden transition-all duration-500 ease-in max-h-0 opacity-0",
          {
            "max-h-full opacity-100": isVisible,
          }
        )}
      >
        <CardHeader>
          <CardTitle className="text-left">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchRanges
            rangesProps={searchRanges}
            setIsSearchButtonDisabled={setIsSearchButtonDisabled}
          />

          <div className="flex items-center my-2">
            <OperationTypesDialog
              operationTypes={accountOperationTypes}
              setSelectedOperations={handleOperationSelect}
              selectedOperations={convertBooleanArrayToIds(
                filtersParam ?? filters
              )}
              buttonClassName="bg-theme"
              triggerTitle={getOperationButtonTitle(
                convertBooleanArrayToIds(filtersParam ?? filters),
                accountOperationTypes
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Button
                onClick={handleSearch}
                data-testid="apply-filters"
                className="mr-2 my-2"
                disabled={isSearchButtonDisabled}
              >
                Search
                {isAccountOperationsLoading && (
                  <Loader2 className="ml-2 animate-spin h-4 w-4" />
                )}
              </Button>

              {isSearchButtonDisabled ? (
                <label className="text-gray-300 dark:text-gray-500 ">
                  {buttonLabel}
                </label>
              ) : null}
            </div>
            <Button
              onClick={handleClearFilter}
              data-testid="clear-filters"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
      <AccountOperationsSection
        accountOperations={accountOperations}
        isAccountOperationsLoading={isAccountOperationsLoading}
      />
    </TabsContent>
  );
};

export default OperationTabContent;
