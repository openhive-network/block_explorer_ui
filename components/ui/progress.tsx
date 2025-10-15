import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import "@/app/globals.css";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { color?: string }
>(({ className, value, color, ...props }, ref) => {
  const safeValue = value ?? 0;

  console.log("Progress rendered", safeValue, color);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-explorer-light-gray dark:bg-[#03182c] z-0",
        className
      )}
      {...props}
    >
      {/* Percentage label */}
      <div className="absolute z-50 text-xs left-1/2 -translate-x-1/2 font-bold dark:drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
        {`${safeValue}%`}
      </div>

      {/* Filled bar */}
      <ProgressPrimitive.Indicator
        className="h-full transition-all duration-500 ease-in-out rounded-full relative overflow-hidden"
        style={{
          backgroundColor: color,
          transform: `translateX(-${100 - safeValue}%)`,
        }}
      >
        {/* Animated stripes (shape preserved) */}
        <div
          className="absolute inset-0 animate-stripes-slide"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0 30px, transparent 30px 60px)",
            backgroundSize: "60px 60px", // keep spacing consistent
          }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;
export { Progress };
