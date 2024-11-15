import React, { useEffect, useRef } from "react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

type LastUpdatedProps = {
  lastUpdatedAt: string | Date; // Allow both string and Date types
};

const calculateTimeDiff = (date: string | Date) => {
  if (!date) return 0;
  const timeDiff = moment.utc(date).diff(moment.utc(), "minutes"); // Calculate the difference in minutes
  return Math.abs(timeDiff);
};

const LastUpdatedWitnessIcon: React.FC<LastUpdatedProps> = ({
  lastUpdatedAt,
}) => {
  const timeDiff = calculateTimeDiff(lastUpdatedAt);
  const iconRef = useRef<SVGSVGElement | null>(null);

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

  useEffect(() => {
    if (iconRef.current) {
      const path = iconRef.current.querySelector("path");
      if (path) {
        path.setAttribute("fill", getIconColor(timeDiff).fillColor);
      }
    }
  }, [timeDiff]);

  const { colorClass } = getIconColor(timeDiff);
  const tooltipMessage = `Last Updated - ${timeDiff} ${
    timeDiff === 1 ? "min" : "mins"
  } ago`;

  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <FontAwesomeIcon
                icon={faClock}
                size="lg"
                data-testid="last-updated-icon"
                ref={iconRef}
                className={colorClass}
              />
              <span className={`${colorClass} font-bold ml-2`}>{`${timeDiff} ${
                timeDiff === 1 ? "min" : "mins"
              } ago`}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="start"
            sideOffset={5}
            alignOffset={10}
            className="border-0"
          >
            <div className="bg-theme text-text p-2 ml-3">
              <p>{tooltipMessage}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default LastUpdatedWitnessIcon;
