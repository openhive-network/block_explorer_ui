import Link from "next/link";
import { useState } from "react";
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";

type AccountDetailsCardProps = {
  userDetails: any;
};

const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({
  userDetails,
}) => {
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(true);
  const keys = userDetails && Object.keys(userDetails);

  const render_key = (key: string) => {
    if (["recovery_account", "reset_account"].includes(key)) {
      return (
        <div className="text-blue-400">
          <Link href={`/account/${userDetails[key]}`}>{userDetails[key]}</Link>{" "}
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
    } else return userDetails[key];
  };

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  return (
    <div className="bg-explorer-dark-gray p-2 rounded-[6px] rounded mt-8 mx-6">
      <div className="h-full flex justify-between align-center p-2">
        <div className="text-lg">Properties</div>
        <button
          onClick={handlePropertiesVisibility}
          className="hover:bg-slate-600 mx-2"
        >
          {isPropertiesHidden ? <ArrowDownToLine /> : <ArrowUpToLine />}
        </button>
      </div>
      <div
        hidden={isPropertiesHidden}
        className="flex-column"
      >
        {keys?.map((key: string, index: number) => {
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
                {typeof userDetails?.[key] != "string" ? (
                  <pre>{JSON.stringify(userDetails?.[key])}</pre>
                ) : (
                  render_key(key)
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default AccountDetailsCard;
