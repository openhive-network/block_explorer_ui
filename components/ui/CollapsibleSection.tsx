import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  testId?: string;
}

// Shared so every foldable report section looks identical.
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  className,
  bodyClassName,
  testId,
}) => {
  // Mounted on first open and kept afterwards, so a body that fetches on mount
  // stays cheap until it is asked for, and reopening is instant.
  const [hasOpened, setHasOpened] = useState(isOpen);
  // Sections that restore a collapsed state from storage render open for one
  // commit; without this they would animate shut on every page load.
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) setHasOpened(true);
  }, [isOpen]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <Card className={cn("mb-4", className)} data-testid={testId}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        data-testid={testId ? `${testId}-toggle` : undefined}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start hover:bg-rowHover"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-explorer-light-gray dark:text-gray-300">
          {icon}
          {title}
        </span>
        <ChevronUp
          size={16}
          className={cn("transition-transform duration-300", {
            "rotate-180": !isOpen,
          })}
        />
      </button>

      {/* Grid rows animate to the body's real height, with no guessed max. */}
      <div
        aria-hidden={!isOpen}
        className={cn(
          "grid",
          animate &&
            "transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none",
          isOpen ? "grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          {hasOpened ? (
            <div className={cn("border-t border-theme p-3", bodyClassName)}>
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
};

export default CollapsibleSection;
