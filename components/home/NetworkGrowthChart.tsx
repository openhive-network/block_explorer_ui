import { useTheme } from "@/contexts/ThemeContext";
import Hive from "@/types/Hive";
import moment from "moment";
import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Brush,
  Legend,
} from "recharts";
import { useI18n } from "../../i18n/i18n";
import {
  ChartBrushDefs,
  useChartBrushDefaults,
} from "@/components/ui/ChartBrush";

interface NetworkGrowthChartProps {
  data: Hive.WalletStatsResponse[] | undefined;
  includeBrush?: boolean;
  tickCount?: number;
  showYear?: boolean;
  dateFormat?: string;
  compact?: boolean;
}

const GROWTH_COLOR = "#22c55e";

const NetworkGrowthChart: React.FC<NetworkGrowthChartProps> = ({
  data,
  includeBrush = false,
  tickCount,
  showYear = false,
  dateFormat,
  compact = false,
}) => {
  const { theme } = useTheme();
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";
  const brushDefaults = useChartBrushDefaults();

  const strokeColor = theme === "dark" ? "#FFF" : "#000";
  const [zoomedDomain, setZoomedDomain] = useState<[number, number] | null>(
    null
  );

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    const seenDates = new Set<string>();
    const uniqueData: Hive.WalletStatsResponse[] = [];
    for (const item of data) {
      const dateStr = moment(item.date).format("YYYY-MM-DD");
      if (!seenDates.has(dateStr)) {
        seenDates.add(dateStr);
        uniqueData.push(item);
      }
    }
    return uniqueData;
  }, [data]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
      const { date, new_wallets, total_wallets } = payload[0].payload;

      return (
        <div className="bg-theme rounded shadow-sm py-1 px-2 text-[0.6rem]">
          <p className="text-gray-400 mb-0.5 text-center">
            {showYear
              ? moment(date).format("YYYY")
              : dateFormat
                ? moment(date).format(dateFormat)
                : moment(date).format("MMM D, YYYY")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
                {t("networkGrowthCard.totalAccounts")}
              </p>
              <p className="font-semibold leading-none">
                {total_wallets?.toLocaleString(locale)}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
                {t("networkGrowthCard.newAccounts")}
              </p>
              <p className="font-semibold leading-none">
                +{(new_wallets ?? 0).toLocaleString(locale)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const formatYAxis = (tickValue: number) => {
    if (tickValue >= 1_000_000) {
      return `${(tickValue / 1_000_000).toLocaleString(locale, {
        maximumFractionDigits: 2,
      })}M`;
    }
    if (tickValue >= 1_000) {
      return `${(tickValue / 1_000).toLocaleString(locale, {
        maximumFractionDigits: 0,
      })}K`;
    }
    return tickValue.toLocaleString(locale);
  };

  const calculateYAxisDomain = (): [number, number] => {
    if (!chartData || chartData.length === 0) {
      return [0, 1];
    }
    const totals = chartData.map((item) => item.total_wallets);
    return [Math.min(...totals), Math.max(...totals)];
  };

  const [lowerBound, upperBound] = calculateYAxisDomain();

  const handleBrushAreaChange = (domain: {
    startIndex?: number;
    endIndex?: number;
  }) => {
    if (
      !domain ||
      domain.startIndex === undefined ||
      domain.endIndex === undefined
    ) {
      setZoomedDomain(null);
      return;
    }

    const visibleData = chartData.slice(domain.startIndex, domain.endIndex + 1);

    if (visibleData.length > 0) {
      const totals = visibleData.map((item) => item.total_wallets);
      setZoomedDomain([Math.min(...totals), Math.max(...totals)]);
    }
  };

  const yAxisDomain = zoomedDomain || [lowerBound, upperBound];

  const xAxisTickFormatter = (value: any) => {
    return moment(value).format(
      showYear ? "YYYY" : dateFormat ? dateFormat : "MMM D, YYYY"
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{
          top: compact ? 8 : 20,
          right: isRTL ? 10 : 30,
          left: isRTL ? 30 : 10,
          bottom: includeBrush ? 40 : 0,
        }}
      >
        <defs>
          <linearGradient
            id="networkGrowthGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor={GROWTH_COLOR} stopOpacity={0.5} />
            <stop offset="95%" stopColor={GROWTH_COLOR} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickCount={tickCount}
          tickFormatter={xAxisTickFormatter}
          style={{ fontSize: "10px" }}
          stroke={strokeColor}
          reversed={isRTL}
        />
        <YAxis
          dataKey="total_wallets"
          tickCount={tickCount}
          style={{ fontSize: "13px" }}
          stroke={strokeColor}
          tickFormatter={formatYAxis}
          domain={yAxisDomain}
          orientation={isRTL ? "right" : "left"}
          allowDecimals={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        {!compact && (
          <Legend
            verticalAlign="bottom"
            height={36}
            align="center"
            wrapperStyle={{ paddingTop: 8 }}
          />
        )}
        <Area
          name={t("networkGrowthCard.totalAccounts")}
          type="monotone"
          dataKey="total_wallets"
          stroke={GROWTH_COLOR}
          strokeWidth={2}
          fill="url(#networkGrowthGradient)"
          dot={false}
        />
        {includeBrush && <ChartBrushDefs />}
        {includeBrush && (
          <Brush
            {...brushDefaults}
            dataKey="date"
            tickFormatter={xAxisTickFormatter}
            onChange={handleBrushAreaChange}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default NetworkGrowthChart;
