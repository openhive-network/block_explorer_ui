import { grabNumericValue } from "@/utils/StringUtils";

interface Budget {
  key: string;
  label: string;
  value: string;
}
type BudgetsSectionProps = { budgets: Budget[] };

export const BudgetsSection = ({ budgets }: BudgetsSectionProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-[8px] border bg-white p-4 dark:border-slate-800 dark:bg-theme">
      <ul className="flex max-w-full gap-2 flex-wrap justify-center">
        {budgets.map(({ key, label, value }) => {
          const isEmptyValue = !grabNumericValue(value);
          if (!isEmptyValue) {
            return (
              <li
                className="min-w-fit p-2 text-center"
                key={key}
              >
                <div className="rounded-[8px] bg-slate-100 p-2 font-semibold dark:bg-slate-800 dark:text-slate-200">
                  {value}
                </div>
                <small className="text-slate-500 dark:text-slate-400">
                  {label}
                </small>
              </li>
            );
          } else return null;
        })}
      </ul>
    </div>
  );
};
