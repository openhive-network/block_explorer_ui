import React, { useState, useEffect } from "react";
import Explorer from "@/types/Explorer";
import { useI18n } from "@/i18n/i18n";
import { getVestsToHiveRatio } from "@/utils/Calculations";

interface MarketDataWidgetProps {
  headBlockCardData?: Explorer.HeadBlockCardData | any;
}

const MarketDataWidget: React.FC<MarketDataWidgetProps> = ({
  headBlockCardData,
}) => {
  const { t } = useI18n();

  const [liveFeedPrice, setLiveFeedPrice] = useState<number | undefined>(
    headBlockCardData?.headBlockDetails?.feedPrice
  );
  const [liveVestsToHiveRatio, setLiveVestsToHiveRatio] = useState<
    string | undefined
  >(getVestsToHiveRatio(headBlockCardData));

  useEffect(() => {
    if (headBlockCardData?.headBlockDetails?.feedPrice) {
      setLiveFeedPrice(headBlockCardData.headBlockDetails.feedPrice);
    }
  }, [headBlockCardData?.headBlockDetails?.feedPrice]);

  useEffect(() => {
    const newVestsToHiveRatio = getVestsToHiveRatio(headBlockCardData);
    if (newVestsToHiveRatio) {
      setLiveVestsToHiveRatio(newVestsToHiveRatio);
    }
  }, [headBlockCardData]);

  return (
    <div className="data-box">
      <div>
        <span>{t("headBlockCard.feedPrice")}:</span> {liveFeedPrice}
      </div>
      <div>
        <span>{t("headBlockCard.vestsToHiveRatio")}:</span>{" "}
        {liveVestsToHiveRatio} VESTS
      </div>
    </div>
  );
};

export default MarketDataWidget;
