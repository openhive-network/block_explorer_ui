import React from "react";
import { Clock } from "lucide-react";
import { CardHeader } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";

interface LiveDataHeaderProps {
  blockchainTime: string;
  liveData: boolean;
  onToggleLiveData: () => void;
  toggleDisabled?: boolean;
  className?: string;
}

const LiveDataHeader: React.FC<LiveDataHeaderProps> = ({
  blockchainTime,
  liveData,
  onToggleLiveData,
  toggleDisabled,
  className,
}) => {
  const { t } = useI18n();

  return (
    <CardHeader
      className={cn(
        "flex flex-row items-center justify-between gap-2 border-b px-4 py-2",
        className
      )}
    >
      <div
        className="flex min-w-0 items-center gap-1.5 text-[11px]"
        title={t("headBlockCard.blockchainTime")}
      >
        <Clock size={14} className="shrink-0" />
        <span className="truncate font-semibold tabular-nums">
          {blockchainTime}
        </span>
      </div>

      <Toggle
        disabled={toggleDisabled}
        checked={liveData}
        onClick={onToggleLiveData}
        className="shrink-0 text-xs"
        leftLabel={t("headBlockCard.liveData")}
      />
    </CardHeader>
  );
};

export default LiveDataHeader;
