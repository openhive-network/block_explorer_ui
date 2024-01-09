import React, { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
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
import useLastBlocks from "@/api/homePage/useLastBlocks";

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
  virtual: number;
}

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
      <div className="bg-explorer-dark-gray p-2 rounded border border-explorer-ligh-gray">
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
    virtual: 0,
    other: 0,
    comment: 0,
    custom: 0,
    vote: 0,
    transfer: 0,
  }));

  lastBlocks.forEach((block, index) => {
    let other = 0;
    let virtual = 0;
    block.ops_count.forEach((op) => {
      const typeId = op.op_type_id;
      if (typeId === 0) {
        opsCount[index].vote = op.count;
      } else if (typeId === 1) {
        opsCount[index].comment = op.count;
      } else if (typeId === 2) {
        opsCount[index].transfer = op.count;
      } else if (typeId === 18) {
        opsCount[index].custom = op.count;
      } else if (typeId >= 50) {
        virtual += op.count;
      } else {
        other += op.count;
      }
    });
    opsCount[index].other = other;
    opsCount[index].virtual = virtual;
  });
  return opsCount;
};

const LastBlocksWidget: React.FC<LastBlocksWidgetProps> = ({
  className = "",
}) => {
  const [data, setData] = useState<ChartBlockData[]>([]);
  const router = useRouter();

  const lastBlocks = useLastBlocks();



  useEffect(() => {
    setData(getOpsCount(lastBlocks.lastBlocksData || []).reverse());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(lastBlocks)]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const CustomBarLabel = useCallback(
    (props: any) => {
      const { viewBox, x, y, name } = props;
      const witness = lastBlocks.lastBlocksData?.find(
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
    [lastBlocks.lastBlocksData, isMobile, router]
  );

  return (
    <div
      className={cn(
        "w-[95%] m-auto md:w-full h-[420px] bg-explorer-dark-gray rounded text-white",
        className
      )}
    >
      <p className="w-full text-center pt-2">Last Blocks</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 55,
            left: isMobile ? 0 : 10,
            bottom: isMobile ? 90 : 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#fff" axisLine={false}>
          </XAxis>
          <YAxis
            stroke="#fff"
            axisLine={false}
            domain={[0, (dataMax: number) => Math.floor(dataMax * 1.2)]}
            allowDataOverflow={true}
          >
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
            dataKey="virtual"
            stackId="a"
            fill="#b010bf"
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
