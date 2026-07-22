import React from "react";
import { ServerOff } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";

interface WidgetUnavailableProps {
  // Compact variant for small widgets: tighter spacing, no description body.
  compact?: boolean;
  // Transient = the node supports the endpoint but is temporarily erroring
  // (5xx/timeout); definitive = the feature is genuinely absent (404/501).
  transient?: boolean;
  className?: string;
}

// Shared graceful placeholder for a widget whose required API isn't available on
// the active node. Replaces the generic red error / crash with an explanation
// plus a hint to switch nodes. Inherits dir from its wrapper for RTL.
const WidgetUnavailable: React.FC<WidgetUnavailableProps> = ({
  compact = false,
  transient = false,
  className,
}) => {
  const { t } = useI18n();
  const titleKey = transient
    ? "widgetUnavailable.transientTitle"
    : "widgetUnavailable.title";
  const descriptionKey = transient
    ? "widgetUnavailable.transientDescription"
    : "widgetUnavailable.description";

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-explorer-extra-light-gray/60 p-4 text-center dark:border-gray-700",
        className
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
        <ServerOff size={18} />
      </span>
      <p className="text-sm font-semibold text-explorer-dark-gray dark:text-text">
        {t(titleKey)}
      </p>
      {!compact && (
        <p className="max-w-[240px] text-xs leading-snug text-gray-500 dark:text-gray-400">
          {t(descriptionKey)}
        </p>
      )}
      <p className="text-[11px] text-gray-400 dark:text-gray-500">
        {t("widgetUnavailable.switchHint")}
      </p>
    </div>
  );
};

export default WidgetUnavailable;
