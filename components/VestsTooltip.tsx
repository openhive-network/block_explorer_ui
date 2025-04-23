import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "./ui/hybrid-tooltip";

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
        <TooltipContent className="bg-theme text-text border-0">
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VestsTooltip;
