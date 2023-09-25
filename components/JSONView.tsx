import { cn } from "@/lib/utils";
import React from "react";

interface JSONViewProps {
  json: unknown;
  className?: string;
}

const JSONView: React.FC<JSONViewProps> = ({
  json,
  className
}) => {
  return (
    <div className={cn("overflow-auto", className)}>
      <pre>
        {JSON.stringify(json, null, 2)}
      </pre>
    </div>
  );
};

export default JSONView;
