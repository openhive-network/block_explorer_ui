import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ApiChecker } from "./HealthChecker";
import { Toggle } from "../ui/toggle";

interface ApiCheckDialogProps {
  className?: string;
  isOpened: boolean;
  openedProvider?: string;
  checksList: Map<string, ApiChecker> | undefined
  changeChecks: (data: unknown) => void;
  onDialogOpenChange: (isOpened: boolean, provider?: string) => void;
}

const ApiCheckDialog: React.FC<ApiCheckDialogProps> = ({
  className,
  isOpened,
  openedProvider,
  checksList,
  changeChecks,
  onDialogOpenChange
}) => {


  return (
    <Dialog open={isOpened} onOpenChange={onDialogOpenChange}>
      <DialogContent className={cn(className)}>
        <DialogHeader><DialogTitle>{openedProvider}</DialogTitle></DialogHeader>
        <div>
          {Array.from(checksList?.values() || []).map((check) => (
            <div className="flex">
              <div>{check.title}</div>
              <Toggle checked={true} onClick={() => {}}  />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
};

export default ApiCheckDialog;
