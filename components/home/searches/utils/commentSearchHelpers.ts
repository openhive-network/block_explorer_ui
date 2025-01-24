import {
  convertBooleanArrayToIds,
  convertIdsToBooleanArray,
} from "@/lib/utils";
import { dataToURL } from "@/utils/URLutils";
import Explorer from "@/types/Explorer";
import { setParamIfPositive } from "./globalSearchHelpers";

export async function startCommentSearch(
  commentSearchParams: Explorer.CommentSearchParams,
  setCommentSearchProps: (
    props: Explorer.CommentSearchProps | undefined
  ) => void,
  setCommentPaginationPage: (page: number) => void,
  setPreviousCommentSearchProps: (props: Explorer.CommentSearchProps) => void,
  setLastSearchKey: (key: "comment") => void
) {
  const { operationTypes, ...params } = commentSearchParams;
  const props: Explorer.CommentSearchProps = {
    ...params,
    accountName: params.accountName || "",
    operationTypes,
  };
  setCommentSearchProps(props);
  setCommentPaginationPage(1);
  setPreviousCommentSearchProps(props);
  setLastSearchKey("comment");
}

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
