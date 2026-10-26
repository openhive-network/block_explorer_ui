import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import KpiTile from "@/components/ui/KpiTile";
import useCollapsedState from "@/hooks/common/useCollapsedState";
import useRecentMissedBlocks from "@/hooks/api/common/useRecentMissedBlocks";
import { formatLocalePercent } from "@/utils/chartUtils";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";

interface AccountWitnessMissedBlocksCardProps {
  accountName: string;
  lifetimeMissed?: number;
  isInitiallyOpen: boolean;
}

const AccountWitnessMissedBlocksCard: React.FC<
  AccountWitnessMissedBlocksCardProps
> = ({ accountName, lifetimeMissed, isInitiallyOpen }) => {
  const { t, locale } = useI18n();
  const [isHidden, setIsHidden] = useCollapsedState(isInitiallyOpen);
  const { isAvailable, isDayUnknown, isWeekUnknown, getRecentMissed } =
    useRecentMissedBlocks(accountName);

  if (!isAvailable) return null;

  const { day, week } = getRecentMissed(accountName);

  const windowTile = (
    label: string,
    row: Hive.WitnessMissedBlocksResponse | undefined,
    isUnknown: boolean
  ) => {
    const scheduled = row ? row.missed_count + row.produced_count : 0;
    return (
      <KpiTile
        label={label}
        value={
          isUnknown ? "--" : row ? row.missed_count.toLocaleString(locale) : "—"
        }
        sub={
          row && scheduled > 0
            ? t("accountWitnessMissedBlocks.rateSub", {
                rate: formatLocalePercent(row.rate * 100, locale, 2),
                scheduled: scheduled.toLocaleString(locale),
              })
            : !isUnknown && !row
              ? t("accountWitnessMissedBlocks.notScheduled")
              : undefined
        }
      />
    );
  };

  return (
    <Card
      data-testid="witness-missed-blocks-dropdown"
      className="overflow-hidden"
    >
      <CardHeader className="p-0">
        <div
          onClick={() => setIsHidden(!isHidden)}
          className="h-full flex justify-between align-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">{t("witnesses.missedblocks")}</div>
          {isHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent hidden={isHidden}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <KpiTile
            label={t("accountWitnessMissedBlocks.lifetime")}
            value={(lifetimeMissed ?? 0).toLocaleString(locale)}
          />
          {windowTile(
            t("accountWitnessMissedBlocks.last24h"),
            day,
            isDayUnknown
          )}
          {windowTile(
            t("accountWitnessMissedBlocks.last7d"),
            week,
            isWeekUnknown
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountWitnessMissedBlocksCard;
