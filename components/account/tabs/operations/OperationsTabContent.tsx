import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
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
import { getLocalStorage, removeStorageItem } from "@/utils/LocalStorage";
import { useI18n } from "@/i18n/i18n";
import BlockNavigation from "@/components/BlockNavigation";
import useBlockNavigation from "@/hooks/common/useBlockNavigation";

interface OpeationTabContentProps {
  liveDataEnabled: boolean;
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsFiltersActive: Dispatch<SetStateAction<boolean>>;
  isFiltersActive: boolean;
}

const OperationTabContent: React.FC<OpeationTabContentProps> = ({
  liveDataEnabled,
  isVisible,
  setIsVisible,
  setIsFiltersActive,
  isFiltersActive,
}) => {
  const { t } = useI18n();
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
    activeTab,
    direction,
  } = paramsState;

  const isOperationsTabActive = !activeTab || activeTab === "operations";

  const accountOperationsProps = {
    accountName,
    operationTypes: filtersParam.length
      ? convertBooleanArrayToIds(filtersParam)
      : null,
    pageNumber: isOperationsTabActive ? paramsState.page : undefined,
    fromBlock: fromBlockParam,
    toBlock: toBlockParam,
    startDate: fromDateParam,
    endDate: toDateParam,
    participationMode: direction,
    transactingAccountName: !direction ? null : accountName,
  };

  const {
    accountOperations,
    isAccountOperationsLoading,
    refetchAccountOperations,
  } = useAccountOperations(accountOperationsProps as any, liveDataEnabled);

  const {
    handleLoadNextBlocks,
    handleLoadPreviousBlocks,
    hasMoreBlocks,
    hasPreviousBlocks,
  } = useBlockNavigation(
    fromBlockParam,
    accountOperations,
    paramsState,
    setParams
  );

  const { accountOperationTypes } = useAccountOperationTypes(accountName);

  const handleClearFilter = () => {
    const {
      setRangeSelectKey,
      setTimeUnitSelectKey,
      setLastTimeUnitValue,
      setLastBlocksValue,
    } = searchRanges;

    setRangeSelectKey("none");
    setTimeUnitSelectKey(undefined);
    setLastTimeUnitValue(undefined);
    setLastBlocksValue(undefined);

    setParams({
      ...defaultAccountOperationsTabSearchParams,
      filters: [],
      accountName,
    });
    setFilters([]);
    removeStorageItem("is_operations_filters_visible");
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
    refetchAccountOperations();
  };

  useEffect(() => {
    if (!router.isReady) return;

    const accounNameFromRoute = trimAccountName(
      router.query.accountName as string
    );
    setAccountName(accounNameFromRoute);
  }, [router.isReady, router.query.accountName]);

  const hasActiveFilters = Boolean(
    (filtersParam?.length ?? 0) ||
      fromBlockParam ||
      (paramsState.toBlock && paramsState.history.length < 2) ||
      fromDateParam ||
      toDateParam
  );

  useEffect(() => {
    setIsFiltersActive(hasActiveFilters);

    if (hasActiveFilters) {
      const persisted = getLocalStorage("is_operations_filters_visible", true);
      setIsVisible(persisted);
    } else {
      setIsVisible(false);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveFilters]);

  const buttonLabel = `Value field can't be empty`;

  return (
    <TabsContent value="operations">
      <Card
        className={cn(
          "mb-0 pb-0 overflow-hidden transition-all duration-500 ease-in max-h-0 opacity-0",
          {
            "max-h-full opacity-100": isVisible,
          }
        )}
      >
        <CardHeader>
          <CardTitle className="text-left">{t("common.filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchRanges
            rangesProps={searchRanges}
            setIsSearchButtonDisabled={setIsSearchButtonDisabled}
          />
          <div className="flex flex-col space-y-2 mb-4">
            <div className="text-sm font-medium">
              {t("operations.participationMode")}
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="participationMode"
                  checked={!direction}
                  onChange={() =>
                    setParams({
                      ...paramsState,
                      page: undefined,
                      direction: undefined,
                    })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">{t("operations.all")}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="participationMode"
                  checked={direction === "exclude"}
                  onChange={() =>
                    setParams({
                      ...paramsState,
                      page: undefined,
                      direction: "exclude",
                    })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">{t("operations.incoming")}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="participationMode"
                  checked={direction === "include"}
                  onChange={() =>
                    setParams({
                      ...paramsState,
                      page: undefined,
                      direction: "include",
                    })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">{t("operations.outgoing")}</span>
              </label>
            </div>
          </div>

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
                {t("common.search")}
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
              {t("common.clear")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <BlockNavigation
        fromBlock={accountOperations?.block_range.from}
        toBlock={accountOperations?.block_range.to}
        hasPrevious={hasPreviousBlocks}
        hasNext={hasMoreBlocks}
        loadPreviousBlocks={handleLoadPreviousBlocks}
        loadNextBlocks={handleLoadNextBlocks}
        urlParams={paramsState}
        className="w-full mb-[-1px] relative z-10 rounded-t"
      />
      <AccountOperationsSection
        accountOperations={accountOperations}
        isAccountOperationsLoading={isAccountOperationsLoading}
      />
    </TabsContent>
  );
};

export default OperationTabContent;
