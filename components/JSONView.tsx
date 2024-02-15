import React from "react";
import { formatJson } from "@/utils/StringUtils";

interface JSONViewProps {
  json: object;
  className?: string;
}

const JSONView: React.FC<JSONViewProps> = ({ json, className }) => {
  return (
    <div className={className}>
      <pre>{JSON.stringify(formatJson(json), null, 2)}</pre>
    </div>
  );
};

export default JSONView;
