import { useState } from "react";
import JSONView from "./JSONView";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";

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
    <Card
      className="overflow-hidden pb-0"
      data-testid="account-json-metadata-dropdown"
    >
      <CardHeader className="p-0">
        <div
          onClick={handleHideData}
          className="flex justify-between p-2 hover:bg-slate-600 cursor-pointer px-4"
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
      </CardHeader>
      <CardContent hidden={isDataHidden && showCollapseButton}>
        <JSONView json={jsonToObj} />
      </CardContent>
    </Card>
  );
};

export default JSONCard;
