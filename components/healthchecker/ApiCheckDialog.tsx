import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";

interface ApiCheckDialogProps {
  isOpened: boolean;
  openedProvider?: string;
  changeChecks: (data: unknown) => void;
  onDialogOpenChange: (isOpened: boolean, provider?: string) => void;
}

const ApiCheckDialog: React.FC<ApiCheckDialogProps> = ({
  isOpened,
  openedProvider,
  changeChecks,
  onDialogOpenChange
}) => {


  return (
    <Dialog open={isOpened} onOpenChange={onDialogOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{openedProvider}</DialogTitle></DialogHeader>

      </DialogContent>
    </Dialog>
  )
};

export default ApiCheckDialog;
