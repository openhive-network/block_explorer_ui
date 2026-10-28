import React from "react";
import { EarthIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

// Each language is listed in its own script, so it can be found from any UI language.
const languageOptions = [
  { value: "ar", nativeName: "العربية", labelKey: "languageSelector.arabic" },
  { value: "zh", nativeName: "中文", labelKey: "languageSelector.chinese" },
  { value: "de", nativeName: "Deutsch", labelKey: "languageSelector.german" },
  { value: "en", nativeName: "English", labelKey: "languageSelector.english" },
  { value: "es", nativeName: "Español", labelKey: "languageSelector.spanish" },
  { value: "fr", nativeName: "Français", labelKey: "languageSelector.french" },
  { value: "it", nativeName: "Italiano", labelKey: "languageSelector.italian" },
  { value: "ja", nativeName: "日本語", labelKey: "languageSelector.japanese" },
  { value: "pl", nativeName: "Polski", labelKey: "languageSelector.polish" },
  {
    value: "pt",
    nativeName: "Português",
    labelKey: "languageSelector.portuguese",
  },
  { value: "ro", nativeName: "Română", labelKey: "languageSelector.romanian" },
];

const LanguageSelector = () => {
  const { locale, setLocale, t, dir } = useI18n();
  const isRTL = dir === "rtl";

  return (
    <Select onValueChange={setLocale} value={locale} dir={dir}>
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
          <EarthIcon className="h-5 w-5 shrink-0" />
          <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
            {locale.toUpperCase()}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="min-w-[260px] p-1">
        {languageOptions.map((option) => {
          const active = option.value === locale;
          const translated = t(option.labelKey);
          return (
            <SelectItem
              key={option.value}
              value={option.value}
              className={cn(
                "rounded-md px-2 py-1.5 [&>span:last-child]:w-full",
                active && "bg-indigo-50 dark:bg-indigo-950/40"
              )}
            >
              <div className="flex w-full items-center gap-2.5">
                <span
                  className={cn(
                    "inline-flex h-6 w-8 shrink-0 items-center justify-center rounded text-[11px] font-bold tracking-wide",
                    active
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {option.value.toUpperCase()}
                </span>
                <span
                  lang={option.value}
                  dir="auto"
                  className={cn(active && "font-semibold")}
                >
                  {option.nativeName}
                </span>
                {translated !== option.nativeName && (
                  <span className="ms-auto ps-3 text-xs text-explorer-light-gray">
                    {translated}
                  </span>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
