import { useState } from "react";
import { ArrowDown, ArrowUp, User } from "lucide-react";
import Link from "next/link";

import Hive from "@/types/Hive";
import { cn } from "@/lib/utils";
import useAccountAuthorities from "@/hooks/api/accountPage/useAccountAuthorities";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { Card, CardContent, CardHeader } from "../ui/card";
import CopyToKeyboard from "../CopyToKeyboard";
import { useI18n } from "@/i18n/i18n";
import useElementWidth from "@/hooks/common/useElementWidth";

interface AccountMainCardProps {
  accountName: string;
  liveDataEnabled: boolean;
  isInitiallyOpen: boolean;
}

type NewAuthTuple = [number, string];
type NewAuthKeys = {
  key_auths?: NewAuthTuple[];
  account_auths?: NewAuthTuple[];
  weight_threshold?: number;
};

const AccountAuthoritiesCard: React.FC<AccountMainCardProps> = ({
  accountName,
  liveDataEnabled,
  isInitiallyOpen
}) => {
  const { t } = useI18n();
  const { accountAuthoritiesData } = useAccountAuthorities(
    accountName,
    liveDataEnabled,
  );
  const [containerRef, containerWidth] = useElementWidth<HTMLDivElement>();
  const isTooNarrow = containerWidth > 0 && containerWidth < 450;

  const [isPropertiesHidden, setIsPropertiesHidden] = useState<boolean>(!isInitiallyOpen);

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden((v) => !v);
  };

  const cutPublicKey = (publicKey?: string): string => {
    if (!publicKey) return "";
    return `${publicKey.slice(0, 8)}...${publicKey.slice(
      publicKey.length - 5
    )}`;
  };

  const renderAuthority = (
    content: string,
    weight: number,
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
        <TableCell className="cursor-pointer whitespace-nowrap">
          {isAccount ? (
            <Link
              className="text-link flex"
              href={`/@${content}`}
            >
              <User className="w-4 mr-2" />
              <span>{content}</span>
            </Link>
          ) : (
            <CopyToKeyboard
              value={content}
              displayValue={isTooNarrow ? cutPublicKey(content) : content}
            />
          )}
        </TableCell>
        <TableCell className="text-right">{weight}</TableCell>
      </TableRow>
    );
  };

  const renderCollectionOfAuthorities = (
    authorities?: Hive.AuthKeys,
    title?: string
  ) => {
    const a = authorities as unknown as NewAuthKeys;

    const keyAuths = a?.key_auths ?? [];
    const accountAuths = a?.account_auths ?? [];

    const totalRows = keyAuths.length + accountAuths.length;
    const shouldMarkThreshold = totalRows % 2 === 1;

    return (
      <div>
        <div className="text-lg mt-2">{title}</div>
        <Table noOverflow={true}>
          <TableBody>
            {keyAuths.map(([weight, key], index) =>
              renderAuthority(key, weight, false, index)
            )}

            {accountAuths.map(([weight, account], index) =>
              renderAuthority(account, weight, true, index + keyAuths.length)
            )}
            <TableRow
              className={cn("font-semibold", {
                "bg-rowEven": shouldMarkThreshold,
              })}
            >
              <TableCell>{t("accountAuthoritiesCard.threshold")}</TableCell>
              <TableCell className="text-right">{a?.weight_threshold}</TableCell>
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
          <div className="text-lg">
            {t("accountAuthoritiesCard.authorities")}
          </div>
          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>

      <CardContent
        ref={containerRef}
        hidden={isPropertiesHidden}
        className="break-normal"
      >
        {renderCollectionOfAuthorities(
          accountAuthoritiesData?.owner,
          t("accountAuthoritiesCard.owner")
        )}
        {renderCollectionOfAuthorities(
          accountAuthoritiesData?.active,
          t("accountAuthoritiesCard.active")
        )}
        {renderCollectionOfAuthorities(
          accountAuthoritiesData?.posting,
          t("accountAuthoritiesCard.posting")
        )}
        <div>
          <div className="text-lg mt-2">
            {t("accountAuthoritiesCard.memo")}:
          </div>
          <Table noOverflow={true}>
            <TableBody>
              <TableRow className="bg-rowEven">
                <TableCell className="cursor-pointer whitespace-nowrap">
                  <CopyToKeyboard
                    value={accountAuthoritiesData?.memo}
                    displayValue={isTooNarrow ? cutPublicKey(accountAuthoritiesData?.memo) : (accountAuthoritiesData?.memo ?? "")}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {accountAuthoritiesData?.witness_signing && (
            <>
              <div className="text-lg mt-2">
                {t("accountAuthoritiesCard.witnessSigning")}:
              </div>
              <Table noOverflow={true}>
                <TableBody>
                  <TableRow className="bg-rowEven">
                    <TableCell className="cursor-pointer whitespace-nowrap">
                      <CopyToKeyboard
                        value={accountAuthoritiesData?.witness_signing}
                        displayValue={isTooNarrow ? cutPublicKey(accountAuthoritiesData?.witness_signing) : (accountAuthoritiesData?.witness_signing ?? "")}
                      />                    </TableCell>
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
