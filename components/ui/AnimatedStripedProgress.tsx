import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedStripedProgressProps {
  children: React.ReactNode;
  className?: string;
  speed?: "slow" | "medium" | "fast";
}

const AnimatedStripedProgress: React.FC<AnimatedStripedProgressProps> = ({
  children,
  className,
  speed = "medium",
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl striped-bg",
        {
          "animate-stripes-slow": speed === "slow",
          "animate-stripes-medium": speed === "medium",
          "animate-stripes-fast": speed === "fast",
        },
        className
      )}
    >
      {/* Ensure Progress bar is transparent */}
      <div className="relative">{children}</div>
    </div>
  );
};

export default AnimatedStripedProgress;
