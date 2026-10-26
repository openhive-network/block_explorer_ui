import { stringify } from "csv-stringify";

import { escapeCsvFormula } from "@/utils/StringUtils";

// Builds the CSV the way DataExport does (formula-safe cells, BOM for Excel)
// and hands it to the browser as a download.
export const downloadCsv = async (
  filename: string,
  rows: Record<string, unknown>[],
  columns: string[],
  signal?: AbortSignal
) => {
  const csv = await new Promise<string>((resolve, reject) => {
    stringify(
      rows,
      { header: true, columns, cast: { string: escapeCsvFormula } },
      (err, output) => (err ? reject(err) : resolve(output))
    );
  });
  if (signal?.aborted) return;
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
