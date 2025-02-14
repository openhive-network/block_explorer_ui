import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "../ui/button";
import { ValidationErrorDetails } from "@/contexts/HealthCheckerContext";

interface ValidationErrorDialogProps {
  isOpened: boolean;
  onDialogOpenChange: (isOpened: boolean) => void;
  validatorDetails?: ValidationErrorDetails;
  clearValidationError: (providerName: string, checkerName: string) => void;
}

const ValidationErrorDialog: React.FC<ValidationErrorDialogProps> = ({
    isOpened,
    validatorDetails,
    onDialogOpenChange,
    clearValidationError
}) => {

  const handleErrorClearClick = () => {
    if (validatorDetails?.providerName && validatorDetails?.checkName) {
      clearValidationError(validatorDetails?.providerName, validatorDetails?.checkName);
      onDialogOpenChange(false);
    }
  }

  return (
    <Dialog open={isOpened} onOpenChange={onDialogOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{validatorDetails?.checkName} validator error</DialogTitle></DialogHeader>
        <div>{validatorDetails?.message}</div>
        <div>{validatorDetails?.paths.join("/")}</div>
      <DialogFooter>
        <Button onClick={handleErrorClearClick}>Clear error</Button>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export default ValidationErrorDialog;
