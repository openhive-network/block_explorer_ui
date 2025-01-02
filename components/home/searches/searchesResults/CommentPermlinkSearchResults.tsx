import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";
import CommentPermlinkResultTable from "../CommentPermlinkResultTable";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { getCommentPageLink } from "../utils/commentSearchHelpers";
import PostTypeSelector from "../PostTypeSelector";

const CommentPermlinkSearchResults = () => {
  const {
    permlinkSearchProps,
    commentType,
    setCommentType,
    setPermlinkSearchProps,
    searchRanges,
  } = useSearchesContext();

  const { permlinkSearchData } = usePermlinkSearch(permlinkSearchProps);

  const accountName = permlinkSearchProps?.accountName;

  const handleChangeCommentType = (e: any) => {
    const {
      target: { value },
    } = e;

    setCommentType(value);
    setPermlinkSearchProps((prev: any) => {
      return {
        ...prev,
        commentType: value,
      };
    });
  };

  const buildLink = (accountName: string, permlink: string) => {
    return getCommentPageLink({
      ...permlinkSearchProps,
      ...searchRanges,
      accountName,
      permlink,
    });
  };

  if (!permlinkSearchData) return;

  return (
    <>
      {permlinkSearchData.total_permlinks ? (
        <div>
          <div className="flex justify-end my-4">
            <PostTypeSelector
              handleChange={handleChangeCommentType}
              commentType={commentType}
            />
          </div>

          <div className="flex flex-wrap">
            <CommentPermlinkResultTable
              buildLink={buildLink}
              data={permlinkSearchData.permlinks_result}
              accountName={accountName}
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center w-full">
          No permlinks matching given criteria
        </div>
      )}
    </>
  );
};

export default CommentPermlinkSearchResults;
