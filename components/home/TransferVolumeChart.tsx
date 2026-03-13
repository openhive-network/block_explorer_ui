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

interface TransferVolumeChartProps {
  data: Hive.TransferStatisticsResponse[] | undefined;
  includeBrush?: boolean;
  tickCount?: number;
  showYear?: boolean;
  dateFormat?: string;
}

const TransferVolumeChart: React.FC<TransferVolumeChartProps> = ({
  data,
  includeBrush = false,
  tickCount,
  showYear = false,
  dateFormat,
}) => {
  const { theme } = useTheme();
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";

  const strokeColor = theme === "dark" ? "#FFF" : "#000";
  const [zoomedDomain, setZoomedDomain] = useState<[number, number] | null>(
    null
  );

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    return data.map((item) => ({
      date: item.date,
      total_transfer_amount: parseFloat(item.total_transfer_amount), // Parse to number
      transfer_count: item.transfer_count,
      average_transfer_amount: parseFloat(item.average_transfer_amount),
      maximum_transfer_amount: parseFloat(item.maximum_transfer_amount),
      minimum_transfer_amount: parseFloat(item.minimum_transfer_amount),
    }));
  }, [data]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
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
            {showYear
              ? moment(date).format(" YYYY")
              : dateFormat
              ? moment(date).format(dateFormat)
              : moment(date).format("MMM D, YYYY")}
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div>
              <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
                {t("transferVolumeChart.totalTransferAmount")}
              </p>
              <p className="font-semibold leading-none text-right">
                {total_transfer_amount?.toLocaleString(locale)}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
                {t("transferVolumeChart.transferCount")}
              </p>
              <p className="font-semibold leading-none text-right">
                {transfer_count?.toLocaleString(locale)}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
                {t("transferVolumeChart.averageTransferAmount")}
              </p>
              <p className="font-semibold leading-none text-right">
                {average_transfer_amount?.toLocaleString(locale, {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
                {t("transferVolumeChart.maxTransferAmount")}
              </p>
              <p className="font-semibold leading-none text-right">
                {maximum_transfer_amount?.toLocaleString(locale, {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
                {t("transferVolumeChart.minTransferAmount")}
              </p>
              <p className="font-semibold leading-none text-right">
                {minimum_transfer_amount?.toLocaleString(locale, {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (tickValue: number) => {
    if (tickValue >= 1000000) {
      return (
        (tickValue / 1000000).toLocaleString(locale, {
          maximumFractionDigits: 0,
        }) + "M"
      );
    }
    if (tickValue >= 1000) {
      return (
        (tickValue / 1000).toLocaleString(locale, {
          maximumFractionDigits: 0,
        }) + "k"
      );
    }
    return tickValue.toLocaleString(locale, { maximumFractionDigits: 0 });
  };

  const calculateYAxisDomain = () => {
    if (!chartData || chartData.length === 0) {
      return [0, 1];
    }

    const amounts = chartData.map((item) => item.total_transfer_amount);
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    return [minAmount, maxAmount];
  };

  const [lowerBound, upperBound] = calculateYAxisDomain();
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
          top: 5,
          right: isRTL ? 10 : 0,
          left: isRTL ? 0 : 10,
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
          tickCount={tickCount}
          style={{ fontSize: "13px" }}
          stroke={strokeColor}
          tickFormatter={formatYAxis}
          orientation={isRTL ? "right" : "left"}
          domain={yAxisDomain}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          align={isRTL ? "right" : "left"}
        />
        <Line
          name={t("transferVolumeChart.totalTransferAmount")}
          type="monotone"
          dataKey="total_transfer_amount"
          stroke="#D82B30"
          dot={false}
        />
        {includeBrush && (
          <Brush
            dataKey="date"
            tickFormatter={xAxisTickFormatter}
            height={30}
            stroke="var(--color-switch-off)"
            fill="var(--color-background)"
            travellerWidth={10}
            className="text-xs"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TransferVolumeChart;
