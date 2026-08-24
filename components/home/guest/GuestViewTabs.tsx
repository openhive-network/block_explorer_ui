import React from "react";
import { Lock } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { requestLogin } from "@/utils/loginPrompt";
import { GUEST_VIEWS, GUEST_VIEW_META, GuestView } from "./guestViews";
import { resolveAccent } from "@/components/dashboard/lib/accents";

// Not a guest view: the board only exists once there is an account behind it.
const LOCKED_DASHBOARD = "__dashboard_locked";

interface GuestViewSwitch {
  value: GuestView;
  onChange: (view: GuestView) => void;
}

const GuestViewContext = React.createContext<GuestViewSwitch | null>(null);

export const GuestViewProvider: React.FC<
  GuestViewSwitch & { children: React.ReactNode }
> = ({ value, onChange, children }) => {
  const switcher = React.useMemo(
    () => ({ value, onChange }),
    [value, onChange]
  );
  return (
    <GuestViewContext.Provider value={switcher}>
      {children}
    </GuestViewContext.Provider>
  );
};

const GuestViewTabs: React.FC = () => {
  const switcher = React.useContext(GuestViewContext);
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  if (!switcher) return null;
  const { value, onChange } = switcher;

  const label = t("guestHome.switcherLabel");
  const active = GUEST_VIEW_META[value];
  const ActiveIcon = active.icon;
  const activeAccent = resolveAccent(active.accent);

  const edge = "border-b border-gray-200 dark:border-gray-700";

  const select = (
    <div className={cn("p-2 sm:hidden", edge)} data-testid="guest-view-mobile">
      <Select
        value={value}
        onValueChange={(view) => {
          if (view === LOCKED_DASHBOARD) {
            requestLogin();
            return;
          }
          onChange(view as GuestView);
        }}
        dir={dir}
      >
        <SelectTrigger
          aria-label={label}
          className={cn(
            "h-[35px] w-full rounded-[6px] border px-3 text-sm font-semibold shadow-sm focus:ring-offset-0",
            activeAccent.ring,
            activeAccent.chip,
            activeAccent.text,
            activeAccent.hover
          )}
        >
          <span
            className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}
          >
            <ActiveIcon size={16} strokeWidth={2} className="shrink-0" />
            <span className="whitespace-nowrap">
              {t(`guestHome.view.${value}`)}
            </span>
          </span>
        </SelectTrigger>

        <SelectContent>
          {GUEST_VIEWS.map((view) => {
            const meta = GUEST_VIEW_META[view];
            const ViewIcon = meta.icon;
            return (
              <SelectItem key={view} value={view}>
                <div
                  className={cn(
                    "flex w-full items-center gap-2",
                    isRTL && "flex-row-reverse justify-end"
                  )}
                >
                  <ViewIcon
                    size={15}
                    className={cn("shrink-0", resolveAccent(meta.accent).text)}
                  />
                  <span>{t(`guestHome.view.${view}`)}</span>
                </div>
              </SelectItem>
            );
          })}
          <SelectItem value={LOCKED_DASHBOARD}>
            <div
              className={cn(
                "flex w-full items-center gap-2 text-gray-400 dark:text-gray-500",
                isRTL && "flex-row-reverse justify-end"
              )}
            >
              <Lock size={14} className="shrink-0" />
              <span>{t("guestHome.view.dashboard")}</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const tabs = (
    <nav
      aria-label={label}
      className={cn(
        "relative hidden items-center overflow-x-auto pe-2 ps-3 sm:flex",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        edge
      )}
    >
      {GUEST_VIEWS.map((view) => {
        const meta = GUEST_VIEW_META[view];
        const Icon = meta.icon;
        const a = resolveAccent(meta.accent);
        const isActive = view === value;
        return (
          <button
            key={view}
            type="button"
            data-testid={`guest-view-tab-${view}`}
            onClick={() => onChange(view)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isActive
                ? a.text
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            )}
          >
            <Icon size={15} strokeWidth={2} className="shrink-0" />
            {t(`guestHome.view.${view}`)}
            {isActive && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-2 bottom-[2px] h-[2px] rounded-full",
                  a.spine
                )}
              />
            )}
          </button>
        );
      })}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <button
                type="button"
                data-testid="guest-view-tab-dashboard-locked"
                onClick={requestLogin}
                aria-label={t("guestHome.dashboardLockedTooltip")}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-semibold transition-colors",
                  "text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                )}
              >
                <Lock size={13} strokeWidth={2} className="shrink-0" />
                {t("guestHome.view.dashboard")}
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[220px] text-center">
            <p>{t("guestHome.dashboardLockedTooltip")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </nav>
  );

  return (
    <>
      {select}
      {tabs}
    </>
  );
};

export default GuestViewTabs;
