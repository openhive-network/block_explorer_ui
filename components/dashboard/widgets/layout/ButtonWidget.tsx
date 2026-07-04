import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { normalizeExternalUrl } from "@/utils/SafeUrl";
import { Palette, ExternalLink } from "lucide-react";

interface ButtonWidgetProps {
  initialLabel?: string;
  initialUrl?: string;
  initialColor?: string;
  isEditMode: boolean;
  onLabelChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onColorChange: (v: string) => void;
}

const ButtonWidget: React.FC<ButtonWidgetProps> = ({
  initialLabel,
  initialUrl,
  initialColor,
  isEditMode,
  onLabelChange,
  onUrlChange,
  onColorChange,
}) => {
  const { t } = useI18n();
  const [label, setLabel] = useState(initialLabel ?? "");
  const [url, setUrl] = useState(initialUrl ?? "");
  const color = initialColor || "#6366f1";

  useEffect(() => setLabel(initialLabel ?? ""), [initialLabel]);
  useEffect(() => setUrl(initialUrl ?? ""), [initialUrl]);

  if (isEditMode) {
    return (
      <div
        className="h-full w-full flex flex-col justify-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 p-2.5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => onLabelChange(label)}
          placeholder={t("buttonWidget.labelPlaceholder")}
          className="w-full rounded border bg-white dark:bg-gray-700 p-1.5 text-sm text-gray-900 dark:text-white outline-none"
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => onUrlChange(url)}
          placeholder={t("buttonWidget.urlPlaceholder")}
          className="w-full rounded border bg-white dark:bg-gray-700 p-1.5 text-sm text-gray-900 dark:text-white outline-none"
        />
        <div className="flex items-center gap-2">
          <div
            className="relative flex h-7 w-7 items-center justify-center rounded"
            title={t("buttonWidget.colorTooltip")}
          >
            <Palette className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
          <span
            className="h-4 w-4 rounded-full border border-black/10"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    );
  }

  const safeUrl = url ? normalizeExternalUrl(url) : null;

  return (
    <div className="h-full w-full flex items-center justify-center p-2">
      <a
        href={safeUrl ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!safeUrl) e.preventDefault();
        }}
        style={{ backgroundColor: color }}
        className="inline-flex max-w-full items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
      >
        <span className="truncate">
          {label || t("buttonWidget.defaultLabel")}
        </span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
      </a>
    </div>
  );
};

export default ButtonWidget;
