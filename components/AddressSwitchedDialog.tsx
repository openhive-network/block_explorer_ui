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

const AddressSwitchedDialog: React.FC<AddressSwitcherDialogProps> = ({
  addressType,
  setAddress,
  currentAddress,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [userAddress, setUserAddress] = useState<string>("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && isOpen) {
      onSubmitClick();
    }
  };

  const getDefaultApiAddress = (): string => {
    if (addressType === "api") {
      return config.apiAddress;
    } else {
      return config.nodeAddress;
    }
  };

  const onSubmitClick = () => {
    setAddress(userAddress);
    setIsOpen(false);
  };

  const onResetClick = () => {
    setAddress(null);
    setIsOpen(false);
  };

  useEffect(() => {
    setUserAddress(currentAddress || "");
  }, [currentAddress]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger data-testid="api-address-link">
        <div>
          <span>
            {addressType === "api" ? "Explorer backend API:" : "Hive node:"}
          </span>
          <span className="text-link ml-1">
            {currentAddress ? currentAddress : getDefaultApiAddress()}
          </span>
        </div>
      </DialogTrigger>
      <DialogContent
        onKeyDown={handleKeyDown}
        className="h-1/4 max-w-3xl overflow-auto bg-white  dark:bg-theme dark:text-white"
        data-testid="api-address-dialog"
      >
        <DialogHeader>
          <DialogTitle data-testid="api-address-header-title">
            {addressType === "api"
              ? "Block Explorer backend API address"
              : "Hive node address"}
          </DialogTitle>
        </DialogHeader>
        <Input
          autoFocus={true}
          className="focus:bg-white dark:focus:bg-gray-700"
          type="text"
          data-testid="api-address-input"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <DialogFooter>
          <div className="w-full flex justify-between">
            <Button
              type="button"
              // variant="secondary"
              // className="rounded"
              data-testid="api-address-reset-button"
              onClick={onResetClick}
            >
              Reset to default
            </Button>
            <Button
              // className="rounded"
              data-testid="api-address-submit-button"
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
