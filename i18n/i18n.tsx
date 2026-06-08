import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";

// Moment.js locale setup — loads all supported locales once at startup.
// Only affects locale-sensitive formatting (e.g. month names in format("MMM D")).
// Arithmetic methods (subtract, isSame, toDate, etc.) are unaffected.
// Each time a new language is added it should be listed here.
import moment from "moment";
["es", "it", "ar", "zh-cn", "de", "fr", "ja", "ko", "pl", "pt", "ro"].forEach(
  (l) => require(`moment/locale/${l}`)
);
// Keep Western digits (0-9) for Arabic locale so API date strings remain ASCII-safe.
// Without this, moment's `ar` locale postformat replaces digits with Arabic-Indic
// numerals (٠١٢٣٤٥٦٧٨٩), which breaks ISO date parsing in the Hive node WASM.
moment.updateLocale("ar", { postformat: (s: string) => s });
// Maps app locale codes to moment locale codes where they differ
const momentLocaleMap: Record<string, string> = { zh: "zh-cn" };

// Timeago.js Setup - Each Time we add new language it should be imported here
import * as timeago from "timeago.js";
import esTimeagoLocale from "timeago.js/lib/lang/es";
import itTimeagoLocale from "timeago.js/lib/lang/it";
import arTimeagoLocale from "timeago.js/lib/lang/ar";
import zhTimeagoLocale from "timeago.js/lib/lang/zh_CN";
import deTimeagoLocale from "timeago.js/lib/lang/de";
import frTimeagoLocale from "timeago.js/lib/lang/fr";
import jaTimeagoLocale from "timeago.js/lib/lang/ja";
import koTimeagoLocale from "timeago.js/lib/lang/ko";
import plTimeagoLocale from "timeago.js/lib/lang/pl";
import ptTimeagoLocale from "timeago.js/lib/lang/pt_BR";
import roTimeagoLocale from "timeago.js/lib/lang/ro";

let timeagoLocalesHaveBeenRegistered = false;
const registerTimeagoLocalesOnce = () => {
  if (!timeagoLocalesHaveBeenRegistered) {
    timeago.register("es", esTimeagoLocale);
    timeago.register("it", itTimeagoLocale);
    timeago.register("ar", arTimeagoLocale);
    timeago.register("zh", zhTimeagoLocale);
    timeago.register("de", deTimeagoLocale);
    timeago.register("fr", frTimeagoLocale);
    timeago.register("ja", jaTimeagoLocale);
    timeago.register("ko", koTimeagoLocale);
    timeago.register("pl", plTimeagoLocale);
    timeago.register("pt", ptTimeagoLocale);
    timeago.register("ro", roTimeagoLocale);
    timeagoLocalesHaveBeenRegistered = true;
  }
};
export interface Translations {
  [key: string]: string;
}

interface I18nContextProps {
  locale: string;
  setLocale: React.Dispatch<React.SetStateAction<string>>;
  translations: Translations;
  t: (key: string, options?: any) => string;
  dir: "ltr" | "rtl";
}

// Import Translations - Each Time we add new language it should be imported here
import enTranslations from "./en.json";
import esTranslations from "./es.json";
import itTranslations from "./it.json";
import deTranslations from "./de.json";
import ptTranslations from "./pt.json";
import frTranslations from "./fr.json";
import plTranslations from "./pl.json";
import zhTranslations from "./zh.json";
import jaTranslations from "./ja.json";
import roTranslations from "./ro.json";
import koTranslations from "./ko.json";
import arTranslations from "./ar.json";

const appTranslations: { [key: string]: Translations } = {
  ar: arTranslations,
  en: enTranslations,
  es: esTranslations,
  it: itTranslations,
  de: deTranslations,
  pt: ptTranslations,
  fr: frTranslations,
  pl: plTranslations,
  zh: zhTranslations,
  ja: jaTranslations,
  ro: roTranslations,
  ko: koTranslations,
};

const rtlLanguages = ["ar"];
const getBaseLocale = (locale: string) => locale.split("-")[0];
const isRTL = (locale: string) => rtlLanguages.includes(getBaseLocale(locale));

const getInitialLocale = (defaultLocale: string): string => {
  if (typeof window !== "undefined" && window.localStorage) {
    const savedLocale = localStorage.getItem("locale");
    if (savedLocale && appTranslations[savedLocale]) {
      return savedLocale;
    }
  }
  return defaultLocale;
};

const defaultContext: I18nContextProps = {
  locale: "en",
  setLocale: () => {},
  translations: enTranslations,
  t: (key: string) => key,
  dir: "ltr",
};

const I18nContext = createContext<I18nContextProps>(defaultContext);
export const useI18n = () => useContext(I18nContext);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: string;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  initialLocale = "en",
}) => {
  const [currentLocale, setCurrentLocale] = useState<string>(() =>
    getInitialLocale(initialLocale)
  );

  moment.locale(momentLocaleMap[currentLocale] ?? currentLocale);

  useEffect(() => {
    registerTimeagoLocalesOnce(); // For timeago-react
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = currentLocale;
    html.setAttribute("dir", isRTL(currentLocale) ? "rtl" : "ltr");
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("locale", currentLocale);
    }
    moment.locale(momentLocaleMap[currentLocale] ?? currentLocale);
  }, [currentLocale]);

  // This effect listens for changes in localStorage from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "locale" && event.newValue) {
        setCurrentLocale(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  const t = useCallback(
    (key: string, options?: any) => {
      const currentTranslationSet =
        appTranslations[currentLocale] || appTranslations["en"];
      let translation = currentTranslationSet[key] || key;
      if (options && typeof translation === "string") {
        Object.keys(options).forEach((optKey) => {
          const regex = new RegExp(`{{${optKey}}}`, "g");
          translation = translation.replace(regex, options[optKey]);
        });
      }
      return translation;
    },
    [currentLocale]
  );

  const contextValue = useMemo(
    () => ({
      locale: currentLocale,
      setLocale: setCurrentLocale,
      translations: appTranslations[currentLocale] || appTranslations["en"],
      t,
      dir: isRTL(currentLocale) ? ("rtl" as const) : ("ltr" as const),
    }),
    [currentLocale, t]
  );

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
};
