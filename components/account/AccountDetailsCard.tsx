import Link from "next/link";
import { ReactNode, useState, Fragment } from "react";
import { ArrowDown, ArrowUp, HelpCircle } from "lucide-react";

import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import CopyToKeyboard from "../CopyToKeyboard";
import VestsTooltip from "../VestsTooltip";
import useElementWidth from "@/hooks/common/useElementWidth";
import { formatIntegerString } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";

type AccountDetailsCardProps = {
  header: string;
  userDetails: Record<string, any>;
  isInitiallyOpen: boolean;
};

const EXCLUDE_KEYS = [
  "json_metadata",
  "posting_json_metadata",
  "witness_votes",
  "profile_image",
  "dollars",
  "vests",
  "vesting_balance",
  "hbd_balance",
  "hbd_saving_balance",
  "reward_hbd_balance",
  "balance",
  "savings_balance",
  "reward_hive_balance",
  "vesting_shares",
  "reward_vesting_balance",
  "received_vesting_shares",
  "delegated_vesting_shares",
  "vesting_withdraw_rate",
  "subscriptions",
  "follower_count",
  "following_count",
  "post_count",
  "savings_hbd_seconds",
  "savings_hbd_seconds_last_update",
  "savings_hbd_last_interest_payment",
  "pending_hbd_savings_interest",
];

const LINK_KEYS = ["recovery_account", "reset_account"];
const URL_KEYS = ["url"];
const COPY_KEYS = ["signing_key"];
const NUMERIC_STRING_KEYS = ["hbd_seconds"];
const TOOLTIP_KEYS: Record<string, string> = {
  hbd_seconds: "accountDetailsSection.liquidHbdInterestTooltip",
  hbd_seconds_last_update: "accountDetailsSection.liquidHbdInterestTooltip",
  hbd_last_interest_payment: "accountDetailsSection.liquidHbdInterestTooltip",
};

const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({
  header,
  userDetails,
  isInitiallyOpen,
}) => {
  const { t } = useI18n();
  const [isPropertiesHidden, setIsPropertiesHidden] =
    useState(!isInitiallyOpen);
  const [containerRef, containerWidth] = useElementWidth<HTMLDivElement>();
  const isTooNarrow = containerWidth > 0 && containerWidth < 450;

  const keys = Object.keys(userDetails);

  const renderKey = (key: keyof Record<string, any>): ReactNode => {
    if (LINK_KEYS.includes(key)) {
      return (
        <div className="text-link">
          <Link href={`/@${userDetails[key]}`}>
            {userDetails[key] as string}
          </Link>{" "}
        </div>
      );
    }
    if (COPY_KEYS.includes(key)) {
      const stringProperty = userDetails[key] as string;

      if (isTooNarrow) {
        const shortenedKey = `${stringProperty?.slice(0, 8)}...${stringProperty?.slice(
          stringProperty.length - 5
        )}`;
        return (
          <CopyToKeyboard value={stringProperty} displayValue={shortenedKey} />
        );
      }

      return (
        <CopyToKeyboard value={stringProperty} displayValue={stringProperty} />
      );
    }
    if (userDetails.vests && Object.keys(userDetails?.vests).includes(key)) {
      const vestValue = userDetails.vests[key];
      return (
        <VestsTooltip
          tooltipTrigger={userDetails[key] as string}
          tooltipContent={vestValue}
        />
      );
    }
    if (URL_KEYS.includes(key)) {
      const stringProperty = userDetails[key] as string;
      return (
        <div className="text-link">
          <Link href={stringProperty || ""} target="_blank" rel="noreferrer">
            {stringProperty}
          </Link>
        </div>
      );
    }
    if (NUMERIC_STRING_KEYS.includes(key)) {
      return formatIntegerString(userDetails[key]);
    }
    if (typeof userDetails[key] === "number") {
      const numberProperty = userDetails[key] as number;
      return numberProperty.toLocaleString();
    } else if (typeof userDetails[key] === "string") {
      return <>{userDetails[key]}</>;
    } else return JSON.stringify(userDetails[key]);
  };

  const buildTableBody = (keys: string[]) => {
    return keys.map((key, index) => {
      // const isZeroValue = userDetails[key] === 0 || userDetails[key] === "0";

      if (EXCLUDE_KEYS.includes(key)) {
        return null;
      } else {
        return (
          <Fragment key={index}>
            <TableRow>
              <TableCell className="whitespace-nowrap">
                {TOOLTIP_KEYS[key] ? (
                  <span className="flex items-center gap-1.5">
                    {key}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help text-gray-400 dark:text-gray-500">
                          <HelpCircle className="h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[260px] whitespace-normal">
                          {t(TOOLTIP_KEYS[key])}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                ) : (
                  key
                )}
              </TableCell>
              <TableCell
                className={
                  Array.isArray(userDetails[key])
                    ? "whitespace-normal break-all"
                    : "whitespace-nowrap"
                }
              >
                {renderKey(key)}
              </TableCell>
            </TableRow>
          </Fragment>
        );
      }
    });
  };

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  return (
    <Card data-testid="properties-dropdown" className="overflow-hidden pb-0">
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="flex justify-between align-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">{header}</div>
          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent
        ref={containerRef}
        data-testid="card-content"
        hidden={isPropertiesHidden}
      >
        <TooltipProvider>
          <Table noOverflow={true}>
            <TableBody className="text-sm">{buildTableBody(keys)}</TableBody>
          </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
export default AccountDetailsCard;
