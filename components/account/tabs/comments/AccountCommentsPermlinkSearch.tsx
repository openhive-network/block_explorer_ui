import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { Loader2 } from "lucide-react";

import Explorer from "@/types/Explorer";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";
import { useSearchesContext } from "@/contexts/SearchesContext";
import PostTypeSelector from "@/components/home/searches/PostTypeSelector";
import usePermlinkCommentSearch from "./usePermlinkCommentSearch";

interface AccountCommentsPermlinkSearchProps {
  accountName: string;
  isDataLoading: boolean;
  setIsFiltersActive: Dispatch<SetStateAction<boolean>>;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
}

const AccountCommentsPermlinkSearch: React.FC<
  AccountCommentsPermlinkSearchProps
> = ({ accountName, isDataLoading, setIsFiltersActive, setIsVisible }) => {
  const { setPermlinkPaginationPage, setCommentType, searchRanges } =
    useSearchesContext();

  const {
    handleClearFilters,
    handleCommentPermlinkSearch,
    localCommentType,
    setLocalCommentType,
  } = usePermlinkCommentSearch(accountName);

  const handleChangeCommentType = (e: ChangeEvent<HTMLSelectElement>) => {
    const {
      target: { value },
    } = e;

    setLocalCommentType(value as Explorer.CommentType);
  };

  const onSearchButtonClick = () => {
    setPermlinkPaginationPage(1);
    setCommentType(localCommentType);

    handleCommentPermlinkSearch();
  };

  const onResetButtonClick = () => {
    handleClearFilters();
    setIsFiltersActive(false);
    setIsVisible(false);
  };

  return (
    <>
      <SearchRanges rangesProps={searchRanges} />
      <div className={"flex justify-start my-4"}>
        <PostTypeSelector
          showLabel
          handleChange={handleChangeCommentType}
          commentType={localCommentType}
        />
      </div>
      <div className="flex justify-between items-center">
        <Button
          data-testid="search-button"
          className="mr-2 my-2"
          onClick={onSearchButtonClick}
          disabled={!accountName}
        >
          Search
          {isDataLoading && <Loader2 className="ml-2 animate-spin h-4 w-4" />}
        </Button>
        <Button onClick={onResetButtonClick}>Reset</Button>
      </div>
    </>
  );
};

export default AccountCommentsPermlinkSearch;
