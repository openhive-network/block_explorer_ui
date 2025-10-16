import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import "@/styles/striped-progress.css"; // animation file

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, color, ...props }, ref) => {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        `relative h-4 w-full overflow-hidden rounded-full bg-explorer-light-gray dark:bg-[#03182c] z-0`,
        className
      )}
      {...props}
    >
      {/* Percentage Label */}
      <div className="absolute z-50 text-xs left-1/2 -translate-x-1/2 font-bold dark:drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
        {`${value}%`}
      </div>

      {/* Progress Indicator with Animated Diagonal Stripes */}
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all rounded-full animated-stripes"
        )}
        style={{
          backgroundColor: color,
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 10px, transparent 10px 20px)",
          backgroundBlendMode: "overlay",
        }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
