import React from 'react';
import Link from 'next/link';
import { getOperationColor } from "@/components/OperationsTable";
import { getOperationTypeForDisplay } from "@/utils/UI";
import { useUserSettingsContext } from "@/contexts/UserSettingsContext";
import useBlockOperations from "@/hooks/api/common/useBlockOperations";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import CopyButton from '../ui/CopyButton';
import { convertBooleanArrayToIds } from '@/lib/utils';
import { Loader2 } from 'lucide-react';


interface Props {
  blockNum: number;
  filters?: any;
}

const BlockOperationsContent: React.FC<Props> = ({ blockNum, filters }) => {
  const {
    settings: { rawJsonView, prettyJsonView },
  } = useUserSettingsContext();

  const { blockOperations, trxLoading } = useBlockOperations(blockNum,
    filters
      ? convertBooleanArrayToIds(filters)
      : undefined
  );

  const formattedOperations = useOperationsFormatter(
    blockOperations?.operations_result
  );

  if (trxLoading) { 
    return <div><Loader2 className="animate-spin h-4 w-4 mr-2" /></div>;
  }

  if (!formattedOperations) {
    return <div>No operations available for this block.</div>;
  }

  const getOneLineDescription = (operation: any) => {
    const value = operation.op.value;
    const operationTypeName = operation.op.type;

    let messageToDisplay = null;

    if (typeof value === "string") {
      messageToDisplay = value;
    } else if (React.isValidElement(value)) {
      messageToDisplay = value;
    } else if (value && typeof value === 'object' && value.message) {
      messageToDisplay = value.message;
    }

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center space-x-2">
          <OperationBadge operationTypeName={operationTypeName} />
          {operation.trx_id && (
            <div className="text-sm">
              <span>Transaction : </span>
              <Link
                className="text-link"
                href={`/transaction/${operation.trx_id}`}
              >
                {operation.trx_id?.slice(0, 10)}{" "}
              </Link>
              <CopyButton
                text={operation.trx_id || ""}
                tooltipText="Copy transaction ID"
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

  const OperationBadge = ({ operationTypeName }: { operationTypeName: string }) => (
    <div className="flex items-center space-x-1 rounded-full bg-buttonBg px-3 py-1">
      <span
        className={`inline-block w-2 h-2 ${getOperationColor(operationTypeName)}`}
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

  };

  return (
     <div
      className="border rounded-2xl p-4 max-h-[60vh] md:max-h-64 overflow-auto scrollbar-autocomplete " >
      <h3 className="text-lg font-bold">Operation Details</h3>
      {formattedOperations.map((operation: any) => (
        <OperationDetails key={operation.operation_id} operation={operation} />
      ))}
    </div>
  );
};

export default BlockOperationsContent;