import Link from "next/link";
import { Users, PenSquare, EyeOff, Languages } from "lucide-react";
import React from "react";
import type Hive from "@/types/Hive";
import { useI18n } from "@/i18n/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import HiveAvatar from "@/components/ui/HiveAvatar";

interface CommunityCardProps {
  community: Hive.CommunityListItem;
  onSubscribersClick: (community: Hive.CommunityListItem) => void;
}

const formatSubscribers = (count: number, locale: string): string => {
  if (count >= 1000) {
    return `${(count / 1000).toLocaleString(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}k`;
  }
  return count.toLocaleString(locale);
};

const CommunityCard = ({
  community,
  onSubscribersClick,
}: CommunityCardProps) => {
  const { t, locale } = useI18n();

  const handleSubscribersClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSubscribersClick(community);
  };

  return (
    <div className="group block h-full w-full rounded-lg border bg-theme p-3.5 shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-0.5 border-slate-200 dark:border-slate-800">
      <div className="flex h-full flex-col">
        {/* Header Section */}
        <Link
          href={`/@${community.name}`}
          className="flex items-center gap-2.5"
        >
          <HiveAvatar
            accountName={community.name}
            size={44}
            alt={community.name}
            className="h-11 w-11 flex-shrink-0 rounded-full border-2 object-cover border-slate-200 dark:border-slate-700"
          />
          <div className="flex-1 overflow-hidden">
            <h3 className="truncate text-[15px] font-bold leading-tight transition-colors">
              {community.title}
            </h3>
            <p className="truncate text-xs">{community.name}</p>
          </div>
        </Link>

        {/* About Section */}
        <p className="mt-2 mb-2.5 flex-grow text-xs leading-snug text-explorer-dark-gray dark:text-white line-clamp-3">
          {community.about}
        </p>

        {/* Footer Section: stats and badges share one row */}
        <div className="text-explorer-dark-gray mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t pt-2 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {/* Subscribers */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleSubscribersClick}
                    className="flex items-center gap-1 rounded-md px-1 py-0.5 text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Users className="h-3.5 w-3.5 shrink-0" color="#22c55e" />
                    <span className="font-semibold tabular-nums">
                      {formatSubscribers(community.subscribers, locale)}
                    </span>
                    <span className="truncate">
                      {t("communityCard.subscribersLabel")}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent side="top" className="text-[11px]">
                    {t("communityCard.viewSubscribersTitle")}
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>

            {/* Authors */}
            <div className="flex items-center gap-1 px-1 py-0.5 text-xs">
              <PenSquare className="h-3.5 w-3.5 shrink-0" color="#0ea5e9" />
              <span className="font-semibold tabular-nums">
                {community.num_authors.toLocaleString(locale)}
              </span>
              <span className="truncate">
                {t("communityCard.authorsLabel")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {community.is_nsfw && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-500 dark:bg-red-500/20 dark:text-red-400">
                <EyeOff className="h-3 w-3" />
                {t("communityCard.nsfwLabel")}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium dark:bg-slate-800 text-explorer-dark-gray">
              <Languages className="h-3 w-3" />
              {community.lang.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CommunityCardSkeleton = () => (
  <div className="h-full w-full rounded-lg border border-slate-200 bg-theme p-3.5 shadow-sm dark:border-slate-800">
    <div className="flex h-full animate-pulse flex-col">
      <div className="flex items-center gap-2.5">
        <div className="h-11 w-11 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700"></div>
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>
      </div>
      <div className="mt-2 mb-2.5 flex-grow space-y-1.5">
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t pt-2 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>
        <div className="h-4 w-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
      </div>
    </div>
  </div>
);

export default CommunityCard;
