// Hybrid tooltip component acts differently on different devices: on desktop it gets active on hover event, on mobile - on click event

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  TooltipProvider as OriginalTooltipProvider,
  Tooltip as OriginalTooltip,
  TooltipTrigger as OriginalTooltipTrigger,
  TooltipContent as OriginalTooltipContent,
  TooltipPortal as OriginalTooltipPortal,
} from "./tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
} from "./popover";
import {
  TooltipContentProps,
  TooltipProps,
  TooltipTriggerProps,
  TooltipProviderProps,
  TooltipPortalProps,
} from "@radix-ui/react-tooltip";
import {
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
  PopoverPortalProps,
} from "@radix-ui/react-popover";

const TouchContext = createContext<boolean | undefined>(undefined);
const useTouch = () => useContext(TouchContext);

export const TooltipProvider = ({
  children,
  ...props
}: TooltipProviderProps) => {
  const [isTouch, setTouch] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  return (
    <TouchContext.Provider value={isTouch}>
      <OriginalTooltipProvider {...props}>{children}</OriginalTooltipProvider>
    </TouchContext.Provider>
  );
};

export const Tooltip = (props: TooltipProps & PopoverProps) => {
  const isTouch = useTouch();

  return isTouch ? <Popover {...props} /> : <OriginalTooltip {...props} />;
};

export const TooltipTrigger = (
  props: TooltipTriggerProps & PopoverTriggerProps
) => {
  const isTouch = useTouch();

  return isTouch ? (
    <PopoverTrigger {...props} />
  ) : (
    <OriginalTooltipTrigger {...props} />
  );
};

export const TooltipContent = (
  props: TooltipContentProps & PopoverContentProps
) => {
  const isTouch = useTouch();

  return isTouch ? (
    <PopoverContent {...props} />
  ) : (
    <OriginalTooltipContent {...props} />
  );
};

export const TooltipPortal = (
  props: TooltipPortalProps & PopoverPortalProps
) => {
  const isTouch = useTouch();

  return isTouch ? (
    <PopoverPortal {...props} />
  ) : (
    <OriginalTooltipPortal {...props} />
  );
};
