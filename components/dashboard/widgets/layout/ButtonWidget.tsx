import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/i18n";
import { isInAppPath, normalizeExternalUrl } from "@/utils/SafeUrl";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ButtonWidgetProps {
  initialLabel?: string;
  initialUrl?: string;
  isEditMode: boolean;
  onLabelChange: (v: string) => void;
  onUrlChange: (v: string) => void;
}

const ButtonWidget: React.FC<ButtonWidgetProps> = ({
  initialLabel,
  initialUrl,
  isEditMode,
  onLabelChange,
  onUrlChange,
}) => {
  const { t } = useI18n();
  const [label, setLabel] = useState(initialLabel ?? "");
  const [url, setUrl] = useState(initialUrl ?? "");

  useEffect(() => setLabel(initialLabel ?? ""), [initialLabel]);
  useEffect(() => setUrl(initialUrl ?? ""), [initialUrl]);

  if (isEditMode) {
    return (
      <div className="h-full w-full flex flex-col justify-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 p-2.5 pe-9">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => onLabelChange(label)}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder={t("buttonWidget.labelPlaceholder")}
          className="w-full rounded border bg-white dark:bg-gray-700 p-1.5 text-sm text-gray-900 dark:text-white outline-none"
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => onUrlChange(url)}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder={t("buttonWidget.urlPlaceholder")}
          className="w-full rounded border bg-white dark:bg-gray-700 p-1.5 font-mono text-[11px] text-gray-700 dark:text-gray-200 outline-none"
        />
      </div>
    );
  }

  // "/witnesses" through the external normalizer returns null: live but dead.
  const internal = isInAppPath(url);
  const safeUrl = internal ? url : url ? normalizeExternalUrl(url) : null;
  const Glyph = internal ? ArrowRight : ExternalLink;

  const face = (
    <>
      <Glyph className="me-2 h-4 w-4 shrink-0 rtl:rotate-180" />
      <span className="truncate">
        {label || t("buttonWidget.defaultLabel")}
      </span>
    </>
  );

  return (
    <div className="h-full w-full flex items-center justify-center p-2">
      <Button asChild>
        {internal && safeUrl ? (
          <Link href={safeUrl}>{face}</Link>
        ) : (
          <a
            href={safeUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!safeUrl) e.preventDefault();
            }}
          >
            {face}
          </a>
        )}
      </Button>
    </div>
  );
};

export default ButtonWidget;
