import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

import { formatAndDelocalizeFromTime } from "@/utils/TimeUtils";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { changeHBDToDollarsDisplay } from "@/utils/StringUtils";
import Hive from "@/types/Hive";

interface PostContentCardProps {
  isPropertiesOpen: boolean;
  handlePropertiesToggle: () => void;
  data: Hive.Content;
}

const PostContentCard: React.FC<PostContentCardProps> = ({
  isPropertiesOpen,
  handlePropertiesToggle,
  data,
}) => {
  if (!data) return;

  const { category, author, created, body, title, total_payout_value } = data;
  return (
    <Card className="overflow-hidden pb-0 w-[100%]">
      <div className="flex text-sm justify-between items-center py-1 px-4 border-b-[1px] border-slate-400 bg-rowHover">
        <div className="flex gap-2">
          <p>{category}</p>-
          <Link
            className="text-link"
            href={`/@${author}`}
          >
            @{author}
          </Link>
          -<p>{formatAndDelocalizeFromTime(created)}</p>
        </div>
        <div>{changeHBDToDollarsDisplay(total_payout_value)}</div>
      </div>
      <CardHeader className="p-0">
        <div className="flex justify-between font-semibold py-2 px-4 border-b-[1px] border-slate-400">
          {title}
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <pre className="text-sm">{body}</pre>
        </div>
      </CardContent>

      <CardFooter className="p-0">
        <div className="flex w-full py-2 px-4 border-t-[1px] border-slate-400">
          <button
            onClick={handlePropertiesToggle}
            className="flex items-center text-xs p-2 hover:bg-buttonHover"
          >
            Properties
            {isPropertiesOpen ? (
              <ChevronUp className="w-4 ml-1" />
            ) : (
              <ChevronDown className="w-4  ml-1" />
            )}
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostContentCard;
