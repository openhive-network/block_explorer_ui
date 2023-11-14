import { useEffect, useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

type SingleOperationTypeDialogProps = {
  operationTypes: Hive.OperationPattern[];
  triggerTitle: string;
  selectedOperation: number | null;
  colorClass: string;
  setSelectedOperation: (operationId: number | null) => void;
};

const SingleOperationTypeDialog: React.FC<SingleOperationTypeDialogProps> = ({
  operationTypes,
  triggerTitle,
  selectedOperation,
  colorClass,
  setSelectedOperation,
}) => {
  const [selectedOperationId, setSelectedOperationId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const virtualOperations = operationTypes.filter((operationType) => operationType.is_virtual);
  const nonVirtualOperations = operationTypes.filter((operationType) => !operationType.is_virtual);


  const onOpenChange = (open: boolean) => {
    if (open) {
      setSelectedOperationId(selectedOperation);
    }
    setIsOpen(open);
  }

  const onApply = () => {
    setSelectedOperation(selectedOperationId);
    setIsOpen(false);
  }

  const renderOperation = (operation: Hive.OperationPattern) => {
    return (
      <li
        key={operation.op_type_id}
        onClick={() => {setSelectedOperationId(operation.op_type_id)}}
        className="col-span-3 pl-2 md:col-span-1 flex items-center font-bold text-base rounded-lg bg-inherit hover:border-2-gray group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white "
      >
        <RadioGroupItem className="text-black" value={String(operation.op_type_id)} id={operation.operation_name} />
        <Label
          htmlFor="bordered-checkbox-1"
          className="p-2 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis"
        >
          {operation.operation_name}
        </Label>
      </li>
    )
  }


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {onOpenChange(open)}}>
      <DialogTrigger asChild>
        <Button className={ `${colorClass}  text-white hover:bg-gray-700 rounded-[4px]`}>
          {triggerTitle}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80%] h-[80%] flex-column justify-center align-center  bg-white text-black ">
        <DialogHeader>
          <DialogTitle className="flex justify-center pt-2">Operation Type</DialogTitle>
        </DialogHeader>
      <div className="overflow-auto">
        <RadioGroup value={String(selectedOperationId)}>
          <ul className="my-4 grid grid-cols-3 gap-4 place-items-stretch text-white ">
            {nonVirtualOperations.map((operation) => renderOperation(operation))}
          </ul>
          <div className="text-center mt-8">Virtual operations</div>
          <ul className="my-4 grid grid-cols-3 gap-4 place-items-stretch text-white ">
            {virtualOperations.map((operation) => renderOperation(operation))}
          </ul>
        </RadioGroup>
      </div>
        <DialogFooter>
          <div className="flex justify-end w-full">
            <div className="flex">
              <Button type="button" variant='secondary' onClick={() => {onOpenChange(false)}}>
                Cancel
              </Button>
              <Button type="button" variant='secondary' onClick={() => {setSelectedOperationId(null)}}>
                Clear
              </Button>
              <Button className="bg-blue-800 hover:bg-blue-600 text-white rounded" type="submit" variant='default' onClick={onApply}>
                Apply
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SingleOperationTypeDialog;
