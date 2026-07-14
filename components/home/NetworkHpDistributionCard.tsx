import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import useNetworkHpDistribution from "@/hooks/api/homePage/useNetworkHpDistribution";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import fetchingService from "@/services/FetchingService";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { convertVestsToHP, computeVestingRatios } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";
import NetworkHpDistributionChart from "@/components/home/NetworkHpDistributionChart";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { HP_BRACKET_BY_BUCKET, hpToBucket } from "@/utils/hpBrackets";

const NetworkHpDistributionCard: React.FC = () => {
  const { t, locale, dir } = useI18n();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<"accounts" | "hp">("accounts");
  const { username } = useAuth();
  const { hiveChain } = useHiveChainContext();
  const { hpDistribution, isHpDistributionLoading, isHpDistributionError } =
    useNetworkHpDistribution();
  const { dynamicGlobalData } = useDynamicGlobal();
  const router = useRouter();

  const vestingRatios = useMemo(
    () => computeVestingRatios(hiveChain, dynamicGlobalData),
    [hiveChain, dynamicGlobalData]
  );

  // Convert the clicked HP bucket to a raw-VESTS range and open Top Holders
  // pre-filtered to it (the backend only understands VESTS).
  const handleBucketClick = (bucket: string) => {
    const bounds = HP_BRACKET_BY_BUCKET[bucket];
    if (!bounds || !vestingRatios) return;
    const toRawVests = (hp: number) =>
      Math.floor(hp * vestingRatios.vestsPerHive * 1e6);
    const params = new URLSearchParams();
    params.set("coin", "VESTS");
    params.set("min", String(toRawVests(bounds.min)));
    if (bounds.max !== null) {
      params.set("max", String(toRawVests(bounds.max)));
    }
    params.set("unit", "hp");
    params.set("page", "1");
    router.push(`/top-holders?${params.toString()}`);
  };

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
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden h-[340px] flex flex-col">
      <CardHeaderWithLink
        className="flex-shrink-0"
        title={t("networkHpDistributionCard.title")}
        actions={
          <SegmentedToggle
            ariaLabel={t("networkHpDistributionCard.title")}
            value={viewMode}
            onChange={setViewMode}
            options={[
              {
                value: "accounts",
                label: t("networkHpDistributionCard.viewAccounts"),
              },
              { value: "hp", label: t("networkHpDistributionCard.viewHp") },
            ]}
          />
        }
      />
      <div className="p-3 pt-2 flex-1 min-h-0 flex flex-col">
        {(totalAccounts !== null || userHpInfo) && (
          <div className="mb-2 flex items-center gap-2">
            {userHpInfo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                {t("networkHpDistributionCard.you")} &middot; {formattedUserHp}{" "}
                HP
              </span>
            )}
            {totalAccounts !== null && (
              <p className="ms-auto text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                {totalAccounts.toLocaleString(locale)}{" "}
                {t("networkHpDistributionCard.accounts")}
              </p>
            )}
          </div>
        )}

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
              isRTL={dir === "rtl"}
              t={t}
              onBucketClick={handleBucketClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkHpDistributionCard;
