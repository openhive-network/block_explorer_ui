import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CopyToKeyboardProps {
  value?: string;
  displayValue: string;
  className?: string;
}

const CopyToKeyboard: React.FC<CopyToKeyboardProps> = ({
  value,
  displayValue,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (key?: string) => {
    if (key) {
      navigator.clipboard.writeText(key);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div
      className={cn(className, "flex hover:bg-rowHover rounded")}
      onClick={() => copyToClipboard(value)}
    >
      {copied ? (
        <Check className="text-explorer-light-green w-5 h-5" />
      ) : (
        <Copy className="w-4 mr-2" />
      )}
      {displayValue}
    </div>
  );
};

export default CopyToKeyboard;
