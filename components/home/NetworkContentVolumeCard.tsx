import React, { useMemo, useState } from "react";
import {
  Loader2,
  FileText,
  MessageSquare,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import NetworkContentVolumeChart from "./NetworkContentVolumeChart";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import { useI18n } from "../../i18n/i18n";
import useNetworkContentVolume from "@/hooks/api/homePage/useNetworkContentVolume";
import { cn } from "@/lib/utils";
import { computeTrendPct } from "@/utils/chartUtils";

const NetworkContentVolumeFullChartDialog = dynamic(
  () => import("./NetworkContentVolumeFullChartDialog"),
  { ssr: false }
);

const TrendBadge: React.FC<{ value: number; locale: string }> = ({
  value,
  locale,
}) => {
  const sign = value > 0 ? 1 : value < 0 ? -1 : 0;
  const Icon = sign > 0 ? TrendingUp : sign < 0 ? TrendingDown : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold leading-none",
        sign > 0
          ? "text-explorer-light-green"
          : sign < 0
            ? "text-rose-600 dark:text-rose-400"
            : "text-gray-500"
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value).toLocaleString(locale, { maximumFractionDigits: 2 })}%
    </span>
  );
};

const NetworkContentVolumeCard = () => {
  const { t, locale } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayKey = moment().format("YYYY-MM-DD");
  const fromDate = useMemo(
    () => moment(todayKey).subtract(30, "days").toDate(),
    [todayKey]
  );

  const {
    networkContentVolume,
    isNetworkContentVolumeLoading,
    isNetworkContentVolumeError,
  } = useNetworkContentVolume(fromDate, undefined, "day");

  const chartData = useMemo(() => {
    if (!networkContentVolume || networkContentVolume.length === 0) return [];
    return [...networkContentVolume].sort((a, b) =>
      a.period < b.period ? -1 : 1
    );
  }, [networkContentVolume]);

  // 30-day aggregates are computed over complete days only (today is partial).
  const completedChartData = useMemo(() => {
    const todayStr = moment().format("YYYY-MM-DD");
    return chartData.filter((d) => d.period < todayStr);
  }, [chartData]);

  const totals = useMemo(() => {
    if (!completedChartData.length)
      return {
        posts: null,
        comments: null,
        avgPosts: null,
        avgComments: null,
        avgAuthors: null,
      } as const;
    const n = completedChartData.length;
    const sumPosts = completedChartData.reduce((s, d) => s + d.posts, 0);
    const sumComments = completedChartData.reduce((s, d) => s + d.comments, 0);
    const sumAuthors = completedChartData.reduce(
      (s, d) => s + d.unique_authors,
      0
    );
    return {
      posts: sumPosts,
      comments: sumComments,
      avgPosts: Math.round(sumPosts / n),
      avgComments: Math.round(sumComments / n),
      avgAuthors: Math.round(sumAuthors / n),
    };
  }, [completedChartData]);

  const trendPosts = useMemo(
    () => computeTrendPct(completedChartData.map((d) => d.posts)),
    [completedChartData]
  );
  const trendComments = useMemo(
    () => computeTrendPct(completedChartData.map((d) => d.comments)),
    [completedChartData]
  );
  const trendAuthors = useMemo(
    () => computeTrendPct(completedChartData.map((d) => d.unique_authors)),
    [completedChartData]
  );

  const kpis: {
    key: string;
    labelKey: string;
    qualifierKey: string;
    Icon: typeof FileText;
    headline: number | null;
    avg: number | null;
    trend: number | null;
  }[] = [
    {
      key: "posts",
      labelKey: "networkContentVolumeCard.posts",
      qualifierKey: "networkContentVolumeCard.total30d",
      Icon: FileText,
      headline: totals.posts,
      avg: totals.avgPosts,
      trend: trendPosts,
    },
    {
      key: "comments",
      labelKey: "networkContentVolumeCard.comments",
      qualifierKey: "networkContentVolumeCard.total30d",
      Icon: MessageSquare,
      headline: totals.comments,
      avg: totals.avgComments,
      trend: trendComments,
    },
    {
      key: "authors",
      labelKey: "networkContentVolumeCard.authors",
      qualifierKey: "networkContentVolumeCard.avg30d",
      Icon: Users,
      // Unique authors can't be summed across days; the 30-day average is the
      // headline, so no separate avg line is shown for this tile.
      headline: totals.avgAuthors,
      avg: null,
      trend: trendAuthors,
    },
  ];

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <CardHeaderWithLink
        title={t("widgets.networkContentVolumeName")}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[13px] underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {t("common.fullChart")}
          </button>
        }
      />
      <div className="p-2 space-y-2">
        <div className="flex flex-wrap gap-2">
          {kpis.map(
            ({ key, labelKey, qualifierKey, Icon, headline, avg, trend }) => {
              return (
                <div
                  key={key}
                  className="flex-1 min-w-[150px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-start"
                >
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                      {t(labelKey)}
                    </h3>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {t(qualifierKey)}
                    </span>
                  </div>
                  {isNetworkContentVolumeLoading ? (
                    <Loader2 className="animate-spin h-4 w-4 mt-1" />
                  ) : isNetworkContentVolumeError ? (
                    <p className="text-red-500 text-[11px] mt-1">
                      {t("common.errorLoadingData")}
                    </p>
                  ) : headline !== null ? (
                    <>
                      <div className="flex items-baseline gap-1.5">
                        <p className="text-xl font-bold leading-tight text-explorer-dark-gray dark:text-text">
                          {headline.toLocaleString(locale)}
                        </p>
                        {trend !== null && (
                          <TrendBadge value={trend} locale={locale} />
                        )}
                      </div>
                      {avg !== null && (
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
                          <Icon className="h-3 w-3 shrink-0" />
                          {avg.toLocaleString(locale)}{" "}
                          {t("networkContentVolumeCard.avgPerDay")}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-xs mt-1">
                      {t("common.noDataAvailable")}
                    </p>
                  )}
                </div>
              );
            }
          )}
        </div>

        <div className="bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col">
          <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {t("networkContentVolumeCard.last30Days")}
          </h3>
          {isNetworkContentVolumeLoading ? (
            <div className="flex items-center justify-center h-[215px]">
              <Loader2 className="animate-spin h-5 w-5" />
            </div>
          ) : (
            <div className="h-[215px] overflow-hidden">
              <NetworkContentVolumeChart
                data={chartData}
                tickCount={4}
                dateFormat="MMM D"
                compact
              />
            </div>
          )}
        </div>
      </div>

      <NetworkContentVolumeFullChartDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default NetworkContentVolumeCard;
