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
    } catch (err) {}
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
            className="
                inline-flex               
                text-sm
                font-medium        
                disabled:pointer-events-none
                disabled:opacity-50
                hover:light:bg-explorer-extra-light-gray
                h-3
                w-3
                p-0
                rounded-md
                bg-transparent
                ml-1
                cursor-pointer"
            aria-label={tooltipText}
            onClick={handleCopy}
            onTouchEnd={handleCopy}
          >
            {isCopied ? (
              <Check
                className="h-3 w-3"
                color="green"
                strokeWidth={4}
              />
            ) : (
              <Copy className="h-3 w-3" />
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
