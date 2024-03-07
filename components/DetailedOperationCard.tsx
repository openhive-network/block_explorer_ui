import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronUp, ClipboardCopy } from "lucide-react";
import moment from "moment";
import { config } from "@/Config";
import Hive from "@/types/Hive";
import { isJson } from "@/utils/StringUtils";
import { Button } from "./ui/button";
import JSONView from "./JSONView";
import { useUserSettingsContext } from "./contexts/UserSettingsContext";
import { cn } from "@/lib/utils";
import { getOperationTypeForDisplay } from "@/utils/UI";

interface DetailedOperationCardProps {
  operation: Hive.Operation;
  operationId?: number;
  transactionId?: string;
  blockNumber: number;
  date?: Date;
  skipBlock?: boolean;
  skipTrx?: boolean;
  skipDate?: boolean;
  className?: string;
  isShortened?: boolean;
  forceStyle?: "raw-json" | "table";
}

const getOneLineDescription = (operation: Hive.Operation) => {
  const { value } = operation;
  return value;
};

const userField = [
  "author",
  "value",
  "owner",
  "account",
  "producer",
  "curator",
  "seller",
  "voter",
  "publisher"
];
const userAuthField = ["required_posting_auths", "required_auths"];

const DetailedOperationCard: React.FC<DetailedOperationCardProps> = ({
  operation,
  operationId,
  transactionId,
  blockNumber,
  date,
  skipBlock = false,
  skipTrx = false,
  skipDate = false,
  className,
  isShortened,
  forceStyle,
}) => {
  const { settings } = useUserSettingsContext();
  const [seeDetails, setSeeDetails] = useState(false);

  let valueAsObject = operation.value;
  if (typeof valueAsObject === "string") {
    valueAsObject = { message: valueAsObject };
  }

  // Leave copy feature for later https app
  // const [copied, setCopied] = useState(false);
  /*
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(valueAsObject).replaceAll("\\", ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }; */

  return (
    <div
      className={cn(
        "w-full bg-explorer-dark-gray px-4 py-2 rounded text-xs	overflow-hidden",
        className
      )}
      data-testid="detailed-operation-card"
    >
      <div className="flex justify-between items-center mb-2 flex-wrap">
        <div
          className={cn(
            "text-explorer-orange font-bold w-full md:w-auto text-sm flex-2 ",
            {
              "flex-grow": skipBlock && skipTrx && skipDate,
            }
          )}
        >
          {settings.rawJsonView ? operation.type : getOperationTypeForDisplay(operation.type)}
        </div>
        {!skipBlock && (
          <div className="my-1 flex-1">
            Block{" "}
            <Link
              className="text-explorer-turquoise"
              href={`/block/${blockNumber}`}
            >
              {blockNumber.toLocaleString()}
            </Link>
          </div>
        )}
          <div className="my-1 flex-1">
            {transactionId && !skipTrx && (
              <>
                Trx{" "}
                <Link
                  className="text-explorer-turquoise"
                  href={`/transaction/${transactionId}`}
                >
                  {transactionId.slice(0, 10)}
                </Link>
              </>
            )}
          </div>
        {!skipDate && (
          <div className="my-1 flex-1">
            Date:{" "}
            <span className="text-explorer-turquoise">
              {moment(date).format(config.baseMomentTimeFormat)}
            </span>
          </div>
        )}
      </div>
      <div className="w-full flex justify-center truncate mb-2">
        <div className="inline truncate">
          {getOneLineDescription(operation)}
        </div>
      </div>

      {!settings.rawJsonView && <div className="flex justify-between items-center">
        <Button className="p-0" onClick={() => setSeeDetails(!seeDetails)}>
          {seeDetails ? (
            <div className="flex items-center gap-x-1">
              Hide details
              <ChevronUp />
            </div>
          ) : (
            <div className="flex items-center gap-x-1 ">
              See more details
              <ChevronDown />
            </div>
          )}
        </Button>
        {isShortened && (
          <Link href={`/longOperation/${operationId}`}>
            <Button className=" text-explorer-turquoise">
              See full operation
            </Button>
          </Link>
        )}
      </div>}

      {(seeDetails || settings.rawJsonView) &&
        (settings.rawJsonView || forceStyle === "raw-json" ? (
          <JSONView json={valueAsObject} />
        ) : (
          <div className="flex flex-col justify-center mt-2">
            {Object.entries(valueAsObject)
              .sort(([key, _property]) => (key === "json" ? 1 : -1))
              .map(([key, property]) => {
                const value =
                  isJson(property) || isJson(JSON.stringify(property))
                    ? JSON.stringify(property).replaceAll("\\", "")
                    : property.toString() === ""
                    ? "-"
                    : property.toString();
                return (
                  <div
                    key={key}
                    className="border-b border-solid border-gray-700 flex justify-between py-1"
                  >
                    <div className="font-bold">{key}:</div>
                    {userField.includes(key) ? (
                      <Link
                        href={`/@${property}`}
                        className="text-explorer-turquoise"
                      >
                        {value}
                      </Link>
                    ) : userAuthField.includes(key) ? (
                      <div className="flex">
                        {value
                          .toString()
                          .split(",")
                          .map((account, index) =>
                            account === "-" ? (
                              <p key={account + index}>{account}</p>
                            ) : (
                              <Link
                                href={`/@${account}`}
                                className="text-explorer-turquoise"
                                key={account + index}
                              >
                                {account}
                              </Link>
                            )
                          )}
                      </div>
                    ) : (
                      <div className="max-w-[90%] overflow-auto text-right">
                        {value}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
    </div>
  );
};

export default DetailedOperationCard;
