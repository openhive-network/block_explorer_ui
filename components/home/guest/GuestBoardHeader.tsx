import React from "react";
import { LucideIcon } from "lucide-react";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import useHeadBlock from "@/hooks/api/homePage/useHeadBlock";
import { cn } from "@/lib/utils";

import { GuestAccent } from "./guestViews";
import GuestViewTabs from "./GuestViewTabs";
import LiveHeadBlock from "@/components/dashboard/ui/LiveHeadBlock";
import LiveDataToggle from "@/components/dashboard/ui/LiveDataToggle";
import { resolveAccent } from "@/components/dashboard/lib/accents";
export type { GuestAccent };

interface GuestBoardHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  accent: GuestAccent;
  showLiveData?: boolean;
  headingLevel?: "h1" | "h2";
}

const GuestBoardHeader: React.FC<GuestBoardHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  accent,
  showLiveData = true,
  headingLevel: Heading = "h2",
}) => {
  const headBlock = useHeadBlockNumber().headBlockNumberData;
  const { headBlockData } = useHeadBlock(headBlock);
  const a = resolveAccent(accent);

  return (
    <div className="page-container">
      <div className="relative mb-3 overflow-hidden rounded border border-gray-200 bg-theme dark:border-gray-700">
        <span
          className={cn("absolute inset-y-0 start-0 w-1", a.spine)}
          aria-hidden="true"
        />
        <GuestViewTabs />
        <div className="relative flex flex-col justify-center gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3.5 sm:px-0 sm:ps-5 sm:pe-4 sm:py-3">
          <div className="flex min-w-0 items-center gap-3 sm:contents">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-md sm:h-11 sm:w-11",
                a.chip,
                a.text
              )}
              aria-hidden="true"
            >
              <Icon size={22} strokeWidth={1.75} />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-[10px] font-semibold uppercase leading-none tracking-[0.18em]",
                  a.text
                )}
              >
                {eyebrow}
              </p>
              <Heading className="mt-1 text-xl font-bold leading-tight tracking-[-0.02em] text-gray-900 dark:text-white sm:text-2xl">
                {title}
              </Heading>
              {subtitle && (
                <p className="mt-0.5 text-xs leading-snug text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            {showLiveData && (
              <LiveDataToggle className="self-start sm:hidden" />
            )}
          </div>

          <div className="-mx-3 -mb-2.5 mt-2 border-t border-gray-100 bg-gray-50/70 px-3 py-2 dark:border-gray-700/60 dark:bg-gray-800/30 sm:contents">
            <LiveHeadBlock
              headBlock={headBlock}
              dotClass={a.dot}
              glyphClass={a.text}
              showLiveData={showLiveData}
              blockTime={headBlockData?.created_at}
              hideToggleOnMobile
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestBoardHeader;
