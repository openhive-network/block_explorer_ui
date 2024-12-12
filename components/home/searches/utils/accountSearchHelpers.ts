import { convertIdsToBooleanArray, getPageUrlParams } from "@/lib/utils";
import { dataToURL } from "@/utils/URLutils";

import Explorer from "@/types/Explorer";

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

  const urlParams: Explorer.UrlParam[] = [
    {
      paramName: "fromBlock",
      paramValue: dataToURL(accountOperationsSearchProps.fromBlock),
    },
    {
      paramName: "toBlock",
      paramValue: dataToURL(accountOperationsSearchProps.toBlock),
    },
    {
      paramName: "fromDate",
      paramValue: dataToURL(accountOperationsSearchProps.startDate),
    },
    {
      paramName: "toDate",
      paramValue: dataToURL(accountOperationsSearchProps.endDate),
    },
    {
      paramName: "rangeSelectKey",
      paramValue: dataToURL(searchRanges.rangeSelectKey),
    },
  ];

  if (accountOperationsSearchProps.operationTypes) {
    urlParams.push({
      paramName: "filters",
      paramValue: dataToURL(
        convertIdsToBooleanArray(accountOperationsSearchProps.operationTypes)
      ),
    });
  }

  if (searchRanges.rangeSelectKey === "lastTime") {
    urlParams.push({
      paramName: "lastTime",
      paramValue: dataToURL(searchRanges.lastTimeUnitValue),
    });
    urlParams.push({
      paramName: "timeUnit",
      paramValue: dataToURL(searchRanges.timeUnitSelectKey),
    });
  }

  if (searchRanges.rangeSelectKey === "lastBlocks") {
    urlParams.push({
      paramName: "lastBlocks",
      paramValue: dataToURL(searchRanges.lastBlocksValue),
    });
  }

  return `/@${accountOperationsSearchProps.accountName}${getPageUrlParams(
    urlParams
  )}`;
}
