import React from "react";
import { cn } from "@/lib/utils";

interface KpiTileProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  valueClassName?: string;
}

const KpiTile: React.FC<KpiTileProps> = ({
  label,
  value,
  sub,
  icon,
  valueClassName,
}) => (
  <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-theme px-3 py-2 shadow-sm">
    <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1 uppercase tracking-wide">
      {icon}
      <span>{label}</span>
    </div>
    <div
      className={cn(
        "text-sm font-semibold leading-tight whitespace-nowrap",
        valueClassName
      )}
    >
      {value}
    </div>
    {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
  </div>
);

export default KpiTile;
