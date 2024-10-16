import React from "react";
import { X } from "lucide-react";

interface ChipProps {
  text: string;
  clearSelection: () => void;
  className?: string;
}

const Chip: React.FC<ChipProps> = ({ text, clearSelection, className }) => {
  return (
    <div
      className={`${className} flex justify-center items-center text-text bg-buttonBg rounded-3xl py-1 px-2 text-xs ml-2`}
    >
      {text}
      <span
        className="cursor-pointer ml-2"
        onClick={clearSelection}
      >
        <X
          strokeWidth={3}
          width={15}
        />
      </span>
    </div>
  );
};

export default Chip;
