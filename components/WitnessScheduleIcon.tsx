import { useState } from "react";
import Link from "next/link";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { CalendarDays } from "lucide-react";

const WitnessScheduleIcon: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Handle mobile tooltip toggle on tap (unconditionally)
  const handleTooltipToggle = (): void => {
    setShowTooltip((prevState) => !prevState);
  };

  return (
    <div className="flex justify-between my-5">
      <div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Link
                  className="text-explorer-blue"
                  href="/schedule"
                  data-testid="witness-schedule-link">
                  <CalendarDays size={20} strokeWidth={3} onClick={handleTooltipToggle} onTouchStart={handleTooltipToggle} />
                </Link>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" align="start" sideOffset={5} alignOffset={10}>
              <div className="bg-theme text-text p-1 ml-1">
                <p>
                  Check{" "}
                  <Link
                    className="text-explorer-blue"
                    href="/schedule"
                    data-testid="witness-schedule-link"
                  >
                    Witness Schedule
                  </Link>
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default WitnessScheduleIcon;
