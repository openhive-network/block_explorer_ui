import React, { useState, useEffect, useRef } from "react";
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
import { getOperationTypeForDisplay } from "@/utils/UI";
import { useUserSettingsContext } from "../contexts/UserSettingsContext";
import { cn } from "@/lib/utils";
import Chip from "./Chip";
import { categorizedOperationTypes } from "@/utils/CategorizedOperationTypes";
import Explorer from "@/types/Explorer";
import { ChevronDown, Search } from "lucide-react";

type OperationTypesDialogProps = {
  operationTypes?: Explorer.ExtendedOperationTypePattern[];
  triggerTitle: string;
  selectedOperations: number[];
  buttonClassName: string;
  setSelectedOperations: (operationIds: number[] | null) => void;
};

export const colorByOperationCategory: Record<string, string> = {
  Posting: "bg-explorer-operations-posting",
  Curation: "bg-explorer-operations-curation",
  Transfer: "bg-explorer-operations-transfer",
  Market: "bg-explorer-operations-market",
  Vesting: "bg-explorer-operations-vesting",
  "Account management": "bg-explorer-operations-account-management",
  "Witness management": "bg-explorer-operations-witness-management",
  "Witness voting": "bg-explorer-operations-witness-voting",
  Proposals: "bg-explorer-operations-proposal",
  Custom: "bg-explorer-operations-custom",
  Other: "bg-explorer-operations-other",
};

