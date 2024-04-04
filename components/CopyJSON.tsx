import { Check, ClipboardCopy } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
        <ClipboardCopy className="w-5 h-5" />
      )}
    </Button>
  );
};

export default CopyJSON;
