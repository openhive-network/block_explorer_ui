import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  MessageSquare,
  List,
  Settings2,
  Heart, // Changed from List to Heart in your provided code
} from "lucide-react";

import {
  formatAndDelocalizeFromTime,
  formatAndDelocalizeTime,
} from "@/utils/TimeUtils";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { changeHBDToDollarsDisplay } from "@/utils/StringUtils";
import Hive from "@/types/Hive";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/hybrid-tooltip";
import { useI18n } from "@/i18n/i18n";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import Image from "next/image";
import CopyButton from "../ui/CopyButton";

interface PostContentCardProps {
  isComment?: boolean;
  isPropertiesOpen: boolean;
  isVoteDetailsOpen: boolean;
  isCommentsVisible: boolean;
  handlePropertiesToggle: () => void;
  handleVoteDetailsToggle: () => void;
  handleCommentsToggle: () => void;
  voteDetailsLength: number;
  voters: string[];
  data: Hive.HivePost | undefined | null;
  commentsLength: number;
}

const showPayoutValue = (
  isPaidout: boolean,
  payout: number,
  pendingPayout: string
) => {
  if (isPaidout) {
    const roundPayoutValue = Math.round(payout * 100) / 100;

    return `${roundPayoutValue} $`;
  } else {
    return changeHBDToDollarsDisplay(pendingPayout);
  }
};

const PostContentCard: React.FC<PostContentCardProps> = ({
  isComment,
  isPropertiesOpen,
  isVoteDetailsOpen,
  isCommentsVisible,
  handlePropertiesToggle,
  handleVoteDetailsToggle,
  handleCommentsToggle,
  voteDetailsLength,
  voters,
  data,
  commentsLength,
}) => {
  const { t , locale } = useI18n();
  if (!data) return;

  const {
    category,
    author,
    created,
    body,
    title,
    is_paidout,
    payout,
    pending_payout_value,
  } = data;

  const ACTIVE_ICON_COLOR = "#3b82f6";

  return (
    <Card className="overflow-hidden w-full shadow-md z-10">
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-muted/50 border-b">
        <div className="flex items-center gap-3">
          <Link
            href={`/@${author}`}
            className="flex items-center space-x-4 py-1 text-link hover:underline"
          >
            <Image
              src={getHiveAvatarUrl(author)}
              alt={author}
              width={40}
              height={40}
              className="rounded-full"
            />
          </Link>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm">
              <Link
                className="font-bold text-foreground hover:text-link"
                href={`/@${author}`}
              >
                {author}
              </Link>
              {!isComment && (
                <>
                  <span>•</span>
                  <span>{category}</span>
                </>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                <span>{formatAndDelocalizeFromTime(created ,locale)}</span>
                </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                sideOffset={5}
                alignOffset={10}
                className="border-0"
              >
                <div className="bg-theme text-text p-1">
                  <p>{formatAndDelocalizeTime(created)}</p>
                </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div>{showPayoutValue(is_paidout, payout, pending_payout_value)}</div>
      </CardHeader>

      <CardContent className="p-4">
        {!isComment && title && (
          <h2 className="text-2xl font-bold mb-4 break-words">
            {title}
            <CopyButton
              text={body}
              tooltipText={t("postContentCard.copyBody")}
              className="w-4 h-4"
            />
          </h2>
        )}
        <div className="prose dark:prose-invert max-w-none">
          <pre className="text-base whitespace-pre-wrap font-sans break-words">
            {body}
          </pre>
        </div>
        {voters.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <ThumbsUp className="w-5 h-5 text-primary" />
              {voters.slice(0, 5).map((voter) => (
                <Link
                  key={voter}
                  href={`/@${voter}`}
                  className="text-sm text-link bg-secondary hover:bg-secondary/80 py-1 px-3 rounded-full transition-colors"
                >
                  {voter}
                </Link>
              ))}
              {voters.length > 5 && (
                <span className="text-sm text-explorer-slate-text">
                  {t("postContentCard.and")} {voters.length - 5}{" "}
                  {t("postContentCard.others")}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-2 bg-muted/50 border-t flex justify-start gap-1">
        {commentsLength > 0 && (
          <button
            onClick={handleCommentsToggle}
            className="flex items-center text-sm font-medium p-2 rounded-md hover:bg-accent"
          >
            <MessageSquare
              className="w-4 h-4 mr-2"
              color={isCommentsVisible ? ACTIVE_ICON_COLOR : undefined}
            />
            <span>{commentsLength}</span>
            {isCommentsVisible ? (
              <ChevronUp className="w-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 ml-1" />
            )}
          </button>
        )}
        {voteDetailsLength > 0 && (
          <button
            onClick={handleVoteDetailsToggle}
            className="flex items-center text-sm font-medium p-2 rounded-md hover:bg-accent"
          >
            <Heart
              className="w-4 h-4 mr-2"
              color={isVoteDetailsOpen ? ACTIVE_ICON_COLOR : undefined}
            />
            <span>
              {voteDetailsLength} {t("postContentCard.votes")}
            </span>
            {isVoteDetailsOpen ? (
              <ChevronUp className="w-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 ml-1" />
            )}
          </button>
        )}
        <button
          onClick={handlePropertiesToggle}
          className="flex items-center text-sm font-medium p-2 rounded-md hover:bg-accent"
        >
          <List
            className="w-4 h-4 mr-2"
            color={isPropertiesOpen ? ACTIVE_ICON_COLOR : undefined}
          />
          <span>{t("postContentCard.properties")}</span>
          {isPropertiesOpen ? (
            <ChevronUp className="w-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 ml-1" />
          )}
        </button>
      </CardFooter>
    </Card>
  );
};

export default PostContentCard;
