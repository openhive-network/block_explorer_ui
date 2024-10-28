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

interface ApiCheckDialogProps {
  className?: string;
  isOpened: boolean;
  openedProvider?: string;
  checksList: Map<string, ApiChecker> | undefined;
  activeChecksKeys: string[];
  changeChecks: (provider: string, newChecksList: string[]) => void;
  changeEndpointAddress: (checker: ApiChecker) => void;
  onDialogOpenChange: (isOpened: boolean, provider?: string) => void;
}

const ApiCheckDialog: React.FC<ApiCheckDialogProps> = ({
  className,
  isOpened,
  openedProvider,
  checksList,
  activeChecksKeys,
  changeChecks,
  changeEndpointAddress,
  onDialogOpenChange
}) => {

  const [localChecks, setLocalChecks] = useState<Record<string, boolean>>({});

  const changeToggle = (toggleKey: string): void => {
    const localCheckCopy = structuredClone(localChecks);
    if (localChecks[toggleKey]) {
      delete localCheckCopy[toggleKey];
    } else {
      localCheckCopy[toggleKey] = true;
    }
    setLocalChecks(localCheckCopy);
  }

  const confirm = (): void => {
    if (openedProvider) {
      const checkedKeys = Object.entries(localChecks).filter(([key, isChecked]) => isChecked).map(([key, isChecked]) => key);
      changeChecks(openedProvider, checkedKeys);
    }
  }

  useEffect(() => {
    const newChecksState: Record<string, boolean> = {} 
    activeChecksKeys.forEach((key) => {
      newChecksState[key] = true;
    })
    setLocalChecks(newChecksState);
  }, [activeChecksKeys])


  return (
    <Dialog open={isOpened} onOpenChange={onDialogOpenChange}>
      <DialogContent className={cn(className, "bg-explorer-bg-start")}>
        <DialogHeader><DialogTitle>{openedProvider}</DialogTitle></DialogHeader>
        <div>
          {Array.from(checksList?.entries() || []).map(([key, check]) => (
            <div key={key} className="flex mb-2 items-center">
              <Toggle className="bg-black rounded-full" checked={localChecks[key]} onClick={() => {changeToggle(key)}}  />
              <div className="mx-2">{check.title}</div>
              <Button onClick={() => {changeEndpointAddress(check)}}>Use endpoint</Button>
            </div>
          ))}
          <Button onClick={confirm}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
};

export default ApiCheckDialog;
