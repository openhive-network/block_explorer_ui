// CopyButton.tsx
import React from "react";
import { Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: any;
  tooltipText?: string;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  tooltipText = "Copy to clipboard",
  className,
}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) { }
    document.body.removeChild(textArea);
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "inline-flex h-3 w-3 p-0 rounded-md bg-transparent ml-1 cursor-pointer text-sm font-medium disabled:pointer-events-none disabled:opacity-50 hover:light:bg-explorer-extra-light-gray",
              className
            )}
            aria-label={tooltipText}
            onClick={handleCopy}
            onTouchEnd={handleCopy}
          >
            {isCopied ? (
              <Check className="h-full w-full" color="green" strokeWidth={4} />
            ) : (
              <Copy className="h-full w-full" />
            )}
          </Button>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          align="start"
          sideOffset={4}
          alignOffset={10}
          className="border-0"
        >
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyButton;
