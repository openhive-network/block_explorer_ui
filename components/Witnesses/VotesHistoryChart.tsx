import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Image from "next/image";
import { IHiveChainInterface } from "@hiveio/wax";

import { Card, CardHeader, CardTitle } from "../ui/card";
import { cn, formatNumber } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import useMediaQuery from "@/hooks/common/useMediaQuery";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { convertVestsToHP } from "@/utils/Calculations";
import { useTheme } from "@/contexts/ThemeContext";
import moment from "moment";

type VoteEvent = {
  voter_name: string;
  timestamp: string;
  approve: boolean;
  vests: string;
};

type DayRow = {
  date: string;
  tooltipDate: string;
  gainedVests: number; // VESTS (>= 0)
  lostNegVests: number; // VESTS (<= 0) negative for below-zero bars
  gainedListVests: { name: string; vests: number }[];
  lostListVests: { name: string; vests: number }[];
};

interface VotesHistoryWidgetProps {
  events?: VoteEvent[];
  className?: string;
  hiveChain: IHiveChainInterface;
  totalVestingFund: number | string;
  totalVestingShares: number | string;
  titleKey?: string;
  isHp?: boolean;
}

const toDay = (iso: string) => (iso ? iso.slice(0, 10) : "");
const toNum = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const vestsToHpSigned = (
  vests: any,
  hiveChain: IHiveChainInterface,
  totalVestingFund: any,
  totalVestingShares: any
): number => {
  if (!vests || !hiveChain || !totalVestingFund || !totalVestingShares)
    return 0;

  const hp = convertVestsToHP(
    hiveChain,
    vests,
    totalVestingFund,
    totalVestingShares
  );
  return hp;
};

function buildDailyVests(events: VoteEvent[] = []): DayRow[] {
  const map = new Map<string, DayRow>();
  for (const e of events) {
    const d = moment(e.timestamp).format("MMM D");
    const tooltipDate = moment(e.timestamp).format("YYYY MMM D");
    if (!d) continue;

    if (!map.has(d)) {
      map.set(d, {
        date: d,
        tooltipDate,
        gainedVests: 0,
        lostNegVests: 0,
        gainedListVests: [],
        lostListVests: [],
      });
    }
    const row = map.get(d)!;
    const v = toNum(e.vests);

    if (e.approve) {
      row.gainedVests += v;
      row.gainedListVests.push({ name: e.voter_name, vests: v });
    } else {
      row.lostNegVests -= v; // keep negative for below-zero
      row.lostListVests.push({ name: e.voter_name, vests: v });
    }
  }
  return Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}

