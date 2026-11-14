import React from "react";
import { Info } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { GovernanceWeight } from "@/utils/governanceVests";

// One line in the user menu: how much the account's witness and proposal
// votes count, beside the two menu items that list those votes. The navbar
// loads the weight, so it is there the moment the menu opens.
const GovernanceWeightRow: React.FC<{ weight: GovernanceWeight | null }> = ({
  weight,
}) => {
  const { t, locale } = useI18n();

  const amount = weight
    ? `${weight.hp.toLocaleString(locale, {
        maximumFractionDigits: weight.hp >= 1000 ? 0 : 3,
      })} HP`
    : "";

  // The handle isolated, so "@" stays in front of it in right-to-left text.
  const proxy =
    weight?.status === "proxy" ? `\u2068@${weight.proxy}\u2069` : "";
  const note =
    weight?.status === "inactive"
      ? t("auth.governanceWeightInactive")
      : weight?.status === "proxy"
        ? t("auth.governanceWeightProxy", { proxy })
        : null;

  const tooltip =
    weight?.status === "inactive"
      ? t("auth.governanceWeightInactiveTooltip")
      : weight?.status === "proxy"
        ? t("auth.governanceWeightProxyTooltip", { proxy })
        : [
            t("auth.governanceWeightTooltip"),
            weight?.status === "active" && weight.expires
              ? t("auth.governanceWeightActiveUntil", {
                  date: weight.expires.toLocaleDateString(locale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  }),
                })
              : null,
          ]
            .filter(Boolean)
            .join(" ");

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            type="button"
            data-testid="governance-weight"
            className="flex w-full cursor-help flex-col gap-0.5 rounded-lg px-2.5 py-2 text-start text-sm hover:bg-secondary/60"
          >
            <span className="flex items-center gap-1.5 font-medium text-text">
              {t("auth.governanceWeight")}
              <Info className="h-3 w-3 shrink-0 text-gray-400 dark:text-gray-500" />
            </span>
            {/* The amount on its own line: beside the label it wraps in most
                languages at the menu's width. */}
            <span className="flex flex-wrap items-baseline gap-x-1.5">
              {!weight ? (
                <span className="my-0.5 h-3 w-16 animate-pulse rounded bg-secondary/60" />
              ) : (
                <bdi
                  className={cn(
                    "whitespace-nowrap text-xs font-semibold tabular-nums",
                    weight.status === "active"
                      ? "text-text"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {amount}
                </bdi>
              )}
              {note && (
                <span
                  className={cn(
                    "text-[10px]",
                    weight?.status === "inactive"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {note}
                </span>
              )}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-[220px] text-start text-[11px]"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GovernanceWeightRow;
