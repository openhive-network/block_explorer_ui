import React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedToggleOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}

// Shared home-card segmented control (e.g. % Accounts/% HP, HIVE/HBD/VESTS).
function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-shrink-0 overflow-hidden rounded border border-gray-200 dark:border-gray-700 text-[10px] font-medium",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-2 py-0.5 transition-colors",
              isActive
                ? "bg-indigo-500 text-white"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedToggle;
