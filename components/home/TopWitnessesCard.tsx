import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { cn } from "@/lib/utils";
import { config } from "@/Config";
import Hive from "@/types/Hive";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { convertVestsToHP } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";
import { Card, CardContent } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";

interface TopWitnessesCardProps {
  witnessesData?: { witnesses: Hive.Witness[] };
  isLoading: boolean;
}

interface WitnessRow {
  witness: Hive.Witness;
  hp: number;
  changeSign: number;
  changeHp: number;
  isInactive: boolean;
}

const formatHpCompact = (hp: number, locale: string): string => {
  const abs = Math.abs(hp);
  if (abs >= 1_000_000)
    return `${(hp / 1_000_000).toLocaleString(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}M HP`;
  if (abs >= 1_000)
    return `${(hp / 1_000).toLocaleString(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}K HP`;
  return `${Math.round(hp).toLocaleString(locale)} HP`;
};

const TopWitnessesCard = ({
  witnessesData,
  isLoading,
}: TopWitnessesCardProps) => {
  const { t, locale } = useI18n();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();

  const rows = useMemo<WitnessRow[]>(() => {
    const witnesses = witnessesData?.witnesses ?? [];
    const details = dynamicGlobalData?.headBlockDetails;
    const canConvert =
      !!hiveChain &&
      !!details?.rawTotalVestingFundHive &&
      !!details?.rawTotalVestingShares;
    const toHp = (vests: Hive.Supply | string | number): number => {
      if (!canConvert || !vests) return 0;
      const formatted = convertVestsToHP(
        hiveChain!,
        vests as Hive.Supply | string,
        details!.rawTotalVestingFundHive,
        details!.rawTotalVestingShares
      );
      return formatted ? grabNumericValue(formatted) : 0;
    };
    return witnesses.map((witness) => {
      const changeSign = Number(witness.votes_daily_change) || 0;
      return {
        witness,
        hp: toHp(witness.vests),
        changeSign,
        changeHp:
          changeSign !== 0 ? Math.abs(toHp(witness.votes_daily_change)) : 0,
        isInactive: witness.signing_key === config.inactiveWitnessKey,
      };
    });
  }, [witnessesData, hiveChain, dynamicGlobalData]);

  return (
    <Card
      className="col-span-12 md:col-span-11 lg:col-span-3 overflow-hidden flex flex-col mb-2"
      data-testid="top-witnesses-sidebar"
    >
      <CardHeaderWithLink
        title={t("home.topWitnesses")}
        href="/witnesses"
        linkTestId="see-witnesses-link"
      />
      <CardContent className="px-2 py-2 overflow-y-auto flex-grow">
        <div className="flex flex-col gap-1">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded-lg bg-explorer-extra-light-gray animate-pulse"
                />
              ))
            : rows.map(({ witness, hp, changeSign, changeHp, isInactive }) => {
                const name = witness.witness_name;
                return (
                  <div
                    key={name}
                    data-testid="witnesses-name"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-explorer-extra-light-gray transition-colors hover:bg-rowHover"
                  >
                    <span className="w-4 text-center text-xs text-gray-500 shrink-0 tabular-nums">
                      {witness.rank}
                    </span>
                    <Link href={`/@${name}`} className="shrink-0">
                      <Image
                        className="rounded-full border border-link/60"
                        src={getHiveAvatarUrl(name)}
                        alt={name}
                        width={22}
                        height={22}
                      />
                    </Link>
                    <Link
                      href={`/@${name}`}
                      title={name}
                      className={cn(
                        "text-sm truncate flex-grow min-w-0 text-link",
                        isInactive && "opacity-50 line-through"
                      )}
                    >
                      {name}
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      {changeSign !== 0 && (
                        <span
                          title={`${changeSign > 0 ? "+" : "-"}${formatHpCompact(changeHp, locale)}`}
                        >
                          {changeSign > 0 ? (
                            <ChevronUp
                              className="h-3.5 w-3.5"
                              color="#22c55e"
                              strokeWidth={6}
                            />
                          ) : (
                            <ChevronDown
                              className="h-3.5 w-3.5"
                              color="#ef4444"
                              strokeWidth={6}
                            />
                          )}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-explorer-dark-gray dark:text-text tabular-nums">
                        {hp > 0 ? formatHpCompact(hp, locale) : "--"}
                      </span>
                    </div>
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopWitnessesCard;
