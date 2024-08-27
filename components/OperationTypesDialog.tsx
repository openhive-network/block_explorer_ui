import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Hive from "@/types/Hive";
import { getOperationTypeForDisplay } from "@/utils/UI";
import { useUserSettingsContext } from "../contexts/UserSettingsContext";
import { cn } from "@/lib/utils";
import Chip from "./Chip";
import { categorizedOperationTypes } from "@/utils/CategorizedOperationTypes";
import Explorer from "@/types/Explorer";

type OperationTypesDialogProps = {
  operationTypes?: Explorer.ExtendedOperationTypePattern[];
  triggerTitle: string;
  selectedOperations: number[];
  buttonClassName: string;
  setSelectedOperations: (operationIds: number[]) => void;
};

export const colorByOperationCategory: Record<string, string> = {
  Posting: "bg-explorer-posting-operations",
  Curation: "bg-explorer-curation-operations",
  Transfer: "bg-explorer-transfer-operations",
  Market: "bg-explorer-market-operations",
  Vesting: "bg-explorer-vesting-operations",
  "Account management": "bg-explorer-account-management-operations",
  "Witness management": "bg-explorer-witness-management-operations",
  "Witness voting": "bg-explorer-witness-voting-operations",
  Proposals: "bg-explorer-proposal-operations",
  Custom: "bg-explorer-custom-operations",
  Other: "bg-explorer-other-operations",
};

