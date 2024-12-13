import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";

interface ProviderAdditionDialogProps {
  isOpened: boolean;
  onDialogOpenChange: (isOpened: boolean) => void;
}

const ProviderAdditionDialog: React.FC<ProviderAdditionDialogProps> = ({
  isOpened,
  onDialogOpenChange
}) => {

  return (
    <Dialog open={isOpened} onOpenChange={onDialogOpenChange}>

    </Dialog>
  )
};

export default ProviderAdditionDialog;
