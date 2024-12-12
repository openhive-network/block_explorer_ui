import {
  convertBooleanArrayToIds,
  convertIdsToBooleanArray,
  getPageUrlParams,
} from "@/lib/utils";
import { dataToURL } from "@/utils/URLutils";
import Explorer from "@/types/Explorer";

export async function startCommentSearch(
  commentSearchParams: Explorer.CommentSearchParams,
  setCommentSearchProps: (props: Explorer.CommentSearchProps) => void,
  setCommentPaginationPage: (page: number) => void,
  setPreviousCommentSearchProps: (props: Explorer.CommentSearchProps) => void,
  setLastSearchKey: (key: "comment") => void
) {
  const { filters, ...params } = commentSearchParams;
  const props: Explorer.CommentSearchProps = {
    ...params,
    accountName: params.accountName || "",
    operationTypes:
      filters && filters.length ? convertBooleanArrayToIds(filters) : undefined,
  };
  setCommentSearchProps(props);
  setCommentPaginationPage(1);
  setPreviousCommentSearchProps(props);
  setLastSearchKey("comment");
}

export function getCommentPageLink(
  commentSearchProps: Explorer.CommentSearchProps | undefined,
  searchRanges: any
): string {
  if (!commentSearchProps) return "#";
  const urlParams: Explorer.UrlParam[] = [
    {
      paramName: "fromBlock",
      paramValue: dataToURL(commentSearchProps.fromBlock),
    },
    { paramName: "toBlock", paramValue: dataToURL(commentSearchProps.toBlock) },
    {
      paramName: "rangeSelectKey",
      paramValue: dataToURL(searchRanges.rangeSelectKey),
    },
    {
      paramName: "lastTime",
      paramValue: dataToURL(searchRanges.lastTimeUnitValue),
    },
    {
      paramName: "lastBlocks",
      paramValue: dataToURL(searchRanges.lastBlocksValue),
    },
    {
      paramName: "timeUnit",
      paramValue: dataToURL(searchRanges.timeUnitSelectKey),
    },
    {
      paramName: "permlink",
      paramValue: dataToURL(commentSearchProps.permlink),
    },
  ];

  if (commentSearchProps.operationTypes) {
    urlParams.push({
      paramName: "filters",
      paramValue: dataToURL(
        convertIdsToBooleanArray(commentSearchProps.operationTypes)
      ),
    });
  }

  return `/comments/@${dataToURL(
    commentSearchProps.accountName
  )}${getPageUrlParams(urlParams)}`;
}
