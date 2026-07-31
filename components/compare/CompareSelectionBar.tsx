import React from "react";
import { useRouter } from "next/router";
import { X, ArrowLeftRight } from "lucide-react";
import { CompareSelection } from "@/hooks/common/useCompareSelection";

interface CompareSelectionBarProps {
  selection: CompareSelection;
  t: (k: string) => string;
}

// Floating action bar shown while the user is picking a compare pair from a list.
// Appears once one account is selected; the Compare button activates at two.
const CompareSelectionBar: React.FC<CompareSelectionBarProps> = ({
  selection,
  t,
}) => {
  const router = useRouter();
  const { selected, remove, clear } = selection;
  if (selected.length === 0) return null;

  const ready = selected.length === 2;
  const go = () => {
    if (ready) router.push(`/tools/compare?a=${selected[0]}&b=${selected[1]}`);
  };

  // The end-padding keeps the pill clear of the floating scroll-to-top button.
  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center ps-3 pe-16 sm:pe-3">
      <div className="flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-theme px-3 py-2 shadow-lg dark:border-slate-700">
        <span className="hidden flex-shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400 sm:inline">
          {t("compare.select.title")}
        </span>
        <div className="flex min-w-0 items-center gap-1.5">
          {selected.map((acc) => (
            <span
              key={acc}
              className="inline-flex min-w-0 items-center gap-1 rounded-full bg-slate-100 py-1 pe-1 ps-2.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span className="max-w-[80px] truncate sm:max-w-[140px]">
                @{acc}
              </span>
              <button
                type="button"
                onClick={() => remove(acc)}
                aria-label={t("compare.select.remove")}
                className="flex-shrink-0 rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selected.length === 1 && (
            <span className="text-xs italic text-slate-400 dark:text-slate-500">
              {t("compare.select.pickOneMore")}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={go}
          disabled={!ready}
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          {t("compare.entry.button")}
        </button>
        <button
          type="button"
          onClick={clear}
          aria-label={t("compare.select.clear")}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CompareSelectionBar;
