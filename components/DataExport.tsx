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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { stringify } from "csv-stringify";
import { Download } from "lucide-react";
import { Loader2 } from "lucide-react";

interface DataItem {
  [key: string]: any;
}

interface DataExportProps {
  data: DataItem[];
  filename?: string;
  title?: string;
  className?: string;
}

const DataExport: React.FC<DataExportProps> = ({
  data,
  filename = "data.csv",
  className,
  title = "Export",
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isExportButtonDisabled, setIsExportButtonDisabled] = useState(true);
  const [noDataMessage, setNoDataMessage] = useState<string | null>(null);

  const allColumns = useMemo(() => {
    return data.length > 0 ? Object.keys(data[0]) : [];
  }, [data]);

  useEffect(() => {
    if (data.length > 0) {
      setSelectedColumns(allColumns); // Select all columns initially
      setNoDataMessage(null); // Clear no data message
    } else {
      setSelectedColumns([]);
      setNoDataMessage("No data available to export.");
    }
  }, [allColumns, data]);

  useEffect(() => {
    setIsExportButtonDisabled(selectedColumns.length === 0);
  }, [selectedColumns]);

  const handleExport = async () => {
    if (!data || data.length === 0) {
      return "No data to export.";
    }

    setIsExporting(true);
    try {
      // Filter the data to only include the selected columns
      const filteredData = data.map((item) => {
        const newItem: { [key: string]: any } = {};
        selectedColumns.forEach((col) => {
          if (item.hasOwnProperty(col)) {              
            newItem[col] = item[col];
          }
        });
        return newItem;
      });

      const columns = Object.keys(filteredData[0] || {}); // Use filtered data for column headers

      const csvData = await new Promise<string>((resolve, reject) => {
        stringify(
          filteredData,
          { header: true, columns: columns },
          (err, output) => {
            if (err) {
              reject(err);
            } else {
              resolve(output);
            }
          }
        );
      });

      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      setOpen(false);
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button
                variant="outline"
                className={cn(
                  " border-gray-300 shadow-sm hover:bg-explorer-extra-light-gray flex items-center space-x-1 max-w-fit h-8 p-2 rounded",
                  className
                )}
                disabled={isExporting || data.length === 0} //Disable if exporting or no data
              >
                <Download className="h-4 w-4" />
                <span>{title}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] flex flex-col align-center overflow-auto px-0 pt-10">
              <DialogHeader className="pb-0">
                <div className="px-2">
                  <DialogTitle className="flex pb-1">
                    Select Columns to Export
                  </DialogTitle>
                  <DialogDescription>
                    Choose which columns you want to include in the CSV export.
                  </DialogDescription>
                </div>
                <div className="flex justify-end space-x-2 px-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={isExporting || noDataMessage !== null}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                    disabled={isExporting || noDataMessage !== null}
                  >
                    Deselect All
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
                  ) : (
                    "Export"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TooltipTrigger>
        <TooltipContent className="bg-theme text-text">
          The data will be filtered according to the selected columns
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DataExport;