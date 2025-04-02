import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
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

  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);

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

  const buttonLabel = `Value field can't be empty`;

  return (
    <>
      <SearchRanges
        rangesProps={searchRanges}
        setIsSearchButtonDisabled={setIsSearchButtonDisabled}
      />
      <div className={"flex justify-start my-4"}>
        <PostTypeSelector
          showLabel
          handleChange={handleChangeCommentType}
          commentType={localCommentType}
        />
      </div>
      <div className="flex justify-between items-center">
        <div>
          <Button
            data-testid="search-button"
            className="mr-2 my-2"
            onClick={onSearchButtonClick}
            disabled={isSearchButtonDisabled}
          >
            Search
            {isDataLoading && <Loader2 className="ml-2 animate-spin h-4 w-4" />}
          </Button>
          {isSearchButtonDisabled ? (
            <label className="text-gray-300 dark:text-gray-500 ">
              {buttonLabel}
            </label>
          ) : null}
        </div>
        <Button onClick={onResetButtonClick}>Reset</Button>
      </div>
    </>
  );
};

export default AccountCommentsPermlinkSearch;
