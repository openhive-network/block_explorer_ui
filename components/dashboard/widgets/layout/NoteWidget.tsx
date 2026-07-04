import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import {
  Info,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "info" | "tip" | "warning" | "success";

interface NoteWidgetProps {
  initialText?: string;
  initialVariant?: Variant;
  isEditMode: boolean;
  onTextChange: (v: string) => void;
  onVariantChange: (v: Variant) => void;
}

const VARIANTS: Record<
  Variant,
  { icon: LucideIcon; box: string; icon_color: string }
> = {
  info: {
    icon: Info,
    box: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
    icon_color: "text-blue-500",
  },
  tip: {
    icon: Lightbulb,
    box: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/40",
    icon_color: "text-indigo-500",
  },
  warning: {
    icon: AlertTriangle,
    box: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40",
    icon_color: "text-amber-500",
  },
  success: {
    icon: CheckCircle2,
    box: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40",
    icon_color: "text-emerald-500",
  },
};

const NoteWidget: React.FC<NoteWidgetProps> = ({
  initialText,
  initialVariant,
  isEditMode,
  onTextChange,
  onVariantChange,
}) => {
  const { t } = useI18n();
  const [text, setText] = useState(initialText ?? "");
  const variant: Variant =
    initialVariant && VARIANTS[initialVariant] ? initialVariant : "info";

  useEffect(() => setText(initialText ?? ""), [initialText]);

  const cfg = VARIANTS[variant];
  const Icon = cfg.icon;

  if (isEditMode) {
    return (
      <div
        className={cn(
          "h-full w-full flex flex-col gap-2 rounded-lg border p-2.5",
          cfg.box
        )}
      >
        <div className="flex gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
          {(Object.keys(VARIANTS) as Variant[]).map((v) => {
            const VIcon = VARIANTS[v].icon;
            return (
              <button
                key={v}
                type="button"
                onClick={() => onVariantChange(v)}
                title={t(`noteWidget.variant_${v}`)}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded transition-colors",
                  variant === v
                    ? "bg-indigo-500 text-white"
                    : "bg-white/60 dark:bg-black/20 text-gray-500 dark:text-gray-400"
                )}
              >
                <VIcon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => onTextChange(text)}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder={t("noteWidget.placeholder")}
          className="flex-grow w-full resize-none rounded border bg-white/70 dark:bg-black/20 p-2 text-sm text-gray-900 dark:text-white outline-none"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full w-full flex items-start gap-2.5 rounded-lg border p-3 overflow-auto",
        cfg.box
      )}
    >
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.icon_color)} />
      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
        {text || t("noteWidget.placeholder")}
      </p>
    </div>
  );
};

export default NoteWidget;
