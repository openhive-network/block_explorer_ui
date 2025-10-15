import React from "react";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/hybrid-tooltip";

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
  const offset = circumference - (percentage / 100) * circumference;

  const progressElement = (
    <div
      className={cn("flex flex-col items-center gap-1", {
        "cursor-help": !!tooltipContent,
      })}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            className="text-gray-200 dark:text-gray-700"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Main solid progress color */}
          <circle
            className={cn("transition-all duration-500", color)}
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

          {/* Animated diagonal stripe overlay */}
          <circle
            className="animated-stripes-circle"
            stroke="url(#diagonalStripes)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Define animated pattern */}
          <defs>
            <pattern
              id="diagonalStripes"
              patternUnits="userSpaceOnUse"
              width="40"
              height="40"
              patternTransform="rotate(45)"
            >
              <rect
                width="10"
                height="40"
                fill="rgba(255,255,255,0.25)"
                className="animate-diagonal-stripes"
              />
            </pattern>
          </defs>
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            {percentage.toFixed(2)}%
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
