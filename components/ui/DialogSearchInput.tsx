import React from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";

interface DialogSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

// Rounded search field with a clear button, shared by the list dialogs.
const DialogSearchInput: React.FC<DialogSearchInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
}) => {
  const { t } = useI18n();

  return (
    <div className={cn("relative w-full sm:w-80", className)}>
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="h-9 w-full rounded-full bg-theme pe-9 ps-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t("common.clear")}
          className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-text"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default DialogSearchInput;
