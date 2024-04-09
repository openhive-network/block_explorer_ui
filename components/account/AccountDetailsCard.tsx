import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import moment from "moment";
import { config } from "@/Config";
import { Card, CardContent, CardHeader } from "../ui/card";

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
            href={userDetails?.[key] || ""}
            target="_blank"
            rel="noreferrer"
          >
            {userDetails?.[key]}
          </Link>
        </div>
      );
    } else if (typeof userDetails[key] === "number") {
      return userDetails[key].toLocaleString();
    } else if (typeof userDetails[key] === "string") {
      return userDetails[key];
    } else return JSON.stringify(userDetails[key]);
  };

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  return (
    <Card data-testid="properties-dropdown" className="overflow-hidden pb-0">
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4"
        >
          <div className="text-lg">{header}</div>
          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent data-testid="card-content" hidden={isPropertiesHidden}>
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
              <span className=" overflow-auto">{render_key(key)}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
export default AccountDetailsCard;
