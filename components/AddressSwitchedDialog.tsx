import { useEffect, useState } from "react";
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
  setAddress: (url: string | null) => void;
  currentAddress: string | null;
};

const AddressSwitchedDialog: React.FC<AddressSwitcherDialogProps> = ({addressType, setAddress, currentAddress}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [userAddress, setUserAddress] = useState<string>("");

  const getDefaultApiAddress = (): string => {
    if (addressType === "api") {
      return config.apiAddress;
    } else {
      return config.nodeAddress;
    }
  }

  const onSubmitClick = () => {
    setAddress(userAddress);
    setIsOpen(false);
  }

  const onResetClick = () => {
    setAddress(null);
    setIsOpen(false);
  }

  useEffect(() => {
    setUserAddress(currentAddress || "");
  }, [currentAddress])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger><div >
        <span>{addressType === "api" ? "Database API:" : "Hive node:"}</span>
        <span className=" text-blue-400 ml-1">{currentAddress ? currentAddress : getDefaultApiAddress()}</span>
        </div>
        </DialogTrigger>
      <DialogContent className="h-1/4 max-w-3xl overflow-auto bg-white">
        <DialogHeader>
          <DialogTitle>{addressType === "api" ? "Database API address" : "Hive node address"}</DialogTitle>
        </DialogHeader>
        <Input
          className=""
          type="text"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <DialogFooter >
          <div className="w-full flex justify-between">
            <Button
              type="button" 
              variant="secondary"
              onClick={onResetClick}
            >
              Reset to default
            </Button>
            <Button
              className="text-white bg-blue-800 hover:bg-blue-600 rounded"
              onClick={onSubmitClick}
            >
              Submit
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddressSwitchedDialog;
