import React from "react";
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
}) => (
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

    {isOpen ? (
      <div className={cn("border-t border-theme p-3", bodyClassName)}>
        {children}
      </div>
    ) : null}
  </Card>
);

export default CollapsibleSection;
