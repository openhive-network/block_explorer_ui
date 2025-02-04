import Link from "next/link";
import { ChevronDown, ChevronUp, ThumbsUp } from "lucide-react";

import { formatAndDelocalizeFromTime ,formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { changeHBDToDollarsDisplay } from "@/utils/StringUtils";
import Hive from "@/types/Hive";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface PostContentCardProps {
  isComment?: boolean;
  isPropertiesOpen: boolean;
  isVoteDetailsOpen: boolean;
  handlePropertiesToggle: () => void;
  handleVoteDetailsToggle: () => void;
  voteDetailsLength: number;
  voters: string[];
  data: Hive.Content;
}

const PostContentCard: React.FC<PostContentCardProps> = ({
  isComment,
  isPropertiesOpen,
  isVoteDetailsOpen,
  handlePropertiesToggle,
  handleVoteDetailsToggle,
  voteDetailsLength,
  voters,
  data,
}) => {
  if (!data) return;

  const { category, author, created, body, title, total_payout_value } = data;
  return (
    <Card className="overflow-hidden pb-0 w-[100%]">
      <div className="flex text-sm justify-between items-center py-1 px-4 border-b-[1px] border-slate-400 bg-rowHover">
        <div className="flex gap-2">
          {!isComment ? <p>{category} - </p> : ""}
          <Link
            className="text-link"
            href={`/@${author}`}
          >
            @{author}
          </Link>
          -
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>{formatAndDelocalizeFromTime(created)}</span>
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
        <div>{changeHBDToDollarsDisplay(total_payout_value)}</div>
      </div>
      {title && (
        <CardHeader className="p-0">
          <div className="flex justify-between font-semibold p-2 px-4 border-b-[1px] border-slate-400">
            {title}
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <div
          className={cn("w-full text-left", {
            "pt-2": !title,
          })}
        >
          <div className="px-4 py-2">
            <pre className="text-sm">{body}</pre>
          </div>
          {voters.length ? (
            <div className="mt-2 border-t-[1px] border-slate-400">
              <div className="p-2 flex items-center gap-1 flex-wrap">
                <ThumbsUp />
                {voters.map((voter, index) => {
                  if (index < 5) {
                    return (
                      <div
                        key={voter}
                        className="text-link bg-buttonBg hover:bg-buttonHover cursor-pointer py-1 px-3 m-2 break-word whitespace-nowrap rounded-full"
                      >
                        <Link href={`/@${voter}`}>{voter}</Link>
                      </div>
                    );
                  }
                })}
                {voters.length > 5 ? (
                  <p> and {voters.length - 5} others</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="p-0">
        <div className="flex w-full py-1 px-4 border-t-[1px] border-slate-400">
          <button
            onClick={handlePropertiesToggle}
            className="flex items-center text-xs px-2 hover:bg-buttonHover"
          >
            Properties
            {isPropertiesOpen ? (
              <ChevronUp className="w-4 ml-1" />
            ) : (
              <ChevronDown className="w-4  ml-1" />
            )}
          </button>
          {voteDetailsLength ? (
            <button
              onClick={handleVoteDetailsToggle}
              className="flex items-center text-xs px-2 hover:bg-buttonHover"
            >
              {`Vote Details (${voteDetailsLength})`}
              {isVoteDetailsOpen ? (
                <ChevronUp className="w-4 ml-1" />
              ) : (
                <ChevronDown className="w-4  ml-1" />
              )}
            </button>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostContentCard;