const OperationTypesDialog: React.FC<OperationTypesDialogProps> = ({
  operationTypes,
  triggerTitle,
  selectedOperations,
  buttonClassName,
  setSelectedOperations,
}) => {
  const [selectedOperationsIds, setSelectedOperationsIds] = useState<number[]>(
    []
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOperationFilterHover, setIsOperationFilterHover] = useState(false);
  const { settings } = useUserSettingsContext();

  if (!operationTypes || !operationTypes.length) return;

  const nonDisabledOperationTypes = operationTypes.filter(operationType => !operationType.isDisabled);

  const virtualOperations = nonDisabledOperationTypes.filter(
    (operationType) => operationType.is_virtual
  );
  const nonVirtualOperations = nonDisabledOperationTypes.filter(
    (operationType) => !operationType.is_virtual
  );

  const onFiltersSelect = (id: number) => {
    if (selectedOperationsIds.includes(id)) {
      setSelectedOperationsIds(
        selectedOperationsIds.filter((operationId) => operationId !== id)
      );
    } else {
      setSelectedOperationsIds([...selectedOperationsIds, id]);
    }
  };

  const handleOnSubmit = () => {
    setSelectedOperations(
      Array.isArray(selectedOperationsIds)
        ? selectedOperationsIds
        : [selectedOperationsIds]
    );
    onOpenChange(false);
  };

  const handleOnClear = () => {
    setSelectedOperationsIds([]);
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      setSelectedOperationsIds(selectedOperations);
    }
    setIsOpen(open);
  };

  const selectAll = () => {
    const allIds = nonDisabledOperationTypes.map(
      (operationType) => operationType.op_type_id
    );
    setSelectedOperationsIds(allIds);
  };

  const selectReal = () => {
    const realIds = nonVirtualOperations.map(
      (operationType) => operationType.op_type_id
    );
    let finaList = [...realIds, ...selectedOperationsIds];
    finaList = finaList.filter((id, index) => finaList.indexOf(id) === index);
    setSelectedOperationsIds([...finaList]);
  };

  const selectVirtual = () => {
    const virtualIds = virtualOperations.map(
      (operationType) => operationType.op_type_id
    );
    let finaList = [...virtualIds, ...selectedOperationsIds];
    finaList = finaList.filter((id, index) => finaList.indexOf(id) === index);
    setSelectedOperationsIds(finaList);
  };

  const selectAllOfCategory = (operationTypes: Explorer.ExtendedOperationTypePattern[]) => {
    const nonDisabledOperationTypesForCategory = operationTypes.filter(operationType => !operationType.isDisabled);
    const operationsIds = nonDisabledOperationTypesForCategory.map(
      (operationType) => operationType.op_type_id
    );
    let finaList = [...operationsIds, ...selectedOperationsIds];
    finaList = finaList.filter((id, index) => finaList.indexOf(id) === index);
    setSelectedOperationsIds(finaList);
  };

  const clearCategory = (operationTypes: Explorer.ExtendedOperationTypePattern[]) => {
    const operationsIds = operationTypes.map(
      (operationType) => operationType.op_type_id
    );
    const finalOperations = [...selectedOperationsIds].filter(
      (selectedOperationId) => !operationsIds.includes(selectedOperationId)
    );
    setSelectedOperationsIds(finalOperations);
  };

  const invertSelection = () => {
    const allIds = nonDisabledOperationTypes.map(
      (operationType) => operationType.op_type_id
    );
    const finaList = allIds.filter(
      (id) =>
        selectedOperationsIds.find((selectedId) => selectedId === id) ===
        undefined
    );
    setSelectedOperationsIds(finaList);
  };

  const renderOperationType = (operationType: Explorer.ExtendedOperationTypePattern) => {
    return (
      <li
        onClick={() => onFiltersSelect(operationType.op_type_id)}
        key={operationType.op_type_id}
        className="col-span-3 pl-2 md:col-span-1 flex items-center font-bold text-base rounded-lg bg-inherit hover:border-2-gray group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white "
      >
        <Input
          type="checkbox"
          checked={selectedOperationsIds.includes(operationType.op_type_id)}
          name="bordered-checkbox"
          className=" w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 "
          {...{
            "data-testid": `operation-type-checkbox-${operationType.operation_name}`,
          }}
          onChange={() => onFiltersSelect(operationType.op_type_id)}
          disabled={operationType.isDisabled}
        />
        <Label
          htmlFor="bordered-checkbox-1"
          className={cn(
            "p-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis",
            {
              "text-sky-900 dark:text-sky-200": operationType.is_virtual,
              "opacity-50": operationType.isDisabled
            }
          )}
          {...{
            "data-testid": `operation-type-label-${operationType.operation_name}`,
          }}
        >
          {settings.rawJsonView
            ? operationType.operation_name
            : getOperationTypeForDisplay(operationType.operation_name)}
        </Label>
      </li>
    );
  };

  const renderSection = (sectionName: string, operationsNames: string[]) => {
    const operations = operationsNames
      .map((name) =>
        operationTypes?.find(
          (operationType) => operationType.operation_name === name
        )
      )
      .filter((operationType) => operationType) as Explorer.ExtendedOperationTypePattern[];
    const sortedOperations = operations.sort((a, b) =>
      a?.operation_name.localeCompare(b?.operation_name)
    );
    const nonDisabledOperationTypesForSection = operations.filter((operationType => !operationType.isDisabled));
    return (
      <div
        className=" border-t px-2"
        key={sectionName}
      >
        <div className="flex justify-between">
          <div className="flex items-center justify-center">
            <span
              className={`rounded w-4 h-4 mr-2 ${colorByOperationCategory[sectionName]}`}
            ></span>
            <span>{sectionName}</span>
          </div>
          <div>
            <Button disabled={!nonDisabledOperationTypesForSection.length} onClick={() => selectAllOfCategory(operations)}>
              Select
            </Button>
            <Button disabled={!nonDisabledOperationTypesForSection.length} onClick={() => clearCategory(operations)}>Clear</Button>
          </div>
        </div>
        <ul
          className="my-4 grid grid-cols-4 gap-4 place-items-stretch text-white "
          data-testid="virtual-operations-list"
        >
          {sortedOperations.map(
            (operation) => !!operation && renderOperationType(operation)
          )}
        </ul>
      </div>
    );
  };

  const handleClearOperationsFilter = () => {
    setSelectedOperations([]);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          data-testid="operations-types-btn"
          className={`${buttonClassName} text-white hover:bg-gray-700 rounded-[4px]`}
        >
          Operation Types
        </Button>
      </DialogTrigger>
      {selectedOperations.length ? (
        <Chip
          className={buttonClassName}
          text={triggerTitle}
          clearSelection={handleClearOperationsFilter}
        />
      ) : null}
      <DialogContent
        className="max-w-[95%] md:max-w-[80%] max-h-[90%] md:max-h-[80%] flex-column justify-center align-center  bg-white text-black dark:bg-explorer-dark-gray dark:text-white overflow-auto px-0"
        data-testid="operation-types-dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex justify-center pt-2">
            Operation types filters
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-auto max-h-[500px] md:max-h-[600px]">
          {categorizedOperationTypes.map((categorizedOperationType) =>
            renderSection(
              categorizedOperationType.name,
              categorizedOperationType.types
            )
          )}
        </div>
        <DialogFooter>
          <div
            className="flex flex-wrap justify-between w-full gap-y-4 border-t pt-1 px-2"
            data-testid="operation-types-dialog-footer"
          >
            <div className="flex">
              <Button
                type="button"
                variant="secondary"
                onClick={selectAll}
              >
                Select all
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={selectReal}
              >
                Select real
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={selectVirtual}
              >
                Select virtual
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={invertSelection}
              >
                Invert
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleOnClear}
              >
                Clear
              </Button>
            </div>
            <div className="flex w-full md:w-auto justify-center">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-800 hover:bg-blue-600 text-white rounded"
                type="submit"
                variant="default"
                onClick={handleOnSubmit}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OperationTypesDialog;
