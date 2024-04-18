import Hive from "@/types/Hive";
import { MutableRefObject } from "react";

export const scrollTo = (ref: MutableRefObject<any>) => {
  ref.current?.scrollIntoView();
};

export const getOperationButtonTitle = (
  selectedOperationTypes: number[],
  operationsTypes?: Hive.OperationPattern[]
): string => {
  if (selectedOperationTypes && selectedOperationTypes.length === 1) {
    return getOperationTypeForDisplay(
      operationsTypes?.find((op) => op.op_type_id === selectedOperationTypes[0])
        ?.operation_name || ""
    );
  }
  if (selectedOperationTypes && selectedOperationTypes.length > 1)
    return `${selectedOperationTypes.length} operation types`;
  return "";
};

export const getOperationTypeForDisplay = (operationType: string) => {
  let displayType = operationType.split("_");
  displayType.pop();
  return displayType.join("_");
};
