import React from "react";
import { Link as LinkIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import { useI18n } from "@/i18n/i18n";
import { resolveLinkTarget } from "@/utils/SafeUrl";

interface WitnessUrlIconProps {
  url: string;
  size?: number;
  strokeWidth?: number;
}

// A witness types this value freely: only a real web address or an in-app
// path is clickable; anything else keeps the icon but goes nowhere, with the
// typed value in its tooltip.
const WitnessUrlIcon: React.FC<WitnessUrlIconProps> = ({
  url,
  size = 14,
  strokeWidth = 2.5,
}) => {
  const { t } = useI18n();
  const href = resolveLinkTarget(url);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("accountMainCard.witnessLink")}
            >
              <LinkIcon size={size} strokeWidth={strokeWidth} />
            </a>
          ) : (
            <span tabIndex={0} aria-label={url} className="cursor-default">
              <LinkIcon size={size} strokeWidth={strokeWidth} />
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {href ? (
            <p>{t("accountMainCard.witnessLink")}</p>
          ) : (
            <p dir="auto" className="max-w-xs break-words">
              {url}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WitnessUrlIcon;
