import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../ui/card";

type AccountWitnessVotesCardProps = {
  voters: string[];
};

const AccountWitnessVotesCard: React.FC<AccountWitnessVotesCardProps> = ({
  voters,
}) => {
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(true);

  if (!voters || !voters.length) return null;

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  return (
    <Card className="mx-2" data-testid="witness-votes-dropdown">
      <CardHeader className="px-2 hover:bg-slate-600 cursor-pointer rounded">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 "
        >
          <div className="text-lg">Witness Votes</div>

          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent className="px-2" hidden={isPropertiesHidden}>
        {voters?.map((voter: any, index: any) => {
          return (
            <div
              key={index}
              className="flex justify-between m-1 whitespace-pre-line"
            >
              <div className="border-b border-solid border-gray-700 flex justify-between py-1 mr-4">
                {index + 1}
              </div>

              <Link href={`/@${voter}`}>{voter}</Link>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AccountWitnessVotesCard;
