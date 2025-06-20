import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";

// Timeago.js Setup - Each Time we add new language it should be imported here
import * as timeago from "timeago.js";
import esTimeagoLocale from "timeago.js/lib/lang/es";
import itTimeagoLocale from "timeago.js/lib/lang/it";

let timeagoLocalesHaveBeenRegistered = false;
const registerTimeagoLocalesOnce = () => {
  if (!timeagoLocalesHaveBeenRegistered) {
    timeago.register("es", esTimeagoLocale);
    timeago.register("it", itTimeagoLocale);
    timeagoLocalesHaveBeenRegistered = true;
  }
};

// Moment.js Setup - Each Time we add new language it should be imported here
import moment from "moment";
import "moment/locale/es"; // For Spanish
import "moment/locale/it"; // For Italian

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

const appTranslations: { [key: string]: Translations } = {
  en: enTranslations,
  es: esTranslations,
  it: itTranslations,
};

const rtlLanguages = ["ar", "he", "fa", "ur"];
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

    let momentLocaleToSet = currentLocale.toLowerCase();
    moment.locale(momentLocaleToSet);
  }, [currentLocale]); // This effect runs when currentLocale changes

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
