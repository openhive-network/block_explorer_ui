import React from "react";
import CopyJSON from "./CopyJSON";

interface JSONViewProps {
  json: object;
  skipCopy?: boolean;
  className?: string;
  isPrettyView?: boolean;
  enableRawVirtualOperations?: boolean;
  handleEnableVirtualOperations?: () => void;
}

const JSONView: React.FC<JSONViewProps> = ({
  json,
  skipCopy = false,
  className,
  isPrettyView,
}) => {
  const renderJsonView = (() => {
    if (!isPrettyView) {
      return JSON.stringify(json);
    } else {
      return JSON.stringify(json, null, 2);
    }
  })();

  return (
    <div className={className}>
      {!skipCopy && (
        <div className="w-full flex justify-end">
          <CopyJSON value={renderJsonView} />
        </div>
      )}
      <pre data-testid="json-format-view">{renderJsonView}</pre>
    </div>
  );
};

export default JSONView;
