import React from "react";
import HeadBlockPropertyCard from "@/components/home/HeadBlockPropertyCard";
import { fundAndSupplyParameters } from "@/components/home/headBlockParameters";
import Explorer from "@/types/Explorer";
import { useI18n } from "@/i18n/i18n";

interface FundAndSupplyWidgetProps {
  headBlockCardData?: Explorer.HeadBlockCardData | any;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const FundAndSupplyWidget: React.FC<FundAndSupplyWidgetProps> = ({
  headBlockCardData,
  isCollapsed = true,
  onToggleCollapse = () => {},
}) => {
  const { t } = useI18n();
  // Only show loading if there is no data at all
  const isLoading = !headBlockCardData?.headBlockDetails;

  return (
    <HeadBlockPropertyCard
      parameters={fundAndSupplyParameters}
      header={t("headBlockCard.fundAndSupply")}
      isParamsHidden={isCollapsed}
      handleHideParams={onToggleCollapse}
      isLoading={isLoading}
      dynamicGlobalData={headBlockCardData}
    />
  );
};

export default FundAndSupplyWidget;
