import { useState } from "react";
import JSONView from "./JSONView";
import { ArrowDown, ArrowUp } from "lucide-react";

interface JSONCardProps {
  header: string;
  json: string;
  showCollapseButton: boolean;
}

const JSONCard: React.FC<JSONCardProps> = ({
  header,
  json,
  showCollapseButton,
}) => {
  const [isDataHidden, setIsDataHidden] = useState(true);

  if (!json || json === "{}") return null;

  const handleHideData = () => {
    setIsDataHidden(!isDataHidden);
  };
  const jsonToObj = JSON.parse(json);

  return (
    <div className="bg-explorer-dark-gray p-2 rounded mt-2 mx-2 md:mx-6" data-testid="account-json-metadata-dropdown">
      <div className="flex-column justify-center  align-center">
        <div
          onClick={handleHideData}
          className="flex justify-between p-2 hover:bg-slate-600 cursor-pointer"
        >
          <div className="text-lg">{header}</div>
          {showCollapseButton ? (
            isDataHidden ? (
              <ArrowDown />
            ) : (
              <ArrowUp />
            )
          ) : null}
        </div>
        <div
          className="mt-4"
          hidden={isDataHidden && showCollapseButton}
        >
          <JSONView json={jsonToObj} />
        </div>
      </div>
    </div>
  );
};

export default JSONCard;
