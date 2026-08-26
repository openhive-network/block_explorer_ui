import React, { useId, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import pageTitlesInfo from "@/utils/PageTitlesInfo";
import { useI18n } from "@/i18n/i18n";

interface TitleProps {
  titleKey: string;
  className?: string;
  // Plain title, for cards that set their own alignment: no rule, no inset.
  classic?: boolean;
}

const PageTitle: React.FC<TitleProps> = ({
  titleKey,
  className = "",
  classic = false,
}) => {
  const { t, locale } = useI18n();
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const panelId = useId();

  const localizedInfoObject = pageTitlesInfo[titleKey];
  const InfoComponentContent =
    localizedInfoObject?.[locale as keyof typeof localizedInfoObject] ||
    localizedInfoObject?.en ||
    null;

  const toggleInfoVisibility = () => {
    setIsInfoVisible(!isInfoVisible);
  };

  return (
    // The inset is applied after className so every page's title lines up.
    <div
      className={cn(
        "w-full rounded-[8px] bg-theme",
        className,
        !classic && "px-6"
      )}
    >
      <div className="flex items-center gap-2">
        <h1
          className={cn(
            "min-w-0 font-bold leading-tight tracking-[-0.02em] text-gray-900 dark:text-white",
            classic ? "text-xl" : "text-xl sm:text-2xl"
          )}
        >
          {t(titleKey)}
        </h1>
        {InfoComponentContent && (
          <button
            type="button"
            aria-label={t("pageTitle.informationAboutTitle")}
            aria-expanded={isInfoVisible}
            aria-controls={panelId}
            onClick={toggleInfoVisibility}
            className="shrink-0 rounded-full text-gray-600 transition-colors hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-gray-400 dark:hover:text-link"
          >
            <Info size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {!classic && (
        <div className="page-title-rule mt-2 h-1 w-16 rounded-full bg-link" />
      )}

      {InfoComponentContent && (
        // Grid rows animate to the panel's real height, with no guessed max.
        <div
          id={panelId}
          aria-hidden={!isInfoVisible}
          className={cn(
            "grid transition-all duration-300 ease-out motion-reduce:transition-none",
            isInfoVisible
              ? "mt-3 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-sm leading-relaxed text-gray-700 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300">
              {InfoComponentContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageTitle;
