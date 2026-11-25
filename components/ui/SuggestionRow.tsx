import React, { forwardRef, ReactNode } from "react";
import Link from "next/link";
import { CornerDownLeft as Enter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  href: string;
  icon: ReactNode;
  label: ReactNode;
  // Muted text after the label, like "last 7 days".
  hint?: string;
  selected: boolean;
  // Indented under the result it belongs to.
  nested?: boolean;
  onSelect: () => void;
  onHover: () => void;
}

// A click the browser sends to a new tab or window.
const opensElsewhere = (e: React.MouseEvent) =>
  e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0;

// A search-box option that opens a page: a ready-made search under a result,
// or a recent lookup.
const SuggestionRow = forwardRef<HTMLDivElement, Props>(
  (
    { id, href, icon, label, hint, selected, nested, onSelect, onHover },
    ref
  ) => (
    <div
      ref={ref}
      id={id}
      role="option"
      aria-selected={selected}
      onClick={(e) => {
        if (!opensElsewhere(e)) onSelect();
      }}
      onMouseEnter={onHover}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg border-s-2 px-2 py-1 text-sm transition-colors",
        nested && "ms-6",
        selected
          ? "border-s-indigo-500 bg-navbar-listHover"
          : "border-s-transparent hover:bg-navbar-listHover/60"
      )}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-500 dark:text-slate-400">
        {icon}
      </span>
      {/* A real link, so a middle or Ctrl/Cmd click, or "open in new tab",
          still works; a plain click is the row's. */}
      <Link
        href={href}
        onClick={(e) => {
          if (!opensElsewhere(e)) e.preventDefault();
        }}
        className="min-w-0 flex-1 truncate"
        tabIndex={-1}
      >
        {label}
        {hint && (
          <span className="ms-2 text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </span>
        )}
      </Link>
      <Enter
        aria-hidden="true"
        className={cn(
          "hidden h-3.5 w-3.5 shrink-0 transition-opacity md:block",
          selected ? "opacity-60" : "opacity-0"
        )}
      />
    </div>
  )
);

SuggestionRow.displayName = "SuggestionRow";

export default SuggestionRow;
