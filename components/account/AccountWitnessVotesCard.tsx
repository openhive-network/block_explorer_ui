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
    <Card data-testid="witness-votes-dropdown" className="overflow-hidden">
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4"
        >
          <div className="text-lg">Witness Votes</div>

          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent hidden={isPropertiesHidden}>
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
