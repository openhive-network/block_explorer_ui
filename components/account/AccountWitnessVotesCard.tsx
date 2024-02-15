import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";

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
    <div className="bg-explorer-dark-gray p-2 rounded m-2 md:mx-6" data-testid="witness-votes-dropdown">
      <div
        onClick={handlePropertiesVisibility}
        className="h-full flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer"
      >
        <div className="text-lg">Witness Votes</div>

        {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
      </div>
      <div
        hidden={isPropertiesHidden}
        className="flex-column"
      >
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
      </div>
    </div>
  );
};

export default AccountWitnessVotesCard;
