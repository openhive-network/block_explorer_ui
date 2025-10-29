import React from "react";
import { Check, Pencil, Plus, RotateCcw } from "lucide-react";

type TFunction = (key: string) => string;

interface DashboardControlsProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onAddWidget: () => void;
  onResetLayout: () => void;
  t: TFunction;
}

const DashboardControls: React.FC<DashboardControlsProps> = ({
  isEditMode,
  onToggleEditMode,
  onAddWidget,
  onResetLayout,
  t,
}) => {
  return (
    <div className="fixed top-18 right-4 z-50 flex flex-col items-center gap-2">
      <button
        onClick={onToggleEditMode}
        title={
          isEditMode ? t("dashbord.doneEditing") : t("dashbord.editLayout")
        }
        className={`data-box shadow-lg transition-colors ${
          isEditMode
            ? "bg-green-500 hover:bg-green-600"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isEditMode ? <Check size={20} /> : <Pencil size={20} />}
      </button>
      {isEditMode && (
        <>
          <button
            onClick={onAddWidget}
            title={t("dashbord.addWidget")}
            className="p-3 rounded-full bg-gray-600 text-white shadow-lg hover:bg-gray-700 transition-colors"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={onResetLayout}
            title={t("dashbord.restoreDefault")}
            className="p-3 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </>
      )}
    </div>
  );
};

export default DashboardControls;
