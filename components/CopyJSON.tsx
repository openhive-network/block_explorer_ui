import { Check, ClipboardCopy } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "./ui/tooltip";

interface CopyJSONProps {
  value: string | object;
  className?: string;
}

const CopyJSON: React.FC<CopyJSONProps> = ({ value, className }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (valueAsObject: string | object) => {
    if (typeof valueAsObject === "string") {
      navigator.clipboard.writeText(valueAsObject);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Button
      className={cn("p-0 bg-inherit", className)}
      onClick={() => copyToClipboard(value)}
    >
      {copied ? (
        <Check className="text-explorer-ligh-green w-5 h-5" />
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ClipboardCopy className="w-5 h-5" />
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="bg-white text-black dark:bg-explorer-gray-dark dark:text-white">
                Copy JSON to clipboard.
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      )}
    </Button>
  );
};

export default CopyJSON;
