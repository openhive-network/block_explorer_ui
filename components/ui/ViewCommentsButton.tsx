import React from "react";
import { MessageSquareText } from "lucide-react";

import { useI18n } from "@/i18n/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ViewCommentsButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

const ViewCommentsButton: React.FC<ViewCommentsButtonProps> = ({ onClick }) => {
  const { t } = useI18n();
  const label = t("commentPermlinkResultTable.viewComments");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <MessageSquareText size={18} />
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side="top" className="text-[11px]">
            {label}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ViewCommentsButton;
