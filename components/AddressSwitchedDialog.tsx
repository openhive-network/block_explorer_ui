import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { config } from "@/Config";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";

type AddressSwitcherDialogProps = {
  addressType: "node" | "api";
  setAddress: (url: string) => void;
  currentAddress: string | null;
};

const AddressSwitchedDialog: React.FC<AddressSwitcherDialogProps> = ({addressType, setAddress, currentAddress}) => {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [userAddress, setUserAddress] = useState<string>(currentAddress || "");

  const getDefaultApiAddress = (): string => {
    if (addressType === "api") {
      return config.apiAddress;
    } else {
      return config.nodeAddress;
    }
  }

  const onButtonClick = () => {
    setAddress(userAddress);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{currentAddress ? currentAddress : getDefaultApiAddress()}</DialogTrigger>
      <DialogContent className="h-1/4 max-w-3xl overflow-auto bg-white">
        <DialogHeader>
          <DialogTitle>{addressType === "api" ? "API Address" : "Node Address"}</DialogTitle>
        </DialogHeader>
        <Input
          className="bg-gray-700"
          type="text"
          value={userAddress || ""}
          onChange={(e) => setUserAddress(e.target.value)}
          placeholder="---"
        />
        <DialogFooter>
          <Button
            className="text-white bg-blue-800 hover:bg-blue-600 rounded"
            onClick={onButtonClick}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddressSwitchedDialog;
