import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import { Input } from "../ui/input";

interface ProviderAdditionDialogProps {
  isOpened: boolean;
  onDialogOpenChange: (isOpened: boolean) => void;
  onProviderSubmit: (provider: string) => void;
}

const ProviderAdditionDialog: React.FC<ProviderAdditionDialogProps> = ({
  isOpened,
  onDialogOpenChange,
  onProviderSubmit
}) => {

  return (
    <Dialog open={isOpened} onOpenChange={onDialogOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add new provider's address</DialogTitle></DialogHeader>
        <Input
          autoFocus={true}
          className="focus:bg-white dark:focus:bg-gray-700"
          type="text"
          data-testid="api-address-input"
          onChange={() => {}}
        />
      </DialogContent>
    </Dialog>
  )
};

export default ProviderAdditionDialog;
