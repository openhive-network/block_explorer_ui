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

interface CopyToKeyboardProps {
  value?: string;
  displayValue: string;
  className?: string;
}

const CopyToKeyboard: React.FC<CopyToKeyboardProps> = ({ value, displayValue, className }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (key?: string) => {
    if (key) {
      navigator.clipboard.writeText(key);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className={cn(className, "flex hover:bg-slate-600 rounded")} onClick={() => copyToClipboard(value)}>
      {copied ? 
        <Check className="text-explorer-ligh-green w-5 h-5" /> :
        <ClipboardCopy className="w-4 mr-2" /> 
      }
      {displayValue} 
    </div>
  );
};

export default CopyToKeyboard;
