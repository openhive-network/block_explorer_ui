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
import useApiAddresses from "@/utils/ApiAddresses";
import { HealthCheckerComponent } from "@hiveio/healthchecker-component";
import { useHealthCheckerContext } from "@/contexts/HealthCheckerContext";

type HealthCheckerDialogProps = {};

const HealthCheckerDialog: React.FC<HealthCheckerDialogProps> = ({}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {nodeAddress} = useApiAddresses();
  const {healthCheckerService} = useHealthCheckerContext();


  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger data-testid="api-address-link">
        Hive node healthchecker: <span className="text-link">{nodeAddress}</span>
      </DialogTrigger>
      <DialogContent
        className="h-[80vh] max-w-5xl overflow-auto flex flex-col rounded-lg shadow-md border"
        data-testid="api-address-dialog"
      >
        {!!healthCheckerService &&
        <HealthCheckerComponent healthCheckerService={healthCheckerService} className="mt-4" />
        }
      </DialogContent>
    </Dialog>
  );
};

export default HealthCheckerDialog;
