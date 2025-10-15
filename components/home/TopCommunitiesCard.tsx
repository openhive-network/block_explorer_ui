import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  MoveLeft,
  MoveRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Hive from "@/types/Hive";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

interface TopCommunitiesCardProps {
  communitiesData?: Hive.CommunityListItem[];
  isLoading: boolean;
}

const TopCommunitiesCard = ({
  communitiesData,
  isLoading,
}: TopCommunitiesCardProps) => {
  const { t, dir } = useI18n();
  const [activeCommunity, setActiveCommunity] =
    useState<Hive.CommunityListItem | null>(null);
  const SeeMoreIcon = dir === "rtl" ? MoveLeft : MoveRight;
  const ChevronNavIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  const handleSelectCommunity = (community: Hive.CommunityListItem) => {
    setActiveCommunity(community);
  };

  const renderContent = () => {
    if (isLoading) {
      // Return a compact skeleton that matches the grid layout
      return (
        <div className="p-4">
          <div className="grid grid-cols-5 gap-y-4 gap-x-2 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex justify-center">
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!communitiesData || communitiesData.length === 0) {
      return (
        <div className="flex h-36 items-center justify-center text-sm">
          {t("home.noTopCommunitiesFound")}
        </div>
      );
    }

    return (
      <div className="p-4" onMouseLeave={() => setActiveCommunity(null)}>
        <div className="grid grid-cols-5 gap-y-4 gap-x-2">
          {communitiesData.slice(0, 10).map((community, index) => (
            <div key={community.name} className="relative flex justify-center">
              <button
                onClick={() => handleSelectCommunity(community)}
                onMouseEnter={() => handleSelectCommunity(community)}
                className={cn(
                  "group relative rounded-full ring-offset-2 ring-offset-white transition-all duration-200 ease-in-out hover:scale-110 focus:outline-none dark:ring-offset-slate-900",
                  activeCommunity?.name === community.name &&
                    "scale-110 ring-2 border-link"
                )}
              >
                <Image
                  className="rounded-full"
                  src={getHiveAvatarUrl(community.name)}
                  alt={community.title}
                  width={40}
                  height={40}
                />
                <div className="absolute -top-1 start-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-900/70 px-1 font-mono text-xs font-bold text-white backdrop-blur-sm">
                  {index + 1}
                </div>
              </button>
            </div>
          ))}
        </div>

        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out mt-4",
            activeCommunity ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            {activeCommunity && (
              <Link
                href={`/@${activeCommunity.name}`}
                className="group/link flex items-center justify-between rounded-lg bg-slate-100 p-3 text-left dark:bg-slate-800"
              >
                <div className="overflow-hidden">
                  <p className="truncate font-bold">{activeCommunity.title}</p>
                  <p className="truncate text-sm">{activeCommunity.name}</p>
                </div>
                <ChevronNavIcon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                    "group-hover/link:translate-x-1 rtl:group-hover/link:-translate-x-1"
                  )}
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden" data-testid="top-communities-card">
      <CardHeader className="flex justify-between items-center border-b px-1 py-3">
        <CardTitle>{t("home.topCommunities")}</CardTitle>
        <Link href="/communities" className="text-sm flex items-center gap-1">
          <span>{t("common.seeMore")}</span>
          <SeeMoreIcon width={18} />
        </Link>
      </CardHeader>

      <CardContent className="p-0">{renderContent()}</CardContent>
    </Card>
  );
};

export default TopCommunitiesCard;