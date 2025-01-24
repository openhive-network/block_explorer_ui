import React, {
  createContext,
  SetStateAction,
  useContext,
  useState,
  Dispatch,
} from "react";
import Explorer from "@/types/Explorer";
import useSearchRanges from "@/hooks/common/useSearchRanges";

export type SearchKey = "block" | "account" | "comment" | "comment-permlink";
type CommentType = "all" | "post" | "comment";

export interface SearchesContextType {
  previousCommentSearchProps: Explorer.CommentSearchProps | undefined;
  setPreviousCommentSearchProps: Dispatch<
    SetStateAction<Explorer.CommentSearchProps | undefined>
  >;
  previousAccountOperationsSearchProps:
    | Explorer.AccountSearchOperationsProps
    | undefined;
  setPreviousAccountOperationsSearchProps: Dispatch<
    SetStateAction<Explorer.AccountSearchOperationsProps | undefined>
  >;
  commentPaginationPage: number;
  setCommentPaginationPage: Dispatch<SetStateAction<number>>;
  permlinkPaginationPage: number;
  setPermlinkPaginationPage: Dispatch<SetStateAction<number>>;
  accountOperationsPage: number | undefined;
  setAccountOperationsPage: Dispatch<SetStateAction<number | undefined>>;
  lastSearchKey: SearchKey | undefined;
  setLastSearchKey: Dispatch<SetStateAction<SearchKey | undefined>>;
  blockSearchProps: Explorer.BlockSearchProps | undefined;
  setBlockSearchProps: Dispatch<
    SetStateAction<Explorer.BlockSearchProps | undefined>
  >;
  commentSearchProps: Explorer.CommentSearchProps | undefined;
  setCommentSearchProps: Dispatch<
    SetStateAction<Explorer.CommentSearchProps | undefined>
  >;
  permlinkSearchProps: Explorer.PermlinkSearchProps | undefined;
  setPermlinkSearchProps: Dispatch<
    SetStateAction<Explorer.PermlinkSearchProps | undefined>
  >;
  accountOperationsSearchProps:
    | Explorer.AccountSearchOperationsProps
    | undefined;
  setAccountOperationsSearchProps: Dispatch<
    SetStateAction<Explorer.AccountSearchOperationsProps | undefined>
  >;
  commentType: CommentType;
  setCommentType: Dispatch<SetStateAction<CommentType>>;
  commentsSearchAccountName: string | string[] | undefined;
  setCommentsSearchAccountName: Dispatch<
    SetStateAction<string | string[] | undefined>
  >;
  commentsSearchPermlink: string | string[] | undefined;
  setCommentsSearchPermlink: Dispatch<
    SetStateAction<string | string[] | undefined>
  >;
  selectedCommentSearchOperationTypes: number[] | null;
  setSelectedCommentSearchOperationTypes: Dispatch<
    SetStateAction<number[] | null>
  >;
  activeSearchSection: string;
  setActiveSearchSection: Dispatch<SetStateAction<string>>;
  searchRanges: any;
}

export const SearchesContext = createContext<SearchesContextType | undefined>(
  undefined
);

export const useSearchesContext = () => {
  const context = useContext(SearchesContext);

  if (context === undefined) {
    throw new Error("useSearchesContext must be used inside it`s context");
  }

  return context;
};

export const SearchesContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [previousCommentSearchProps, setPreviousCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);

  const [
    previousAccountOperationsSearchProps,
    setPreviousAccountOperationsSearchProps,
  ] = useState<Explorer.AccountSearchOperationsProps | undefined>(undefined);

  const [commentPaginationPage, setCommentPaginationPage] = useState<number>(1);
  const [permlinkPaginationPage, setPermlinkPaginationPage] =
    useState<number>(1);

  const [accountOperationsPage, setAccountOperationsPage] = useState<
    number | undefined
  >(undefined);

  const [lastSearchKey, setLastSearchKey] = useState<SearchKey | undefined>(
    undefined
  );

  const [blockSearchProps, setBlockSearchProps] = useState<
    Explorer.BlockSearchProps | undefined
  >(undefined);

  const [commentSearchProps, setCommentSearchProps] = useState<
    Explorer.CommentSearchProps | undefined
  >(undefined);

  const [permlinkSearchProps, setPermlinkSearchProps] = useState<
    Explorer.PermlinkSearchProps | undefined
  >(undefined);

  const [accountOperationsSearchProps, setAccountOperationsSearchProps] =
    useState<Explorer.AccountSearchOperationsProps | undefined>(undefined);

  //  comment_type: post is default by backend
  const [commentType, setCommentType] = useState<CommentType>("post");
  const [commentsSearchAccountName, setCommentsSearchAccountName] = useState<
    string | string[] | undefined
  >("");
  const [commentsSearchPermlink, setCommentsSearchPermlink] = useState<
    string | string[] | undefined
  >("");
  const [
    selectedCommentSearchOperationTypes,
    setSelectedCommentSearchOperationTypes,
  ] = useState<number[] | null>([]);
  const [activeSearchSection, setActiveSearchSection] =
    useState<string>("block");

  const searchRanges = useSearchRanges();

  return (
    <SearchesContext.Provider
      value={{
        previousCommentSearchProps,
        setPreviousCommentSearchProps,
        commentsSearchAccountName,
        setCommentsSearchAccountName,
        commentsSearchPermlink,
        setCommentsSearchPermlink,
        selectedCommentSearchOperationTypes,
        setSelectedCommentSearchOperationTypes,
        previousAccountOperationsSearchProps,
        setPreviousAccountOperationsSearchProps,
        commentPaginationPage,
        setCommentPaginationPage,
        permlinkPaginationPage,
        setPermlinkPaginationPage,
        accountOperationsPage,
        setAccountOperationsPage,
        lastSearchKey,
        setLastSearchKey,
        blockSearchProps,
        setBlockSearchProps,
        commentSearchProps,
        setCommentSearchProps,
        permlinkSearchProps,
        setPermlinkSearchProps,
        accountOperationsSearchProps,
        setAccountOperationsSearchProps,
        commentType,
        setCommentType,
        searchRanges,
        activeSearchSection,
        setActiveSearchSection,
      }}
    >
      {children}
    </SearchesContext.Provider>
  );
};
