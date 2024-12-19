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
  onDialogOpenChange: (isOpened: boolean, provider?: string) => void;
  switchToProvider: (providerLink: string | null) => void;
}

const ApiCheckDialog: React.FC<ApiCheckDialogProps> = ({
  className,
  isOpened,
  openedProvider,
  checksList,
  activeChecksKeys,
  changeChecks,
  onDialogOpenChange,
  switchToProvider
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
            </div>
          ))}
          <div className="flex justify-between">
            <Button onClick={confirm}>Confirm</Button>
            <Button className="hover:bg-slate-400 rounded" onClick={() => {switchToProvider(openedProvider || null)}}>Switch to API</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
};

export default ApiCheckDialog;
