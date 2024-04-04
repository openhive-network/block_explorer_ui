import React from "react";
import CopyJSON from "./CopyJSON";

interface JSONViewProps {
  json: object;
  className?: string;
}

const JSONView: React.FC<JSONViewProps> = ({ json, className }) => {
  return (
    <div className={className}>
      <div className="w-full flex justify-end">
        <CopyJSON value={json} />
      </div>
      <pre>{JSON.stringify(json)}</pre>
    </div>
  );
};

export default JSONView;
