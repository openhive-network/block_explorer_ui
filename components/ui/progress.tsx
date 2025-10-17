import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import "@/styles/striped-progress.css";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { color?: string }
>(({ className, value, color, ...props }, ref) => {
  // ✅ Ensure value is always a number (not null)
  const safeValue: number = typeof value === "number" ? value : 0;
  const [displayValue, setDisplayValue] = React.useState<number>(0);

  React.useEffect(() => {
    let start = 0;
    const duration = 1800; // 1.8s smooth fill-up
    const step = 16; // ~60 FPS
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
        "relative h-4 w-full overflow-hidden rounded-full bg-explorer-light-gray dark:bg-[#03182c] z-0",
        className
      )}
      {...props}
    >
      {/* Percentage Label */}
      <div className="absolute z-50 text-xs left-1/2 -translate-x-1/2 font-bold dark:drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
        {`${progressValue.toFixed(2)}%`}
      </div>

      {/* Progress Indicator */}
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 rounded-full striped-smooth transition-[transform] duration-[200ms] ease-linear"
        )}
        style={{
          backgroundColor: color,
          transform: `translateX(-${100 - progressValue}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;
export { Progress };
