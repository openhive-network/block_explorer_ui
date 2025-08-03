import { useState } from 'react';
import { useI18n } from '@/i18n/i18n';
import { Button } from '@/components/ui/button';
import { ChevronUp, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveFundingChart } from './LiveFundingChart';

export const ProposalAnalytics = () => {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-8 rounded-lg border bg-slate-50 shadow-sm dark:bg-theme dark:border-slate-800 transition-all duration-300">
      <div className="flex items-center justify-between p-3 border-b dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <LineChart className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h3 className="text-lg font-semibold">
            {t('proposalAnalytics.liveTitle')}
          </h3>
        </div>

        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
            <ChevronUp className={cn("h-5 w-5 transition-transform duration-300", { "rotate-180": !isExpanded })} />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 min-h-[400px]">
          <LiveFundingChart />
        </div>
      )}
    </div>
  );
};