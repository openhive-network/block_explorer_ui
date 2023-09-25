import { config } from "@/Config";
import Hive from "@/types/Hive";
import { isJson } from "@/utils/StringUtils";
import moment from "moment";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Check, ChevronDown, ChevronUp, ClipboardCopy } from "lucide-react";
import { Toggle } from "./ui/toggle";
import JSONView from "./JSONView";
import { useUserSettingsContext } from "./contexts/UserSettingsContext";

interface DetailedOperationCardProps {
  operation: Hive.Operation;
  transactionId?: string;
  blockNumber: number;
  date: Date;
}

const getOneLineDescription = (operation: Hive.Operation) => {
  const { from, to, amount, voter, weight, author, permlink, parent_author } =
    operation.value;
  switch (operation.type) {
    case "custom_json_operation":
      const user =
        operation.value.required_auths?.at(0) ||
        operation.value.required_posting_auths?.at(0);
      return (
        <>
          <Link href={`/account/${user}`} className="text-explorer-ligh-green">
            {user}
          </Link>{" "}
          sent custom json
        </>
      );

    case "transfer_operation":
      return (
        <>
          <Link href={`/account/${from}`} className="text-explorer-ligh-green">
            {from}
          </Link>
          {` transfered ${(Number(amount?.amount) / 1000).toFixed(3)} HIVE to `}
          <Link href={`/account/${to}`} className="text-explorer-ligh-green">
            {to}
          </Link>
        </>
      );
      break;

    case "vote_operation":
      return (
        <>
          <Link href={`/account/${voter}`} className="text-explorer-ligh-green">
            {voter}
          </Link>
          {` voted ${weight} on `}
          <Link
            href={`/account/${author}`}
            className="text-explorer-ligh-green"
          >
            {author}
          </Link>
          {" / "}
          <Link
            href={`https://hive.blog/@${author}/${permlink}`}
            className="text-explorer-yellow"
          >
            {permlink}
          </Link>
        </>
      );

    case "comment_operation":
      return (
        <>
          <Link
            href={`/account/${author}`}
            className="text-explorer-ligh-green"
          >
            {author}
          </Link>
          {` commented on `}
          <Link
            href={`/account/${parent_author}`}
            className="text-explorer-ligh-green"
          >
            {parent_author}
          </Link>
          {" / "}
          <Link
            href={`https://hive.blog/@${author}/${permlink}`}
            className="text-explorer-yellow"
          >
            {permlink}
          </Link>
        </>
      );

    default:
      return null;
  }
};

const DetailedOperationCard: React.FC<DetailedOperationCardProps> = ({
  operation,
  transactionId,
  blockNumber,
  date,
}) => {
  const [seeDetails, setSeeDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const { settings } = useUserSettingsContext();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(operation.value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="mt-6 w-full bg-explorer-dark-gray px-4 py-2 rounded-[6px] text-xs	overflow-hidden">
      <div className="flex justify-center text-xl text-explorer-orange mb-4">
        {operation.type}
      </div>
      <div className="flex items-center justify-between gap-x-8">
        <div className="flex gap-x-2 flex-shrink-0">
          <div className="my-1">
            Block{" "}
            <Link
              className="text-explorer-turquoise"
              href={`/block/${blockNumber}`}
            >
              {blockNumber}
            </Link>
          </div>

          {transactionId && (
            <div className="my-1">
              Trx{" "}
              <Link
                className="text-explorer-turquoise"
                href={`/transaction/${transactionId}`}
              >
                {transactionId.slice(0, 10)}
              </Link>
            </div>
          )}

          <div className="my-1">
            Date:{" "}
            <span className="text-explorer-turquoise">
              {moment(date).format(config.baseMomentTimeFormat)}
            </span>
          </div>
        </div>

        <div className="flex justify-center truncate text-right">
          <div className="inline truncate">
            {getOneLineDescription(operation)}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button className="p-0" onClick={() => setSeeDetails(!seeDetails)}>
          {seeDetails ? (
            <div className="flex items-center gap-x-1">
              Hide details
              <ChevronUp />
            </div>
          ) : (
            <div className="flex items-center gap-x-1">
              See more details
              <ChevronDown />
            </div>
          )}
        </Button>
        <Button className="p-0" onClick={() => copyToClipboard()}>
          {copied ? (
            <>
              <p className="text-explorer-ligh-green">JSON copied </p>
              <Check className="inline h-4 w-4 ml-2 text-explorer-ligh-green" />
            </>
          ) : (
            <>
              Copy raw JSON <ClipboardCopy className="inline h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {seeDetails &&
        (settings.rawJsonView ? (
          <JSONView json={operation.value} />
        ) : (
          <div className="flex flex-col justify-center mt-2">
            {Object.entries(operation.value)
              .sort(([key, _property]) => (key === "json" ? 1 : -1))
              .map(([key, property]) => {
                return (
                  <div
                    key={key}
                    className="border-b border-solid border-gray-700 flex justify-between py-1"
                  >
                    <div className="font-bold">{key}:</div>
                    <div className="max-w-[90%] overflow-auto text-right">
                      {isJson(property)
                        ? JSON.stringify(property)
                        : property.toString() === ""
                        ? "-"
                        : property.toString()}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
    </div>
  );
};

export default DetailedOperationCard;
