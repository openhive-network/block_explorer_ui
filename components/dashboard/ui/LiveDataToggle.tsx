import React from "react";
import { useI18n } from "@/i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import { Toggle } from "@/components/ui/toggle";
import { config } from "@/Config";
import useBlockchainSyncInfo from "@/hooks/common/useBlockchainSyncInfo";
import { getBlockDifference } from "@/components/home/SyncInfo";
import { cn } from "@/lib/utils";

interface LiveDataToggleProps {
  className?: string;
}

const LiveDataToggle: React.FC<LiveDataToggleProps> = ({ className }) => {
  const { t } = useI18n();
  const { settings, updateSettings } = useSettings();
  const {
    explorerBlockNumber,
    hiveBlockNumber,
    loading: isLoading,
  } = useBlockchainSyncInfo();

  // Live polling against an explorer that lags the chain serves stale blocks,
  // so the switch stays locked until it catches up.
  const isDisabled =
    getBlockDifference(hiveBlockNumber, explorerBlockNumber) >
      config.liveblockSecurityDifference || isLoading;

  return (
    <Toggle
      checked={settings.liveData}
      disabled={isDisabled}
      onClick={() =>
        updateSettings({ ...settings, liveData: !settings.liveData })
      }
      leftLabel={t("headBlockCard.liveData")}
      className={cn("text-[11px] text-gray-500 dark:text-gray-400", className)}
    />
  );
};

export default LiveDataToggle;
