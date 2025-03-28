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
import { Button } from "./ui/button";
import { HiveNodes } from "@/utils/HiveNodes";
import { Input } from "@/components/ui/input";

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
  const [customNodeAddress, setCustomNodeAddress] = useState<string>("");

  const getDefaultApiAddress = (): string => {
    if (addressType === "api") {
      return config.apiAddress;
    } else {
      return config.nodeAddress;
    }
  };

  const onSubmitClick = () => {
    setAddress(userAddress || customNodeAddress);
    setIsOpen(false);
  };

  const onResetClick = () => {
    setAddress(null);
    setIsOpen(false);
  };

  useEffect(() => {
    setUserAddress(currentAddress || "");
  }, [currentAddress]);

  const handleNodeSelect = (node: string) => {
    setUserAddress(node);
    setCustomNodeAddress("");
  };

  const removeProtocol = (url: string): string => {
    return url.replace(/^https?:\/\//, '');
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger data-testid="api-address-link">
        <div className="text-left">
          <span>
            {addressType === "api" ? "Explorer backend API:" : "Hive node:"}
          </span>
          <span className="text-link ml-1">
            {currentAddress ? currentAddress : getDefaultApiAddress()}
          </span>
        </div>
      </DialogTrigger>
      <DialogContent
        className="h-[70vh] max-w-3xl overflow-auto flex flex-col rounded-lg shadow-md border"
        data-testid="api-address-dialog"
      >
        <DialogHeader className="px-2 pt-2">
          <DialogTitle data-testid="api-address-header-title" className="text-lg font-semibold">
            {addressType === "api"
              ? "Block Explorer backend API address"
              : "Hive node address"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-2">
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Available Nodes:</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Select from the list of available nodes.</p>

              <div className="space-y-2">
                {HiveNodes.map((node) => (
                  <div key={node} className="flex items-start space-x-2">
                    <input
                      type="radio"
                      id={node}
                      name="hive_node"
                      value={node}
                      checked={userAddress === node}
                      onChange={() => handleNodeSelect(node)}
                      className="cursor-pointer mt-3" 
                    />
                    <div className="flex flex-col">
                      <label htmlFor={node} className="cursor-pointer font-medium text-explorer-dark-gray dark:text-white">
                        {removeProtocol(node)}
                      </label>
                      <p className="text-xs text-gray-500">{node}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-explorer-dark-gray dark:text-white ">Add Custom Node:</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Enter a custom Hive node URL.</p>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="https://"
                  value={customNodeAddress}
                  onChange={(e) => {
                    setCustomNodeAddress(e.target.value);
                    setUserAddress("")
                  }}
                  className="w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:bg-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-auto px-6 py-4">
          <div className="w-full flex justify-between">
            <Button
              type="button"
              data-testid="api-address-reset-button"
              onClick={onResetClick}
              variant="outline"
            >
              Restore Defaults
            </Button>
            <Button
              data-testid="api-address-submit-button"
              onClick={onSubmitClick}
              disabled={!userAddress && !customNodeAddress}
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
