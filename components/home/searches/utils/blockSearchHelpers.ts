import Explorer from "@/types/Explorer";
import { convertIdsToBooleanArray } from "@/lib/utils";
import { setParamIfPositive } from "./globalSearchHelpers";

export function startBlockSearch(
  blockSearchProps: Explorer.BlockSearchProps,
  setBlockSearchProps: (props: Explorer.BlockSearchProps) => void,
  setLastSearchKey: (val: "block") => void
) {
  setBlockSearchProps(blockSearchProps);
  setLastSearchKey("block");
}

export function getAllBlocksPageLink(
  blockSearchProps: Explorer.BlockSearchProps | undefined,
  searchRanges: any
) {
  if (!blockSearchProps) return "/blocks";

  const {
    accountName,
    operationTypes,
    fromBlock,
    toBlock,
    startDate,
    endDate,
  } = blockSearchProps;

  const {
    rangeSelectKey,
    lastTimeUnitValue,
    timeUnitSelectKey,
    lastBlocksValue,
  } = searchRanges;

  const searchParams = new URLSearchParams();

  setParamIfPositive(searchParams, "accountName", accountName);
  setParamIfPositive(searchParams, "fromBlock", fromBlock);
  setParamIfPositive(searchParams, "toBlock", toBlock);
  setParamIfPositive(searchParams, "fromDate", startDate);
  setParamIfPositive(searchParams, "toDate", endDate);
  setParamIfPositive(searchParams, "rangeSelectKey", rangeSelectKey);

  if (operationTypes) {
    const booleanTypesArray = convertIdsToBooleanArray(operationTypes);
    let isFull = !!operationTypes;

    operationTypes?.forEach((operationType: any) => {
      if (!operationTypes.includes(operationType.op_type_id)) {
        isFull = false;
      }
    });

    const filtersValue = !isFull ? booleanTypesArray : [];
    setParamIfPositive(searchParams, "filters", filtersValue);
  }

  if (rangeSelectKey === "lastTime") {
    setParamIfPositive(searchParams, "lastTime", lastTimeUnitValue);
    setParamIfPositive(searchParams, "timeUnit", timeUnitSelectKey);
  } else if (rangeSelectKey === "lastBlocks") {
    setParamIfPositive(searchParams, "lastBlocks", lastBlocksValue);
  }

  const queryString = searchParams.toString();
  const urlPath = `/blocks${queryString ? `?${queryString}` : ""}`;

  return urlPath;
}
