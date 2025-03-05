import { ChangeEventHandler } from "react";
import Explorer from "@/types/Explorer";

const COMMENT_TYPES = ["all", "post", "comment"];

interface PostTypeSelectorProps {
  showLabel?: boolean | undefined;
  handleChange: ChangeEventHandler<HTMLSelectElement>;
  commentType: Explorer.CommentType | string;
}

const PostTypeSelector: React.FC<PostTypeSelectorProps> = ({
  showLabel = false,
  handleChange,
  commentType,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {showLabel && <label>Select comment type</label>}
      <select
        onChange={handleChange}
        value={commentType}
        className="border p-2 rounded bg-theme text-text cursor-pointer"
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
  );
};

export default PostTypeSelector;
