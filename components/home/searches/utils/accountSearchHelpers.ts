import Explorer from "@/types/Explorer";
import { convertIdsToBooleanArray } from "@/lib/utils";
import { setParamIfPositive } from "./globalSearchHelpers";

export function startAccountOperationsSearch(
  accountOperationsSearchProps: Explorer.AccountSearchOperationsProps,

  setLastSearchKey: (val: "account") => void,
  setAccountOperationsPage: (val: number | undefined) => void,
  setAccountOperationsSearchProps: (
    props: Explorer.AccountSearchOperationsProps
  ) => void,
  setPreviousAccountOperationsSearchProps: (
    props: Explorer.AccountSearchOperationsProps
  ) => void
) {
  setLastSearchKey("account");
  setAccountOperationsPage(undefined);
  setAccountOperationsSearchProps(accountOperationsSearchProps);
  setPreviousAccountOperationsSearchProps(accountOperationsSearchProps);
}

export function getAccountPageLink(
  accountOperationsSearchProps:
    | Explorer.AccountSearchOperationsProps
    | undefined,
  searchRanges: any
): string {
  if (!accountOperationsSearchProps) return "#";

  const {
    fromBlock,
    toBlock,
    startDate,
    endDate,
    operationTypes,
    accountName,
  } = accountOperationsSearchProps;

  const {
    rangeSelectKey,
    lastTimeUnitValue,
    timeUnitSelectKey,
    lastBlocksValue,
  } = searchRanges;

  const searchParams = new URLSearchParams();

  setParamIfPositive(searchParams, "fromBlock", fromBlock);
  setParamIfPositive(searchParams, "toBlock", toBlock);
  setParamIfPositive(searchParams, "fromDate", startDate);
  setParamIfPositive(searchParams, "toDate", endDate);
  setParamIfPositive(searchParams, "rangeSelectKey", rangeSelectKey);

  if (operationTypes) {
    setParamIfPositive(
      searchParams,
      "filters",
      convertIdsToBooleanArray(operationTypes)
    );
  }

  if (rangeSelectKey === "lastTime") {
    setParamIfPositive(searchParams, "lastTime", lastTimeUnitValue);
    setParamIfPositive(searchParams, "timeUnit", timeUnitSelectKey);
  } else if (rangeSelectKey === "lastBlocks") {
    setParamIfPositive(searchParams, "lastBlocks", lastBlocksValue);
  }

  const queryString = searchParams.toString();
  const urlPath = `/@${accountName}${queryString ? `?${queryString}` : ""}`;

  return urlPath;
}
