import React from "react";
import Link from "next/link";
import { ArrowLeftRight, Box } from "lucide-react";

import HiveAvatar from "@/components/ui/HiveAvatar";
import { useRecentlyViewed } from "@/hooks/common/useRecentlyViewed";
import { useI18n } from "@/i18n/i18n";
import { deploySettings } from "@/utils/deploySettings";
import { recentEntryHref, recentEntryLabel } from "@/utils/recentlyViewed";

interface RecentlyViewedListProps {
  onNavigate: () => void;
}

const RecentlyViewedList: React.FC<RecentlyViewedListProps> = ({
  onNavigate,
}) => {
  const { t, locale } = useI18n();
  const { entries, clear } = useRecentlyViewed();

  if (!deploySettings.recentVisits || !entries.length) return null;

  return (
    <div className="mb-1 border-b border-slate-200 pb-1 dark:border-slate-700">
      <div className="flex items-center justify-between px-2 pb-1 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t("navbar.recent")}
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-[10px] font-medium text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
        >
          {t("navbar.clearRecent")}
        </button>
      </div>
      {entries.map((entry) => (
        <Link
          key={`${entry.kind}-${entry.id}`}
          href={recentEntryHref(entry)}
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {entry.kind === "account" ? (
            <HiveAvatar
              accountName={entry.id}
              size={16}
              alt={entry.id}
              className="h-4 w-4 shrink-0 rounded-full"
            />
          ) : entry.kind === "block" ? (
            <Box className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
          ) : (
            <ArrowLeftRight className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
          )}
          <span className="min-w-0 truncate tabular-nums">
            {recentEntryLabel(entry, locale)}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default RecentlyViewedList;
