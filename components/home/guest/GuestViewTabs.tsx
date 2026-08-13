import React from "react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { GUEST_VIEWS, GUEST_VIEW_META, GuestView } from "./guestViews";
import { resolveAccent } from "@/components/dashboard/lib/accents";

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
    <div className={cn("p-2 sm:hidden", edge)}>
      <Select
        value={value}
        onValueChange={(view) => onChange(view as GuestView)}
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
        </SelectContent>
      </Select>
    </div>
  );

  const tabs = (
    <nav
      aria-label={label}
      className={cn("relative hidden items-center pe-2 ps-3 sm:flex", edge)}
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
