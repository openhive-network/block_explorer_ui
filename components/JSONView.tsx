import React from "react";
import CopyJSON from "./CopyJSON";

interface JSONViewProps {
  json: object;
  skipCopy?: boolean;
  className?: string;
}

const JSONView: React.FC<JSONViewProps> = ({
  json,
  skipCopy = false,
  className,
}) => {
  return (
    <div className={className}>
      {!skipCopy && (
        <div className="w-full flex justify-end">
          <CopyJSON value={json} />
        </div>
      )}
      <pre>{JSON.stringify(json)}</pre>
    </div>
  );
};

export default JSONView;
