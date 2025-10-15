import { useMemo } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import useProposals from '@/hooks/api/proposals/useProposals';
import { useI18n } from '@/i18n/i18n';
import useDynamicGlobal from '@/hooks/api/homePage/useDynamicGlobal';
import { useHiveChainContext } from '@/contexts/HiveChainContext';
import { convertVestsToHP } from '@/utils/Calculations';
import { cn } from '@/lib/utils';

import ErrorMessage from '@/components/ErrorMessage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const LiveFundingChart = () => {
  const { t } = useI18n();

  const {
    proposalsData,
    isProposalsLoading,
    isProposalsError
  } = useProposals({ status: 'active', orderBy: 'by_total_votes' });

  const { hiveChain } = useHiveChainContext();
  const {
    dynamicGlobalData,
    isLoading: isPropsLoading,
    isError: isPropsError
  } = useDynamicGlobal() as any;
  const { chartData, fundingThresholdInHp } = useMemo(() => {
    if (!proposalsData || !dynamicGlobalData || !hiveChain) {
      return { chartData: [], fundingThresholdInHp: '0 HP' };
    }

    const returnProposal = proposalsData.find(p => p.proposal_id === 0);
    const thresholdVests = returnProposal ? parseFloat(returnProposal.total_votes) : 0;

    const otherProposals = proposalsData
      .filter(p => p.proposal_id !== 0)
      .map(p => {
        const votesVests = parseFloat(p.total_votes);
        return {
          id: p.proposal_id,
          title: p.subject,
          creator: p.creator,
          permlink: p.permlink,
          percentage: thresholdVests > 0 ? (votesVests / thresholdVests) * 100 : 0,
          isFunded: votesVests >= thresholdVests,
          votesInHpFormatted: convertVestsToHP(hiveChain, p.total_votes, dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive, dynamicGlobalData.headBlockDetails.rawTotalVestingShares)
        };
      });

    const thresholdInHp = convertVestsToHP(hiveChain, thresholdVests.toString(), dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive, dynamicGlobalData.headBlockDetails.rawTotalVestingShares);

    return {
      chartData: otherProposals,
      fundingThresholdInHp: thresholdInHp,
    };
  }, [proposalsData, dynamicGlobalData, hiveChain]);


  const isLoading = isProposalsLoading || isPropsLoading;
  const isError = isProposalsError || isPropsError;

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
  }
  if (isError) {
    return <ErrorMessage message={t('proposalAnalytics.errorLoadingChart')} />;
  }

  const maxPercentage = Math.max(...chartData.map(d => d.percentage), 100);

  return (
    <TooltipProvider>
      <div>
        <div className="space-y-3 text-sm">
          {chartData.map(proposal => (
            <div key={proposal.id} className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4 md:items-center">
              <Link href={`/proposal/@${proposal.creator}/${proposal.permlink}`} target="_blank" rel="noopener noreferrer" className="md:col-span-1 truncate font-medium text-slate-700 dark:text-slate-300 hover:text-link hover:underline">
                {proposal.title} <span className="text-slate-400">#{proposal.id}</span>
              </Link>
              <div className="md:col-span-2">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="relative h-5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden cursor-pointer">
                      <div className="absolute top-0 h-full border-r-2 border-dashed border-red-500/70 z-10" style={{ left: `${(100 / maxPercentage) * 100}%` }} />
                      <div className={cn("absolute top-0 left-0 h-full rounded-full transition-all duration-500", proposal.isFunded ? 'bg-green-500' : 'bg-blue-500')} style={{ width: `${(proposal.percentage / maxPercentage) * 100}%` }} />
                      <div className="absolute inset-0 px-2 flex items-center text-white font-bold text-xs"><span>{proposal.votesInHpFormatted}</span></div>
                    </div>
                  </TooltipTrigger>

                  <TooltipContent side="top" align="center" className="bg-transparent border-none shadow-none px-0 py-0 text-slate-800 dark:text-slate-100">
                    <p className="flex items-baseline">
                      <span className="font-mono text-sm font-bold">{proposal.percentage.toFixed(2)}</span>
                      <span className="text-sm font-semibold">%</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <div className="flex items-center flex-wrap justify-end gap-x-4 gap-y-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-green-500" />
              <span>{t('proposalAnalytics.funded')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-blue-500" />
              <span>{t('proposalAnalytics.notFunded')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 border-r-2 border-dashed border-red-500" />
              <span className='whitespace-nowrap'>{t('proposalAnalytics.fundingThreshold')}: <strong>{fundingThresholdInHp}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};