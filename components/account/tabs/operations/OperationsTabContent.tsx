import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowDown, ArrowUp } from "lucide-react";

import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import useURLParams from "@/hooks/common/useURLParams";
import {
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
}

const OperationTabContent: React.FC<OpeationTabContentProps> = ({
  liveDataEnabled,
}) => {
  const router = useRouter();
  const searchRanges = useAccountOperationsTabSearchRanges();

  const [accountName, setAccountName] = useState("");
  const { paramsState, setParams } = useURLParams(
    defaultAccountOperationsTabSearchParams,
    ["accountName"]
  );

  const [isCardContentHidden, setIsCardContentHidden] = useState(true);
  // Operation types
  const [filters, setFilters] = useState<boolean[]>([]);

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

  const handleCardContentVisibility = () => {
    setIsCardContentHidden(!isCardContentHidden);
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
      if (key === "accountName") return;

      const param =
        paramsState[
          key as keyof typeof defaultAccountOperationsTabSearchParams
        ];
      const defaultParam =
        defaultAccountOperationsTabSearchParams[
          key as keyof typeof defaultAccountOperationsTabSearchParams
        ];
      if (param !== defaultParam) {
        setIsCardContentHidden(false);
      }
    });
  }, [paramsState]);

  return (
    <TabsContent value="operations">
      <Card className="mb-4">
        <CardHeader
          className="p-0 m-0"
          onClick={handleCardContentVisibility}
        >
          <div className="flex justify-center  items-center p-3 hover:bg-rowHover cursor-pointer">
            <div className="w-full text-center text-2xl">Operation Search</div>
            <div className="flex justify-end items-center">
              {isCardContentHidden ? <ArrowDown /> : <ArrowUp />}
            </div>
          </div>
        </CardHeader>
        <CardContent hidden={isCardContentHidden}>
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
