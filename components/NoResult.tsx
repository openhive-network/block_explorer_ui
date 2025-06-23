import React from "react";
import { Search } from "lucide-react";
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
  descriptionDefault = "noResult.defaultDescription" // Default key
}) => {
  const { t } = useI18n();

  // Use the provided key if available, otherwise use the default key
  const displayTitle = t(titleKey || titleDefault);
  const displayDescription = t(descriptionKey || descriptionDefault);

  return (
    <div className="mt-2 flex flex-col items-center justify-center bg-theme p-6 w-full text-center space-y-3 rounded">
      <div className="flex items-center justify-center w-12 h-12 bg-explorer-bg-start rounded-full">
        <Search className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-semibold">
        {displayTitle}
      </h2>
      <p className="text-sm">{displayDescription}</p>
    </div>
  );
};

export default NoResult;