import React from "react";
import { Alert } from "./contexts/AlertContext";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface AlertProps {
  alert: Alert;
  onClose: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ alert, onClose, className = "" }) => {
  return (
    <div
      className={cn(
        "relative border w-full text-center py-3 bg-blue-200 border-blue-600 text-blue-600 font-semibold",
        {
          "bg-red-200 border-red-600 text-red-600": alert.type === "error",
          "bg-green-200 border-green-600 text-green-600":
            alert.type === "success",
          "bg-orange-200 border-orange-600 text-orange-600":
            alert.type === "warning",
        },
        className
      )}
    >
      <p className="w-fit max-w-[75%] md:max-w-[80%] m-auto text-justify">
        {alert.message}
      </p>
      <Button
        onClick={onClose}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-0 px-2"
      >
        <X className="w-7 h-7" />
      </Button>
    </div>
  );
};

export default Alert;
