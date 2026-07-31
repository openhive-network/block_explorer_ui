import React, { useState } from "react";
import { Download, ChevronDown, FileText, FileJson } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DataExport from "@/components/DataExport";
import { CompareAccountData } from "@/utils/compare/rowModel";
import { CompareSection } from "@/utils/compare/types";
import {
  buildCompareExportRows,
  buildCompareExportJson,
} from "@/utils/compare/export";

interface CompareExportMenuProps {
  a: CompareAccountData;
  b: CompareAccountData;
  sections: CompareSection[];
  rangeLabel: string;
  locale: string;
  t: (k: string) => string;
}

const fill = (s: string, vars: Record<string, string>) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{${k}}`, v), s);

// Strip characters that are invalid in filenames and collapse whitespace.
const fileSafe = (s: string) =>
  s.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_");

const downloadJson = (obj: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const CompareExportMenu: React.FC<CompareExportMenuProps> = ({
  a,
  b,
  sections,
  rangeLabel,
  locale,
  t,
}) => {
  const [open, setOpen] = useState(false);
  const ctx = { a, b, sections, rangeLabel, locale, t };
  const base = fileSafe(
    fill(t("compare.export.filename"), { a: a.account, b: b.account })
  );
  const rows = buildCompareExportRows(ctx);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Download className="h-3.5 w-3.5" />
          {t("compare.export")}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        <div className="flex flex-col gap-0.5">
          {/* DataExport already renders the interactive (role=button, keyboard)
              wrapper around these children, so this is a plain styled row. */}
          <DataExport data={rows} filename={`${base}.csv`} skipColumnSelection>
            <div
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setOpen(false)}
            >
              <FileText className="h-4 w-4 text-emerald-500" />
              {t("compare.export.csv")}
            </div>
          </DataExport>
          <button
            type="button"
            className="flex items-center gap-2 rounded px-2 py-1.5 text-start text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => {
              downloadJson(buildCompareExportJson(ctx), `${base}.json`);
              setOpen(false);
            }}
          >
            <FileJson className="h-4 w-4 text-amber-500" />
            {t("compare.export.json")}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CompareExportMenu;
