import React from "react";
import { cn } from "@/lib/utils";

interface LetterSectionProps {
  letter: string;
  gridClassName?: string;
  children: React.ReactNode;
}

// One alphabetical block of a directory-style list: the letter, a divider, and
// the entries in a responsive grid.
const LetterSection: React.FC<LetterSectionProps> = ({
  letter,
  gridClassName = "grid-cols-[repeat(auto-fill,minmax(180px,1fr))]",
  children,
}) => (
  <section className="mb-3">
    <div className="mb-1 flex items-center gap-3">
      <span className="w-4 text-sm font-semibold uppercase text-indigo-500">
        {letter}
      </span>
      <span className="h-px flex-1 bg-navbar-border" />
    </div>
    <div className={cn("grid gap-x-2", gridClassName)}>{children}</div>
  </section>
);

export default LetterSection;
