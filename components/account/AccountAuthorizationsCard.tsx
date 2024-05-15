import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import useManabars from "@/api/accountPage/useManabars";
import { ArrowDown, ArrowUp, ClipboardCopy, Loader2 } from "lucide-react";
import Explorer from "@/types/Explorer";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import Hive from "@/types/Hive";
import useAccountAuthorizations from "@/api/accountPage/useAccountAuthorizations";
import { useState } from "react";
import Link from "next/link";
import CopyToKeyboard from "../CopyToKeyboard";

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

  const cutPublicKey = (publicKey?: string): string => {
    if (!publicKey) return "";
    return (`${publicKey.slice(0, 8)}...${publicKey.slice(publicKey.length - 5)}`)
  }

  const copyToClipboard = (key?: string) => {
    if (key) {
      navigator.clipboard.writeText(key);
    }
  };

  const renderKeyToCopy = (key?: string) => {
    return (
      <div className="flex hover:bg-slate-600 rounded" onClick={() => copyToClipboard(key)}><ClipboardCopy className="w-4 mr-2" /> {cutPublicKey(key)} </div>
    )
  }

  const renderAuthority = (content: string, weight: string, isAccount: boolean) => {
    return (
      <div className="flex my-1">
        <div className="mr-4">
          {isAccount ? 
            <Link className=" text-explorer-turquoise" href={`/@${content}`}>{content}</Link> : 
            <CopyToKeyboard 
              value={content} 
              displayValue={cutPublicKey(content)}
            />
          }
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
      <div className="border-t border-solid border-gray-700">
      <div className=" text-lg mb-2">{title}</div>
      {authorities?.account_auth.map((singleAuthorization) => renderAuthority(singleAuthorization[0] || "", singleAuthorization[1] || "", true))}
      {authorities?.key_auth.map((singleAuthorization) => renderAuthority(singleAuthorization[0] || "", singleAuthorization[1] || "", false))}
    </div>
    )
  }

  return (
    <Card data-testid="authorities" className="overflow-hidden pb-0 w-full">
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4"
        >
          <div className="text-lg">Authorities</div>

          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent hidden={isPropertiesHidden} className="break-all">
        {renderCollectionOfAuthorities(accountAuthorizationsData?.owner[0], "Owner")}
        {renderCollectionOfAuthorities(accountAuthorizationsData?.active[0], "Active")}
        {renderCollectionOfAuthorities(accountAuthorizationsData?.posting[0], "Posting")}
        <div className="border-t border-solid border-gray-700">
          <div  className=" text-lg mb-2">Memo:</div>
          <CopyToKeyboard 
            value={accountAuthorizationsData?.memo} 
            displayValue={cutPublicKey(accountAuthorizationsData?.memo)}
            />
        </div>
        {accountAuthorizationsData?.witness_signing && 
          <div className="border-t border-solid border-gray-700">
            <div  className=" text-lg mb-2">Witness signing:</div>
            <CopyToKeyboard 
              value={accountAuthorizationsData?.witness_signing} 
              displayValue={cutPublicKey(accountAuthorizationsData?.witness_signing)}
            />
          </div>
        }
      </CardContent>
    </Card>
  );
};

export default AccountAuthorizationsCard;
