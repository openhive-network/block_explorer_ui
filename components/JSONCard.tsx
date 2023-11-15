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
    <div className="bg-explorer-dark-gray p-4 rounded-[6px] mt-2 mx-2 md:mx-6">
      <div className="flex-column justify-center align-center">
        <div className="flex justify-between">
          <div className="text-lg">{header}</div>
          {showCollapseButton ? (
            <button
              onClick={handleHideData}
              className="hover:bg-slate-600 mx-2"
            >
              {isDataHidden ? <ArrowDown /> : <ArrowUp />}
            </button>
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
