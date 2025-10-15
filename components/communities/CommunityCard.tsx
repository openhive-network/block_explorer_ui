import Link from "next/link";
import { Users, PenSquare, EyeOff, Languages } from "lucide-react";
import React from "react";
import type Hive from "@/types/Hive";
import { useI18n } from "@/i18n/i18n";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import Image from "next/image";

interface CommunityCardProps {
  community: Hive.CommunityListItem;
  onSubscribersClick: (community: Hive.CommunityListItem) => void;
}

const formatSubscribers = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toLocaleString();
};

const CommunityCard = ({
  community,
  onSubscribersClick,
}: CommunityCardProps) => {
  const { t } = useI18n();

  const handleSubscribersClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSubscribersClick(community);
  };

  return (
    <div className="group block h-full w-full rounded-xl border bg-white p-5 shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 border-slate-200 dark:bg-theme">
      <div className="flex h-full flex-col">
        {/* Header Section */}
        <Link href={`/@${community.name}`} className="flex items-center gap-4">
          <Image
            src={getHiveAvatarUrl(community.name)}
            alt={community.name}
            width={56}
            height={56}
            className="h-14 w-14 flex-shrink-0 rounded-full border-2 object-cover border-slate-200 dark:border-slate-700"
          />
          <div className="flex-1 overflow-hidden">
            <h3 className="truncate text-lg font-bold transition-colors">
              {community.title}
            </h3>
            <p className="truncate text-sm">{community.name}</p>
          </div>
        </Link>

        {/* About Section */}
        <p className="my-4 flex-grow text-sm text-explorer-dark-gray dark:text-white line-clamp-3">
          {community.about}
        </p>

        {/* Footer Section */}
        <div className="text-explorer-dark-gray mt-auto border-t pt-4 border-slate-200/80 dark:border-slate-800">
          {/* First row: subscribers + authors */}
          <div className="flex items-center gap-4">
            {/* Subscribers */}
            <button
              type="button"
              onClick={handleSubscribersClick}
              className="flex items-center gap-1.5 rounded-md p-1 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              title={t("communityCard.viewSubscribersTitle")}
            >
              <Users className="h-4 w-4" color="#22c55e" />
              <span className="font-semibold truncate">{formatSubscribers(community.subscribers)}</span>
              <span className="truncate">{t("communityCard.subscribersLabel")}</span>
            </button>

            {/* Authors */}
            <div className="flex items-center gap-1.5 p-1 text-sm">
              <PenSquare className="h-4 w-4" color="#0ea5e9" />
              <span className="font-semibold truncate">{community.num_authors}</span>
              <span className="truncate">{t("communityCard.authorsLabel")}</span>
            </div>
          </div>

          {/* Second row: language badge */}
          {!community.is_nsfw && (
            <div className="inline-flex items-center gap-1.5 mt-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800 text-explorer-dark-gray">
              <Languages className="h-3 w-3" />
              <span>{community.lang.toUpperCase()}</span>
            </div>
          )}

          {/* NSFW badge */}
          {community.is_nsfw && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-500 dark:bg-red-500/20 dark:text-red-400">
                <EyeOff className="h-3 w-3" />
                {t("communityCard.nsfwLabel")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CommunityCardSkeleton = () => (
  <div className="h-full w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-theme">
    <div className="flex h-full animate-pulse flex-col">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>
      </div>
      <div className="my-4 flex-grow space-y-2">
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>
      <div className="mt-auto flex items-end justify-between border-t pt-4 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>
        <div className="h-5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
      </div>
    </div>
  </div>
);

export default CommunityCard;