const VotesTooltip = ({
  active,
  payload,
  hiveChain,
  totalVestingFund,
  totalVestingShares,
  isHp,
}: {
  active?: boolean;
  payload?: any[];
  hiveChain: IHiveChainInterface;
  totalVestingFund: number | string;
  totalVestingShares: number | string;
  isHp: boolean;
}) => {
  const { t } = useI18n();
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as DayRow | undefined;
  if (!d) return null;

  const gainedVal = isHp
    ? vestsToHpSigned(
        d.gainedVests,
        hiveChain,
        totalVestingFund,
        totalVestingShares
      )
    : d.gainedVests;
  const lostVal = isHp
    ? vestsToHpSigned(
        Math.abs(d.lostNegVests),
        hiveChain,
        totalVestingFund,
        totalVestingShares
      )
    : Math.abs(d.lostNegVests);

  const unit = isHp ? "HP" : "VESTS";

  const formatValues = (value: string | number, unit: "HP" | "VESTS") => {
    if (unit === "HP") return value;
    return `${formatNumber(value, unit === "VESTS")} ${unit}`;
  };

  return (
    <div className="data-box">
      <p className="font-bold text-xl">{d.tooltipDate}</p>

      {!!d.gainedListVests.length && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {t("votersChart.gained")}: +{formatValues(gainedVal, unit)}
            <span className="px-2 !text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {`(+${d.gainedListVests.length} ${t("votersChart.votes")})`}
            </span>
          </div>
          <div className="mt-2 space-y-2">
            {d.gainedListVests.map((g) => {
              const val = isHp
                ? vestsToHpSigned(
                    g.vests,
                    hiveChain,
                    totalVestingFund,
                    totalVestingShares
                  )
                : g.vests;
              return (
                <div
                  key={`g-${g.name}`}
                  className="flex items-center"
                >
                  <Image
                    className="rounded-full"
                    src={getHiveAvatarUrl(g.name)}
                    alt="avatar"
                    width={24}
                    height={24}
                  />
                  <span className="ml-2 text-sm">{g.name} </span>
                  <span className="ml-2 text-sm tabular-nums">
                    +{formatValues(val, unit)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!!d.lostListVests.length && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            {t("votersChart.lost")}: -{formatValues(lostVal, unit)}
            <span className="px-2 !text-xs font-semibold text-rose-600 dark:text-rose-400">
              {`(-${d.lostListVests.length} ${t("votersChart.votes")})`}
            </span>
          </div>
          <div className="mt-2 space-y-2">
            {d.lostListVests.map((l) => {
              const val = isHp
                ? vestsToHpSigned(
                    l.vests,
                    hiveChain,
                    totalVestingFund,
                    totalVestingShares
                  )
                : l.vests;
              return (
                <div
                  key={`l-${l.name}`}
                  className="flex items-center"
                >
                  <Image
                    className="rounded-full"
                    src={getHiveAvatarUrl(l.name)}
                    alt="avatar"
                    width={24}
                    height={24}
                  />
                  <span className="ml-2 text-sm">{l.name}</span>
                  <span className="ml-2 text-sm tabular-nums">
                    -{formatValues(val, unit)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const VotesHistoryWidget: React.FC<VotesHistoryWidgetProps> = ({
  events = [],
  className = "",
  hiveChain,
  totalVestingFund,
  totalVestingShares,
  titleKey = "votersChart.title",
  isHp = true,
}) => {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { theme } = useTheme();
  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  const [data, setData] = useState<DayRow[]>([]);
  useEffect(() => {
    setData(buildDailyVests(events ?? []));
  }, [events]);

  useEffect(() => {
    const id = setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
    return () => clearTimeout(id);
  }, []);

  const [minVests, maxVests] = useMemo(() => {
    let min = 0,
      max = 0;
    for (const r of data) {
      if (Number.isFinite(r.lostNegVests) && r.lostNegVests < min)
        min = r.lostNegVests;
      if (Number.isFinite(r.gainedVests) && r.gainedVests > max)
        max = r.gainedVests;
    }
    const pad = Math.max(Math.abs(min), Math.abs(max)) * 0.05;
    let lo = Math.floor(min - pad);
    let hi = Math.ceil(max + pad);
    if (lo === hi) {
      lo -= 1;
      hi += 1;
    }
    return [lo, hi];
  }, [data]);

  const yTickFormatter = (vests: number) => {
    const label = isHp
      ? String(
          vestsToHpSigned(
            vests,
            hiveChain,
            totalVestingFund,
            totalVestingShares
          )
        )
      : `${formatNumber(vests, true)} VESTS`;
    return label;
  };

  return (
    <Card
      className={cn("w-full h-[420px] pb-10", className)}
      data-testid="votes-history-widget"
    >
      <CardHeader>
        <CardTitle>{t(titleKey)}</CardTitle>
      </CardHeader>

      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          stackOffset="sign"
          margin={{
            top: 20,
            right: isRTL ? (isMobile ? 0 : 10) : 55,
            left: isRTL ? 55 : isMobile ? 40 : 55,
            bottom: isMobile ? 80 : 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            stroke={strokeColor}
            axisLine={false}
            reversed={isRTL}
            dy={20}
          />

          <YAxis
            stroke={strokeColor}
            axisLine={false}
            orientation={isRTL ? "right" : "left"}
            tickFormatter={yTickFormatter}
            domain={[Math.min(0, minVests), Math.max(0, maxVests)]}
            allowDataOverflow
            type="number"
            interval="preserveStartEnd"
          />

          <ReferenceLine
            y={0}
            stroke="#94a3b8"
            strokeDasharray="3 3"
          />

          <Tooltip
            wrapperStyle={{ zIndex: 99999 }}
            cursor={{ fill: "#0000002A" }}
            content={
              <VotesTooltip
                hiveChain={hiveChain}
                totalVestingFund={totalVestingFund}
                totalVestingShares={totalVestingShares}
                isHp={isHp}
              />
            }
          />
          <Legend
            formatter={(value) => `${value} (${isHp ? "HP" : "VESTS"})`}
            wrapperStyle={{
              position: "relative",
              marginLeft: isRTL ? 0 : "35px",
              marginRight: isRTL ? "70px" : "0",
            }}
            align="center"
          />

          <Bar
            dataKey="gainedVests"
            stackId="net"
            name={t("votersChart.gained")}
            fill="#10b981"
            className="cursor-pointer"
          />
          <Bar
            dataKey="lostNegVests"
            stackId="net"
            name={t("votersChart.lost")}
            fill="#ef4444"
            className="cursor-pointer"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default VotesHistoryWidget;
