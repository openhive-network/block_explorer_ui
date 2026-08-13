import React from "react";
import { cn } from "@/lib/utils";
import { GuestAccent } from "./GuestBoardHeader";
import { resolveAccent } from "@/components/dashboard/lib/accents";

interface GuestSectionTitleProps {
  label: string;
  hint?: string;
  accent: GuestAccent;
}

const GuestSectionTitle: React.FC<GuestSectionTitleProps> = ({
  label,
  hint,
  accent,
}) => (
  <div className="mb-2 flex w-full items-stretch gap-2.5 px-1 py-1.5">
    <span
      className={cn("w-1 shrink-0 rounded-full", resolveAccent(accent).spine)}
      aria-hidden="true"
    />
    <div className="flex min-w-0 flex-1 flex-col justify-center">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.16em]",
            resolveAccent(accent).text
          )}
        >
          {label}
        </span>
        <hr className="flex-grow border-gray-200 dark:border-slate-700/70" />
      </div>
      {hint && (
        <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  </div>
);

export default GuestSectionTitle;
