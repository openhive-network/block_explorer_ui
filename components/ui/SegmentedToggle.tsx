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
  size?: "sm" | "md";
  // "pill" is the rounded, bordered style used on the account cards.
  variant?: "classic" | "pill";
}

// Shared home-card segmented control (e.g. % Accounts/% HP, HIVE/HBD/VESTS).
function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  size = "sm",
  variant = "classic",
}: SegmentedToggleProps<T>) {
  const isPill = variant === "pill";
  const textClass =
    size === "md" ? "text-sm" : isPill ? "text-xs" : "text-[10px]";
  const paddingClass =
    size === "md" ? "px-3.5 py-1.5" : isPill ? "px-2.5 py-1" : "px-2 py-0.5";
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-shrink-0 overflow-hidden font-medium",
        isPill
          ? "items-stretch rounded-full border border-navbar-border"
          : "rounded border border-gray-200 dark:border-gray-700",
        textClass,
        className
      )}
    >
      {options.map((opt, idx) => {
        const isActive = opt.value === value;
        const isFirst = idx === 0;
        const isLast = idx === options.length - 1;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "transition-colors",
              paddingClass,
              isPill &&
                cn(
                  isFirst && "rounded-s-full",
                  isLast && "rounded-e-full",
                  !isLast && "border-e border-navbar-border"
                ),
              isActive
                ? "bg-indigo-500 text-white"
                : isPill
                  ? "bg-theme hover:bg-gray-100 dark:hover:bg-gray-700"
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
