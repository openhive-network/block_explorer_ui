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
  setFilters: (filters: string[]) => void;
};

const OperationTypesDialog: React.FC<OperationTypesDialogProps> = ({
  operationTypes,
  setFilters,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const onFiltersSelect = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(filterName => filterName !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gray-500 hover:bg-gray-700">
          Operation Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80%] max-h-[80%] flex-column justify-center align-center overflow-auto bg-white text-black ">
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
                key={operation[0]}
                className="flex  items-center p-3 font-bold text-base rounded-lg bg-inherit hover:border-2-gray group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
              >
                <Input
                  id="bordered-checkbox-1"
                  type="checkbox"
                  checked={selectedFilters.includes(operation[1])}
                  name="bordered-checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  onChange={() => onFiltersSelect(operation[1])}
                />
                <Label
                  htmlFor="bordered-checkbox-1"
                  className="p-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {operation[1]}
                </Label>
              </li>
            );
          })}
        </ul>
        <DialogFooter>
          <Button type="submit" onClick={() => setFilters(selectedFilters)}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OperationTypesDialog;
