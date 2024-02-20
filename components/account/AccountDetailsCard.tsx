import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import moment from "moment";
import { config } from "@/Config";

type AccountDetailsCardProps = {
  header: string;
  userDetails: any;
};

const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({
  header,
  userDetails,
}) => {
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(true);

  if (!userDetails) return null;

  const keys = Object.keys(userDetails);

  const render_key = (key: string) => {
    if (["recovery_account", "reset_account"].includes(key)) {
      return (
        <div className="text-blue-400">
          <Link href={`/@${userDetails[key]}`}>{userDetails[key]}</Link>{" "}
        </div>
      );
    }
    if (["url"].includes(key)) {
      return (
        <div className="text-blue-400">
          <Link
            href={userDetails[key]}
            target="_blank"
            rel="noreferrer"
          >
            {userDetails[key]}
          </Link>
        </div>
      );
    } else if (typeof userDetails[key] === "number") {
      return userDetails[key].toLocaleString()
    } else if (Date.parse(userDetails[key])) {
      return  moment(userDetails[key]).format(config.baseMomentTimeFormat)
    } else if (typeof userDetails[key] === "string") {
      return userDetails[key];
    } else  return JSON.stringify(userDetails[key])
  };

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  return (
    <div className="bg-explorer-dark-gray p-2 rounded mt-2 mx-2 md:mx-6" data-testid="properties-dropdown">
      <div
        onClick={handlePropertiesVisibility}
        className="h-full flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer"
      >
        <div className="text-lg">{header}</div>
        {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
      </div>
      <div
        hidden={isPropertiesHidden}
        className="flex-column"
      >
        {keys.map((key: string, index: number) => {
          if (
            [
              "json_metadata",
              "posting_json_metadata",
              "witness_votes",
              "profile_image",
            ].includes(key)
          )
            return null;
          return (
            <div
              key={index}
              className="flex justify-between m-1 whitespace-pre-line"
            >
              <div className="border-b border-solid border-gray-700 flex justify-between py-1 mr-4">
                {key}
              </div>
              <span className=" overflow-auto">
                {render_key(key)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default AccountDetailsCard;
