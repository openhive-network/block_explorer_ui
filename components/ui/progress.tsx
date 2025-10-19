import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { color?: string }
>(({ className, value, color = "#3b82f6", ...props }, ref) => {
  const safeValue: number = typeof value === "number" ? value : 0;
  const [displayValue, setDisplayValue] = React.useState<number>(0);

  // Smooth fill animation
  React.useEffect(() => {
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = (safeValue - start) / (duration / step);

    const interval = setInterval(() => {
      start += increment;
      if (start >= safeValue) {
        start = safeValue;
        clearInterval(interval);
      }
      setDisplayValue(parseFloat(start.toFixed(2)));
    }, step);

    return () => clearInterval(interval);
  }, [safeValue]);

  const progressValue = Math.min(Math.max(displayValue, 0), 100);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-explorer-light-gray dark:bg-[#03182c]",
        className
      )}
      {...props}
    >
      {/* Percentage Label */}
      <div className="absolute z-50 text-xs left-1/2 -translate-x-1/2 font-bold dark:drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
        {`${progressValue.toFixed(2)}%`}
      </div>

      {/* Progress Fill */}
      <div className="h-full w-full rounded-full overflow-hidden relative">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="diagonalStripes"
              width="10" 
              height="10" 
              patternUnits="userSpaceOnUse"
            >
            
              {/* diagonal line from top-left to bottom-right */}
              <path
                d="M -1,1 l 2,-2 M 0,10 l 10,-10 M 9,11 l 2,-2" // diagonal stripe and its repeat
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="4" 
                strokeLinecap="square"
              />
              {/* creating the moving stripe effect */}
              <animateTransform
                attributeName="patternTransform"
                type="translate"
                from="0 0"
                to="10 10" 
                dur="1.5s" 
                repeatCount="indefinite"
              />
            </pattern>
          </defs>

          {/* Base fill */}
          <rect
            x="0"
            y="0"
            width={`${progressValue}%`}
            height="100%"
            fill={color}
          />
          {/* Diagonal stripes overlay */}
          <rect
            x="0"
            y="0"
            width={`${progressValue}%`}
            height="100%"
            fill="url(#diagonalStripes)"
          />
        </svg>
      </div>
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;
export { Progress };