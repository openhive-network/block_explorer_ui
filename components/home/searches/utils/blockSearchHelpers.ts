import Explorer from "@/types/Explorer";
import { convertIdsToBooleanArray } from "@/lib/utils";
import { setParamIfPositive } from "./globalSearchHelpers";

export function startBlockSearch(
  blockSearchProps: Explorer.BlockSearchProps,
  setBlockSearchProps: (props: Explorer.BlockSearchProps) => void,
  setLastSearchKey: (val: "block") => void
) {
  setBlockSearchProps(blockSearchProps);
  setLastSearchKey("block");
}

export function getBlockPageLink(
  blockSearchProps: Explorer.BlockSearchProps | undefined,
  operationsTypes: Explorer.ExtendedOperationTypePattern[] | undefined
): (blockNumber: number) => string {
  return (blockNumber: number) => {
    if (!blockSearchProps) return "#";

    const { accountName, operationTypes } = blockSearchProps;

    const searchParams = new URLSearchParams();

    setParamIfPositive(searchParams, "accountName", accountName);

    if (operationTypes) {
      const booleanTypesArray = convertIdsToBooleanArray(operationTypes);
      let isFull = !!operationTypes;

      operationsTypes?.forEach((operationType: any) => {
        if (!operationTypes.includes(operationType.op_type_id)) {
          isFull = false;
        }
      });

      const filtersValue = !isFull ? booleanTypesArray : [];
      setParamIfPositive(searchParams, "filters", filtersValue);
    }

    const queryString = searchParams.toString();
    const urlPath = `/block/${blockNumber}${
      queryString ? `?${queryString}` : ""
    }`;

    return urlPath;
  };
}
