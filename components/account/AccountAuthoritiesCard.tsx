import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import Hive from "@/types/Hive";
import useAccountAuthorities from "@/api/accountPage/useAccountAuthorities";
import { useState } from "react";
import Link from "next/link";
import CopyToKeyboard from "../CopyToKeyboard";

interface AccountMainCardProps {
  accountName: string;
}

const AccountAuthoritiesCard: React.FC<AccountMainCardProps> = ({
  accountName
}) => {

  const {accountAuthoritiesData} = useAccountAuthorities(accountName);

  const [isPropertiesHidden, setIsPropertiesHidden] = useState<boolean>(true);

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  const cutPublicKey = (publicKey?: string): string => {
    if (!publicKey) return "";
    return (`${publicKey.slice(0, 8)}...${publicKey.slice(publicKey.length - 5)}`)
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

  const renderCollectionOfAuthorities = (authorities?: Hive.AuthKeys, title?: string) => {
    return (
      <div className="border-t border-solid border-gray-700">
      <div className=" text-lg mb-2">{title}</div>
      {authorities?.account_auth.map((singleAuthority) => renderAuthority(singleAuthority[0] || "", singleAuthority[1] || "", true))}
      {authorities?.key_auth.map((singleAuthority) => renderAuthority(singleAuthority[0] || "", singleAuthority[1] || "", false))}
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
        {renderCollectionOfAuthorities(accountAuthoritiesData?.owner[0], "Owner")}
        {renderCollectionOfAuthorities(accountAuthoritiesData?.active[0], "Active")}
        {renderCollectionOfAuthorities(accountAuthoritiesData?.posting[0], "Posting")}
        <div className="border-t border-solid border-gray-700">
          <div  className=" text-lg mb-2">Memo:</div>
          <CopyToKeyboard 
            value={accountAuthoritiesData?.memo} 
            displayValue={cutPublicKey(accountAuthoritiesData?.memo)}
            />
        </div>
        {accountAuthoritiesData?.witness_signing && 
          <div className="border-t border-solid border-gray-700">
            <div  className=" text-lg mb-2">Witness signing:</div>
            <CopyToKeyboard 
              value={accountAuthoritiesData?.witness_signing} 
              displayValue={cutPublicKey(accountAuthoritiesData?.witness_signing)}
            />
          </div>
        }
      </CardContent>
    </Card>
  );
};

export default AccountAuthoritiesCard;
