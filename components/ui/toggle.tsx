import { cn } from "@/lib/utils";
import React from "react";

interface ToggleProps {
  leftLabel?: string;
  rightLabel?: string;
  checked: boolean;
  className?: string;
  onClick: () => void;
}

const Toggle: React.FC<ToggleProps> = ({
  leftLabel,
  rightLabel,
  checked,
  className = "",
  onClick,
}) => {
  return (
    <div
      className={cn("flex gap-x-2 items-center", className)}
      data-testid="toggle"
    >
      {leftLabel && <p>{leftLabel}</p>}
      <div
        className={cn(
          "w-10 h-5 cursor-pointer rounded-3xl border-2 border-white relative",
          {
            "bg-green-600": checked,
            "bg-transparent": !checked,
          }
        )}
        onClick={onClick}
      >
        <div
          className={cn(
            "w-3.5 h-3.5 bg-white rounded-full absolute top-px left-px transition duration-300 ease-in-out",
            {
              "translate-x-[20px]": checked,
            }
          )}
        ></div>
      </div>
      {rightLabel && <p>{rightLabel}</p>}
    </div>
  );
};

Toggle.displayName = "Toggle";

export { Toggle };
