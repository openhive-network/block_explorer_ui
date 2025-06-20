import { ChangeEventHandler } from "react";
import Explorer from "@/types/Explorer";
import { useI18n } from "@/i18n/i18n";

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
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-2">
      {showLabel && <label>{t("postTypeSelector.selectCommentType")}</label>}
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
            {t(`postTypeSelector.commentTypes.${type}`)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PostTypeSelector;
