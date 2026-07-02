import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import useNetworkHpDistribution from "@/hooks/api/homePage/useNetworkHpDistribution";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import fetchingService from "@/services/FetchingService";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { convertVestsToHP } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";
import NetworkHpDistributionChart from "@/components/home/NetworkHpDistributionChart";

// Bucket labels must match exactly what the API returns in NetworkHpDistributionResponse.bucket
const hpToBucket = (hp: number): string => {
  if (hp < 1) return "0-1 HP";
  if (hp < 10) return "1-10 HP";
  if (hp < 100) return "10-100 HP";
  if (hp < 1_000) return "100-1K HP";
  if (hp < 10_000) return "1K-10K HP";
  if (hp < 100_000) return "10K-100K HP";
  if (hp < 1_000_000) return "100K-1M HP";
  return "1M+ HP";
};

const NetworkHpDistributionCard: React.FC = () => {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<"accounts" | "hp">("accounts");
  const { username } = useAuth();
  const { hiveChain } = useHiveChainContext();
  const { hpDistribution, isHpDistributionLoading, isHpDistributionError } =
    useNetworkHpDistribution();
  const { dynamicGlobalData } = useDynamicGlobal();

  const { data: accountData } = useQuery({
    queryKey: ["account_hp_bracket", username],
    queryFn: () => fetchingService.getAccount(username!),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const userHpInfo = useMemo(() => {
    if (!accountData || !dynamicGlobalData || !hiveChain) return null;
    const { rawTotalVestingShares, rawTotalVestingFundHive } =
      dynamicGlobalData.headBlockDetails;
    if (!rawTotalVestingShares || !rawTotalVestingFundHive) return null;
    const toHp = (vestsStr: string): number => {
      const hpStr = convertVestsToHP(
        hiveChain,
        vestsStr,
        rawTotalVestingFundHive,
        rawTotalVestingShares
      );
      return hpStr ? grabNumericValue(hpStr) : 0;
    };
    try {
      const hp =
        toHp(accountData.vesting_shares) +
        toHp(accountData.received_vesting_shares) -
        toHp(accountData.delegated_vesting_shares);
      if (hp <= 0) return null;
      return { bucket: hpToBucket(hp), hp };
    } catch {
      return null;
    }
  }, [accountData, dynamicGlobalData, hiveChain]);

  const totalAccounts = useMemo(
    () => hpDistribution?.reduce((sum, d) => sum + d.account_count, 0) ?? null,
    [hpDistribution]
  );

  const isDark = theme === "dark";
  const textColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#1e293b" : "#e5e7eb";

  const formattedUserHp = userHpInfo
    ? userHpInfo.hp.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <span className="block w-[3px] h-3.5 rounded-full bg-indigo-500 flex-shrink-0" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {t("networkHpDistributionCard.title")}
        </span>
      </div>
      <div className="p-3 flex-1 min-h-0 flex flex-col">
        <div className="mb-2">
          <div className="flex items-center justify-end">
            <div className="flex rounded overflow-hidden border border-gray-200 dark:border-gray-700 text-[10px] font-medium">
              {(["accounts", "hp"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2 py-0.5 transition-colors ${
                    viewMode === mode
                      ? "bg-violet-500 text-white"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  {t(
                    mode === "accounts"
                      ? "networkHpDistributionCard.viewAccounts"
                      : "networkHpDistributionCard.viewHp"
                  )}
                </button>
              ))}
            </div>
          </div>
          {totalAccounts !== null && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              {totalAccounts.toLocaleString(locale)}{" "}
              {t("networkHpDistributionCard.accounts")}
            </p>
          )}
          {userHpInfo && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                {t("networkHpDistributionCard.you")} &middot; {formattedUserHp}{" "}
                HP
              </span>
            </div>
          )}
        </div>

        {isHpDistributionLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="animate-spin h-5 w-5" />
          </div>
        ) : isHpDistributionError || !hpDistribution?.length ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-red-500 text-xs">
              {t("common.errorLoadingData")}
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-[220px]">
            <NetworkHpDistributionChart
              hpDistribution={hpDistribution}
              viewMode={viewMode}
              userBucket={userHpInfo?.bucket ?? null}
              isDark={isDark}
              textColor={textColor}
              gridColor={gridColor}
              locale={locale}
              t={t}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkHpDistributionCard;
