import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ApiChecker } from "./HealthChecker";
import { Toggle } from "../ui/toggle";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface EndpointProviderDialogProps {
  className?: string;
  checkTitle?: string;
  isOpened: boolean;
  onDialogOpenChange: (isOpened: boolean, provider?: string) => void;
}

const EndpointProviderDialog: React.FC<EndpointProviderDialogProps> = ({
  className,
  checkTitle,
  isOpened,
  onDialogOpenChange
}) => {


  return (
    <Dialog open={isOpened} onOpenChange={onDialogOpenChange}>
      <DialogContent className={cn(className, "bg-explorer-bg-start")}>
        <DialogHeader><DialogTitle>Endpoint link</DialogTitle></DialogHeader>
        <div>
          {checkTitle}
        </div>
      </DialogContent>
    </Dialog>
  )
};

export default EndpointProviderDialog;
