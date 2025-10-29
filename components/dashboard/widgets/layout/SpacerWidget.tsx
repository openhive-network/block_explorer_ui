import React from "react";

interface SpacerWidgetProps {
  isEditMode?: boolean;
}

const SpacerWidget: React.FC<SpacerWidgetProps> = ({ isEditMode }) => {
  return (
    <div
      className={`h-full w-full transition-colors duration-200 ${
        isEditMode
          ? "bg-slate-200 dark:bg-slate-800/50 rounded-lg"
          : "bg-transparent"
      }`}
    />
  );
};

export default SpacerWidget;