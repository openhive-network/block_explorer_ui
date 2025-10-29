import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useI18n } from "@/i18n/i18n";

interface MarkdownWidgetProps {
  initialContent?: string;
  isEditMode: boolean;
  onContentChange: (newContent: string) => void;
}

const MarkdownWidget: React.FC<MarkdownWidgetProps> = ({
  initialContent,
  isEditMode,
  onContentChange,
}) => {
  const { t } = useI18n();

  const [content, setContent] = useState(
    initialContent || t("markdownWidget.defaultContent")
  );

  useEffect(() => {
    setContent(initialContent || t("markdownWidget.defaultContent"));
  }, [initialContent, t]);

  if (isEditMode) {
    return (
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={() => onContentChange(content)}
        className="w-full h-full p-2 bg-gray-50 dark:bg-gray-900 border-none outline-none resize-none rounded-md"
        placeholder={t("markdownWidget.placeholder")}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 bg-theme rounded-[4px]">
      <ReactMarkdown>{content || ""}</ReactMarkdown>
    </div>
  );
};

export default MarkdownWidget;
