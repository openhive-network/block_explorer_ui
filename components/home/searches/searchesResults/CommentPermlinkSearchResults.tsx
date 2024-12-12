import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";
import CommentPermlinkResultTable from "../CommentPermlinkResultTable";
import { useSearchesContext } from "@/contexts/SearchesContext";

const COMMENT_TYPES = ["all", "post", "comment"];

const CommentPermlinkSearchResults = () => {
  const {
    permlinkSearchProps,
    commentType,
    setCommentType,
    setPermlinkSearchProps,
    lastSearchKey,
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

  if (!permlinkSearchData) return;

  return (
    <>
      {permlinkSearchData.total_permlinks ? (
        <div>
          <div className="flex justify-end my-4">
            <select
              onChange={handleChangeCommentType}
              value={commentType}
              className="border p-2 rounded bg-theme text-text"
            >
              {COMMENT_TYPES.map((type, index) => (
                <option
                  key={index}
                  value={type}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap">
            <CommentPermlinkResultTable
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
