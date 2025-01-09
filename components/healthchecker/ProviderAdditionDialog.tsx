import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { useState } from "react";
import { Button } from "../ui/button";

interface ProviderAdditionDialogProps {
  isOpened: boolean;
  onDialogOpenChange: (isOpened: boolean) => void;
  onProviderSubmit: (provider: string) => void;
}

const ProviderAdditionDialog: React.FC<ProviderAdditionDialogProps> = ({
  isOpened,
  onDialogOpenChange,
  onProviderSubmit
}) => {

  const [providerValue, setProviderValue] = useState<string>("");

  return (
    <Dialog open={isOpened} onOpenChange={onDialogOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add new address of provider</DialogTitle></DialogHeader>
        <Input
          value={providerValue}
          autoFocus={true}
          className="focus:bg-white dark:focus:bg-gray-700"
          type="text"
          data-testid="api-address-input"
          onChange={(e) => setProviderValue(e.target.value)}
        />
        <Button onClick={() => {onProviderSubmit(providerValue)}}>Submit</Button>
      </DialogContent>
    </Dialog>
  )
};

export default ProviderAdditionDialog;
