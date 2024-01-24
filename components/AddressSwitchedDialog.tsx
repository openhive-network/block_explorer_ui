import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { config } from "@/Config";

type AddressSwitcherDialogProps = {
  addressType: "node" | "api";
  setAddress: (url: string) => void;
  currentAddress: string | null;
};

const AddressSwitchedDialog: React.FC<AddressSwitcherDialogProps> = ({addressType, setAddress, currentAddress}) => {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getDefaultApiAddress = (): string => {
    if (addressType === "api") {
      return config.apiAddress;
    } else {
      return config.nodeAddress;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{currentAddress ? currentAddress : getDefaultApiAddress()}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentAddress ? currentAddress : getDefaultApiAddress()}</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddressSwitchedDialog;
