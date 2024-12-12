import { convertIdsToBooleanArray, getPageUrlParams } from "@/lib/utils";
import Explorer from "@/types/Explorer";
import { dataToURL } from "@/utils/URLutils";

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
  operationsTypes: any
): (blockNumber: number) => string {
  return (blockNumber: number) => {
    if (!blockSearchProps) return "#";

    const urlParams: Explorer.UrlParam[] = [
      {
        paramName: "accountName",
        paramValue: dataToURL(blockSearchProps.accountName),
      },
      {
        paramName: "keyContent",
        paramValue: dataToURL(blockSearchProps.deepProps.content),
      },
      {
        paramName: "setOfKeys",
        paramValue: dataToURL(blockSearchProps.deepProps.keys),
      },
    ];

    if (blockSearchProps.operationTypes) {
      const booleanTypesArray = convertIdsToBooleanArray(
        blockSearchProps.operationTypes
      );
      let isFull = !!blockSearchProps.operationTypes;
      operationsTypes?.forEach((operationType: any) => {
        if (
          !blockSearchProps.operationTypes?.includes(operationType.op_type_id)
        )
          isFull = false;
      });
      urlParams.push({
        paramName: "filters",
        paramValue: dataToURL(!isFull ? booleanTypesArray : []),
      });
    }

    return `/block/${blockNumber}${getPageUrlParams(urlParams)}`;
  };
}
