import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Hive from "@/types/Hive";

type OperationTypesDialogProps = {
  operationTypes: Hive.OperationTypes[];
  triggerTitle: string;
  setSelectedOperations: (operationIds: number[]) => void;
};

const OperationTypesDialog: React.FC<OperationTypesDialogProps> = ({
  operationTypes,
  triggerTitle,
  setSelectedOperations,
}) => {
  const [selectedOperationsIds, setSelectedOperationsIds] = useState<number[]>([]);

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
    setSelectedOperations(selectedOperationsIds);
  };

  const handleOnClear = () => {
    setSelectedOperationsIds([]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-explorer-dark-gray text-white hover:bg-gray-700 rounded-[4px]">
          {triggerTitle}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80%] max-h-[80%] flex-column justify-center align-center overflow-auto bg-white text-black">
        <DialogHeader>
          <DialogTitle>Operation Types</DialogTitle>
          <DialogDescription>
            Select operations you want to see
          </DialogDescription>
        </DialogHeader>

        <ul className="my-4 grid grid-cols-3 gap-4 place-items-stretch text-white">
          {operationTypes.map((operation) => {
            return (
              <li
                onClick={() => onFiltersSelect(operation[0])}
                key={operation[0]}
                className="col-span-3 pl-2 md:col-span-1 flex items-center font-bold text-base rounded-lg bg-inherit hover:border-2-gray group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white "
              >
                <Input
                  type="checkbox"
                  checked={selectedOperationsIds.includes(operation[0])}
                  name="bordered-checkbox"
                  className=" w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 "
                  onChange={() => onFiltersSelect(operation[0])}
                />
                <Label
                  htmlFor="bordered-checkbox-1"
                  className="p-2 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {operation[1]}
                </Label>
              </li>
            );
          })}
        </ul>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleOnClear}
          >
            Clear filters
          </Button>
          <Button
            type="submit"
            variant="default"
            onClick={handleOnSubmit}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OperationTypesDialog;
