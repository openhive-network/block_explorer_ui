import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface EndpointProviderDialogProps {
  className?: string;
  checkKey?: string;
  checkTitle?: string;
  isOpened: boolean;
  providers?: string[];
  currentProvider?: string;
  onDialogOpenChange: (isOpened: boolean, provider?: string) => void;
  changeProviderForEndpoint: (endpointKey: string, newProvider: string) => void;
}

const EndpointProviderDialog: React.FC<EndpointProviderDialogProps> = ({
  className,
  checkKey,
  checkTitle,
  isOpened,
  providers,
  currentProvider,
  onDialogOpenChange,
  changeProviderForEndpoint
}) => {

  if (!checkKey) return null;
  return (
    <Dialog open={isOpened} onOpenChange={onDialogOpenChange}>
      <DialogContent className={cn(className, "bg-explorer-bg-start")}>
        <DialogHeader><DialogTitle>{checkTitle}</DialogTitle></DialogHeader>
        <div>
          {providers?.map((provider) => 
            <div key={provider} className={cn("flex my-2 items-center", {"font-semibold": provider === currentProvider})}>
              <Button className="mr-2" onClick={() => {changeProviderForEndpoint(checkKey, provider)}}>Switch to Provider</Button>
              {provider}
            </div>
          )}
          
        </div>
      </DialogContent>
    </Dialog>
  )
};

export default EndpointProviderDialog;
