import React, { useEffect } from "react";

import CommentsSearch from "@/components/home/searches/CommentsSearch";
import { Card, CardContent } from "@/components/ui/card";
import CommentSearchResults from "@/components/home/searches/searchesResults/CommentSearchResults";
import { useRouter } from "next/router";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { trimAccountName } from "@/utils/StringUtils";
import {
  convertBooleanArrayToIds,
  parseUrlFlagsIntoBooleanArray,
} from "@/lib/utils";
import Explorer from "@/types/Explorer";
import { ParsedUrlQuery } from "querystring";

const Comments: React.FC = () => {
  const router = useRouter();

  const {
    commentSearchProps,

    setCommentSearchProps,
  } = useSearchesContext();

  const setCommentSearchPropsFromUrl = async (props: ParsedUrlQuery) => {
    if (!!props.accountName) {
      const searchProps = {
        ...props,
        operationTypes: props.filters
          ? convertBooleanArrayToIds(
              parseUrlFlagsIntoBooleanArray(props.filters as string)
            )
          : undefined,
        accountName: trimAccountName(router.query.accountName?.[0] as string),
        permlink: router.query.permlink as string,
      };
      setCommentSearchProps(searchProps);
    }
  };

  useEffect(() => {
    if (!commentSearchProps) {
      setCommentSearchPropsFromUrl(router.query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentSearchProps, router.query]);

  return (
    <div
      className="page-container"
      data-testid="comments-search-comments-page"
    >
      <Card>
        <CardContent className="pt-2">
          <CommentsSearch />
        </CardContent>
      </Card>
      <div className="mt-4">
      <CommentSearchResults />
      </div>
    </div>
  );
};

export default Comments;
