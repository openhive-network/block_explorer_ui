import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { useSettings } from "@/contexts/SettingsContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useTopHolders, { CoinType } from "@/hooks/api/common/useTopHolders";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { convertVestsToHP } from "@/utils/Calculations";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";

const FEED_SIZE = 10;
const COINS: CoinType[] = ["HIVE", "HBD", "VESTS"];

const TopHoldersWidget: React.FC = () => {
  const { t } = useI18n();
  const { settings } = useSettings();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal() as any;

  const [coinType, setCoinType] = useState<CoinType>("VESTS");

  const { holdersData, isTopHoldersLoading } = useTopHolders(
    coinType,
    "balance",
    1
  );

  const totalVestingShares =
    dynamicGlobalData?.headBlockDetails?.rawTotalVestingShares;
  const totalVestingFundHive =
    dynamicGlobalData?.headBlockDetails?.rawTotalVestingFundHive;
  const unit = settings.displayVestHpMode === "hp" ? "hp" : "vests";

  const formatBalance = (value: string): string => {
    if (!hiveChain) return value;
    if (coinType === "VESTS") {
      return unit === "hp" && totalVestingFundHive && totalVestingShares
        ? convertVestsToHP(
            hiveChain,
            value,
            totalVestingFundHive,
            totalVestingShares
          )
        : hiveChain.formatter.format(hiveChain.vests(value));
    }
    if (coinType === "HIVE") {
      return hiveChain.formatter.format(hiveChain.hive(value));
    }
    if (coinType === "HBD") {
      return hiveChain.formatter.format(hiveChain.hbd(value));
    }
    return value;
  };

  const top = holdersData.slice(0, FEED_SIZE);

  const coinToggle = (
    <SegmentedToggle
      className="uppercase tracking-wide"
      value={coinType}
      onChange={setCoinType}
      options={COINS.map((c) => ({
        value: c,
        label: c === "VESTS" && unit === "hp" ? "HP" : c,
      }))}
    />
  );

  return (
    <Card className="col-span-12 lg:col-span-3 overflow-hidden mb-2">
      <CardHeaderWithLink
        title={t("widgets.topHoldersName")}
        href="/top-holders"
        actions={coinToggle}
      />

      <CardContent className="px-2 pt-2 pb-2">
        {isTopHoldersLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-7 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : top.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
            <Crown className="h-7 w-7 opacity-20" />
            <p className="text-xs">{t("widgets.topHoldersEmpty")}</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {top.map((h, i) => {
              const rank = h.rank > 0 ? h.rank : i + 1;
              return (
                <li
                  key={h.account}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="w-5 text-center text-[0.65rem] font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0">
                    {rank}
                  </span>
                  <Image
                    src={getHiveAvatarUrl(h.account)}
                    alt={h.account}
                    width={18}
                    height={18}
                    className="rounded-full flex-shrink-0"
                  />
                  <Link
                    href={`/@${h.account}`}
                    className="flex-1 min-w-0 text-xs font-medium text-link hover:underline truncate"
                  >
                    @{h.account}
                  </Link>
                  <span className="text-[0.6rem] font-medium text-slate-600 dark:text-slate-300 flex-shrink-0 whitespace-nowrap">
                    {formatBalance(h.value)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TopHoldersWidget;
