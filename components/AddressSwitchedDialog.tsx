import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AddressSwitcherDialogProps = {
  addressType: "node" | "api"
};

const AddressSwitchedDialog: React.FC<AddressSwitcherDialogProps> = ({addressType}) => {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>Test</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{addressType}</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddressSwitchedDialog;
