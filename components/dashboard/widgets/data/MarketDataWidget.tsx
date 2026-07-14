import React, { useState, useEffect } from "react";
import Explorer from "@/types/Explorer";
import { getVestsToHiveRatio } from "@/utils/Calculations";
import MarketDataStats from "@/components/home/MarketDataStats";

interface MarketDataWidgetProps {
  headBlockCardData?: Explorer.HeadBlockCardData | any;
}

const MarketDataWidget: React.FC<MarketDataWidgetProps> = ({
  headBlockCardData,
}) => {
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
    <div className="mb-1">
      <MarketDataStats
        feedPrice={liveFeedPrice}
        vestsToHiveRatio={liveVestsToHiveRatio}
      />
    </div>
  );
};

export default MarketDataWidget;
