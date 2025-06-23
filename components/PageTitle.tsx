import React, { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import pageTitlesInfo from "@/utils/PageTitlesInfo";
import { useI18n } from "@/i18n/i18n";

interface TitleProps {
  titleKey: string;
  className?: string;
}

const PageTitle: React.FC<TitleProps> = ({ titleKey, className = "" }) => {
  const { t, locale } = useI18n(); // Get current locale
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const localizedInfoObject = pageTitlesInfo[titleKey];
  // Select the ReactNode based on the current locale, fallback to 'en'
  const InfoComponentContent = localizedInfoObject?.[locale as keyof typeof localizedInfoObject] || localizedInfoObject?.en || null;


  const toggleInfoVisibility = () => {
    setIsInfoVisible(!isInfoVisible);
  };

  return (
    <div className="md:flex md:items-start md:justify-start flex-col md:flex-row w-full items-start justify-start bg-theme">
      <div className="flex items-center ">
        <h1
          className={`text-xl min-h-16 font-bold leading-tight ${className} mr-2 min-w-max`}
        >
          {t(titleKey)} {/* Main title is still translated via JSON */}
        </h1>
        {InfoComponentContent && (
          <div className="h-9 align-top">
            <button
              aria-label={t("pageTitle.informationAboutTitle")}
              onClick={toggleInfoVisibility}
            >
              <Info color="red" size={18} className="cursor-pointer" />
            </button>
          </div>
        )}
      </div>
      {InfoComponentContent && (
        <div
          className={`ml-4 mt-2 text-gray-700 dark:text-gray-300 transition-all duration-300 ease-in-out overflow-auto shadow-md mb-2 rounded-lg  ${
            isInfoVisible ? "opacity-100 max-h-screen p-4" : "opacity-0 max-h-0"
          }`}
        >
          {InfoComponentContent} {/* Render the selected localized content */}
        </div>
      )}
    </div>
  );
};

export default PageTitle;