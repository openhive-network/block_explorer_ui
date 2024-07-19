import { cn } from "@/lib/utils";
import React from "react";

interface ToggleProps {
  leftLabel?: string;
  rightLabel?: string;
  checked: boolean;
  className?: string;
  disabled?: boolean;
  onClick: () => void | undefined;
}

const Toggle: React.FC<ToggleProps> = ({
  leftLabel,
  rightLabel,
  checked,
  className = "",
  disabled,
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
          "w-10 h-5 rounded-3xl border-2 invalid border-white relative",
          {
            "cursor-pointer": !disabled,
            "bg-green-600": checked,
            "bg-transparent": !checked,
            "border-gray-700": disabled && !checked,
            "border-white": !disabled,
          }
        )}
        onClick={!disabled ? onClick : undefined}
      >
        <div
          className={cn(
            "w-3.5 h-3.5 bg-white rounded-full absolute top-px left-px transition duration-300 ease-in-out",
            {
              "translate-x-[20px]": checked,
              "bg-gray-700": disabled && !checked,
              "bg-white": !disabled,
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
