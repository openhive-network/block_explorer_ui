import Link from "next/link";
import { ReactNode, useState, Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { cn } from "@/lib/utils";
import CopyToKeyboard from "../CopyToKeyboard";
import { convertVestsToHP } from "@/utils/Calculations";
import useDynamicGlobal from "@/api/homePage/useDynamicGlobal";
import { useHiveChainContext } from "@/contexts/HiveChainContext";

type AccountDetailsCardProps = {
  header: string;
  userDetails: any;
};

const EXCLUDE_KEYS = [
  "json_metadata",
  "posting_json_metadata",
  "witness_votes",
  "profile_image",
];

const LINK_KEYS = ["recovery_account", "reset_account"];
const URL_KEYS = ["url"];
const COPY_KEYS = ["signing_key"];

const buildTableBody = (
  keys: string[],
  render_key: (key: string) => ReactNode
) => {
  return keys.map((key: string, index: number) => {
    if (EXCLUDE_KEYS.includes(key)) {
      return null;
    } else {
      return (
        <Fragment key={index}>
          <TableRow
            className={cn(
              {
                "border-t border-gray-700": !!index,
              },
              "hover:bg-inherit"
            )}
          >
            <TableCell>{key}</TableCell>
            <TableCell>{render_key(key)}</TableCell>
          </TableRow>
        </Fragment>
      );
    }
  });
};

const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({
  header,
  userDetails,
}) => {
  const { dynamicGlobalData } = useDynamicGlobal();
  const { hiveChain } = useHiveChainContext();

  const [isPropertiesHidden, setIsPropertiesHidden] = useState(true);

  if (!userDetails || !dynamicGlobalData || !hiveChain) return;

  const {
    headBlockDetails: { totalVestingFundHive, totalVestingShares },
  } = dynamicGlobalData;
  const keys = Object.keys(userDetails);

  const renderConvertedHP = (userKey: string, objectKey: string) => {
    if (userKey.includes("VESTS") && objectKey !== "vests") {
      const formattedHP = convertVestsToHP(
        hiveChain,
        userKey,
        totalVestingFundHive,
        totalVestingShares
      );

      return formattedHP;
    } else {
      return userKey;
    }
  };

  const render_key = (key: string) => {
    if (LINK_KEYS.includes(key)) {
      return (
        <div className="text-blue-400">
          <Link href={`/@${userDetails[key]}`}>{userDetails[key]}</Link>{" "}
        </div>
      );
    }
    if (COPY_KEYS.includes(key)) {
      let shortenedKey: string = "";
      shortenedKey = `${userDetails?.[key]?.slice(0, 8)}...${userDetails?.[
        key
      ]?.slice(userDetails[key].length - 5)}`;
      return (
        <CopyToKeyboard
          value={userDetails[key]}
          displayValue={shortenedKey}
        />
      );
    }
    if (URL_KEYS.includes(key)) {
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
      return renderConvertedHP(userDetails[key], key);
    } else return JSON.stringify(userDetails[key]);
  };

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  return (
    <Card
      data-testid="properties-dropdown"
      className="overflow-hidden pb-0"
    >
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4"
        >
          <div className="text-lg">{header}</div>
          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent
        data-testid="card-content"
        hidden={isPropertiesHidden}
      >
        <Table>
          <TableBody>{buildTableBody(keys, render_key)}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
export default AccountDetailsCard;
