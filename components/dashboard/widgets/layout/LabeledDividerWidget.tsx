import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";

interface LabeledDividerWidgetProps {
  initialLabel?: string;
  isEditMode: boolean;
  onLabelChange: (v: string) => void;
}

const LabeledDividerWidget: React.FC<LabeledDividerWidgetProps> = ({
  initialLabel,
  isEditMode,
  onLabelChange,
}) => {
  const { t } = useI18n();
  const [label, setLabel] = useState(initialLabel ?? "");

  useEffect(() => setLabel(initialLabel ?? ""), [initialLabel]);

  const line = (
    <hr className="flex-grow border-gray-300 dark:border-slate-700" />
  );

  if (isEditMode) {
    return (
      <div className="h-full w-full flex items-center gap-3 px-1">
        {line}
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => onLabelChange(label)}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder={t("labeledDividerWidget.placeholder")}
          className="w-32 rounded border bg-white dark:bg-gray-700 px-2 py-0.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-white outline-none"
        />
        {line}
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center gap-3 px-1">
      {line}
      <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label || t("labeledDividerWidget.defaultText")}
      </span>
      {line}
    </div>
  );
};

export default LabeledDividerWidget;
