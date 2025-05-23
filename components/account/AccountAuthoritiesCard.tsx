import { useState } from "react";
import { ArrowDown, ArrowUp, User } from "lucide-react";
import Link from "next/link";

import Hive from "@/types/Hive";
import { cn } from "@/lib/utils";
import useAccountAuthorities from "@/hooks/api/accountPage/useAccountAuthorities";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { Card, CardContent, CardHeader } from "../ui/card";
import CopyToKeyboard from "../CopyToKeyboard";

interface AccountMainCardProps {
  accountName: string;
  liveDataEnabled: boolean;
}

const AccountAuthoritiesCard: React.FC<AccountMainCardProps> = ({
  accountName,
  liveDataEnabled,
}) => {
  const { accountAuthoritiesData } = useAccountAuthorities(
    accountName,
    liveDataEnabled
  );

  const [isPropertiesHidden, setIsPropertiesHidden] = useState<boolean>(true);

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  const cutPublicKey = (publicKey?: string): string => {
    if (!publicKey) return "";
    return `${publicKey.slice(0, 8)}...${publicKey.slice(
      publicKey.length - 5
    )}`;
  };

  const renderAuthority = (
    content: string,
    weight: string,
    isAccount: boolean,
    index: number
  ) => {
    return (
      <TableRow
        key={index}
        className={cn({
          "bg-rowEven": index % 2 === 0,
        })}
      >
        <TableCell className="cursor-pointer">
          {isAccount ? (
            <Link
              className="text-link flex"
              href={`/@${content}`}
            >
              <User className="w-4 mr-2" />
              <span>{content} </span>
            </Link>
          ) : (
            <CopyToKeyboard
              value={content}
              displayValue={cutPublicKey(content)}
            />
          )}
        </TableCell>
        <TableCell className="w-1/5">{weight}</TableCell>
      </TableRow>
    );
  };

  const renderCollectionOfAuthorities = (
    authorities?: Hive.AuthKeys,
    title?: string
  ) => {
    const shouldMarkThreshold = !!(
      (authorities?.account_auths?.length ||
        0 + (authorities?.account_auths?.length || 0)) %
        2 ===
      1
    );
    return (
      <div>
        <div className="text-lg mt-2">{title}</div>
        <Table>
          <TableBody>
            {authorities?.account_auths?.map((singleAuthority, index) =>
              renderAuthority(
                singleAuthority[0] || "",
                singleAuthority[1] || "",
                true,
                index
              )
            )}
            {authorities?.key_auths?.map((singleAuthority, index) =>
              renderAuthority(
                singleAuthority[0] || "",
                singleAuthority[1] || "",
                false,
                index + authorities?.account_auths.length
              )
            )}
            <TableRow
              className={cn("font-semibold", {
                "bg-rowEven ": shouldMarkThreshold,
              })}
            >
              <TableCell>Threshold</TableCell>
              <TableCell>{authorities?.weight_threshold}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card
      data-testid="authorities"
      className="overflow-hidden pb-0 w-full"
    >
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">Authorities</div>

          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent
        hidden={isPropertiesHidden}
        className="break-all"
      >
        {renderCollectionOfAuthorities(accountAuthoritiesData?.owner, "Owner")}
        {renderCollectionOfAuthorities(
          accountAuthoritiesData?.active,
          "Active"
        )}
        {renderCollectionOfAuthorities(
          accountAuthoritiesData?.posting,
          "Posting"
        )}
        <div>
          <div className=" text-lg mt-2">Memo:</div>
          <Table>
            <TableBody>
              <TableRow className="bg-rowEven">
                <TableCell className="cursor-pointer">
                  <CopyToKeyboard
                    value={accountAuthoritiesData?.memo}
                    displayValue={cutPublicKey(accountAuthoritiesData?.memo)}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {accountAuthoritiesData?.witness_signing && (
            <>
              <div className=" text-lg mt-2">Witness signing:</div>
              <Table>
                <TableBody>
                  <TableRow className="bg-rowEven">
                    <TableCell className="cursor-pointer">
                      <CopyToKeyboard
                        value={accountAuthoritiesData?.witness_signing}
                        displayValue={cutPublicKey(
                          accountAuthoritiesData?.witness_signing
                        )}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountAuthoritiesCard;
