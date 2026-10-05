import React from "react";

import KpiTile from "@/components/ui/KpiTile";
import { formatCompact } from "@/utils/chartUtils";
import {
  formatMissRate,
  type MissedBlocksRow,
  type MissedBlocksTrendPoint,
  summariseMissedBlocks,
  summariseTrend,
} from "@/utils/witnessMissedBlocks";
import { useI18n } from "@/i18n/i18n";

interface WitnessMissedBlocksKpiStripProps {
  rows: MissedBlocksRow[];
  trend: MissedBlocksTrendPoint[];
}

const WitnessMissedBlocksKpiStrip: React.FC<
  WitnessMissedBlocksKpiStripProps
> = ({ rows, trend }) => {
  const { t, locale } = useI18n();

  const chain = summariseTrend(trend);
  const shown = summariseMissedBlocks(rows);
  const worst = rows.reduce<MissedBlocksRow | undefined>(
    (max, row) => (!max || row.missedCount > max.missedCount ? row : max),
    undefined
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      <KpiTile
        value={formatCompact(chain.missed, locale)}
        label={t("witnessMissedBlocksCard.kpiTotalMissed")}
        infoText={t("witnessMissedBlocksCard.kpiTotalMissedHint")}
      />
      <KpiTile
        value={formatMissRate(chain.rate, locale)}
        label={t("witnessMissedBlocksCard.kpiMissRate")}
        infoText={t("witnessMissedBlocksCard.kpiMissRateHint")}
      />
      <KpiTile
        value={shown.witnessCount.toLocaleString(locale)}
        label={t("witnessMissedBlocksCard.kpiWitnesses")}
        infoText={t("witnessMissedBlocksCard.kpiWitnessesHint")}
      />
      <KpiTile
        value={shown.activeWitnessCount.toLocaleString(locale)}
        label={t("witnessMissedBlocksCard.kpiActive")}
        infoText={t("witnessMissedBlocksCard.kpiActiveHint")}
      />
      {worst && (
        <KpiTile
          value={worst.producer}
          valueClassName="truncate"
          label={t("witnessMissedBlocksCard.kpiWorst")}
          infoText={t("witnessMissedBlocksCard.kpiWorstHint", {
            missed: worst.missedCount.toLocaleString(locale),
          })}
        />
      )}
    </div>
  );
};

export default WitnessMissedBlocksKpiStrip;
