import React from "react";
import { Check, History, Pencil, Plus, RotateCcw, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TFunction = (key: string) => string;

interface DashboardControlsProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onAddWidget: () => void;
  onResetLayout: () => void;
  /** A board replaced by "set as my board" is still recoverable on this device. */
  hasBoardUndo?: boolean;
  onRestorePreviousBoard?: () => void;
  /** A workspace pulled from the chain is reversible for the rest of the session. */
  hasRestoreUndo?: boolean;
  onUndoRestore?: () => void;
  /** Editing is desktop-only, but undoing an adoption is not. */
  showEditControls?: boolean;
  t: TFunction;
}

const DashboardControls: React.FC<DashboardControlsProps> = ({
  isEditMode,
  onToggleEditMode,
  onAddWidget,
  onResetLayout,
  hasBoardUndo,
  onRestorePreviousBoard,
  hasRestoreUndo,
  onUndoRestore,
  showEditControls = true,
  t,
}) => {
  return (
    // :focus-visible, not focus-within — a mouse click leaves the button
    // focused and held the cluster solid long afterwards.
    // "end-4" rather than "right-4" so it follows the board in Arabic.
    <div
      className={cn(
        "fixed top-[19rem] end-4 z-50 flex flex-col items-center gap-2",
        "transition-opacity duration-200 motion-reduce:transition-none",
        // A pending undo is easy to miss, so the cluster stays solid.
        isEditMode || hasBoardUndo || hasRestoreUndo
          ? "opacity-100"
          : "opacity-35 hover:opacity-100 has-[:focus-visible]:opacity-100"
      )}
    >
      {showEditControls && (
        <button
          onClick={onToggleEditMode}
          data-testid="dashboard-edit-toggle"
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
      )}

      {/* Outside edit mode: recovery must not require finding edit mode. */}
      {hasBoardUndo && onRestorePreviousBoard && (
        <button
          onClick={onRestorePreviousBoard}
          data-testid="dashboard-undo-board"
          title={t("boards.adopt.restorePrevious")}
          aria-label={t("boards.adopt.restorePrevious")}
          className="p-3 rounded-full bg-gray-600 text-white shadow-lg hover:bg-gray-700 transition-colors"
        >
          <Undo2 size={20} />
        </button>
      )}

      {/* Indigo, and its own glyph: two grey undo arrows would be a coin toss. */}
      {hasRestoreUndo && onUndoRestore && (
        <button
          onClick={onUndoRestore}
          title={t("workspaceSync.undoRestoreButton")}
          aria-label={t("workspaceSync.undoRestoreButton")}
          className="p-3 rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 transition-colors"
        >
          <History size={20} />
        </button>
      )}

      {showEditControls && isEditMode && (
        <>
          <button
            onClick={onAddWidget}
            data-testid="dashboard-add-widget"
            title={t("dashbord.addWidget")}
            className="p-3 rounded-full bg-gray-600 text-white shadow-lg hover:bg-gray-700 transition-colors"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={onResetLayout}
            data-testid="dashboard-reset-layout"
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
