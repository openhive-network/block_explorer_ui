import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import useManabars from "@/api/accountPage/useManabars";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import Explorer from "@/types/Explorer";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import Hive from "@/types/Hive";
import useAccountAuthorizations from "@/api/accountPage/useAccountAuthorizations";
import { useState } from "react";

interface AccountMainCardProps {
  accountName: string;
}

const AccountAuthorizationsCard: React.FC<AccountMainCardProps> = ({
  accountName
}) => {

  const {accountAuthorizationsData} = useAccountAuthorizations(accountName);

  const [isPropertiesHidden, setIsPropertiesHidden] = useState<boolean>(true);

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  const renderAuthority = (content: string, weight: string, isAccount: boolean) => {
    return (
      <div>
        <div>
          {content}
        </div>
        <div>
          {weight}
        </div>
      </div>
    )
  }
  const test = accountAuthorizationsData?.posting[0];

  const renderCollectionOfAuthorities = (authorities?: Hive.AuthKeys, title?: string) => {
    return (
      <div>
      <div>{title}</div>
      {authorities?.account_auth.map((singleAuthorization) => renderAuthority(singleAuthorization[0] || "", singleAuthorization[1] || "", true))}
      {authorities?.key_auth.map((singleAuthorization) => renderAuthority(singleAuthorization[0] || "", singleAuthorization[1] || "", true))}
    </div>
    )
  }

  return (
    <Card data-testid="account-details">
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4"
        >
          <div className="text-lg">Authorities</div>

          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent hidden={isPropertiesHidden}>
        <div>{accountAuthorizationsData?.memo}</div>
        <div>{accountAuthorizationsData?.witness_signing}</div>
        {renderCollectionOfAuthorities(accountAuthorizationsData?.posting[0], "Posting")}
        {renderCollectionOfAuthorities(accountAuthorizationsData?.owner[0], "Owner")}
        {renderCollectionOfAuthorities(accountAuthorizationsData?.active[0], "Active")}
      </CardContent>
    </Card>
  );
};

export default AccountAuthorizationsCard;
