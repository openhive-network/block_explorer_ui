import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getOperationColor } from "@/components/OperationsTable";
import { getOperationTypeForDisplay } from "@/utils/UI";
import useBlockOperations from "@/hooks/api/common/useBlockOperations";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import CopyButton from "../ui/CopyButton";
import { convertBooleanArrayToIds } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";

interface Props {
  blockNum: number;
  paramsState?: any;
}

const BlockOperationsContent: React.FC<Props> = ({ blockNum, paramsState }) => {
  const router = useRouter();
  const { t } = useI18n();
  const {
    settings: { rawJsonView, prettyJsonView },
  } = useSettings();

  const filters = paramsState?.filters
    ? convertBooleanArrayToIds(paramsState?.filters)
    : undefined; //Filters from url query
  const operationTypes = paramsState.operationTypes ?? undefined; // Operation types (filters) from props

  const { blockOperations, trxLoading } = useBlockOperations(
    blockNum,
    filters || operationTypes,
    undefined,
    paramsState?.accountName
  );

  const formattedOperations = useOperationsFormatter(
    blockOperations?.operations_result
  );

  const handleOperationClick = (operation: any) => {
    if (!operation) return;

    const { operation_id, trx_id } = operation;
    const params = new URLSearchParams();

    if (trx_id) {
      params.append("trxId", trx_id);
    }
    if (operation_id !== undefined) {
      params.append("opId", String(operation_id));
    }

    const queryString = params.toString();
    const url = `/block/${blockNum}${queryString ? `?${queryString}` : ""}`;

    router.push(url);
  };

  if (trxLoading) {
    return (
      <div>
        <Loader2 className="animate-spin h-4 w-4 mr-2" />
      </div>
    );
  }

  if (!formattedOperations) {
    return <div>{t("blockOperationsContent.noOperationsAvailable")}</div>;
  }

  const getOneLineDescription = (operation: any) => {
    const value = operation.op.value;
    const operationTypeName = operation.op.type;

    let messageToDisplay = null;

    if (typeof value === "string") {
      messageToDisplay = value;
    } else if (React.isValidElement(value)) {
      messageToDisplay = value;
    } else if (value && typeof value === "object" && value.message) {
      messageToDisplay = value.message;
    }

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center space-x-2">
          <OperationBadge operationTypeName={operationTypeName} />
          {operation.trx_id && (
            <div className="text-sm">
              <span>{t("common.transaction")} : </span>
              <Link
                className="text-link"
                href={`/tx/${operation.trx_id}`}
                onClick={(e) => e.stopPropagation()}
              >
                {operation.trx_id?.slice(0, 10)}{" "}
              </Link>
              <CopyButton
                text={operation.trx_id || ""}
                tooltipText={t("common.copyTransactionId")}
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
          )}
        </div>

        {messageToDisplay ? (
          <div className="text-sm">{messageToDisplay}</div>
        ) : null}
      </div>
    );
  };

  const OperationBadge = ({
    operationTypeName,
  }: {
    operationTypeName: string;
  }) => (
    <div className="flex items-center space-x-1 rounded-full bg-buttonBg px-3 py-1">
      <span
        className={`inline-block w-2 h-2 ${getOperationColor(
          operationTypeName
        )}`}
        style={{ borderRadius: "2px" }}
      ></span>
      <span className="text-xs font-medium">{`${getOperationTypeForDisplay(
        operationTypeName
      )}`}</span>
    </div>
  );

  const OperationDetails: React.FC<{ operation: any }> = ({ operation }) => {
    if (operation) {
      if (!rawJsonView && !prettyJsonView) {
        return (
          <div className="border-b p-2">{getOneLineDescription(operation)}</div>
        );
      }
      const unformattedOperation = blockOperations?.operations_result?.find(
        (op) => op.operation_id === operation.operation_id
      )?.op;
      if (prettyJsonView) {
        return <pre>{JSON.stringify(unformattedOperation, null, 2)}</pre>;
      } else {
        return <pre>{JSON.stringify(unformattedOperation)}</pre>;
      }
    }
    return null; 
  };

  const operations = formattedOperations.filter((op: any) => !op.virtual_op);
  const virtualOperations = formattedOperations.filter(
    (op: any) => op.virtual_op
  );

  return (
    <div className="border rounded-2xl p-4 max-h-[60vh] md:max-h-64 overflow-auto scrollbar-autocomplete ">
      {operations.length > 0 && (
        <>
          <h3 className="text-lg font-bold">{t("common.operations")}</h3>
          {operations.map((operation: any) => (
            <div
              key={operation.operation_id}
              className="border-b p-2 cursor-pointer hover:bg-rowHover"
              onClick={() => handleOperationClick(operation)}
            >
              <OperationDetails operation={operation} />
            </div>
          ))}
        </>
      )}

      {virtualOperations.length > 0 && (
        <>
          <h3 className="text-lg font-bold">{t("blockPageOperationCount.virtualOperations")}</h3>
          {virtualOperations.map((operation: any) => (
            <div
              key={operation.operation_id}
              className="border-b p-2 cursor-pointer hover:bg-rowHover"
              onClick={() => handleOperationClick(operation)}
            >
              <OperationDetails operation={operation} />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default BlockOperationsContent;
