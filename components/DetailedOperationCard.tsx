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
import CopyJSON from "./CopyJSON";

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
  if (typeof value === "string" || React.isValidElement(value)) return value;
  if (operation.type === "custom_json_operation") return value.message;
  return null;
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
  "publisher",
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

  return (
    <div
      className={cn(
        "w-full bg-explorer-dark-gray px-4 py-2 rounded text-xs	overflow-hidden",
        className
      )}
      data-testid="detailed-operation-card"
    >
      <div className="flex justify-between items-center">
        <div className="flex justify-start items-center gap-x-4">
          {!skipBlock && (
            <div className="flex-shrink-0">
              Block{" "}
              <Link
                className="text-explorer-turquoise"
                href={`/block/${blockNumber}`}
              >
                {blockNumber.toLocaleString()}
              </Link>
            </div>
          )}
          {transactionId && !skipTrx && (
            <div className="flex-shrink-0">
              Trx{" "}
              <Link
                className="text-explorer-turquoise"
                href={`/transaction/${transactionId}`}
              >
                {transactionId.slice(0, 10)}
              </Link>
            </div>
          )}
          <div className="text-explorer-orange font-bold text-sm">
            {settings.rawJsonView
              ? operation.type
              : getOperationTypeForDisplay(operation.type)}
          </div>
          <div className="inline truncate">
            {getOneLineDescription(operation)}
          </div>
        </div>
        <CopyJSON value={valueAsObject} />
      </div>

      {!settings.rawJsonView && operation.type === "custom_json_operation" && (
        <div className="flex justify-between items-center">
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
        </div>
      )}

      {(seeDetails || settings.rawJsonView) &&
        (settings.rawJsonView || forceStyle === "raw-json" ? (
          <JSONView json={valueAsObject} />
        ) : (
          <div className="flex flex-col justify-center mt-2">
            {Object.entries(valueAsObject)
              .sort(([key, _property]) => (key === "json" ? 1 : -1))
              .map(([key, property]) => {
                const value = isJson(property)
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
