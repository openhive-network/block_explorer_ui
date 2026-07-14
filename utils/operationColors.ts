import { getOperationColor } from "@/components/OperationsTable";

// Shared operation-type color helpers. Reads the actual CSS variable value at
// runtime so theme.css stays the single source of truth
// ("bg-explorer-operations-posting" -> "--color-operation-posting"). "Other" is
// our synthetic bucket, mapped to the "other" category directly.
export function getOpHexColor(opName: string): string {
  if (typeof window === "undefined") return "#6b7280";
  const cls =
    opName === "Other"
      ? "bg-explorer-operations-other"
      : getOperationColor(opName);
  if (!cls) return "#6b7280";
  const cssVar = `--color-${cls.replace("bg-explorer-", "").replace("operations-", "operation-")}`;
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim() || "#6b7280"
  );
}

export function getOpColorClass(opName: string): string {
  return opName === "Other"
    ? "bg-explorer-operations-other"
    : (getOperationColor(opName) ?? "bg-gray-400");
}

// Picks black or white text for legibility on a given hex background.
export function getContrastText(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#ffffff";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111827" : "#ffffff";
}
