import React from "react";

import { cn } from "@/lib/utils";

interface LiveBeaconProps {
  // Announced to screen readers, which get no colour and no motion.
  label: string;
  // Reserves the slot without drawing, so a row does not jog when it fades.
  isVisible?: boolean;
  className?: string;
}

// A block landing on chain, shown the same way wherever it appears: the table
// row that just arrived and the live strip's head block. The ring answers a
// real event rather than decorating one, so it is left running; reduced motion
// keeps the dot and drops the ring.
const LiveBeacon: React.FC<LiveBeaconProps> = ({
  label,
  isVisible = true,
  className,
}) => (
  <span
    className={cn("relative inline-flex h-2 w-2 shrink-0", className)}
    data-testid="live-beacon"
  >
    {isVisible ? (
      <>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500 dark:bg-sky-400" />
        <span className="sr-only">{label}</span>
      </>
    ) : null}
  </span>
);

export default LiveBeacon;
