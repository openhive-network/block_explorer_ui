import React from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ReportDialogHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

// Shared header for home report dialogs: an indigo accent bar, the report title
// with an optional descriptive subtitle, and an optional actions slot (e.g. an
// export button) placed beside the title, clear of the dialog close button.
const ReportDialogHeader: React.FC<ReportDialogHeaderProps> = ({
  title,
  subtitle,
  actions,
  className,
}) => (
  // DialogHeader centres below sm; start-align it at every width, RTL included.
  <DialogHeader className="text-start sm:text-start">
    <div className={cn("mb-5 flex items-center gap-3 pr-8", className)}>
      <span
        aria-hidden
        className="h-9 w-1.5 shrink-0 rounded-full bg-indigo-500"
      />
      <div className="min-w-0">
        <DialogTitle className="text-lg font-semibold leading-tight">
          {title}
        </DialogTitle>
        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="ml-1 flex items-center gap-2">{actions}</div>}
    </div>
  </DialogHeader>
);

export default ReportDialogHeader;
