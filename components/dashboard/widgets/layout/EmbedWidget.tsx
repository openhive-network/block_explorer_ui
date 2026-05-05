import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { normalizeExternalUrl } from "@/utils/SafeUrl";

interface EmbedWidgetProps {
  initialUrl?: string;
  isEditMode: boolean;
  onUrlChange: (newUrl: string) => void;
}

const EmbedWidget: React.FC<EmbedWidgetProps> = ({
  initialUrl,
  isEditMode,
  onUrlChange,
}) => {
  const { t } = useI18n();
  const [url, setUrl] = useState(initialUrl || "");

  useEffect(() => {
    setUrl(initialUrl || "");
  }, [initialUrl]);

  if (isEditMode) {
    return (
      <div className="p-4 flex flex-col justify-center items-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
        <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("embedWidget.label")}
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => onUrlChange(url)}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder={t("embedWidget.placeholder")}
          className="w-full p-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <p className="mt-2 text-xs text-center text-gray-500">
          {t("embedWidget.warning")}
        </p>
      </div>
    );
  }

  const safeUrl = normalizeExternalUrl(url);

  if (!url) {
    return (
      <div className="p-4 flex justify-center items-center h-full text-center text-gray-500 dark:text-gray-400">
        {t("embedWidget.noUrl")}
      </div>
    );
  }

  if (!safeUrl) {
    return (
      <div className="p-4 flex justify-center items-center h-full text-center text-gray-500 dark:text-gray-400">
        {t("embedWidget.invalidUrl")}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900 rounded-[4px] overflow-hidden">
      <div className="flex-grow">
        <iframe
          src={safeUrl}
          className="w-full h-full border-0"
          title={t("embedWidget.title")}
          // Drop allow-same-origin: combined with allow-scripts it lets the
          // iframed page rewrite its own sandbox, defeating the protection.
          sandbox="allow-scripts allow-popups allow-forms"
        ></iframe>
      </div>
      <div
        className="flex-shrink-0 p-1 text-xs text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 truncate"
        title={safeUrl}
      >
        <span className="font-semibold">{t("embedWidget.sourceLabel")}:</span>{" "}
        {safeUrl}
      </div>
    </div>
  );
};

export default EmbedWidget;
