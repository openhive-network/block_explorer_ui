import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
  className?: string;
}


export default function SidebarToggleButton({
  isCollapsed,
  onClick,
  className,
}: SidebarToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-40",
        "flex h-24 w-6 items-center justify-center rounded-r-xl",
        "border-y border-r border-slate-300 dark:border-slate-700",
        "bg-slate-100 dark:bg-slate-900",
        "text-slate-500 dark:text-slate-400",
        "transition-all duration-200 ease-in-out",
        "hover:bg-slate-200 dark:hover:bg-slate-800",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900",
        className
      )}
    >
      {isCollapsed ? (
        <ChevronsRight className="h-5 w-5" />
      ) : (
        <ChevronsLeft className="h-5 w-5" />
      )}
    </button>
  );
}