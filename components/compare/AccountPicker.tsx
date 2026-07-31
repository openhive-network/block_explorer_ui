import React, { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import AutoCompleteInput from "@/components/ui/AutoCompleteInput";
import { Button } from "@/components/ui/button";
import { trimAccountName } from "@/utils/StringUtils";

interface AccountPickerProps {
  initialA?: string;
  initialB?: string;
  sameHint?: boolean;
  t: (k: string) => string;
  onCompare: (a: string, b: string) => void;
}

const FieldLabel: React.FC<{ dot: string; children: React.ReactNode }> = ({
  dot,
  children,
}) => (
  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
    <span className={`h-2 w-2 rounded-full ${dot}`} />
    {children}
  </span>
);

// The shared AutoCompleteInput renders a borderless, transparent field (styled
// for the navbar), so wrap it in a proper bordered box with a focus ring.
const Field: React.FC<{
  accent: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}> = ({ accent, value, onChange, placeholder }) => (
  <div
    className={`flex items-center rounded-lg border border-slate-300 bg-theme transition-colors focus-within:border-transparent focus-within:ring-2 dark:border-slate-600 ${accent}`}
  >
    <AutoCompleteInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      inputType="account_name"
      className="w-full"
      inputClassName="focus:!bg-transparent"
    />
  </div>
);

const AccountPicker: React.FC<AccountPickerProps> = ({
  initialA = "",
  initialB = "",
  sameHint,
  t,
  onCompare,
}) => {
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);

  const canCompare =
    !!trimAccountName(a) &&
    !!trimAccountName(b) &&
    trimAccountName(a) !== trimAccountName(b);

  const submit = () => {
    if (canCompare) onCompare(trimAccountName(a), trimAccountName(b));
  };

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-theme p-6 shadow-sm dark:border-slate-700">
      <h2 className="text-center text-lg font-bold text-slate-800 dark:text-slate-100">
        {t("compare.pickerTitle")}
      </h2>
      <p className="mb-5 mt-1 text-center text-sm text-slate-400 dark:text-slate-500">
        {t("compare.pickerSubtitle")}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <FieldLabel dot="bg-red-500">{t("compare.accountA")}</FieldLabel>
          <Field
            accent="focus-within:ring-red-400"
            value={a}
            onChange={setA}
            placeholder={t("compare.accountPlaceholder")}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t("compare.swap")}
          className="flex-shrink-0 self-center sm:mb-1 sm:self-end"
          onClick={() => {
            setA(b);
            setB(a);
          }}
        >
          <ArrowLeftRight className="h-4 w-4 rotate-90 sm:rotate-0" />
        </Button>

        <div className="min-w-0 flex-1">
          <FieldLabel dot="bg-blue-500">{t("compare.accountB")}</FieldLabel>
          <Field
            accent="focus-within:ring-blue-400"
            value={b}
            onChange={setB}
            placeholder={t("compare.accountPlaceholder")}
          />
        </div>
      </div>

      {sameHint && (
        <p className="mt-3 text-center text-xs text-rose-500">
          {t("compare.samePairHint")}
        </p>
      )}

      <Button
        type="button"
        disabled={!canCompare}
        onClick={submit}
        className="mt-5 w-full"
      >
        <ArrowLeftRight className="me-2 h-4 w-4" />
        {t("compare.compareBtn")}
      </Button>
    </div>
  );
};

export default AccountPicker;
