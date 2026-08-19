import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import useNetworkHpDistribution from "@/hooks/api/homePage/useNetworkHpDistribution";
import useGovernanceStakeConcentration from "@/hooks/api/homePage/useGovernanceStakeConcentration";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import fetchingService from "@/services/FetchingService";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { convertVestsToHP, computeVestingRatios } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";
import NetworkHpDistributionChart from "@/components/home/NetworkHpDistributionChart";
import LorenzConcentrationChart from "@/components/home/LorenzConcentrationChart";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { COIN_BRACKET_BY_BUCKET, coinToBucket } from "@/utils/coinBrackets";

const ConcChip: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <span className="inline-flex items-baseline gap-1 rounded bg-gray-50 px-2 py-0.5 text-[10px] tabular-nums dark:bg-gray-800/60">
    <span className="font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
      {label}
    </span>
    <span className="font-bold text-gray-800 dark:text-gray-100">{value}</span>
  </span>
);

const NetworkHpDistributionCard: React.FC = () => {
  const { t, locale, dir } = useI18n();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<"accounts" | "hp" | "lorenz">(
    "accounts"
  );
  const { username } = useAuth();
  const { hiveChain } = useHiveChainContext();
  const { hpDistribution, isHpDistributionLoading, isHpDistributionError } =
    useNetworkHpDistribution();
  const { concentration } = useGovernanceStakeConcentration();
  const { dynamicGlobalData } = useDynamicGlobal();

  const concentrationStats = concentration?.[0];
  const router = useRouter();

  const vestingRatios = useMemo(
    () => computeVestingRatios(hiveChain, dynamicGlobalData),
    [hiveChain, dynamicGlobalData]
  );

  // Convert the clicked HP bucket to a raw-VESTS range and open Top Holders
  // pre-filtered to it (the backend only understands VESTS).
  const handleBucketClick = useCallback(
    (bucket: string) => {
      const bounds = COIN_BRACKET_BY_BUCKET[bucket];
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
    },
    [vestingRatios, router]
  );

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
      return { bucket: coinToBucket(hp), hp };
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
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden h-[372px] flex flex-col">
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
              {
                value: "lorenz",
                label: t("networkHpDistributionCard.viewLorenz"),
              },
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

        {concentrationStats && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <ConcChip
              label={t("networkHpDistributionCard.gini")}
              value={concentrationStats.gini.toLocaleString(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            />
            <ConcChip
              label={t("networkHpDistributionCard.top1")}
              value={`${concentrationStats.top_1pct_hp_share.toLocaleString(
                locale,
                { maximumFractionDigits: 1 }
              )}%`}
            />
            <ConcChip
              label={t("networkHpDistributionCard.top10")}
              value={`${concentrationStats.top_10pct_hp_share.toLocaleString(
                locale,
                { maximumFractionDigits: 1 }
              )}%`}
            />
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
          <>
            <div className="flex-1 min-h-[200px]">
              {viewMode === "lorenz" ? (
                <LorenzConcentrationChart
                  buckets={hpDistribution}
                  isDark={isDark}
                  textColor={textColor}
                  gridColor={gridColor}
                  locale={locale}
                  isRTL={dir === "rtl"}
                  t={t}
                />
              ) : (
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
              )}
            </div>
            {viewMode === "lorenz" && (
              <p className="mt-1 text-[10px] leading-tight text-gray-400 dark:text-gray-500">
                {t("networkHpDistributionCard.lorenzInfo")}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(NetworkHpDistributionCard);
