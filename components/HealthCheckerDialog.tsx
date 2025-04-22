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
import { HealthCheckerComponent, HealthCheckerService } from "@hiveio/healthchecker-component";
import { useHealthCheckerContext } from "@/contexts/HealthCheckerContext";

type HealthCheckerDialogProps = {
  trigerText?: string;
  apiAddress: string | null;
  healthCheckerService: HealthCheckerService;
};

const HealthCheckerDialog: React.FC<HealthCheckerDialogProps> = ({trigerText, apiAddress, healthCheckerService}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);


  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
   <DialogTrigger
        data-testid="api-address-link"
        className="flex flex-wrap items-center"
      >
        <span className="whitespace-nowrap">{trigerText}</span>
        <span className="text-link break-all">{apiAddress}</span>
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
