import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { isInAppPath, normalizeExternalUrl } from "@/utils/SafeUrl";
import { getImageSrc } from "@/utils/PathUtils";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import SegmentedToggle from "@/components/ui/SegmentedToggle";

type Fit = "cover" | "contain";

interface ImageWidgetProps {
  initialUrl?: string;
  initialFit?: Fit;
  isEditMode: boolean;
  onUrlChange: (v: string) => void;
  onFitChange: (v: Fit) => void;
}

const ImageWidget: React.FC<ImageWidgetProps> = ({
  initialUrl,
  initialFit,
  isEditMode,
  onUrlChange,
  onFitChange,
}) => {
  const { t } = useI18n();
  const [url, setUrl] = useState(initialUrl || "");
  const [failed, setFailed] = useState(false);
  const fit: Fit = initialFit === "contain" ? "contain" : "cover";

  useEffect(() => {
    setUrl(initialUrl || "");
    setFailed(false);
  }, [initialUrl]);

  if (isEditMode) {
    return (
      <div className="p-3 flex flex-col justify-center gap-2 h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("imageWidget.label")}
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => onUrlChange(url)}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder={t("imageWidget.placeholder")}
          className="w-full p-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
        <div onMouseDown={(e) => e.stopPropagation()}>
          <SegmentedToggle<Fit>
            options={[
              { value: "cover", label: t("imageWidget.fitCover") },
              { value: "contain", label: t("imageWidget.fitContain") },
            ]}
            value={fit}
            onChange={onFitChange}
            ariaLabel={t("imageWidget.label")}
            className="self-start"
          />
        </div>
      </div>
    );
  }

  const safeUrl = isInAppPath(url)
    ? getImageSrc(url)
    : url
      ? normalizeExternalUrl(url)
      : null;

  if (!safeUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-[4px]">
        <ImageIcon className="h-6 w-6" />
        <span className="text-xs">{t("imageWidget.noUrl")}</span>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-[4px]">
        <ImageIcon className="h-6 w-6" />
        <span className="text-[11px] leading-snug">
          {t("imageWidget.loadError")}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={safeUrl}
        src={safeUrl}
        alt=""
        onError={() => setFailed(true)}
        className={cn(
          "w-full h-full",
          fit === "cover" ? "object-cover" : "object-contain"
        )}
      />
    </div>
  );
};

export default ImageWidget;
