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

  return (
    <Card data-testid="account-details">
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4"
        >
          <div className="text-lg">Authorizations</div>

          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
    </Card>
  );
};

export default AccountAuthorizationsCard;
