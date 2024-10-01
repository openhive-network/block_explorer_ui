import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";

interface VestsTooltipProps {
  tooltipTrigger: string;
  tooltipContent: string;
}

const VestsTooltip: React.FC<VestsTooltipProps> = ({
  tooltipTrigger,
  tooltipContent,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <p>{tooltipTrigger}</p>
        </TooltipTrigger>
        <TooltipContent className="bg-white text-explorer-gray-light dark:explorer-gray-dark border-0">
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VestsTooltip;
