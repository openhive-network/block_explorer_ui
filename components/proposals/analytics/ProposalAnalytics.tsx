import { useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { LineChart } from "lucide-react";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import { LiveFundingChart } from "./LiveFundingChart";

export const ProposalAnalytics = () => {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <CollapsibleSection
      title={t("proposalAnalytics.liveTitle")}
      icon={<LineChart size={16} />}
      isOpen={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      className="mb-8"
      bodyClassName="min-h-[400px] p-4"
    >
      <LiveFundingChart />
    </CollapsibleSection>
  );
};
