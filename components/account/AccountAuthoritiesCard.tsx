import { ArrowDown, ArrowUp, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import Hive from "@/types/Hive";
import useAccountAuthorities from "@/api/accountPage/useAccountAuthorities";
import { useState } from "react";
import Link from "next/link";
import CopyToKeyboard from "../CopyToKeyboard";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { cn } from "@/lib/utils";

interface AccountMainCardProps {
  accountName: string;
}

const AccountAuthoritiesCard: React.FC<AccountMainCardProps> = ({
  accountName,
}) => {
  const { accountAuthoritiesData } = useAccountAuthorities(accountName);

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
      <>
        <TableRow
          key={index}
          className={cn({
            "bg-gray-700": index % 2 === 0,
          })}
        >
          <TableCell className="cursor-pointer">
            {isAccount ? (
              <Link
                className=" text-explorer-turquoise flex"
                href={`/@${content}`}
              >
                <User className="w-4 mr-2" />
                <span>{content}</span>
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
      </>
    );
  };

  const renderCollectionOfAuthorities = (
    authorities?: Hive.AuthKeys,
    title?: string
  ) => {
    const shouldMarkThreshold = !!(
      (authorities?.account_auth.length ||
        0 + (authorities?.account_auth.length || 0)) %
        2 ===
      1
    );
    return (
      <div>
        <div className=" text-lg mt-2">{title}</div>
        <Table>
          <TableBody>
            {authorities?.account_auth.map((singleAuthority, index) =>
              renderAuthority(
                singleAuthority[0] || "",
                singleAuthority[1] || "",
                true,
                index
              )
            )}
            {authorities?.key_auth.map((singleAuthority, index) =>
              renderAuthority(
                singleAuthority[0] || "",
                singleAuthority[1] || "",
                false,
                index + authorities?.account_auth.length
              )
            )}
            <TableRow
              className={cn("font-semibold", {
                "bg-gray-700": shouldMarkThreshold,
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
          className="h-full flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4"
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
              <TableRow className="bg-gray-700">
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
                  <TableRow className="bg-gray-700">
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
