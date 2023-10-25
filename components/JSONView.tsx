import React from "react";
import { cn } from "@/lib/utils";
import { formatJson } from "@/utils/StringUtils";

interface JSONViewProps {
  json: object;
  className?: string;
}

const JSONView: React.FC<JSONViewProps> = ({ json, className }) => {
  return (
    <div className={cn("overflow-auto", className)}>
      <pre>{formatJson(json)}</pre>
    </div>
  );
};

export default JSONView;
