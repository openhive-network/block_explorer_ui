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
    <Card className="mx-2" data-testid="account-json-metadata-dropdown">
      <CardHeader className="px-2 hover:bg-slate-600 cursor-pointer rounded">
        <div
          onClick={handleHideData}
          className="flex justify-between p-2"
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
      <CardContent className="px-2" hidden={isDataHidden && showCollapseButton}>
        <JSONView json={jsonToObj} />
      </CardContent>
    </Card>
  );
};

export default JSONCard;
