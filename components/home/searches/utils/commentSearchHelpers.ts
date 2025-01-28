import { convertIdsToBooleanArray } from "@/lib/utils";
import { dataToURL } from "@/utils/URLutils";
import Explorer from "@/types/Explorer";
import { setParamIfPositive } from "./globalSearchHelpers";

export function getCommentPageLink(
  commentSearchProps: Explorer.CommentSearchProps | undefined
): string {
  if (!commentSearchProps) return "#";

  const {
    fromBlock,
    toBlock,
    permlink,
    operationTypes,
    accountName,
    rangeSelectKey,
    lastTimeUnitValue,
    lastBlocksValue,
    timeUnitSelectKey,
  } = commentSearchProps;

  const searchParams = new URLSearchParams();

  setParamIfPositive(searchParams, "fromBlock", fromBlock);
  setParamIfPositive(searchParams, "toBlock", toBlock);
  setParamIfPositive(searchParams, "rangeSelectKey", rangeSelectKey);
  setParamIfPositive(searchParams, "permlink", permlink);

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
  const urlPath = `/comments/@${dataToURL(accountName)}${
    queryString ? `?${queryString}` : ""
  }`;

  return urlPath;
}
