// src/components/LanguageSelector.tsx
import React from "react";
import { EarthIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import CountryFlag from "react-country-flag"; // For flags

const languageOptions = [
  { value: "en", labelKey: "languageSelector.english", flagCode: "US" },
  { value: "es", labelKey: "languageSelector.spanish", flagCode: "ES" },
  { value: "it", labelKey: "languageSelector.italian", flagCode: "IT" },
];

const LanguageSelector = () => {
  const { locale, setLocale, t } = useI18n();

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale);
  };

  return (
    <Select onValueChange={handleLanguageChange} value={locale}>
      <SelectTrigger
        className={cn(
          "bg-navbar hover:bg-navbar-hover rounded-[6px] cursor-pointer text-text",
          "h-[35px] px-2",
          "max-w-[80px]", 
          "flex items-center justify-between gap-1", 
          "focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-navbar" 
        )}
        aria-label={t("languageSelector.selectLanguagePlaceholder")}
      >
        <div className="flex items-center gap-1 overflow-hidden"> 
          <EarthIcon className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
            {locale.toUpperCase()}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languageOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <CountryFlag
                countryCode={option.flagCode}
                svg
                style={{
                  width: "1.25em",
                  height: "1.25em",
                  borderRadius: "2px",
                }}
                aria-label={option.flagCode}
              />
              <span>{t(option.labelKey)}</span>
              <span className="text-explorer-light-gray">({option.value.toUpperCase()})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;