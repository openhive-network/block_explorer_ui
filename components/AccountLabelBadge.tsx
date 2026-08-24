import React from "react";
import {
  Building2,
  Landmark,
  Flame,
  BadgeCheck,
  Wrench,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import { AccountLabelType, ResolvedAccountLabel } from "@/utils/accountLabels";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const COLOR_BY_TYPE: Record<AccountLabelType, string> = {
  exchange:
    "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  treasury:
    "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  burn: "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
  witness:
    "border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  service:
    "border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
  badActor:
    "border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

const ICON_BY_TYPE: Record<AccountLabelType, React.ReactNode> = {
  exchange: <Building2 className="h-3 w-3" />,
  treasury: <Landmark className="h-3 w-3" />,
  burn: <Flame className="h-3 w-3" />,
  witness: <BadgeCheck className="h-3 w-3" />,
  service: <Wrench className="h-3 w-3" />,
  badActor: <ShieldAlert className="h-3 w-3" />,
};

const FALLBACK_TEXT_KEY: Partial<Record<AccountLabelType, string>> = {
  witness: "accountLabel.witness",
  badActor: "accountLabel.badActor",
};

interface Props {
  label: ResolvedAccountLabel | null;
}

const AccountLabelBadge: React.FC<Props> = ({ label }) => {
  const { t } = useI18n();
  if (!label) return null;
  const text =
    label.label || t(FALLBACK_TEXT_KEY[label.type] ?? "accountLabel.witness");
  const isInactive = label.status === "inactive";
  // "Possible bad actor" is too long to sit next to a name; the icon carries
  // it and the tooltip spells it out.
  const iconOnly = label.type === "badActor";
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 whitespace-nowrap rounded-full border py-0.5 text-[10px] font-semibold leading-none",
              iconOnly ? "px-1" : "px-1.5",
              COLOR_BY_TYPE[label.type],
              isInactive && "opacity-70"
            )}
            aria-label={iconOnly ? text : undefined}
            data-testid="account-label-badge"
            data-label-type={label.type}
            data-label-status={label.status}
          >
            <span className="shrink-0">{ICON_BY_TYPE[label.type]}</span>
            {!iconOnly && (
              <span
                className={cn(
                  "max-w-[7rem] truncate",
                  isInactive && "line-through"
                )}
              >
                {text}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            side="top"
            className="max-w-[240px] text-center text-[11px]"
          >
            {iconOnly && <span className="block font-bold">{text}</span>}
            {t(isInactive ? "accountLabel.inactiveInfo" : label.tooltipKey)}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AccountLabelBadge;
