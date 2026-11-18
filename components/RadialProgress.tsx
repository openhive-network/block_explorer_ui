import React from "react";
import { cn } from "@/lib/utils";
import useCountUp from "@/hooks/common/useCountUp";
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
  labelClassName?: string;
  percentageClassName?: string;
  // Data not loaded yet: draw the empty ring in the gauge's final size.
  pending?: boolean;
}

const GAUGE_ANIMATION_MS = 1000;

const RadialProgress: React.FC<RadialProgressProps> = ({
  percentage,
  label,
  color = "text-blue-500",
  size = 80,
  strokeWidth = 8,
  tooltipContent,
  labelClassName,
  percentageClassName,
  pending = false,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // One animation drives both the arc and the number. It sweeps up from 0 on
  // first load and eases from the value shown on later refreshes.
  const displayPercentage = useCountUp(
    pending ? null : percentage,
    GAUGE_ANIMATION_MS,
    { from: "previous" }
  );
  const patternId = `stripes-${React.useId().replace(/[^\w-]/g, "")}`;

  // A zero-length round-capped arc still draws a dot.
  const arcHidden = pending || displayPercentage <= 0;
  const offset = circumference - (displayPercentage / 100) * circumference;

  const progressElement = (
    <div
      className={cn("flex flex-col items-center gap-1", {
        "cursor-help": !!tooltipContent && !pending,
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
            visibility={arcHidden ? "hidden" : undefined}
            className={color}
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

          {/* Horizontal Striped Overlay (animated left-to-right) */}
          <defs>
            <pattern
              id={patternId}
              width="14"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              {/* Horizontal lines */}
              <rect
                x="0"
                y="0"
                width="10"
                height="8"
                fill="rgba(255,255,255,0.25)"
              />
              {/* Animate horizontally */}
              <animateTransform
                attributeName="patternTransform"
                type="translate"
                from="0 0"
                to="14 0"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </pattern>
          </defs>

          {/* Apply striped overlay */}
          <circle
            visibility={arcHidden ? "hidden" : undefined}
            stroke={`url(#${patternId})`}
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
          {pending ? (
            <span
              aria-hidden
              className="h-3 w-3/5 rounded bg-gray-200 dark:bg-gray-700 motion-safe:animate-pulse"
            />
          ) : (
            <span
              className={cn(
                "text-sm font-bold text-gray-800 dark:text-white",
                percentageClassName
              )}
            >
              {displayPercentage.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      <p
        className={cn(
          "text-xs text-center text-gray-500 dark:text-gray-400 uppercase tracking-wider",
          labelClassName
        )}
      >
        {label}
      </p>
    </div>
  );

  if (tooltipContent && !pending) {
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
