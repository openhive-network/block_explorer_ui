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

// Static by necessity: defaultContext reads it at module-eval and t() falls back
// to it for every missing key.
import enTranslations from "./en.json";

// Fetched on demand, one chunk each, so a visitor downloads one language not 12.
const localeLoaders: Record<string, () => Promise<{ default: Translations }>> =
  {
    ar: () => import("./ar.json"),
    es: () => import("./es.json"),
    it: () => import("./it.json"),
    de: () => import("./de.json"),
    pt: () => import("./pt.json"),
    fr: () => import("./fr.json"),
    pl: () => import("./pl.json"),
    zh: () => import("./zh.json"),
    ja: () => import("./ja.json"),
    ro: () => import("./ro.json"),
    ko: () => import("./ko.json"),
  };

// Static: appTranslations only holds what has loaded, so it cannot validate.
export const SUPPORTED_LOCALES = ["en", ...Object.keys(localeLoaders)];

// Filled in as locales arrive; en is always present so no key renders raw.
const appTranslations: { [key: string]: Translations } = {
  en: enTranslations,
};

const rtlLanguages = ["ar"];
const getBaseLocale = (locale: string) => locale.split("-")[0];
const isRTL = (locale: string) => rtlLanguages.includes(getBaseLocale(locale));

const getInitialLocale = (defaultLocale: string): string => {
  if (typeof window !== "undefined" && window.localStorage) {
    const savedLocale = localStorage.getItem("locale");
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
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
  // Re-render once a dictionary lands; t() stays synchronous.
  const [loadedTick, setLoadedTick] = useState(0);

  useEffect(() => {
    if (appTranslations[currentLocale]) return;
    const loader = localeLoaders[currentLocale];
    if (!loader) return;

    // Ignore a resolution the user has already switched away from.
    let active = true;
    loader()
      .then((mod) => {
        appTranslations[currentLocale] = mod.default;
        if (active) setLoadedTick((n) => n + 1);
      })
      .catch(() => {
        // English fallback already covers a failed fetch.
      });

    return () => {
      active = false;
    };
  }, [currentLocale]);

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
      let translation =
        currentTranslationSet[key] || appTranslations["en"][key] || key;
      if (options && typeof translation === "string") {
        Object.keys(options).forEach((optKey) => {
          const regex = new RegExp(`{{${optKey}}}`, "g");
          translation = translation.replace(regex, options[optKey]);
        });
      }
      return translation;
    },
    // loadedTick: the dict is swapped in outside React.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLocale, loadedTick]
  );

  const contextValue = useMemo(
    () => ({
      locale: currentLocale,
      setLocale: setCurrentLocale,
      translations: appTranslations[currentLocale] || appTranslations["en"],
      t,
      dir: isRTL(currentLocale) ? ("rtl" as const) : ("ltr" as const),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLocale, t, loadedTick]
  );

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
};
