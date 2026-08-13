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
import SegmentedToggle from "@/components/ui/SegmentedToggle";

type Variant = "info" | "tip" | "warning" | "success";

interface NoteWidgetProps {
  initialText?: string;
  initialTitle?: string;
  initialVariant?: Variant;
  isEditMode: boolean;
  onTextChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onVariantChange: (v: Variant) => void;
}

const VARIANTS: Record<
  Variant,
  { icon: LucideIcon; box: string; icon_color: string; title: string }
> = {
  info: {
    icon: Info,
    box: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
    icon_color: "text-blue-500",
    title: "text-blue-800 dark:text-blue-200",
  },
  tip: {
    icon: Lightbulb,
    box: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/40",
    icon_color: "text-indigo-500",
    title: "text-indigo-800 dark:text-indigo-200",
  },
  warning: {
    icon: AlertTriangle,
    box: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40",
    icon_color: "text-amber-500",
    title: "text-amber-800 dark:text-amber-200",
  },
  success: {
    icon: CheckCircle2,
    box: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40",
    icon_color: "text-emerald-500",
    title: "text-emerald-800 dark:text-emerald-200",
  },
};

const NoteWidget: React.FC<NoteWidgetProps> = ({
  initialText,
  initialTitle,
  initialVariant,
  isEditMode,
  onTextChange,
  onTitleChange,
  onVariantChange,
}) => {
  const { t } = useI18n();
  const [text, setText] = useState(initialText ?? "");
  const [title, setTitle] = useState(initialTitle ?? "");
  const variant: Variant =
    initialVariant && VARIANTS[initialVariant] ? initialVariant : "info";

  useEffect(() => setText(initialText ?? ""), [initialText]);
  useEffect(() => setTitle(initialTitle ?? ""), [initialTitle]);

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
        <div
          className="flex items-center gap-1.5 pe-8"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <SegmentedToggle<Variant>
            options={(Object.keys(VARIANTS) as Variant[]).map((v) => ({
              value: v,
              label: t(`noteWidget.variant_${v}`),
            }))}
            value={variant}
            onChange={onVariantChange}
            ariaLabel={t("noteWidget.styleLabel")}
            className="bg-white/60 dark:bg-black/20"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => onTitleChange(title)}
            placeholder={t("noteWidget.titlePlaceholder")}
            className="min-w-0 flex-1 rounded border bg-white/70 px-2 py-0.5 text-xs font-semibold text-gray-900 outline-none dark:bg-black/20 dark:text-white"
          />
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
      <div className="min-w-0">
        {title && (
          <p
            className={cn(
              "mb-0.5 text-[11px] font-bold uppercase tracking-[0.12em]",
              cfg.title
            )}
          >
            {title}
          </p>
        )}
        <p
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap break-words",
            text
              ? "text-gray-700 dark:text-gray-200"
              : "text-gray-500 dark:text-gray-400"
          )}
        >
          {text || t("noteWidget.empty")}
        </p>
      </div>
    </div>
  );
};

export default NoteWidget;
