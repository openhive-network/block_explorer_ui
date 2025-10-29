import React from "react";
import HeadBlockHiveChartCard from "@/components/home/HeadBlockHiveChartCard";
import { useI18n } from "@/i18n/i18n";

interface HivePriceChartWidgetProps {
  onShowFullChart: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const HivePriceChartWidget: React.FC<HivePriceChartWidgetProps> = ({
  onShowFullChart,
  isCollapsed = false,
  onToggleCollapse = () => {},
}) => {
  const { t } = useI18n();

  return (
    <HeadBlockHiveChartCard
      header={t("headBlockCard.hivePriceChart")}
      handleHiveFullChartVisibility={onShowFullChart}
      isParamsHidden={isCollapsed}
      handleHideParams={onToggleCollapse}
    />
  );
};

export default HivePriceChartWidget;
