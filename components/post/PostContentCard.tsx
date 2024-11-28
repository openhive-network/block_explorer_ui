import Link from "next/link";

import { formatAndDelocalizeFromTime } from "@/utils/TimeUtils";
import { Card, CardHeader, CardContent } from "../ui/card";
import { changeHBDToDollarsDisplay } from "@/utils/StringUtils";
const PostContentCard = (data: any) => {
  if (!data || !data.data) return;

  const { category, author, created, body, title, total_payout_value } =
    data.data;

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
    </Card>
  );
};

export default PostContentCard;
