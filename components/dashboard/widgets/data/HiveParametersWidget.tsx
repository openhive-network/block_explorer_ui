import React from "react";
import HeadBlockPropertyCard from "@/components/home/HeadBlockPropertyCard";
import { hiveParameters } from "@/components/home/headBlockParameters";
import Explorer from "@/types/Explorer";
import { useI18n } from "@/i18n/i18n";

interface HiveParametersWidgetProps {
  headBlockCardData?: Explorer.HeadBlockCardData | any;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const HiveParametersWidget: React.FC<HiveParametersWidgetProps> = ({
  headBlockCardData,
  isCollapsed = true,
  onToggleCollapse = () => {},
}) => {
  const { t } = useI18n();
  const isLoading = !headBlockCardData || !headBlockCardData.headBlockDetails;

  return (
    <HeadBlockPropertyCard
      parameters={hiveParameters}
      header={t("headBlockCard.hiveParameters")}
      isParamsHidden={isCollapsed}
      handleHideParams={onToggleCollapse}
      isLoading={isLoading}
    />
  );
};

export default HiveParametersWidget;
