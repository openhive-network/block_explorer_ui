import React from "react";
import { LogIn, LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { requestLogin } from "@/utils/loginPrompt";

export type SignInPromptVariant =
  | "pill"
  | "compact"
  | "button"
  | "icon"
  | "toolbar";

interface SignInPromptButtonProps {
  // The signed-in control's own icon and label, so guests see the real action
  // rather than a gap where it would be.
  icon: LucideIcon;
  // Ignored by the icon-only shapes, which have no room for it.
  label?: string;
  signInLabel: string;
  tooltip: string;
  variant?: SignInPromptVariant;
  // Supplied by the host so the resting state matches its real button exactly.
  colorClassName?: string;
}

const SHAPES: Record<SignInPromptVariant, { shell: string; icon: string }> = {
  pill: {
    shell:
      "px-3 py-1 rounded-full text-xs font-semibold border active:scale-95",
    icon: "h-3.5 w-3.5",
  },
  compact: { shell: "h-7 w-7 rounded", icon: "h-3.5 w-3.5" },
  button: {
    shell: "h-9 rounded-lg border-2 px-3 text-sm font-semibold",
    icon: "h-4 w-4",
  },
  icon: { shell: "h-9 w-9 rounded-lg border-2", icon: "h-5 w-5" },
  // Sits inside a segmented control, so it carries no border of its own.
  toolbar: {
    shell: "rounded-md px-3 py-1.5 text-sm font-semibold",
    icon: "h-4 w-4",
  },
};

// Vertical travel keeps the swap identical under RTL.
const LAYER =
  "col-start-1 row-start-1 flex items-center justify-center gap-1.5 transition-all duration-200 ease-out motion-reduce:transition-none";

const SignInPromptButton: React.FC<SignInPromptButtonProps> = ({
  icon: Icon,
  label,
  signInLabel,
  tooltip,
  variant = "compact",
  colorClassName,
}) => {
  const shape = SHAPES[variant];
  const showLabel = variant !== "compact" && variant !== "icon";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <button
              type="button"
              onClick={requestLogin}
              aria-label={tooltip}
              className={cn(
                "group relative inline-flex items-center justify-center overflow-hidden transition-all duration-200",
                shape.shell,
                colorClassName
              )}
            >
              {/* Both states share one grid cell, so the button never resizes. */}
              <span className="grid place-items-center">
                <span
                  className={cn(
                    LAYER,
                    "group-hover:-translate-y-5 group-hover:opacity-0"
                  )}
                >
                  <Icon className={cn("flex-shrink-0", shape.icon)} />
                  {showLabel && <span>{label}</span>}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    LAYER,
                    "translate-y-5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  )}
                >
                  <LogIn className={cn("flex-shrink-0", shape.icon)} />
                  {showLabel && <span>{signInLabel}</span>}
                </span>
              </span>
            </button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[220px] text-center">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SignInPromptButton;
