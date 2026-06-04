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
  ReferenceLine,
} from "recharts";
import { useI18n } from "../../i18n/i18n";
import {
  ChartBrushDefs,
  useChartBrushDefaults,
} from "@/components/ui/ChartBrush";

const naiToDecimal = (a: Hive.Amount) =>
  parseFloat(a.amount) / Math.pow(10, a.precision);

interface TransferVolumeChartProps {
  data: Hive.TransferStatisticsResponse[] | undefined;
  coinType?: "HIVE" | "HBD";
  includeBrush?: boolean;
  tickCount?: number;
  showYear?: boolean;
  dateFormat?: string;
  peakDate?: number;
  granularity?: "hourly" | "daily" | "monthly" | "yearly";
}

const COIN_COLORS: Record<string, string> = {
  HIVE: "#D82B30",
  HBD: "#3B82F6",
};

const TransferVolumeChart: React.FC<TransferVolumeChartProps> = ({
  data,
  coinType = "HIVE",
  includeBrush = false,
  tickCount,
  showYear = false,
  dateFormat,
  peakDate,
  granularity,
}) => {
  const { theme } = useTheme();
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";
  const brushDefaults = useChartBrushDefaults();

  const strokeColor = theme === "dark" ? "#FFF" : "#000";
  const [zoomedDomain, setZoomedDomain] = useState<[number, number] | null>(
    null
  );

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const seenDates = new Set<string>();
    const uniqueData: {
      date: number;
      total_transfer_amount: number;
      transfer_count: number;
      average_transfer_amount: number;
      maximum_transfer_amount: number;
      minimum_transfer_amount: number;
    }[] = [];

    for (const item of data) {
      const dateStr = moment(item.date).format("YYYY-MM-DD HH");
      if (!seenDates.has(dateStr)) {
        seenDates.add(dateStr);
        uniqueData.push({
          date: moment(item.date).valueOf(),
          total_transfer_amount: naiToDecimal(item.total_transfer_amount),
          transfer_count: item.transfer_count,
          average_transfer_amount: naiToDecimal(item.average_transfer_amount),
          maximum_transfer_amount: naiToDecimal(item.maximum_transfer_amount),
          minimum_transfer_amount: naiToDecimal(item.minimum_transfer_amount),
        });
      }
    }

    return uniqueData;
  }, [data]);

  const formatVolume = (v: number) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
    return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const calculateYAxisDomain = (): [number, number] => {
    if (!chartData.length) return [0, 1];
    const amounts = chartData.map((d) => d.total_transfer_amount);
    return [
      amounts.reduce((m, v) => (v < m ? v : m), Infinity),
      amounts.reduce((m, v) => (v > m ? v : m), -Infinity),
    ];
  };

  const [lowerBound, upperBound] = calculateYAxisDomain();
  const yAxisDomain =
    zoomedDomain ?? ([lowerBound, upperBound] as [number, number]);

  const axisFormat =
    granularity === "hourly"
      ? "MMM D HH:mm"
      : granularity === "yearly" || showYear
        ? "YYYY"
        : granularity === "monthly"
          ? "MMM YYYY"
          : (dateFormat ?? "MMM D");

  const tooltipFormat =
    granularity === "hourly"
      ? "MMM D, YYYY HH:mm"
      : granularity === "yearly" || showYear
        ? "YYYY"
        : granularity === "monthly"
          ? "MMM YYYY"
          : (dateFormat ?? "MMM D, YYYY");

  const xAxisTickFormatter = (value: number) =>
    moment(value).format(axisFormat);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (!active || !payload?.length) return null;
    const {
      date,
      total_transfer_amount,
      transfer_count,
      average_transfer_amount,
      maximum_transfer_amount,
      minimum_transfer_amount,
    } = payload[0].payload;

    return (
      <div className="bg-theme rounded shadow-sm py-1 px-2 text-[0.6rem]">
        <p className="text-gray-400 mb-0.5 text-center">
          {moment(date).format(tooltipFormat)}
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div>
            <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
              {t("transferVolumeChart.totalTransferAmount")}
            </p>
            <p className="font-semibold leading-none text-right">
              {total_transfer_amount?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
              {t("transferVolumeChart.transferCount")}
            </p>
            <p className="font-semibold leading-none text-right">
              {transfer_count?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
              {t("transferVolumeChart.averageTransferAmount")}
            </p>
            <p className="font-semibold leading-none text-right">
              {average_transfer_amount?.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
              {t("transferVolumeChart.maxTransferAmount")}
            </p>
            <p className="font-semibold leading-none text-right">
              {maximum_transfer_amount?.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
              {t("transferVolumeChart.minTransferAmount")}
            </p>
            <p className="font-semibold leading-none text-right">
              {minimum_transfer_amount?.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const VOLUME_COLOR = COIN_COLORS[coinType] ?? "#D82B30";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{
          top: 5,
          right: isRTL ? 10 : 0,
          left: isRTL ? 0 : 10,
          bottom: includeBrush ? 40 : 0,
        }}
      >
        <defs>
          <linearGradient
            id="transferVolumeGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor={VOLUME_COLOR} stopOpacity={0.5} />
            <stop offset="95%" stopColor={VOLUME_COLOR} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickCount={tickCount}
          tickFormatter={xAxisTickFormatter}
          style={{ fontSize: "10px" }}
          stroke={strokeColor}
          reversed={isRTL}
        />
        <YAxis
          tickCount={tickCount}
          style={{ fontSize: "11px" }}
          stroke={strokeColor}
          tickFormatter={formatVolume}
          orientation={isRTL ? "right" : "left"}
          domain={yAxisDomain}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={36} align="center" />

        {peakDate !== undefined && (
          <ReferenceLine
            x={peakDate}
            stroke="#a78bfa"
            strokeDasharray="3 3"
            label={{
              value: t("transferVolumeChart.peak"),
              position: isRTL ? "insideTopLeft" : "insideTopRight",
              fontSize: 9,
              fill: "#a78bfa",
            }}
          />
        )}

        <Area
          name={t("transferVolumeChart.totalTransferAmount")}
          type="monotone"
          dataKey="total_transfer_amount"
          stroke={VOLUME_COLOR}
          strokeWidth={2}
          fill="url(#transferVolumeGradient)"
          dot={false}
        />

        {includeBrush && <ChartBrushDefs />}
        {includeBrush && (
          <Brush
            {...brushDefaults}
            dataKey="date"
            tickFormatter={xAxisTickFormatter}
            onChange={(range) => {
              if (
                range.startIndex === undefined ||
                range.endIndex === undefined
              )
                return;
              const visible = chartData.slice(
                range.startIndex,
                range.endIndex + 1
              );
              if (visible.length > 0) {
                const amounts = visible.map((d) => d.total_transfer_amount);
                setZoomedDomain([
                  amounts.reduce((m, v) => (v < m ? v : m), Infinity),
                  amounts.reduce((m, v) => (v > m ? v : m), -Infinity),
                ]);
              }
            }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TransferVolumeChart;
