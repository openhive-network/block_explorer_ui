// /components/ui/RadialProgress.tsx

import React from "react";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/hybrid-tooltip";
import "@/styles/striped-progress.css"; // import the animation CSS

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

          {/* Striped Overlay */}
          <defs>
            <pattern
              id="radialStripes"
              patternUnits="userSpaceOnUse"
              width="40"
              height="40"
              patternTransform="rotate(45)"
              className="circular-animated-stripes"
            >
              <rect width="20" height="40" fill="rgba(255,255,255,0.25)" />
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

  // Wrap in tooltip if provided
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
