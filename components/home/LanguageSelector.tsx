// src/components/LanguageSelector.tsx
import React from "react";
import { EarthIcon } from "lucide-react"; // Removed ChevronDown as it's handled by the Select component
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, // Import SelectValue to show the selected item
} from "@/components/ui/select";
import CountryFlag from "react-country-flag";

const languageOptions = [
  { value: "ar", labelKey: "languageSelector.arabic", flagCode: "SA" },
  { value: "zh", labelKey: "languageSelector.chinese", flagCode: "CN" },
  { value: "de", labelKey: "languageSelector.german", flagCode: "DE" },
  { value: "en", labelKey: "languageSelector.english", flagCode: "US" },
  { value: "es", labelKey: "languageSelector.spanish", flagCode: "ES" },
  { value: "fr", labelKey: "languageSelector.french", flagCode: "FR" },
  { value: "it", labelKey: "languageSelector.italian", flagCode: "IT" },
  { value: "ja", labelKey: "languageSelector.japanese", flagCode: "JP" },
  { value: "ko", labelKey: "languageSelector.korean", flagCode: "KR" },
  { value: "pl", labelKey: "languageSelector.polish", flagCode: "PL" },
  { value: "pt", labelKey: "languageSelector.portuguese", flagCode: "BR" },
  { value: "ro", labelKey: "languageSelector.romanian", flagCode: "RO" },
];

const LanguageSelector = () => {
  const { locale, setLocale, t, dir } = useI18n();
  const isRTL = dir === "rtl";

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale);
  };

  return (
    <Select onValueChange={handleLanguageChange} value={locale} dir={dir}>
      <SelectTrigger
        className={cn(
          "bg-navbar hover:bg-navbar-hover rounded-[6px] cursor-pointer text-text",
          "h-[35px] px-2",
          "w-auto min-w-[80px]",
          "flex items-center justify-between gap-1", 
          "focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-navbar" 
        )}
        aria-label={t("languageSelector.selectLanguagePlaceholder")}
      >
        <div 
          className={cn(
            "flex items-center gap-1 overflow-hidden",
            isRTL && "flex-row-reverse"
          )}
        > 
          <EarthIcon className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
            {locale.toUpperCase()}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languageOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div 
              className={cn(
                "flex items-center gap-2 w-full",
                isRTL && "flex-row-reverse justify-end"
              )}
            >
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
              <span className="flex-grow">{t(option.labelKey)}</span>
              <span className="text-explorer-light-gray">({option.value.toUpperCase()})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;