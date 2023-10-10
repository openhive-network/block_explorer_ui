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
    <div className="bg-explorer-dark-gray p-2 rounded-[6px] rounded mt-8 mx-6">
      <div className="h-full flex justify-between align-center p-2">
        <div className="text-lg">Witness Votes</div>
        <button
          onClick={handlePropertiesVisibility}
          className="hover:bg-slate-600 mx-2"
        >
          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </button>
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

              <Link href={`/account/${voter}`}>{voter}</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountWitnessVotesCard;
