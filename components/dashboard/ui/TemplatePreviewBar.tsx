import React, { useState } from "react";
import { ArrowRight, CopyPlus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { resolveAccent } from "@/components/dashboard/lib/accents";
import { getBoardTemplate } from "@/components/dashboard/templates";

interface TemplatePreviewBarProps {
  boardKey: string;
  /** Widget count on the board that adopting would replace. */
  replacedWidgetCount: number;
  onConfirm: () => void;
}

const TemplatePreviewBar: React.FC<TemplatePreviewBarProps> = ({
  boardKey,
  replacedWidgetCount,
  onConfirm,
}) => {
  const { t } = useI18n();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const template = getBoardTemplate(boardKey);
  if (!template) return null;

  const accent = resolveAccent(template.accent);
  const boardName = t(template.nameKey);
  const label = t("boards.preview.setAsMyBoard");

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    onConfirm();
  };

  const actionClasses = cn(
    "flex shrink-0 items-center justify-center gap-1.5 rounded border transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    accent.chip,
    accent.text,
    accent.ring,
    accent.hover
  );

  return (
    <div className="page-container">
      {/* Continues the tab strip's box, with the board header's own spine. */}
      <div
        className={cn(
          "relative mx-1 flex flex-col gap-2 overflow-hidden rounded-b border border-t-0 border-gray-200 bg-theme py-2 pe-2 ps-4",
          "sm:flex-row sm:items-center sm:gap-3",
          "dark:border-gray-700"
        )}
      >
        <span
          aria-hidden="true"
          className={cn("absolute inset-y-0 start-0 w-[3px]", accent.spine)}
        />

        <div
          className="flex min-w-0 items-center gap-2"
          data-testid="template-preview-badge"
        >
          <span
            className={cn(
              "shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]",
              accent.text
            )}
          >
            {t("boards.preview.badge")}
          </span>
          <p className="min-w-0 truncate text-xs text-gray-500 dark:text-gray-400">
            {t("boards.preview.notice")}
          </p>
        </div>

        {/* Bridges label to action so the gap reads as structure, not emptiness. */}
        <span
          aria-hidden="true"
          className={cn("hidden flex-1 border-t sm:block", accent.ring)}
        />

        {/* Touch has no hover, so small screens keep the label visible. */}
        <button
          type="button"
          data-testid="template-adopt-trigger"
          onClick={() => setIsConfirmOpen(true)}
          className={cn(
            actionClasses,
            "px-3 py-1.5 text-xs font-semibold sm:hidden"
          )}
        >
          <CopyPlus size={14} className="shrink-0" />
          {label}
        </button>

        {/* No app-wide provider exists; every tooltip here brings its own. */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-testid="template-adopt-trigger"
                onClick={() => setIsConfirmOpen(true)}
                aria-label={label}
                className={cn(actionClasses, "hidden h-7 w-7 sm:flex")}
              >
                <CopyPlus size={14} className="shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        {/* No `relative`: Tailwind emits it after `fixed`, breaking centering. */}
        <DialogContent className="max-w-md overflow-hidden">
          <span
            aria-hidden="true"
            className={cn("absolute inset-y-0 start-0 w-[3px]", accent.spine)}
          />

          <DialogHeader className="text-start">
            <span
              className={cn(
                "font-mono text-[10px] font-semibold uppercase tracking-[0.14em]",
                accent.text
              )}
            >
              {boardName}
            </span>
            <DialogTitle>{t("boards.adopt.title")}</DialogTitle>
            {/* muted-foreground is a hardcoded 50% white; invisible here. */}
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              {t("boards.adopt.description")}
            </DialogDescription>
          </DialogHeader>

          {/* The trade: what leaves, what arrives. */}
          <div className="flex items-stretch gap-3">
            <div className="min-w-0 flex-1 rounded border border-gray-200 px-3 py-2 dark:border-gray-700">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                {t("boards.adopt.replaced")}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
                {t("boards.myBoard.name")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("boards.adopt.widgetCount").replace(
                  "{count}",
                  String(replacedWidgetCount)
                )}
              </p>
            </div>

            <ArrowRight
              size={16}
              aria-hidden="true"
              className="mt-6 shrink-0 text-gray-300 rtl:rotate-180 dark:text-gray-600"
            />

            <div
              className={cn(
                "min-w-0 flex-1 rounded border px-3 py-2",
                accent.chip,
                accent.ring
              )}
            >
              <p
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.12em] opacity-70",
                  accent.text
                )}
              >
                {t("boards.adopt.incoming")}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
                {boardName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("boards.adopt.widgetCount").replace(
                  "{count}",
                  String(template.items.length)
                )}
              </p>
            </div>
          </div>

          {/* The undo snapshot is never synced, so say so before they commit. */}
          <p className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Info size={14} className="mt-px shrink-0" aria-hidden="true" />
            <span>{t("boards.adopt.deviceNote")}</span>
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              {t("boards.adopt.cancel")}
            </Button>
            <Button onClick={handleConfirm} data-testid="adopt-confirm">
              {t("boards.adopt.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplatePreviewBar;
