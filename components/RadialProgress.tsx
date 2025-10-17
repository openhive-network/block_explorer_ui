import React from "react";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/hybrid-tooltip";
import "@/styles/striped-progress.css"; // striped animation CSS

interface RadialProgressProps {
  percentage: number;
  label: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
  tooltipContent?: React.ReactNode;
}

const RadialProgress: React.FC<RadialProgressProps> = ({
  percentage,
  label,
  color = "text-blue-500",
  size = 80,
  strokeWidth = 8,
  tooltipContent,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Smooth fill animation
  const [displayPercentage, setDisplayPercentage] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const duration = 1200; // 1.2s
    const step = 16;
    const increment = (percentage - start) / (duration / step);

    const interval = setInterval(() => {
      start += increment;
      if (start >= percentage) {
        start = percentage;
        clearInterval(interval);
      }
      setDisplayPercentage(parseFloat(start.toFixed(2)));
    }, step);

    return () => clearInterval(interval);
  }, [percentage]);

  const offset = circumference - (displayPercentage / 100) * circumference;

  const progressElement = (
    <div
      className={cn("flex flex-col items-center gap-1", {
        "cursor-help": !!tooltipContent,
      })}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background Circle */}
          <circle
            className="text-gray-200 dark:text-gray-700"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Solid Progress Circle */}
          <circle
            className={cn("transition-[stroke-dashoffset] duration-500", color)}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Striped Overlay */}
          <defs>
            <pattern
              id="radialStripes"
              patternUnits="userSpaceOnUse"
              width="40"
              height="40"
              patternTransform="rotate(45)"
            >
              <rect width="20" height="40" fill="rgba(255,255,255,0.25)" className="circular-animated-stripes" />
            </pattern>
          </defs>

          <circle
            stroke="url(#radialStripes)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Center Percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            {displayPercentage.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Label */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );

  if (tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{progressElement}</TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return progressElement;
};

export default RadialProgress;