const getCategoriesToExpand = (
  selectedIds: number[],
  operationTypes: Explorer.ExtendedOperationTypePattern[] | undefined,
  categorizedOperationTypes: { name: string; types: string[] }[]
): string[] => {
  if (!operationTypes) return [];
  return categorizedOperationTypes
    .filter((cat) =>
      cat.types.some((type) => {
        const operationType = operationTypes.find(
          (op) => op.operation_name === type
        );
        return selectedIds.includes(operationType?.op_type_id || 0);
      })
    )
    .map((cat) => cat.name);
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
  const { settings } = useUserSettingsContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const categoryHeadersRef = useRef<Record<string, HTMLDivElement | undefined>>(
    {} as Record<string, HTMLDivElement | undefined>
  );

  useEffect(() => {
    if (searchTerm) {
      const allMatchingCategories = categorizedOperationTypes
        .filter((cat) =>
          cat.types.some((type) =>
            operationTypes
              ?.find((op) => op.operation_name === type)
              ?.operation_name.toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
        )
        .map((cat) => cat.name);
      setExpandedSections(allMatchingCategories);
    } else {
      setExpandedSections([]);
    }
  }, [searchTerm, operationTypes]);

  if (!operationTypes || !operationTypes.length) return null;

  const nonDisabledOperationTypes = operationTypes.filter(
    (operationType) => !operationType.isDisabled
  );

  const virtualOperations = nonDisabledOperationTypes.filter(
    (operationType) => operationType.is_virtual
  );
  const nonVirtualOperations = nonDisabledOperationTypes.filter(
    (operationType) => !operationType.is_virtual
  );

  const filterOperations = (
    operationType: Explorer.ExtendedOperationTypePattern
  ) => {
    if (!searchTerm) return true;
    return operationType.operation_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  };

  const filteredNonDisabledOperations =
    nonDisabledOperationTypes.filter(filterOperations);

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
      if (searchTerm) {
        const allMatchingCategories = getCategoriesToExpand(
          selectedOperations,
          operationTypes,
          categorizedOperationTypes
        );
        setExpandedSections(allMatchingCategories);
      }
    }

    setIsOpen(open);
  };

  const selectAll = () => {
    const allIds = filteredNonDisabledOperations.map(
      (operationType) => operationType.op_type_id
    );
    setSelectedOperationsIds(allIds);
    const allMatchingCategories = getCategoriesToExpand(
      allIds,
      operationTypes,
      categorizedOperationTypes
    );
    setExpandedSections(allMatchingCategories);
  };

  const selectReal = () => {
    const realIds = nonVirtualOperations
      .filter(filterOperations)
      .map((operationType) => operationType.op_type_id);
    let finaList = [...realIds, ...selectedOperationsIds];
    finaList = finaList.filter((id, index) => finaList.indexOf(id) === index);
    setSelectedOperationsIds([...finaList]);
    const allMatchingCategories = getCategoriesToExpand(
      finaList,
      operationTypes,
      categorizedOperationTypes
    );
    setExpandedSections(allMatchingCategories);
  };

  const selectVirtual = () => {
    const virtualIds = virtualOperations
      .filter(filterOperations)
      .map((operationType) => operationType.op_type_id);
    let finaList = [...virtualIds, ...selectedOperationsIds];
    finaList = finaList.filter((id, index) => finaList.indexOf(id) === index);
    setSelectedOperationsIds([...finaList]);
    const allMatchingCategories = getCategoriesToExpand(
      finaList,
      operationTypes,
      categorizedOperationTypes
    );
    setExpandedSections(allMatchingCategories);
  };

  const selectAllOfCategory = (
    operationTypes: Explorer.ExtendedOperationTypePattern[]
  ) => {
    const nonDisabledOperationTypesForCategory = operationTypes
      .filter(filterOperations)
      .filter((operationType) => !operationType.isDisabled);
    const operationsIds = nonDisabledOperationTypesForCategory.map(
      (operationType) => operationType.op_type_id
    );
    let finaList = [...operationsIds, ...selectedOperationsIds];
    finaList = finaList.filter((id, index) => finaList.indexOf(id) === index);
    setSelectedOperationsIds(finaList);
  };

  const clearCategory = (
    operationTypes: Explorer.ExtendedOperationTypePattern[]
  ) => {
    const operationsIds = operationTypes
      .filter(filterOperations)
      .map((operationType) => operationType.op_type_id);
    const finalOperations = [...selectedOperationsIds].filter(
      (selectedOperationId) => !operationsIds.includes(selectedOperationId)
    );
    setSelectedOperationsIds(finalOperations);
  };

  const invertSelection = () => {
    const allIds = filteredNonDisabledOperations.map(
      (operationType) => operationType.op_type_id
    );
    const finaList = allIds.filter(
      (id) =>
        selectedOperationsIds.find((selectedId) => selectedId === id) ===
        undefined
    );
    setSelectedOperationsIds(finaList);
    const allMatchingCategories = getCategoriesToExpand(
      finaList,
      operationTypes,
      categorizedOperationTypes
    );
    setExpandedSections(allMatchingCategories);
  };

  const renderOperationType = (
    operationType: Explorer.ExtendedOperationTypePattern
  ) => {
    return (
      <li
        onClick={() => onFiltersSelect(operationType.op_type_id)}
        key={operationType.op_type_id}
        className="flex items-center py-1 px-2 rounded-md hover:bg-rowHover cursor-pointer"
      >
        <Input
          type="checkbox"
          checked={selectedOperationsIds.includes(operationType.op_type_id)}
          name={`operation-checkbox-${operationType.op_type_id}`}
          className=" w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          {...{
            "data-testid": `operation-type-checkbox-${operationType.operation_name}`,
          }}
          onChange={() => onFiltersSelect(operationType.op_type_id)}
          disabled={operationType.isDisabled}
        />
        <Label
          htmlFor={`operation-checkbox-${operationType.op_type_id}`}
          className={cn(
            "p-1 ml-1 text-sm font-medium text-text whitespace-normal overflow-hidden text-ellipsis",
            {
              "text-sky-500 dark:text-sky-200": operationType.is_virtual,
              "opacity-50": operationType.isDisabled,
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

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => {
      if (prev.includes(sectionName)) {
        return prev.filter((s) => s !== sectionName);
      } else {
        return [...prev, sectionName];
      }
    });
  };

  const handleExpandAll = () => {
    const allCategories = categorizedOperationTypes.map((cat) => cat.name);
    setExpandedSections(allCategories);
  };

  const handleCollapseAll = () => {
    setExpandedSections([]);
  };

  const renderSection = (sectionName: string, operationsNames: string[]) => {
    const operations = operationsNames
      .map((name) =>
        operationTypes?.find(
          (operationType) => operationType.operation_name === name
        )
      )
      .filter(
        (operationType) => operationType
      ) as Explorer.ExtendedOperationTypePattern[];
    const sortedOperations = operations.sort((a, b) =>
      a?.operation_name.localeCompare(b?.operation_name)
    );
    const filteredOperations = sortedOperations.filter(filterOperations);
    const nonDisabledOperationTypesForSection = filteredOperations.filter(
      (operationType) => !operationType.isDisabled
    );

    const isExpanded = expandedSections.includes(sectionName);
    const allIdsInCategory = nonDisabledOperationTypesForSection.map(
      (operationType) => operationType.op_type_id
    );

    const isCategoryChecked =
      nonDisabledOperationTypesForSection.length > 0
        ? allIdsInCategory.every((id) => selectedOperationsIds.includes(id))
        : false;

    const handleCategoryCheckboxChange = () => {
      if (isCategoryChecked) {
        clearCategory(operations);
        setExpandedSections((prev) => prev.filter((s) => s !== sectionName));
      } else {
        selectAllOfCategory(operations);
        setExpandedSections((prev) => [...prev, sectionName]);
      }
    };

    if (searchTerm && filteredOperations.length === 0) {
      return null;
    }

    return (
      <div
        className="border-t px-2"
        key={sectionName}
      >
        <div
          className="flex items-center justify-between py-2 cursor-pointer  z-10"
          onClick={() => toggleSection(sectionName)}
          ref={(el) => {
            if (el) {
              categoryHeadersRef.current[sectionName] = el;
            }
          }}
        >
          <div className="flex items-center  flex-1 ">
            <Input
              type="checkbox"
              checked={isCategoryChecked}
              onChange={handleCategoryCheckboxChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-2"
              id={`category-checkbox-${sectionName}`}
            />
            <span
              className={`rounded w-4 h-4 mr-2 ${colorByOperationCategory[sectionName]}`}
            ></span>
            <span className="font-semibold flex-1 truncate">{sectionName}</span>
          </div>
          <ChevronDown
            className={cn("h-5 w-5 transition-transform transform", {
              "rotate-180": isExpanded,
            })}
          />
        </div>
        {isExpanded && (
          <ul
            className={cn("my-2 grid  gap-y-2", {
              "sm:grid-cols-4": true,
            })}
          >
            {filteredOperations.map(
              (operation) => !!operation && renderOperationType(operation)
            )}
          </ul>
        )}
      </div>
    );
  };

  const handleClearOperationsFilter = () => {
    setSelectedOperations(null);
    setSearchTerm("");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <DialogTrigger asChild>
        <Button data-testid="operations-types-btn">Operation Types</Button>
      </DialogTrigger>
      {selectedOperations && selectedOperations?.length ? (
        <Chip
          text={triggerTitle}
          clearSelection={handleClearOperationsFilter}
        />
      ) : null}
      <DialogContent
        className=" pt-10 max-w-[95%] h-[90%] sm:max-h-[90%] sm:w-[90%] flex flex-col align-center overflow-auto px-0"
        data-testid="operation-types-dialog"
      >
        <DialogHeader className="pb-0">
          <div className="flex flex-col sm:flex-row justify-between items-center px-2">
            <DialogTitle className="flex pb-1">
              Operation Types Filters
            </DialogTitle>
            <div className="flex space-x-1">
              <Button
                type="button"
                className="operations-button text-xs"
                onClick={selectAll}
              >
                All
              </Button>
              <Button
                type="button"
                className="operations-button text-xs"
                onClick={selectReal}
              >
                Real
              </Button>
              <Button
                type="button"
                className="operations-button text-xs"
                onClick={selectVirtual}
              >
                Virtual
              </Button>
              <Button
                type="button"
                className="operations-button text-xs"
                onClick={invertSelection}
              >
                Invert
              </Button>
              <Button
                type="button"
                className="operations-button text-xs"
                onClick={handleOnClear}
              >
                Clear
              </Button>
            </div>
          </div>
          <div className="px-2 mt-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search operations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 w-full"
              />
            </div>
          </div>
          <div className="flex space-x-1 px-1">
            <Button
              type="button"
              className="bg-inherit text-xs px-2"
              onClick={handleExpandAll}
            >
              Expand All
            </Button>
            <Button
              type="button"
              className="bg-inherit text-xs px-2"
              onClick={handleCollapseAll}
            >
              Collapse All
            </Button>
          </div>
        </DialogHeader>
        <div className="overflow-auto">
          {categorizedOperationTypes.map((categorizedOperationType) =>
            renderSection(
              categorizedOperationType.name,
              categorizedOperationType.types
            )
          )}
        </div>
        <DialogFooter className="pt-0">
          <div
            className="flex flex-wrap justify-end w-full gap-y-4 border-t pt-4 px-2"
            data-testid="operation-types-dialog-footer"
          >
            <div className="flex w-full md:w-auto justify-center">
              <Button
                type="button"
                className="bg-inherit mx-2"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
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
