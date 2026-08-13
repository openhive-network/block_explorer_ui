import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import {
  ACCENT_HEX,
  ACCENT_KEYS,
  AccentKey,
  resolveAccent,
} from "@/components/dashboard/lib/accents";

interface LabeledDividerWidgetProps {
  initialLabel?: string;
  initialHint?: string;
  initialAccent?: AccentKey;
  isEditMode: boolean;
  onLabelChange: (v: string) => void;
  onHintChange: (v: string) => void;
  onAccentChange: (v: AccentKey) => void;
}

const LabeledDividerWidget: React.FC<LabeledDividerWidgetProps> = ({
  initialLabel,
  initialHint,
  initialAccent,
  isEditMode,
  onLabelChange,
  onHintChange,
  onAccentChange,
}) => {
  const { t } = useI18n();
  const [label, setLabel] = useState(initialLabel ?? "");
  const [hint, setHint] = useState(initialHint ?? "");

  useEffect(() => setLabel(initialLabel ?? ""), [initialLabel]);
  useEffect(() => setHint(initialHint ?? ""), [initialHint]);

  const accent = resolveAccent(initialAccent);

  const spine = (
    <span
      className={cn("h-full w-[3px] shrink-0 rounded-full", accent.spine)}
      aria-hidden="true"
    />
  );

  if (isEditMode) {
    return (
      <div className="flex h-full w-full items-center gap-2 ps-8 pe-9">
        {spine}
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => onLabelChange(label)}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder={t("labeledDividerWidget.placeholder")}
          className="w-32 shrink-0 rounded border bg-white px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.1em] text-gray-900 outline-none dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          onBlur={() => onHintChange(hint)}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder={t("labeledDividerWidget.hintPlaceholder")}
          className="min-w-0 flex-1 rounded border bg-white px-2 py-0.5 text-xs text-gray-900 outline-none dark:bg-gray-700 dark:text-white"
        />
        <div
          className="flex shrink-0 items-center gap-1"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {ACCENT_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onAccentChange(key)}
              aria-label={key}
              aria-pressed={initialAccent === key}
              className={cn(
                "h-3.5 w-3.5 rounded-full transition-all",
                initialAccent === key
                  ? "ring-2 ring-gray-500 dark:ring-gray-300"
                  : "opacity-70 hover:opacity-100"
              )}
              style={{ backgroundColor: ACCENT_HEX[key] }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-stretch gap-2.5 px-1 py-1.5">
      {spine}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.16em]",
              accent.text
            )}
          >
            {label || t("labeledDividerWidget.defaultText")}
          </span>
          <hr className="flex-grow border-gray-200 dark:border-slate-700/70" />
        </div>
        {hint && (
          <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
};

export default LabeledDividerWidget;
