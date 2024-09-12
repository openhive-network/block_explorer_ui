import Link from "next/link";
import { ReactNode, useState, Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import CopyToKeyboard from "../CopyToKeyboard";
import VestsTooltip from "../VestsTooltip";
import Explorer from "@/types/Explorer";

type AccountDetailsCardProps = {
  header: string;
  userDetails: Record<string, any>;
};

const EXCLUDE_KEYS = [
  "json_metadata",
  "posting_json_metadata",
  "witness_votes",
  "profile_image",
  "dollars",
  "vests",
];

const LINK_KEYS = ["recovery_account", "reset_account"];
const URL_KEYS = ["url"];
const COPY_KEYS = ["signing_key"];


const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({
  header,
  userDetails,
}) => {

  const [isPropertiesHidden, setIsPropertiesHidden] = useState(true);

  const keys = Object.keys(userDetails);


  const renderKey = (key: keyof Record<string, any>): ReactNode => {
    if (LINK_KEYS.includes(key)) {
      return (
        <div className="text-blue-400">
          <Link href={`/@${userDetails[key]}`}>{userDetails[key] as string}</Link>{" "}
        </div>
      );
    }
    if (COPY_KEYS.includes(key)) {
      const stringProperty = userDetails[key] as string;
      let shortenedKey: string = "";
      shortenedKey = `${stringProperty?.slice(0, 8)}...${stringProperty?.slice(stringProperty.length - 5)}`;
      return (
        <CopyToKeyboard
          value={stringProperty}
          displayValue={shortenedKey}
        />
      );
    }
    if (Object.keys(userDetails.vests).includes(key)) {
      const vestValue = userDetails.vests[key]
      return <VestsTooltip tooltipTrigger={userDetails[key] as string} tooltipContent={vestValue} />
    }
    if (URL_KEYS.includes(key)) {
      const stringProperty = userDetails[key] as string;
      return (
        <div className="text-blue-400">
          <Link
            href={stringProperty || ""}
            target="_blank"
            rel="noreferrer"
          >
            {stringProperty}
          </Link>
        </div>
      );
    } else if (typeof userDetails[key] === "number") {
      const numberProperty = userDetails[key] as number;
      return numberProperty.toLocaleString();
    } else if (typeof userDetails[key] === "string") {
      return <>{userDetails[key]}</>;
    } else return JSON.stringify(userDetails[key]);
  };

  const buildTableBody = (
    keys: string[],
  ) => {
    return keys.map((key, index) => {
      if (EXCLUDE_KEYS.includes(key)) {
        return null;
      } else {
        return (
          <Fragment key={index}>
            <TableRow className={"border-b border-gray-700 hover:bg-inherit"}>
              <TableCell>{key}</TableCell>
              <TableCell>{renderKey(key)}</TableCell>
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
          <TableBody>{buildTableBody(keys)}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
export default AccountDetailsCard;
