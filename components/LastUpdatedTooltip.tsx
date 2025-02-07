import React, { useEffect, useRef } from "react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import moment from "moment";
import { formatAndDelocalizeFromTime } from "@/utils/TimeUtils";
import { Clock } from "lucide-react";

type LastUpdatedProps = {
  lastUpdatedAt: string | Date;
};

const calculateTimeDiff = (date: string | Date) => {
  if (!date) return 0;
  const timeDiff = moment.utc(date).diff(moment.utc(), "minutes"); // Calculate the difference in minutes
  return Math.abs(timeDiff);
};

const LastUpdatedTooltip: React.FC<LastUpdatedProps> = ({ lastUpdatedAt }) => {
  const hasTimeDiff =
    typeof lastUpdatedAt === "string" &&
    lastUpdatedAt.split(" ").includes("ago");

  const timeDiff = hasTimeDiff
    ? Number(lastUpdatedAt.split(" ")[0])
    : calculateTimeDiff(lastUpdatedAt);
  const iconRef = useRef<SVGSVGElement | null>(null);
  const formattedTime = formatAndDelocalizeFromTime(lastUpdatedAt); // Get the human-readable time.

  const getIconColor = (timeDiff: number) => {
    let colorClass = "";
    let fillColor = "";

    switch (true) {
      case timeDiff <= 10:
        colorClass = "text-green-500 ";
        fillColor = "#48bb78"; // Green
        break;
      case timeDiff <= 60:
        colorClass = "text-orange-500 bold";
        fillColor = "#ed8936"; // Orange
        break;
      default:
        colorClass = "text-red-500 bold";
        fillColor = "#f56565"; // Red
        break;
    }

    return { colorClass, fillColor };
  };

  const { colorClass,fillColor } = getIconColor(timeDiff);
  const tooltipMessage = `Last Updated - ${formattedTime}`;

  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Clock fill={fillColor} strokeOpacity={1} stroke="white" strokeWidth={1} size={24} />
              <span className={`${colorClass} ml-2`}>{formattedTime}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="start"
            sideOffset={4}
            alignOffset={10}
            className="border-0"
          >
            <div className="bg-theme text-text p-1 ml-1">
              <p>{tooltipMessage}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default LastUpdatedTooltip;
