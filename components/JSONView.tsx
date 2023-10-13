import { cn } from "@/lib/utils";
import React from "react";

interface JSONViewProps {
  json: object;
  className?: string;
}

const JSONView: React.FC<JSONViewProps> = ({ json, className }) => {
  return (
    <div className={cn("overflow-auto", className)}>
      <pre>{JSON.stringify(json, null, 2).replaceAll("\\", "")}</pre>
    </div>
  );
};

export default JSONView;
