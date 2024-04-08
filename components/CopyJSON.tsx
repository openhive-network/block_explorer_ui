import { Check, ClipboardCopy } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface CopyJSONProps {
  value: Object;
  className?: string;
}

const CopyJSON: React.FC<CopyJSONProps> = ({ value, className }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (valueAsObject: Object) => {
    navigator.clipboard.writeText(
      JSON.stringify(valueAsObject).replaceAll("\\", "")
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Button
      className={cn("p-0", className)}
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
            <TooltipContent className="bg-white text-black dark:bg-explorer-dark-gray dark:text-white">
              Copy JSON to clipboard.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </Button>
  );
};

export default CopyJSON;
