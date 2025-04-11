import React, { useState } from "react";
import { cn, formatNumber } from "@/lib/utils";
import Hive from "@/types/Hive";
import Link from "next/link";
import Image from "next/image";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { formatHash } from "@/utils/StringUtils";
import { getOperationColor } from "@/components/OperationsTable";
import { getOperationTypeForDisplay } from "@/utils/UI";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "../ui/button";
import { Block } from "@/pages/blocks";

interface BlockDetailItemProps {
  label: string;
  value: string | number | React.ReactNode;
  dataTestId: string;
  hasBorder?: boolean;
}

const BlockDetailItem: React.FC<BlockDetailItemProps> = ({
  label,
  value,
  dataTestId,
  hasBorder,
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-[180px_1fr] items-center py-1.5 text-xs",
        hasBorder && "border-b"
      )}
    >
      <div
        className="font-medium md:text-left pr-2 md:pr-0"
        data-testid={`${dataTestId}-label`}
      >
        {label}:
      </div>
      <div
        className="text-left"
        data-testid={dataTestId}
      >
        {value}
      </div>
    </div>
  );
};

interface OperationBadgeProps {
  operationTypeName: string;
  counter: number;
}

const OperationBadge: React.FC<OperationBadgeProps> = ({
  operationTypeName,
  counter,
}) => (
  <div className="flex items-center rounded-full bg-buttonBg px-3 py-1 w-fit">
    <span
      className={`inline-block mr-1 w-2 h-2 ${getOperationColor(
        operationTypeName
      )}`}
      style={{ borderRadius: "2px" }}
    ></span>
    <span className="text-xs font-medium">{`${getOperationTypeForDisplay(
      operationTypeName
    )}: ${counter}`}</span>
  </div>
);

interface BlockAdditionalDetailsProps {
  block: Block;
  operationsTypes: Hive.OperationPattern[] | undefined;
  handlePrevBlock: () => void;
  handleNextBlock: () => void;
  firstBlockInPage: number;
  lastBlockInPage: number;
}

const BlockAdditionalDetails: React.FC<BlockAdditionalDetailsProps> = ({
  block,
  operationsTypes,
  handlePrevBlock,
  handleNextBlock,
  firstBlockInPage,
  lastBlockInPage,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleOperations = () => {
    setIsExpanded(!isExpanded);
  };

  if (!operationsTypes) {
    return (
      <div>
        <Loader2 className="animate-spin mt-1 h-5 w-5 ml-10 dark:text-white" />
      </div>
    );
  }

  const operationTypesMap = new Map<number, Hive.OperationPattern>();
  for (const operationType of operationsTypes) {
    operationTypesMap.set(operationType.op_type_id, operationType);
  }

  let virtualOperationsCount = 0;
  let nonVirtualOperationsCount = 0;

  const virtualOperations: {
    operationTypeName: string;
    counter: number;
  }[] = [];
  const nonVirtualOperations: {
    operationTypeName: string;
    counter: number;
  }[] = [];

  const isNextBlockButtonDisabled = firstBlockInPage === block.block_num;
  const isPrevBlockButtonDisabled = lastBlockInPage === block.block_num;

  block.operations?.forEach((op: { op_type_id: number; op_count: number }) => {
    const operationType = operationTypesMap.get(op.op_type_id);
    const operationTypeName =
      operationType?.operation_name || "Unknown Operation";
    const isVirtual = operationType?.is_virtual || false;

    const operationData = { operationTypeName, counter: op.op_count };

    if (isVirtual) {
      virtualOperations.push(operationData);
      virtualOperationsCount += op.op_count;
    } else {
      nonVirtualOperations.push(operationData);
      nonVirtualOperationsCount += op.op_count;
    }
  });

  return (
    <div>
      <BlockDetailItem
        label="Block"
        value={
          <div className="flex">
            <Button
              disabled={isPrevBlockButtonDisabled}
              className="bg-inherit hover:bg-buttonHover text-text p-0 mx-1"
            >
              <ChevronLeft
                size={20}
                onClick={handlePrevBlock}
              />
            </Button>
            <Link
              className="flex items-center justify-start gap-2 text-link"
              href={`/block/${block.block_num}`}
            >
              {block.block_num.toLocaleString()}
            </Link>
            <Button
              disabled={isNextBlockButtonDisabled}
              className="bg-inherit hover:bg-buttonHover text-text p-0 mx-1"
            >
              <ChevronRight
                size={20}
                onClick={handleNextBlock}
              />
            </Button>
          </div>
        }
        dataTestId={`block-${block.block_num}-num`}
        hasBorder
      />
      <BlockDetailItem
        label="Produced by"
        value={
          <Link
            className="flex items-center justify-start gap-2"
            data-testid="account-name"
            href={`/@${block.producer_account}`}
          >
            <span
              className="text-link"
              data-testid="block-producer-name"
            >
              {block.producer_account}
            </span>
            <Image
              className="rounded-full border-2 border-link"
              src={getHiveAvatarUrl(block.producer_account)}
              alt="avatar"
              width={32}
              height={32}
              unoptimized
            />
          </Link>
        }
        dataTestId="produced-by"
        hasBorder
      />
      <BlockDetailItem
        label="Producer Reward"
        value={
          block.producer_reward
            ? `${formatNumber(block.producer_reward, true, false)} VESTS`
            : "N/A"
        }
        dataTestId={`block-${block.block_num}-reward`}
        hasBorder
      />
      <BlockDetailItem
        label="Hash"
        value={formatHash(block.hash)}
        dataTestId={`block-${block.hash}-hash`}
        hasBorder
      />
      <BlockDetailItem
        label="Previous Hash"
        value={formatHash(block.prev)}
        dataTestId={`block-${block.prev}-prev`}
        hasBorder
      />
      <BlockDetailItem
        label="Number of Transactions"
        value={block.trx_count || "N/A"}
        dataTestId={`block-${block.trx_count}-trx_count`}
        hasBorder
      />
      <button
        onClick={handleToggleOperations}
        className="flex items-center justify-end w-full gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        {isExpanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
        <span className="text-xs">{isExpanded ? "less" : "more"}</span>
      </button>
      <div
        style={{
          display: isExpanded ? "block" : "none",
          overflow: "auto",
          height: "11rem",
          scrollbarWidth: "thin",
          scrollbarColor: "transparent",
        }}
        className="overflow-auto"
      >
        <div className="my-2 text-left">
          <h4 className="font-bold">Relevant Operations: </h4>
          <h5 className="font-semibold mb-1 mt-3">
            Operations: {nonVirtualOperationsCount}
          </h5>
          <div className="flex flex-wrap gap-1 mt-1 h-min">
            {nonVirtualOperations &&
              nonVirtualOperations.map(({ operationTypeName, counter }) => (
                <OperationBadge
                  key={operationTypeName}
                  operationTypeName={operationTypeName}
                  counter={counter}
                />
              ))}
          </div>
        </div>
        <div className="mb-2 text-left">
          <h5 className=" font-semibold mb-1">
            Virtual Operations: {virtualOperationsCount}
          </h5>
          <div className="flex flex-wrap gap-1 mt-1">
            {virtualOperations &&
              virtualOperations.map(({ operationTypeName, counter }) => (
                <OperationBadge
                  key={operationTypeName}
                  operationTypeName={operationTypeName}
                  counter={counter}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockAdditionalDetails;
