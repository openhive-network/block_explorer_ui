import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ValueTooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
}

const ValueTooltip: React.FC<ValueTooltipProps> = ({ content, children }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipPortal>
        <TooltipContent className="bg-theme text-text text-xs">
          {content}
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  </TooltipProvider>
);

export default ValueTooltip;
