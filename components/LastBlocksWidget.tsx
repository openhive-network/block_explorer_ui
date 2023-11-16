import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Hive from "@/types/Hive";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/utils/Hooks";
import { useRouter } from "next/router";

interface LastBlocksWidgetProps {
  className?: string;
}

type ChartBlockData = {
  name: string;
  witness: string;
  comment: number;
  vote: number;
  custom: number;
  transfer: number;
  other: number;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const totalOperations = payload.reduce((acc, pld) => acc + pld.value, 0);
    return (
      <div className="bg-explorer-dark-gray p-2 rounded-[6px] border border-explorer-ligh-gray">
        <p className="font-bold">{`Block ${label}`}</p>
        <div className="my-2">
          <Image
            className="rounded-full inline"
            src={getHiveAvatarUrl(payload[0].payload.witness)}
            alt="avatar"
            width={40}
            height={40}
          />
          <p className="inline ml-4">{payload[0].payload.witness}</p>
        </div>
        <div>operations: {totalOperations}</div>
        <div>
          {payload.map((pld, index) => (
            <div key={index} style={{ color: pld.fill }}>
              <div>
                {pld.dataKey} {pld.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const getOpsCount = (lastBlocks: Hive.LastBlocksTypeResponse[]) => {
  const opsCount: ChartBlockData[] = lastBlocks.map((block) => ({
    name: block.block_num.toString(),
    witness: block.witness,
    other: 0,
    comment: 0,
    custom: 0,
    vote: 0,
    transfer: 0,
  }));

  lastBlocks.forEach((block, index) => {
    let other = 0;
    block.ops_count.forEach((op) => {
      switch (op.op_type_id) {
        case 0:
          opsCount[index].vote = op.count;
          break;
        case 1:
          opsCount[index].comment = op.count;
          break;
        case 2:
          opsCount[index].transfer = op.count;
          break;
        case 18:
          opsCount[index].custom = op.count;
          break;

        default:
          other += op.count;
          break;
      }
    });
    opsCount[index].other = other;
  });
  return opsCount;
};

const LastBlocksWidget: React.FC<LastBlocksWidgetProps> = ({
  className = "",
}) => {
  const [data, setData] = useState<ChartBlockData[]>([]);
  const router = useRouter();

  const lastBlocks = useQuery({
    queryKey: ["lastBlocks"],
    queryFn: () => fetchingService.getLastBlocks(20),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setData(getOpsCount(lastBlocks.data || []).reverse());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(lastBlocks)]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const CustomBarLabel = useCallback(
    (props: any) => {
      const { viewBox, x, y, name } = props;
      const witness = lastBlocks?.data?.find(
        (block) => block.block_num.toString() === name
      )?.witness;
      const size = isMobile ? 16 : 40;
      return (
        <g
          id={`x=${x}, y=${y}`}
          onClick={() => router.push(`/account/${witness}`)}
          className="cursor-pointer"
        >
          <defs>
            <clipPath id={`avatarCircle-${x}-${y}`}>
              <circle
                cx={x + viewBox.width / 2}
                cy={y - size / 2}
                r={isMobile ? 6 : 16}
                fill="#ffffff"
              />
            </clipPath>
          </defs>
          <image
            x={x + viewBox.width / 2 - size / 2}
            y={y - size}
            dy={-6}
            width={size}
            height={size}
            href={getHiveAvatarUrl(witness)}
            clipPath={`url(#avatarCircle-${x}-${y})`}
          />
        </g>
      );
    },
    [lastBlocks?.data, isMobile, router]
  );

  return (
    <div
      className={cn(
        "w-[95%] m-auto md:w-full h-[420px] bg-explorer-dark-gray rounded-[6px] text-white",
        className
      )}
    >
      <p className="w-full text-center pt-2">Last Blocks</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: isMobile ? 10 : 20,
            bottom: isMobile ? 90 : 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#fff" axisLine={false}>
          <Label position='bottom' style={{ textAnchor: 'middle' }}>
              Block
          </Label>
          </XAxis>
          <YAxis
            stroke="#fff"
            axisLine={false}
            domain={[0, (dataMax: number) => Math.floor(dataMax * 1.2)]}
            allowDataOverflow={true}
          >
            <Label angle={270} position='insideLeft' style={{ textAnchor: 'middle' }}>
                Operations
            </Label>
          </YAxis>
          <Tooltip cursor={{ fill: "#0000002A" }} content={<CustomTooltip />} />
          <Legend wrapperStyle={{ position: "relative" }} align="center" />
          <Bar
            dataKey="other"
            stackId="a"
            fill="#3a86ff"
            className="cursor-pointer"
            onClick={(data, _index) => router.push(`/block/${data.name}`)}
          />
          <Bar
            dataKey="comment"
            stackId="a"
            fill="#ffbe0b"
            className="cursor-pointer"
            onClick={(data, _index) => router.push(`/block/${data.name}`)}
          />
          <Bar
            dataKey="custom"
            stackId="a"
            fill="#ff006e"
            className="cursor-pointer"
            onClick={(data, _index) => router.push(`/block/${data.name}`)}
          />
          <Bar
            dataKey="vote"
            stackId="a"
            fill="#fb5607"
            className="cursor-pointer"
            onClick={(data, _index) => router.push(`/block/${data.name}`)}
          />
          <Bar
            dataKey="transfer"
            stackId="a"
            fill="#8338ec"
            label={<CustomBarLabel />}
            className="cursor-pointer"
            onClick={(data, _index) => router.push(`/block/${data.name}`)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LastBlocksWidget;
