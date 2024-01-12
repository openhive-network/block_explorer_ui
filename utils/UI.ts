import Hive from "@/types/Hive";
import { MutableRefObject } from "react";

export const scrollTo = (ref: MutableRefObject<any>) => {
  ref.current?.scrollIntoView();
};

export const getOperationButtonTitle = (
  selectedOperationTypes: number[],
  operationsTypes?: Hive.OperationPattern[]
): string => {
  if (selectedOperationTypes && selectedOperationTypes.length === 1)
    return operationsTypes?.[selectedOperationTypes[0]]?.operation_name || "";
  if (selectedOperationTypes && selectedOperationTypes.length > 1)
    return `${selectedOperationTypes.length} operation types`;
  return "Operation types";
};
