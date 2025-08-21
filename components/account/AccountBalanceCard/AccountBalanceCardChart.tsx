import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Lock, PiggyBank, Droplets, Database, TrendingDown } from 'lucide-react';
import { useI18n } from '@/i18n/i18n';
import { cn } from '@/lib/utils';

type ChartSegment = {
  key: string;
  label: string;
  value: number;
  displayValue: string;
  percent: number;
  color: string;
  iconColorClass: string;
};

type AccountBalanceCardChartProps = {
  segments: ChartSegment[];
  activeSegmentKey: string | null;
  onSegmentClick: (key: string | null) => void;
};

export const AccountBalanceCardChart: React.FC<AccountBalanceCardChartProps> = ({ segments, activeSegmentKey, onSegmentClick }) => {
  const { t } = useI18n();

  const adjustedChartSegments = useMemo(() => {
    const MINIMUM_PERCENTAGE = 1.5;
    
    // filter out any segments that are too small to be visually relevant (will round to 0.0%).
    const visibleSegments = segments.filter(s => s.percent >= 0.1);
    
    let newSegments = visibleSegments.map(s => ({...s}));
    const smallSegments = newSegments.filter(s => s.percent > 0 && s.percent < MINIMUM_PERCENTAGE);
    const largeSegments = newSegments.filter(s => s.percent >= MINIMUM_PERCENTAGE);

    if (smallSegments.length > 0 && largeSegments.length > 0) {
      const totalDeficit = smallSegments.reduce((sum, s) => sum + (MINIMUM_PERCENTAGE - s.percent), 0);
      const totalLargePercent = largeSegments.reduce((sum, s) => sum + s.percent, 0);
      for (const segment of largeSegments) {
        segment.percent -= totalDeficit * (segment.percent / totalLargePercent);
      }
      for (const segment of smallSegments) {
        segment.percent = MINIMUM_PERCENTAGE;
      }
    }
    return newSegments;
  }, [segments]);

  const rescaledChartSegmentsForBar = useMemo(() => {
    const drawableSegments = adjustedChartSegments;    
    if (drawableSegments.length === 0) return [];
    const totalDrawablePercent = drawableSegments.reduce((sum, segment) => sum + segment.percent, 0);
    if (totalDrawablePercent <= 0) return [];
    return drawableSegments.map((segment: ChartSegment) => ({
      ...segment,
      percent: (segment.percent / totalDrawablePercent) * 100,
    }));
  }, [adjustedChartSegments]);

  const chartData = useMemo(() => [
    rescaledChartSegmentsForBar.reduce((acc: { [key: string]: number }, segment: ChartSegment) => {
      acc[segment.key] = segment.percent;
      return acc;
    }, {} as { [key: string]: number })
  ], [rescaledChartSegmentsForBar]);
  
  const poweringDownSegment = segments.find(s => s.key === 'poweringDown');
  const mainSegments = segments.filter(s => s.key !== 'poweringDown');
  const iconMap = { staked: Lock, savings: PiggyBank, liquid: Droplets, unclaimed: Database, poweringDown: TrendingDown };


  return (
    <div className="space-y-2">
      {/* Bar Chart Rendering */}
      <div className="w-full h-5 rounded-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis type="category" dataKey="name" hide />
            {rescaledChartSegmentsForBar.map((segment: ChartSegment) => (
              <Bar
                key={segment.key}
                dataKey={segment.key}
                stackId="a"
                fill={segment.color}
                background={false}
                fillOpacity={!activeSegmentKey || activeSegmentKey === segment.key ? 1 : 0.5}
                className="transition-opacity duration-300 cursor-pointer"
                onClick={() => onSegmentClick(segment.key)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two-Tiered Legend Layout */}
      <div>
        {/* Tier 1: Main four segments */}
        <div className="flex flex-wrap justify-between text-xs items-start gap-y-2 gap-x-4">
          {mainSegments.map((segment: ChartSegment) => {
            const IconComponent = iconMap[segment.key as keyof typeof iconMap];
            if (!IconComponent) return null;
            
            return (
              <div 
                key={segment.key} 
                className={cn('p-1 -m-1 rounded-md transition-colors flex flex-col cursor-pointer', { 'bg-slate-100 dark:bg-slate-800': activeSegmentKey === segment.key })}
                onClick={() => onSegmentClick(segment.key)}
              >
                <div className="flex items-center">
                  <IconComponent className="h-3 w-3 mr-1.5" />
                  <span className={cn("font-bold", segment.iconColorClass)}>{segment.label}:</span>
                  {activeSegmentKey === segment.key && <span className={cn("font-extralight ml-1.5", segment.iconColorClass)}>({segment.percent.toFixed(1)}%)</span>}
                </div>
                <div className="font-semibold text-slate-700 dark:text-slate-200 pl-1 sm:pl-5">
                    {segment.displayValue}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tier 2: Powering Down (only shown if it exists) */}
        {poweringDownSegment && (() => {
          const IconComponent = iconMap[poweringDownSegment.key as keyof typeof iconMap];
          if (!IconComponent) return null;

          return (
            <div className="mt-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700/50">
              <div 
                key={poweringDownSegment.key} 
                className={cn('p-1 -m-1 rounded-md transition-colors flex flex-col cursor-pointer w-fit', { 'bg-slate-100 dark:bg-slate-800': activeSegmentKey === poweringDownSegment.key })}
                onClick={() => onSegmentClick(poweringDownSegment.key)}
              >
                <div className="flex items-center">
                  <IconComponent className="h-3 w-3 mr-1.5" />
                  <span className={cn("font-bold", poweringDownSegment.iconColorClass)}>{poweringDownSegment.label}:</span>
                  {activeSegmentKey === poweringDownSegment.key && <span className={cn("font-extralight ml-1.5", poweringDownSegment.iconColorClass)}>({poweringDownSegment.percent.toFixed(1)}%)</span>}
                </div>
                <div className="font-semibold text-slate-700 dark:text-slate-200 pl-1 sm:pl-5">
                    {poweringDownSegment.displayValue}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};