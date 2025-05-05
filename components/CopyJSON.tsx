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
} from "./ui/hybrid-tooltip";

interface CopyJSONProps {
  value: string | object;
  className?: string;
}

const CopyJSON: React.FC<CopyJSONProps> = ({ value, className }) => {
  const [copied, setCopied] = useState(false);

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(String(value));
      } else {
        fallbackCopy(String(value));
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn("p-0 bg-inherit", className)}
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="text-explorer-light-green w-5 h-5" />
            ) : (
              <ClipboardCopy className="w-5 h-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent className="bg-theme text-text">
            Copy JSON to clipboard.
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyJSON;
