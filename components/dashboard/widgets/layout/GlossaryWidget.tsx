import React, { useEffect, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { resolveAccent, AccentKey } from "@/components/dashboard/lib/accents";
import { parseTerms } from "@/components/dashboard/lib/glossaryTerms";

interface GlossaryWidgetProps {
  initialTitle?: string;
  initialTerms?: string;
  initialAccent?: AccentKey;
  isEditMode: boolean;
  onTitleChange: (v: string) => void;
  onTermsChange: (v: string) => void;
}

const GlossaryWidget: React.FC<GlossaryWidgetProps> = ({
  initialTitle,
  initialTerms,
  initialAccent,
  isEditMode,
  onTitleChange,
  onTermsChange,
}) => {
  const { t } = useI18n();
  const [title, setTitle] = useState(initialTitle ?? "");
  const [terms, setTerms] = useState(initialTerms ?? "");

  useEffect(() => setTitle(initialTitle ?? ""), [initialTitle]);
  useEffect(() => setTerms(initialTerms ?? ""), [initialTerms]);

  const accent = resolveAccent(initialAccent);
  const parsed = useMemo(() => parseTerms(initialTerms ?? ""), [initialTerms]);

  const shell =
    "flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-theme dark:border-gray-700";

  if (isEditMode) {
    return (
      <div className={shell}>
        {/* min-h-0 so the textarea can claim the height instead of the flex
            column keeping its content size and leaving the card half empty. */}
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-2.5 pt-9">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => onTitleChange(title)}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder={t("glossaryWidget.titlePlaceholder")}
            className="w-full rounded border bg-white px-2 py-1 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-700 dark:text-white"
          />
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            onBlur={() => onTermsChange(terms)}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder={t("glossaryWidget.termsPlaceholder")}
            className="min-h-[120px] w-full flex-1 resize-none rounded border bg-white p-2 text-xs leading-relaxed text-gray-900 outline-none dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <BookOpen size={14} className={cn("shrink-0", accent.text)} />
        <h3 className="min-w-0 truncate text-sm font-semibold text-gray-900 dark:text-white">
          {title || t("glossaryWidget.defaultTitle")}
        </h3>
      </div>

      {parsed.length === 0 ? (
        <p className="p-3 text-xs text-gray-500 dark:text-gray-400">
          {t("glossaryWidget.empty")}
        </p>
      ) : (
        <dl className="flex-1 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700/60">
          {parsed.map((entry, index) => (
            <div key={index} className="px-3 py-2">
              <dt
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.1em]",
                  accent.text
                )}
              >
                {entry.term}
              </dt>
              {entry.meaning && (
                <dd className="mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                  {entry.meaning}
                </dd>
              )}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

export default GlossaryWidget;
