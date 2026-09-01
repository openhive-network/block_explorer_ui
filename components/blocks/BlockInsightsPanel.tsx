import React, { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

import CollapsibleSection from "@/components/ui/CollapsibleSection";
import {
  getLocalStorage,
  scopedStorageKey,
  setLocalStorage,
} from "@/utils/LocalStorage";
import { useAuth } from "@/contexts/AuthContext";
import { type SlotDelta } from "@/utils/slotGaps";
import { type BlockStatsRow } from "@/utils/blockRangeStats";
import { useI18n } from "@/i18n/i18n";
import RangeInsightsBar from "./RangeInsightsBar";
import SlotHealthStrip from "./SlotHealthStrip";
import ProducerShareCard from "./ProducerShareCard";

const STORAGE_KEY = "is_blocks_insights_open";

interface BlockInsightsPanelProps {
  rows: BlockStatsRow[];
  slotDeltas: SlotDelta[];
  missedProducersByBlock?: Record<number, string[]>;
  paramsState: any;
  className?: string;
}

const BlockInsightsPanel: React.FC<BlockInsightsPanelProps> = ({
  rows,
  slotDeltas,
  missedProducersByBlock,
  paramsState,
  className,
}) => {
  const { t } = useI18n();
  const { username } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  // The account resolves after mount, so re-read on sign-in.
  const storageKey = scopedStorageKey(STORAGE_KEY, username);

  useEffect(() => {
    const stored = getLocalStorage(storageKey, true);
    if (typeof stored === "boolean") setIsOpen(stored);
  }, [storageKey]);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    setLocalStorage(storageKey, next);
  };

  if (!rows.length) return null;

  return (
    <CollapsibleSection
      title={t("blocksPage.insights.panelTitle")}
      icon={<BarChart3 size={16} />}
      isOpen={isOpen}
      onToggle={toggle}
      className={className}
      bodyClassName="flex flex-col gap-3"
      testId="block-insights"
    >
      <RangeInsightsBar rows={rows} paramsState={paramsState} />
      <SlotHealthStrip deltas={slotDeltas} />
      <ProducerShareCard
        rows={rows}
        missedProducersByBlock={missedProducersByBlock}
      />
    </CollapsibleSection>
  );
};

export default BlockInsightsPanel;
