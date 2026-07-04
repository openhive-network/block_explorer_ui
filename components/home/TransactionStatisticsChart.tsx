import { useTheme } from "@/contexts/ThemeContext";
import Hive from "@/types/Hive";
import moment from "moment";
import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
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

interface TransactionStatisticsChartProps {
  data: Hive.TransactionStatisticsResponse[] | undefined;
  includeBrush?: boolean;
  tickCount?: number;
  showYear?: boolean;
  dateFormat?: string;
  showLegend?: boolean;
}

const TransactionStatisticsChart: React.FC<TransactionStatisticsChartProps> = ({
  data,
  includeBrush = false,
  tickCount,
  showYear = false,
  dateFormat,
  showLegend = true,
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
    const seenDates = new Set();
    const uniqueData = [];
    for (const item of data) {
      const dateStr = moment(item.date).format("YYYY-MM-DD");
      if (!seenDates.has(dateStr)) {
        seenDates.add(dateStr);
        uniqueData.push({
          date: item.date,
          trx_count: item.trx_count,
          avg_trx: item.avg_trx,
          min_trx: item.min_trx,
          max_trx: item.max_trx,
        });
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
    const { t } = useI18n();

    if (active && payload && payload.length) {
      const { date, trx_count, avg_trx, min_trx, max_trx } = payload[0].payload;

      return (
        <div className="bg-theme rounded shadow-sm py-1 px-2 text-[0.6rem]">
          <p className="text-gray-400 mb-0.5 text-center">
            {showYear
              ? moment(date).format(" YYYY")
              : dateFormat
                ? moment(date).format(dateFormat)
                : moment(date).format("MMM D, YYYY")}
          </p>
          <div className="grid grid-cols-2 gap-1">
            <div>
              <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
                {t("common.transactions")}
              </p>
              <p className="font-semibold leading-none">
                {trx_count.toLocaleString(locale)}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] text-gray-500 uppercase leading-none">
                {t("transactionStatisticsChart.avgTrxs")}
              </p>
              <p className="font-semibold leading-none">{avg_trx}</p>
            </div>
            <div>
              <p className="text-[0.6rem] text-gray-500 uppercase leading-none">
                {t("transactionStatisticsChart.minTrxs")}
              </p>
              <p className="font-semibold leading-none">{min_trx}</p>
            </div>
            <div>
              <p className="text-[0.6rem] text-gray-500 uppercase leading-none">
                {t("transactionStatisticsChart.maxTrxs")}
              </p>
              <p className="font-semibold leading-none">{max_trx}</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const formatYAxis = (tickValue: number) => {
    return tickValue.toLocaleString(locale);
  };

  const calculateYAxisDomain = () => {
    if (!chartData || chartData.length === 0) {
      return [0, 1];
    }

    const trxCounts = chartData.map((item) => item.trx_count);
    const minTrx = Math.min(...trxCounts);
    const maxTrx = Math.max(...trxCounts);
    return [minTrx, maxTrx];
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

    const { startIndex, endIndex } = domain;
    const visibleData = chartData.slice(startIndex, endIndex + 1);

    if (visibleData.length > 0) {
      const trxCounts = visibleData.map((item) => item.trx_count);
      const minTrx = Math.min(...trxCounts);
      const maxTrx = Math.max(...trxCounts);
      setZoomedDomain([minTrx, maxTrx]);
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
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: isRTL ? 10 : 30,
          left: isRTL ? 30 : 10,
          bottom: includeBrush ? 40 : 0,
        }}
      >
        <XAxis
          dataKey="date"
          tickCount={tickCount}
          tickFormatter={xAxisTickFormatter}
          style={{ fontSize: "10px" }}
          stroke={strokeColor}
          reversed={isRTL}
        />
        <YAxis
          dataKey="trx_count"
          tickCount={tickCount}
          style={{ fontSize: "11px" }}
          stroke={strokeColor}
          tickFormatter={formatYAxis}
          domain={yAxisDomain}
          orientation={isRTL ? "right" : "left"}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            align="center"
            wrapperStyle={{ paddingTop: 8 }}
          />
        )}
        <Line
          name={t("common.transactions")}
          type="monotone"
          dataKey="trx_count"
          stroke="#8884d8"
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
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TransactionStatisticsChart;
