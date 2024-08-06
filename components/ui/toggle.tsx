import { cn } from "@/lib/utils";
import React from "react";

interface ToggleProps {
  leftLabel?: string;
  rightLabel?: string;
  checked: boolean | boolean[];
  className?: string;
  disabled?: boolean;
  onClick: (() => void | undefined) | (() => void | undefined)[];
}

const Toggle: React.FC<ToggleProps> = ({
  leftLabel,
  rightLabel,
  checked,
  className = "",
  disabled,
  onClick,
}) => {
  const isChecked = Array.isArray(checked) ? checked.every(Boolean) : checked;
  const handleClick = () => {
    if (!disabled){
    if (Array.isArray(onClick)) {
      onClick.forEach((fn) => fn && fn());
    } else {
      onClick && onClick();
    }
  }
  };
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
            "bg-green-600": isChecked,
            "bg-transparent": !isChecked,
            "border-gray-700": disabled && !isChecked,
            "border-white": !disabled,
          }
        )}
        onClick={handleClick}
      >
        <div
          className={cn(
            "w-3.5 h-3.5 bg-white rounded-full absolute top-px left-px transition duration-300 ease-in-out",
            {
              "translate-x-[20px]": isChecked,
              "bg-gray-700": disabled && !isChecked,
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
