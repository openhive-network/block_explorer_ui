import React from "react";
import { SearchX } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

interface NoResultProps {
  titleKey?: string; // Changed to titleKey
  descriptionKey?: string; // Changed to descriptionKey
  titleDefault?: string; // Optional default if no key is provided
  descriptionDefault?: string; // Optional default if no key is provided
}

const NoResult: React.FC<NoResultProps> = ({
  titleKey,
  descriptionKey,
  titleDefault = "noResult.defaultTitle", // Default key
  descriptionDefault = "noResult.defaultDescription", // Default key
}) => {
  const { t } = useI18n();

  // Use the provided key if available, otherwise use the default key
  const displayTitle = t(titleKey || titleDefault);
  const displayDescription = t(descriptionKey || descriptionDefault);

  return (
    <div className="mt-2 flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-theme p-6 text-center dark:border-slate-700">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-explorer-extra-light-gray ring-1 ring-inset ring-black/5 dark:ring-white/10">
        <SearchX className="h-6 w-6 text-explorer-slate-text" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{displayTitle}</h2>
      <p className="max-w-[46ch] text-sm leading-relaxed text-explorer-slate-text">
        {displayDescription}
      </p>
    </div>
  );
};

export default NoResult;
