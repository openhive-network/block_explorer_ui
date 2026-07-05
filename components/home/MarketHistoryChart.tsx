import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
} from "recharts";
import Hive from "@/types/Hive";
import moment from "moment";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { colorMap } from "../balanceHistory/BalanceHistoryChart";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "../../i18n/i18n";
import {
  ChartBrushDefs,
  useChartBrushDefaults,
} from "@/components/ui/ChartBrush";
import { computeTrendPct } from "@/utils/chartUtils";

// Locale-aware price display. The chart data (`close`) stays a locale-neutral
// numeric string for plotting; only the rendered price goes through here.
const formatPrice = (
  value: number | string | null | undefined,
  locale: string
): string => {
  const n = typeof value === "string" ? parseFloat(value) : (value ?? NaN);
  return Number.isFinite(n)
    ? n.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })
    : "0";
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  const { t, locale } = useI18n();

  if (!active || !payload || !payload.length) return null;

  const { tooltipDate, close, volume } = payload[0].payload;

  return (
    <div className="rounded-md border border-gray-200 bg-white/95 px-2 py-1 text-explorer-dark-gray shadow-md backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95 dark:text-text">
      <div className="flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: colorMap.HIVE }}
        />
        <span className="text-sm font-bold tabular-nums">
          ${formatPrice(close, locale)}
        </span>
        <span className="text-[9px] font-medium text-gray-400">
          {moment(tooltipDate).format("MMM D, YYYY")}
        </span>
      </div>
      <div className="mt-0.5 pl-3 text-[10px] text-gray-400">
        {t("marketHistoryChart.volume")}:{" "}
        <span className="font-medium tabular-nums text-explorer-dark-gray dark:text-text">
          {volume.toLocaleString(locale)}
        </span>
      </div>
    </div>
  );
};

export const calculateCloseHivePrice = (
  hive: Hive.MarketData | undefined,
  nonHive: Hive.MarketData | undefined
) => {
  if (!hive || !nonHive) return;
  const hiveClose = hive.close;
  const nonHiveClose = nonHive.close;

  return (nonHiveClose / hiveClose).toFixed(4);
};

interface MarketChartProps {
  data: Hive.MarketHistory | undefined;
  isFullChart?: boolean;
}
interface ChartData {
  date: string;
  close: string | undefined;
  volume: number;
  tooltipDate: string;
}

const MarketHistoryChart: React.FC<MarketChartProps> = ({
  data,
  isFullChart = false,
}) => {
  const { hiveChain } = useHiveChainContext();
  const { theme } = useTheme();
  const brushDefaults = useChartBrushDefaults();

  // locale subscription ensures the component re-renders on language switch
  // so tickFormatter picks up the new locale immediately.
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";

  const [chartData, setChartData] = useState<ChartData[] | undefined>(
    undefined
  );
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(0);

  // locale is intentionally NOT in the deps: dates are stored as raw ISO strings
  // and formatted by tickFormatter at render time, so no rebuild is needed on
  // locale change (avoids Recharts recalculating tick intervals on every switch).
  useEffect(() => {
    if (!data || !hiveChain) return;

    const filterData = data.buckets.map((bucket) => {
      const { hive, non_hive } = bucket;
      const hiveClosePrice = calculateCloseHivePrice(hive, non_hive);

      return {
        date: bucket.open, // raw ISO — formatted by tickFormatter
        tooltipDate: bucket.open, // raw ISO — formatted inline in CustomTooltip
        close: hiveClosePrice,
        volume: bucket.hive.volume,
      };
    });

    const min = Math.min(...filterData.map((d) => parseFloat(d.close ?? "")));
    const max = Math.max(...filterData.map((d) => parseFloat(d.close ?? "")));

    setChartData(filterData);
    setMinValue(min);
    setMaxValue(max);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, hiveChain]);

  const lastHivePrice = chartData?.[chartData.length - 1].close;
  const strokeColor = theme === "dark" ? "#FFF" : "#000";
  const fillId = isFullChart ? "hivePriceFillFull" : "hivePriceFillMini";

  const priceTrend = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;
    const closes = chartData
      .map((d) => parseFloat(d.close ?? ""))
      .filter((v) => Number.isFinite(v));
    return computeTrendPct(closes);
  }, [chartData]);

  // Stable tick count: show ~6 ticks regardless of locale label widths.
  const tickInterval = chartData
    ? Math.max(1, Math.floor((chartData.length - 1) / 5))
    : "preserveStartEnd";

  return (
    <ResponsiveContainer width="100%" height={isFullChart ? 400 : 250}>
      <AreaChart
        data={chartData}
        layout="horizontal"
        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorMap.HIVE} stopOpacity={0.45} />
            <stop offset="100%" stopColor={colorMap.HIVE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={(d) => moment(d).format("MMM D")}
          interval={tickInterval}
          stroke={strokeColor}
          reversed={isRTL}
        />
        <YAxis
          dataKey="close"
          domain={[minValue, maxValue]}
          stroke={strokeColor}
          orientation={isRTL ? "right" : "left"}
          width={48}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatPrice(v, locale)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          height={30}
          align={isRTL ? "right" : "left"}
          content={() => (
            <div
              className="flex flex-wrap items-center gap-x-2 gap-y-0.5 px-2 text-xs"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <span className="inline-flex items-center gap-1.5 text-explorer-dark-gray dark:text-text">
                <span
                  className="inline-block h-[3px] w-4 rounded-full"
                  style={{ backgroundColor: colorMap.HIVE }}
                />
                {t("marketHistoryChart.hivePrice")}: $
                {formatPrice(lastHivePrice, locale)}
              </span>
              {priceTrend !== null && (
                <span
                  className="inline-flex items-center gap-0.5 font-semibold"
                  style={{ color: priceTrend >= 0 ? "#22c55e" : "#ef4444" }}
                >
                  {priceTrend >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {Math.abs(priceTrend).toLocaleString(locale, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                  %
                </span>
              )}
            </div>
          )}
          wrapperStyle={
            isRTL ? { right: 0, left: "auto" } : { left: 0, right: "auto" }
          }
        />
        <Area
          name={`${t("marketHistoryChart.hivePrice")}: $${formatPrice(
            lastHivePrice,
            locale
          )}`}
          type="monotone"
          dataKey="close"
          stroke={colorMap.HIVE}
          strokeWidth={2}
          fill={`url(#${fillId})`}
          fillOpacity={1}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive
          animationDuration={1200}
          animationEasing="ease-out"
        />
        {isFullChart && <ChartBrushDefs />}
        {isFullChart && (
          <Brush
            {...brushDefaults}
            dataKey="date"
            tickFormatter={(d) => moment(d).format("MMM D")}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MarketHistoryChart;
