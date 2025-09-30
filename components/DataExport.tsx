import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { stringify } from "csv-stringify";
import { Download, FileDown, Loader2 } from "lucide-react"; // 1. Add FileDown
import { useI18n } from "@/i18n/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface DataItem {
  [key: string]: any;
}

interface DataExportProps {
  data: DataItem[];
  filename?: string;
  title?: string;
  className?: string;
  // New prop to allow passing a custom trigger element
  children?: React.ReactNode;
  // New prop to bypass the column selection dialog
  skipColumnSelection?: boolean;
}

const DataExport: React.FC<DataExportProps> = ({
  data,
  filename = "data.csv",
  className,
  title = "common.export",
  children,
  skipColumnSelection = false,
}) => {
  const { t } = useI18n();
  const [isExporting, setIsExporting] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isExportButtonDisabled, setIsExportButtonDisabled] = useState(true);
  const [noDataMessage, setNoDataMessage] = useState<string | null>(null);

  const allColumns = useMemo(() => {
    return data.length > 0 ? Object.keys(data[0]) : [];
  }, [data]);

  // This effect now only runs if the dialog is about to be opened
  useEffect(() => {
    if (open && !skipColumnSelection) {
      if (data.length > 0) {
        setSelectedColumns(allColumns); // Select all columns initially
        setNoDataMessage(null); // Clear no data message
      } else {
        setSelectedColumns([]);
        setNoDataMessage(t("dataExport.noDataAvailable"));
      }
    }
  }, [allColumns, data, t, open, skipColumnSelection]);

  useEffect(() => {
    setIsExportButtonDisabled(selectedColumns.length === 0);
  }, [selectedColumns]);

  const handleExport = async (event?: React.MouseEvent) => {
    // For direct download, prevent any parent onClick events
    if (skipColumnSelection) {
      event?.preventDefault();
      event?.stopPropagation();
    }
    
    if (!data || data.length === 0 || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      // Determine which columns to use based on the new prop
      const columnsToExport = skipColumnSelection ? allColumns : selectedColumns;

      // Filter the data to only include the selected columns
      const filteredData = data.map((item) => {
        const newItem: { [key: string]: any } = {};
        columnsToExport.forEach((col) => {
          if (item.hasOwnProperty(col)) {
            newItem[col] = item[col];
          }
        });
        return newItem;
      });
      
      if (filteredData.length === 0 || columnsToExport.length === 0) {
         throw new Error("No data to export after filtering.");
      }

      const csvData = await new Promise<string>((resolve, reject) => {
        stringify(
          filteredData,
          { header: true, columns: columnsToExport },
          (err, output) => {
            if (err) {
              reject(err);
            } else {
              resolve(output);
            }
          }
        );
      });

      const blob = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;

      // Sanitize only the filename prefix
      let sanitizedFilename = filename;
      if (filename.toLowerCase().endsWith(".csv")) {
        const filenamePrefix = filename.substring(0, filename.length - 4); // Remove ".csv"
        const sanitizedPrefix = filenamePrefix.replace(/\./g, "_"); // Sanitize
        sanitizedFilename = sanitizedPrefix + ".csv"; // Re-add ".csv"
      } else {
        // If it doesn't end with .csv, still sanitize the whole name and add extension
        sanitizedFilename = filename.replace(/\./g, "_") + ".csv";
      }

      downloadLink.download = sanitizedFilename;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
      // Only close the dialog if it was open in the first place
      if (!skipColumnSelection) {
        setOpen(false);
      }
    } catch (error) {
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  const handleColumnSelect = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(allColumns);
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  // Define a default trigger to use if no children are provided
  const DefaultTrigger = (
    <div
      className={cn(
        "bg-buttonBg border-gray-300 shadow-sm hover:bg-buttonHover flex items-center space-x-1 max-w-fit h-8 p-2 rounded cursor-pointer outline-none",
        className,
        { "cursor-not-allowed opacity-50": data.length === 0 }
      )}
    >
      <Download className="h-4 w-4" />
      <span>{t(title)}</span>
    </div>
  );
  
  // Use the provided children as the trigger, or fall back to the default
  const Trigger = children || DefaultTrigger;

  // --- RENDER LOGIC ---

  // If skipping column selection, render a direct-action element
  if (skipColumnSelection) {
    const isDisabled = isExporting || data.length === 0;

    const triggerContent = isExporting ? (
      <div className={cn("flex items-center justify-center p-1 w-6 h-6", className)}>
         <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    ) : children ? (
      <>{children}</>
    ) : (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="flex items-center justify-center">
              <FileDown className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("common.export")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    return (
      <div
        onClick={isDisabled ? undefined : handleExport}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isDisabled) handleExport();
        }}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        className={cn({ "cursor-not-allowed opacity-50": isDisabled })}
      >
        {triggerContent}
      </div>
    );
  }

  // Default behavior: Render the full dialog component
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={data.length === 0}>
        {Trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] flex flex-col align-center overflow-auto px-0 pt-10">
        <DialogHeader className="pb-0">
          <div className="px-2">
            <DialogTitle className="flex pb-1">
              {t("dataExport.selectColumns")}
            </DialogTitle>
            <DialogDescription>
              {t("dataExport.chooseColumns")}
            </DialogDescription>
          </div>
          <div className="flex justify-end space-x-2 px-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={isExporting || noDataMessage !== null}
            >
              {t("dataExport.selectAll")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeselectAll}
              disabled={isExporting || noDataMessage !== null}
            >
              {t("dataExport.deselectAll")}
            </Button>
          </div>
        </DialogHeader>
        {noDataMessage ? (
          <div className="px-2 py-4 text-center text-gray-500">
            {noDataMessage}
          </div>
        ) : (
          <div className="grid gap-4 py-4 px-2 overflow-auto">
            {allColumns.map((column) => (
              <div key={column} className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  id={column}
                  checked={selectedColumns.includes(column)}
                  onChange={() => handleColumnSelect(column)}
                  className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <Label
                  htmlFor={column}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {column}
                </Label>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleExport}
            disabled={
                    isExporting ||
                    isExportButtonDisabled ||
                    noDataMessage !== null
            }
            className="mr-2"
          >
            {isExporting ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : null}
            {isExporting ? t("dataExport.exporting") : t("common.export")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataExport;