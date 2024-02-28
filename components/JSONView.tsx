import React from "react";
import { formatJson } from "@/utils/StringUtils";

interface JSONViewProps {
  json: object;
  className?: string;
}

const JSONView: React.FC<JSONViewProps> = ({ json, className }) => {
  return (
    <div className={className}>
      <pre>{JSON.stringify(json)}</pre>
    </div>
  );
};

export default JSONView;
