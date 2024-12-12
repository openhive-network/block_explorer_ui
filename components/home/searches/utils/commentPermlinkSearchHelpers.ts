import Explorer from "@/types/Explorer";

export function startCommentPermlinkSearch(
  commentPermlinkSearchProps: Explorer.CommentPermlinSearchParams,
  setPermlinkSearchProps: (props: Explorer.PermlinkSearchProps) => void,
  setCommentPaginationPage: (val: number) => void,
  setCommentType: (val: "all" | "post" | "comment" | undefined) => void,
  setLastSearchKey: (val: "comment-permlink") => void
) {
  const { ...params } = commentPermlinkSearchProps;
  const props: Explorer.PermlinkSearchProps = {
    ...params,
    accountName: params.accountName || "",
  };
  setPermlinkSearchProps(props);
  setCommentPaginationPage(1);
  setCommentType(undefined);
  setLastSearchKey("comment-permlink");
}