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
          <CopyJSON value={JSON.stringify(json, null, 2)} />
        </div>
      )}
      <pre data-testid="json-format-view">{JSON.stringify(json, null, 2)}</pre>
    </div>
  );
};

export default JSONView;
