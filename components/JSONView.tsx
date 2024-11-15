import React from "react";
import CopyJSON from "./CopyJSON";
import { useUserSettingsContext } from "../contexts/UserSettingsContext";
import { Toggle } from "./ui/toggle";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

interface JSONViewProps {
  json: object;
  skipCopy?: boolean;
  className?: string;
  isPrettyView?: boolean;
  enableRawVirtualOperations: boolean;
  handleEnableVirtualOperations: () => void;
}

const JSONView: React.FC<JSONViewProps> = ({
  json,
  skipCopy = false,
  className,
  isPrettyView,
  enableRawVirtualOperations,
  handleEnableVirtualOperations,
}) => {
  const router = useRouter();
  const isBlockPage = router.pathname.startsWith("/block");

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
        <div
          className={cn("w-full flex justify-end ", {
            "justify-between": isBlockPage,
          })}
        >
          {isBlockPage && (
            <div className="flex justify-center items-center">
              Virtual Operations{" "}
              <span className="ml-2">
                <Toggle
                  checked={enableRawVirtualOperations}
                  onClick={handleEnableVirtualOperations}
                />
              </span>
            </div>
          )}
          <CopyJSON value={renderJsonView} />
        </div>
      )}
      <pre data-testid="json-format-view">{renderJsonView}</pre>
    </div>
  );
};

export default JSONView;
