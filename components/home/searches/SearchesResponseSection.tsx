import { useRef } from "react";

import BlockSearchResults from "./searchesResults/BlockSearchResults";
import CommentPermlinkSearchResults from "./searchesResults/CommentPermlinkSearchResults";
import CommentSearchResults from "./searchesResults/CommentSearchResults";
import AccountSearchResults from "./searchesResults/AccountSearchResults";
import { useSearchesContext } from "@/contexts/SearchesContext";
import useBlockSearch from "@/hooks/api/homePage/useBlockSearch";
import useAccountOperations from "@/hooks/api/accountPage/useAccountOperations";
import useCommentSearch from "@/hooks/api/common/useCommentSearch";
import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";

const SearchesResponseSection = () => {
  const searchesRef = useRef<HTMLDivElement | null>(null);

  const {
    blockSearchProps,
    accountOperationsSearchProps,
    permlinkSearchProps,
    commentSearchProps,
    lastSearchKey,
  } = useSearchesContext();
  const { blockSearchData } = useBlockSearch(blockSearchProps);
  const { accountOperations } = useAccountOperations(
    accountOperationsSearchProps
  );
  const { permlinkSearchData } = usePermlinkSearch(permlinkSearchProps);
  const { commentSearchData } = useCommentSearch(commentSearchProps);

  return (
    <div
      className="pt-4 scroll-mt-16"
      ref={searchesRef}
    >
      {blockSearchData && lastSearchKey === "block" && <BlockSearchResults />}
      {accountOperations && lastSearchKey === "account" && (
        <AccountSearchResults />
      )}
      {permlinkSearchData && lastSearchKey === "comment-permlink" && (
        <CommentPermlinkSearchResults />
      )}
      {commentSearchData && lastSearchKey === "comment" && (
        <CommentSearchResults />
      )}
    </div>
  );
};

export default SearchesResponseSection;
