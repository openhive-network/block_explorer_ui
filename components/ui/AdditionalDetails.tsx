import * as React from "react";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

interface AdditionalDetailsProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  triggerClassName?: string;
  dialogHeight?: number;
  enableBlur?: boolean;
  handleToggle: (blockNumber: number) => void;
  blockNum: number;
  setIsBlockNavigationActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdditionalDetails: React.FC<AdditionalDetailsProps> = ({
  children,
  title = "Additional Info",
  description,
  triggerClassName = "",
  dialogHeight = 400,
  enableBlur = true,
  handleToggle,
  blockNum,
  setIsBlockNavigationActive,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    handleToggle(blockNum);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsBlockNavigationActive(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={cn(
          "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full p-1 transition-colors duration-150 relative",
          triggerClassName
        )}
      >
        <Eye className="w-3 h-3" />
      </button>

      <Dialog
        open={isOpen}
        onOpenChange={handleClose}
      >
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-50 bg-theme/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

          <DialogContent
            className={cn(
              "rounded fixed z-50 grid w-full max-w-md gap-4 border bg-theme p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] md:w-full",
              isMobile ? "top-[5%] left-[0]" : "top-[15%] left-[50px]"
            )}
            style={{
              transform: "none",
            }}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-slate-800 dark:text-white">
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
            <div>{children}</div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default AdditionalDetails;
