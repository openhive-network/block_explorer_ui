import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import useURLParams from "@/hooks/common/useURLParams";
import { defaultSearchParams } from "@/pages/[accountName]";
import {
  convertBooleanArrayToIds,
  convertIdsToBooleanArray,
} from "@/lib/utils";
import useAccountOperations from "@/hooks/api/accountPage/useAccountOperations";
import useAccountOperationTypes from "@/hooks/api/accountPage/useAccountOperationTypes";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { getOperationButtonTitle } from "@/utils/UI";
import { useSearchesContext } from "@/contexts/SearchesContext";
import {
  DEFAULT_RANGE_SELECT_KEY,
  DEFAULT_LAST_BLOCK_VALUE,
  DEFAULT_LAST_TIME_UNIT_VALUE,
  DEFAULT_TIME_UNIT_SELECT_KEY,
} from "@/hooks/common/useSearchRanges";
import AccountOperationsSection from "./AccountOperationsSection";
import { trimAccountName } from "@/utils/StringUtils";

interface OpeationTabContentProps {
  liveDataEnabled: boolean;
}

const OperationTabContent: React.FC<OpeationTabContentProps> = ({
  liveDataEnabled,
}) => {
  const router = useRouter();
  const { searchRanges } = useSearchesContext();

  const [accountName, setAccountName] = useState("");
  const { paramsState, setParams } = useURLParams(defaultSearchParams, [
    "accountName",
  ]);

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

  // Operation types
  const [filters, setFilters] = useState<boolean[]>([]);

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
      ...defaultSearchParams,
      accountName,
    };

    setRangeSelectKey(DEFAULT_RANGE_SELECT_KEY);
    setTimeUnitSelectKey(DEFAULT_TIME_UNIT_SELECT_KEY);
    setLastTimeUnitValue(DEFAULT_LAST_TIME_UNIT_VALUE);
    setLastBlocksValue(DEFAULT_LAST_BLOCK_VALUE);
    setParams(props);
    setFilters([]);
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

  return (
    <TabsContent value="operations">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Operation Search</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchRanges rangesProps={searchRanges} />

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
              >
                <span>Search</span>
              </Button>
            </div>
            <Button
              onClick={handleClearFilter}
              data-testid="clear-filters"
            >
              <span>Clear</span>
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
