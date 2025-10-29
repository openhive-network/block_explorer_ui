import React from "react";
import HeadBlockPropertyCard from "@/components/home/HeadBlockPropertyCard";
import { blockchainDates } from "@/components/home/headBlockParameters";
import Explorer from "@/types/Explorer";
import { useI18n } from "@/i18n/i18n";

interface BlockchainDatesWidgetProps {
  headBlockCardData?: Explorer.HeadBlockCardData | any;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const BlockchainDatesWidget: React.FC<BlockchainDatesWidgetProps> = ({
  headBlockCardData,
  isCollapsed = true,
  onToggleCollapse = () => {},
}) => {
  const { t } = useI18n();
  const isLoading = !headBlockCardData || !headBlockCardData.headBlockDetails;

  return (
    <HeadBlockPropertyCard
      parameters={blockchainDates}
      header={t("headBlockCard.blockchainDates")}
      isParamsHidden={isCollapsed}
      handleHideParams={onToggleCollapse}
      isLoading={isLoading}
    />
  );
};

export default BlockchainDatesWidget;
